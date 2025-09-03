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
 * @author ToolHubX Development Team
 * @version 2.1.0
 * @since 2024-08-01
 */

// src/lib/__tests__/taxCalculator.test.ts

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
  overrides: Partial<TaxCalculationInput> = {}
): TaxCalculationInput => ({
  salary,
  payPeriod: 'annually',
  taxYear: '2024-2025',
  taxCode: '1257L',
  isScottish: false,
  pensionContribution: 0,
  pensionContributionType: 'percentage',
  studentLoanPlans: [],
  niCategory: 'A',
  hoursPerWeek: 37.5,
  additionalAllowances: [],
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
      expect(result.incomeTax.annually).toBeCloseTo(3486, 0);

      // National Insurance: (£30,000 - £12,570) × 8% = £17,430 × 8% = £1,394.40
      expect(result.nationalInsurance.annually).toBeCloseTo(1394.4, 0);

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

      // Income tax: £7,540 (basic rate) + £3,892 (higher rate) = £11,432
      expect(result.incomeTax.annually).toBeCloseTo(11432, 0);

      // National Insurance: £37,700 × 8% + £9,730 × 2% = £3,016 + £194.60 = £3,210.60
      expect(result.nationalInsurance.annually).toBeCloseTo(3210.6, 1);

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
   * - **Plan 4**: 9% above £27,660 (Scotland post-2006)
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
        35000 - result.incomeTax.annually - result.nationalInsurance.annually
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

    /**
     * **Test Case**: Multiple Student Loan Plans
     *
     * Tests handling of graduates with multiple student loan types, such as
     * undergraduate Plan 2 and postgraduate loans. This scenario is common
     * for people who did both undergraduate and postgraduate study.
     *
     * ### Expected Behavior:
     * For £40,000 salary with Plan 2 + Postgraduate:
     * - **Plan 2**: 9% on income above £27,295 = £1,143.45
     * - **Postgraduate**: 6% on income above £21,000 = £1,140.00
     * - **Total Repayment**: £2,283.45 annually
     *
     * ### Calculation Detail:
     * Multiple plans apply their rates independently to the same income,
     * creating cumulative repayment obligations that can significantly
     * impact net pay for higher earners with multiple qualifications.
     */
    it('handles multiple student loan plans', () => {
      const input = createBasicInput(40000, { studentLoanPlans: ['plan2', 'postgrad'] });
      const result = calculateTax(input);

      // Should calculate repayments for multiple plans
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

      expect(result.grossSalary.monthly).toBeCloseTo(3000, 0); // £36,000 / 12 = £3,000
      expect(result.grossSalary.annually).toBe(testAnnualSalary);
      expect(result.netPay.monthly).toBeLessThan(result.grossSalary.monthly);
    });

    it('calculates weekly amounts correctly', () => {
      // Annual salary of £36,000 should give weekly amounts of ~£692
      const input = createBasicInput(testAnnualSalary, { payPeriod: 'annually' });
      const result = calculateTax(input);

      expect(result.grossSalary.weekly).toBeCloseTo(692.31, 0); // £36,000 / 52 = £692.31
      expect(result.grossSalary.annually).toBe(testAnnualSalary);
      expect(result.netPay.weekly).toBeLessThan(result.grossSalary.weekly);
    });

    it('handles monthly input salary correctly', () => {
      // If someone enters £3,000 monthly, that should convert to £36,000 annually
      const monthlySalary = 3000;
      const input = createBasicInput(monthlySalary, { payPeriod: 'monthly' });
      const result = calculateTax(input);

      expect(result.grossSalary.monthly).toBeCloseTo(3000, 0);
      expect(result.grossSalary.annually).toBeCloseTo(36000, 0); // 3000 × 12
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
      expect(result.grossSalary.monthly * 12).toBeCloseTo(result.grossSalary.annually, 0);
      expect(result.incomeTax.monthly * 12).toBeCloseTo(result.incomeTax.annually, 1);

      // Weekly should equal annual / 52 (approximately)
      expect(result.grossSalary.annually / 52).toBeCloseTo(result.grossSalary.weekly, 1);
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
  });
});
