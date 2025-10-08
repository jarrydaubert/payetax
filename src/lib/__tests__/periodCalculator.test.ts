// src/lib/__tests__/periodCalculator.test.ts
import { PERIODS } from '@/constants/taxRates';
import {
  convertAnnualToPeriod,
  convertBetweenPeriods,
  convertPeriodToAnnual,
  getPercentOfGross,
  getPeriodValues,
} from '../periodCalculator';

describe('Period Calculator', () => {
  describe('convertPeriodToAnnual', () => {
    it('returns amount unchanged for annual period', () => {
      expect(convertPeriodToAnnual(50000, PERIODS.ANNUALLY)).toBe(50000);
    });

    it('converts monthly to annual correctly', () => {
      expect(convertPeriodToAnnual(4000, PERIODS.MONTHLY)).toBe(48000);
    });

    it('converts weekly to annual correctly', () => {
      expect(convertPeriodToAnnual(1000, PERIODS.WEEKLY)).toBe(52000);
    });

    it('converts four-weekly to annual correctly', () => {
      expect(convertPeriodToAnnual(2000, PERIODS.FOUR_WEEKLY)).toBe(26000);
    });

    it('converts fortnightly to annual correctly', () => {
      expect(convertPeriodToAnnual(1500, PERIODS.FORTNIGHTLY)).toBe(39000);
    });

    it('converts daily to annual correctly', () => {
      expect(convertPeriodToAnnual(200, PERIODS.DAILY)).toBe(52000);
    });

    it('converts hourly to annual correctly with default hours', () => {
      // Default is 40 hours per week
      expect(convertPeriodToAnnual(25, PERIODS.HOURLY)).toBe(52000);
    });

    it('converts hourly to annual correctly with custom hours', () => {
      expect(convertPeriodToAnnual(20, PERIODS.HOURLY, 40)).toBe(41600);
    });

    it('handles zero amount', () => {
      expect(convertPeriodToAnnual(0, PERIODS.MONTHLY)).toBe(0);
      expect(convertPeriodToAnnual(0, PERIODS.WEEKLY)).toBe(0);
    });

    it('handles decimal amounts', () => {
      expect(convertPeriodToAnnual(1234.56, PERIODS.MONTHLY)).toBe(14814.72);
    });
  });

  describe('convertAnnualToPeriod', () => {
    it('returns amount unchanged for annual period', () => {
      expect(convertAnnualToPeriod(50000, PERIODS.ANNUALLY)).toBe(50000);
    });

    it('converts annual to monthly correctly', () => {
      expect(convertAnnualToPeriod(48000, PERIODS.MONTHLY)).toBe(4000);
    });

    it('converts annual to weekly correctly', () => {
      expect(convertAnnualToPeriod(52000, PERIODS.WEEKLY)).toBe(1000);
    });

    it('converts annual to four-weekly correctly', () => {
      expect(convertAnnualToPeriod(26000, PERIODS.FOUR_WEEKLY)).toBe(2000);
    });

    it('converts annual to fortnightly correctly', () => {
      expect(convertAnnualToPeriod(39000, PERIODS.FORTNIGHTLY)).toBe(1500);
    });

    it('converts annual to daily correctly', () => {
      expect(convertAnnualToPeriod(52000, PERIODS.DAILY)).toBe(200);
    });

    it('converts annual to hourly correctly with default hours', () => {
      // Default is 40 hours per week
      expect(convertAnnualToPeriod(52000, PERIODS.HOURLY)).toBe(25);
    });

    it('converts annual to hourly correctly with custom hours', () => {
      expect(convertAnnualToPeriod(41600, PERIODS.HOURLY, 40)).toBe(20);
    });

    it('handles zero amount', () => {
      expect(convertAnnualToPeriod(0, PERIODS.MONTHLY)).toBe(0);
      expect(convertAnnualToPeriod(0, PERIODS.WEEKLY)).toBe(0);
    });

    it('handles decimal amounts', () => {
      const monthly = convertAnnualToPeriod(50000, PERIODS.MONTHLY);
      expect(monthly).toBeCloseTo(4166.67, 2);
    });

    it('handles leap year calculations (uses 52 weeks)', () => {
      // Leap years still use 52 weeks for consistency
      expect(convertAnnualToPeriod(52000, PERIODS.WEEKLY)).toBe(1000);
    });
  });

  describe('convertBetweenPeriods', () => {
    it('converts monthly to weekly correctly', () => {
      const weekly = convertBetweenPeriods(4000, PERIODS.MONTHLY, PERIODS.WEEKLY);
      expect(weekly).toBeCloseTo(923.08, 2);
    });

    it('converts weekly to monthly correctly', () => {
      const monthly = convertBetweenPeriods(1000, PERIODS.WEEKLY, PERIODS.MONTHLY);
      expect(monthly).toBeCloseTo(4333.33, 2);
    });

    it('converts hourly to monthly correctly', () => {
      const monthly = convertBetweenPeriods(20, PERIODS.HOURLY, PERIODS.MONTHLY);
      // 20 * 40 hours * 52 weeks = 41,600 / 12 months = 3,466.67
      expect(monthly).toBeCloseTo(3466.67, 2);
    });

    it('converts daily to hourly correctly', () => {
      const hourly = convertBetweenPeriods(200, PERIODS.DAILY, PERIODS.HOURLY);
      // 200 * 260 days = 52,000 / (40 hours * 52 weeks) = 25
      expect(hourly).toBe(25);
    });

    it('converts four-weekly to fortnightly correctly', () => {
      const fortnightly = convertBetweenPeriods(2000, PERIODS.FOUR_WEEKLY, PERIODS.FORTNIGHTLY);
      expect(fortnightly).toBe(1000);
    });

    it('handles same period conversion (no-op)', () => {
      expect(convertBetweenPeriods(1000, PERIODS.MONTHLY, PERIODS.MONTHLY)).toBe(1000);
    });

    it('handles zero amount', () => {
      expect(convertBetweenPeriods(0, PERIODS.MONTHLY, PERIODS.WEEKLY)).toBe(0);
    });

    it('uses custom hours for hourly conversions', () => {
      // With 30 hours per week (not default 40)
      const hourly = convertBetweenPeriods(4000, PERIODS.MONTHLY, PERIODS.HOURLY, 30);
      // 4000 * 12 = 48,000 / (30 * 52) = 30.77
      expect(hourly).toBeCloseTo(30.77, 2);
    });
  });

  describe('getPeriodValues', () => {
    it('calculates all period values from annual amount', () => {
      const result = getPeriodValues(52000, []);

      expect(result.yearly).toBe(52000);
      expect(result.monthly).toBe(4333.333333333333);
      expect(result.weekly).toBe(1000);
      expect(result.fourWeekly).toBe(4000);
      expect(result.fortnightly).toBe(2000);
      expect(result.daily).toBe(200);
    });

    it('calculates hourly rate correctly with default hours', () => {
      const result = getPeriodValues(52000, []);

      expect(result.hourly).toBe(25);
    });

    it('calculates hourly rate correctly with custom hours', () => {
      // With 30 hours per week (not default 40)
      const result = getPeriodValues(46800, [], 30);
      // 46,800 / (30 * 52) = 30
      expect(result.hourly).toBe(30);
    });

    it('handles zero annual value', () => {
      const result = getPeriodValues(0, []);

      expect(result.yearly).toBe(0);
      expect(result.monthly).toBe(0);
      expect(result.weekly).toBe(0);
      expect(result.fourWeekly).toBe(0);
      expect(result.fortnightly).toBe(0);
      expect(result.daily).toBe(0);
      expect(result.hourly).toBe(0);
    });

    it('handles decimal annual values', () => {
      const result = getPeriodValues(50000.5, []);

      expect(result.yearly).toBe(50000.5);
      expect(result.monthly).toBeCloseTo(4166.71, 2);
    });

    it('returns all required period keys', () => {
      const result = getPeriodValues(50000, []);

      expect(result).toHaveProperty('yearly');
      expect(result).toHaveProperty('monthly');
      expect(result).toHaveProperty('weekly');
      expect(result).toHaveProperty('fourWeekly');
      expect(result).toHaveProperty('fortnightly');
      expect(result).toHaveProperty('daily');
      expect(result).toHaveProperty('hourly');
    });

    it('ignores periods parameter (kept for API compatibility)', () => {
      const result1 = getPeriodValues(50000, []);
      const result2 = getPeriodValues(50000, ['monthly', 'weekly']);
      const result3 = getPeriodValues(50000, 'monthly');

      // All should return the same structure
      expect(Object.keys(result1)).toEqual(Object.keys(result2));
      expect(Object.keys(result1)).toEqual(Object.keys(result3));
    });
  });

  describe('getPercentOfGross', () => {
    it('calculates percentage correctly', () => {
      expect(getPercentOfGross(10000, 50000)).toBe(20);
      expect(getPercentOfGross(25000, 50000)).toBe(50);
      expect(getPercentOfGross(50000, 50000)).toBe(100);
    });

    it('handles decimal percentages', () => {
      expect(getPercentOfGross(15000, 50000)).toBe(30);
      expect(getPercentOfGross(12345, 50000)).toBe(24.69);
    });

    it('handles zero amount', () => {
      expect(getPercentOfGross(0, 50000)).toBe(0);
    });

    it('handles zero gross salary (division by zero)', () => {
      expect(getPercentOfGross(10000, 0)).toBe(0);
    });

    it('handles negative amounts', () => {
      expect(getPercentOfGross(-5000, 50000)).toBe(-10);
    });

    it('handles percentages over 100%', () => {
      expect(getPercentOfGross(75000, 50000)).toBe(150);
    });

    it('handles very small percentages', () => {
      expect(getPercentOfGross(50, 50000)).toBe(0.1);
    });

    it('handles both values as zero', () => {
      expect(getPercentOfGross(0, 0)).toBe(0);
    });
  });

  describe('Edge cases and rounding', () => {
    it('handles very large salaries', () => {
      const annual = convertPeriodToAnnual(100000, PERIODS.MONTHLY);
      expect(annual).toBe(1200000);
    });

    it('handles very small amounts', () => {
      const monthly = convertAnnualToPeriod(100, PERIODS.MONTHLY);
      expect(monthly).toBeCloseTo(8.33, 2);
    });

    it('round-trip conversion maintains accuracy', () => {
      const original = 50000;
      const monthly = convertAnnualToPeriod(original, PERIODS.MONTHLY);
      const backToAnnual = convertPeriodToAnnual(monthly, PERIODS.MONTHLY);
      expect(backToAnnual).toBe(original);
    });

    it('handles fractional hourly rates', () => {
      const hourly = 15.75;
      const annual = convertPeriodToAnnual(hourly, PERIODS.HOURLY);
      const backToHourly = convertAnnualToPeriod(annual, PERIODS.HOURLY);
      expect(backToHourly).toBeCloseTo(hourly, 2);
    });
  });
});
