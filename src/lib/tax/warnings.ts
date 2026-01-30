/**
 * Warning System for Director Tax Calculator
 *
 * Generates contextual warnings based on user inputs to help directors
 * understand potential issues with their tax strategy.
 *
 * Warning Severities:
 * - hard: Critical issues that may have legal/financial consequences
 * - soft: Issues that may apply depending on circumstances
 * - educational: Information to help users understand their situation
 *
 * @module lib/tax/warnings
 */

import type { TaxYear } from '@/constants/taxRates';
import { TAX_RATES } from '@/constants/taxRates';

// ============================================================================
// TYPES
// ============================================================================

export type WarningSeverity = 'hard' | 'soft' | 'educational';

export type WarningType =
  // Hard constraints
  | 'SURVIVAL_MODE'
  | 'OVERDRAWN'
  | 'DIVIDEND_RESERVES'
  // Soft warnings (may apply)
  | 'VAT_THRESHOLD'
  | 'SELF_ASSESSMENT'
  | 'PAYMENTS_ON_ACCOUNT'
  | 'EA_ELIGIBILITY_CHECK'
  | 'BIK_CLASS_1A_WARNING'
  // Educational
  | 'PA_TAPER'
  | 'HICBC'
  | 'PENSION_GAP'
  | 'PENSION_AA_EXCEEDED'
  | 'PENSION_TAPER'
  | 'POTENTIAL_DLA'
  | 'HIGH_COMPLEXITY'
  | 'MORTGAGE_IMPACT';

export interface Warning {
  type: WarningType;
  severity: WarningSeverity;
  message: string;
}

