import { act, render, renderHook, screen, within } from '@testing-library/react';
import { StrategyComparisonTable } from '@/components/molecules/DirectorGuide/calculator/StrategyComparisonTable';
import { TaxPots } from '@/components/molecules/DirectorGuide/calculator/TaxPots';
import { useActiveDirectorScenario } from '@/components/molecules/DirectorGuide/calculator/useActiveDirectorScenario';
import { DetailCards } from '@/components/molecules/DirectorGuide/dashboard/DetailCards';
import { EducationPanel } from '@/components/molecules/DirectorGuide/dashboard/EducationPanel';
import { RecommendationHero } from '@/components/molecules/DirectorGuide/dashboard/RecommendationHero';
import { SummaryCards } from '@/components/molecules/DirectorGuide/dashboard/SummaryCards';
import { useDirectorEmailUnavailableReason } from '@/components/molecules/DirectorGuide/useDirectorEmailUnavailableReason';
import { formatCurrency } from '@/lib/utils';
import { hasCurrentDirectorResults, useDirectorGuideStore } from '@/store/directorGuideStore';
import { consultancy } from '@/test/directorReferenceFixtures/referenceCompanies';

jest.mock('@/lib/tax', () => ({
  ...jest.requireActual('@/lib/tax'),
  resolveTaxYear: () => '2026-2027',
}));

