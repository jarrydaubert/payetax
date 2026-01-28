// src/store/__tests__/directorGuideStore.test.ts
/**
 * Tests for Director Guide Store
 *
 * Post-merge: Removed step wizard tests, added strategy comparison tests.
 */

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
    strategies: {
      allSalary: {
        name: 'All Salary',
        salary: 80000,
        dividends: 0,
        takeHome: 55000,
        effectiveRate: 31,
      },
      optimalMix: {
        name: 'Optimal Mix',
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

describe('DirectorGuideStore', () => {
  beforeEach(() => {
    useDirectorGuideStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const state = useDirectorGuideStore.getState();
      expect(state.formData.region).toBeUndefined();
      expect(state.formData.revenue).toBeUndefined();
      expect(state.formData.expenses).toBeUndefined();
      expect(state.formData.alreadyTaken).toBe(0);
      expect(state.formData.takenViaPayroll).toBe('unsure');
      expect(state.formData.otherIncome).toBe(0);
      expect(state.formData.studentLoanPlans).toEqual([]);
      expect(state.formData.pensionContribution).toBe(0);
      expect(state.formData.companyCarBIK).toBe(0);
      expect(state.formData.hasEmploymentAllowance).toBe(false);
      expect(state.results).toBeNull();
      expect(state.strategyComparison).toBeNull();
    });
  });

  describe('Form Data Actions', () => {
    it('should set region', () => {
      useDirectorGuideStore.getState().setRegion('scotland');
      expect(useDirectorGuideStore.getState().formData.region).toBe('scotland');
    });

    it('should set revenue', () => {
      useDirectorGuideStore.getState().setRevenue(100000);
      expect(useDirectorGuideStore.getState().formData.revenue).toBe(100000);
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

    it('should set includesVat', () => {
      useDirectorGuideStore.getState().setIncludesVat(true);
      expect(useDirectorGuideStore.getState().formData.includesVat).toBe(true);
    });

    it('should set alreadyTaken', () => {
      useDirectorGuideStore.getState().setAlreadyTaken(5000);
      expect(useDirectorGuideStore.getState().formData.alreadyTaken).toBe(5000);
    });

    it('should reject negative alreadyTaken', () => {
      useDirectorGuideStore.getState().setAlreadyTaken(5000);
      useDirectorGuideStore.getState().setAlreadyTaken(-1000);
      expect(useDirectorGuideStore.getState().formData.alreadyTaken).toBe(5000);
    });

    it('should reject Infinity revenue', () => {
      useDirectorGuideStore.getState().setRevenue(Number.POSITIVE_INFINITY);
      expect(useDirectorGuideStore.getState().formData.revenue).toBeUndefined();
    });

    it('should reject negative expenses', () => {
      useDirectorGuideStore.getState().setExpenses(-500);
      expect(useDirectorGuideStore.getState().formData.expenses).toBeUndefined();
    });

    it('should set takenViaPayroll', () => {
      useDirectorGuideStore.getState().setTakenViaPayroll('yes');
      expect(useDirectorGuideStore.getState().formData.takenViaPayroll).toBe('yes');
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

    it('should set pension contribution', () => {
      useDirectorGuideStore.getState().setPensionContribution(10000);
      expect(useDirectorGuideStore.getState().formData.pensionContribution).toBe(10000);
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
});
