/**
 * Employer National Insurance Calculator Tests
 *
 * Tests the Employer NI calculation for director salaries.
 * Verifies against known HMRC rates and thresholds.
 *
 * @see https://www.gov.uk/national-insurance-rates-letters
 */

import {
  calculateEmployerNI,
  getEmployerNI,
  getEmployerNIRate,
  getEmployerNIThreshold,
} from '../employerNI';

describe('Employer NI Calculator', () => {
  describe('calculateEmployerNI', () => {
    describe('2025-26 rates (15% above £5,000)', () => {
      it('should calculate correctly for standard director salary (£12,570)', () => {
        const result = calculateEmployerNI(12570, '2025-2026');

        // (12570 - 5000) × 0.15 = 7570 × 0.15 = 1135.50
        expect(result.employerNI).toBe(1135.5);
        expect(result.salaryAboveThreshold).toBe(7570);
        expect(result.threshold).toBe(5000);
        expect(result.rate).toBe(0.15);
      });

      it('should return 0 when salary is below threshold', () => {
        const result = calculateEmployerNI(4000, '2025-2026');

        expect(result.employerNI).toBe(0);
        expect(result.salaryAboveThreshold).toBe(0);
      });

      it('should return 0 when salary equals threshold', () => {
        const result = calculateEmployerNI(5000, '2025-2026');

        expect(result.employerNI).toBe(0);
        expect(result.salaryAboveThreshold).toBe(0);
      });

      it('should calculate correctly for salary just above threshold', () => {
        const result = calculateEmployerNI(5001, '2025-2026');

        // (5001 - 5000) × 0.15 = 1 × 0.15 = 0.15
        expect(result.employerNI).toBe(0.15);
        expect(result.salaryAboveThreshold).toBe(1);
      });

      it('should calculate correctly for higher salaries', () => {
        const result = calculateEmployerNI(50000, '2025-2026');

        // (50000 - 5000) × 0.15 = 45000 × 0.15 = 6750
        expect(result.employerNI).toBe(6750);
        expect(result.salaryAboveThreshold).toBe(45000);
      });
    });

    describe('2024-25 rates (13.8% above £9,100)', () => {
      it('should calculate correctly with 2024-25 rates', () => {
        const result = calculateEmployerNI(12570, '2024-2025');

        // (12570 - 9100) × 0.138 = 3470 × 0.138 = 478.86
        expect(result.employerNI).toBe(478.86);
        expect(result.threshold).toBe(9100);
        expect(result.rate).toBe(0.138);
      });

      it('should return 0 when salary is below 2024-25 threshold', () => {
        const result = calculateEmployerNI(9000, '2024-2025');

        expect(result.employerNI).toBe(0);
      });
    });

    describe('Edge cases', () => {
      it('should return 0 for zero salary', () => {
        const result = calculateEmployerNI(0, '2025-2026');

        expect(result.employerNI).toBe(0);
        expect(result.salary).toBe(0);
      });

      it('should return 0 for negative salary', () => {
        const result = calculateEmployerNI(-1000, '2025-2026');

        expect(result.employerNI).toBe(0);
      });

      it('should round to pence correctly', () => {
        const result = calculateEmployerNI(12345, '2025-2026');

        // (12345 - 5000) × 0.15 = 7345 × 0.15 = 1101.75
        expect(result.employerNI).toBe(1101.75);
        expect(result.employerNI.toFixed(2)).toBe('1101.75');
      });

      it('should handle decimal salaries', () => {
        const result = calculateEmployerNI(12570.5, '2025-2026');

        // (12570.5 - 5000) × 0.15 = 7570.5 × 0.15 = 1135.575 → 1135.58
        expect(result.employerNI).toBe(1135.58);
      });

      it('should handle NaN salary gracefully', () => {
        const result = calculateEmployerNI(Number.NaN, '2025-2026');

        expect(result.employerNI).toBe(0);
        expect(result.salary).toBe(0);
      });

      it('should handle Infinity salary gracefully', () => {
        const result = calculateEmployerNI(Number.POSITIVE_INFINITY, '2025-2026');

        expect(result.employerNI).toBe(0);
      });

      it('should handle negative Infinity salary gracefully', () => {
        const result = calculateEmployerNI(Number.NEGATIVE_INFINITY, '2025-2026');

        expect(result.employerNI).toBe(0);
      });
    });

    describe('Year-on-year comparison', () => {
      it('should show increase from 2024-25 to 2025-26 for same salary', () => {
        const ni2024 = calculateEmployerNI(30000, '2024-2025');
        const ni2025 = calculateEmployerNI(30000, '2025-2026');

        // 2024-25: (30000 - 9100) × 0.138 = 2884.20
        // 2025-26: (30000 - 5000) × 0.15 = 3750.00
        expect(ni2025.employerNI).toBeGreaterThan(ni2024.employerNI);
        expect(ni2024.employerNI).toBe(2884.2);
        expect(ni2025.employerNI).toBe(3750);
      });
    });
  });

  describe('getEmployerNI (convenience function)', () => {
    it('should return just the NI amount', () => {
      expect(getEmployerNI(12570, '2025-2026')).toBe(1135.5);
      expect(getEmployerNI(5000, '2025-2026')).toBe(0);
      expect(getEmployerNI(0, '2025-2026')).toBe(0);
    });

    it('should default to 2025-2026 tax year', () => {
      expect(getEmployerNI(12570)).toBe(1135.5);
    });
  });

  describe('getEmployerNIThreshold', () => {
    it('should return correct threshold for 2025-26', () => {
      expect(getEmployerNIThreshold('2025-2026')).toBe(5000);
    });

    it('should return correct threshold for 2024-25', () => {
      expect(getEmployerNIThreshold('2024-2025')).toBe(9100);
    });

    it('should default to 2025-2026 tax year', () => {
      expect(getEmployerNIThreshold()).toBe(5000);
    });
  });

  describe('getEmployerNIRate', () => {
    it('should return correct rate for 2025-26', () => {
      expect(getEmployerNIRate('2025-2026')).toBe(0.15);
    });

    it('should return correct rate for 2024-25', () => {
      expect(getEmployerNIRate('2024-2025')).toBe(0.138);
    });

    it('should default to 2025-2026 tax year', () => {
      expect(getEmployerNIRate()).toBe(0.15);
    });
  });
});
