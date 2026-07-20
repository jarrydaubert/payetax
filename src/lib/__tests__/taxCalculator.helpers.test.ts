/**
 * Tax Calculator Helper Tests
 *
 * What bug will this test find?
 * - CALC-DRIFT: helper math regressions (allowance reduction, pensions, bands)
 * - TAX-CODE-OVERRIDES: parseTaxCode handling
 * - ROUNDING: NI and student loan rounding changes
 */

import { parseTaxCode } from '@/lib/tax';
import {
  calculateAllowanceReduction,
  calculateIncomeTaxFromBands,
  calculatePensionAmount,
  calculateStudentLoanRepayments,
  convertToPeriods,
} from '../taxCalculator';

describe('taxCalculator helpers', () => {
  describe('parseTaxCode', () => {
    it('parses standard codes', () => {
      const result = parseTaxCode('1257L', 12570);
      expect(result.allowance).toBe(12570);
      expect(result.bandOverride).toBeNull();
      expect(result.isKCode).toBe(false);
      expect(result.isEmergency).toBe(false);
    });

    it('detects emergency suffixes', () => {
      const result = parseTaxCode('1257LM1', 12570);
      expect(result.isEmergency).toBe(true);
      expect(result.allowance).toBe(12570);
    });

    it('parses K codes as negative allowance', () => {
      const result = parseTaxCode('K100', 12570);
      expect(result.allowance).toBe(-1000);
      expect(result.isKCode).toBe(true);
    });

    it('handles special codes with band overrides', () => {
      expect(parseTaxCode('BR', 12570).bandOverride).toBe('BR');
      expect(parseTaxCode('D0', 12570).bandOverride).toBe('D0');
      expect(parseTaxCode('D1', 12570).bandOverride).toBe('D1');
      expect(parseTaxCode('NT', 12570).bandOverride).toBe('NT');
      expect(parseTaxCode('0T', 12570).allowance).toBe(0);
    });
  });

  describe('calculateAllowanceReduction', () => {
    it('returns zero when below threshold', () => {
      expect(calculateAllowanceReduction(90000, 12570, 100000, 0.5)).toBe(0);
    });

    it('reduces allowance by £1 per £2 above threshold using HMRC whole-pound rounding', () => {
      expect(calculateAllowanceReduction(110000, 12570, 100000, 0.5)).toBe(5000);
      expect(calculateAllowanceReduction(100001, 12570, 100000, 0.5)).toBe(0);
      expect(calculateAllowanceReduction(100003, 12570, 100000, 0.5)).toBe(1);
      expect(calculateAllowanceReduction(125139, 12570, 100000, 0.5)).toBe(12569);
      expect(calculateAllowanceReduction(125140, 12570, 100000, 0.5)).toBe(12570);
    });
  });

  describe('calculatePensionAmount', () => {
    it('calculates percentage contributions', () => {
      expect(calculatePensionAmount(40000, 5, 'percentage')).toBe(2000);
    });

    it('calculates fixed amount as monthly equivalent', () => {
      expect(calculatePensionAmount(40000, 3000, 'amount')).toBe(250);
    });
  });

  describe('calculateIncomeTaxFromBands', () => {
    it('calculates basic rate tax for a single band', () => {
      const bands = [
        { name: 'Basic', rate: 20, threshold: 37700 },
        { name: 'Higher', rate: 40, threshold: 125140 },
      ];
      const monthlyAllowance = 12570 / 12;
      const { monthlyTax, taxBandsApplied } = calculateIncomeTaxFromBands(
        2000,
        bands,
        monthlyAllowance,
      );

      expect(monthlyTax).toBeCloseTo(400, 2);
      expect(taxBandsApplied[0]?.rate).toBe(20);
    });

    it('applies higher rate once basic band is exceeded', () => {
      const bands = [
        { name: 'Basic', rate: 20, threshold: 37700 },
        { name: 'Higher', rate: 40, threshold: 125140 },
      ];
      const monthlyAllowance = 12570 / 12;
      const { monthlyTax } = calculateIncomeTaxFromBands(4000, bands, monthlyAllowance);

      expect(monthlyTax).toBeGreaterThan(800); // More than simple 20% of 4,000
    });
  });

  // NI helper coverage moved to the shared mechanic. `calculateNIContributions`
  // was deleted with the NI vertical: it had no production callers, and its
  // £1,047.50 monthly threshold (annual / 12) had already drifted from the
  // engine's published £1,048. See nationalInsuranceVertical.test.ts.

  describe('calculateStudentLoanRepayments', () => {
    it('returns zero when no plans selected', () => {
      expect(calculateStudentLoanRepayments(3000, 'none', {})).toBe(0);
    });

    it('calculates repayments for plan 2', () => {
      const loanRates = { plan2: { threshold: 28470, rate: 9 } };
      const monthly = calculateStudentLoanRepayments(3000, ['plan2'], loanRates);

      expect(monthly).toBeCloseTo(56.48, 2);
    });
  });

  describe('convertToPeriods', () => {
    const annualValues = {
      gross: 12000,
      tax: 1200,
      ni: 600,
      studentLoan: 0,
      pension: 0,
      net: 10200,
    };

    it('converts annual values to monthly/weekly with rounding', () => {
      const results = convertToPeriods(annualValues, 40);

      expect(results.monthly.gross).toBe(1000);
      expect(results.weekly.gross).toBeCloseTo(230.77, 2);
    });

    it('calculates hourly values when hoursPerWeek is provided', () => {
      const results = convertToPeriods(annualValues, 40);
      expect(results.hourly.gross).toBeCloseTo(5.77, 2);
    });

    it('falls back to default hours when hoursPerWeek is zero', () => {
      const results = convertToPeriods(annualValues, 0);
      expect(results.hourly.gross).toBeCloseTo(12000 / (52 * 40), 2);
    });

    it('returns annual values unchanged for annually', () => {
      const results = convertToPeriods(annualValues, 40);
      expect(results.annually.gross).toBe(12000);
      expect(results.annually.net).toBe(10200);
    });
  });
});
