import { fireEvent, render, screen, within } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { calculateSalaryScenario } from '@/lib/tax/strategyComparison';
import { useDirectorGuideStore } from '@/store/directorGuideStore';
import { DashboardLayout } from '../DashboardLayout';
import { DetailCards } from '../DetailCards';
import { MoneyFlowChart } from '../MoneyFlowChart';
import { SidebarNav } from '../SidebarNav';
import { SummaryCards } from '../SummaryCards';

jest.mock('@/lib/tax/strategyComparison', () => {
  const actual = jest.requireActual('@/lib/tax/strategyComparison');
  return {
    ...actual,
    calculateSalaryScenario: jest.fn(),
  };
});

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockCalculateSalaryScenario = calculateSalaryScenario as jest.Mock;

function createStrategy(name: string, overrides: Partial<Record<string, number | string>> = {}) {
  return {
    name,
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
    takeHome: 36000,
    effectiveRate: 25,
    ...overrides,
  };
}

function createComparison(overrides: Record<string, unknown> = {}) {
  return {
    grossProfit: 80000,
    grossProfitAfterPension: 80000,
    alreadyTaken: 0,
    availableForExtraction: 80000,
    strategies: {
      allSalary: createStrategy('All Salary', { takeHome: 32000 }),
      optimalMix: createStrategy('Baseline Mix', { salary: 12570, takeHome: 36000 }),
      allDividends: createStrategy('All Dividends', { salary: 0, takeHome: 30000 }),
    },
    recommended: 'optimalMix' as const,
    savingsVsAllSalary: 4000,
    ...overrides,
  };
}

function setStoreState(partial: Partial<ReturnType<typeof useDirectorGuideStore.getState>>) {
  useDirectorGuideStore.setState(partial as never);
}

