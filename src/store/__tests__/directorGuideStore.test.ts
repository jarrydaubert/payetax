// src/store/__tests__/directorGuideStore.test.ts
/**
 * Tests for Director Guide Store
 *
 * Post-merge: Removed step wizard tests, added strategy comparison tests.
 */

import { calculateDirectorScenario } from '@/lib/tax/directorCalculator';
import { calculateStrategyComparison } from '@/lib/tax/strategyComparison';
import { DIRECTOR_TAX_YEARS } from '@/lib/validation/directorValidation';
import { useDirectorGuideStore } from '../directorGuideStore';

// Mock the director calculator
jest.mock('@/lib/tax/directorCalculator', () => ({
  calculateDirectorScenario: jest.fn().mockReturnValue({
    mode: 'normal',
    grossRevenue: 100000,
    netRevenue: 100000,
    grossProfit: 80000,
    salary: 12570,
    employerNI: 1135.5,
    corporationTax: 15000,
    dividendsAvailable: 51294.5,
    dividendTax: 5000,
    averageMonthlyPay: 4905.38,
    companyTaxPot: 16135.5,
    warnings: [],
    taxYear: '2025-2026',
    region: 'rUK',
  }),
}));

// Mock strategy comparison
jest.mock('@/lib/tax/strategyComparison', () => ({
  calculateStrategyComparison: jest.fn().mockReturnValue({
    grossProfit: 80000,
    grossProfitAfterPension: 80000,
    strategies: {
      allSalary: {
        name: 'All Salary',
        salary: 80000,
        dividends: 0,
        takeHome: 55000,
        effectiveRate: 31,
      },
      optimalMix: {
        name: 'Baseline Mix',
        salary: 12570,
        dividends: 50000,
        takeHome: 60000,
        effectiveRate: 25,
      },
      allDividends: {
        name: 'All Dividends',
        salary: 0,
        dividends: 60000,
        takeHome: 58000,
        effectiveRate: 27,
      },
    },
    recommended: 'optimalMix',
    savingsVsAllSalary: 5000,
  }),
}));

const mockCalculateDirectorScenario = calculateDirectorScenario as jest.Mock;
const mockCalculateStrategyComparison = calculateStrategyComparison as jest.Mock;
const DIRECTOR_STORAGE_KEY = 'director-guide-storage';

