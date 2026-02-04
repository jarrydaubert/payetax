/**
 * Additional Income Tests
 *
 * What bug will this test find?
 * - MULTI-INCOME: non-employment income affecting NI/SL incorrectly
 * - CALC-DRIFT: adjusted net income (PA taper) not including additional income
 */

import { calculateTax, type TaxCalculationInput } from '../taxCalculator';

const baseInput: TaxCalculationInput = {
  salary: 90000,
  payPeriod: 'annually',
  taxYear: '2025-2026',
  taxCode: '1257L',
  isScottish: false,
  isMarried: false,
  partnerGrossWage: 0,
  isBlind: false,
  age: undefined,
  payNoNI: false,
  pensionContribution: 0,
  pensionContributionType: 'amount',
  studentLoanPlans: 'none',
  niCategory: 'A',
  hoursPerWeek: 40,
};

describe('Tax Calculator additional income handling', () => {
  it('reduces personal allowance when rental income pushes adjusted net income over £100k', () => {
    const result = calculateTax({
      ...baseInput,
      incomeSources: [{ id: 'rental', type: 'rental', amount: 20000, period: 'annually' }],
    });

    // £90k salary + £20k rental => £110k adjusted net income (no pension)
    // PA reduction: (£110k - £100k) / 2 = £5,000
    expect(result.taxFreeAmount).toBe(7570);
  });

  it('does not change NI when additional income is non-employment', () => {
    const base = calculateTax({ ...baseInput });
    const withRental = calculateTax({
      ...baseInput,
      incomeSources: [{ id: 'rental', type: 'rental', amount: 20000, period: 'annually' }],
    });

    expect(withRental.nationalInsurance.annually).toBeCloseTo(base.nationalInsurance.annually, 2);
    expect(withRental.incomeTax.annually).toBeGreaterThan(base.incomeTax.annually);
  });

  it('restores personal allowance when pension reduces adjusted net income to £100k', () => {
    const result = calculateTax({
      ...baseInput,
      pensionContribution: 10000,
      pensionContributionType: 'amount',
      incomeSources: [{ id: 'rental', type: 'rental', amount: 20000, period: 'annually' }],
    });

    // Adjusted net income: £110k - £10k pension = £100k (full PA)
    expect(result.taxFreeAmount).toBe(12570);
  });

  it('applies NI to additional employment income', () => {
    const base = calculateTax({ ...baseInput, salary: 30000 });
    const withEmployment = calculateTax({
      ...baseInput,
      salary: 30000,
      incomeSources: [{ id: 'job2', type: 'employment', amount: 10000, period: 'annually' }],
    });

    expect(withEmployment.nationalInsurance.annually).toBeGreaterThan(
      base.nationalInsurance.annually,
    );
    expect(withEmployment.incomeTax.annually).toBeGreaterThan(base.incomeTax.annually);
  });
});
