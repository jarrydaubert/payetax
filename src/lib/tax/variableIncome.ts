/**
 * Variable income helpers for Director Guide monthly mode.
 *
 * The core annual tax engine remains unchanged; this module projects monthly
 * inputs into annual values and derives a cash-aware monthly draw.
 */

export interface MonthlyProjectionInput {
  monthlyIncome: number;
  monthlyExpenses: number;
  contractStartMonth: number; // 1-12
}

export interface MonthlyProjectionResult {
  monthsRemaining: number;
  projectedRevenue: number;
  projectedExpenses: number;
}

export interface SafeDrawInput {
  annualTakeHome: number;
  monthsRemaining: number;
  cashInBank: number;
  minimumMonthlyDraw: number;
  runwayMonths: number;
  monthlyExpenses: number;
}

export interface SafeDrawResult {
  taxBasedMonthlyDraw: number;
  requiredBuffer: number;
  cashBasedCeiling: number;
  safeMonthlyDraw: number;
  shortfall: number;
  hasBufferShortfall: boolean;
  hasContractEndRisk: boolean;
}

const TAX_YEAR_MONTHS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3] as const;

function roundToPence(value: number): number {
  return Math.round(value * 100) / 100;
}

function sanitizeNonNegative(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

/**
 * Count months from contract start month (inclusive) to March.
 * Tax year is assumed to run Apr (4) -> Mar (3).
 */
export function getMonthsRemaining(contractStartMonth: number): number {
  if (!Number.isInteger(contractStartMonth) || contractStartMonth < 1 || contractStartMonth > 12) {
    return 0;
  }

  const startIndex = TAX_YEAR_MONTHS.indexOf(
    contractStartMonth as (typeof TAX_YEAR_MONTHS)[number],
  );
  if (startIndex === -1) return 0;
  return TAX_YEAR_MONTHS.length - startIndex;
}

export function projectAnnualFromMonthly(input: MonthlyProjectionInput): MonthlyProjectionResult {
  const monthsRemaining = getMonthsRemaining(input.contractStartMonth);
  const monthlyIncome = sanitizeNonNegative(input.monthlyIncome);
  const monthlyExpenses = sanitizeNonNegative(input.monthlyExpenses);

  return {
    monthsRemaining,
    projectedRevenue: roundToPence(monthlyIncome * monthsRemaining),
    projectedExpenses: roundToPence(monthlyExpenses * monthsRemaining),
  };
}

export function calculateSafeMonthlyDraw(input: SafeDrawInput): SafeDrawResult {
  const monthsRemaining = Math.max(0, Math.floor(input.monthsRemaining));
  const annualTakeHome = sanitizeNonNegative(input.annualTakeHome);
  const cashInBank = sanitizeNonNegative(input.cashInBank);
  const minimumMonthlyDraw = sanitizeNonNegative(input.minimumMonthlyDraw);
  const runwayMonths = Math.max(0, Math.floor(input.runwayMonths));
  const monthlyExpenses = sanitizeNonNegative(input.monthlyExpenses);

  const taxBasedMonthlyDraw =
    monthsRemaining > 0 ? roundToPence(annualTakeHome / monthsRemaining) : 0;
  const requiredBuffer = roundToPence(runwayMonths * (minimumMonthlyDraw + monthlyExpenses));
  const cashBasedCeiling = roundToPence(Math.max(0, cashInBank - requiredBuffer));
  const safeMonthlyDraw =
    cashBasedCeiling === 0
      ? roundToPence(minimumMonthlyDraw)
      : roundToPence(Math.min(taxBasedMonthlyDraw, cashBasedCeiling + minimumMonthlyDraw));

  const shortfall = roundToPence(Math.max(0, requiredBuffer - cashInBank));
  const hasBufferShortfall = cashInBank < requiredBuffer;
  const hasContractEndRisk = monthsRemaining <= runwayMonths;

  return {
    taxBasedMonthlyDraw,
    requiredBuffer,
    cashBasedCeiling,
    safeMonthlyDraw,
    shortfall,
    hasBufferShortfall,
    hasContractEndRisk,
  };
}