export interface WarningInput {
  profit?: number;
  revenue?: number;
  salary?: number;
  dividends?: number;
  alreadyTaken?: number;
  compareSalary?: number;
  compareDividends?: number;
  pensionContribution?: number;
  companyCarBIK?: number;
  hasEmploymentAllowance?: boolean;
  hasChildren?: boolean;
  taxYear?: TaxYear;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VAT_REGISTRATION_THRESHOLD = 90000; // 2025-26 threshold
const VAT_WARNING_PROXIMITY = 5000; // Warn when within £5k of threshold
const PENSION_ANNUAL_ALLOWANCE = 60000; // Standard AA
const PENSION_TAPER_THRESHOLD = 260000; // Adjusted income threshold for AA taper
const HICBC_START = 60000; // High Income Child Benefit Charge starts
const HICBC_END = 80000; // HICBC fully claws back
const SA_LIABILITY_THRESHOLD = 1000; // Payments on Account threshold
const SA_DEDUCTION_THRESHOLD = 0.8; // 80% deducted at source exemption
const HIGH_COMPLEXITY_THRESHOLD = 10000000; // £10m+ is complex

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Generate warnings based on director's tax inputs
 *
 * @param input - The warning input parameters
 * @returns Array of warnings sorted by severity (hard first)
 */
export function getWarnings(input: WarningInput): Warning[] {
  const warnings: Warning[] = [];
  const taxYear = input.taxYear ?? '2025-2026';
  const rates = TAX_RATES[taxYear];

  const profit = input.profit ?? 0;
  const revenue = input.revenue ?? 0;
  const salary = input.salary ?? 0;
  const dividends = input.dividends ?? 0;
  const alreadyTaken = input.alreadyTaken ?? 0;
  const compareSalary = input.compareSalary ?? 0;
  const compareDividends = input.compareDividends ?? 0;
  const pensionContribution = input.pensionContribution ?? 0;
  const companyCarBIK = input.companyCarBIK ?? 0;

  // ========================================================================
  // HARD CONSTRAINTS
  // ========================================================================

  // Survival Mode: No/negative profit
  if (profit <= 0) {
    warnings.push({
      type: 'SURVIVAL_MODE',
      severity: 'hard',
      message:
        "Your company has no distributable profit. Extracting funds may create a Director's Loan Account liability.",
    });
  }

  // Overdrawn: Already taken more than profit
  if (alreadyTaken > profit && profit > 0) {
    warnings.push({
      type: 'OVERDRAWN',
      severity: 'hard',
      message: `You've already taken £${alreadyTaken.toLocaleString()} which exceeds your £${profit.toLocaleString()} profit. Your Director's Loan Account may be overdrawn.`,
    });
  }

  // Dividend Reserves: Compare dividends exceed available
  if (compareDividends > 0 && profit > 0) {
    // Rough check: if compare dividends alone exceed profit, flag it
    // More sophisticated check would account for salary cost
    const maxAvailableForDividends = profit - compareSalary * 1.15; // ~15% employer NI
    if (compareDividends > maxAvailableForDividends) {
      warnings.push({
        type: 'DIVIDEND_RESERVES',
        severity: 'hard',
        message:
          'The dividends in your setup may be unlawful IF you lack sufficient distributable reserves from previous years.',
      });
    }
  }

  // ========================================================================
  // SOFT WARNINGS (May Apply)
  // ========================================================================

  // VAT Threshold proximity
  if (revenue > 0 && revenue >= VAT_REGISTRATION_THRESHOLD - VAT_WARNING_PROXIMITY) {
    if (revenue < VAT_REGISTRATION_THRESHOLD) {
      warnings.push({
        type: 'VAT_THRESHOLD',
        severity: 'soft',
        message: `Your revenue of £${revenue.toLocaleString()} is within £${(VAT_REGISTRATION_THRESHOLD - revenue).toLocaleString()} of the VAT registration threshold.`,
      });
    } else {
      warnings.push({
        type: 'VAT_THRESHOLD',
        severity: 'soft',
        message: `Your revenue exceeds the £${VAT_REGISTRATION_THRESHOLD.toLocaleString()} VAT registration threshold. You must register for VAT if not already.`,
      });
    }
  }

  // Self Assessment required when dividends declared
  if (dividends > 0) {
    warnings.push({
      type: 'SELF_ASSESSMENT',
      severity: 'soft',
      message:
        'Dividend income must be reported via Self Assessment tax return, even if no tax is due.',
    });
  }

  // Payments on Account warning
  // SA liability >£1k AND <80% deducted at source
  if (salary > 0 && dividends > 0) {
    // Estimate SA liability (rough: dividend tax portion)
    const estimatedDividendTax = estimateDividendTax(dividends, salary, taxYear);
    const estimatedPAYE = estimateIncomeTax(salary, taxYear);
    const totalTaxLiability = estimatedPAYE + estimatedDividendTax;
    const percentDeductedAtSource = totalTaxLiability > 0 ? estimatedPAYE / totalTaxLiability : 1;

    if (
      estimatedDividendTax > SA_LIABILITY_THRESHOLD &&
      percentDeductedAtSource < SA_DEDUCTION_THRESHOLD
    ) {
      warnings.push({
        type: 'PAYMENTS_ON_ACCOUNT',
        severity: 'soft',
        message:
          'Your Self Assessment liability may exceed £1,000 with less than 80% deducted at source. HMRC may require Payments on Account.',
      });
    }
  }

  // Employment Allowance eligibility check
  if (input.hasEmploymentAllowance) {
    warnings.push({
      type: 'EA_ELIGIBILITY_CHECK',
      severity: 'soft',
      message:
        'Employment Allowance typically requires employees other than the sole director. Verify your eligibility.',
    });
  }

  // BIK Class 1A warning
  if (companyCarBIK > 0) {
    const class1A = companyCarBIK * 0.15; // 15% Class 1A NI
    warnings.push({
      type: 'BIK_CLASS_1A_WARNING',
      severity: 'soft',
      message: `Your company car BIK of £${companyCarBIK.toLocaleString()} incurs ~£${class1A.toLocaleString()} Class 1A NI for the company (not shown in take-home).`,
    });
  }

  // ========================================================================
  // EDUCATIONAL WARNINGS
  // ========================================================================

  const totalIncome = salary + dividends;
  const paThreshold = rates.personalAllowanceReductionThreshold; // £100,000
  const paFullyTaperedAt = 125140; // £100k + (£12,570 × 2)

  // PA Taper zone (60% effective rate)
  if (totalIncome > paThreshold && totalIncome <= paFullyTaperedAt) {
    warnings.push({
      type: 'PA_TAPER',
      severity: 'educational',
      message: `Income in the £${paThreshold.toLocaleString()}-£${paFullyTaperedAt.toLocaleString()} range faces an effective 60% marginal rate due to Personal Allowance taper.`,
    });
  }

  // High Income Child Benefit Charge
  if (input.hasChildren && totalIncome >= HICBC_START && totalIncome <= HICBC_END) {
    const clawbackPercent = Math.min(
      100,
      ((totalIncome - HICBC_START) / (HICBC_END - HICBC_START)) * 100
    );
    warnings.push({
      type: 'HICBC',
      severity: 'educational',
      message: `Income of £${totalIncome.toLocaleString()} triggers High Income Child Benefit Charge. ~${Math.round(clawbackPercent)}% of Child Benefit is clawed back.`,
    });
  }

  // Pension gap zone
  const lel = rates.nationalInsurance.lowerEarningsLimit;
  const secondaryThreshold = rates.nationalInsurance.employer.A.secondary.threshold;
  if (salary > 0 && salary < lel && salary > secondaryThreshold) {
    warnings.push({
      type: 'PENSION_GAP',
      severity: 'educational',
      message: `Salary of £${salary.toLocaleString()} is below the Lower Earnings Limit (£${lel.toLocaleString()}). You won't accrue State Pension credits this year.`,
    });
  }

  // Pension Annual Allowance exceeded
  if (pensionContribution > PENSION_ANNUAL_ALLOWANCE) {
    const excess = pensionContribution - PENSION_ANNUAL_ALLOWANCE;
    warnings.push({
      type: 'PENSION_AA_EXCEEDED',
      severity: 'educational',
      message: `Pension contribution of £${pensionContribution.toLocaleString()} exceeds the £${PENSION_ANNUAL_ALLOWANCE.toLocaleString()} Annual Allowance by £${excess.toLocaleString()}. The excess may be subject to tax charges.`,
    });
  }

  // Pension taper for high earners
  const adjustedIncome = salary + dividends + pensionContribution;
  if (adjustedIncome > PENSION_TAPER_THRESHOLD) {
    const reduction = Math.min(
      PENSION_ANNUAL_ALLOWANCE - 10000, // Can't reduce below £10k
      (adjustedIncome - PENSION_TAPER_THRESHOLD) / 2
    );
    const taperedAA = PENSION_ANNUAL_ALLOWANCE - reduction;
    warnings.push({
      type: 'PENSION_TAPER',
      severity: 'educational',
      message: `Adjusted income of £${adjustedIncome.toLocaleString()} triggers pension Annual Allowance taper. Your AA is reduced to ~£${Math.round(taperedAA).toLocaleString()}.`,
    });
  }

  // Potential DLA from compare inputs
  if (compareSalary > 0 || compareDividends > 0) {
    const compareCost = compareSalary * 1.15 + compareDividends; // Rough employer NI
    if (compareCost > profit && profit > 0) {
      warnings.push({
        type: 'POTENTIAL_DLA',
        severity: 'educational',
        message:
          "Your setup may create or increase a Director's Loan Account balance, depending on how drawings are treated.",
      });
    }
  }

  // High complexity warning
  if (profit > HIGH_COMPLEXITY_THRESHOLD) {
    warnings.push({
      type: 'HIGH_COMPLEXITY',
      severity: 'educational',
      message:
        'At this profit level, your tax situation is complex. Consider professional advice for associated company rules, R&D credits, and corporation tax rates.',
    });
  }

  // Mortgage impact warning (low salary)
  const personalAllowance = rates.personalAllowance;
  if (salary > 0 && salary <= personalAllowance) {
    warnings.push({
      type: 'MORTGAGE_IMPACT',
      severity: 'educational',
      message: `A salary of £${salary.toLocaleString()} is tax-efficient but may affect mortgage affordability calculations, which typically require higher proven income.`,
    });
  }

  // Sort by severity (hard first, then soft, then educational)
  const severityOrder: Record<WarningSeverity, number> = { hard: 0, soft: 1, educational: 2 };
  warnings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return warnings;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Rough estimate of dividend tax for POA warning calculation
 */
function estimateDividendTax(dividends: number, salary: number, taxYear: TaxYear): number {
  const rates = TAX_RATES[taxYear];
  const personalAllowance = rates.personalAllowance;
  const basicRateLimit = rates.bands[0]?.threshold ?? 37700; // £37,700
  const dividendAllowance = 500; // 2025-26

  // Income already used by salary
  const salaryAbovePA = Math.max(0, salary - personalAllowance);
  const basicRateRemaining = Math.max(0, basicRateLimit - salaryAbovePA);

  // Dividends after allowance
  const taxableDividends = Math.max(0, dividends - dividendAllowance);
  if (taxableDividends <= 0) return 0;

  // Basic rate dividends (8.75%)
  const basicRateDividends = Math.min(taxableDividends, basicRateRemaining);
  // Higher rate dividends (33.75%)
  const higherRateDividends = Math.max(0, taxableDividends - basicRateDividends);

  return basicRateDividends * 0.0875 + higherRateDividends * 0.3375;
}

/**
 * Rough estimate of income tax for POA warning calculation
 */
function estimateIncomeTax(salary: number, taxYear: TaxYear): number {
  const rates = TAX_RATES[taxYear];
  const personalAllowance = rates.personalAllowance;
  const basicRateLimit = rates.bands[0]?.threshold ?? 37700;

  const taxableIncome = Math.max(0, salary - personalAllowance);
  if (taxableIncome <= 0) return 0;

  // Basic rate (20%)
  const basicRateTax = Math.min(taxableIncome, basicRateLimit) * 0.2;
  // Higher rate (40%)
  const higherRateIncome = Math.max(0, taxableIncome - basicRateLimit);
  const higherRateTax = higherRateIncome * 0.4;

  return basicRateTax + higherRateTax;
}