describe('DirectorGuideStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useDirectorGuideStore.getState().reset();
    mockCalculateDirectorScenario.mockClear();
    mockCalculateStrategyComparison.mockClear();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const state = useDirectorGuideStore.getState();
      expect(state.formData.region).toBeUndefined();
      expect(state.formData.mode).toBe('annual');
      expect(state.formData.revenue).toBeUndefined();
      expect(state.formData.expenses).toBeUndefined();
      expect(state.formData.ytdSalary).toBe(0);
      expect(state.formData.ytdDividends).toBe(0);
      expect(state.formData.ytdDrawings).toBe(0);
      expect(state.formData.otherIncome).toBe(0);
      expect(state.formData.studentLoanPlans).toEqual([]);
      expect(state.formData.pensionContribution).toBe(0);
      expect(state.formData.companyCarBIK).toBe(0);
      expect(state.formData.hasEmploymentAllowance).toBe(false);
      expect(state.formData.monthlyIncome).toBeUndefined();
      expect(state.formData.monthlyExpenses).toBeUndefined();
      expect(state.formData.contractStartMonth).toBe(4);
      expect(state.formData.runwayMonths).toBe(3);
      expect(state.results).toBeNull();
      expect(state.strategyComparison).toBeNull();
      expect(state.monthlyModeOutput).toBeNull();
    });
  });

  describe('Form Data Actions', () => {
    it('should set mode', () => {
      useDirectorGuideStore.getState().setMode('monthly');
      expect(useDirectorGuideStore.getState().formData.mode).toBe('monthly');
    });

    it('should set region', () => {
      useDirectorGuideStore.getState().setRegion('scotland');
      expect(useDirectorGuideStore.getState().formData.region).toBe('scotland');
    });

    it('should set revenue', () => {
      useDirectorGuideStore.getState().setRevenue(100000);
      expect(useDirectorGuideStore.getState().formData.revenue).toBe(100000);
    });

    it('should clear revenue', () => {
      const store = useDirectorGuideStore.getState();
      store.setRevenue(100000);
      store.setRevenue(undefined);
      expect(useDirectorGuideStore.getState().formData.revenue).toBeUndefined();
    });

    it('should reject negative revenue', () => {
      useDirectorGuideStore.getState().setRevenue(-5000);
      expect(useDirectorGuideStore.getState().formData.revenue).toBeUndefined();
    });

    it('should reject NaN revenue', () => {
      useDirectorGuideStore.getState().setRevenue(Number.NaN);
      expect(useDirectorGuideStore.getState().formData.revenue).toBeUndefined();
    });

    it('should set expenses', () => {
      useDirectorGuideStore.getState().setExpenses(20000);
      expect(useDirectorGuideStore.getState().formData.expenses).toBe(20000);
    });

    it('should clear expenses', () => {
      const store = useDirectorGuideStore.getState();
      store.setExpenses(20000);
      store.setExpenses(undefined);
      expect(useDirectorGuideStore.getState().formData.expenses).toBeUndefined();
    });

    it('should set includesVat', () => {
      useDirectorGuideStore.getState().setIncludesVat(true);
      expect(useDirectorGuideStore.getState().formData.includesVat).toBe(true);
    });

    it('should set ytdSalary', () => {
      useDirectorGuideStore.getState().setYtdSalary(5000);
      expect(useDirectorGuideStore.getState().formData.ytdSalary).toBe(5000);
    });

    it('should reject negative ytdSalary', () => {
      useDirectorGuideStore.getState().setYtdSalary(5000);
      useDirectorGuideStore.getState().setYtdSalary(-1000);
      expect(useDirectorGuideStore.getState().formData.ytdSalary).toBe(5000);
    });

    it('should set ytdDividends', () => {
      useDirectorGuideStore.getState().setYtdDividends(10000);
      expect(useDirectorGuideStore.getState().formData.ytdDividends).toBe(10000);
    });

    it('should set ytdDrawings', () => {
      useDirectorGuideStore.getState().setYtdDrawings(2000);
      expect(useDirectorGuideStore.getState().formData.ytdDrawings).toBe(2000);
    });

    it('should reject Infinity revenue', () => {
      useDirectorGuideStore.getState().setRevenue(Number.POSITIVE_INFINITY);
      expect(useDirectorGuideStore.getState().formData.revenue).toBeUndefined();
    });

    it('should reject negative expenses', () => {
      useDirectorGuideStore.getState().setExpenses(-500);
      expect(useDirectorGuideStore.getState().formData.expenses).toBeUndefined();
    });

    it('should set otherIncome', () => {
      useDirectorGuideStore.getState().setOtherIncome(25000);
      expect(useDirectorGuideStore.getState().formData.otherIncome).toBe(25000);
    });

    it('should toggle student loan plans', () => {
      useDirectorGuideStore.getState().toggleStudentLoanPlan('plan1');
      expect(useDirectorGuideStore.getState().formData.studentLoanPlans).toContain('plan1');

      useDirectorGuideStore.getState().toggleStudentLoanPlan('plan1');
      expect(useDirectorGuideStore.getState().formData.studentLoanPlans).not.toContain('plan1');
    });

    it('should not allow Plan 5 into state (not active for 2025-26)', () => {
      useDirectorGuideStore.getState().toggleStudentLoanPlan('plan5');
      expect(useDirectorGuideStore.getState().formData.studentLoanPlans).not.toContain('plan5');

      useDirectorGuideStore.getState().setStudentLoanPlans(['plan1', 'plan5']);
      expect(useDirectorGuideStore.getState().formData.studentLoanPlans).toEqual(['plan1']);
    });

    it('should set pension contribution', () => {
      useDirectorGuideStore.getState().setPensionContribution(10000);
      expect(useDirectorGuideStore.getState().formData.pensionContribution).toBe(10000);
    });

    it('should set pension already deducted flag', () => {
      useDirectorGuideStore.getState().setIsPensionAlreadyDeducted(true);
      expect(useDirectorGuideStore.getState().formData.isPensionAlreadyDeducted).toBe(true);
    });

    it('should set company car BIK', () => {
      useDirectorGuideStore.getState().setCompanyCarBIK(3600);
      expect(useDirectorGuideStore.getState().formData.companyCarBIK).toBe(3600);
    });

    it('should set employment allowance', () => {
      useDirectorGuideStore.getState().setHasEmploymentAllowance(true);
      expect(useDirectorGuideStore.getState().formData.hasEmploymentAllowance).toBe(true);
    });

    it('should set year-end month', () => {
      useDirectorGuideStore.getState().setYearEndMonth('12');
      expect(useDirectorGuideStore.getState().formData.yearEndMonth).toBe('12');
    });

    it('should set minimum salary requirement', () => {
      useDirectorGuideStore.getState().setMinimumSalaryRequirement(25000);
      expect(useDirectorGuideStore.getState().formData.minimumSalaryRequirement).toBe(25000);
    });

    it('should set monthly mode fields', () => {
      const store = useDirectorGuideStore.getState();
      store.setMonthlyIncome(3000);
      store.setMonthlyExpenses(1000);
      store.setContractStartMonth(10);
      store.setCashInBank(5000);
      store.setMinimumMonthlyDraw(1200);
      store.setRunwayMonths(4);

      const state = useDirectorGuideStore.getState();
      expect(state.formData.monthlyIncome).toBe(3000);
      expect(state.formData.monthlyExpenses).toBe(1000);
      expect(state.formData.contractStartMonth).toBe(10);
      expect(state.formData.cashInBank).toBe(5000);
      expect(state.formData.minimumMonthlyDraw).toBe(1200);
      expect(state.formData.runwayMonths).toBe(4);
    });

    it('should clear monthly income and expenses', () => {
      const store = useDirectorGuideStore.getState();
      store.setMonthlyIncome(3000);
      store.setMonthlyExpenses(1000);
      store.setMonthlyIncome(undefined);
      store.setMonthlyExpenses(undefined);

      const state = useDirectorGuideStore.getState();
      expect(state.formData.monthlyIncome).toBeUndefined();
      expect(state.formData.monthlyExpenses).toBeUndefined();
    });
  });

  describe('Calculation', () => {
    it('should not calculate without required fields', () => {
      useDirectorGuideStore.getState().calculate();
      expect(useDirectorGuideStore.getState().results).toBeNull();
    });

    it('should calculate with all required fields', () => {
      const store = useDirectorGuideStore.getState();
      store.setRegion('rUK');
      store.setRevenue(100000);
      store.setExpenses(20000);

      useDirectorGuideStore.getState().calculate();

      const state = useDirectorGuideStore.getState();
      expect(state.results).not.toBeNull();
      expect(state.strategyComparison).not.toBeNull();
    });

    it('should pass already taken total and payroll flag to calculator', () => {
      // Bug caught: misclassified payroll flag or incorrect totals used for warnings.
      const store = useDirectorGuideStore.getState();
      store.setRegion('rUK');
      store.setRevenue(100000);
      store.setExpenses(20000);
      store.setYtdSalary(5000);
      store.setYtdDividends(2000);
      store.setYtdDrawings(1000);

      store.calculate();

      const input = mockCalculateDirectorScenario.mock.calls[0][0];
      expect(input.alreadyTaken).toBe(8000);
      expect(input.alreadyTakenViaPayroll).toBe(true);
    });

    it('should pass drawings-only as non-payroll already taken', () => {
      // Bug caught: drawings treated as PAYE salary.
      const store = useDirectorGuideStore.getState();
      store.setRegion('rUK');
      store.setRevenue(100000);
      store.setExpenses(20000);
      store.setYtdDrawings(1500);

      store.calculate();

      const input = mockCalculateDirectorScenario.mock.calls[0][0];
      expect(input.alreadyTaken).toBe(1500);
      expect(input.alreadyTakenViaPayroll).toBe(false);
    });

    it('should treat dividends-only as unknown payroll status', () => {
      // Bug caught: dividends incorrectly flagging payroll usage.
      const store = useDirectorGuideStore.getState();
      store.setRegion('rUK');
      store.setRevenue(100000);
      store.setExpenses(20000);
      store.setYtdDividends(2500);

      store.calculate();

      const input = mockCalculateDirectorScenario.mock.calls[0][0];
      expect(input.alreadyTaken).toBe(2500);
      expect(input.alreadyTakenViaPayroll).toBeNull();
    });

    it('should drop pension contribution when already deducted from profit', () => {
      // Bug caught: double-counting pension reducing profit.
      const store = useDirectorGuideStore.getState();
      store.setRegion('rUK');
      store.setRevenue(100000);
      store.setExpenses(20000);
      store.setPensionContribution(10000);
      store.setIsPensionAlreadyDeducted(true);

      store.calculate();

      for (const call of mockCalculateStrategyComparison.mock.calls) {
        expect(call[0].pensionContribution).toBe(0);
      }
    });

    it('should pass pension contribution when not already deducted', () => {
      const store = useDirectorGuideStore.getState();
      store.setRegion('rUK');
      store.setRevenue(100000);
      store.setExpenses(20000);
      store.setPensionContribution(8000);

      store.calculate();

      for (const call of mockCalculateStrategyComparison.mock.calls) {
        expect(call[0].pensionContribution).toBe(8000);
      }
    });

    it('should keep Your Setup empty when not provided', () => {
      const store = useDirectorGuideStore.getState();
      store.setRegion('rUK');
      store.setRevenue(100000);
      store.setExpenses(20000);

      store.calculate();

      const state = useDirectorGuideStore.getState();
      expect(state.formData.yourSetupSalary).toBeUndefined();
      expect(state.formData.yourSetupDividends).toBeUndefined();
      expect(state.strategyComparison?.strategies.yourSetup).toBeUndefined();
    });

    it('should respect user-provided Your Setup values', () => {
      const store = useDirectorGuideStore.getState();
      store.setRegion('rUK');
      store.setRevenue(100000);
      store.setExpenses(20000);
      store.setYourSetupSalary(30000);
      store.setYourSetupDividends(40000);

      store.calculate();

      const state = useDirectorGuideStore.getState();
      expect(state.formData.yourSetupSalary).toBe(30000);
      expect(state.formData.yourSetupDividends).toBe(40000);
    });

    it('should pass other PAYE flag into strategy comparison', () => {
      // Bug caught: NI thresholds not adjusted for other PAYE employment.
      const store = useDirectorGuideStore.getState();
      store.setRegion('rUK');
      store.setRevenue(100000);
      store.setExpenses(20000);
      store.setHasOtherPAYEEmployment(true);

      store.calculate();

      const call = mockCalculateStrategyComparison.mock.calls[0][0];
      expect(call.hasOtherPAYEEmployment).toBe(true);
    });

    it('should project monthly inputs before strategy comparison', () => {
      const store = useDirectorGuideStore.getState();
      store.setMode('monthly');
      store.setRegion('rUK');
      store.setMonthlyIncome(3000);
      store.setMonthlyExpenses(1000);
      store.setContractStartMonth(10); // 6 months remaining
      store.setCashInBank(10000);
      store.setMinimumMonthlyDraw(1000);
      store.setRunwayMonths(3);

      store.calculate();

      const strategyInput = mockCalculateStrategyComparison.mock.calls[0][0];
      expect(strategyInput.revenue).toBe(18000);
      expect(strategyInput.expenses).toBe(6000);

      const state = useDirectorGuideStore.getState();
      expect(state.monthlyModeOutput).not.toBeNull();
      expect(state.monthlyModeOutput?.monthsRemaining).toBe(6);
    });

    it('should return a validation error for invalid monthly start month data', () => {
      const store = useDirectorGuideStore.getState();
      useDirectorGuideStore.setState({
        formData: {
          ...store.formData,
          mode: 'monthly',
          region: 'rUK',
          monthlyIncome: 3000,
          monthlyExpenses: 1000,
          contractStartMonth: 13, // Simulate stale/corrupt persisted state
        },
      } as never);

      store.calculate();

      expect(useDirectorGuideStore.getState().error).toBe(
        'Please select a valid contract start month',
      );
      expect(mockCalculateStrategyComparison).not.toHaveBeenCalled();
    });

    it('should floor safe monthly draw to minimum draw when buffer is short', () => {
      const store = useDirectorGuideStore.getState();
      store.setMode('monthly');
      store.setRegion('rUK');
      store.setMonthlyIncome(3000);
      store.setMonthlyExpenses(1000);
      store.setContractStartMonth(10); // 6 months
      store.setCashInBank(0);
      store.setMinimumMonthlyDraw(900);
      store.setRunwayMonths(3);

      store.calculate();

      const state = useDirectorGuideStore.getState();
      expect(state.monthlyModeOutput).not.toBeNull();
      expect(state.monthlyModeOutput?.safeMonthlyDraw).toBe(900);
      expect(state.monthlyModeOutput?.hasBufferShortfall).toBe(true);
    });
  });

  describe('Strategy Selection', () => {
    it('should set selected strategy', () => {
      useDirectorGuideStore.getState().setSelectedStrategy('allDividends');
      expect(useDirectorGuideStore.getState().selectedStrategy).toBe('allDividends');
    });

    it('should set slider salary', () => {
      useDirectorGuideStore.getState().setSliderSalary(25000);
      expect(useDirectorGuideStore.getState().sliderSalary).toBe(25000);
    });

    it('should reset slider salary to null', () => {
      useDirectorGuideStore.getState().setSliderSalary(25000);
      useDirectorGuideStore.getState().setSliderSalary(null);
      expect(useDirectorGuideStore.getState().sliderSalary).toBeNull();
    });
  });

  describe('Reset', () => {
    it('should reset to initial state', () => {
      const store = useDirectorGuideStore.getState();
      store.setRegion('scotland');
      store.setRevenue(50000);
      store.setExpenses(10000);
      store.setOtherIncome(5000);
      store.toggleStudentLoanPlan('plan2');

      useDirectorGuideStore.getState().reset();

      const state = useDirectorGuideStore.getState();
      expect(state.formData.region).toBeUndefined();
      expect(state.formData.revenue).toBeUndefined();
      expect(state.formData.otherIncome).toBe(0);
      expect(state.formData.studentLoanPlans).toEqual([]);
      expect(state.strategyComparison).toBeNull();
    });
  });

  describe('Persisted State Hydration Guards', () => {
    it('should ignore tampered persisted form data that fails schema validation', async () => {
      useDirectorGuideStore.getState().setMonthlyIncome(2500);

      localStorage.setItem(
        DIRECTOR_STORAGE_KEY,
        JSON.stringify({
          state: {
            formData: {
              mode: 'monthly',
              monthlyIncome: 4000,
              contractStartMonth: 13,
            },
            selectedStrategy: 'allDividends',
            _savedAt: Date.now(),
            _taxYear: DIRECTOR_TAX_YEARS[0],
          },
          version: 4,
        }),
      );

      await useDirectorGuideStore.persist.rehydrate();

      const state = useDirectorGuideStore.getState();
      expect(state.formData.monthlyIncome).toBe(2500);
      expect(state.selectedStrategy).toBe('optimalMix');
    });

    it('should sanitize disallowed student loan plans from persisted state', async () => {
      localStorage.setItem(
        DIRECTOR_STORAGE_KEY,
        JSON.stringify({
          state: {
            formData: {
              studentLoanPlans: ['plan1', 'plan5'],
            },
            _savedAt: Date.now(),
            _taxYear: DIRECTOR_TAX_YEARS[0],
          },
          version: 4,
        }),
      );

      await useDirectorGuideStore.persist.rehydrate();

      expect(useDirectorGuideStore.getState().formData.studentLoanPlans).toEqual(['plan1']);
    });

    it('should ignore persisted state from the wrong tax year', async () => {
      useDirectorGuideStore.getState().setRevenue(12345);

      localStorage.setItem(
        DIRECTOR_STORAGE_KEY,
        JSON.stringify({
          state: {
            formData: {
              revenue: 99999,
            },
            _savedAt: Date.now(),
            _taxYear: '1900-1901',
          },
          version: 4,
        }),
      );

      await useDirectorGuideStore.persist.rehydrate();

      expect(useDirectorGuideStore.getState().formData.revenue).toBe(12345);
    });
  });
});
