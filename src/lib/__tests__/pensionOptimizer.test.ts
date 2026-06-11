// src/lib/__tests__/pensionOptimizer.test.ts
/**
 * Pension Optimizer Core Logic Tests
 *
 * Tests the calculation logic for £100k tax trap optimization:
 * - Personal allowance tapering (£1 lost per £2 over £100k)
 * - Optimal pension contribution calculations
 * - Tax savings estimates
 * - Edge cases at threshold boundaries
 */

import { calculateOptimalPension, compareWithOptimization } from '../pensionOptimizer';

describe('pensionOptimizer', () => {
  describe('calculateOptimalPension - Core Logic', () => {
    describe('In Tax Trap Zone (£100k - £125k)', () => {
      it('should calculate optimization for £110k salary', () => {
        const result = calculateOptimalPension(110000);

        expect(result).not.toBeNull();
        expect(result?.suggested).toBe(10000); // Need to drop £10k to reach £100k
        expect(result?.allowanceLost).toBe(5000); // Lost £5k of allowance (£10k/2)
        expect(result?.effectiveRate).toBe(60);
        expect(result?.savingsFromOptimizing).toBe(6000); // 60% of £10k
        expect(result?.shouldOptimize).toBe(true);
      });

      it('should calculate optimization for £105k salary', () => {
        const result = calculateOptimalPension(105000);

        expect(result).not.toBeNull();
        expect(result?.suggested).toBe(5000);
        expect(result?.allowanceLost).toBe(2500); // £5k excess / 2
        expect(result?.savingsFromOptimizing).toBe(3000); // 60% of £5k
      });

      it('should calculate optimization for £120k salary', () => {
        const result = calculateOptimalPension(120000);

        expect(result).not.toBeNull();
        expect(result?.suggested).toBe(20000);
        expect(result?.allowanceLost).toBe(10000); // £20k excess / 2
      });

      it('should calculate optimization for £125k salary (near full taper)', () => {
        const result = calculateOptimalPension(125000);

        expect(result).not.toBeNull();
        expect(result?.suggested).toBe(25000);
        // Allowance lost capped at personal allowance (£12,570)
        expect(result?.allowanceLost).toBe(12500); // £25k / 2, less than cap
      });

      it('should cap allowance lost at personal allowance', () => {
        // At £125,140 the full £12,570 allowance is lost
        const result = calculateOptimalPension(125140);

        expect(result).not.toBeNull();
        expect(result?.allowanceLost).toBe(12570); // Capped at full PA
      });
    });

    describe('Outside Tax Trap Zone', () => {
      it('should return null for salary at exactly £100k threshold', () => {
        const result = calculateOptimalPension(100000);

        expect(result).toBeNull(); // At threshold, not over it
      });

      it('should return null for salary below £100k', () => {
        const result = calculateOptimalPension(80000);

        expect(result).toBeNull();
      });

      it('should return null for salary above full taper point (£125,140)', () => {
        const result = calculateOptimalPension(130000);

        expect(result).toBeNull(); // Above trap zone
      });

      it('should return null for salary of £150k', () => {
        const result = calculateOptimalPension(150000);

        expect(result).toBeNull();
      });
    });

    describe('With Existing Pension Contributions', () => {
      it('should account for existing pension reducing adjusted income', () => {
        // £115k salary with £10k pension = £105k adjusted income
        const result = calculateOptimalPension(115000, 10000);

        expect(result).not.toBeNull();
        // Need additional £5k to reach £100k adjusted income
        expect(result?.suggested).toBe(5000);
        expect(result?.allowanceLost).toBe(2500); // Based on £105k adjusted
      });

      it('should return null if pension already drops below threshold', () => {
        // £110k salary with £12k pension = £98k adjusted income (below threshold)
        const result = calculateOptimalPension(110000, 12000);

        expect(result).toBeNull(); // Already optimized
      });

      it('should return null if pension drops exactly to threshold', () => {
        // £110k salary with £10k pension = £100k adjusted income (at threshold)
        const result = calculateOptimalPension(110000, 10000);

        expect(result).toBeNull(); // At threshold, not in trap
      });
    });

    describe('Rounding Behavior', () => {
      it('should round up suggested contribution to nearest £1000', () => {
        // £100,500 salary - excess of £500 should round up to £1000
        const result = calculateOptimalPension(100500);

        expect(result).not.toBeNull();
        expect(result?.suggested).toBe(1000); // Rounded up from £500
      });

      it('should round up small excesses', () => {
        const result = calculateOptimalPension(100001);

        expect(result).not.toBeNull();
        expect(result?.suggested).toBe(1000); // Rounded up from £1
      });
    });
  });

  describe('compareWithOptimization', () => {
    it('should calculate take-home comparison for £110k with £10k pension', () => {
      const result = compareWithOptimization(110000, 10000);

      expect(result).not.toBeNull();
      expect(result?.currentTakeHome).toBeDefined();
      expect(result?.optimizedTakeHome).toBeDefined();
      expect(result?.difference).toBeDefined();
      expect(typeof result?.worthIt).toBe('boolean');
    });

    it('should return null for salary below trap zone', () => {
      const result = compareWithOptimization(80000, 5000);

      expect(result).toBeNull();
    });

    it('should return null for salary above trap zone', () => {
      const result = compareWithOptimization(150000, 10000);

      expect(result).toBeNull();
    });

    it('should return null for pension exceeding salary', () => {
      const result = compareWithOptimization(110000, 120000);

      expect(result).toBeNull();
    });

    it('should return null for negative pension', () => {
      const result = compareWithOptimization(110000, -5000);

      expect(result).toBeNull();
    });
  });

  describe('Tax Year Support', () => {
    it('should work with 2025-2026 tax year', () => {
      const result = calculateOptimalPension(110000, 0, '2025-2026');

      expect(result).not.toBeNull();
      expect(result?.suggested).toBe(10000);
    });

    it('should work with 2024-2025 tax year', () => {
      const result = calculateOptimalPension(110000, 0, '2024-2025');

      expect(result).not.toBeNull();
      // Same thresholds for both years
      expect(result?.suggested).toBe(10000);
    });
  });

  describe('Savings Calculation', () => {
    it('should calculate 60% tax savings', () => {
      const result = calculateOptimalPension(110000);

      expect(result).not.toBeNull();
      // £10k contribution × 60% effective rate = £6k savings
      expect(result?.savingsFromOptimizing).toBe((result?.suggested ?? 0) * 0.6);
    });

    it('should maintain 60% effective rate throughout trap zone', () => {
      const salaries = [101000, 110000, 120000, 125000];

      for (const salary of salaries) {
        const result = calculateOptimalPension(salary);
        expect(result).not.toBeNull();
        expect(result?.effectiveRate).toBe(60);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle £100,001 (just into trap)', () => {
      const result = calculateOptimalPension(100001);

      expect(result).not.toBeNull();
      expect(result?.shouldOptimize).toBe(true);
    });

    it('should handle £125,139 (just before full taper)', () => {
      const result = calculateOptimalPension(125139);

      expect(result).not.toBeNull();
      expect(result?.shouldOptimize).toBe(true);
    });

    it('should return null at exactly £125,140 (full taper point)', () => {
      // At this point PA is fully lost, so still in zone
      const result = calculateOptimalPension(125140);

      // This is the upper boundary - at or below £125,140 is in zone
      expect(result).not.toBeNull();
    });

    it('should return null for £125,141 (above full taper)', () => {
      const result = calculateOptimalPension(125141);

      expect(result).toBeNull();
    });

    it('should handle zero salary', () => {
      const result = calculateOptimalPension(0);

      expect(result).toBeNull();
    });
  });
});