function detailAmount(title: string, label: string) {
  const card = screen.getByRole('heading', { name: title }).parentElement;
  if (!card) throw new Error('Expected a detail card');
  return within(card).getByText(label, { exact: true }).nextElementSibling;
}

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
    store.setSliderSalary(50270);
    store.setSelectedStrategy('allSalary');
    expect(useDirectorGuideStore.getState().sliderSalary).toBeNull();
    store.calculate();

    const { result } = renderHook(() => useActiveDirectorScenario());
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
        <StrategyComparisonTable />
        <EducationPanel />
      </>,
    );
    expect(screen.getByRole('heading', { name: 'All Salary', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Displayed pay strategy' })).toHaveTextContent(
      '£70,217 salary + £0 dividends',
    );
    expect(screen.getByRole('region', { name: 'Financial summary' })).toHaveTextContent('£70,217');
    expect(screen.getByText(/£815.22\/mo average/)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'All Salary', level: 4 }).closest('article'),
    ).toHaveTextContent('Displayed Result');
    expect(screen.queryByText('What Are Dividends?')).not.toBeInTheDocument();

    act(() => useDirectorGuideStore.getState().setSliderSalary(50270));
    act(() => useDirectorGuideStore.getState().setSelectedStrategy('allDividends'));
    expect(useDirectorGuideStore.getState().sliderSalary).toBeNull();
    expect(result.current.selectedStrategy).toBeNull();
    expect(screen.queryByText('£70,217 salary + £0 dividends')).not.toBeInTheDocument();
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
      store.setSelectedStrategy('allSalary');
      store.calculate();

      const { result } = renderHook(() => useActiveDirectorScenario());
      expect(result.current.selectedStrategy).toBe('allSalary');
      expect(result.current.activeScenario).toMatchObject({
        salary,
        dividends: 0,
        employerNI: ni,
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
    store.setSelectedStrategy('optimalMix');
    store.calculate();

    const { result } = renderHook(() => useActiveDirectorScenario());
    expect(result.current.comparison?.recommended).toBe('allSalary');
    expect(result.current.selectedStrategy).toBe('optimalMix');
    expect(result.current.activeScenario).toMatchObject({
      salary: 60000,
      dividends: 100586.25,
      employerNI: 8250,
      corporationTax: 31163.75,
    });

    render(<StrategyComparisonTable />);
    expect(screen.getByText('Baseline Mix').closest('article')).toHaveTextContent(
      'Displayed Result',
    );
    expect(screen.getByText('All Salary').closest('article')).toHaveTextContent(
      'Highest Take-Home',
    );
    expect(screen.getByText(/less per year vs max take-home/)).toBeInTheDocument();
  });

  it('publishes All Dividends against the validated monthly projection', () => {
    const store = useDirectorGuideStore.getState();
    store.setMode('monthly');
    store.setContractStartMonth(10);
    store.setMonthlyIncome(15000);
    store.setMonthlyExpenses(2000);
    store.setSelectedStrategy('allDividends');
    store.calculate();

    expect(useDirectorGuideStore.getState().monthlyModeOutput).toMatchObject({
      monthsRemaining: 6,
      projectedRevenue: 90000,
      projectedExpenses: 12000,
    });
    const { result } = renderHook(() => useActiveDirectorScenario());
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
    store.calculate();

    const { result } = renderHook(() => ({
      ...useActiveDirectorScenario(),
      emailReason: useDirectorEmailUnavailableReason(undefined, true),
    }));
    const baseline = result.current.activeScenario;
    expect(baseline).toMatchObject({ salary: 4999, dividends: 0, employerNI: 0 });
    expect(result.current.selectedStrategy).toBe('optimalMix');
    expect(result.current.emailReason).toBeNull();

    act(() => {
      store.setSelectedStrategy('allSalary');
      store.calculate();
    });
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
    store.calculate();

    expect(useDirectorGuideStore.getState()).toMatchObject({
      calculatedStrategy: expect.any(String),
      calculatedFormData: { minimumSalaryRequirement: 60000 },
      strategyComparison: expect.any(Object),
      selectedStrategy: 'allDividends',
      sliderSalary: null,
      formData: { minimumSalaryRequirement: 60000 },
      error: expect.stringContaining('Choose All Salary or Baseline Mix'),
    });
    expect(hasCurrentDirectorResults(useDirectorGuideStore.getState())).toBe(false);

    store.setSelectedStrategy(null);
    store.calculate();
    expect(useDirectorGuideStore.getState().calculatedStrategy).not.toBe('allDividends');
    render(<StrategyComparisonTable />);
    const dividendsCard = screen.getByText('All Dividends').closest('article');
    expect(dividendsCard).toHaveTextContent(
      'Comparison only. Zero salary does not meet your minimum.',
    );
    expect(dividendsCard).toHaveTextContent('£62,550');

    act(() => {
      store.setMinimumSalaryRequirement(undefined);
      store.setSelectedStrategy('allDividends');
      store.calculate();
    });
    expect(useDirectorGuideStore.getState().calculatedStrategy).toBe('allDividends');
  });

  it('withholds stale identity and clears the snapshot on reset and stale-state recovery', () => {
    const store = useDirectorGuideStore.getState();
    store.setSelectedStrategy('allSalary');
    store.calculate();
    const { result } = renderHook(() => useActiveDirectorScenario());
    expect(result.current.selectedStrategy).toBe('allSalary');

    act(() => store.setRevenue(150000));
    expect(result.current.selectedStrategy).toBeNull();
    expect(result.current.activeScenario).toBeNull();
    expect(useDirectorGuideStore.getState().calculatedStrategy).toBe('allSalary');

    act(() => {
      store.setSelectedStrategy('allSalary');
      store.calculate();
    });
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
    store.setSelectedStrategy('allDividends');
    store.calculate();
    expect(useDirectorGuideStore.getState().calculatedStrategy).toBeNull();

    // Older saved input validation also accepts finite amounts below one penny.
    store.setMinimumSalaryRequirement(0.004);
    store.setSelectedStrategy('allDividends');
    store.calculate();
    expect(useDirectorGuideStore.getState().calculatedStrategy).toBe('allDividends');
  });
});

