/**
 * Tax Calculator Helper Tests
 *
 * What bug will this test find?
 * - CALC-DRIFT: helper math regressions (allowance reduction, pensions, bands)
 * - TAX-CODE-OVERRIDES: parseTaxCode handling
 * - ROUNDING: NI and student loan rounding changes
 */

import { parseTaxCode } from '@/lib/tax';
import { calculateAllowanceReduction, calculatePensionAmount } from '../taxCalculator';

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

  // Band coverage moved to the shared mechanic. `calculateIncomeTaxFromBands`
  // was deleted with the rUK income-tax vertical: it had no production callers,
  // and it re-derived band boundaries from an allowance parameter instead of
  // the engine's cumulative taxable-income thresholds. See rukIncomeTax.test.ts.

  // NI helper coverage moved to the shared mechanic. `calculateNIContributions`
  // was deleted with the NI vertical: it had no production callers, and its
  // £1,047.50 monthly threshold (annual / 12) had already drifted from the
  // engine's published £1,048. See nationalInsuranceVertical.test.ts.

  // Student loan coverage moved to the shared mechanic.
  // `calculateStudentLoanRepayments` was deleted with the student-loan
  // vertical: it had no production callers and duplicated the engine's
  // monthly loop. See studentLoan.test.ts.

  // Period-projection coverage lives on the production route. `convertToPeriods`
  // was deleted as a dead duplicate of the engine's inline projection: the
  // engine's monthly/weekly/four-weekly/hourly outputs and the zero-hours
  // fallback are asserted in taxCalculator.test.ts and
  // taxCalculator.comprehensive.test.ts against calculateTax results.
});
