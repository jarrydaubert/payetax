/**
 * Company Car Benefit in Kind (BIK) Calculator
 *
 * When a company provides a car to a director, the director is taxed on the
 * "benefit" as if it were additional income. The company also pays Class 1A NI.
 *
 * The "appropriate percentage" depends on:
 * - CO2 emissions (g/km)
 * - Electric range (for hybrids)
 * - Fuel type (diesel supplement applies unless RDE2 compliant)
 *
 * @module lib/tax/companyCarBIK
 * @see https://www.gov.uk/guidance/company-car-benefit-and-car-fuel-benefit
 */

/**
 * BIK appropriate percentages for 2025-26
 * Source: https://www.gov.uk/guidance/company-car-benefit-and-car-fuel-benefit
 *
 * Electric (0g CO2): 3%
 * Hybrids: Based on electric range
 * Petrol/Diesel: Based on CO2, +4% diesel supplement (unless RDE2), max 37%
 */
export const BIK_RATES_2025_26 = {
  // Electric vehicles (0g CO2) - CORRECTED: 3% for 2025-26
  electric: 3,
  // Plug-in hybrids by electric range (CO2 1-50g/km)
  hybrid_130plus: 3, // 130+ miles electric range
  hybrid_70_129: 6, // 70-129 miles
  hybrid_40_69: 9, // 40-69 miles
  hybrid_30_39: 13, // 30-39 miles
  hybrid_under_30: 15, // Under 30 miles
  // Petrol examples (based on CO2 g/km) - for reference only
  // Real calculation should use exact CO2 value
  petrol_low: 21, // ~100g CO2
  petrol_mid: 29, // ~130g CO2
  petrol_high: 34, // ~160g CO2
  petrol_max: 37, // 170g+ CO2
} as const;

export type BIKCategory = keyof typeof BIK_RATES_2025_26;

/** Diesel supplement (unless RDE2 compliant) */
export const DIESEL_SUPPLEMENT = 4;

/** Maximum appropriate percentage cap */
export const MAX_APPROPRIATE_PERCENTAGE = 37;

export interface CompanyCarBIKInput {
  listPrice: number; // P11D value (list price + options)
  bikRate: number; // Percentage (0-37)
  fuelBenefitIncluded?: boolean; // Company pays for private fuel
}

export interface CompanyCarBIKResult {
  carBenefit: number; // Taxable car benefit
  fuelBenefit: number; // Taxable fuel benefit (if applicable)
  totalBenefit: number; // Total BIK added to income
  class1ANI: number; // Employer's Class 1A NI (15%)
}

// Fuel benefit charge multiplier for 2025-26 - CORRECTED: £28,200
// Source: https://www.gov.uk/guidance/company-car-benefit-and-car-fuel-benefit
const FUEL_BENEFIT_MULTIPLIER = 28200;
const CLASS_1A_NI_RATE = 0.15; // 15% from 6 April 2025

/**
 * Calculate Company Car Benefit in Kind
 *
 * @param input - Car details (list price, BIK rate, fuel benefit)
 * @returns Breakdown of taxable benefits and employer NI
 */
export function calculateCompanyCarBIK(input: CompanyCarBIKInput): CompanyCarBIKResult {
  const { listPrice, bikRate, fuelBenefitIncluded = false } = input;

  if (listPrice <= 0 || bikRate <= 0) {
    return {
      carBenefit: 0,
      fuelBenefit: 0,
      totalBenefit: 0,
      class1ANI: 0,
    };
  }

  // Car benefit = List price × BIK rate
  const carBenefit = Math.round(listPrice * (bikRate / 100));

  // Fuel benefit = Multiplier × BIK rate (only if company pays for private fuel)
  const fuelBenefit = fuelBenefitIncluded
    ? Math.round(FUEL_BENEFIT_MULTIPLIER * (bikRate / 100))
    : 0;

  const totalBenefit = carBenefit + fuelBenefit;

  // Employer pays Class 1A NI on the total benefit
  const class1ANI = Math.round(totalBenefit * CLASS_1A_NI_RATE);

  return {
    carBenefit,
    fuelBenefit,
    totalBenefit,
    class1ANI,
  };
}

/**
 * Get BIK rate for common car categories
 */
export function getBIKRate(category: BIKCategory): number {
  return BIK_RATES_2025_26[category];
}

/**
 * Get human-readable category name
 */
export function getBIKCategoryName(category: BIKCategory): string {
  const names: Record<BIKCategory, string> = {
    electric: 'Electric (0g CO2) - 3%',
    hybrid_130plus: 'Plug-in Hybrid 130+ miles - 3%',
    hybrid_70_129: 'Plug-in Hybrid 70-129 miles - 6%',
    hybrid_40_69: 'Plug-in Hybrid 40-69 miles - 9%',
    hybrid_30_39: 'Plug-in Hybrid 30-39 miles - 13%',
    hybrid_under_30: 'Plug-in Hybrid <30 miles - 15%',
    petrol_low: 'Petrol ~100g CO2 - 21%',
    petrol_mid: 'Petrol ~130g CO2 - 29%',
    petrol_high: 'Petrol ~160g CO2 - 34%',
    petrol_max: 'Petrol 170g+ CO2 - 37%',
  };
  return names[category];
}

/**
 * Calculate appropriate percentage from CO2 emissions
 * Note: Diesel cars add 4% supplement (unless RDE2 compliant), capped at 37%
 *
 * @param co2 - CO2 emissions in g/km
 * @param electricRange - Electric range in miles (for hybrids with CO2 1-50g/km)
 * @param isDiesel - Whether the car is diesel (adds 4% unless RDE2)
 * @param isRDE2 - Whether diesel car meets RDE2 standard (no supplement)
 */
export function calculateAppropriatePercentage(
  co2: number,
  electricRange?: number,
  isDiesel = false,
  isRDE2 = false,
): number {
  let percentage: number;

  if (co2 === 0) {
    // Pure electric
    percentage = 3;
  } else if (co2 >= 1 && co2 <= 50 && electricRange !== undefined) {
    // Plug-in hybrid - rate based on electric range
    if (electricRange >= 130) percentage = 3;
    else if (electricRange >= 70) percentage = 6;
    else if (electricRange >= 40) percentage = 9;
    else if (electricRange >= 30) percentage = 13;
    else percentage = 15;
  } else {
    // Petrol/Diesel based on CO2
    // Base: 15% at 51g/km, +1% per 5g/km above 51
    if (co2 <= 50) {
      percentage = 15;
    } else {
      percentage = 15 + Math.ceil((co2 - 50) / 5);
    }
  }

  // Diesel supplement (unless RDE2 compliant)
  if (isDiesel && !isRDE2 && co2 > 0) {
    percentage += DIESEL_SUPPLEMENT;
  }

  // Cap at maximum
  return Math.min(percentage, MAX_APPROPRIATE_PERCENTAGE);
}

/**
 * Example comparisons for UI (2025-26 rates)
 */
export const CAR_EXAMPLES = [
  { name: 'Tesla Model 3', listPrice: 40000, bikRate: 3, category: 'electric' as BIKCategory },
  { name: 'BMW 330e', listPrice: 45000, bikRate: 9, category: 'hybrid_40_69' as BIKCategory },
  {
    name: 'Range Rover Sport',
    listPrice: 80000,
    bikRate: 37,
    category: 'petrol_max' as BIKCategory,
  },
] as const;
