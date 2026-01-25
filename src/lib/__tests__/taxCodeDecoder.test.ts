// src/lib/__tests__/taxCodeDecoder.test.ts
/**
 * Tax Code Decoder Tests
 *
 * Tests the parsing and interpretation of UK HMRC tax codes including:
 * - Standard codes (1257L)
 * - Scottish/Welsh prefixes (S, C)
 * - Special codes (BR, D0, D1, NT, 0T)
 * - K codes (negative allowance)
 * - Emergency codes (W1, M1, X)
 * - Marriage allowance (M, N)
 * - Invalid/edge cases
 */

import { decodeTaxCode, formatAllowance } from '../taxCodeDecoder';

describe('taxCodeDecoder', () => {
  describe('Standard Tax Codes', () => {
    it('should decode 1257L correctly', () => {
      const result = decodeTaxCode('1257L');

      expect(result.isValid).toBe(true);
      expect(result.code).toBe('1257L');
      expect(result.allowance).toBe(12570);
      expect(result.letter).toBe('L');
      expect(result.isScottish).toBe(false);
      expect(result.isWelsh).toBe(false);
      expect(result.isEmergency).toBe(false);
      expect(result.meaning).toBe('Standard personal allowance');
    });

    it('should decode lowercase 1257l correctly', () => {
      const result = decodeTaxCode('1257l');

      expect(result.isValid).toBe(true);
      expect(result.code).toBe('1257L');
      expect(result.allowance).toBe(12570);
    });

    it('should handle codes with whitespace', () => {
      const result = decodeTaxCode('  1257L  ');

      expect(result.isValid).toBe(true);
      expect(result.allowance).toBe(12570);
    });

    it('should decode 1000L correctly', () => {
      const result = decodeTaxCode('1000L');

      expect(result.isValid).toBe(true);
      expect(result.allowance).toBe(10000);
      expect(result.details.some((d) => d.includes('below the standard amount'))).toBe(true);
    });

    it('should decode 1500L correctly (higher than standard)', () => {
      const result = decodeTaxCode('1500L');

      expect(result.isValid).toBe(true);
      expect(result.allowance).toBe(15000);
      expect(result.details.some((d) => d.includes('higher than standard'))).toBe(true);
    });

    it('should decode T suffix correctly', () => {
      const result = decodeTaxCode('1000T');

      expect(result.isValid).toBe(true);
      expect(result.letter).toBe('T');
      expect(result.meaning).toBe('Other calculations required');
    });
  });

  describe('Scottish Tax Codes', () => {
    it('should decode S1257L correctly', () => {
      const result = decodeTaxCode('S1257L');

      expect(result.isValid).toBe(true);
      expect(result.isScottish).toBe(true);
      expect(result.prefix).toBe('S');
      expect(result.allowance).toBe(12570);
      expect(result.details.some((d) => d.includes('Scottish'))).toBe(true);
    });

    it('should decode SBR correctly', () => {
      const result = decodeTaxCode('SBR');

      expect(result.isValid).toBe(true);
      expect(result.isScottish).toBe(true);
      expect(result.letter).toBe('BR');
      expect(result.allowance).toBe(0);
    });

    it('should decode S0T correctly', () => {
      const result = decodeTaxCode('S0T');

      expect(result.isValid).toBe(true);
      expect(result.isScottish).toBe(true);
      expect(result.letter).toBe('0T');
    });
  });

  describe('Welsh Tax Codes', () => {
    it('should decode C1257L correctly', () => {
      const result = decodeTaxCode('C1257L');

      expect(result.isValid).toBe(true);
      expect(result.isWelsh).toBe(true);
      expect(result.prefix).toBe('C');
      expect(result.allowance).toBe(12570);
      expect(result.details.some((d) => d.includes('Welsh'))).toBe(true);
    });

    it('should decode CBR correctly', () => {
      const result = decodeTaxCode('CBR');

      expect(result.isValid).toBe(true);
      expect(result.isWelsh).toBe(true);
      expect(result.letter).toBe('BR');
    });
  });

  describe('Special Tax Codes', () => {
    it('should decode BR correctly', () => {
      const result = decodeTaxCode('BR');

      expect(result.isValid).toBe(true);
      expect(result.letter).toBe('BR');
      expect(result.allowance).toBe(0);
      expect(result.meaning).toBe('Basic rate on all income');
      expect(result.details.some((d) => d.includes('20%'))).toBe(true);
    });

    it('should decode D0 correctly', () => {
      const result = decodeTaxCode('D0');

      expect(result.isValid).toBe(true);
      expect(result.letter).toBe('D0');
      expect(result.allowance).toBe(0);
      expect(result.meaning).toBe('Higher rate on all income');
      expect(result.details.some((d) => d.includes('40%'))).toBe(true);
    });

    it('should decode D1 correctly', () => {
      const result = decodeTaxCode('D1');

      expect(result.isValid).toBe(true);
      expect(result.letter).toBe('D1');
      expect(result.allowance).toBe(0);
      expect(result.meaning).toBe('Additional rate on all income');
      expect(result.details.some((d) => d.includes('45%'))).toBe(true);
    });

    it('should decode NT correctly', () => {
      const result = decodeTaxCode('NT');

      expect(result.isValid).toBe(true);
      expect(result.letter).toBe('NT');
      expect(result.allowance).toBe(0);
      expect(result.meaning).toBe('No tax deducted');
    });

    it('should decode 0T correctly', () => {
      const result = decodeTaxCode('0T');

      expect(result.isValid).toBe(true);
      expect(result.letter).toBe('0T');
      expect(result.allowance).toBe(0);
      expect(result.meaning).toBe('No Personal Allowance');
    });
  });

  describe('K Codes (Negative Allowance)', () => {
    it('should decode K100 correctly', () => {
      const result = decodeTaxCode('K100');

      expect(result.isValid).toBe(true);
      expect(result.letter).toBe('K');
      expect(result.allowance).toBe(-1000);
      expect(result.meaning).toBe('Tax code adds to your taxable income');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should decode K475 correctly', () => {
      const result = decodeTaxCode('K475');

      expect(result.isValid).toBe(true);
      expect(result.allowance).toBe(-4750);
      expect(result.details.some((d) => d.includes('4,750'))).toBe(true);
    });

    it('should decode SK100 (Scottish K code) correctly', () => {
      const result = decodeTaxCode('SK100');

      expect(result.isValid).toBe(true);
      expect(result.isScottish).toBe(true);
      expect(result.letter).toBe('K');
      expect(result.allowance).toBe(-1000);
    });
  });

  describe('Emergency Tax Codes', () => {
    it('should decode 1257L W1 correctly', () => {
      const result = decodeTaxCode('1257LW1');

      expect(result.isValid).toBe(true);
      expect(result.isEmergency).toBe(true);
      expect(result.suffix).toBe('W1');
      expect(result.allowance).toBe(12570);
      expect(result.warnings.some((w) => w.includes('emergency'))).toBe(true);
    });

    it('should decode 1257L M1 correctly', () => {
      const result = decodeTaxCode('1257LM1');

      expect(result.isValid).toBe(true);
      expect(result.isEmergency).toBe(true);
      expect(result.suffix).toBe('M1');
    });

    it('should decode 1257L X correctly', () => {
      const result = decodeTaxCode('1257LX');

      expect(result.isValid).toBe(true);
      expect(result.isEmergency).toBe(true);
      expect(result.suffix).toBe('X');
      expect(result.warnings.some((w) => w.includes('non-cumulative'))).toBe(true);
    });

    it('should decode S1257LW1 (Scottish emergency) correctly', () => {
      const result = decodeTaxCode('S1257LW1');

      expect(result.isValid).toBe(true);
      expect(result.isScottish).toBe(true);
      expect(result.isEmergency).toBe(true);
      expect(result.prefix).toBe('S');
      expect(result.suffix).toBe('W1');
    });
  });

  describe('Marriage Allowance Codes', () => {
    it('should decode 1257M correctly (receiving)', () => {
      const result = decodeTaxCode('1257M');

      expect(result.isValid).toBe(true);
      expect(result.letter).toBe('M');
      expect(result.allowance).toBe(12570);
      expect(result.meaning).toBe('Marriage Allowance - receiving');
      expect(result.details.some((d) => d.includes('1,260'))).toBe(true);
    });

    it('should decode 1257N correctly (transferring)', () => {
      const result = decodeTaxCode('1257N');

      expect(result.isValid).toBe(true);
      expect(result.letter).toBe('N');
      expect(result.allowance).toBe(12570);
      expect(result.meaning).toBe('Marriage Allowance - transferring');
    });
  });

  describe('Invalid and Edge Cases', () => {
    it('should handle empty string', () => {
      const result = decodeTaxCode('');

      expect(result.isValid).toBe(false);
      expect(result.meaning).toBe('No tax code provided');
    });

    it('should handle whitespace only', () => {
      const result = decodeTaxCode('   ');

      expect(result.isValid).toBe(false);
    });

    it('should handle invalid format', () => {
      const result = decodeTaxCode('INVALID');

      expect(result.isValid).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.meaning).toBe('Unrecognized tax code format');
    });

    it('should handle numbers only (no letter)', () => {
      const result = decodeTaxCode('1257');

      // Numbers without letter should still be valid (implied L)
      expect(result.isValid).toBe(true);
      expect(result.allowance).toBe(12570);
    });

    it('should handle code with special characters', () => {
      const result = decodeTaxCode('1257L!');

      expect(result.isValid).toBe(false);
    });
  });

  describe('formatAllowance', () => {
    it('should format positive allowance', () => {
      expect(formatAllowance(12570)).toBe('£12,570');
    });

    it('should format zero allowance', () => {
      expect(formatAllowance(0)).toBe('£0');
    });

    it('should format negative allowance (K codes)', () => {
      expect(formatAllowance(-4750)).toBe('-£4,750');
    });

    it('should handle null', () => {
      expect(formatAllowance(null)).toBe('N/A');
    });
  });
});
