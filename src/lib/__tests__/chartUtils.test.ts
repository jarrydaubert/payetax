import { describe, expect, it } from '@jest/globals';
import type { PayPeriod } from '@/constants/taxRates';
import {
  calculateEffectiveRate,
  estimateMarginalRate,
  formatPercentage,
  getEffectiveTaxRateData,
} from '../chartUtils';
import type { TaxCalculationResults } from '../taxCalculator';

const zeroByPeriod = (): Record<PayPeriod, number> => ({
  annually: 0,
  monthly: 0,
  fourWeekly: 0,
  fortnightly: 0,
  weekly: 0,
  daily: 0,
  hourly: 0,
});

const buildResults = (overrides: Partial<TaxCalculationResults> = {}): TaxCalculationResults => ({
  grossSalary: { ...zeroByPeriod(), annually: 100000, monthly: 8333.33 },
  taxFreeAmount: 12570,
  taxableIncome: 87430,
  incomeTax: { ...zeroByPeriod(), annually: 27432, monthly: 2286 },
  nationalInsurance: { ...zeroByPeriod(), annually: 3510.6, monthly: 292.55 },
  studentLoan: { ...zeroByPeriod(), annually: 0, monthly: 0 },
  pensionContribution: { ...zeroByPeriod(), annually: 0, monthly: 0 },
  employerNI: 0,
  netPay: { ...zeroByPeriod(), annually: 69057.4, monthly: 5754.78 },
  taxBands: [],
  ...overrides,
});

describe('chartUtils', () => {
  describe('calculateEffectiveRate', () => {
    it('returns 0 when gross salary is zero', () => {
      expect(calculateEffectiveRate(1000, 100, 50, 0)).toBe(0);
    });

    it('calculates effective rate from total deductions', () => {
      expect(calculateEffectiveRate(20000, 3000, 2000, 100000)).toBe(25);
    });
  });

  describe('estimateMarginalRate', () => {
    it('uses rUK thresholds', () => {
      expect(estimateMarginalRate(12000, false)).toBe(0);
      expect(estimateMarginalRate(30000, false)).toBe(20);
      expect(estimateMarginalRate(60000, false)).toBe(40);
      expect(estimateMarginalRate(130000, false)).toBe(45);
    });

    it('uses Scottish thresholds', () => {
      expect(estimateMarginalRate(12000, true)).toBe(0);
      expect(estimateMarginalRate(43662, true)).toBe(21);
      expect(estimateMarginalRate(50000, true)).toBe(42);
      expect(estimateMarginalRate(130000, true)).toBe(48);
    });
  });

  describe('getEffectiveTaxRateData', () => {
    it('returns 21 chart points and includes current-salary rates', () => {
      const results = buildResults({
        incomeTax: { ...zeroByPeriod(), annually: 30000 },
        nationalInsurance: { ...zeroByPeriod(), annually: 4000 },
        studentLoan: { ...zeroByPeriod(), annually: 1000 },
        grossSalary: { ...zeroByPeriod(), annually: 100000 },
      });

      const points = getEffectiveTaxRateData(100000, results, false);
      expect(points).toHaveLength(21);

      const currentPoint = points.find((point) => point.salary === 100000);
      expect(currentPoint).toBeDefined();
      expect(currentPoint?.effectiveTaxRate).toBe(35);
      expect(currentPoint?.takeHomeRate).toBe(65);
      expect(currentPoint?.marginalTaxRate).toBe(40);
    });

    it('caps estimated effective rates at 50%', () => {
      const results = buildResults({
        incomeTax: { ...zeroByPeriod(), annually: 45000 },
        nationalInsurance: { ...zeroByPeriod(), annually: 5000 },
        studentLoan: { ...zeroByPeriod(), annually: 0 },
        grossSalary: { ...zeroByPeriod(), annually: 90000 },
      });

      const points = getEffectiveTaxRateData(90000, results, false);
      const maxRate = Math.max(
        ...points.filter((point) => point.salary !== 90000).map((point) => point.effectiveTaxRate),
      );
      expect(maxRate).toBeLessThanOrEqual(50);
    });

    it('produces top Scottish marginal rate for high salaries', () => {
      const results = buildResults({
        grossSalary: { ...zeroByPeriod(), annually: 130000 },
      });
      const points = getEffectiveTaxRateData(130000, results, true);
      expect(points.some((point) => point.marginalTaxRate === 48)).toBe(true);
    });
  });

  describe('formatPercentage', () => {
    it('formats to one decimal place', () => {
      expect(formatPercentage(12.345)).toBe('12.3%');
      expect(formatPercentage(12)).toBe('12.0%');
    });
  });
});
