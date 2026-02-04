import { fireEvent, render, screen } from '@testing-library/react';
import { calculateSalaryScenario } from '@/lib/tax/strategyComparison';
import { useDirectorGuideStore } from '@/store/directorGuideStore';
import { DashboardLayout } from '../DashboardLayout';
import { DetailCards } from '../DetailCards';
import { MoneyFlowChart } from '../MoneyFlowChart';
import { SummaryCards } from '../SummaryCards';

jest.mock('@/lib/tax/strategyComparison', () => {
  const actual = jest.requireActual('@/lib/tax/strategyComparison');
  return {
    ...actual,
    calculateSalaryScenario: jest.fn(),
  };
});

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

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Close your numbers panel'));
      expect(handleMobileInputs).toHaveBeenCalled();
    });
  });
});
