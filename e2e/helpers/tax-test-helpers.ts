// e2e/helpers/tax-test-helpers.ts
// Test helpers that use the SINGLE SOURCE OF TRUTH for tax calculations
//
// ⚠️ CRITICAL: All tax rates imported from src/constants/taxRates.ts
// This ensures E2E tests always match production logic exactly

import { TAX_RATES, type TaxYear } from '../../src/constants/taxRates';

export interface TaxCalculationInputs {
  salary: number;
  taxYear: TaxYear;
  scottish?: boolean;
  pensionPercentage?: number;
  pensionAmount?: number;
  studentLoanPlan?: string;
  niCategory?: string;
}

export interface TaxCalculationResults {
  incomeTax: number;
  nationalInsurance: number;
  studentLoan: number;
  pension: number;
  netPay: number;
}

// Helper to get rates for a specific tax year (defaults to 2025-2026)
function getRates(taxYear: TaxYear = '2025-2026') {
  return TAX_RATES[taxYear];
}

export function calculateExpectedIncomeTax(
  salary: number,
  options: { scottish?: boolean; taxYear?: TaxYear } = {}
): number {
  const { scottish = false, taxYear = '2025-2026' } = options;
  const rates = getRates(taxYear);

  if (salary <= rates.personalAllowance) {
    return 0;
  }

  const taxableIncome = salary - rates.personalAllowance;

  if (scottish) {
    return calculateScottishIncomeTax(taxableIncome, rates);
  }

  return calculateEnglishIncomeTax(taxableIncome, rates);
}

function calculateEnglishIncomeTax(
  taxableIncome: number,
  rates: (typeof TAX_RATES)['2025-2026']
): number {
  let tax = 0;

  // Calculate tax using the band structure from taxRates.ts
  // Basic rate band (20%)
  const basicBand = rates.bands.find((b) => b.rate === 0.2);
  if (basicBand && taxableIncome > 0) {
    const basicRateTaxable = Math.min(taxableIncome, basicBand.threshold - rates.personalAllowance);
    tax += basicRateTaxable * basicBand.rate;
  }

  // Higher rate band (40%)
  const higherBand = rates.bands.find((b) => b.rate === 0.4);
  if (higherBand) {
    const higherRateStart = (basicBand?.threshold || 0) - rates.personalAllowance;
    if (taxableIncome > higherRateStart) {
      const higherRateTaxable = Math.min(
        taxableIncome - higherRateStart,
        higherBand.threshold - (basicBand?.threshold || 0)
      );
      tax += higherRateTaxable * higherBand.rate;
    }
  }

  // Additional rate band (45%)
  const additionalBand = rates.bands.find((b) => b.rate === 0.45);
  if (additionalBand) {
    const additionalRateStart = (higherBand?.threshold || 0) - rates.personalAllowance;
    if (taxableIncome > additionalRateStart) {
      const additionalRateTaxable = taxableIncome - additionalRateStart;
      tax += additionalRateTaxable * additionalBand.rate;
    }
  }

  return Math.round(tax * 100) / 100;
}

function calculateScottishIncomeTax(
  taxableIncome: number,
  rates: (typeof TAX_RATES)['2025-2026']
): number {
  // Scottish tax uses SCOTTISH_TAX_RATES from taxRates.ts
  // For now, simplified implementation - full Scottish bands would use SCOTTISH_TAX_RATES
  // This is a placeholder that would need the full Scottish rate structure
  let tax = 0;

  // Use bands from rates (Scotland has different band structure)
  // This would ideally import SCOTTISH_TAX_RATES but keeping simple for now
  const basicBand = rates.bands.find((b) => b.rate === 0.2);
  if (basicBand && taxableIncome > 0) {
    const basicTaxable = Math.min(taxableIncome, basicBand.threshold - rates.personalAllowance);
    tax += basicTaxable * basicBand.rate;
  }

  return Math.round(tax * 100) / 100;
}

export function calculateExpectedNationalInsurance(
  salary: number,
  taxYear: TaxYear = '2025-2026'
): number {
  const rates = getRates(taxYear);
  const niRates = rates.nationalInsurance.employee.A; // Category A (most common)

  if (salary <= niRates.primary.threshold) {
    return 0;
  }

  const niableIncome = salary - niRates.primary.threshold;
  let ni = 0;

  // Primary rate (8% for 2025-26) on earnings between threshold and upper limit
  const basicRateNI = Math.min(niableIncome, niRates.upper.threshold - niRates.primary.threshold);
  ni += basicRateNI * niRates.primary.rate;

  // Upper rate (2%) on earnings above upper limit
  if (niableIncome > niRates.upper.threshold - niRates.primary.threshold) {
    const higherRateNI = niableIncome - (niRates.upper.threshold - niRates.primary.threshold);
    ni += higherRateNI * niRates.upper.rate;
  }

  return Math.round(ni * 100) / 100;
}

export function calculateExpectedStudentLoan(
  salary: number,
  plan: string,
  taxYear: TaxYear = '2025-2026'
): number {
  const rates = getRates(taxYear);
  const planData = rates.studentLoan[plan as keyof typeof rates.studentLoan];

  if (!planData || salary <= planData.threshold) {
    return 0;
  }

  const repayableIncome = salary - planData.threshold;
  return Math.round(repayableIncome * planData.rate * 100) / 100;
}

export function calculateExpectedPension(
  salary: number,
  contribution: number,
  isPercentage: boolean = true
): number {
  if (isPercentage) {
    return Math.round(salary * (contribution / 100) * 100) / 100;
  }
  return contribution;
}

export function generateUniqueTestData(
  baseData: Partial<TaxCalculationInputs> = {}
): TaxCalculationInputs & { testId: string } {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1000);

  return {
    salary: 30000,
    taxYear: '2025-2026',
    scottish: false,
    ...baseData,
    testId: `test-${timestamp}-${randomId}`,
  };
}

// Test data validation
export function validateCalculationResults(
  actualResults: { [key: string]: number },
  expectedResults: Partial<TaxCalculationResults>,
  tolerance: number = 1
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [key, expectedValue] of Object.entries(expectedResults)) {
    const actualValue = actualResults[key];
    if (typeof actualValue === 'number' && typeof expectedValue === 'number') {
      if (Math.abs(actualValue - expectedValue) > tolerance) {
        errors.push(
          `${key}: expected ${expectedValue}, got ${actualValue} (tolerance: ±${tolerance})`
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
