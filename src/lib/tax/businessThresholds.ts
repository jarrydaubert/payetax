/**
 * Director Intelligence business thresholds used for warning/education messaging.
 * Keep these centralized to avoid drift across components.
 */
import { CURRENT_TAX_YEAR, TAX_RATES } from '@/constants/taxRates';

const DIRECTOR_GUIDE_RATES = TAX_RATES[CURRENT_TAX_YEAR];

export const DIRECTOR_GUIDE_BUSINESS_THRESHOLDS = {
  vatRegistration: DIRECTOR_GUIDE_RATES.vatRegistrationThreshold,
  vatApproaching: DIRECTOR_GUIDE_RATES.vatRegistrationThreshold - 5_000,
  hicbcStart: DIRECTOR_GUIDE_RATES.hicbc.start,
  hicbcEnd: DIRECTOR_GUIDE_RATES.hicbc.end,
  // Educational early warning threshold.
  pensionTaperWarning: 240_000,
  // Legislative threshold where taper calculation starts.
  pensionTaperLegislative: 260_000,
  pensionAnnualAllowance: 60_000,
  paymentsOnAccount: 1_000,
  highProfitComplexity: 250_000,
} as const;