describe('submitted Director exploration (JGF-149)', () => {
  beforeEach(() => {
    const store = useDirectorGuideStore.getState();
    store.reset();
    store.setRegion('rUK');
    store.setRevenue(100000);
    store.setExpenses(20000);
  });

  it('applies a staged profit adjustment only when explicitly submitted', () => {
    const store = useDirectorGuideStore.getState();
    store.calculate();
    const previous = useDirectorGuideStore.getState().strategyComparison;
    store.setSelectedStrategy('allSalary');
    store.setProfitWhatIfPercent(-45);
    expect(useDirectorGuideStore.getState().strategyComparison).toBe(previous);
    expect(previous?.grossProfit).toBe(80000);

    store.calculate();
    expect(useDirectorGuideStore.getState().strategyComparison?.grossProfit).toBe(44000);
  });

  it('preserves the audit salary through the profit conflict, reset and date-only recalculation', () => {
    const store = useDirectorGuideStore.getState();
    store.setSliderSalary(48300);
    store.calculate();
    const { result } = renderHook(useActiveDirectorScenario);
    expect(result.current.activeScenario?.salary).toBe(48300);

    const submitted = useDirectorGuideStore.getState().strategyComparison;
    act(() => store.setProfitWhatIfPercent(-45));
    expect(result.current.activeScenario).toBeNull();
    expect(useDirectorGuideStore.getState().strategyComparison).toBe(submitted);
    expect(submitted?.grossProfit).toBe(80000);
    act(() => store.calculate());
    expect(result.current.activeScenario).toBeNull();
    expect(useDirectorGuideStore.getState()).toMatchObject({
      sliderSalary: 48300,
      profitWhatIfPercent: -45,
      error: expect.stringContaining('company budget or minimum salary'),
    });

    act(() => store.setProfitWhatIfPercent(0));
    expect(result.current.activeScenario).toBeNull();
    act(() => store.calculate());
    expect(result.current.activeScenario?.salary).toBe(48300);

    act(() => store.setAccountingPeriodEnd('2027-03-31'));
    expect(result.current.activeScenario).toBeNull();
    expect(useDirectorGuideStore.getState().sliderSalary).toBe(48300);
    act(() => store.calculate());
    expect(result.current.activeScenario?.salary).toBe(48300);
    expect(useDirectorGuideStore.getState().calculatedFormData?.accountingPeriodEnd).toBe(
      '2027-03-31',
    );
  });

  it('retains adjusted profit on a named choice and restores exact named identity after profit reset', () => {
    const store = useDirectorGuideStore.getState();
    store.setSliderSalary(48300);
    store.calculate();
    render(<RecommendationHero />);
    expect(screen.getByRole('heading', { name: 'Custom salary' })).toBeVisible();

    act(() => {
      store.setProfitWhatIfPercent(-45);
      store.setSelectedStrategy('allSalary');
    });
    expect(screen.queryByRole('heading', { name: 'Custom salary' })).not.toBeInTheDocument();
    expect(useDirectorGuideStore.getState()).toMatchObject({
      selectedStrategy: 'allSalary',
      sliderSalary: null,
      profitWhatIfPercent: -45,
    });
    act(() => store.calculate());
    expect(
      screen.getByRole('heading', { name: 'Custom profit (based on All Salary)' }),
    ).toBeVisible();
    // The audit budget is £44,000, so salary + 15% of (salary − £5,000) spends it.
    expect(screen.getByText('£38,913 salary + £0 dividends')).toBeVisible();

    act(() => store.setProfitWhatIfPercent(0));
    expect(
      screen.queryByRole('heading', { name: 'Custom profit (based on All Salary)' }),
    ).not.toBeInTheDocument();
    act(() => store.calculate());
    expect(screen.getByRole('heading', { name: 'All Salary' })).toBeVisible();
    expect(screen.getByText('£70,217 salary + £0 dividends')).toBeVisible();
  });

  it('presents the same custom result in the hero, breakdown, reserves and warnings', () => {
    const store = useDirectorGuideStore.getState();
    store.setProfitWhatIfPercent(-25);
    store.setSliderSalary(12570);
    store.setOtherIncome(40000);
    store.setHasOtherPAYEEmployment(true);
    store.setIncludesVat(true);
    store.setStudentLoanPlans(['plan2']);
    store.setYtdSalary(13000);
    store.calculate();

    const { result } = renderHook(useActiveDirectorScenario);
    // JGF-47's £60,000 profit fixture (PR #209), with separate PAYE and warning-only VAT.
    expect(result.current.activeScenario).toMatchObject({
      salary: 12570,
      dividends: 37498.54,
      corporationTax: 8795.96,
      studentLoan: 4506.17,
      takeHome: 29361.39,
    });
    render(
      <>
        <RecommendationHero />
        <SummaryCards />
        <DetailCards />
        <TaxPots />
        <StrategyComparisonTable />
      </>,
    );
    expect(screen.getByRole('heading', { name: 'Custom salary and profit' })).toBeVisible();
    expect(screen.getByText('£12,570 salary + £37,499 dividends')).toBeVisible();
    expect(screen.getAllByText('Adjusted company profit')).toHaveLength(2);
    expect(
      screen.getByRole('heading', { name: 'Corporation Tax' }).parentElement,
    ).toHaveTextContent('£60,000.00');
    expect(
      screen.getByText('Student loan from this scenario', { exact: true }).parentElement,
    ).toHaveTextContent('-£4,506.17');
    expect(screen.getByText('Estimated annual take-home').parentElement).toHaveTextContent(
      '£29,361.39',
    );
    expect(screen.getByText(/Salary already paid/)).toHaveTextContent('£12,570.00');
  });

  it('reconciles canonical B with Plan 2 and keeps the retained setup amount out of tax', () => {
    const store = useDirectorGuideStore.getState();
    store.setRevenue(consultancy.input.revenue);
    store.setExpenses(consultancy.input.expenses);
    store.setAssociatedCompaniesCount(consultancy.input.associatedCompaniesCount);
    store.setYourSetupSalary(consultancy.expected.optimalMix.salary);
    store.setYourSetupDividends(20000);
    store.setStudentLoanPlans(['plan2']);
    store.setSelectedStrategy('optimalMix');
    store.calculate();
    render(
      <>
        <DetailCards />
        <TaxPots />
        <StrategyComparisonTable />
      </>,
    );

    expect(detailAmount('Personal Take-Home', 'Student loan from this scenario')).toHaveTextContent(
      '-£3,040.78',
    );
    expect(detailAmount('Personal Take-Home', 'Estimated annual take-home')).toHaveTextContent(
      '£51,519.41',
    );
    expect(screen.getByText('Personal tax and loan budget').parentElement).toHaveTextContent(
      '£11,652.05 annually',
    );
    // The same company tax and payroll budget applies to the partial distribution.
    expect(screen.getByText('Company tax and NI budget').parentElement).toHaveTextContent(
      '£16,828.54 annually',
    );
    const setup = screen.getByRole('heading', { name: 'Your Setup' }).parentElement?.parentElement
      ?.parentElement;
    if (!setup) throw new Error('Expected the Your Setup card');
    expect(within(setup).getByText('Profit retained this period').parentElement).toHaveTextContent(
      '£30,601',
    );
    expect(within(setup).getByText('Total Tax').parentElement).toHaveTextContent('£17,789');
    expect(within(setup).getByText('Total NI').parentElement).toHaveTextContent('£1,136');
    expect(setup).not.toHaveTextContent(/effective rate/i);
  });

  it('explains canonical B’s pension and loss on their own bases, including the floors', () => {
    const store = useDirectorGuideStore.getState();
    store.setRevenue(consultancy.input.revenue);
    store.setExpenses(consultancy.input.expenses);
    store.setAssociatedCompaniesCount(consultancy.input.associatedCompaniesCount);
    store.setOtherIncome(consultancy.otherJob.otherIncome);
    store.setHasOtherPAYEEmployment(true);
    store.setPensionContribution(consultancy.employerPension.pensionContribution);
    store.setSelectedStrategy('optimalMix');
    store.calculate();
    render(<DetailCards />);

    const expected = consultancy.expected.employerPension;
    expect(detailAmount('Corporation Tax', 'Profit after employer pension')).toHaveTextContent(
      '£70,000.00',
    );
    expect(detailAmount('Corporation Tax', 'Taxable profit')).toHaveTextContent(
      formatCurrency(expected.taxableProfit),
    );
    expect(detailAmount('Company Allocation', 'Employer pension')).toHaveTextContent(
      formatCurrency(-expected.pension),
    );
    expect(detailAmount('Personal Take-Home', 'Estimated annual take-home')).toHaveTextContent(
      formatCurrency(expected.takeHome.observed),
    );

    act(() => {
      store.setExpenses(consultancy.input.expenses + expected.pension);
      store.setIsPensionAlreadyDeducted(true);
      store.calculate();
    });
    expect(screen.queryByText('Employer pension', { exact: true })).not.toBeInTheDocument();
    expect(detailAmount('Company Allocation', 'Profit retained this period')).toHaveTextContent(
      '£0.00',
    );
    expect(detailAmount('Corporation Tax', 'Taxable profit')).toHaveTextContent(
      formatCurrency(expected.taxableProfit),
    );

    act(() => {
      store.setExpenses(consultancy.input.expenses);
      store.setIsPensionAlreadyDeducted(false);
      store.setPensionContribution(90000);
      store.calculate();
    });
    expect(detailAmount('Corporation Tax', 'Profit after employer pension')).toHaveTextContent(
      '-£10,000.00',
    );
    expect(detailAmount('Company Allocation', 'Deficit against period profit')).toHaveTextContent(
      '-£10,000.00',
    );

    act(() => {
      store.setPensionContribution(0);
      store.setOtherIncome(0);
      store.setSelectedStrategy('allDividends');
      store.setLossesBroughtForward(consultancy.tradingLoss.lossesBroughtForward);
      store.calculate();
    });
    expect(detailAmount('Corporation Tax', 'Trading loss relief used')).toHaveTextContent(
      formatCurrency(-consultancy.tradingLoss.lossesBroughtForward),
    );
    expect(detailAmount('Corporation Tax', 'Taxable profit')).toHaveTextContent(
      formatCurrency(consultancy.expected.tradingLoss.taxableProfit),
    );
    expect(detailAmount('Company Allocation', 'Gross dividends')).toHaveTextContent(
      formatCurrency(-consultancy.expected.tradingLoss.dividends),
    );
    act(() => {
      store.setLossesBroughtForward(100000);
      store.calculate();
    });
    expect(detailAmount('Corporation Tax', 'Trading loss relief used')).toHaveTextContent(
      formatCurrency(-consultancy.grossProfit),
    );
    expect(detailAmount('Corporation Tax', 'Taxable profit')).toHaveTextContent('£0.00');
    expect(detailAmount('Company Allocation', 'Gross dividends')).toHaveTextContent(
      formatCurrency(-consultancy.grossProfit),
    );
  });

  it('changes only the reference on objective submission and excludes comparisons below the minimum', () => {
    const store = useDirectorGuideStore.getState();
    store.setSliderSalary(20000);
    store.calculate();
    const { result } = renderHook(useActiveDirectorScenario);
    const active = result.current.activeScenario;
    expect(result.current.exploration?.objectiveReference).toBe('optimalMix');
    render(<StrategyComparisonTable />);

    act(() => store.setObjective('minimizeNI'));
    expect(screen.queryByText('Lowest NI')).not.toBeInTheDocument();
    act(() => store.calculate());
    expect(result.current.activeScenario).toEqual(active);
    expect(result.current.exploration?.objectiveReference).toBe('allDividends');
    expect(screen.getByText('All Dividends').closest('article')).toHaveTextContent('Lowest NI');

    act(() => {
      store.setMinimumSalaryRequirement(20000);
      store.calculate();
    });
    expect(result.current.activeScenario?.salary).toBe(20000);
    expect(result.current.exploration?.objectiveReference).toBe('optimalMix');
    expect(screen.getByText('Baseline Mix').closest('article')).toHaveTextContent('Lowest NI');
    expect(screen.getByText('All Dividends').closest('article')).toHaveTextContent(
      'Comparison only',
    );

    act(() => {
      store.setMinimumSalaryRequirement(80000);
      store.setSelectedStrategy('optimalMix');
      store.calculate();
    });
    expect(result.current.activeScenario?.minimumSalaryShortfall).toBe(9782.61);
    expect(result.current.exploration?.objectiveReference).toBeNull();
    expect(screen.getByText(/No strategy meets your minimum salary/)).toBeVisible();
  });

  it('keeps the recommendation as active on an objective-only submission without a named draft', () => {
    const store = useDirectorGuideStore.getState();
    store.setHasEmploymentAllowance(true);
    store.calculate();
    const { result } = renderHook(useActiveDirectorScenario);
    const active = result.current.activeScenario;
    expect(result.current.selectedStrategy).toBe('allSalary');
    act(() => {
      store.setObjective('minimizeNI');
      store.calculate();
    });
    expect(result.current.selectedStrategy).toBe('allSalary');
    expect(result.current.activeScenario).toEqual(active);
    expect(result.current.exploration?.objectiveReference).not.toBe('allSalary');
  });

  it('adjusts projected profit before deducting employer pension in monthly mode', () => {
    const store = useDirectorGuideStore.getState();
    store.setMode('monthly');
    store.setContractStartMonth(10);
    store.setMonthlyIncome(15000);
    store.setMonthlyExpenses(2000);
    store.setPensionContribution(6000);
    store.setProfitWhatIfPercent(-25);
    store.setSelectedStrategy('allDividends');
    store.calculate();
    expect(useDirectorGuideStore.getState().monthlyModeOutput?.monthsRemaining).toBe(6);
    const { result } = renderHook(useActiveDirectorScenario);
    expect(result.current.comparison).toMatchObject({
      grossProfit: 58500,
      grossProfitAfterPension: 52500,
    });
    expect(result.current.activeScenario).toMatchObject({ salary: 0, pension: 6000 });
    render(<DetailCards />);
    expect(detailAmount('Corporation Tax', 'Profit after employer pension')).toHaveTextContent(
      '£52,500.00',
    );
  });

  it('enforces both the shared allowance-aware company budget and the salary minimum at the penny', () => {
    const store = useDirectorGuideStore.getState();
    store.setHasEmploymentAllowance(true);
    store.setCompanyCarBIK(10000);
    // Reuse the independently checked £80,000 budget in JGF-45 (PR #203).
    store.setSliderSalary(78043.48);
    store.calculate();
    const { result } = renderHook(useActiveDirectorScenario);
    expect(result.current.activeScenario).toMatchObject({
      salary: 78043.48,
      employerNI: 1956.52,
      class1ANI: 1500,
    });
    render(<DetailCards />);
    expect(detailAmount('Company Allocation', 'Employer NI (incl. Class 1A)')).toHaveTextContent(
      '-£1,956.52',
    );
    expect(detailAmount('Company Allocation', 'Profit retained this period')).toHaveTextContent(
      '£0.00',
    );
    expect(detailAmount('Personal Take-Home', 'Gross salary')).toHaveTextContent('£78,043.48');
    act(() => {
      store.setSliderSalary(78043.49);
      store.calculate();
    });
    expect(result.current.activeScenario).toBeNull();
    expect(useDirectorGuideStore.getState().sliderSalary).toBe(78043.49);

    act(() => {
      store.setSliderSalary(78043.48);
      store.setMinimumSalaryRequirement(78043.49);
      store.calculate();
    });
    expect(result.current.activeScenario).toBeNull();
    expect(useDirectorGuideStore.getState().sliderSalary).toBe(78043.48);
  });
});
