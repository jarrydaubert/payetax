import { fireEvent, render, screen } from '@testing-library/react';
import { trackCalendarDownloaded, trackStrategySelected } from '@/lib/directorGuideAnalytics';
import { calculateSalaryScenario } from '@/lib/tax/strategyComparison';
import { useDirectorGuideStore } from '@/store/directorGuideStore';
import { KeyDates } from '../KeyDates';
import { PensionGapWarning } from '../PensionGapWarning';
import { SalarySlider } from '../SalarySlider';
import { StrategyComparisonTable } from '../StrategyComparisonTable';
import { TaxBreakdownTable } from '../TaxBreakdownTable';
import { TaxPots } from '../TaxPots';

jest.mock('@/lib/tax/strategyComparison', () => {
  const actual = jest.requireActual('@/lib/tax/strategyComparison');
  return {
    ...actual,
    calculateSalaryScenario: jest.fn(),
  };
});

jest.mock('@/components/ui/slider', () => ({
  Slider: ({
    'data-testid': testId,
    value,
    onValueChange,
    min,
    max,
    step,
  }: {
    'data-testid'?: string;
    value: number[];
    onValueChange: (v: number[]) => void;
    min: number;
    max: number;
    step?: number;
  }) => (
    <button
      type='button'
      data-testid={testId ?? 'slider'}
      data-value={value?.[0]}
      data-min={min}
      data-max={max}
      data-step={step}
      onClick={() => onValueChange([testId === 'director-profit-slider' ? 10 : 20000])}
    />
  ),
}));

jest.mock('@/lib/directorGuideAnalytics', () => ({
  trackStrategySelected: jest.fn(),
  trackCalendarDownloaded: jest.fn(),
}));

const mockCalculateSalaryScenario = calculateSalaryScenario as jest.Mock;
const mockTrackStrategySelected = trackStrategySelected as jest.MockedFunction<
  typeof trackStrategySelected
>;
const mockTrackCalendarDownloaded = trackCalendarDownloaded as jest.MockedFunction<
  typeof trackCalendarDownloaded
>;

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
    takeHome: 35000,
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
      optimalMix: createStrategy('Baseline Mix', {
        salary: 7000,
        takeHome: 36000,
        totalPersonalTax: 1500,
      }),
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

