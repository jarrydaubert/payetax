/**
 * Director Guide business thresholds used for warning/education messaging.
 * Keep these centralized to avoid drift across components.
 */
export const DIRECTOR_GUIDE_BUSINESS_THRESHOLDS = {
  vatRegistration: 90_000,
  vatApproaching: 85_000,
  hicbcStart: 60_000,
  hicbcEnd: 80_000,
  pensionTaperWarning: 240_000,
  pensionAnnualAllowance: 60_000,
  paymentsOnAccount: 1_000,
  highProfitComplexity: 250_000,
} as const;
