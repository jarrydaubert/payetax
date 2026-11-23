import { act, render, renderHook, screen } from '@testing-library/react';
import { StrategyComparisonTable } from '@/components/molecules/DirectorGuide/calculator/StrategyComparisonTable';
import { TaxPots } from '@/components/molecules/DirectorGuide/calculator/TaxPots';
import { useActiveDirectorScenario } from '@/components/molecules/DirectorGuide/calculator/useActiveDirectorScenario';
import { EducationPanel } from '@/components/molecules/DirectorGuide/dashboard/EducationPanel';
import { RecommendationHero } from '@/components/molecules/DirectorGuide/dashboard/RecommendationHero';
import { SummaryCards } from '@/components/molecules/DirectorGuide/dashboard/SummaryCards';
import { useDirectorEmailUnavailableReason } from '@/components/molecules/DirectorGuide/useDirectorEmailUnavailableReason';
import { hasCurrentDirectorResults, useDirectorGuideStore } from '@/store/directorGuideStore';

jest.mock('@/lib/tax', () => ({
  ...jest.requireActual('@/lib/tax'),
  resolveTaxYear: () => '2026-2027',
}));

describe('submitted Director strategies (JGF-148)', () => {
  beforeEach(() => {
    const store = useDirectorGuideStore.getState();
    store.reset();
    store.setRegion('rUK');
    store.setRevenue(100000);
    store.setExpenses(20000);
  });

  it('publishes the exact All Salary result past the old slider cap', () => {
    const store = useDirectorGuideStore.getState();
    store.setSelectedStrategy('allSalary');
    store.setSliderSalary(50270);
    store.calculate('allSalary');

    const { result } = renderHook(() => useActiveDirectorScenario(true));
    expect(result.current.activeScenario).toMatchObject({
      salary: 70217.39,
      dividends: 0,
      employerNI: 9782.61,
    });

    render(
      <>
        <RecommendationHero />
        <SummaryCards />
        <TaxPots />
        <StrategyComparisonTable readOnly />
        <EducationPanel />
      </>,
    );
    expect(screen.getByText('Take it all as salary')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Displayed pay strategy' })).toHaveTextContent(
      '£70,217 salary + £0 dividends',
    );
    expect(screen.getByRole('region', { name: 'Financial summary' })).toHaveTextContent('£70,217');
    expect(screen.getByText('£815/mo')).toBeInTheDocument();
    expect(screen.getByText('All Salary').closest('article')).toHaveTextContent('Displayed Result');
    expect(screen.queryByText('What Are Dividends?')).not.toBeInTheDocument();

    act(() => useDirectorGuideStore.getState().setSliderSalary(50270));
    act(() => useDirectorGuideStore.getState().setSelectedStrategy('allDividends'));
    expect(useDirectorGuideStore.getState().sliderSalary).toBe(50270);
    expect(result.current.selectedStrategy).toBe('allSalary');
    expect(screen.getByText('£70,217 salary + £0 dividends')).toBeInTheDocument();
  });

  // Full-year 2026/27, rUK, category A. Under HMRC CA44 and the employer rates,
  // secondary NI is 15% above £5,000, less £10,500 when the allowance is declared.
  // For profit P, solve salary plus rounded secondary NI = P, then check the next penny.
  // https://www.gov.uk/government/publications/ca44-national-insurance-for-company-directors
  // https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
  it.each([
    [100000, true, 79347.83, 652.17],
    [220000, false, 174565.22, 25434.78],
  ])(
    'keeps the full All Salary result at revenue £%i with allowance %s',
    (revenue, allowance, salary, ni) => {
      const store = useDirectorGuideStore.getState();
      store.setRevenue(revenue);
      store.setHasEmploymentAllowance(allowance);
      store.calculate('allSalary');

      const { result } = renderHook(() => useActiveDirectorScenario(true));
      expect(result.current.selectedStrategy).toBe('allSalary');
      expect(result.current.activeScenario).toMatchObject({
        salary,
        dividends: 0,
        employerNI: ni,
        companyCost: revenue - 20000,
      });
    },
  );

  // One standalone company with a full accounting period, no other adjustments.
  // The £60,000 minimum is above the engine's normal search range, so Baseline Mix
  // evaluates the minimum. £200,000 - £60,000 - £8,250 NI leaves £131,750 taxable.
  // CT is 25% × £131,750 − 3/200 × (£250,000 − £131,750) = £31,163.75.
  // https://www.gov.uk/guidance/corporation-tax-marginal-relief
  it('publishes Baseline Mix at the submitted minimum above the slider cap', () => {
    const store = useDirectorGuideStore.getState();
    store.setRevenue(220000);
    store.setMinimumSalaryRequirement(60000);
    store.setYourSetupSalary(10000);
    store.setYourSetupDividends(20000);
    store.calculate('optimalMix');

    const { result } = renderHook(() => useActiveDirectorScenario(true));
    expect(result.current.comparison?.recommended).toBe('allSalary');
    expect(result.current.selectedStrategy).toBe('optimalMix');
    expect(result.current.activeScenario).toMatchObject({
      salary: 60000,
      dividends: 100586.25,
      employerNI: 8250,
      corporationTax: 31163.75,
    });

    render(<StrategyComparisonTable readOnly />);
    expect(screen.getByText('Baseline Mix').closest('article')).toHaveTextContent(
      'Displayed Result',
    );
    expect(screen.getByText('All Salary').closest('article')).toHaveTextContent('Recommendation');
    expect(screen.getByText(/less per year vs the displayed result/)).toBeInTheDocument();
  });

  it('publishes All Dividends against the validated monthly projection', () => {
    const store = useDirectorGuideStore.getState();
    store.setMode('monthly');
    store.setContractStartMonth(10);
    store.setMonthlyIncome(15000);
    store.setMonthlyExpenses(2000);
    store.calculate('allDividends');

    expect(useDirectorGuideStore.getState().monthlyModeOutput).toMatchObject({
      monthsRemaining: 6,
      projectedRevenue: 90000,
      projectedExpenses: 12000,
    });
    const { result } = renderHook(() => useActiveDirectorScenario(true));
    expect(result.current.selectedStrategy).toBe('allDividends');
    // £78,000 profit gives CT of 25% × £78,000 − 3/200 × £172,000 = £16,920.
    expect(result.current.activeScenario).toMatchObject({
      salary: 0,
      dividends: 61080,
      employerNI: 0,
      corporationTax: 16920,
    });
  });

  it('keeps equal results distinct by identity and withholds nonmatching email', () => {
    const store = useDirectorGuideStore.getState();
    store.setRevenue(24999);
    store.setSelectedStrategy('allSalary');
    store.calculate();

    const { result } = renderHook(() => ({
      ...useActiveDirectorScenario(true),
      emailReason: useDirectorEmailUnavailableReason(undefined, true),
    }));
    const baseline = result.current.activeScenario;
    expect(baseline).toMatchObject({ salary: 4999, dividends: 0, employerNI: 0 });
    expect(result.current.selectedStrategy).toBe('optimalMix');
    expect(result.current.emailReason).toBeNull();

    act(() => store.calculate('allSalary'));
    expect(result.current.activeScenario).toEqual(baseline);
    expect(result.current.selectedStrategy).toBe('allSalary');
    expect(result.current.emailReason).toMatch(/recommended strategy/i);
  });

  it('keeps All Dividends comparison-only with a positive minimum and preserves the rejected draft', () => {
    const store = useDirectorGuideStore.getState();
    store.setMinimumSalaryRequirement(60000);
    store.calculate();
    expect(hasCurrentDirectorResults(useDirectorGuideStore.getState())).toBe(true);
    store.setSelectedStrategy('allDividends');
    store.setSliderSalary(50270);
    store.calculate('allDividends');

    expect(useDirectorGuideStore.getState()).toMatchObject({
      calculatedStrategy: null,
      calculatedFormData: null,
      strategyComparison: null,
      selectedStrategy: 'allDividends',
      sliderSalary: 50270,
      formData: { minimumSalaryRequirement: 60000 },
      error: expect.stringContaining('Choose All Salary or Baseline Mix'),
    });
    expect(hasCurrentDirectorResults(useDirectorGuideStore.getState())).toBe(false);

    store.calculate();
    expect(useDirectorGuideStore.getState().calculatedStrategy).not.toBe('allDividends');
    render(<StrategyComparisonTable readOnly />);
    const dividendsCard = screen.getByText('All Dividends').closest('article');
    expect(dividendsCard).toHaveTextContent(
      'Comparison only. Zero salary does not meet your minimum.',
    );
    expect(dividendsCard).toHaveTextContent('£62,550');

    act(() => {
      store.setMinimumSalaryRequirement(undefined);
      store.calculate('allDividends');
    });
    expect(useDirectorGuideStore.getState().calculatedStrategy).toBe('allDividends');
  });

  it('withholds stale identity and clears it on invalidation, reset and stale-state recovery', () => {
    const store = useDirectorGuideStore.getState();
    store.calculate('allSalary');
    const { result } = renderHook(() => useActiveDirectorScenario(true));
    expect(result.current.selectedStrategy).toBe('allSalary');

    act(() => store.setRevenue(150000));
    expect(result.current.selectedStrategy).toBeNull();
    expect(result.current.activeScenario).toBeNull();
    act(() => store.invalidateResults());
    expect(useDirectorGuideStore.getState().calculatedStrategy).toBeNull();

    act(() => store.calculate('allSalary'));
    expect(result.current.selectedStrategy).toBe('allSalary');
    act(() => store.clearStaleState());
    expect(useDirectorGuideStore.getState().calculatedStrategy).toBeNull();

    act(() => {
      store.setRegion('rUK');
      store.setRevenue(100000);
      store.setExpenses(20000);
      store.calculate();
      store.reset();
    });
    expect(useDirectorGuideStore.getState().calculatedStrategy).toBeNull();
  });

  it('enforces the minimum at the same penny precision as the engine', () => {
    const store = useDirectorGuideStore.getState();
    store.setMinimumSalaryRequirement(0.01);
    store.calculate('allDividends');
    expect(useDirectorGuideStore.getState().calculatedStrategy).toBeNull();

    // Older saved input validation also accepts finite amounts below one penny.
    store.setMinimumSalaryRequirement(0.004);
    store.calculate('allDividends');
    expect(useDirectorGuideStore.getState().calculatedStrategy).toBe('allDividends');
  });
});
