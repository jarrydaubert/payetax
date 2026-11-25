import { calculateTax, type TaxCalculationInput } from '../taxCalculator';

describe('Marriage Allowance - Comprehensive Tests', () => {
  const createTestInput = (salary: number, partnerWage: number): TaxCalculationInput => ({
    salary,
    payPeriod: 'annually',
    taxYear: '2024-2025',
    taxCode: '',
    isScottish: false,
    isMarried: true,
    partnerGrossWage: partnerWage,
    isBlind: false,
    reachedStatePensionAge: false,
    payNoNI: false,
    pensionContribution: 0,
    pensionContributionType: 'percentage',
    studentLoanPlans: 'none',
    niCategory: 'A',
    hoursPerWeek: 37.5,
  });

  describe('Eligible Scenarios - User SHOULD receive marriage allowance', () => {
    it('✅ User earns £30k, partner earns £8k - SHOULD get allowance', () => {
      // Partner earns LESS than PA (£12,570) - can transfer
      // User is basic rate taxpayer - can receive
      const result = calculateTax(createTestInput(30000, 8000));

      // User should have increased tax-free amount
      expect(result.taxFreeAmount).toBe(12570 + 1260); // £13,830

      // Tax saving should be £252 (£1,260 × 20%)
      const withoutMarriageInput = createTestInput(30000, 8000);
      withoutMarriageInput.isMarried = false;
      const withoutMarriage = calculateTax(withoutMarriageInput);

      const taxSaving = withoutMarriage.incomeTax.annually - result.incomeTax.annually;
      expect(taxSaving).toBeCloseTo(252, 2);
    });

    it('✅ User earns £40k, partner earns £10k - SHOULD get allowance', () => {
      const result = calculateTax(createTestInput(40000, 10000));
      expect(result.taxFreeAmount).toBe(12570 + 1260);
    });

    it('✅ User earns £45k, partner earns £0 - SHOULD get allowance', () => {
      // Partner has no income but still below PA threshold
      const result = calculateTax(createTestInput(45000, 0));
      expect(result.taxFreeAmount).toBe(12570 + 1260);
    });

    it('✅ User earns £50,270 (max basic rate), partner earns £5k - SHOULD get allowance', () => {
      // User at the very top of basic rate band
      const result = calculateTax(createTestInput(50270, 5000));
      expect(result.taxFreeAmount).toBe(12570 + 1260);
    });
  });

  describe('Ineligible Scenarios - User should NOT receive marriage allowance', () => {
    it('❌ User earns £30k, partner earns £40k - NO allowance (partner earns too much)', () => {
      // Partner earns MORE than PA - cannot transfer
      const result = calculateTax(createTestInput(30000, 40000));
      expect(result.taxFreeAmount).toBe(12570); // No marriage allowance
    });

    it('❌ User earns £60k, partner earns £8k - NO allowance (user is higher rate)', () => {
      // User is higher rate taxpayer - cannot receive
      const result = calculateTax(createTestInput(60000, 8000));
      expect(result.taxFreeAmount).toBe(12570); // No marriage allowance
    });

    it('❌ User earns £10k, partner earns £8k - NO allowance (user below PA)', () => {
      // User doesn't pay tax - no benefit from allowance
      const result = calculateTax(createTestInput(10000, 8000));
      expect(result.taxFreeAmount).toBe(12570); // No marriage allowance
    });

    it('❌ User earns £50,271, partner earns £8k - NO allowance (user just into higher rate)', () => {
      // User £1 into higher rate band - cannot receive
      const result = calculateTax(createTestInput(50271, 8000));
      expect(result.taxFreeAmount).toBe(12570); // No marriage allowance
    });

    it('❌ Not married - NO allowance regardless of incomes', () => {
      const input = createTestInput(30000, 8000);
      input.isMarried = false;
      const result = calculateTax(input);
      expect(result.taxFreeAmount).toBe(12570); // No marriage allowance
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it.each([12_570, 12_571])(
      'estimates Scottish coding with a £%i transferor and £12.60 household benefit',
      (partnerWage) => {
        const result = calculateTax({
          ...createTestInput(40_000, partnerWage),
          taxYear: '2026-2027',
          isScottish: true,
        });
        expect(result.incomeTax.monthly).toBeCloseTo(441.41, 2);
      },
    );

    it.each([
      // Two ordinary earners: both incur the same transfer amount at basic rate in rUK,
      // and the Scottish transferor pays £264.60 at intermediate for £252 of relief.
      [false, 40_000, 30_000, 457],
      [true, 40_000, 30_000, 462.41],
      [false, 35_000, 12_570, 373.6],
      [false, 35_000, 12_571, 373.6],
      [false, 13_000, 12_500, 7],
    ])(
      'keeps blank-code PAYE at baseline with no household benefit (Scottish: %s, pay £%i/£%i)',
      (isScottish, salary, partnerWage, monthlyTax) => {
        const result = calculateTax({
          ...createTestInput(salary, partnerWage),
          taxYear: '2026-2027',
          isScottish,
        });
        expect(result.taxFreeAmount).toBe(12_570);
        expect(result.incomeTax.monthly).toBeCloseTo(monthlyTax, 2);
      },
    );

    it('uses pay after a net-pay pension contribution at the rUK higher-rate boundary', () => {
      const result = calculateTax({
        ...createTestInput(51_000, 8_000),
        taxYear: '2026-2027',
        pensionContribution: 1_000,
        pensionContributionType: 'amount',
        pensionMethod: 'net-pay',
      });
      // (£50,000 / 12 − £1,153.26) floors to £3,013 at 20%.
      expect(result.incomeTax.monthly).toBeCloseTo(602.6, 2);
    });

    it('Partner earns £12,569 - SHOULD get allowance (£1 under PA)', () => {
      const result = calculateTax(createTestInput(30000, 12569));
      expect(result.taxFreeAmount).toBe(12570 + 1260);
    });

    it('User earns exactly £50,270 - SHOULD get allowance (at basic rate limit)', () => {
      const result = calculateTax(createTestInput(50270, 8000));
      expect(result.taxFreeAmount).toBe(12570 + 1260);
    });

    it('User earns £50,271 - NO allowance (£1 into higher rate)', () => {
      const result = calculateTax(createTestInput(50271, 8000));
      expect(result.taxFreeAmount).toBe(12570);
    });
  });

  describe('Scottish PAYE coding', () => {
    // Following the PAYE100035 examples, estimate the coding using the pre-transfer
    // annual rate. £252 divided by 19%, 20% or 21% implies S1389M, S1383M or S1377M.
    // Tables A Month 1 free pay is £1,158.26, £1,153.26 or £1,148.26.
    // The coding band follows annual taxable pay before applying the transfer.
    it.each([
      [16_537, 41.61], // £219 × 19%
      [16_538, 42.56], // £224 × 19%
      [29_526, 258.09], // first £3,967 / 12 at 19%, remainder of £1,307 at 20%
      [29_527, 259.09], // first £3,967 / 12 at 19%, remainder of £1,312 at 20%
    ])('uses the pre-adjustment Scottish band at £%i annual pay', (salary, monthlyTax) => {
      const result = calculateTax({
        ...createTestInput(salary, 8_000),
        taxYear: '2026-2027',
        isScottish: true,
      });
      expect(result.incomeTax.monthly).toBeCloseTo(monthlyTax, 2);
    });
    it.each([
      [17_000, 70.29, 49.97], // £368 straddles starter/basic. £263 is all starter.
      [30_000, 287.27, 266.89], // £1,451 straddles basic/intermediate. £1,351 is below intermediate.
    ])(
      'recalculates the Month 1 band after the coding adjustment at £%i',
      (salary, before, after) => {
        const input: TaxCalculationInput = {
          ...createTestInput(salary, 8_000),
          taxYear: '2026-2027',
          isScottish: true,
        };
        expect(calculateTax({ ...input, isMarried: false }).incomeTax.monthly).toBeCloseTo(
          before,
          2,
        );
        expect(calculateTax(input).incomeTax.monthly).toBeCloseTo(after, 2);
      },
    );
  });

  describe('Financial Impact Verification', () => {
    it('Marriage allowance saves exactly £252 in tax per year', () => {
      const married = calculateTax(createTestInput(30000, 8000));
      const notMarried = calculateTax({ ...createTestInput(30000, 8000), isMarried: false });

      const annualSaving = notMarried.incomeTax.annually - married.incomeTax.annually;
      expect(annualSaving).toBe(252);

      const monthlySaving = notMarried.incomeTax.monthly - married.incomeTax.monthly;
      expect(monthlySaving).toBeCloseTo(21, 2); // £252 / 12 = £21
    });

    it('No tax saving when ineligible', () => {
      // Partner earns too much
      const married = calculateTax(createTestInput(30000, 40000));
      const notMarried = calculateTax({ ...createTestInput(30000, 40000), isMarried: false });

      expect(married.incomeTax.annually).toBe(notMarried.incomeTax.annually);
    });
  });

  describe('Regression Tests - Ensure old bug is fixed', () => {
    it('REGRESSION: Partner earning £40k should NOT give user allowance', () => {
      // This was the bug - system thought partner > PA meant they could transfer
      const result = calculateTax(createTestInput(30000, 40000));
      expect(result.taxFreeAmount).toBe(12570); // Must be standard allowance only
    });

    it('REGRESSION: Partner earning £8k SHOULD give user allowance', () => {
      // This wasn't working before - partner < PA should transfer
      const result = calculateTax(createTestInput(30000, 8000));
      expect(result.taxFreeAmount).toBe(13830); // Must include marriage allowance
    });
  });
});
