import {
  calculateSafeMonthlyDraw,
  getMonthsRemaining,
  projectAnnualFromMonthly,
  resolveAnnualFinancials,
} from '../variableIncome';

describe('variableIncome helpers', () => {
  describe('getMonthsRemaining', () => {
    it('counts from April to March inclusively', () => {
      expect(getMonthsRemaining(4)).toBe(12);
      expect(getMonthsRemaining(10)).toBe(6);
      expect(getMonthsRemaining(1)).toBe(3);
      expect(getMonthsRemaining(3)).toBe(1);
    });

    it('returns 0 for invalid month values', () => {
      expect(getMonthsRemaining(0)).toBe(0);
      expect(getMonthsRemaining(13)).toBe(0);
      expect(getMonthsRemaining(4.5)).toBe(0);
    });
  });

  describe('projectAnnualFromMonthly', () => {
    it('projects revenue and expenses from monthly values', () => {
      const result = projectAnnualFromMonthly({
        monthlyIncome: 3000,
        monthlyExpenses: 1000,
        contractStartMonth: 10,
      });

      expect(result.monthsRemaining).toBe(6);
      expect(result.projectedRevenue).toBe(18000);
      expect(result.projectedExpenses).toBe(6000);
    });

    it('preserves penny rounding for fractional monthly projections', () => {
      const result = projectAnnualFromMonthly({
        monthlyIncome: 0.1875,
        monthlyExpenses: 0.185,
        contractStartMonth: 10,
      });

      expect(result.projectedRevenue).toBe(1.13);
      expect(result.projectedExpenses).toBe(1.11);
    });
  });

  describe('resolveAnnualFinancials', () => {
    it('returns annual values unchanged in annual mode', () => {
      const result = resolveAnnualFinancials({
        mode: 'annual',
        revenue: 100000,
        expenses: 20000,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        contractStartMonth: 4,
      });

      expect(result.monthlyProjection).toBeNull();
      expect(result.revenue).toBe(100000);
      expect(result.expenses).toBe(20000);
      expect(result.hasInvalidContractStartMonth).toBe(false);
    });

    it('projects annual values in monthly mode', () => {
      const result = resolveAnnualFinancials({
        mode: 'monthly',
        revenue: undefined,
        expenses: undefined,
        monthlyIncome: 3000,
        monthlyExpenses: 1000,
        contractStartMonth: 10,
      });

      expect(result.monthlyProjection?.monthsRemaining).toBe(6);
      expect(result.revenue).toBe(18000);
      expect(result.expenses).toBe(6000);
      expect(result.hasInvalidContractStartMonth).toBe(false);
    });

    it('requires explicit monthly values in monthly mode', () => {
      const result = resolveAnnualFinancials({
        mode: 'monthly',
        revenue: undefined,
        expenses: undefined,
        monthlyIncome: undefined,
        monthlyExpenses: undefined,
        contractStartMonth: 10,
      });

      expect(result.monthlyProjection).toBeNull();
      expect(result.revenue).toBeUndefined();
      expect(result.expenses).toBeUndefined();
      expect(result.hasInvalidContractStartMonth).toBe(false);
    });

    it('flags invalid contract month in monthly mode', () => {
      const result = resolveAnnualFinancials({
        mode: 'monthly',
        revenue: undefined,
        expenses: undefined,
        monthlyIncome: 3000,
        monthlyExpenses: 1000,
        contractStartMonth: 13,
      });

      expect(result.hasInvalidContractStartMonth).toBe(true);
    });
  });

  describe('calculateSafeMonthlyDraw', () => {
    it('caps safe draw by tax-based monthly amount when buffer is healthy', () => {
      const result = calculateSafeMonthlyDraw({
        annualTakeHome: 24000,
        monthsRemaining: 6,
        cashInBank: 15000,
        minimumMonthlyDraw: 1500,
        runwayMonths: 3,
        monthlyExpenses: 500,
      });

      expect(result.taxBasedMonthlyDraw).toBe(4000);
      expect(result.requiredBuffer).toBe(6000);
      expect(result.cashBasedCeiling).toBe(9000);
      expect(result.safeMonthlyDraw).toBe(4000);
      expect(result.hasBufferShortfall).toBe(false);
      expect(result.hasContractEndRisk).toBe(false);
    });

    it('returns minimum draw with shortfall warning when cash buffer is insufficient', () => {
      const result = calculateSafeMonthlyDraw({
        annualTakeHome: 18000,
        monthsRemaining: 6,
        cashInBank: 500,
        minimumMonthlyDraw: 1000,
        runwayMonths: 3,
        monthlyExpenses: 400,
      });

      expect(result.requiredBuffer).toBe(4200);
      expect(result.cashBasedCeiling).toBe(0);
      expect(result.safeMonthlyDraw).toBe(1000);
      expect(result.shortfall).toBe(3700);
      expect(result.hasBufferShortfall).toBe(true);
      expect(result.hasContractEndRisk).toBe(false);
    });

    it('returns minimum draw even when tax-based draw is zero and cash ceiling is zero', () => {
      const result = calculateSafeMonthlyDraw({
        annualTakeHome: 0,
        monthsRemaining: 6,
        cashInBank: 0,
        minimumMonthlyDraw: 900,
        runwayMonths: 3,
        monthlyExpenses: 300,
      });

      expect(result.taxBasedMonthlyDraw).toBe(0);
      expect(result.cashBasedCeiling).toBe(0);
      expect(result.safeMonthlyDraw).toBe(900);
    });

    it('flags contract-end risk when runway target is longer than months remaining', () => {
      const result = calculateSafeMonthlyDraw({
        annualTakeHome: 9000,
        monthsRemaining: 2,
        cashInBank: 2000,
        minimumMonthlyDraw: 800,
        runwayMonths: 3,
        monthlyExpenses: 300,
      });

      expect(result.hasContractEndRisk).toBe(true);
    });
  });
});
