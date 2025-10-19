// src/lib/pensionOptimizer.ts
/**
 * Pension Optimization Calculator for £100k Tax Trap
 *
 * Calculates optimal pension contributions for high earners (£100k-£125k)
 * to avoid the 60% effective tax rate zone caused by personal allowance tapering.
 *
 * How the £100k Tax Trap Works:
 * - For every £2 earned over £100k, you lose £1 of personal allowance
 * - This creates an effective 60% tax rate (40% income tax + 20% from lost allowance)
 * - The personal allowance (£12,570) is fully lost at £125,140
 *
 * Optimization Strategy:
 * - Contribute to pension to reduce taxable income below £100k
 * - Each £1 contributed saves 60p in tax
 * - Pension contributions get 25% tax relief on top
 *
 * @module lib/pensionOptimizer
 * @since 1.0.0
 * @see {@link https://www.gov.uk/guidance/adjusted-net-income} HMRC guidance
 */

export interface PensionOptimization {
  /** Suggested pension contribution to drop below £100k */
  suggested: number;
  /** Amount of personal allowance lost in current position */
  allowanceLost: number;
  /** Effective tax rate in the trap zone (always 60%) */
  effectiveRate: number;
  /** Tax savings from optimizing (contributing suggested amount) */
  savingsFromOptimizing: number;
  /** Whether optimization is beneficial */
  shouldOptimize: boolean;
}

/**
 * Calculate optimal pension contribution for high earners
 *
 * @param salary - Annual gross salary
 * @returns Optimization details or null if not in trap zone or invalid input
 * @throws {Error} Never throws - returns null for invalid inputs
 *
 * @example
 * const result = calculateOptimalPension(110000);
 * // Returns: {
 * //   suggested: 10000,
 * //   allowanceLost: 5000,
 * //   effectiveRate: 60,
 * //   savingsFromOptimizing: 6000,
 * //   shouldOptimize: true
 * // }
 *
 * @example
 * // Invalid inputs return null
 * calculateOptimalPension(NaN); // null
 * calculateOptimalPension(-5000); // null
 * calculateOptimalPension(Infinity); // null
 */
export function calculateOptimalPension(salary: number): PensionOptimization | null {
  try {
    // Validate input
    if (!isValidSalary(salary)) {
      console.warn(`[pensionOptimizer] Invalid salary input: ${salary}`);
      return null;
    }

    // Only applies to £100k-£125k range (exclusive of £100k, inclusive until £125,140)
    if (salary <= 100000 || salary > 125140) {
      return null;
    }
  } catch (error) {
    console.error('[pensionOptimizer] Error in calculateOptimalPension:', error);
    return null;
  }

  // Calculate excess over £100k threshold
  const excessOver100k = salary - 100000;

  // Personal allowance reduction: £1 lost for every £2 earned over £100k
  // Capped at full personal allowance (£12,570)
  const allowanceLost = Math.min(excessOver100k / 2, 12570);

  // Effective rate is always 60% in this zone
  // (40% income tax + 20% from losing personal allowance)
  const effectiveRate = 60;

  // Suggest contributing enough to drop back to £100k
  // Round up to nearest £1,000 for simplicity
  const suggested = Math.ceil(excessOver100k / 1000) * 1000;

  // Calculate tax savings: 60% of contribution saved in tax
  // Plus 25% tax relief on pension contribution
  const savingsFromOptimizing = suggested * 0.6;

  // Optimization is beneficial if salary is above £100k
  const shouldOptimize = salary > 100000;

  return {
    suggested,
    allowanceLost,
    effectiveRate,
    savingsFromOptimizing,
    shouldOptimize,
  };
}

/**
 * Validate salary input
 * @internal
 */
function isValidSalary(salary: number): boolean {
  return (
    typeof salary === 'number' &&
    !Number.isNaN(salary) &&
    Number.isFinite(salary) &&
    salary >= 0 &&
    salary <= 10000000 // Reasonable upper limit
  );
}

/**
 * Calculate take-home difference with pension optimization
 *
 * @param salary - Current salary
 * @param pensionContribution - Pension contribution amount
 * @returns Comparison of current vs optimized position or null if invalid
 * @throws {Error} Never throws - returns null for invalid inputs
 */
export function compareWithOptimization(
  salary: number,
  pensionContribution: number
): {
  currentTakeHome: number;
  optimizedTakeHome: number;
  difference: number;
  worthIt: boolean;
} | null {
  try {
    // Validate inputs
    if (!isValidSalary(salary) || !isValidSalary(pensionContribution)) {
      console.warn('[pensionOptimizer] Invalid input to compareWithOptimization');
      return null;
    }

    if (pensionContribution < 0 || pensionContribution > salary) {
      console.warn('[pensionOptimizer] Pension contribution must be between 0 and salary');
      return null;
    }

    const optimization = calculateOptimalPension(salary);
    if (!optimization) return null;
  } catch (error) {
    console.error('[pensionOptimizer] Error in compareWithOptimization:', error);
    return null;
  }

  // NOTE: Simplified calculation for comparison display only
  // For precise calculations, use the full taxCalculator.ts engine
  // Current: lose allowance, pay 60% on excess
  const excessOver100k = salary - 100000;
  const trapTax = excessOver100k * 0.6;
  const baseTax = 100000 * 0.3; // Approx effective rate up to £100k (simplified)
  const currentTax = baseTax + trapTax;
  const currentTakeHome = salary - currentTax;

  // Optimized: reduce salary by pension, no trap tax
  const optimizedSalary = salary - pensionContribution;
  const optimizedTax = optimizedSalary * 0.3; // Approx effective rate
  const optimizedTakeHome = optimizedSalary - optimizedTax;

  const difference = optimizedTakeHome - currentTakeHome;

  return {
    currentTakeHome,
    optimizedTakeHome,
    difference,
    worthIt: difference > 0,
  };
}
