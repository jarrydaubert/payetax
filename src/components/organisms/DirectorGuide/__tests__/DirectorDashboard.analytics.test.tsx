import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { trackCalculationRun } from '@/lib/directorGuideAnalytics';
import {
  useDirectorFormData,
  useDirectorGuideActions,
  useStrategyComparison,
} from '@/store/directorGuideStore';
import { DirectorDashboard } from '../DirectorDashboard';

jest.mock('@/lib/directorGuideAnalytics', () => ({
  trackGuideStarted: jest.fn(),
  trackResultsShown: jest.fn(),
  trackGuideReset: jest.fn(),
  trackCalculationRun: jest.fn(),
}));

jest.mock('@/store/directorGuideStore', () => ({
  useDirectorFormData: jest.fn(),
  useStrategyComparison: jest.fn(),
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
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('tracks calculation_run once and schedules calculate when inputs become valid', () => {
    const mockCalculate = jest.fn();

    (useDirectorFormData as unknown as jest.Mock).mockReturnValue({
      region: 'rUK',
      revenue: 100000,
      expenses: 20000,
      includesVat: false,
    });

    (useStrategyComparison as unknown as jest.Mock).mockReturnValue(null);

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
});
