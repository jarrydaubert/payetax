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

import { CURRENT_TAX_YEAR, TAX_RATES, type TaxYear } from '@/constants/taxRates';
import { DIRECTOR_GUIDE_BUSINESS_THRESHOLDS } from './businessThresholds';
import { getDividendTax } from './dividendTax';
import { getIncomeTax } from './incomeTax';

// ============================================================================
// TYPES
// ============================================================================

export type WarningSeverity = 'hard' | 'soft' | 'educational';

export const DIRECTOR_WARNING_TYPES = [
  // Hard constraints
  'SURVIVAL_MODE',
  'OVERDRAWN',
  'DIVIDEND_RESERVES',
  // Soft warnings (may apply)
  'VAT_THRESHOLD',
  'SELF_ASSESSMENT',
  'PAYMENTS_ON_ACCOUNT',
  'EA_ELIGIBILITY_CHECK',
  'BIK_CLASS_1A_WARNING',
  'LOSSES_ELIGIBILITY',
  // Educational
  'PA_TAPER',
  'HICBC',
  'PENSION_GAP',
  'PENSION_AA_EXCEEDED',
  'PENSION_TAPER',
  'POTENTIAL_DLA',
  'HIGH_COMPLEXITY',
  'MORTGAGE_IMPACT',
  'MID_YEAR_ASSUMPTION',
] as const;

export type WarningType = (typeof DIRECTOR_WARNING_TYPES)[number];

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
  lossesCarriedForward?: number;
  isMidYear?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VAT_WARNING_PROXIMITY = 5000; // Warn when within £5k of threshold
const PENSION_ANNUAL_ALLOWANCE = DIRECTOR_GUIDE_BUSINESS_THRESHOLDS.pensionAnnualAllowance;
const PENSION_TAPER_THRESHOLD = DIRECTOR_GUIDE_BUSINESS_THRESHOLDS.pensionTaperLegislative;
const SA_LIABILITY_THRESHOLD = DIRECTOR_GUIDE_BUSINESS_THRESHOLDS.paymentsOnAccount;
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
  const taxYear = input.taxYear ?? CURRENT_TAX_YEAR;
  const rates = TAX_RATES[taxYear];
  const vatRegistrationThreshold = rates.vatRegistrationThreshold;
  const hicbcStart = rates.hicbc.start;
  const hicbcEnd = rates.hicbc.end;

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
  if (revenue > 0 && revenue >= vatRegistrationThreshold - VAT_WARNING_PROXIMITY) {
    if (revenue < vatRegistrationThreshold) {
      warnings.push({
        type: 'VAT_THRESHOLD',
        severity: 'soft',
        message: `Your revenue of £${revenue.toLocaleString()} is within £${(vatRegistrationThreshold - revenue).toLocaleString()} of the VAT registration threshold.`,
      });
    } else {
      warnings.push({
        type: 'VAT_THRESHOLD',
        severity: 'soft',
        message: `Your revenue exceeds the £${vatRegistrationThreshold.toLocaleString()} VAT registration threshold. You must register for VAT if not already.`,
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
  if (dividends > 0) {
    const nonDividendIncome = salary + companyCarBIK;
    const estimatedDividendTax = estimateDividendTax(dividends, nonDividendIncome, taxYear);
    const estimatedPAYE = estimateIncomeTax(nonDividendIncome, taxYear, nonDividendIncome);
    const incomeTaxWithDividends = estimateIncomeTax(
      nonDividendIncome,
      taxYear,
      nonDividendIncome + dividends,
    );
    const taperCreatedIncomeTax = Math.max(0, incomeTaxWithDividends - estimatedPAYE);
    const estimatedSelfAssessmentLiability = estimatedDividendTax + taperCreatedIncomeTax;
    const totalTaxLiability = estimatedPAYE + estimatedSelfAssessmentLiability;
    const percentDeductedAtSource = totalTaxLiability > 0 ? estimatedPAYE / totalTaxLiability : 1;

    if (
      estimatedSelfAssessmentLiability > SA_LIABILITY_THRESHOLD &&
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
    const class1ARate = rates.nationalInsurance.class1A.rate / 100;
    const class1A = companyCarBIK * class1ARate;
    warnings.push({
      type: 'BIK_CLASS_1A_WARNING',
      severity: 'soft',
      message: `Your company car BIK of £${companyCarBIK.toLocaleString()} incurs ~£${Math.round(class1A).toLocaleString()} Class 1A NI for the company.`,
    });
  }

  // Losses carried forward eligibility check
  if (input.lossesCarriedForward && input.lossesCarriedForward > 0) {
    warnings.push({
      type: 'LOSSES_ELIGIBILITY',
      severity: 'soft',
      message:
        'Trading losses can only be carried forward against future profits of the same trade. Verify eligibility with your accountant.',
    });
  }

  // ========================================================================
  // EDUCATIONAL WARNINGS
  // ========================================================================

  const totalIncome = salary + dividends;
  const paThreshold = rates.personalAllowanceReductionThreshold; // £100,000
  const paFullyTaperedAt = paThreshold + rates.personalAllowance * 2;

  // PA Taper zone (60% effective rate)
  if (totalIncome > paThreshold && totalIncome <= paFullyTaperedAt) {
    warnings.push({
      type: 'PA_TAPER',
      severity: 'educational',
      message: `Income in the £${paThreshold.toLocaleString()}-£${paFullyTaperedAt.toLocaleString()} range faces an effective 60% marginal rate due to Personal Allowance taper.`,
    });
  }

  // High Income Child Benefit Charge
  if (input.hasChildren && totalIncome >= hicbcStart && totalIncome <= hicbcEnd) {
    const clawbackPercent = Math.min(
      100,
      ((totalIncome - hicbcStart) / (hicbcEnd - hicbcStart)) * 100,
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
      (adjustedIncome - PENSION_TAPER_THRESHOLD) / 2,
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

  // Mid-year assumption note
  if (input.isMidYear) {
    warnings.push({
      type: 'MID_YEAR_ASSUMPTION',
      severity: 'educational',
      message:
        'Calculations assume uniform extraction throughout the year. Actual tax may vary if salary or dividends are taken in irregular amounts.',
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
 * Estimate dividend tax for POA warning calculation.
 */
function estimateDividendTax(dividends: number, salary: number, taxYear: TaxYear): number {
  return getDividendTax(dividends, salary, taxYear);
}

/**
 * Estimate rUK income tax for POA warning calculation.
 */
function estimateIncomeTax(
  income: number,
  taxYear: TaxYear,
  adjustedNetIncome: number = income,
): number {
  return getIncomeTax(income, 'rUK', taxYear, adjustedNetIncome);
}