describe('Director Guide calculator components', () => {
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
      profitWhatIfPercent: 0,
    });
    mockCalculateSalaryScenario.mockReset();
    mockTrackStrategySelected.mockClear();
    mockTrackCalendarDownloaded.mockClear();
    mockCalculateSalaryScenario.mockReturnValue({
      salary: 20000,
      dividends: 15000,
      employerNI: 800,
      employeeNI: 400,
      incomeTax: 2500,
      corporationTax: 3000,
      dividendTax: 700,
      studentLoan: 200,
      pension: 0,
      companyCarBIK: 0,
      takeHome: 32000,
    });
  });

  describe('PensionGapWarning', () => {
    it('shows qualifying status when salary is above LEL', () => {
      setStoreState({
        strategyComparison: createComparison({
          strategies: {
            allSalary: createStrategy('All Salary'),
            optimalMix: createStrategy('Baseline Mix', { salary: 7000 }),
            allDividends: createStrategy('All Dividends'),
          },
        }) as never,
      });

      render(<PensionGapWarning />);
      expect(screen.getByText(/State Pension: Qualifying Year/i)).toBeInTheDocument();
    });

    it('warns about the gap zone between NI threshold and LEL', () => {
      setStoreState({
        strategyComparison: createComparison({
          strategies: {
            allSalary: createStrategy('All Salary'),
            optimalMix: createStrategy('Baseline Mix', { salary: 5500 }),
            allDividends: createStrategy('All Dividends'),
          },
        }) as never,
      });

      render(<PensionGapWarning />);
      expect(screen.getByText(/Inefficient Salary Zone/i)).toBeInTheDocument();
    });

    it('shows neutral info when salary is below threshold', () => {
      setStoreState({
        strategyComparison: createComparison({
          strategies: {
            allSalary: createStrategy('All Salary'),
            optimalMix: createStrategy('Baseline Mix', { salary: 0 }),
            allDividends: createStrategy('All Dividends'),
          },
        }) as never,
      });

      render(<PensionGapWarning />);
      expect(screen.getByText(/No Credits This Year/i)).toBeInTheDocument();
    });
  });

  describe('SalarySlider', () => {
    it('initializes salary slider to baseline salary and updates on change', () => {
      setStoreState({ strategyComparison: createComparison() as never });

      render(<SalarySlider />);
      const salarySlider = screen.getByTestId('director-salary-slider');
      const profitSlider = screen.getByTestId('director-profit-slider');

      expect(salarySlider.getAttribute('data-value')).toBe('7000');
      expect(profitSlider.getAttribute('data-value')).toBe('0');

      fireEvent.click(salarySlider);
      expect(useDirectorGuideStore.getState().sliderSalary).toBe(20000);

      fireEvent.click(profitSlider);
      expect(useDirectorGuideStore.getState().profitWhatIfPercent).toBe(10);
    });
  });

  describe('StrategyComparisonTable', () => {
    it('renders strategies and baseline message when near baseline', () => {
      setStoreState({ strategyComparison: createComparison() as never });

      render(<StrategyComparisonTable />);
      expect(screen.getByText('Choose Your Strategy')).toBeInTheDocument();
      expect(screen.getByText(/Closest to the baseline mix/i)).toBeInTheDocument();
      expect(screen.getByText('Highest Take-Home')).toBeInTheDocument();
    });

    it('shows costing message and Your Setup warning when applicable', () => {
      const comparison = createComparison({
        strategies: {
          allSalary: createStrategy('All Salary'),
          optimalMix: createStrategy('Baseline Mix', {
            totalPersonalTax: 100,
            employerNI: 100,
            corporationTax: 100,
          }),
          allDividends: createStrategy('All Dividends'),
          yourSetup: {
            ...createStrategy('Your Setup', { salary: 30000, dividends: 40000 }),
            deltaVsOptimal: 1500,
            exceedsProfit: true,
          },
        },
      });

      setStoreState({ strategyComparison: comparison as never, sliderSalary: 20000 });

      render(<StrategyComparisonTable />);
      expect(screen.getByText(/Pays £1,500 more tax than baseline per year/i)).toBeInTheDocument();
      expect(screen.getByText('Your Setup')).toBeInTheDocument();
      expect(screen.getByText(/Exceeds Profit/i)).toBeInTheDocument();
    });

    it('tracks pro strategy selection when a card is clicked', () => {
      setStoreState({ strategyComparison: createComparison() as never });

      render(<StrategyComparisonTable />);
      fireEvent.click(screen.getByRole('button', { name: /All Salary/i }));

      expect(mockTrackStrategySelected).toHaveBeenCalledWith('allSalary', false);
    });
  });

  describe('KeyDates', () => {
    it('downloads an iCal file and tracks calendar download analytics', () => {
      const current = useDirectorGuideStore.getState();
      setStoreState({
        formData: {
          ...current.formData,
          yearEndMonth: '03',
          yearEndCustom: '',
        },
      });

      const createObjectURLMock = jest.fn(() => 'blob:payetax-calendar');
      const revokeObjectURLMock = jest.fn();
      const originalCreateObjectURL = URL.createObjectURL;
      const originalRevokeObjectURL = URL.revokeObjectURL;
      Object.defineProperty(URL, 'createObjectURL', {
        configurable: true,
        writable: true,
        value: createObjectURLMock,
      });
      Object.defineProperty(URL, 'revokeObjectURL', {
        configurable: true,
        writable: true,
        value: revokeObjectURLMock,
      });

      const anchorClickSpy = jest
        .spyOn(HTMLAnchorElement.prototype, 'click')
        .mockImplementation(() => {});

      try {
        render(<KeyDates />);
        fireEvent.click(screen.getByRole('button', { name: /Download \.ics/i }));

        expect(createObjectURLMock).toHaveBeenCalledTimes(1);
        expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:payetax-calendar');
        expect(mockTrackCalendarDownloaded).toHaveBeenCalledTimes(1);
      } finally {
        anchorClickSpy.mockRestore();
        Object.defineProperty(URL, 'createObjectURL', {
          configurable: true,
          writable: true,
          value: originalCreateObjectURL,
        });
        Object.defineProperty(URL, 'revokeObjectURL', {
          configurable: true,
          writable: true,
          value: originalRevokeObjectURL,
        });
      }
    });
  });

  describe('TaxBreakdownTable', () => {
    it('renders student loan row when plans selected', () => {
      setStoreState({
        formData: { ...useDirectorGuideStore.getState().formData, studentLoanPlans: ['plan1'] },
        strategyComparison: createComparison() as never,
      });

      render(<TaxBreakdownTable />);
      expect(screen.getByText('Detailed Tax Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Student Loan')).toBeInTheDocument();
    });
  });

  describe('TaxPots', () => {
    it('renders company and personal pots with monthly totals', () => {
      setStoreState({ strategyComparison: createComparison() as never });

      render(<TaxPots />);
      expect(screen.getByText('Company Tax Pot')).toBeInTheDocument();
      expect(screen.getByText('Personal Tax Pot')).toBeInTheDocument();
      expect(screen.getByText(/Illustrative set-aside/i)).toBeInTheDocument();
    });

    it('uses slider scenario values when slider is active', () => {
      setStoreState({ strategyComparison: createComparison() as never, sliderSalary: 20000 });

      render(<TaxPots />);
      expect(mockCalculateSalaryScenario).toHaveBeenCalled();
      expect(screen.getByText('Personal Tax Pot')).toBeInTheDocument();
    });
  });
});
