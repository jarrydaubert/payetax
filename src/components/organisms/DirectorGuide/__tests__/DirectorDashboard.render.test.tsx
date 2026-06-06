import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { trackGuideReset } from '@/lib/directorGuideAnalytics';
import { useDirectorGuideStore } from '@/store/directorGuideStore';
import { DIRECTOR_EDUCATION_COLLAPSED_STORAGE_KEY, DirectorDashboard } from '../DirectorDashboard';

jest.mock('@/lib/directorGuideAnalytics', () => ({
  trackGuideReset: jest.fn(),
  trackGuideStarted: jest.fn(),
  trackResultsShown: jest.fn(),
  trackCalculationRun: jest.fn(),
  trackModeChanged: jest.fn(),
  trackSafeDrawCalculated: jest.fn(),
  trackBufferShortfallShown: jest.fn(),
}));

jest.mock('@/components/molecules/DirectorGuide/calculator', () => ({
  KeyDates: () => <div>Key Dates</div>,
  PensionGapWarning: () => <div>Pension Gap Warning</div>,
  SalarySlider: () => <div>Salary Slider</div>,
  StrategyComparisonTable: () => <div>Strategy Comparison</div>,
  TaxPots: () => <div>Tax Pots</div>,
}));

jest.mock('@/components/molecules/DirectorGuide/dashboard', () => ({
  DashboardLayout: ({
    sidebar,
    inputs,
    main,
    education,
    educationCollapsed,
    onToggleEducation,
  }: {
    sidebar: ReactNode;
    inputs: ReactNode;
    main: ReactNode;
    education: ReactNode;
    educationCollapsed?: boolean;
    onToggleEducation?: () => void;
  }) => (
    <div>
      {sidebar}
      {inputs}
      <div data-testid='education-collapsed'>{String(Boolean(educationCollapsed))}</div>
      {onToggleEducation && (
        <button type='button' onClick={onToggleEducation}>
          Toggle Education
        </button>
      )}
      {main}
      {education}
    </div>
  ),
  DetailCards: () => <div>Detail Cards</div>,
  EducationPanel: () => <div>Education Panel</div>,
  InputsPanel: ({ onReset }: { onReset: () => void }) => (
    <button type='button' onClick={onReset}>
      Inputs Panel
    </button>
  ),
  MoneyFlowChart: () => <div>Money Flow</div>,
  RecommendationHero: () => <div>Recommendation Hero</div>,
  SidebarNav: () => <div>Sidebar</div>,
  SummaryCards: () => <div>Summary Cards</div>,
  SurvivalModePanel: () => <div data-testid='director-survival-mode'>Survival Mode</div>,
}));

jest.mock('@/components/molecules/DirectorGuide/EmailResultsDialog', () => ({
  EmailResultsDialog: ({ open }: { open: boolean }) => (open ? <div>Results Dialog</div> : null),
}));

function createComparison(grossProfit: number) {
  const emptyStrategy = {
    name: 'All Salary',
    salary: 12570,
    dividends: 20000,
    pension: 0,
    companyCarBIK: 0,
    employerNI: 1000,
    employeeNI: 500,
    incomeTax: 1500,
    corporationTax: 2000,
    dividendTax: 500,
    studentLoan: 0,
    totalPersonalTax: 2500,
    companyCost: 0,
    takeHome: 35000,
    effectiveRate: 25,
  };

  return {
    grossProfit,
    grossProfitAfterPension: grossProfit,
    alreadyTaken: 0,
    availableForExtraction: grossProfit,
    strategies: {
      allSalary: { ...emptyStrategy, name: 'All Salary' },
      optimalMix: { ...emptyStrategy, name: 'Baseline Mix' },
      allDividends: { ...emptyStrategy, name: 'All Dividends' },
    },
    recommended: 'optimalMix' as const,
    savingsVsAllSalary: 0,
  };
}

describe('DirectorDashboard (normal mode)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    const current = useDirectorGuideStore.getState();
    useDirectorGuideStore.setState({
      ...current,
      formData: {
        ...current.formData,
        region: undefined,
        revenue: undefined,
        expenses: undefined,
      },
      strategyComparison: null,
      results: null,
      error: null,
    } as never);
  });

  it('renders the main flow when comparison is available', () => {
    useDirectorGuideStore.setState({
      strategyComparison: createComparison(80000) as never,
    } as never);

    render(<DirectorDashboard />);

    expect(screen.getByText('Summary Cards')).toBeInTheDocument();
    expect(screen.getByText('Strategy Comparison')).toBeInTheDocument();
    expect(screen.getByText(/Save this breakdown for your records/i)).toBeInTheDocument();
  });

  it('shows monthly safe draw callout in monthly mode', () => {
    const current = useDirectorGuideStore.getState();
    useDirectorGuideStore.setState({
      formData: { ...current.formData, mode: 'monthly' } as never,
      strategyComparison: createComparison(80000) as never,
      monthlyModeOutput: {
        monthsRemaining: 6,
        projectedRevenue: 18000,
        projectedExpenses: 6000,
        taxBasedMonthlyDraw: 3000,
        requiredBuffer: 4500,
        cashBasedCeiling: 2000,
        safeMonthlyDraw: 2200,
        shortfall: 0,
        hasBufferShortfall: false,
        hasContractEndRisk: false,
      } as never,
    } as never);

    render(<DirectorDashboard />);
    expect(screen.getByText('Safe Monthly Draw')).toBeInTheDocument();
    expect(screen.getByText('Recommended draw')).toBeInTheDocument();
  });

  it('opens the email dialog when CTA is clicked', () => {
    useDirectorGuideStore.setState({
      strategyComparison: createComparison(80000) as never,
    } as never);

    render(<DirectorDashboard />);
    fireEvent.click(screen.getByText('Email My Results'));

    expect(screen.getByText('Results Dialog')).toBeInTheDocument();
  });

  it('shows the empty state when no comparison exists', () => {
    render(<DirectorDashboard />);
    expect(
      screen.getByText(/Enter your numbers to compare director pay options/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open Calculator/i })).toBeInTheDocument();
    expect(screen.getByText(/On mobile, tap the calculator button/i)).toBeInTheDocument();
  });

  it('tracks one reset event for one reset click', () => {
    const current = useDirectorGuideStore.getState();
    useDirectorGuideStore.setState({
      formData: {
        ...current.formData,
        region: 'rUK',
        revenue: 90000,
        expenses: 20000,
      },
    } as never);

    render(<DirectorDashboard />);

    fireEvent.click(screen.getByRole('button', { name: 'Inputs Panel' }));

    expect(trackGuideReset).toHaveBeenCalledTimes(1);
    expect(useDirectorGuideStore.getState().formData.revenue).toBeUndefined();
  });

  it('restores learn panel collapse preference from localStorage', async () => {
    localStorage.setItem(DIRECTOR_EDUCATION_COLLAPSED_STORAGE_KEY, 'false');

    render(<DirectorDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('education-collapsed')).toHaveTextContent('false');
    });
  });

  it('persists learn panel collapse preference when toggled', async () => {
    localStorage.setItem(DIRECTOR_EDUCATION_COLLAPSED_STORAGE_KEY, 'false');

    render(<DirectorDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('education-collapsed')).toHaveTextContent('false');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Toggle Education' }));

    await waitFor(() => {
      expect(localStorage.getItem(DIRECTOR_EDUCATION_COLLAPSED_STORAGE_KEY)).toBe('true');
    });
  });
});
