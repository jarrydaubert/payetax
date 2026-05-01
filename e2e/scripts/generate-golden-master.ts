#!/usr/bin/env tsx
/**
 * Golden Master Auto-Generator
 *
 * ⚠️ CRITICAL: This script uses the SAME taxRates.ts and calculateTax() as production
 *
 * When HMRC announces 2026-27 rates:
 * 1. Update src/constants/taxRates.ts (5 minutes)
 * 2. Run: npm run golden:generate
 * 3. Commit the new golden-tax-cases-2026-27-COMPLETE.json
 * 4. All tests pass automatically
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { TAX_RATES } from '../../src/constants/taxRates';
import { calculateTax, type TaxCalculationInput } from '../../src/lib/taxCalculator';

const TAX_YEAR = '2025-2026' as const;

// Helper to create input with defaults
function createInput(overrides: Partial<TaxCalculationInput>): TaxCalculationInput {
  return {
    salary: 30000,
    payPeriod: 'annually' as const,
    taxYear: TAX_YEAR,
    taxCode: '1257L',
    isScottish: false,
    isMarried: false,
    partnerGrossWage: 0,
    isBlind: false,
    payNoNI: false,
    pensionContribution: 0,
    pensionContributionType: 'percentage' as const,
    studentLoanPlans: 'none' as const,
    niCategory: 'A' as const,
    hoursPerWeek: 40,
    ...overrides,
  };
}

// Define all scenarios
const scenarios: Array<{ id: string; description: string; input: TaxCalculationInput }> = [
  // Basic scenarios
  {
    id: 'basic-30k',
    description: 'Basic rate England £30k',
    input: createInput({ salary: 30000 }),
  },
  {
    id: 'basic-45k',
    description: 'Basic rate England £45k',
    input: createInput({ salary: 45000 }),
  },
  {
    id: 'higher-55k',
    description: 'Higher rate England £55k',
    input: createInput({ salary: 55000 }),
  },

  // Personal allowance scenarios
  {
    id: 'exact-pa-12570',
    description: 'Exactly at personal allowance (£12,570)',
    input: createInput({ salary: 12570 }),
  },
  {
    id: 'exact-higher-rate',
    description: 'Exactly at higher rate threshold (£50,270)',
    input: createInput({ salary: 50270 }),
  },

  // PA taper scenarios (60% tax trap)
  {
    id: 'pa-taper-100k',
    description: 'Personal allowance taper starts £100k',
    input: createInput({ salary: 100000 }),
  },
  {
    id: 'pa-taper-110k',
    description: 'Personal allowance taper £110k (60% trap zone)',
    input: createInput({ salary: 110000 }),
  },
  {
    id: '60percent-trap-125140',
    description: '60% marginal trap peak £125,140',
    input: createInput({ salary: 125140 }),
  },

  // Additional rate
  {
    id: 'additional-150k',
    description: 'Additional rate £150k',
    input: createInput({ salary: 150000 }),
  },

  // Scottish tax
  {
    id: 'scottish-45k',
    description: 'Scottish £45k (intermediate band)',
    input: createInput({ salary: 45000, taxCode: 'S1257L', isScottish: true }),
  },
  {
    id: 'scottish-200k',
    description: 'Scottish £200k (top rate 48%)',
    input: createInput({ salary: 200000, taxCode: 'S1257L', isScottish: true }),
  },

  // Tax codes
  {
    id: 'br-code-second-job',
    description: 'Second job BR code (no personal allowance)',
    input: createInput({ salary: 25000, taxCode: 'BR' }),
  },
  {
    id: 'k-code-40k',
    description: 'K code K100 (negative allowance)',
    input: createInput({ salary: 40000, taxCode: 'K100' }),
  },
  {
    id: 'emergency-m1',
    description: 'Emergency code 1257L M1 (£3k/month)',
    input: createInput({ salary: 36000, taxCode: '1257L M1' }),
  },

  // Student loans
  {
    id: 'plan1-threshold',
    description: 'Plan 1 student loan £25k (just above £26,065)',
    input: createInput({ salary: 25000, studentLoanPlans: ['plan1'] }),
  },
  {
    id: 'plan2-student-40k',
    description: 'Plan 2 student loan £40k',
    input: createInput({ salary: 40000, studentLoanPlans: ['plan2'] }),
  },

  // Pension
  {
    id: 'pension-sacrifice-10pct',
    description: '10% pension salary sacrifice £50k',
    input: createInput({
      salary: 50000,
      pensionContribution: 10,
      pensionContributionType: 'percentage',
    }),
  },
  {
    id: 'high-pension-40pct',
    description: '40% pension £60k (Ltd company strategy)',
    input: createInput({
      salary: 60000,
      pensionContribution: 40,
      pensionContributionType: 'percentage',
    }),
  },

  // Marriage allowance
  {
    id: 'marriage-allowance-15k',
    description: 'Marriage allowance transfer £15k + £45k partner',
    input: createInput({
      salary: 15000,
      taxCode: '1257M',
      isMarried: true,
      partnerGrossWage: 45000,
    }),
  },
];

console.log('='.repeat(80));
console.log('🏆 GOLDEN MASTER AUTO-GENERATOR');
console.log('='.repeat(80));
console.log(`Tax Year: ${TAX_YEAR}`);
console.log(`Scenarios: ${scenarios.length}`);
console.log(`Source: src/constants/taxRates.ts + src/lib/taxCalculator.ts`);
console.log('');

const generated = scenarios.map(({ id, description, input }) => {
  try {
    const results = calculateTax(input);

    // Extract annual values from the Record<PayPeriod, number>
    const incomeTax = results.incomeTax.annually;
    const employeeNI = results.nationalInsurance.annually;
    const netPay = results.netPay.annually;
    const studentLoan = results.studentLoan?.annually || 0;
    const pension = results.pensionContribution?.annually || 0;

    return {
      id,
      description,
      input: {
        salary: input.salary,
        region: input.isScottish ? 'Scotland' : 'England',
        taxCode: input.taxCode,
        ...(input.pensionContribution > 0 && { pensionPercent: input.pensionContribution }),
        ...(input.studentLoanPlans !== 'none' && { studentLoan: input.studentLoanPlans }),
        ...(input.isMarried && { partnerGrossWage: input.partnerGrossWage }),
      },
      expected: {
        incomeTax: Math.round(incomeTax * 100) / 100,
        employeeNI: Math.round(employeeNI * 100) / 100,
        ...(studentLoan > 0 && { studentLoanRepayment: Math.round(studentLoan * 100) / 100 }),
        ...(pension > 0 && { pensionContribution: Math.round(pension * 100) / 100 }),
        netPay: Math.round(netPay * 100) / 100,
      },
      generatedAt: new Date().toISOString(),
      taxYear: TAX_YEAR,
    };
  } catch (error) {
    console.error(`❌ Failed to generate ${id}:`, error);
    throw error;
  }
});

const output = {
  version: TAX_YEAR,
  generatedAt: new Date().toISOString(),
  description:
    'AUTO-GENERATED golden master from taxRates.ts + calculateTax() logic. This is the source of truth for E2E regression tests.',
  metadata: {
    personalAllowance: TAX_RATES[TAX_YEAR].personalAllowance,
    basicRateThreshold: TAX_RATES[TAX_YEAR].bands.find((b) => b.rate === 0.2)?.threshold,
    higherRateThreshold: TAX_RATES[TAX_YEAR].bands.find((b) => b.rate === 0.4)?.threshold,
    additionalRateThreshold: TAX_RATES[TAX_YEAR].bands.find((b) => b.rate === 0.45)?.threshold,
    niPrimaryThreshold: TAX_RATES[TAX_YEAR].nationalInsurance.employee.A.primary.threshold,
    niPrimaryRate: TAX_RATES[TAX_YEAR].nationalInsurance.employee.A.primary.rate,
  },
  cases: generated,
};

// Add a manual multi-plan student loan scenario for regression coverage.
const dualLoanInput = createInput({
  salary: 50000,
  studentLoanPlans: ['plan2', 'postgrad'],
});
const dualLoanResults = calculateTax(dualLoanInput);
generated.push({
  id: 'dual-student-loans',
  description: 'Plan 2 + Postgrad loans £50k (47% marginal!)',
  input: {
    salary: dualLoanInput.salary,
    region: 'England',
    taxCode: dualLoanInput.taxCode,
    studentLoan: dualLoanInput.studentLoanPlans,
  },
  expected: {
    incomeTax: Math.round(dualLoanResults.incomeTax.annually * 100) / 100,
    employeeNI: Math.round(dualLoanResults.nationalInsurance.annually * 100) / 100,
    studentLoanRepayment: Math.round((dualLoanResults.studentLoan?.annually ?? 0) * 100) / 100,
    netPay: Math.round(dualLoanResults.netPay.annually * 100) / 100,
  },
  generatedAt: new Date().toISOString(),
  taxYear: TAX_YEAR,
});

// Write directly to COMPLETE.json - no duplicates!
// Use the correct filename format: 2025-26 (not 2025-2026)
const filename = TAX_YEAR.replace('-20', '-'); // "2025-2026" -> "2025-26"
const outputPath = path.join(__dirname, `../fixtures/golden-tax-cases-${filename}-COMPLETE.json`);
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log('✅ Golden master generated successfully!');
console.log('');
console.log(`📄 Output: golden-tax-cases-${filename}-COMPLETE.json`);
console.log(
  `📊 Scenarios: ${generated.length} (${generated.length - 1} auto-generated + 1 manual)`,
);
console.log('');
console.log('📋 Sample values:');
const sample = generated[0];
console.log(`   ${sample.id}: £${sample.input.salary.toLocaleString()}`);
console.log(`   - Income Tax: £${sample.expected.incomeTax.toLocaleString()}`);
console.log(`   - Employee NI: £${sample.expected.employeeNI.toLocaleString()}`);
console.log(`   - Net Pay: £${sample.expected.netPay.toLocaleString()}`);
console.log('');
console.log('Next steps:');
console.log('1. Run: npx playwright test golden-master-PERFECT.spec.ts');
console.log('2. Commit COMPLETE.json');
console.log('');
console.log('🎯 For 2026-27: update taxRates.ts, re-run this script, commit. Done!');
console.log('='.repeat(80));
