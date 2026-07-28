/**
 * Director Intelligence business thresholds used for warning/education messaging.
 * Keep these centralized to avoid drift across components.
 */
import {
  CURRENT_TAX_YEAR,
  PAYMENTS_ON_ACCOUNT,
  PENSION_ALLOWANCES,
  TAX_RATES,
} from '@/constants/taxRates';

const DIRECTOR_GUIDE_RATES = TAX_RATES[CURRENT_TAX_YEAR];
const DIRECTOR_GUIDE_PENSION = PENSION_ALLOWANCES[CURRENT_TAX_YEAR];
const DIRECTOR_GUIDE_POA = PAYMENTS_ON_ACCOUNT[CURRENT_TAX_YEAR];

export const DIRECTOR_GUIDE_BUSINESS_THRESHOLDS = {
  vatRegistration: DIRECTOR_GUIDE_RATES.vatRegistrationThreshold,
  vatApproaching: DIRECTOR_GUIDE_RATES.vatRegistrationThreshold - 5_000,
  hicbcStart: DIRECTOR_GUIDE_RATES.hicbc.start,
  hicbcEnd: DIRECTOR_GUIDE_RATES.hicbc.end,
  // Educational early-warning threshold (UX). Deliberately BELOW the statutory
  // £260k taper start — not a statutory value, so it stays a literal here.
  pensionTaperWarning: 240_000,
  // Statutory pension values, sourced from the canonical per-year model.
  pensionTaperLegislative: DIRECTOR_GUIDE_PENSION.adjustedIncomeTaperThreshold,
  pensionAnnualAllowance: DIRECTOR_GUIDE_PENSION.annualAllowance,
  pensionMinimumTaperedAllowance: DIRECTOR_GUIDE_PENSION.minimumTaperedAllowance,
  pensionTaperRate: DIRECTOR_GUIDE_PENSION.taperRate,
  paymentsOnAccount: DIRECTOR_GUIDE_POA.threshold,
  // Product complexity heuristic (UX), not a statutory threshold.
  highProfitComplexity: 250_000,
} as const;
