/**
 * Company Car Benefit in Kind (BIK) Calculator
 *
 * When a company provides a car to a director, the director is taxed on the
 * "benefit" as if it were additional income. The company also pays Class 1A NI.
 *
 * @module lib/tax/companyCarBIK
 */

// BIK rates for 2025-26 based on CO2 emissions
// Source: https://www.gov.uk/tax-on-company-benefits/tax-on-company-cars
export const BIK_RATES_2025_26 = {
  // Electric vehicles (0g CO2)
  electric: 2,
  // Plug-in hybrids by electric range
  hybrid_130plus: 2, // 130+ miles electric range
  hybrid_70_129: 5, // 70-129 miles
  hybrid_40_69: 8, // 40-69 miles
  hybrid_30_39: 12, // 30-39 miles
  hybrid_under_30: 14, // Under 30 miles
  // Petrol/Diesel examples (based on CO2 g/km)
  petrol_low: 20, // ~100g CO2
  petrol_mid: 28, // ~130g CO2
  petrol_high: 33, // ~160g CO2
  petrol_max: 37, // 170g+ CO2
} as const;

export type BIKCategory = keyof typeof BIK_RATES_2025_26;

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

// Fuel benefit charge multiplier for 2025-26
// Source: https://www.gov.uk/tax-on-company-benefits/tax-on-company-cars
const FUEL_BENEFIT_MULTIPLIER = 27800; // £27,800 for 2025-26
const CLASS_1A_NI_RATE = 0.15; // 15%

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
    electric: 'Electric (0g CO2) - 2%',
    hybrid_130plus: 'Plug-in Hybrid 130+ miles - 2%',
    hybrid_70_129: 'Plug-in Hybrid 70-129 miles - 5%',
    hybrid_40_69: 'Plug-in Hybrid 40-69 miles - 8%',
    hybrid_30_39: 'Plug-in Hybrid 30-39 miles - 12%',
    hybrid_under_30: 'Plug-in Hybrid <30 miles - 14%',
    petrol_low: 'Petrol/Diesel ~100g CO2 - 20%',
    petrol_mid: 'Petrol/Diesel ~130g CO2 - 28%',
    petrol_high: 'Petrol/Diesel ~160g CO2 - 33%',
    petrol_max: 'Petrol/Diesel 170g+ CO2 - 37%',
  };
  return names[category];
}

/**
 * Example comparisons for UI
 */
export const CAR_EXAMPLES = [
  { name: 'Tesla Model 3', listPrice: 40000, bikRate: 2, category: 'electric' as BIKCategory },
  { name: 'BMW 330e', listPrice: 45000, bikRate: 8, category: 'hybrid_40_69' as BIKCategory },
  { name: 'Range Rover Sport', listPrice: 80000, bikRate: 37, category: 'petrol_max' as BIKCategory },
] as const;
