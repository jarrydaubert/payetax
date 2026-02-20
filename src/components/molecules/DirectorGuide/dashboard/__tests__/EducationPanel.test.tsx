import { render, screen } from '@testing-library/react';
import { useDirectorGuideStore } from '@/store/directorGuideStore';
import { EducationPanel } from '../EducationPanel';

function setDirectorGuideState(
  partial: Partial<ReturnType<typeof useDirectorGuideStore.getState>>,
) {
  useDirectorGuideStore.setState(partial as never);
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
      },
    });
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

  test('shows monthly-mode buffer and contract risk warnings', () => {
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
