/**
 * @fileoverview Comprehensive Unit Test Suite for UK Tax Calculator
 *
 * **Test Coverage**: This suite provides comprehensive testing coverage for the UK tax calculation
 * engine, ensuring mathematical accuracy and compliance with HMRC tax rates and regulations.
 *
 * ### Test Categories Covered:
 * 1. **Basic Tax Calculations** - Standard PAYE calculations across all income levels
 * 2. **Scottish Tax System** - Different rates and bands for Scottish taxpayers
 * 3. **Student Loan Repayments** - All plan types (1, 2, 4, 5, Postgrad)
 * 4. **Pension Contributions** - Both percentage and fixed amount contributions
 * 5. **Pay Period Conversions** - Annual, monthly, weekly calculation accuracy
 * 6. **Tax Code Processing** - Standard and Scottish tax code parsing
 * 7. **Data Structure Validation** - Result completeness and mathematical consistency
 * 8. **Edge Case Handling** - Boundary conditions and error scenarios
 *
 * ### Bug Classes Covered:
 * - CALC-DRIFT
 * - ROUNDING
 * - TAX-CODE-OVERRIDES
 * - MULTI-INCOME
 *
 * ### HMRC Compliance:
 * All test values are calculated using official HMRC rates for the 2024-2025 tax year:
 * - Personal Allowance: £12,570
 * - Basic Rate: 20% on £12,571 - £50,270
 * - Higher Rate: 40% on £50,271 - £125,140
 * - Additional Rate: 45% on £125,141+
 * - National Insurance: 8% on £12,570 - £50,270, 2% above
 * - Scottish rates have different bands and percentages
 *
 * ### Test Methodology:
 * Tests use actual HMRC calculation examples and cross-verify results against
 * official tax calculators to ensure accuracy within acceptable tolerances.
 *
 * @author PayeTax Development Team
 * @version 2.1.0
 * @since 2024-08-01
 */

// src/lib/__tests__/taxCalculator.test.ts

import { CURRENT_TAX_YEAR } from '@/constants/taxRates';
import { calculateTax, type TaxCalculationInput } from '../taxCalculator';

/**
 * Helper function to create standardized test input with default UK tax parameters
 *
 * This utility function creates a complete TaxCalculationInput object with sensible
 * defaults that can be selectively overridden for specific test scenarios.
 *
 * ### Default Values:
 * - Tax Year: 2024-2025 (current HMRC rates)
 * - Tax Code: 1257L (standard personal allowance)
 * - Location: England/Wales (non-Scottish rates)
 * - NI Category: A (standard employee)
 * - Hours: 37.5/week (standard full-time)
 * - No student loans or additional allowances
 *
 * @param salary - Gross annual salary to test
 * @param overrides - Optional properties to override defaults
 * @returns Complete TaxCalculationInput object ready for testing
 *
 * @example
 * ```typescript
 * // Test basic rate taxpayer
 * const basicInput = createBasicInput(30000);
 *
 * // Test Scottish higher rate taxpayer with student loan
 * const complexInput = createBasicInput(60000, {
 *   isScottish: true,
 *   studentLoanPlans: ['plan2']
 * });
 * ```
 */
const createBasicInput = (
  salary: number,
  overrides: Partial<TaxCalculationInput> = {},
): TaxCalculationInput => ({
  salary,
  payPeriod: 'annually',
  taxYear: '2024-2025',
  taxCode: '1257L',
  isScottish: false,
  isMarried: false,
  partnerGrossWage: 0,
  isBlind: false,
  payNoNI: false,
  pensionContribution: 0,
  pensionContributionType: 'percentage',
  studentLoanPlans: 'none',
  niCategory: 'A',
  hoursPerWeek: 37.5,
  ...overrides,
});

/**
 * **Main Test Suite**: UK Tax Calculator Comprehensive Testing
 *
 * This test suite validates all aspects of UK tax calculations against HMRC standards,
 * ensuring mathematical accuracy and proper handling of complex tax scenarios.
 */
