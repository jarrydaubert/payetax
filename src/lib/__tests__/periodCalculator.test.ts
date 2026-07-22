// src/lib/__tests__/periodCalculator.test.ts
import { type PayPeriod, PERIODS } from '@/constants/taxRates';
import {
  convertAnnualToPeriod,
  convertBetweenPeriods,
  convertMonthlyToPeriod,
  convertPeriodToAnnual,
  getPercentOfGross,
  getPeriodValues,
  PERIODS_PER_YEAR,
} from '../periodCalculator';

const ALL_PERIODS = Object.values(PERIODS);
const ROUND_TRIP_TOLERANCE = 1e-9;

function legacyPeriodToAnnual(amount: number, period: PayPeriod, hoursPerWeek = 40): number {
  switch (period) {
    case PERIODS.ANNUALLY:
      return amount;
    case PERIODS.MONTHLY:
      return amount * 12;
    case PERIODS.FOUR_WEEKLY:
      return amount * 13;
    case PERIODS.FORTNIGHTLY:
      return amount * 26;
    case PERIODS.WEEKLY:
      return amount * 52;
    case PERIODS.DAILY:
      return amount * 260;
    case PERIODS.HOURLY:
      return amount * hoursPerWeek * 52;
  }
}

function legacyAnnualToPeriod(amount: number, period: PayPeriod, hoursPerWeek = 40): number {
  switch (period) {
    case PERIODS.ANNUALLY:
      return amount;
    case PERIODS.MONTHLY:
      return amount / 12;
    case PERIODS.FOUR_WEEKLY:
      return amount / 13;
    case PERIODS.FORTNIGHTLY:
      return amount / 26;
    case PERIODS.WEEKLY:
      return amount / 52;
    case PERIODS.DAILY:
      return amount / 260;
    case PERIODS.HOURLY:
      return amount / (hoursPerWeek * 52);
  }
}

function legacyMonthlyToPeriod(amount: number, period: PayPeriod, hoursPerWeek = 40): number {
  switch (period) {
    case PERIODS.ANNUALLY:
      return amount * 12;
    case PERIODS.MONTHLY:
      return amount;
    case PERIODS.FOUR_WEEKLY:
      return amount * (12 / 13);
    case PERIODS.FORTNIGHTLY:
      return amount * (12 / 26);
    case PERIODS.WEEKLY:
      return amount * (12 / 52);
    case PERIODS.DAILY:
      return amount * (12 / 260);
    case PERIODS.HOURLY:
      return amount / (hoursPerWeek * (52 / 12));
  }
}

describe('Period Calculator', () => {
  describe('canonical period ownership', () => {
    it('owns every fixed mathematical period count in one table', () => {
      expect(PERIODS_PER_YEAR).toEqual({
        annually: 1,
        monthly: 12,
        fourWeekly: 13,
        fortnightly: 26,
        weekly: 52,
        daily: 260,
      });
    });

    it('matches the legacy conversion formulas in both directions for every period', () => {
      const amounts = [-1234.565, 0, 1, 49131.01];

      for (const amount of amounts) {
        for (const period of ALL_PERIODS) {
          expect(convertPeriodToAnnual(amount, period, 37.5)).toBe(
            legacyPeriodToAnnual(amount, period, 37.5),
          );
          expect(convertAnnualToPeriod(amount, period, 37.5)).toBe(
            legacyAnnualToPeriod(amount, period, 37.5),
          );
        }
      }
    });

    it('preserves the engine monthly-base formulas for every period', () => {
      const amounts = [-1234.565, 0, 1, 4094.25];

      for (const amount of amounts) {
        for (const period of ALL_PERIODS) {
          expect(convertMonthlyToPeriod(amount, period, 37.5)).toBe(
            legacyMonthlyToPeriod(amount, period, 37.5),
          );
        }
      }
    });

    it('keeps direct zero and invalid hourly arguments on their established arithmetic path', () => {
      expect(convertPeriodToAnnual(25, PERIODS.HOURLY, 0)).toBe(0);
      expect(convertAnnualToPeriod(52000, PERIODS.HOURLY, 0)).toBe(Number.POSITIVE_INFINITY);
      expect(convertMonthlyToPeriod(100, PERIODS.HOURLY, 0)).toBe(Number.POSITIVE_INFINITY);
      expect(convertPeriodToAnnual(25, PERIODS.HOURLY, Number.NaN)).toBeNaN();
      expect(convertAnnualToPeriod(52000, PERIODS.HOURLY, Number.NaN)).toBeNaN();
      expect(convertMonthlyToPeriod(100, PERIODS.HOURLY, Number.NaN)).toBeNaN();
    });

    it('preserves the established annual fallback for an unsupported runtime period', () => {
      const unsupportedPeriods = ['quarterly', 'constructor', 'toString'] as unknown as PayPeriod[];

      for (const unsupportedPeriod of unsupportedPeriods) {
        expect(convertPeriodToAnnual(1234.56, unsupportedPeriod)).toBe(1234.56);
        expect(convertAnnualToPeriod(1234.56, unsupportedPeriod)).toBe(1234.56);
        expect(convertMonthlyToPeriod(1234.56, unsupportedPeriod)).toBe(1234.56 * 12);
        expect(convertBetweenPeriods(1234.56, unsupportedPeriod, PERIODS.MONTHLY)).toBe(102.88);
      }
    });
  });

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
    it('matches direct legacy period-to-period conversion for every period pair', () => {
      for (const fromPeriod of ALL_PERIODS) {
        for (const toPeriod of ALL_PERIODS) {
          const amount = 1234.56;
          const expected = legacyAnnualToPeriod(
            legacyPeriodToAnnual(amount, fromPeriod, 37.5),
            toPeriod,
            37.5,
          );

          expect(convertBetweenPeriods(amount, fromPeriod, toPeriod, 37.5)).toBe(expected);
        }
      }
    });

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
      const original = 50000.55;

      for (const period of ALL_PERIODS) {
        const periodValue = convertAnnualToPeriod(original, period, 37.5);
        const backToAnnual = convertPeriodToAnnual(periodValue, period, 37.5);

        // Conversion does not round; allow only sub-nanopound floating-point drift.
        expect(Math.abs(backToAnnual - original)).toBeLessThanOrEqual(ROUND_TRIP_TOLERANCE);
      }
    });

    it('handles fractional hourly rates', () => {
      const hourly = 15.75;
      const annual = convertPeriodToAnnual(hourly, PERIODS.HOURLY);
      const backToHourly = convertAnnualToPeriod(annual, PERIODS.HOURLY);
      expect(backToHourly).toBeCloseTo(hourly, 2);
    });
  });
});
