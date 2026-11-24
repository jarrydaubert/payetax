import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { trackCalculationRun } from '@/lib/directorGuideAnalytics';
import { useDirectorGuideStore } from '@/store/directorGuideStore';
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

jest.mock('@/components/molecules/DirectorGuide/useDirectorEmailUnavailableReason', () => ({
  useDirectorEmailUnavailableReason: () => null,
}));

jest.mock('@/components/molecules/DirectorGuide/calculator/useActiveDirectorScenario', () => ({
  useActiveDirectorScenario: () => ({ activeScenario: null }),
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
  InputsPanel: ({ onCalculate }: { onCalculate: () => void }) => (
    <button type='button' onClick={onCalculate}>
      Calculate
    </button>
  ),
  MoneyFlowChart: () => null,
  RecommendationHero: () => null,
  SidebarNav: () => null,
  SummaryCards: () => null,
  SurvivalModePanel: () => null,
}));

jest.mock('@/components/molecules/DirectorGuide/EmailResultsDialog', () => ({
  EmailResultsDialog: () => null,
}));

describe('DirectorDashboard calculation telemetry', () => {
  beforeEach(() => {
    useDirectorGuideStore.getState().clearStaleState();
    jest.clearAllMocks();
  });

  test('counts only explicit, figure-free Calculate attempts, including invalid attempts and retries', () => {
    const store = useDirectorGuideStore.getState();
    render(<DirectorDashboard />);
    const calculate = screen.getByRole('button', { name: 'Calculate' });

    expect(trackCalculationRun).not.toHaveBeenCalled();
    fireEvent.click(calculate);
    expect(useDirectorGuideStore.getState().error).toBe('Please select your region');

    act(() => {
      store.setMode('monthly');
      store.setRegion('rUK');
      store.setMonthlyIncome(3000);
      store.setMonthlyExpenses(1000);
      store.setContractStartMonth(10);
    });
    expect(trackCalculationRun).toHaveBeenCalledTimes(1);
    expect(useDirectorGuideStore.getState().strategyComparison).toBeNull();

    fireEvent.click(calculate);
    expect(useDirectorGuideStore.getState().monthlyModeOutput?.monthsRemaining).toBe(6);
    expect(trackCalculationRun).toHaveBeenCalledTimes(2);
    expect(trackCalculationRun).toHaveBeenNthCalledWith(1);
    expect(trackCalculationRun).toHaveBeenNthCalledWith(2);

    act(() => store.reset());
    expect(trackCalculationRun).toHaveBeenCalledTimes(2);
  });
});