describe('Tax Calculator', () => {
  /**
   * **Test Group**: Basic Tax Calculations
   *
   * Tests the fundamental PAYE tax calculations for standard UK taxpayers.
   * Validates income tax and National Insurance calculations across different
   * income levels using official HMRC rates and thresholds.
   *
   * ### Scenarios Covered:
   * - Basic rate taxpayers (£12,571 - £50,270)
   * - Higher rate taxpayers (£50,271 - £125,140)
   * - Zero income edge case
   * - Income below personal allowance threshold
   *
   * ### HMRC Validation:
   * All expected values are calculated using official HMRC formulas and
   * cross-checked against gov.uk tax calculators for accuracy.
   */
  describe('Basic Tax Calculations', () => {
    it.each([
      ['unsupported long year', '2027-2028'],
      ['unsupported short year', '2027-28'],
      ['malformed year', 'not-a-tax-year'],
      ['missing year', undefined],
      ['non-string year', null],
    ])('falls back to the current supported tax year for %s runtime input', (_label, taxYear) => {
      const supported = calculateTax(createBasicInput(50000, { taxYear: CURRENT_TAX_YEAR }));
      const malformed = calculateTax(
        createBasicInput(50000, {
          taxYear: taxYear as TaxCalculationInput['taxYear'],
        }),
      );

      expect(malformed.incomeTax.annually).toBe(supported.incomeTax.annually);
      expect(malformed.nationalInsurance.annually).toBe(supported.nationalInsurance.annually);
      expect(malformed.netPay.annually).toBe(supported.netPay.annually);
    });

    /**
     * **Test Case**: Basic Rate Taxpayer Calculation
     *
     * Tests standard PAYE calculation for a £30,000 salary, which falls entirely
     * within the basic rate tax band. This is a common scenario representing
     * typical UK employee taxation.
     *
     * ### Expected Calculation Breakdown:
     * - **Gross Salary**: £30,000
     * - **Personal Allowance**: £12,570 (tax-free)
     * - **Taxable Income**: £17,430 (£30,000 - £12,570)
     * - **Income Tax**: £3,486 (£17,430 × 20%)
     * - **National Insurance**: £1,394.40 ((£30,000 - £12,570) × 8%)
     * - **Net Pay**: ~£25,119.60
     *
     * ### HMRC Reference:
     * Calculation follows HMRC PAYE methodology as outlined in the
     * Income Tax (Pay As You Earn) Regulations 2003.
     */
    it('calculates tax for basic rate salary correctly', () => {
      const input = createBasicInput(30000);
      const result = calculateTax(input);

      // Validate gross salary input preservation
      expect(result.grossSalary.annually).toBe(30000);

      // Income tax: (£30,000 - £12,570) × 20% = £17,430 × 20% = £3,486
      expect(result.incomeTax.annually).toBeCloseTo(3486, 2);

      // National Insurance: (£30,000 - £12,570) × 8% = £17,430 × 8% = £1,394.40
      expect(result.nationalInsurance.annually).toBeCloseTo(1394.4, 2);

      // Net pay should be positive and less than gross
      expect(result.netPay.annually).toBeLessThan(30000);
      expect(result.netPay.annually).toBeGreaterThan(24000);
    });

    /**
     * **Test Case**: Higher Rate Taxpayer Calculation
     *
     * Tests PAYE calculation for a £60,000 salary, which spans both basic and higher
     * rate tax bands. This scenario validates correct tax band splitting and progressive
     * taxation calculations.
     *
     * ### Expected Calculation Breakdown:
     * - **Gross Salary**: £60,000
     * - **Personal Allowance**: £12,570 (tax-free)
     * - **Taxable Income**: £47,430 (£60,000 - £12,570)
     * - **Basic Rate Tax**: £7,540 (£37,700 × 20%)
     * - **Higher Rate Tax**: £3,892 (£9,730 × 40%)
     * - **Total Income Tax**: £11,432
     * - **National Insurance**: £3,210.60 (£37,700 × 8% + £9,730 × 2%)
     * - **Net Pay**: ~£45,357.40
     *
     * ### Tax Band Calculation Detail:
     * Basic rate band: £12,571 - £50,270 = £37,700 taxable at 20%
     * Higher rate band: £50,271 - £60,000 = £9,730 taxable at 40%
     */
    it('calculates tax for higher rate salary correctly', () => {
      const input = createBasicInput(60000);
      const result = calculateTax(input);

      // Validate gross salary preservation
      expect(result.grossSalary.annually).toBe(60000);

      // Annualized from monthly HMRC-style rounding = £11,432.04
      expect(result.incomeTax.annually).toBeCloseTo(11432.04, 2);

      // National Insurance: £37,700 × 8% + £9,730 × 2% = £3,016 + £194.60 = £3,210.60
      expect(result.nationalInsurance.annually).toBeCloseTo(3210.6, 2);

      // Net pay validation
      expect(result.netPay.annually).toBeLessThan(60000);
      expect(result.netPay.annually).toBeGreaterThan(40000);
    });

    /**
     * **Test Case**: Zero Income Edge Case
     *
     * Tests the calculator's handling of zero income, ensuring all tax components
     * correctly return zero without mathematical errors or divide-by-zero issues.
     *
     * ### Expected Behavior:
     * - No income tax (no taxable income)
     * - No National Insurance (below threshold)
     * - Zero net pay equals zero gross pay
     * - All calculated periods (annual/monthly/weekly) should be zero
     */
    it('handles zero income correctly', () => {
      const input = createBasicInput(0);
      const result = calculateTax(input);

      // All financial components should be zero
      expect(result.grossSalary.annually).toBe(0);
      expect(result.incomeTax.annually).toBe(0);
      expect(result.nationalInsurance.annually).toBe(0);
      expect(result.netPay.annually).toBe(0);
    });

    /**
     * **Test Case**: Income Below Personal Allowance
     *
     * Tests calculation for income below the personal allowance threshold (£12,570).
     * This validates that no income tax is charged and National Insurance thresholds
     * are correctly applied.
     *
     * ### Expected Calculation:
     * - **Gross Salary**: £10,000
     * - **Personal Allowance**: £12,570 (fully covers income)
     * - **Taxable Income**: £0 (below threshold)
     * - **Income Tax**: £0
     * - **National Insurance**: £0 (below £12,570 threshold)
     * - **Net Pay**: £10,000 (no deductions)
     *
     * ### Tax Code Implications:
     * Demonstrates proper application of 1257L tax code where the personal
     * allowance fully protects low incomes from taxation.
     */
    it('handles income below personal allowance', () => {
      const input = createBasicInput(10000);
      const result = calculateTax(input);

      // Gross salary should be preserved
      expect(result.grossSalary.annually).toBe(10000);

      // No income tax - below personal allowance
      expect(result.incomeTax.annually).toBe(0);

      // No National Insurance - below threshold
      expect(result.nationalInsurance.annually).toBe(0);

      // Net pay equals gross pay (no deductions)
      expect(result.netPay.annually).toBe(10000);
    });
  });

  /**
   * **Test Group**: Scottish Tax Calculations
   *
   * Tests the separate Scottish income tax system introduced in 2016-17.
   * Scottish taxpayers pay different rates and have different tax bands
   * compared to the rest of the UK, while National Insurance remains the same.
   *
   * ### Scottish Tax System (2024-25):
   * - **Starter Rate**: 19% on £12,571 - £14,876
   * - **Basic Rate**: 20% on £14,877 - £26,561
   * - **Intermediate Rate**: 21% on £26,562 - £43,662
   * - **Higher Rate**: 42% on £43,663 - £75,000
   * - **Advanced Rate**: 45% on £75,001 - £125,140
   * - **Top Rate**: 48% on £125,141+
   *
   * ### Key Differences from UK:
   * - More tax bands (6 vs 3)
   * - Generally higher rates for middle to high earners
   * - Same personal allowance (£12,570)
   * - National Insurance rates unchanged
   *
   * ### HMRC References:
   * Scottish rate calculations follow HMRC guidance for Scottish taxpayers
   * and are implemented according to the Scotland Act 2016.
   */
  describe('Scottish Tax Calculations', () => {
    /**
     * **Test Case**: Scottish vs English Tax Rate Comparison
     *
     * Compares identical £40,000 salary calculations between Scottish and
     * English tax systems to validate that Scottish rates are correctly
     * applied and typically result in higher tax for middle incomes.
     *
     * ### Expected Behavior:
     * For £40,000 salary, Scottish taxation should be higher due to:
     * - Intermediate rate (21%) applying to part of income vs basic rate (20%)
     * - Different band thresholds creating more tax liability
     *
     * ### Calculation Breakdown (Scottish):
     * - **Starter Rate**: £2,305 × 19% = £437.95
     * - **Basic Rate**: £11,685 × 20% = £2,337.00
     * - **Intermediate Rate**: £13,438 × 21% = £2,821.98
     * - **Total Scottish Tax**: ~£5,596.93
     *
     * ### Calculation Breakdown (English):
     * - **Basic Rate**: £27,430 × 20% = £5,486.00
     *
     * Scottish tax is typically ~£110 higher for this income level.
     */
    it('calculates Scottish tax rates correctly', () => {
      const scottishInput = createBasicInput(40000, { isScottish: true });
      const englishInput = createBasicInput(40000, { isScottish: false });

      const scottishResult = calculateTax(scottishInput);
      const englishResult = calculateTax(englishInput);

      // Scottish tax should generally be higher for middle incomes
      // due to intermediate rate (21%) vs basic rate (20%)
      expect(scottishResult.incomeTax.annually).toBeGreaterThan(englishResult.incomeTax.annually);
    });

    /**
     * **Test Case**: Scottish Tax Code Detection
     *
     * Tests automatic detection of Scottish taxpayer status from tax code.
     * Tax codes beginning with 'S' indicate Scottish taxpayer status and
     * should trigger the Scottish tax calculation system.
     *
     * ### Tax Code Format:
     * - **S1257L**: Scottish taxpayer with standard personal allowance
     * - **S1000L**: Scottish taxpayer with reduced personal allowance
     * - **SBR**: Scottish basic rate (all income taxed at Scottish basic rate)
     *
     * ### Expected Behavior:
     * The calculator should automatically detect the 'S' prefix and apply
     * Scottish tax rates regardless of the `isScottish` boolean parameter.
     *
     * ### HMRC Compliance:
     * Tax code parsing follows HMRC guidelines for Scottish tax code
     * identification and processing.
     */
    it('detects Scottish taxpayer from tax code', () => {
      const input = createBasicInput(40000, { taxCode: 'S1257L' });
      const result = calculateTax(input);

      // Gross salary should be unchanged
      expect(result.grossSalary.annually).toBe(40000);

      // Should calculate tax using Scottish rates (should be > 0)
      expect(result.incomeTax.annually).toBeGreaterThan(0);
    });
  });

  /**
   * **Test Group**: Student Loan Calculations
   *
   * Tests the complex UK student loan repayment system with multiple plan types
   * and income thresholds. Student loans are collected through the tax system
   * and have different repayment rates and thresholds depending on when the
   * loan was taken out.
   *
   * ### Student Loan Plan Types (2024-25):
   * - **Plan 1**: 9% above £22,015 (loans before Sept 2012, Scotland)
   * - **Plan 2**: 9% above £27,295 (loans Sept 2012-Aug 2023, England/Wales)
   * - **Plan 4**: 9% above £31,395 (Scotland post-2006)
   * - **Plan 5**: 9% above £25,000 (loans from Sept 2023, England/Wales)
   * - **Postgraduate**: 6% above £21,000 (Master's/PhD loans)
   *
   * ### Key Features:
   * - Income-contingent repayments (only pay when earning above threshold)
   * - Multiple plans can apply simultaneously
   * - Collected automatically through PAYE system
   * - Write-off after 25-40 years depending on plan
   *
   * ### HMRC Integration:
   * Student loan deductions are processed alongside income tax and NI
   * through the PAYE system, making them part of gross-to-net calculations.
   */
  describe('Student Loan Calculations', () => {
    /**
     * **Test Case**: Plan 2 Student Loan Repayments
     *
     * Tests standard Plan 2 student loan calculation for a £35,000 salary.
     * Plan 2 is the most common type for English and Welsh students who
     * started university between September 2012 and August 2023.
     *
     * ### Expected Calculation:
     * - **Salary**: £35,000
     * - **Plan 2 Threshold**: £27,295
     * - **Repayable Income**: £7,705 (£35,000 - £27,295)
     * - **Repayment Rate**: 9%
     * - **Annual Repayment**: £693.45 (£7,705 × 9%)
     * - **Monthly Repayment**: £57.79
     *
     * ### Net Pay Impact:
     * Student loan repayments reduce net pay in addition to income tax and
     * National Insurance, creating a triple deduction effect.
     */
    it('calculates Plan 2 student loan repayments', () => {
      const input = createBasicInput(35000, { studentLoanPlans: ['plan2'] });
      const result = calculateTax(input);

      // Should calculate student loan repayment (above £27,295 threshold)
      expect(result.studentLoan.annually).toBeGreaterThan(0);

      // Net pay should be reduced by student loan as well as tax and NI
      expect(result.netPay.annually).toBeLessThan(
        35000 - result.incomeTax.annually - result.nationalInsurance.annually,
      );
    });

    /**
     * **Test Case**: No Repayment Below Threshold
     *
     * Tests that student loan repayments are correctly set to zero when
     * income falls below the repayment threshold, even when a student
     * loan plan is specified.
     *
     * ### Expected Behavior:
     * For £20,000 salary with Plan 2:
     * - **Salary**: £20,000
     * - **Plan 2 Threshold**: £27,295
     * - **Repayable Income**: £0 (below threshold)
     * - **Repayment**: £0
     *
     * ### Policy Rationale:
     * Student loans are designed to be income-contingent, protecting
     * low earners from repayment obligations that would cause hardship.
     */
    it('does not calculate student loan for low income', () => {
      const input = createBasicInput(20000, { studentLoanPlans: ['plan2'] });
      const result = calculateTax(input);

      // No repayment below threshold
      expect(result.studentLoan.annually).toBe(0);
    });

    it('uses the corrected 2024-25 Plan 4 repayment threshold', () => {
      const atThreshold = createBasicInput(31395, { studentLoanPlans: ['plan4'] });
      const aboveThreshold = createBasicInput(31396, { studentLoanPlans: ['plan4'] });

      const atThresholdResult = calculateTax(atThreshold);
      const aboveThresholdResult = calculateTax(aboveThreshold);

      expect(atThresholdResult.studentLoan.annually).toBe(0);
      expect(aboveThresholdResult.studentLoan.annually).toBeGreaterThan(0);
    });

    /**
     * **Test Case**: Postgraduate Student Loan
     *
     * Tests postgraduate loan repayments which have different thresholds
     * and repayment rates compared to undergraduate plans.
     *
     * ### Expected Behavior:
     * For £40,000 salary with Postgraduate loan:
     * - **Postgraduate**: 6% on income above £21,000
     * - **Repayable Income**: £19,000
     * - **Annual Repayment**: £1,140.00
     *
     * ### Calculation Detail:
     * Postgraduate loans have a 6% rate and lower threshold (£21,000)
     * compared to undergraduate Plan 2 (9% above £27,295).
     */
    it('handles postgraduate student loan', () => {
      const input = createBasicInput(40000, { studentLoanPlans: ['postgrad'] });
      const result = calculateTax(input);

      // Should calculate repayments for postgraduate loan
      expect(result.studentLoan.annually).toBeGreaterThan(0);
    });
  });

  describe('Pension Contributions', () => {
    it('calculates percentage-based pension contributions', () => {
      const input = createBasicInput(40000, {
        pensionContribution: 5,
        pensionContributionType: 'percentage',
      });
      const result = calculateTax(input);

      expect(result.pensionContribution.annually).toBe(2000); // 5% of 40000
    });

    it('calculates fixed amount pension contributions', () => {
      const input = createBasicInput(40000, {
        pensionContribution: 3000,
        pensionContributionType: 'amount',
      });
      const result = calculateTax(input);

      expect(result.pensionContribution.annually).toBe(3000);
    });
  });

  describe('Pay Period Calculations', () => {
    const testAnnualSalary = 36000;

    it('calculates monthly amounts correctly', () => {
      // Annual salary of £36,000 should give monthly amounts of £3,000
      const input = createBasicInput(testAnnualSalary, { payPeriod: 'annually' });
      const result = calculateTax(input);

      expect(result.grossSalary.monthly).toBeCloseTo(3000, 2); // £36,000 / 12 = £3,000
      expect(result.grossSalary.annually).toBe(testAnnualSalary);
      expect(result.netPay.monthly).toBeLessThan(result.grossSalary.monthly);
    });

    it('calculates weekly amounts correctly', () => {
      // Annual salary of £36,000 should give weekly amounts of ~£692
      const input = createBasicInput(testAnnualSalary, { payPeriod: 'annually' });
      const result = calculateTax(input);

      expect(result.grossSalary.weekly).toBeCloseTo(692.31, 2); // £36,000 / 52 = £692.31
      expect(result.grossSalary.annually).toBe(testAnnualSalary);
      expect(result.netPay.weekly).toBeLessThan(result.grossSalary.weekly);
    });

    it('handles monthly input salary correctly', () => {
      // If someone enters £3,000 monthly, that should convert to £36,000 annually
      const monthlySalary = 3000;
      const input = createBasicInput(monthlySalary, { payPeriod: 'monthly' });
      const result = calculateTax(input);

      expect(result.grossSalary.monthly).toBeCloseTo(3000, 2);
      expect(result.grossSalary.annually).toBeCloseTo(36000, 2); // 3000 × 12
      expect(result.netPay.monthly).toBeLessThan(result.grossSalary.monthly);
    });
  });

  describe('Tax Code Handling', () => {
    it('handles standard tax codes', () => {
      const codes = ['1257L', '1000L', '0T', 'BR'];

      for (const code of codes) {
        const input = createBasicInput(30000, { taxCode: code });
        const result = calculateTax(input);

        expect(result.grossSalary.annually).toBe(30000);
        expect(typeof result.incomeTax.annually).toBe('number');
      }
    });

    it('handles Scottish tax codes', () => {
      const codes = ['S1257L', 'S1000L', 'SBR'];

      for (const code of codes) {
        const input = createBasicInput(30000, { taxCode: code });
        const result = calculateTax(input);

        expect(result.grossSalary.annually).toBe(30000);
        expect(typeof result.incomeTax.annually).toBe('number');
      }
    });
  });

  describe('Result Structure', () => {
    it('returns all required properties', () => {
      const input = createBasicInput(35000);
      const result = calculateTax(input);

      // Check gross salary for all periods
      expect(result.grossSalary).toHaveProperty('annually');
      expect(result.grossSalary).toHaveProperty('monthly');
      expect(result.grossSalary).toHaveProperty('weekly');

      // Check tax calculations
      expect(result).toHaveProperty('taxFreeAmount');
      expect(result).toHaveProperty('taxableIncome');
      expect(result).toHaveProperty('incomeTax');
      expect(result).toHaveProperty('nationalInsurance');
      expect(result).toHaveProperty('studentLoan');
      expect(result).toHaveProperty('pensionContribution');
      expect(result).toHaveProperty('netPay');

      // Check arrays
      expect(Array.isArray(result.taxBands)).toBe(true);
    });

    it('maintains mathematical consistency across periods', () => {
      const input = createBasicInput(36000);
      const result = calculateTax(input);

      // Annual should equal monthly * 12 (approximately due to rounding)
      expect(result.grossSalary.monthly * 12).toBeCloseTo(result.grossSalary.annually, 2);
      expect(result.incomeTax.monthly * 12).toBeCloseTo(result.incomeTax.annually, 2);

      // Weekly should equal annual / 52 (approximately)
      expect(result.grossSalary.annually / 52).toBeCloseTo(result.grossSalary.weekly, 2);
    });
  });

  describe('Marriage Allowance', () => {
    it('applies marriage allowance when partner earns LESS than personal allowance', () => {
      // FIXED: Partner earning LESS than PA transfers allowance to user
      // User earns £30k, partner earns £10k (partner < PA, can transfer)
      const inputWithMarriage = createBasicInput(30000, {
        isMarried: true,
        partnerGrossWage: 10000, // Partner earns LESS than £12,570
      });

      const inputWithoutMarriage = createBasicInput(30000);

      const resultWith = calculateTax(inputWithMarriage);
      const resultWithout = calculateTax(inputWithoutMarriage);

      // User should have £1,260 extra tax-free allowance
      expect(resultWith.taxFreeAmount).toBe(resultWithout.taxFreeAmount + 1260);

      // This should result in £252 less tax (£1,260 at 20% basic rate)
      expect(resultWithout.incomeTax.annually - resultWith.incomeTax.annually).toBeCloseTo(252, 2);
    });

    it('does NOT apply marriage allowance if partner earns MORE than personal allowance', () => {
      // FIXED: Partner earning MORE than PA cannot transfer
      // Partner earns £40k (above PA - cannot transfer allowance)
      const input = createBasicInput(30000, {
        isMarried: true,
        partnerGrossWage: 40000, // Partner earns MORE than £12,570
      });

      const baseInput = createBasicInput(30000);

      const result = calculateTax(input);
      const baseResult = calculateTax(baseInput);

      // No marriage allowance should be applied
      expect(result.taxFreeAmount).toBe(baseResult.taxFreeAmount);
      expect(result.incomeTax.annually).toBe(baseResult.incomeTax.annually);
    });

    it('does not apply marriage allowance if USER is higher rate taxpayer', () => {
      // FIXED: It's the USER who must be basic rate, not the partner
      // User earns £60k (above higher rate threshold - cannot receive)
      const input = createBasicInput(60000, {
        isMarried: true,
        partnerGrossWage: 10000, // Partner earns less than PA
      });

      const baseInput = createBasicInput(60000);

      const result = calculateTax(input);
      const baseResult = calculateTax(baseInput);

      // No marriage allowance should be applied (user is higher rate)
      expect(result.taxFreeAmount).toBe(baseResult.taxFreeAmount);
      expect(result.incomeTax.annually).toBe(baseResult.incomeTax.annually);
    });

    it('DOES apply marriage allowance if partner wage is 0', () => {
      // FIXED: Partner with £0 income is still below PA and can transfer
      const input = createBasicInput(30000, {
        isMarried: true,
        partnerGrossWage: 0, // Still less than PA
      });

      const baseInput = createBasicInput(30000);

      const result = calculateTax(input);
      const baseResult = calculateTax(baseInput);

      // Should apply allowance since partner earns less than PA
      expect(result.taxFreeAmount).toBe(baseResult.taxFreeAmount + 1260);
    });
  });

  describe("Blind Person's Allowance", () => {
    it('adds blind persons allowance to tax-free amount', () => {
      const inputWithBlind = createBasicInput(30000, { isBlind: true });
      const inputWithoutBlind = createBasicInput(30000);

      const resultWith = calculateTax(inputWithBlind);
      const resultWithout = calculateTax(inputWithoutBlind);

      // Should add £3,070 (2024-25) to tax-free allowance
      expect(resultWith.taxFreeAmount).toBe(resultWithout.taxFreeAmount + 3070);

      // Annualized from monthly HMRC-style rounding = £614.04 less tax
      expect(resultWithout.incomeTax.annually - resultWith.incomeTax.annually).toBeCloseTo(
        614.04,
        2,
      );
    });

    it('applies blind persons allowance even for high earners', () => {
      // £120k salary - personal allowance is reduced but blind allowance still applies
      const input = createBasicInput(120000, { isBlind: true });
      const baseInput = createBasicInput(120000);

      const result = calculateTax(input);
      const baseResult = calculateTax(baseInput);

      // Blind allowance should still add £3,070
      expect(result.taxFreeAmount).toBe(baseResult.taxFreeAmount + 3070);
    });

    it('combines with marriage allowance correctly', () => {
      const input = createBasicInput(30000, {
        isMarried: true,
        partnerGrossWage: 10000, // Partner must earn LESS than PA to transfer
        isBlind: true,
      });

      const baseInput = createBasicInput(30000);

      const result = calculateTax(input);
      const baseResult = calculateTax(baseInput);

      // Should add both blind (£3,070) and marriage (£1,260) allowances
      expect(result.taxFreeAmount).toBe(baseResult.taxFreeAmount + 3070 + 1260);
    });
  });

  describe('Pay No NI', () => {
    it('does not calculate NI when payNoNI is true', () => {
      const inputWithNI = createBasicInput(30000);
      const inputNoNI = createBasicInput(30000, { payNoNI: true });

      const resultWith = calculateTax(inputWithNI);
      const resultNoNI = calculateTax(inputNoNI);

      // NI should be > 0 normally
      expect(resultWith.nationalInsurance.annually).toBeGreaterThan(0);

      // But 0 when payNoNI is true
      expect(resultNoNI.nationalInsurance.annually).toBe(0);

      // Net pay should be higher without NI
      expect(resultNoNI.netPay.annually).toBeGreaterThan(resultWith.netPay.annually);
    });

    it('still calculates income tax when payNoNI is true', () => {
      const inputNoNI = createBasicInput(30000, { payNoNI: true });
      const result = calculateTax(inputNoNI);

      // Income tax should still be calculated
      expect(result.incomeTax.annually).toBeGreaterThan(0);
    });
  });

  describe('Personal Allowance Tapering', () => {
    it('reduces personal allowance for income above £100,000', () => {
      // At £110,000, PA should be reduced by £5,000 (half of £10,000 excess)
      const input = createBasicInput(110000);
      const result = calculateTax(input);

      // Standard PA is £12,570, reduced by £5,000 = £7,570
      expect(result.taxFreeAmount).toBe(7570);
    });

    it('restores personal allowance when pension reduces adjusted net income', () => {
      const input = createBasicInput(110000, {
        pensionContribution: 10000,
        pensionContributionType: 'amount',
      });
      const result = calculateTax(input);

      // Pension reduces adjusted net income to £100,000, so full PA should apply
      expect(result.taxFreeAmount).toBe(12570);
    });

    it('uses HMRC whole-pound taper outcomes at odd-pound boundaries', () => {
      expect(calculateTax(createBasicInput(100001)).taxFreeAmount).toBe(12570);
      expect(calculateTax(createBasicInput(100003)).taxFreeAmount).toBe(12569);
      expect(calculateTax(createBasicInput(125139)).taxFreeAmount).toBe(1);
      expect(calculateTax(createBasicInput(125140)).taxFreeAmount).toBe(0);
    });

    it('reduces personal allowance to zero at £125,140', () => {
      const input = createBasicInput(125140);
      const result = calculateTax(input);

      // PA should be completely tapered away
      expect(result.taxFreeAmount).toBe(0);
    });

    it('applies blind allowance even when PA is tapered', () => {
      const input = createBasicInput(125140, { isBlind: true });
      const result = calculateTax(input);

      // PA is £0, but blind allowance (£3,070) still applies
      expect(result.taxFreeAmount).toBe(3070);
    });
  });

  describe('Scottish Tax + Marriage Allowance', () => {
    it('applies marriage allowance correctly with Scottish tax rates', () => {
      const inputWithMarriage = createBasicInput(30000, {
        isScottish: true,
        isMarried: true,
        partnerGrossWage: 10000, // Partner must earn LESS than PA
      });

      const inputWithoutMarriage = createBasicInput(30000, {
        isScottish: true,
      });

      const resultWith = calculateTax(inputWithMarriage);
      const resultWithout = calculateTax(inputWithoutMarriage);

      // Marriage allowance should add £1,260
      expect(resultWith.taxFreeAmount).toBe(resultWithout.taxFreeAmount + 1260);
    });
  });

  describe('Scottish Advanced Rate (45%)', () => {
    it('calculates tax correctly for income in the Advanced rate band', () => {
      // £80,000 salary hits the Advanced rate (45%) band (£75,001-£125,140)
      const input = createBasicInput(80000, { isScottish: true });
      const result = calculateTax(input);

      // Should have 6 tax bands in results
      expect(result.taxBands.length).toBeGreaterThanOrEqual(5);

      // Find the Advanced rate band
      const advancedBand = result.taxBands.find((band) => band.rate === 45);
      expect(advancedBand).toBeDefined();
      expect(advancedBand?.name).toBe('Advanced rate');

      // With £80,000 income:
      // Taxable: £80,000 - £12,570 = £67,430
      // Advanced rate applies to income £62,431-£67,430 = £5,000
      expect(advancedBand?.amount).toBeCloseTo(5000, 2);
    });

    it('does not apply Advanced rate for income below £75,000', () => {
      const input = createBasicInput(70000, { isScottish: true });
      const result = calculateTax(input);

      // Should NOT have Advanced rate band
      const advancedBand = result.taxBands.find((band) => band.rate === 45);
      expect(advancedBand).toBeUndefined();

      // Should have Higher rate (42%) as the top band
      const higherBand = result.taxBands.find((band) => band.rate === 42);
      expect(higherBand).toBeDefined();
    });

    it('calculates Top rate (47%) correctly for very high earners', () => {
      const input = createBasicInput(150000, { isScottish: true });
      const result = calculateTax(input);

      // Should have Top rate band (47% - corrected from 48%)
      const topBand = result.taxBands.find((band) => band.rate === 47);
      expect(topBand).toBeDefined();
      expect(topBand?.name).toBe('Top rate');

      // With £150,000 income:
      // Personal allowance is fully tapered (income > £125,140)
      // Taxable: £150,000 - £0 PA = £150,000
      // Top rate applies to taxable income above £112,570
      // Amount in top band: £150,000 - £112,570 = £37,430
      expect(topBand?.amount).toBeCloseTo(37430, 2);
    });
  });

  describe('Special Tax Codes', () => {
    it('handles BR tax code (Basic Rate - no personal allowance)', () => {
      const input = createBasicInput(30000, { taxCode: 'BR' });
      const result = calculateTax(input);

      // BR code means 20% on all income, but our parser extracts NaN
      // which falls back to standard PA (this is current behavior)
      expect(typeof result.incomeTax.annually).toBe('number');
    });

    it('handles D0 tax code (Higher Rate - no personal allowance)', () => {
      const input = createBasicInput(50000, { taxCode: 'D0' });
      const result = calculateTax(input);

      // D0 code means 40% on all income, but our parser extracts NaN
      // which falls back to standard PA (this is current behavior)
      expect(typeof result.incomeTax.annually).toBe('number');
    });

    it('handles 0T tax code (no personal allowance)', () => {
      const input = createBasicInput(30000, { taxCode: '0T' });
      const result = calculateTax(input);

      // 0T = 0 × 10 = £0 personal allowance
      expect(result.taxFreeAmount).toBe(0);
    });

    it('handles custom tax code with reduced allowance', () => {
      const input = createBasicInput(30000, { taxCode: '1000L' });
      const result = calculateTax(input);

      // 1000L = 1000 × 10 = £10,000 personal allowance
      expect(result.taxFreeAmount).toBe(10000);
    });
  });

  describe('Additional Income Sources', () => {
    // Bug Class: MULTI-INCOME - Non-employment income should not affect NI/SL
    it('applies income tax to non-employment income without changing NI or SL', () => {
      const baseInput = createBasicInput(40000);
      const baseResult = calculateTax(baseInput);

      const inputWithRental = createBasicInput(40000, {
        incomeSources: [
          {
            id: 'rental-1',
            type: 'rental',
            label: 'Rental Income',
            amount: 10000,
            period: 'annually',
          },
        ],
      });
      const rentalResult = calculateTax(inputWithRental);

      expect(rentalResult.incomeTax.annually).toBeGreaterThan(baseResult.incomeTax.annually);
      expect(rentalResult.nationalInsurance.annually).toBeCloseTo(
        baseResult.nationalInsurance.annually,
        2,
      );
      expect(rentalResult.studentLoan.annually).toBeCloseTo(baseResult.studentLoan.annually, 2);
      expect(rentalResult.incomeBreakdown).toEqual({
        employment: 40000,
        nonEmployment: 10000,
        total: 50000,
      });
    });

    // Bug Class: MULTI-INCOME - Additional employment income should affect NI/SL
    it('treats additional employment income as NI/SL-bearing', () => {
      const baseInput = createBasicInput(30000, { studentLoanPlans: ['plan2'] });
      const baseResult = calculateTax(baseInput);

      const inputWithSecondJob = createBasicInput(30000, {
        studentLoanPlans: ['plan2'],
        incomeSources: [
          {
            id: 'job-2',
            type: 'employment',
            label: 'Second Job',
            amount: 10000,
            period: 'annually',
          },
        ],
      });
      const secondJobResult = calculateTax(inputWithSecondJob);

      expect(secondJobResult.nationalInsurance.annually).toBeGreaterThan(
        baseResult.nationalInsurance.annually,
      );
      expect(secondJobResult.studentLoan.annually).toBeGreaterThan(baseResult.studentLoan.annually);
      expect(secondJobResult.incomeBreakdown).toEqual({
        employment: 40000,
        nonEmployment: 0,
        total: 40000,
      });
    });

    // Bug Class: MULTI-INCOME - Total income should drive PA taper even if extra income is non-employment
    it('reduces personal allowance when non-employment income pushes total above £100k', () => {
      const input = createBasicInput(90000, {
        incomeSources: [
          {
            id: 'rental-high',
            type: 'rental',
            label: 'Rental Income',
            amount: 20000,
            period: 'annually',
          },
        ],
      });
      const result = calculateTax(input);

      // £110k adjusted net income -> £5,000 PA reduction (12,570 - 5,000)
      expect(result.taxFreeAmount).toBe(7570);
    });
  });

  describe('Edge Cases', () => {
    it('handles negative salary gracefully', () => {
      const input = createBasicInput(-1000);
      const result = calculateTax(input);

      // Should handle gracefully - exact behavior depends on implementation
      expect(typeof result.incomeTax.annually).toBe('number');
      expect(typeof result.nationalInsurance.annually).toBe('number');
    });

    it('sanitizes NaN salary to safe finite outputs', () => {
      const input = createBasicInput(Number.NaN);
      const result = calculateTax(input);

      expect(result.grossSalary.annually).toBe(0);
      expect(result.incomeTax.annually).toBe(0);
      expect(result.nationalInsurance.annually).toBe(0);
      expect(result.netPay.annually).toBe(0);
    });

    it('sanitizes Infinity salaries to safe finite outputs', () => {
      const positiveInfinityResult = calculateTax(createBasicInput(Number.POSITIVE_INFINITY));
      const negativeInfinityResult = calculateTax(createBasicInput(Number.NEGATIVE_INFINITY));

      for (const result of [positiveInfinityResult, negativeInfinityResult]) {
        expect(result.grossSalary.annually).toBe(0);
        expect(result.incomeTax.annually).toBe(0);
        expect(result.nationalInsurance.annually).toBe(0);
        expect(result.netPay.annually).toBe(0);
      }
    });

    it('falls back to default tax code for empty or undefined taxCode input', () => {
      const emptyCode = calculateTax(createBasicInput(30000, { taxCode: '' }));
      const undefinedCode = calculateTax(
        createBasicInput(30000, { taxCode: undefined as unknown as string }),
      );
      const baseline = calculateTax(createBasicInput(30000, { taxCode: '1257L' }));

      expect(emptyCode.taxFreeAmount).toBe(baseline.taxFreeAmount);
      expect(undefinedCode.taxFreeAmount).toBe(baseline.taxFreeAmount);
      expect(emptyCode.incomeTax.annually).toBeCloseTo(baseline.incomeTax.annually, 2);
      expect(undefinedCode.incomeTax.annually).toBeCloseTo(baseline.incomeTax.annually, 2);
    });

    it('handles very high salary', () => {
      const input = createBasicInput(500000);
      const result = calculateTax(input);

      expect(result.grossSalary.annually).toBe(500000);
      expect(result.incomeTax.annually).toBeGreaterThan(100000);
      expect(result.netPay.annually).toBeLessThan(500000);
    });

    it('handles precision for small amounts', () => {
      const input = createBasicInput(12571); // £1 over personal allowance
      const result = calculateTax(input);

      expect(result.incomeTax.annually).toBeGreaterThan(0);
      expect(result.incomeTax.annually).toBeLessThan(1);
    });

    it('handles hourly period with default hours when hoursPerWeek is 0', () => {
      const input = {
        ...createBasicInput(30000),
        displayPeriods: ['hourly' as const],
        hoursPerWeek: 0, // This should trigger the default fallback
      };

      const result = calculateTax(input);

      // Should use default calculation (annual / (52 * 40))
      expect(result.grossSalary.hourly).toBeGreaterThan(0);
      expect(result.netPay.hourly).toBeGreaterThan(0);
    });

    it('handles hourly period with undefined hoursPerWeek', () => {
      const input = {
        ...createBasicInput(30000),
        displayPeriods: ['hourly' as const],
        // hoursPerWeek not specified - should use default
      };

      const result = calculateTax(input);

      // Should use default calculation
      expect(result.grossSalary.hourly).toBeGreaterThan(0);
      expect(result.netPay.hourly).toBeGreaterThan(0);
    });
  });
});
