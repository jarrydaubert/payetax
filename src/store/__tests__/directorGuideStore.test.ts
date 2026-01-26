// src/store/__tests__/directorGuideStore.test.ts

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

describe('DirectorGuideStore', () => {
  beforeEach(() => {
    useDirectorGuideStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const state = useDirectorGuideStore.getState();
      expect(state.formData.region).toBeUndefined();
      expect(state.formData.revenue).toBeUndefined();
      expect(state.currentStep).toBe('location');
      expect(state.results).toBeNull();
    });

    it('should have all steps incomplete initially', () => {
      const state = useDirectorGuideStore.getState();
      expect(state.stepStatus.location).toBe(false);
      expect(state.stepStatus.revenue).toBe(false);
      expect(state.stepStatus.expenses).toBe(false);
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
  });

  describe('Step Navigation', () => {
    it('should complete step and advance to next', () => {
      useDirectorGuideStore.getState().completeStep('location');
      const state = useDirectorGuideStore.getState();
      expect(state.stepStatus.location).toBe(true);
      expect(state.currentStep).toBe('revenue');
    });

    it('should edit step and reset subsequent steps', () => {
      const store = useDirectorGuideStore.getState();
      store.completeStep('location');
      store.completeStep('revenue');
      store.completeStep('expenses');

      useDirectorGuideStore.getState().editStep('revenue');

      const state = useDirectorGuideStore.getState();
      expect(state.stepStatus.location).toBe(true);
      expect(state.stepStatus.revenue).toBe(false);
      expect(state.stepStatus.expenses).toBe(false);
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
      expect(state.showResults).toBe(true);
    });
  });

  describe('Reset', () => {
    it('should reset to initial state', () => {
      const store = useDirectorGuideStore.getState();
      store.setRegion('scotland');
      store.setRevenue(50000);
      store.completeStep('location');

      useDirectorGuideStore.getState().reset();

      const state = useDirectorGuideStore.getState();
      expect(state.formData.region).toBeUndefined();
      expect(state.currentStep).toBe('location');
    });
  });
});
