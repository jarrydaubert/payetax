import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { trackCalculationRun } from '@/lib/directorGuideAnalytics';
import {
  useDirectorFormSlice,
  useDirectorGuideActions,
  useMonthlyModeOutput,
  useStrategyComparison,
} from '@/store/directorGuideStore';
import { DirectorDashboard } from '../DirectorDashboard';

jest.mock('@/lib/directorGuideAnalytics', () => ({
  trackGuideStarted: jest.fn(),
  trackResultsShown: jest.fn(),
  trackGuideReset: jest.fn(),
  trackCalculationRun: jest.fn(),
  trackModeChanged: jest.fn(),
  trackSafeDrawCalculated: jest.fn(),
  trackBufferShortfallShown: jest.fn(),
}));

jest.mock('@/store/directorGuideStore', () => ({
  useDirectorFormSlice: jest.fn(),
  useStrategyComparison: jest.fn(),
  useMonthlyModeOutput: jest.fn(),
  useDirectorGuideActions: jest.fn(),
}));

jest.mock('@/components/molecules/DirectorGuide/calculator', () => ({
  KeyDates: () => null,
  PensionGapWarning: () => null,
  SalarySlider: () => null,
  StrategyComparisonTable: () => null,
  TaxPots: () => null,
}));

jest.mock('@/components/molecules/DirectorGuide/dashboard', () => ({
  DashboardLayout: ({
    sidebar,
    inputs,
    main,
    education,
  }: {
    sidebar: ReactNode;
    inputs: ReactNode;
    main: ReactNode;
    education: ReactNode;
  }) => (
    <div>
      {sidebar}
      {inputs}
      {main}
      {education}
    </div>
  ),
  DetailCards: () => null,
  EducationPanel: () => null,
  InputsPanel: () => null,
  MoneyFlowChart: () => null,
  SidebarNav: () => null,
  SummaryCards: () => null,
  SurvivalModePanel: () => null,
}));

jest.mock('@/components/molecules/DirectorGuide/EmailResultsDialog', () => ({
  EmailResultsDialog: () => null,
}));

jest.mock('@/components/molecules/DirectorGuide/WelcomeDialog', () => ({
  DirectorGuideWelcomeDialog: () => null,
}));

describe('DirectorDashboard analytics', () => {
  const mockFormSlice = (overrides: Record<string, unknown>) => {
    const defaults = {
      mode: 'annual',
      region: undefined,
      revenue: undefined,
      includesVat: false,
      expenses: undefined,
      lossesBroughtForward: undefined,
      ytdSalary: undefined,
      ytdDividends: undefined,
      ytdDrawings: undefined,
      otherIncome: undefined,
      hasOtherPAYEEmployment: false,
      studentLoanPlans: [],
      pensionContribution: undefined,
      isPensionAlreadyDeducted: false,
      companyCarBIK: undefined,
      hasEmploymentAllowance: false,
      minimumSalaryRequirement: undefined,
      yourSetupSalary: undefined,
      yourSetupDividends: undefined,
      monthlyIncome: undefined,
      monthlyExpenses: undefined,
      contractStartMonth: undefined,
      cashInBank: undefined,
      minimumMonthlyDraw: undefined,
      runwayMonths: undefined,
    };

    (useDirectorFormSlice as unknown as jest.Mock).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector({ ...defaults, ...overrides }),
    );
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('tracks calculation_run once and schedules calculate when inputs become valid', () => {
    const mockCalculate = jest.fn();

    mockFormSlice({
      region: 'rUK',
      revenue: 100000,
      expenses: 20000,
      includesVat: false,
    });

    (useStrategyComparison as unknown as jest.Mock).mockReturnValue(null);
    (useMonthlyModeOutput as unknown as jest.Mock).mockReturnValue(null);

    (useDirectorGuideActions as unknown as jest.Mock).mockReturnValue({
      calculate: mockCalculate,
      reset: jest.fn(),
    });

    render(<DirectorDashboard />);

    expect(trackCalculationRun).toHaveBeenCalledTimes(1);
    expect(trackCalculationRun).toHaveBeenCalledWith({
      revenue: 100000,
      expenses: 20000,
      region: 'rUK',
      includesVat: false,
    });

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(mockCalculate).toHaveBeenCalledTimes(1);
  });

  test('tracks projected revenue/expenses in monthly mode', () => {
    const mockCalculate = jest.fn();

    mockFormSlice({
      mode: 'monthly',
      region: 'rUK',
      includesVat: false,
      monthlyIncome: 3000,
      monthlyExpenses: 1000,
      contractStartMonth: 10, // 6 months remaining
      revenue: undefined,
      expenses: undefined,
    });

    (useStrategyComparison as unknown as jest.Mock).mockReturnValue(null);
    (useMonthlyModeOutput as unknown as jest.Mock).mockReturnValue(null);

    (useDirectorGuideActions as unknown as jest.Mock).mockReturnValue({
      calculate: mockCalculate,
      reset: jest.fn(),
    });

    render(<DirectorDashboard />);

    expect(trackCalculationRun).toHaveBeenCalledTimes(1);
    expect(trackCalculationRun).toHaveBeenCalledWith({
      revenue: 18000,
      expenses: 6000,
      region: 'rUK',
      includesVat: false,
    });

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(mockCalculate).toHaveBeenCalledTimes(1);
  });
});