describe('Director Guide dashboard components', () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue('/');
    const current = useDirectorGuideStore.getState();
    setStoreState({
      ...current,
      formData: {
        ...current.formData,
        region: 'rUK',
        revenue: 100000,
        expenses: 20000,
        pensionContribution: 0,
        otherIncome: 0,
        hasEmploymentAllowance: false,
        studentLoanPlans: [],
        companyCarBIK: 0,
      },
      strategyComparison: null,
      selectedStrategy: 'optimalMix',
      sliderSalary: null,
    });
    mockCalculateSalaryScenario.mockReset();
    mockCalculateSalaryScenario.mockReturnValue({
      salary: 20000,
      dividends: 15000,
      employerNI: 800,
      employeeNI: 400,
      incomeTax: 2500,
      corporationTax: 3000,
      dividendTax: 700,
      studentLoan: 0,
      pension: 0,
      companyCarBIK: 0,
      takeHome: 32000,
    });
  });

  describe('SummaryCards', () => {
    it('renders placeholders when no results', () => {
      render(<SummaryCards />);
      expect(screen.getByLabelText('Financial summary')).toBeInTheDocument();
      expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    });

    it('renders values when comparison exists', () => {
      setStoreState({ strategyComparison: createComparison() as never });

      render(<SummaryCards />);
      expect(screen.getByText('Safe Monthly Draw')).toBeInTheDocument();
      expect(screen.getByText('Annual Dividends')).toBeInTheDocument();
    });

    it('uses slider scenario when slider is active', () => {
      setStoreState({ strategyComparison: createComparison() as never, sliderSalary: 20000 });

      render(<SummaryCards />);
      expect(mockCalculateSalaryScenario).toHaveBeenCalled();
    });

    it('uses monthly safe draw output when in monthly mode', () => {
      const current = useDirectorGuideStore.getState();
      setStoreState({
        strategyComparison: createComparison() as never,
        formData: { ...current.formData, mode: 'monthly' },
        monthlyModeOutput: {
          monthsRemaining: 6,
          projectedRevenue: 18000,
          projectedExpenses: 6000,
          taxBasedMonthlyDraw: 3200,
          requiredBuffer: 4500,
          cashBasedCeiling: 2000,
          safeMonthlyDraw: 2200,
          shortfall: 0,
          hasBufferShortfall: false,
          hasContractEndRisk: false,
        } as never,
      });

      render(<SummaryCards />);
      expect(screen.getByText('£2,200')).toBeInTheDocument();
    });
  });

  describe('DetailCards', () => {
    it('renders salary, dividend, corporation, and summary cards', () => {
      setStoreState({ strategyComparison: createComparison() as never });

      render(<DetailCards />);
      expect(screen.getByText('Salary Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Dividend Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Corporation Tax')).toBeInTheDocument();
      expect(screen.getByText('Tax Summary')).toBeInTheDocument();
    });

    it('uses slider scenario when slider is active', () => {
      setStoreState({ strategyComparison: createComparison() as never, sliderSalary: 20000 });

      render(<DetailCards />);
      expect(mockCalculateSalaryScenario).toHaveBeenCalled();
    });
  });

  describe('MoneyFlowChart', () => {
    it('renders bar chart rows for profit allocation', () => {
      setStoreState({ strategyComparison: createComparison() as never });

      render(<MoneyFlowChart />);
      expect(screen.getByText('Money Flow')).toBeInTheDocument();
      expect(screen.getByText('Gross Profit')).toBeInTheDocument();
      expect(screen.getByText('Your Take-Home')).toBeInTheDocument();
      expect(screen.getByText('Company Taxes')).toBeInTheDocument();
      expect(screen.getByText('Retained')).toBeInTheDocument();
    });

    it('uses slider scenario when slider is active', () => {
      setStoreState({ strategyComparison: createComparison() as never, sliderSalary: 20000 });

      render(<MoneyFlowChart />);
      expect(mockCalculateSalaryScenario).toHaveBeenCalled();
    });
  });

  describe('DashboardLayout', () => {
    it('renders desktop panels and toggle buttons', () => {
      const handleInputs = jest.fn();
      const handleEducation = jest.fn();

      render(
        <DashboardLayout
          sidebar={<div>Sidebar</div>}
          inputs={<div>Inputs</div>}
          main={<div>Main</div>}
          education={<div>Education</div>}
          inputsCollapsed={true}
          educationCollapsed={true}
          onToggleInputs={handleInputs}
          onToggleEducation={handleEducation}
        />,
      );

      fireEvent.click(screen.getByLabelText('Show inputs panel'));
      fireEvent.click(screen.getByLabelText('Show learn panel'));

      expect(handleInputs).toHaveBeenCalled();
      expect(handleEducation).toHaveBeenCalled();
    });

    it('opens mobile drawers and closes via button', () => {
      const handleMobileInputs = jest.fn();

      render(
        <DashboardLayout
          sidebar={<div>Sidebar</div>}
          inputs={<div>Inputs</div>}
          main={<div>Main</div>}
          education={<div>Education</div>}
          mobileInputsOpen={true}
          onToggleMobileInputs={handleMobileInputs}
        />,
      );

      const mobileDrawer = screen.getByRole('dialog');
      expect(mobileDrawer).toBeInTheDocument();
      expect(within(mobileDrawer).getByText('Your Numbers').parentElement).toHaveClass(
        'pt-[calc(env(safe-area-inset-top,0px)+0.75rem)]',
      );

      const closeButton = screen.getByLabelText('Close your numbers panel');
      expect(closeButton).toHaveClass('h-11', 'w-11');
      expect(mobileDrawer.querySelector('div.flex-1.overflow-y-auto')).toHaveClass(
        'pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]',
      );

      fireEvent.click(screen.getByLabelText('Close your numbers panel'));
      expect(handleMobileInputs).toHaveBeenCalled();
    });
  });

  describe('SidebarNav', () => {
    it('shows workflow links only when dashboard variant is available', () => {
      const { rerender } = render(<SidebarNav />);
      expect(screen.queryByText('Workflow')).not.toBeInTheDocument();

      rerender(<SidebarNav dashboardVariant='normal' />);
      expect(screen.getByText('Workflow')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Summary' })).toBeInTheDocument();
    });

    it('calls reset handler from actions', () => {
      const handleReset = jest.fn();
      render(<SidebarNav onReset={handleReset} />);

      fireEvent.click(screen.getByRole('button', { name: 'Reset Guide' }));
      expect(handleReset).toHaveBeenCalledTimes(1);
    });

    it('scrolls main container when workflow link is clicked', () => {
      const mainScroll = document.createElement('div');
      mainScroll.setAttribute('data-director-scroll-root', 'true');
      Object.defineProperty(mainScroll, 'scrollTop', {
        value: 180,
        writable: true,
      });
      Object.defineProperty(mainScroll, 'scrollTo', {
        value: jest.fn(),
      });
      Object.defineProperty(mainScroll, 'getBoundingClientRect', {
        value: () => ({
          top: 100,
          left: 0,
          right: 1000,
          bottom: 800,
          width: 1000,
          height: 700,
          x: 0,
          y: 100,
          toJSON: () => ({}),
        }),
      });
      document.body.appendChild(mainScroll);

      const section = document.createElement('section');
      section.setAttribute('data-director-section', 'director-summary');
      Object.defineProperty(section, 'getBoundingClientRect', {
        value: () => ({
          top: 360,
          left: 0,
          right: 1000,
          bottom: 420,
          width: 1000,
          height: 60,
          x: 0,
          y: 360,
          toJSON: () => ({}),
        }),
      });
      document.body.appendChild(section);

      render(<SidebarNav dashboardVariant='normal' />);

      fireEvent.click(screen.getByRole('button', { name: 'Summary' }));

      expect(mainScroll.scrollTo).toHaveBeenCalled();
      mainScroll.remove();
      section.remove();
    });
  });
});
