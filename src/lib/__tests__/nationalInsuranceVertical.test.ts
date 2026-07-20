/**
 * National Insurance vertical verification.
 *
 * What bug will this test find?
 * - CALC-DRIFT: engine, tool and annual module diverging on Class 1 NI
 * - ROUNDING: penny and whole-pound boundary regressions
 * - Effective-dated rate regressions around the 6 January 2024 primary rate cut
 *
 * ## Two statutory bases, pinned independently
 *
 * Payroll (pay period) and annual earnings period (directors) are different
 * statutory bases with different thresholds. The published annual Primary
 * Threshold is £12,570, while the monthly Primary Threshold of £1,048
 * annualises to £12,576, so the two bases do not agree for the same salary.
 * Each is pinned against HMRC on its own; neither is asserted against the other,
 * and the blended directors' rate is quoted from HMRC's tables rather than
 * derived here.
 *
 * Sources:
 * - https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2023-to-2024
 * - https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2024-to-2025
 * - https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026
 * - https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
 * - https://www.gov.uk/hmrc-internal-manuals/national-insurance-manual/nim01625
 * - https://www.gov.uk/national-insurance-rates-letters
 */

import {
  calculateEmployeeNI,
  calculateEmployerNI,
  calculateTax,
  getClass1PeriodThresholds,
  getDirectorsAnnualPrimaryRate,
  getEmployeeClass1MonthSegments,
  getEmployeeClass1RateForPayDate,
  getEmployeeNI,
  getEmployerNI,
  getPayDateForTaxPeriod,
  isEmployeeNIExempt,
  type NICategory,
  STATE_PENSION_AGE_NI_EXEMPTION,
  sliceClass1EmployeeEarnings,
  sliceClass1EmployerEarnings,
  type TaxCalculationInput,
  type TaxYear,
} from '@/lib/tax';

function createInput(overrides: Partial<TaxCalculationInput> = {}): TaxCalculationInput {
  return {
    salary: 30000,
    payPeriod: 'annually',
    taxYear: '2026-2027',
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
    hoursPerWeek: 40,
    ...overrides,
  };
}

