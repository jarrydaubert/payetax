/**
 * Employee NI calculator boundary tests.
 *
 * Covers threshold edges and non-finite input handling at function boundaries.
 */

import { calculateEmployeeNI, getEmployeeNI } from '../employeeNI';

describe('Employee NI Calculator', () => {
  describe('calculateEmployeeNI', () => {
    it('returns zero for non-finite or non-positive salaries', () => {
      expect(calculateEmployeeNI(Number.NaN)).toMatchObject({ salary: 0, employeeNI: 0 });
      expect(calculateEmployeeNI(Number.POSITIVE_INFINITY).employeeNI).toBe(0);
      expect(calculateEmployeeNI(Number.NEGATIVE_INFINITY).employeeNI).toBe(0);
      expect(calculateEmployeeNI(0).employeeNI).toBe(0);
      expect(calculateEmployeeNI(-1000).employeeNI).toBe(0);
    });

    it('returns zero at or below the primary threshold', () => {
      expect(calculateEmployeeNI(12569.99).employeeNI).toBe(0);
      expect(calculateEmployeeNI(12570).employeeNI).toBe(0);
    });

    it('calculates primary-band NI correctly just above threshold', () => {
      expect(calculateEmployeeNI(12571).employeeNI).toBeCloseTo(0.08, 2);
      expect(calculateEmployeeNI(30000).employeeNI).toBeCloseTo(1394.4, 2);
      expect(calculateEmployeeNI(50270).employeeNI).toBeCloseTo(3016, 2);
    });

    it('calculates additional 2% above the upper earnings limit', () => {
      expect(calculateEmployeeNI(50271).employeeNI).toBeCloseTo(3016.02, 2);
      expect(calculateEmployeeNI(60000).employeeNI).toBeCloseTo(3210.6, 2);
    });

    it('rounds decimal salaries to pence', () => {
      expect(calculateEmployeeNI(60000.55).employeeNI).toBeCloseTo(3210.61, 2);
    });

    it('returns threshold and rate metadata for 2025-26', () => {
      expect(calculateEmployeeNI(30000)).toMatchObject({
        primaryThreshold: 12570,
        upperEarningsLimit: 50270,
        primaryRate: 0.08,
        upperRate: 0.02,
      });
    });

    it('uses year-specific NI rates', () => {
      expect(calculateEmployeeNI(50270, '2023-2024').employeeNI).toBeCloseTo(4524, 2);
      expect(calculateEmployeeNI(50270, '2024-2025').employeeNI).toBeCloseTo(3016, 2);
      expect(calculateEmployeeNI(50270, '2025-2026').employeeNI).toBeCloseTo(3016, 2);
    });
  });

  describe('getEmployeeNI', () => {
    it('returns the same value as calculateEmployeeNI().employeeNI', () => {
      const salary = 60000;
      expect(getEmployeeNI(salary)).toBe(calculateEmployeeNI(salary).employeeNI);
    });

    it('defaults to 2025-2026 tax year', () => {
      expect(getEmployeeNI(60000)).toBe(getEmployeeNI(60000, '2025-2026'));
    });
  });
});
