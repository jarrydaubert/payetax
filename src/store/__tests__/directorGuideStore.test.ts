import { rememberFigures } from '@/lib/figureStorage';
// src/store/__tests__/directorGuideStore.test.ts
/**
 * Tests for Director Intelligence Store
 *
 * Post-merge: Removed step wizard tests, added strategy comparison tests.
 */

import { calculateStrategyComparison } from '@/lib/tax/strategyComparison';
import { DIRECTOR_TAX_YEARS } from '@/lib/validation/directorValidation';
import { hasCurrentDirectorResults, useDirectorGuideStore } from '../directorGuideStore';

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

const mockCalculateStrategyComparison = calculateStrategyComparison as jest.Mock;
const DIRECTOR_STORAGE_KEY = 'director-guide-storage';

describe('DirectorGuideStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useDirectorGuideStore.getState().reset();
    rememberFigures();
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
      expect(state.formData.associatedCompaniesCount).toBe(1);
      expect(state.formData.hasEmploymentAllowance).toBe(false);
      expect(state.formData.monthlyIncome).toBeUndefined();
      expect(state.formData.monthlyExpenses).toBeUndefined();
      expect(state.formData.contractStartMonth).toBe(4);
      expect(state.formData.runwayMonths).toBe(3);
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

    it('should set associated companies count with bounds', () => {
      const store = useDirectorGuideStore.getState();
      store.setAssociatedCompaniesCount(4);
      expect(useDirectorGuideStore.getState().formData.associatedCompaniesCount).toBe(4);

      store.setAssociatedCompaniesCount(0);
      expect(useDirectorGuideStore.getState().formData.associatedCompaniesCount).toBe(1);

      store.setAssociatedCompaniesCount(999);
      expect(useDirectorGuideStore.getState().formData.associatedCompaniesCount).toBe(50);
    });

    it('should set employment allowance', () => {
      useDirectorGuideStore.getState().setHasEmploymentAllowance(true);
      expect(useDirectorGuideStore.getState().formData.hasEmploymentAllowance).toBe(true);
    });

    it('sets the accounting period end', () => {
      useDirectorGuideStore.getState().setAccountingPeriodEnd('2026-12-31');
      expect(useDirectorGuideStore.getState().formData.accountingPeriodEnd).toBe('2026-12-31');
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
      expect(mockCalculateStrategyComparison).not.toHaveBeenCalled();
      expect(useDirectorGuideStore.getState().strategyComparison).toBeNull();
    });

    it('should calculate with all required fields', () => {
      const store = useDirectorGuideStore.getState();
      store.setRegion('rUK');
      store.setRevenue(100000);
      store.setExpenses(20000);

      useDirectorGuideStore.getState().calculate();

      const state = useDirectorGuideStore.getState();
      expect(state.strategyComparison).not.toBeNull();
    });

    it('passes each YTD amount to the strategy comparison', () => {
      const store = useDirectorGuideStore.getState();
      store.setRegion('rUK');
      store.setRevenue(100000);
      store.setExpenses(20000);
      store.setYtdSalary(5000);
      store.setYtdDividends(2000);
      store.setYtdDrawings(1000);

      store.calculate();

      expect(mockCalculateStrategyComparison).toHaveBeenCalledTimes(1);
      expect(mockCalculateStrategyComparison.mock.calls[0][0]).toMatchObject({
        ytdSalary: 5000,
        ytdDividends: 2000,
        ytdDrawings: 1000,
      });
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

    it('should pass associated company count into strategy comparison', () => {
      const store = useDirectorGuideStore.getState();
      store.setRegion('rUK');
      store.setRevenue(100000);
      store.setExpenses(20000);
      store.setAssociatedCompaniesCount(3);

      store.calculate();

      const call = mockCalculateStrategyComparison.mock.calls[0][0];
      expect(call.associatedCompaniesCount).toBe(3);
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
  });

  describe('Result invalidation (DI-02)', () => {
    const INVALID = { text: '-500', error: 'Enter an amount of £0 or more.' };

    function calculateCompleteResult() {
      const store = useDirectorGuideStore.getState();
      store.setRegion('rUK');
      store.setRevenue(100000);
      store.setExpenses(20000);
      useDirectorGuideStore.getState().calculate();
      expect(useDirectorGuideStore.getState().strategyComparison).not.toBeNull();
    }

    it('keeps revenue with pence exactly', () => {
      useDirectorGuideStore.getState().setRevenue(1234.56);
      expect(useDirectorGuideStore.getState().formData.revenue).toBe(1234.56);
    });

    it('tracks and clears per-field input errors', () => {
      const store = useDirectorGuideStore.getState();
      store.setInputError('revenue', INVALID);
      store.setInputError('cashInBank', { text: 'abc', error: 'Enter an amount' });
      expect(useDirectorGuideStore.getState().inputErrors).toEqual({
        revenue: INVALID,
        cashInBank: { text: 'abc', error: 'Enter an amount' },
      });

      useDirectorGuideStore.getState().setInputError('revenue', null);
      expect(useDirectorGuideStore.getState().inputErrors).toEqual({
        cashInBank: { text: 'abc', error: 'Enter an amount' },
      });
    });

    it('retains the previous submission when a required input becomes empty', () => {
      calculateCompleteResult();

      const store = useDirectorGuideStore.getState();
      store.setRevenue(undefined);
      store.calculate();

      const state = useDirectorGuideStore.getState();
      expect(state.strategyComparison).toBe(store.strategyComparison);
      expect(state.calculatedFormData).toBe(store.calculatedFormData);
      expect(hasCurrentDirectorResults(state)).toBe(false);
      expect(state.error).toBe('Enter your annual revenue and business expenses.');
    });

    it('retains invalid draft text and never calls the engine for an invalid attempt', () => {
      calculateCompleteResult();
      mockCalculateStrategyComparison.mockClear();

      const store = useDirectorGuideStore.getState();
      store.setInputError('ytdSalary', INVALID);
      store.calculate();

      const state = useDirectorGuideStore.getState();
      expect(mockCalculateStrategyComparison).not.toHaveBeenCalled();
      expect(state.calculatedFormData).toBe(store.calculatedFormData);
      expect(hasCurrentDirectorResults(state)).toBe(false);
      expect(state.inputErrors.ytdSalary).toEqual(INVALID);
      expect(state.error).toBe('Please correct the highlighted amounts');
    });

    it('validates the fields used by the selected mode and retains the other draft', () => {
      const store = useDirectorGuideStore.getState();
      store.setInputError('cashInBank', INVALID);
      calculateCompleteResult();
      const annual = useDirectorGuideStore.getState().calculatedFormData;

      store.setMode('monthly');
      expect(hasCurrentDirectorResults(useDirectorGuideStore.getState())).toBe(false);
      store.calculate();
      expect(useDirectorGuideStore.getState().calculatedFormData).toBe(annual);

      store.setMonthlyIncome(5000);
      store.setMonthlyExpenses(1000);
      store.setInputError('revenue', INVALID);
      store.calculate();
      expect(useDirectorGuideStore.getState().calculatedFormData).toBe(annual);

      store.setInputError('cashInBank', null);
      store.calculate();
      const monthly = useDirectorGuideStore.getState();
      expect(hasCurrentDirectorResults(monthly)).toBe(true);
      expect(monthly.calculatedFormData?.mode).toBe('monthly');
      expect(monthly.inputErrors.revenue).toEqual(INVALID);
      expect(monthly.monthlyModeOutput?.projectedRevenue).toBe(60000);
    });

    it.each([
      [
        'strategy',
        (state: ReturnType<typeof useDirectorGuideStore.getState>) =>
          state.setSelectedStrategy('allSalary'),
      ],
      [
        'salary',
        (state: ReturnType<typeof useDirectorGuideStore.getState>) => state.setSliderSalary(20000),
      ],
      [
        'profit',
        (state: ReturnType<typeof useDirectorGuideStore.getState>) =>
          state.setProfitWhatIfPercent(-45),
      ],
      [
        'objective',
        (state: ReturnType<typeof useDirectorGuideStore.getState>) =>
          state.setObjective('minimizeNI'),
      ],
    ] as const)('withholds the result on a draft %s edit without recalculating', (_field, edit) => {
      calculateCompleteResult();
      mockCalculateStrategyComparison.mockClear();

      const store = useDirectorGuideStore.getState();
      edit(store);

      const state = useDirectorGuideStore.getState();
      expect(state.strategyComparison).toBe(store.strategyComparison);
      expect(state.calculatedDraftScenario).toBe(store.calculatedDraftScenario);
      expect(hasCurrentDirectorResults(state)).toBe(false);
      expect(mockCalculateStrategyComparison).not.toHaveBeenCalled();
    });

    it('keeps a failed scenario withheld even after reverting its draft choices', () => {
      const store = useDirectorGuideStore.getState();
      store.setMinimumSalaryRequirement(10000);
      calculateCompleteResult();
      const previous = useDirectorGuideStore.getState().calculatedDraftScenario;
      store.setSelectedStrategy('allDividends');
      store.setObjective('minimizeNI');
      store.calculate();
      expect(useDirectorGuideStore.getState().error).toMatch(/All Dividends cannot meet/);

      store.setSelectedStrategy(null);
      store.setObjective('maximizeTakeHome');
      expect(useDirectorGuideStore.getState().calculatedDraftScenario).toBe(previous);
      expect(hasCurrentDirectorResults(useDirectorGuideStore.getState())).toBe(false);
      store.calculate();
      expect(hasCurrentDirectorResults(useDirectorGuideStore.getState())).toBe(true);
    });

    it('requires Apply or discard before Calculate and stages both setup fields together', () => {
      calculateCompleteResult();
      mockCalculateStrategyComparison.mockClear();
      const store = useDirectorGuideStore.getState();
      store.setYourSetupDraft('yourSetupSalary', 20000);
      store.setYourSetupDraft('yourSetupDividends', 15000);
      expect(hasCurrentDirectorResults(useDirectorGuideStore.getState())).toBe(false);

      store.calculate();
      expect(useDirectorGuideStore.getState().error).toMatch(/Apply or discard/);
      expect(useDirectorGuideStore.getState().calculatedFormData).toBe(store.calculatedFormData);
      expect(mockCalculateStrategyComparison).not.toHaveBeenCalled();

      store.applyYourSetupDraft();
      expect(useDirectorGuideStore.getState().formData).toMatchObject({
        yourSetupSalary: 20000,
        yourSetupDividends: 15000,
      });
      expect(useDirectorGuideStore.getState().calculatedFormData).toBe(store.calculatedFormData);
      expect(mockCalculateStrategyComparison).not.toHaveBeenCalled();

      store.calculate();
      expect(hasCurrentDirectorResults(useDirectorGuideStore.getState())).toBe(true);

      store.setInputError('yourSetupSalary', INVALID);
      store.calculate();
      expect(hasCurrentDirectorResults(useDirectorGuideStore.getState())).toBe(false);
      store.discardYourSetupDraft();
      expect(useDirectorGuideStore.getState().inputErrors.yourSetupSalary).toBeUndefined();
      expect(hasCurrentDirectorResults(useDirectorGuideStore.getState())).toBe(false);
      store.calculate();
      expect(hasCurrentDirectorResults(useDirectorGuideStore.getState())).toBe(true);
    });

    it('retains the previous monthly submission after an exception and publishes the explicit retry', () => {
      const actions = useDirectorGuideStore.getState();
      actions.setRegion('rUK');
      actions.setMode('monthly');
      actions.setMonthlyIncome(5000);
      actions.setMonthlyExpenses(1000);
      actions.calculate();
      const previous = useDirectorGuideStore.getState();

      actions.setMonthlyIncome(6000);
      mockCalculateStrategyComparison.mockImplementationOnce(() => {
        throw new Error('Synthetic Director failure');
      });
      const diagnostic = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      try {
        actions.calculate();
        expect(diagnostic).toHaveBeenCalledWith('Director calculation failed.');
      } finally {
        diagnostic.mockRestore();
      }
      const failed = useDirectorGuideStore.getState();
      expect(failed.monthlyModeOutput).toBe(previous.monthlyModeOutput);
      expect(failed.calculatedFormData).toBe(previous.calculatedFormData);
      expect(failed.formData.monthlyIncome).toBe(6000);
      expect(failed.error).toBe('Calculation failed');
      expect(hasCurrentDirectorResults(failed)).toBe(false);

      const persisted = JSON.parse(localStorage.getItem(DIRECTOR_STORAGE_KEY) ?? '{}').state;
      expect(persisted).not.toHaveProperty('calculatedFormData');
      expect(persisted).not.toHaveProperty('calculatedDraftScenario');
      expect(persisted).not.toHaveProperty('yourSetupDraft');

      actions.calculate();
      expect(useDirectorGuideStore.getState()).toMatchObject({
        monthlyModeOutput: { projectedRevenue: 72000 },
        calculatedFormData: { monthlyIncome: 6000 },
        calculatedStrategy: 'optimalMix',
        error: null,
      });
      expect(hasCurrentDirectorResults(useDirectorGuideStore.getState())).toBe(true);
    });

    it('reset clears input errors and advances the input revision', () => {
      const before = useDirectorGuideStore.getState().inputRevision;
      useDirectorGuideStore.getState().setInputError('revenue', INVALID);

      useDirectorGuideStore.getState().reset();

      const state = useDirectorGuideStore.getState();
      expect(state.inputErrors).toEqual({});
      expect(state.inputRevision).toBe(before + 1);
    });

    it('does not persist input errors', () => {
      useDirectorGuideStore.getState().setInputError('revenue', INVALID);
      const persisted = JSON.parse(localStorage.getItem(DIRECTOR_STORAGE_KEY) ?? '{}');
      expect(persisted.state).toBeDefined();
      expect(persisted.state.inputErrors).toBeUndefined();
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
    it('restores a saved named draft on a fresh visit without replacing live exploration', async () => {
      const store = useDirectorGuideStore.getState();
      store.setSelectedStrategy('allSalary');
      const saved = localStorage.getItem(DIRECTOR_STORAGE_KEY) ?? '';
      store.reset();
      localStorage.setItem(DIRECTOR_STORAGE_KEY, saved);
      await useDirectorGuideStore.persist.rehydrate();
      expect(useDirectorGuideStore.getState().selectedStrategy).toBe('allSalary');

      store.setSelectedStrategy('optimalMix');
      store.setSliderSalary(24000);
      store.setProfitWhatIfPercent(-45);
      store.setObjective('minimizeNI');
      localStorage.setItem(DIRECTOR_STORAGE_KEY, saved);
      await useDirectorGuideStore.persist.rehydrate();
      expect(useDirectorGuideStore.getState()).toMatchObject({
        selectedStrategy: 'optimalMix',
        sliderSalary: 24000,
        profitWhatIfPercent: -45,
        objective: 'minimizeNI',
        calculatedExploration: null,
      });
    });

    it('restores legacy figures without guessing a year for a saved month and day', async () => {
      localStorage.setItem(
        DIRECTOR_STORAGE_KEY,
        JSON.stringify({
          state: {
            formData: { revenue: 45000, yearEndMonth: 'other', yearEndCustom: '06-30' },
          },
          version: 4,
        }),
      );

      rememberFigures(true);
      await useDirectorGuideStore.persist.rehydrate();

      expect(useDirectorGuideStore.getState().formData).toMatchObject({
        revenue: 45000,
        accountingPeriodEnd: '',
      });
    });

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

      rememberFigures(true);
      await useDirectorGuideStore.persist.rehydrate();

      const state = useDirectorGuideStore.getState();
      expect(state.formData.monthlyIncome).toBe(2500);
      expect(state.selectedStrategy).toBeNull();
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

      rememberFigures(true);
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

      rememberFigures(true);
      await useDirectorGuideStore.persist.rehydrate();

      expect(useDirectorGuideStore.getState().formData.revenue).toBe(12345);
    });
  });
});