describe('National Insurance vertical', () => {
  // ==========================================================================
  // Published period thresholds, every supported year
  // ==========================================================================

  describe('published period thresholds', () => {
    const thresholdFixtures = [
      {
        taxYear: '2026-2027',
        weeklyPrimary: 242,
        monthlyPrimary: 1048,
        weeklyUpper: 967,
        monthlyUpper: 4189,
        weeklySecondary: 96,
        monthlySecondary: 417,
      },
      {
        taxYear: '2025-2026',
        weeklyPrimary: 242,
        monthlyPrimary: 1048,
        weeklyUpper: 967,
        monthlyUpper: 4189,
        weeklySecondary: 96,
        monthlySecondary: 417,
      },
      {
        taxYear: '2024-2025',
        weeklyPrimary: 242,
        monthlyPrimary: 1048,
        weeklyUpper: 967,
        monthlyUpper: 4189,
        weeklySecondary: 175,
        monthlySecondary: 758,
      },
      {
        taxYear: '2023-2024',
        weeklyPrimary: 242,
        monthlyPrimary: 1048,
        weeklyUpper: 967,
        monthlyUpper: 4189,
        weeklySecondary: 175,
        monthlySecondary: 758,
      },
    ] as const;

    it.each(
      thresholdFixtures,
    )('matches HMRC published weekly and monthly thresholds for $taxYear', (fixture) => {
      const weekly = getClass1PeriodThresholds(fixture.taxYear, 'A', 'weekly');
      const monthly = getClass1PeriodThresholds(fixture.taxYear, 'A', 'monthly');

      expect(weekly.primary).toBe(fixture.weeklyPrimary);
      expect(weekly.upper).toBe(fixture.weeklyUpper);
      expect(weekly.secondary).toBe(fixture.weeklySecondary);
      expect(monthly.primary).toBe(fixture.monthlyPrimary);
      expect(monthly.upper).toBe(fixture.monthlyUpper);
      expect(monthly.secondary).toBe(fixture.monthlySecondary);
    });

    it.each(
      thresholdFixtures,
    )('keeps the published monthly secondary threshold distinct from annual/12 for $taxYear', (fixture) => {
      // The reason this vertical stores period thresholds rather than dividing:
      // £5,000/12 is £416.67, but HMRC publishes £417.
      const annual = calculateEmployerNI(0, fixture.taxYear).threshold;
      expect(fixture.monthlySecondary).not.toBeCloseTo(annual / 12, 2);
    });

    // Under-21 (M, Z) and apprentice-under-25 (H) categories use the upper
    // secondary threshold, so the employer 0% band runs far higher.
    const upperSecondaryCategories: NICategory[] = ['H', 'M', 'Z'];

    it.each(
      upperSecondaryCategories,
    )('applies the upper secondary threshold to employer NI for category %s', (niCategory) => {
      expect(getClass1PeriodThresholds('2026-2027', niCategory, 'monthly').secondary).toBe(4189);
      expect(getClass1PeriodThresholds('2026-2027', niCategory, 'weekly').secondary).toBe(967);
      expect(calculateEmployerNI(0, '2026-2027', { niCategory }).threshold).toBe(50270);
    });

    it('charges no employer NI below the upper secondary threshold for under-21 deferment (Z)', () => {
      // Category Z is under 21 with deferment. HMRC gives it the same employer
      // treatment as category M, not the standard secondary threshold.
      expect(getEmployerNI(50270, '2026-2027', { niCategory: 'Z' })).toBe(0);
      expect(getEmployerNI(50271, '2026-2027', { niCategory: 'Z' })).toBeCloseTo(0.15, 2);
      expect(getEmployerNI(50270, '2026-2027', { niCategory: 'M' })).toBe(0);
      // A standard category at the same salary pays substantially more.
      expect(getEmployerNI(50270, '2026-2027', { niCategory: 'A' })).toBeCloseTo(6790.5, 2);
    });
  });

  // ==========================================================================
  // Threshold boundaries
  // ==========================================================================

  describe('threshold boundaries', () => {
    const weeklyBoundaries = [
      { earnings: 241.99, expected: 0 },
      { earnings: 242, expected: 0 },
      { earnings: 242.01, expected: 0.0008 },
      { earnings: 966.99, expected: 57.9992 },
      { earnings: 967, expected: 58 },
      { earnings: 967.01, expected: 58.0002 },
    ] as const;

    it.each(
      weeklyBoundaries,
    )('slices weekly earnings of £$earnings at the 2026-27 primary and upper limits', ({
      earnings,
      expected,
    }) => {
      const thresholds = getClass1PeriodThresholds('2026-2027', 'A', 'weekly');
      const result = sliceClass1EmployeeEarnings(earnings, {
        primaryThreshold: thresholds.primary,
        upperEarningsLimit: thresholds.upper,
        primaryRate: 8,
        upperRate: 2,
      });

      expect(result.employeeNI).toBeCloseTo(expected, 4);
    });

    const monthlyBoundaries = [
      { earnings: 1047.99, expected: 0 },
      { earnings: 1048, expected: 0 },
      { earnings: 1048.01, expected: 0.0008 },
      { earnings: 4188.99, expected: 251.2792 },
      { earnings: 4189, expected: 251.28 },
      { earnings: 4189.01, expected: 251.2802 },
    ] as const;

    it.each(
      monthlyBoundaries,
    )('slices monthly earnings of £$earnings at the 2026-27 primary and upper limits', ({
      earnings,
      expected,
    }) => {
      const thresholds = getClass1PeriodThresholds('2026-2027', 'A', 'monthly');
      const result = sliceClass1EmployeeEarnings(earnings, {
        primaryThreshold: thresholds.primary,
        upperEarningsLimit: thresholds.upper,
        primaryRate: 8,
        upperRate: 2,
      });

      expect(result.employeeNI).toBeCloseTo(expected, 4);
    });

    it('charges the upper rate only above the upper earnings limit', () => {
      const thresholds = getClass1PeriodThresholds('2026-2027', 'A', 'monthly');
      const result = sliceClass1EmployeeEarnings(5000, {
        primaryThreshold: thresholds.primary,
        upperEarningsLimit: thresholds.upper,
        primaryRate: 8,
        upperRate: 2,
      });

      // (4189 - 1048) x 8% + (5000 - 4189) x 2%
      expect(result.employeeNI).toBeCloseTo(251.28 + 16.22, 2);
      expect(result.slices).toHaveLength(2);
      expect(result.slices[1]?.rate).toBe(2);
    });

    const employerBoundaries = [
      { earnings: 416.99, expected: 0 },
      { earnings: 417, expected: 0 },
      { earnings: 417.01, expected: 0.0015 },
      { earnings: 1000, expected: 87.45 },
    ] as const;

    it.each(
      employerBoundaries,
    )('charges employer NI above the monthly secondary threshold at £$earnings', ({
      earnings,
      expected,
    }) => {
      const result = sliceClass1EmployerEarnings(earnings, {
        secondaryThreshold: getClass1PeriodThresholds('2026-2027', 'A', 'monthly').secondary,
        secondaryRate: 15,
      });

      expect(result.employerNI).toBeCloseTo(expected, 4);
    });
  });

  // ==========================================================================
  // 2023-24 mid-year change: payroll basis
  // ==========================================================================

  describe('2023-24 payroll basis (rate by pay date)', () => {
    it('splits the year into nine months at 12% and three at 10% for category A', () => {
      // The cut applied to earnings paid on or after 6 January 2024, which is
      // the first day of tax month 10.
      expect(getEmployeeClass1MonthSegments('2023-2024', 'A')).toEqual([
        { rate: 12, months: 9 },
        { rate: 10, months: 3 },
      ]);
    });

    it('splits the married women reduced rate on the same date', () => {
      expect(getEmployeeClass1MonthSegments('2023-2024', 'B')).toEqual([
        { rate: 5.85, months: 9 },
        { rate: 3.85, months: 3 },
      ]);
    });

    const unchangedCategories: NICategory[] = ['C', 'J', 'Z'];

    it.each(
      unchangedCategories,
    )('returns a single full-year segment for category %s, which did not change', (niCategory) => {
      const segments = getEmployeeClass1MonthSegments('2023-2024', niCategory);
      expect(segments).toHaveLength(1);
      expect(segments[0]?.months).toBe(12);
    });

    const payDateFixtures = [
      { payDate: '2023-04-06', expected: 12 },
      { payDate: '2023-12-31', expected: 12 },
      { payDate: '2024-01-05', expected: 12 },
      { payDate: '2024-01-06', expected: 10 },
      { payDate: '2024-04-05', expected: 10 },
    ] as const;

    it.each(payDateFixtures)('uses the rate in force on pay date $payDate', ({
      payDate,
      expected,
    }) => {
      expect(
        getEmployeeClass1RateForPayDate('2023-2024', 'A', new Date(`${payDate}T00:00:00Z`)),
      ).toBe(expected);
    });

    it('never averages the two rates for a single pay period', () => {
      const rates = payDateFixtures.map((fixture) =>
        getEmployeeClass1RateForPayDate('2023-2024', 'A', new Date(`${fixture.payDate}T00:00:00Z`)),
      );

      // Every period takes one statutory rate or the other, never the blend.
      expect(new Set(rates)).toEqual(new Set([12, 10]));
      expect(rates).not.toContain(11.5);
    });

    it('requires a pay date rather than silently choosing a rate', () => {
      expect(() =>
        getEmployeeClass1RateForPayDate('2023-2024', 'A', new Date('not-a-date')),
      ).toThrow(TypeError);
      expect(() =>
        // @ts-expect-error deliberately omitting the timing basis
        getEmployeeClass1RateForPayDate('2023-2024', 'A', undefined),
      ).toThrow(TypeError);
    });

    it('resolves a straddling weekly period from the start of that tax period', () => {
      // Tax week 40 of 2023-24 runs 4-10 January 2024, straddling the 6 January
      // cut. Without a real pay date the period start is the deterministic
      // choice, so week 40 takes 12%. A scheme paying on 8 January would be at
      // 10% in real payroll. This pins the modelling choice rather than leaving
      // it implicit; it affects weekly and four-weekly schemes only, since
      // monthly tax periods begin on the 6th and never straddle.
      const weekFortyStart = getPayDateForTaxPeriod('2023-2024', 'weekly', 40);

      expect(weekFortyStart.toISOString().slice(0, 10)).toBe('2024-01-04');
      expect(getEmployeeClass1RateForPayDate('2023-2024', 'A', weekFortyStart)).toBe(12);
      expect(
        getEmployeeClass1RateForPayDate('2023-2024', 'A', new Date('2024-01-08T00:00:00Z')),
      ).toBe(10);
    });

    it('starts monthly tax period 10 exactly on the rate change date', () => {
      expect(getPayDateForTaxPeriod('2023-2024', 'monthly', 10).toISOString().slice(0, 10)).toBe(
        '2024-01-06',
      );
      expect(getPayDateForTaxPeriod('2023-2024', 'monthly', 9).toISOString().slice(0, 10)).toBe(
        '2023-12-06',
      );
    });

    it('produces the segment-weighted annual figure through the engine', () => {
      // £30,000 -> £2,500/month, £1,452 above the £1,048 monthly primary threshold.
      // 9 months x £174.24 + 3 months x £145.20 = £2,003.76
      const result = calculateTax(createInput({ salary: 30000, taxYear: '2023-2024' }));

      expect(result.nationalInsurance.annually).toBeCloseTo(2003.76, 2);
    });
  });

  // ==========================================================================
  // 2023-24 mid-year change: annual earnings-period (directors) basis
  // ==========================================================================

  describe('2023-24 annual earnings-period basis (directors)', () => {
    const blendedRateFixtures = [
      { niCategory: 'A', expected: 11.5 },
      { niCategory: 'H', expected: 11.5 },
      { niCategory: 'M', expected: 11.5 },
      { niCategory: 'B', expected: 5.35 },
      { niCategory: 'J', expected: 2 },
      { niCategory: 'Z', expected: 2 },
      { niCategory: 'C', expected: 0 },
    ] as const;

    it.each(blendedRateFixtures)('uses HMRC published blended rate for category $niCategory', ({
      niCategory,
      expected,
    }) => {
      expect(getDirectorsAnnualPrimaryRate('2023-2024', niCategory)).toBe(expected);
    });

    it('charges the blended rate against annual thresholds', () => {
      // £50,270 - £12,570 = £37,700 x 11.5% = £4,335.50
      expect(getEmployeeNI(50270, '2023-2024')).toBeCloseTo(4335.5, 2);
      // £30,000 - £12,570 = £17,430 x 11.5% = £2,004.45
      expect(getEmployeeNI(30000, '2023-2024')).toBeCloseTo(2004.45, 2);
    });

    it('falls back to the single statutory rate in years without a mid-year change', () => {
      expect(getDirectorsAnnualPrimaryRate('2024-2025', 'A')).toBe(8);
      expect(getDirectorsAnnualPrimaryRate('2025-2026', 'A')).toBe(8);
      expect(getDirectorsAnnualPrimaryRate('2026-2027', 'A')).toBe(8);
    });

    it('differs from the payroll basis, because the bases use different thresholds', () => {
      // Documented, expected divergence: the annual basis uses the published
      // annual primary threshold (£12,570); the payroll basis uses the monthly
      // threshold (£1,048), which annualises to £12,576. Neither is derived from
      // the other, and this test exists so the gap cannot silently change.
      const payrollBasis = calculateTax(createInput({ salary: 30000, taxYear: '2023-2024' }))
        .nationalInsurance.annually;
      const annualBasis = getEmployeeNI(30000, '2023-2024');

      expect(payrollBasis).toBeCloseTo(2003.76, 2);
      expect(annualBasis).toBeCloseTo(2004.45, 2);
      expect(annualBasis - payrollBasis).toBeCloseTo(0.69, 2);
    });
  });

  // ==========================================================================
  // Every supported year through the engine
  // ==========================================================================

  describe('engine annual employee NI by tax year', () => {
    const engineFixtures = [
      { taxYear: '2026-2027', salary: 30000, expected: 1393.92 },
      { taxYear: '2025-2026', salary: 30000, expected: 1393.92 },
      { taxYear: '2024-2025', salary: 30000, expected: 1393.92 },
      { taxYear: '2023-2024', salary: 30000, expected: 2003.76 },
      { taxYear: '2026-2027', salary: 60000, expected: 3210 },
      { taxYear: '2025-2026', salary: 60000, expected: 3210 },
      { taxYear: '2024-2025', salary: 60000, expected: 3210 },
      // 2023-24 at £60,000 -> £5,000/month. Primary band £4,189 - £1,048 = £3,141;
      // above the upper earnings limit £811. The upper rate did not change, so:
      //   primary band: £3,141 x (9 x 12% + 3 x 10%) = £3,141 x 1.38 = £4,334.58
      //   above UEL:    £811 x 12 x 2%                               =   £194.64
      { taxYear: '2023-2024', salary: 60000, expected: 4529.22 },
    ] as const;

    it.each(engineFixtures)('returns £$expected for £$salary in $taxYear', ({
      taxYear,
      salary,
      expected,
    }) => {
      const result = calculateTax(createInput({ salary, taxYear }));
      expect(result.nationalInsurance.annually).toBeCloseTo(expected, 2);
    });

    it.each([
      '2026-2027',
      '2025-2026',
      '2024-2025',
      '2023-2024',
    ] as const)('keeps monthly x 12 consistent with the annual figure in %s', (taxYear) => {
      const result = calculateTax(createInput({ salary: 30000, taxYear }));
      expect(result.nationalInsurance.monthly * 12).toBeCloseTo(
        result.nationalInsurance.annually,
        2,
      );
    });
  });

  // ==========================================================================
  // State Pension age exemption
  // ==========================================================================

  describe('State Pension age exemption', () => {
    const exemptionFixtures = [
      { label: 'below State Pension age', input: { age: 65 }, exempt: false },
      { label: 'at State Pension age', input: { age: 66 }, exempt: true },
      { label: 'above State Pension age', input: { age: 80 }, exempt: true },
      { label: 'category C', input: { niCategory: 'C' as NICategory }, exempt: true },
      { label: 'payNoNI override', input: { payNoNI: true }, exempt: true },
      { label: 'no age supplied', input: {}, exempt: false },
    ] as const;

    it.each(exemptionFixtures)('treats $label correctly', ({ input, exempt }) => {
      expect(isEmployeeNIExempt(input)).toBe(exempt);
    });

    it('exposes the State Pension age used for the exemption', () => {
      expect(STATE_PENSION_AGE_NI_EXEMPTION).toBe(66);
    });

    it.each([
      '2026-2027',
      '2025-2026',
      '2024-2025',
      '2023-2024',
    ] as const)('exempts the employee but still charges the employer in %s', (taxYear) => {
      const result = calculateTax(createInput({ salary: 50000, taxYear, age: 67 }));

      expect(result.nationalInsurance.annually).toBe(0);
      expect(result.employerNI).toBeGreaterThan(0);
    });

    it('charges employer NI at the same amount whether or not the employee is exempt', () => {
      const working = calculateTax(createInput({ salary: 50000, age: 40 }));
      const pensioner = calculateTax(createInput({ salary: 50000, age: 67 }));

      expect(pensioner.employerNI).toBeCloseTo(working.employerNI, 2);
      expect(pensioner.nationalInsurance.annually).toBe(0);
      expect(working.nationalInsurance.annually).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // Engine / tool / annual module consistency
  // ==========================================================================

  describe('engine and tool consistency', () => {
    // The NI tool presents whole-pound annual figures from the annual module.
    // The engine models month-1 PAYE against whole-pound monthly thresholds, so
    // the two differ by a documented sub-pound amount rather than agreeing exactly.
    const TOOL_ENGINE_TOLERANCE = 1;

    const consistencySalaries = [15000, 30000, 45000, 60000, 100000] as const;

    it.each(
      consistencySalaries,
    )('keeps the annual module and engine within tolerance at £%s', (salary) => {
      const engine = calculateTax(createInput({ salary, taxYear: '2026-2027' })).nationalInsurance
        .annually;
      const annualModule = getEmployeeNI(salary, '2026-2027');

      expect(Math.abs(annualModule - engine)).toBeLessThanOrEqual(TOOL_ENGINE_TOLERANCE);
    });

    it.each(consistencySalaries)('matches employer NI between tool and engine at £%s', (salary) => {
      const engine = calculateTax(createInput({ salary, taxYear: '2026-2027' })).employerNI;
      const annualModule = getEmployerNI(salary, '2026-2027');

      // Engine uses published monthly thresholds x 12; the annual module uses the
      // annual threshold. £417 x 12 = £5,004 against £5,000, a £4 band difference.
      expect(Math.abs(annualModule - engine)).toBeLessThanOrEqual(1);
    });

    it('separates the payroll and annual employer bases deliberately', () => {
      // Employer NI has the same two-basis split as employee NI. The engine
      // models payroll and uses the published monthly secondary threshold, which
      // annualises to £5,004 rather than £5,000; the director surfaces model an
      // annual earnings period and use the published annual £5,000. Both are
      // correct for their basis, so this pins the gap instead of forcing equality.
      const engine = calculateTax(createInput({ salary: 30000, taxYear: '2026-2027' })).employerNI;
      const annualBasis = getEmployerNI(30000, '2026-2027');

      // (£2,500 - £417) x 15% x 12 = £3,749.40 against (£30,000 - £5,000) x 15% = £3,750.
      expect(engine).toBeCloseTo(3749.4, 2);
      expect(annualBasis).toBeCloseTo(3750, 2);
      expect(annualBasis - engine).toBeCloseTo(0.6, 2);
    });

    it('charges payroll employer NI at a salary the annual basis treats as exempt', () => {
      // £9,100/year is £758.33 a month, above the published £758 monthly
      // secondary threshold, so real payroll charges a few pence each month even
      // though the annual threshold is exactly £9,100:
      //   (£758.33 - £758) x 13.8% = £0.046/month, rounded to £0.05, x 12 = £0.60
      const engine = calculateTax(createInput({ salary: 9100, taxYear: '2024-2025' })).employerNI;

      expect(getEmployerNI(9100, '2024-2025')).toBe(0);
      expect(engine).toBeGreaterThan(0);
      expect(engine).toBeCloseTo(0.6, 2);
    });

    it('reports the rate and thresholds it applied', () => {
      const result = calculateEmployeeNI(30000, '2026-2027');

      expect(result).toMatchObject({
        primaryThreshold: 12570,
        upperEarningsLimit: 50270,
        primaryRate: 0.08,
        upperRate: 0.02,
      });
    });
  });

  // ==========================================================================
  // Rounding
  // ==========================================================================

  describe('rounding', () => {
    const penceFixtures = [
      { salary: 12570.5, expected: 0.04 },
      { salary: 30000.55, expected: 1394.44 },
      { salary: 50270.01, expected: 3016 },
      { salary: 60000.55, expected: 3210.61 },
    ] as const;

    it.each(penceFixtures)('rounds annual employee NI to pence at £$salary', ({
      salary,
      expected,
    }) => {
      expect(getEmployeeNI(salary, '2026-2027')).toBeCloseTo(expected, 2);
    });

    it('rounds half up at an exact half-penny', () => {
      // £12,570.50 - £12,570 = £0.50 x 8% = £0.04 exactly.
      // £5,000.50 employer: £0.50 x 15% = £0.075 -> £0.08
      expect(getEmployerNI(5000.5, '2026-2027')).toBeCloseTo(0.08, 2);
      expect(getEmployerNI(12570.5, '2026-2027')).toBeCloseTo(1135.58, 2);
    });

    it.each([
      { salary: 30000, expected: 1394 },
      { salary: 45000, expected: 2594 },
      { salary: 60000, expected: 3211 },
    ] as const)('rounds to whole pounds for tool display at £$salary without changing the underlying pence', ({
      salary,
      expected,
    }) => {
      const pence = getEmployeeNI(salary, '2026-2027');
      expect(Math.round(pence)).toBe(expected);
      // The shared result stays pence-accurate; only display rounds.
      expect(Number.isInteger(pence)).toBe(false);
    });

    it('keeps engine period conversions consistent with the annual figure', () => {
      const result = calculateTax(createInput({ salary: 30000, taxYear: '2026-2027' }));

      expect(result.nationalInsurance.monthly).toBeCloseTo(116.16, 2);
      expect(result.nationalInsurance.annually).toBeCloseTo(1393.92, 2);
    });
  });

  // ==========================================================================
  // Policy data invariants
  // ==========================================================================

  describe('policy data invariants', () => {
    const taxYears: TaxYear[] = ['2026-2027', '2025-2026', '2024-2025', '2023-2024'];
    const categories: NICategory[] = ['A', 'B', 'C', 'H', 'J', 'M', 'Z'];

    it.each(taxYears)('keeps rate segments summing to twelve months in %s', (taxYear) => {
      for (const niCategory of categories) {
        const segments = getEmployeeClass1MonthSegments(taxYear, niCategory);
        const months = segments.reduce((total, segment) => total + segment.months, 0);

        expect(months).toBe(12);
      }
    });

    it('starts the segment list at the rate in force on 6 April', () => {
      // Closes the divergence trap the effective-dated schema would otherwise
      // open: primary.rate must remain the opening rate, not a blended one.
      for (const taxYear of taxYears) {
        for (const niCategory of categories) {
          const [firstSegment] = getEmployeeClass1MonthSegments(taxYear, niCategory);
          const openingRate = getEmployeeClass1RateForPayDate(
            taxYear,
            niCategory,
            new Date(`${taxYear.slice(0, 4)}-04-06T00:00:00Z`),
          );

          expect(firstSegment?.rate).toBe(openingRate);
        }
      }
    });

    it('only carries a blended directors rate where a rate actually changed', () => {
      for (const taxYear of taxYears) {
        for (const niCategory of categories) {
          const segments = getEmployeeClass1MonthSegments(taxYear, niCategory);
          const directorsRate = getDirectorsAnnualPrimaryRate(taxYear, niCategory);

          if (segments.length === 1) {
            expect(directorsRate).toBe(segments[0]?.rate);
          } else {
            // A blended rate must sit between the rates it blends.
            const rates = segments.map((segment) => segment.rate);
            expect(directorsRate).toBeLessThan(Math.max(...rates));
            expect(directorsRate).toBeGreaterThan(Math.min(...rates));
          }
        }
      }
    });
  });
});
