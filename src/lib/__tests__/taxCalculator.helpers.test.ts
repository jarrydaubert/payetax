/**
 * Tax Calculator Helper Tests
 *
 * What bug will this test find?
 * - CALC-DRIFT: helper math regressions (allowance reduction, pensions, bands)
 * - TAX-CODE-OVERRIDES: parseTaxCode handling
 * - ROUNDING: NI and student loan rounding changes
 */

import { PERIODS } from '@/constants/taxRates';
import {
  calculateAllowanceReduction,
  calculateIncomeTaxFromBands,
  calculateNIContributions,
  calculatePensionAmount,
  calculateStudentLoanRepayments,
  convertToPeriods,
  parsePersonalAllowanceFromTaxCode,
  parseTaxCode,
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

  describe('parsePersonalAllowanceFromTaxCode', () => {
    it('delegates to parseTaxCode for standard allowance parsing', () => {
      // Bug caught: legacy helper drifting from parseTaxCode behavior.
      expect(parsePersonalAllowanceFromTaxCode('1257L', 12570)).toBe(12570);
    });

    it('handles K-codes via negative allowance', () => {
      expect(parsePersonalAllowanceFromTaxCode('K100', 12570)).toBe(-1000);
    });
  });

  describe('calculateAllowanceReduction', () => {
    it('returns zero when below threshold', () => {
      expect(calculateAllowanceReduction(90000, 12570, 100000, 0.5)).toBe(0);
    });

    it('reduces allowance by £1 per £2 above threshold (rounded to £2)', () => {
      expect(calculateAllowanceReduction(110000, 12570, 100000, 0.5)).toBe(5000);
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

  describe('calculateNIContributions', () => {
    const rates = {
      primaryThreshold: 12570,
      upperEarningsLimit: 50270,
      employeeRate: 8,
      employeeRateAboveUEL: 2,
    };

    it('returns zero when payNoNI is true', () => {
      expect(calculateNIContributions(3000, rates, true, false)).toBe(0);
    });

    it('returns zero for state pension age', () => {
      expect(calculateNIContributions(3000, rates, false, true)).toBe(0);
    });

    it('calculates NI within primary band', () => {
      // 3000 - 1047.5 = 1952.5 * 8% = 156.2
      expect(calculateNIContributions(3000, rates, false, false)).toBeCloseTo(156.2, 2);
    });

    it('calculates NI above the upper earnings limit', () => {
      // Above UEL applies reduced rate
      expect(calculateNIContributions(6000, rates, false, false)).toBeCloseTo(287.55, 2);
    });
  });

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
