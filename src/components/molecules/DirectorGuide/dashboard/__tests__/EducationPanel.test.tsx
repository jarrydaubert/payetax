import { act, render, screen } from '@testing-library/react';
import { CURRENT_TAX_YEAR, formatTaxYearDisplay, getSection455Rate } from '@/lib/tax';
import { useDirectorGuideStore } from '@/store/directorGuideStore';
import { EducationPanel } from '../EducationPanel';

function setDirectorGuideState(
  partial: Partial<ReturnType<typeof useDirectorGuideStore.getState>>,
) {
  useDirectorGuideStore.setState((state) => ({
    ...partial,
    calculatedFormData: partial.strategyComparison ? (partial.formData ?? state.formData) : null,
  }));
}

function createComparison(grossProfit: number) {
  const strategy = {
    name: 'Baseline Mix',
    salary: 0,
    dividends: 0,
    pension: 0,
    companyCarBIK: 0,
    employerNI: 0,
    employeeNI: 0,
    incomeTax: 0,
    corporationTax: 0,
    dividendTax: 0,
    studentLoan: 0,
    totalPersonalTax: 0,
    companyCost: 0,
    takeHome: 0,
    effectiveRate: 0,
  };

  return {
    grossProfit,
    grossProfitAfterPension: grossProfit,
    alreadyTaken: 0,
    availableForExtraction: Math.max(0, grossProfit),
    strategies: {
      allSalary: { ...strategy, name: 'All Salary' },
      optimalMix: { ...strategy, name: 'Baseline Mix' },
      allDividends: { ...strategy, name: 'All Dividends' },
    },
    recommended: 'optimalMix' as const,
    savingsVsAllSalary: 0,
  };
}

describe('DirectorGuide EducationPanel', () => {
  beforeEach(() => {
    // Reset only what we touch in these tests to avoid analytics side effects from store.reset().
    const current = useDirectorGuideStore.getState();
    setDirectorGuideState({
      strategyComparison: null,
      formData: {
        ...current.formData,
        revenue: undefined,
        expenses: undefined,
        includesVat: false,
        ytdDrawings: 0,
      },
    });
  });

  test('shows the policy rate and its loan year when drawings exceed the comparison', () => {
    setDirectorGuideState({
      strategyComparison: createComparison(5000),
      formData: { ...useDirectorGuideStore.getState().formData, ytdDrawings: 1000 },
    });

    render(<EducationPanel />);

    const rate = getSection455Rate(CURRENT_TAX_YEAR);
    expect(rate).not.toBeNull();
    const percent = Number(((rate ?? 0) * 100).toFixed(2));
    expect(screen.getByText('Section 455 Tax Warning')).toBeInTheDocument();
    expect(
      screen.getByText(
        `For loans made in ${formatTaxYearDisplay(CURRENT_TAX_YEAR)}, your company may owe Section 455 tax at ${percent}% on amounts still unpaid nine months after the end of the accounting period.`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /HMRC’s Section 455 guidance/ })).toHaveAttribute(
      'href',
      'https://www.gov.uk/hmrc-internal-manuals/company-taxation-manual/ctm61505',
    );
  });

  test('does not show the Section 455 warning for an overdrawn comparison without drawings', () => {
    setDirectorGuideState({
      strategyComparison: createComparison(5000),
      formData: { ...useDirectorGuideStore.getState().formData, ytdSalary: 1000 },
    });

    render(<EducationPanel />);

    expect(screen.getByText('Already Taken Too Much')).toBeInTheDocument();
    expect(screen.queryByText('Section 455 Tax Warning')).not.toBeInTheDocument();
  });

  test('shows VAT mandatory warning based on revenue even with no results', () => {
    setDirectorGuideState({
      strategyComparison: null,
      formData: { ...useDirectorGuideStore.getState().formData, revenue: 91000 },
    });

    render(<EducationPanel />);

    expect(screen.getByText('VAT Registration Required')).toBeInTheDocument();
  });

  test('shows VAT approaching warning based on revenue even when profit is zero', () => {
    setDirectorGuideState({
      strategyComparison: createComparison(0) as never,
      formData: { ...useDirectorGuideStore.getState().formData, revenue: 86000 },
    });

    render(<EducationPanel />);

    expect(screen.getByText('VAT Threshold Approaching')).toBeInTheDocument();
  });

  test('adds a VAT note when revenue includes VAT (warning-only)', () => {
    setDirectorGuideState({
      strategyComparison: null,
      formData: { ...useDirectorGuideStore.getState().formData, revenue: 91000, includesVat: true },
    });

    render(<EducationPanel />);

    expect(screen.getByText(/turnover figure includes VAT/i)).toBeInTheDocument();
  });

  test('shows monthly projection and warnings only while their inputs are current', () => {
    const current = useDirectorGuideStore.getState();
    setDirectorGuideState({
      strategyComparison: createComparison(5000) as never,
      monthlyModeOutput: {
        monthsRemaining: 2,
        projectedRevenue: 12000,
        projectedExpenses: 5000,
        taxBasedMonthlyDraw: 1200,
        requiredBuffer: 3600,
        cashBasedCeiling: 0,
        safeMonthlyDraw: 900,
        shortfall: 1800,
        hasBufferShortfall: true,
        hasContractEndRisk: true,
      } as never,
      formData: {
        ...current.formData,
        mode: 'monthly',
        monthlyIncome: 6000,
        monthlyExpenses: 2500,
      },
    });

    render(<EducationPanel />);

    expect(screen.getByText('Cash Buffer Shortfall')).toBeInTheDocument();
    expect(screen.getByText('Contract-End Risk')).toBeInTheDocument();
    expect(screen.getByText('Mid-Year Projection Assumption')).toBeInTheDocument();
    expect(screen.getByText(/Monthly projection \(2 months remaining\)/i)).toBeInTheDocument();

    act(() => current.setMonthlyIncome(7000));

    expect(screen.queryByText('Cash Buffer Shortfall')).not.toBeInTheDocument();
    expect(screen.queryByText('Contract-End Risk')).not.toBeInTheDocument();
    expect(screen.queryByText(/2 months remaining/i)).not.toBeInTheDocument();
    expect(screen.getByText('Monthly projection', { exact: true })).toBeInTheDocument();
    expect(screen.queryByText('Full Year')).not.toBeInTheDocument();
  });

  test('shows MTD for Income Tax timeline and scope note', () => {
    render(<EducationPanel />);

    expect(screen.getByText('MTD for Income Tax timeline (current HMRC plan)')).toBeInTheDocument();
    expect(
      screen.getByText(/From 6 April 2026: qualifying income over £50,000/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/From 6 April 2027: qualifying income over £30,000/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/From 6 April 2028: qualifying income over £20,000/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Limited-company directors may still file Self Assessment outside MTD for Income Tax/i,
      ),
    ).toBeInTheDocument();
  });
});
