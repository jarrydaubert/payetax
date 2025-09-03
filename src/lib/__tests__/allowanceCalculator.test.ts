// src/lib/__tests__/allowanceCalculator.test.ts

import type { TaxYear } from '@/constants/taxRates';
import {
  calculateAllowance,
  getTaxCodeLetter,
  getTaxCodeValue,
  isScottishTaxCode,
} from '../allowanceCalculator';

describe('Allowance Calculator', () => {
  const defaultTaxYear: TaxYear = '2024-2025';
  const defaultSalary = 50000;

  describe('calculateAllowance', () => {
    describe('Standard tax codes', () => {
      test('should calculate correct allowance for standard L code', () => {
        const result = calculateAllowance(defaultSalary, '1257L', defaultTaxYear);

        expect(result.allowance).toBe(12570);
        expect(result.marriageAllowance).toBe(0);
        expect(result.adjustedTaxCode).toBe('1257L');
      });

      test('should handle Scottish tax code with S prefix', () => {
        const result = calculateAllowance(defaultSalary, 'S1257L', defaultTaxYear);

        expect(result.allowance).toBe(12570);
        expect(result.adjustedTaxCode).toBe('1257L');
      });

      test('should handle different numeric values in tax code', () => {
        const result = calculateAllowance(defaultSalary, '1000L', defaultTaxYear);

        expect(result.allowance).toBe(10000);
        expect(result.adjustedTaxCode).toBe('1000L');
      });
    });

    describe('Special tax codes', () => {
      test('should handle BR (Basic Rate) tax code', () => {
        const result = calculateAllowance(defaultSalary, 'BR', defaultTaxYear);

        expect(result.allowance).toBe(0);
        expect(result.adjustedTaxCode).toBe('BR');
      });

      test('should handle D0 (Higher Rate) tax code', () => {
        const result = calculateAllowance(defaultSalary, 'D0', defaultTaxYear);

        expect(result.allowance).toBe(0);
        expect(result.adjustedTaxCode).toBe('D0');
      });

      test('should handle D1 (Additional Rate) tax code', () => {
        const result = calculateAllowance(defaultSalary, 'D1', defaultTaxYear);

        expect(result.allowance).toBe(0);
        expect(result.adjustedTaxCode).toBe('D1');
      });

      test('should handle NT (No Tax) tax code', () => {
        const result = calculateAllowance(defaultSalary, 'NT', defaultTaxYear);

        expect(result.allowance).toBe(defaultSalary);
        expect(result.adjustedTaxCode).toBe('NT');
      });

      test('should handle 0T (No Personal Allowance) tax code', () => {
        const result = calculateAllowance(defaultSalary, '0T', defaultTaxYear);

        expect(result.allowance).toBe(0);
        expect(result.adjustedTaxCode).toBe('0T');
      });

      test('should handle K codes (negative allowance)', () => {
        const result = calculateAllowance(defaultSalary, 'K500', defaultTaxYear);

        expect(result.allowance).toBe(-5000);
        expect(result.adjustedTaxCode).toBe('K500');
      });
    });

    describe('Marriage allowance codes', () => {
      test('should handle M code (receiving marriage allowance)', () => {
        const result = calculateAllowance(defaultSalary, '1382M', defaultTaxYear);

        expect(result.allowance).toBe(13820 + 1260); // Base + marriage allowance
        expect(result.marriageAllowance).toBe(1260);
        expect(result.adjustedTaxCode).toBe('1382M');
      });

      test('should handle N code (giving marriage allowance)', () => {
        const result = calculateAllowance(defaultSalary, '1131N', defaultTaxYear);

        expect(result.allowance).toBe(11310 - 1260); // Base - marriage allowance
        expect(result.adjustedTaxCode).toBe('1131N');
      });
    });

    describe("Blind person's allowance", () => {
      test("should add blind person's allowance when isBlind is true", () => {
        const result = calculateAllowance(defaultSalary, '1257L', defaultTaxYear, false, true);

        expect(result.allowance).toBe(12570 + 3070); // Standard + blind allowance
      });

      test('should work with special codes and blind allowance', () => {
        const result = calculateAllowance(defaultSalary, 'K500', defaultTaxYear, false, true);

        expect(result.allowance).toBe(-5000 + 3070); // K code + blind allowance
      });
    });

    describe('Marriage allowance eligibility', () => {
      test('should apply marriage allowance when eligible', () => {
        // Person earning above allowance, partner earning below
        const result = calculateAllowance(
          30000, // salary above personal allowance
          '1257L',
          defaultTaxYear,
          false,
          false,
          true, // married
          10000 // partner income below personal allowance
        );

        expect(result.marriageAllowance).toBe(1260);
        expect(result.allowance).toBe(12570 + 1260);
      });

      test('should not apply marriage allowance if partner income too high', () => {
        const result = calculateAllowance(
          30000,
          '1257L',
          defaultTaxYear,
          false,
          false,
          true,
          15000 // partner income above personal allowance
        );

        expect(result.marriageAllowance).toBe(0);
        expect(result.allowance).toBe(12570);
      });

      test('should not apply marriage allowance if person earns too much', () => {
        const result = calculateAllowance(
          60000, // too high for basic rate
          '1257L',
          defaultTaxYear,
          false,
          false,
          true,
          10000
        );

        expect(result.marriageAllowance).toBe(0);
      });

      test('should not apply marriage allowance if already has M code', () => {
        const result = calculateAllowance(
          30000,
          '1382M', // already has marriage allowance in code
          defaultTaxYear,
          false,
          false,
          true,
          10000
        );

        expect(result.marriageAllowance).toBe(1260); // From M code only
        expect(result.allowance).toBe(13820 + 1260); // No double application
      });
    });

    describe('High earner allowance reduction', () => {
      test('should reduce allowance for high earners', () => {
        const highSalary = 120000; // Above reduction threshold (£100,000)
        const result = calculateAllowance(highSalary, '1257L', defaultTaxYear);

        // Reduction = (120000 - 100000) / 2 = 10000
        // Final allowance = 12570 - 10000 = 2570
        expect(result.allowance).toBe(2570);
      });

      test('should eliminate allowance for very high earners', () => {
        const veryHighSalary = 150000; // Well above threshold
        const result = calculateAllowance(veryHighSalary, '1257L', defaultTaxYear);

        // Reduction would be (150000 - 100000) / 2 = 25000
        // But allowance can't go below 0
        expect(result.allowance).toBe(0);
      });

      test('should not reduce allowance below zero', () => {
        const extremeSalary = 200000;
        const result = calculateAllowance(extremeSalary, '1257L', defaultTaxYear);

        expect(result.allowance).toBe(0);
      });
    });

    describe('Edge cases and validation', () => {
      test('should handle empty tax code', () => {
        const result = calculateAllowance(defaultSalary, '', defaultTaxYear);

        expect(result.allowance).toBe(12570); // Default personal allowance
      });

      test('should handle whitespace in tax code', () => {
        const result = calculateAllowance(defaultSalary, '  1257L  ', defaultTaxYear);

        expect(result.allowance).toBe(12570);
        expect(result.adjustedTaxCode).toBe('1257L');
      });

      test('should handle lowercase tax codes', () => {
        const result = calculateAllowance(defaultSalary, '1257l', defaultTaxYear);

        expect(result.allowance).toBe(12570);
        expect(result.adjustedTaxCode).toBe('1257L');
      });

      test('should handle invalid tax code formats gracefully', () => {
        const result = calculateAllowance(defaultSalary, 'INVALID', defaultTaxYear);

        expect(result.allowance).toBe(12570); // Falls back to base allowance
      });
    });

    describe('Different tax years', () => {
      test('should work with different tax years', () => {
        const result2023 = calculateAllowance(defaultSalary, '1257L', '2023-2024');
        const result2024 = calculateAllowance(defaultSalary, '1257L', '2024-2025');

        // Both should use their respective personal allowance rates
        expect(result2023.allowance).toBe(12570);
        expect(result2024.allowance).toBe(12570);
      });
    });
  });

  describe('isScottishTaxCode', () => {
    test('should return true for Scottish tax codes', () => {
      expect(isScottishTaxCode('S1257L')).toBe(true);
      expect(isScottishTaxCode('s1257l')).toBe(true);
      expect(isScottishTaxCode('  S1257L  ')).toBe(true);
    });

    test('should return false for non-Scottish tax codes', () => {
      expect(isScottishTaxCode('1257L')).toBe(false);
      expect(isScottishTaxCode('BR')).toBe(false);
      expect(isScottishTaxCode('K500')).toBe(false);
      expect(isScottishTaxCode('')).toBe(false);
    });
  });

  describe('getTaxCodeLetter', () => {
    test('should return correct letters for standard codes', () => {
      expect(getTaxCodeLetter('1257L')).toBe('L');
      expect(getTaxCodeLetter('1382M')).toBe('M');
      expect(getTaxCodeLetter('1131N')).toBe('N');
      expect(getTaxCodeLetter('1257T')).toBe('T');
    });

    test('should handle Scottish codes', () => {
      expect(getTaxCodeLetter('S1257L')).toBe('L');
      expect(getTaxCodeLetter('S1382M')).toBe('M');
    });

    test('should return K for K codes', () => {
      expect(getTaxCodeLetter('K500')).toBe('K');
      expect(getTaxCodeLetter('K123')).toBe('K');
    });

    test('should return empty string for special codes', () => {
      expect(getTaxCodeLetter('BR')).toBe('');
      expect(getTaxCodeLetter('D0')).toBe('');
      expect(getTaxCodeLetter('D1')).toBe('');
      expect(getTaxCodeLetter('NT')).toBe('');
      expect(getTaxCodeLetter('0T')).toBe('');
    });

    test('should handle case insensitivity and whitespace', () => {
      expect(getTaxCodeLetter('  1257l  ')).toBe('L');
      expect(getTaxCodeLetter('br')).toBe('');
    });

    test('should return empty string for invalid codes', () => {
      expect(getTaxCodeLetter('INVALID')).toBe('');
      expect(getTaxCodeLetter('123')).toBe('');
      expect(getTaxCodeLetter('')).toBe('');
    });
  });

  describe('getTaxCodeValue', () => {
    test('should return correct numeric values for standard codes', () => {
      expect(getTaxCodeValue('1257L')).toBe(12570);
      expect(getTaxCodeValue('1000L')).toBe(10000);
      expect(getTaxCodeValue('500L')).toBe(5000);
    });

    test('should handle Scottish codes', () => {
      expect(getTaxCodeValue('S1257L')).toBe(12570);
      expect(getTaxCodeValue('S1000M')).toBe(10000);
    });

    test('should return negative values for K codes', () => {
      expect(getTaxCodeValue('K500')).toBe(-5000);
      expect(getTaxCodeValue('K123')).toBe(-1230);
      expect(getTaxCodeValue('K999')).toBe(-9990);
    });

    test('should return 0 for special codes', () => {
      expect(getTaxCodeValue('BR')).toBe(0);
      expect(getTaxCodeValue('D0')).toBe(0);
      expect(getTaxCodeValue('D1')).toBe(0);
      expect(getTaxCodeValue('NT')).toBe(0);
      expect(getTaxCodeValue('0T')).toBe(0);
    });

    test('should handle case insensitivity and whitespace', () => {
      expect(getTaxCodeValue('  1257l  ')).toBe(12570);
      expect(getTaxCodeValue('k500')).toBe(-5000);
      expect(getTaxCodeValue('br')).toBe(0);
    });

    test('should return 0 for invalid codes', () => {
      expect(getTaxCodeValue('INVALID')).toBe(0);
      expect(getTaxCodeValue('')).toBe(0);
      expect(getTaxCodeValue('ABC')).toBe(0);
    });

    test('should handle codes without letters', () => {
      expect(getTaxCodeValue('1257')).toBe(12570);
      expect(getTaxCodeValue('S1000')).toBe(10000);
    });
  });

  describe('Integration tests', () => {
    test('should handle complex scenario with all features', () => {
      // High earning Scottish taxpayer, married, blind, with M code
      const result = calculateAllowance(
        80000, // High salary but below reduction threshold
        'S1382M', // Scottish, marriage allowance received
        defaultTaxYear,
        true, // Scottish (parameter, though code already indicates this)
        true, // Blind
        true, // Married
        8000 // Partner low income
      );

      expect(result.adjustedTaxCode).toBe('1382M');
      expect(result.allowance).toBe(13820 + 1260 + 3070); // Base + marriage + blind
      expect(result.marriageAllowance).toBe(1260);
    });

    test('should handle edge case of exactly at reduction threshold', () => {
      const result = calculateAllowance(100000, '1257L', defaultTaxYear);

      // At exactly £100,000, no reduction should apply
      expect(result.allowance).toBe(12570);
    });

    test('should handle edge case just above reduction threshold', () => {
      const result = calculateAllowance(100001, '1257L', defaultTaxYear);

      // Reduction = (100001 - 100000) / 2 = 0.5, floored to 0
      expect(result.allowance).toBe(12570);
    });

    test('should handle K code with blind allowance correctly', () => {
      const result = calculateAllowance(50000, 'K100', defaultTaxYear, false, true);

      // K100 = -1000, plus blind allowance +3070 = 2070
      expect(result.allowance).toBe(2070);
    });
  });
});
