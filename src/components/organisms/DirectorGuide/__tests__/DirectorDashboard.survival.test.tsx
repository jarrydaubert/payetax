import { render, screen } from '@testing-library/react';
import { useDirectorGuideStore } from '@/store/directorGuideStore';
import { DirectorDashboard } from '../DirectorDashboard';

jest.mock('@/lib/directorGuideAnalytics', () => ({
  trackGuideReset: jest.fn(),
  trackGuideStarted: jest.fn(),
  trackResultsShown: jest.fn(),
  trackModeChanged: jest.fn(),
  trackSafeDrawCalculated: jest.fn(),
  trackBufferShortfallShown: jest.fn(),
}));

jest.mock('@/components/molecules/DirectorGuide/WelcomeDialog', () => ({
  DirectorGuideWelcomeDialog: () => null,
}));

function createEmptyComparison(grossProfit: number) {
  const emptyStrategy = {
    name: '—',
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
    availableForExtraction: 0,
    strategies: {
      allSalary: { ...emptyStrategy, name: 'All Salary' },
      optimalMix: { ...emptyStrategy, name: 'Baseline Mix' },
      allDividends: { ...emptyStrategy, name: 'All Dividends' },
    },
    recommended: 'optimalMix' as const,
    savingsVsAllSalary: 0,
  };
}

describe('DirectorDashboard (Survival Mode)', () => {
  beforeEach(() => {
    const current = useDirectorGuideStore.getState();
    useDirectorGuideStore.setState({
      // Avoid auto-calculate side effects by keeping required inputs undefined.
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

  test('renders Survival Mode state and hides strategy UI when profit <= 0', () => {
    useDirectorGuideStore.setState({
      strategyComparison: createEmptyComparison(0) as never,
    } as never);

    render(<DirectorDashboard />);

    expect(screen.getByTestId('director-survival-mode')).toBeInTheDocument();
    expect(screen.getByText('Survival Mode')).toBeInTheDocument();
    expect(screen.getByText('Key Dates')).toBeInTheDocument();

    // These are only meaningful when there is positive profit.
    expect(screen.queryByText(/Drag to explore different salary levels/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Choose Your Strategy')).not.toBeInTheDocument();
  });
});
