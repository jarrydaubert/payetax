import { calculateMarginalTaxRate } from '@/lib/calculatorMarginalTax';
import { buildResultsTableRows } from '@/lib/calculatorResultsPresenter';
import { calculateTax, type TaxCalculationInput } from '@/lib/taxCalculator';

const payslipInput: TaxCalculationInput = {
  salary: 49131,
  payPeriod: 'annually',
  taxYear: '2026-2027',
  taxCode: '1257L',
  isScottish: false,
  isMarried: false,
  partnerGrossWage: 0,
  isBlind: false,
  payNoNI: false,
  pensionContribution: 5,
  pensionContributionType: 'percentage',
  studentLoanPlans: 'none',
  niCategory: 'A',
  hoursPerWeek: 40,
  allowancesDeductions: 312,
};

describe('calculatorResultsPresenter', () => {
  it('preserves calculator period values for payslip rows', () => {
    const results = calculateTax(payslipInput);
    const rows = buildResultsTableRows({
      results,
      allowancesDeductions: 312,
      studentLoans: [],
      previousYearLabel: '2025',
    });

    const gross = rows.find((row) => row.kind === 'gross');
    const taxFree = rows.find((row) => row.kind === 'taxFree');
    const incomeTax = rows.find((row) => row.kind === 'incomeTax');
    const nationalInsurance = rows.find((row) => row.kind === 'nationalInsurance');
    const pension = rows.find((row) => row.kind === 'pension');
    const netPay = rows.find((row) => row.kind === 'netPay');

    expect(gross?.valuesByPeriod?.hourly).toBeCloseTo(23.62, 2);
    expect(taxFree?.valuesByPeriod?.monthly).toBe(1048);
    expect(incomeTax?.valuesByPeriod?.monthly).toBeCloseTo(568.2, 2);
    expect(incomeTax?.valuesByPeriod?.hourly).toBeCloseTo(3.28, 2);
    expect(nationalInsurance?.valuesByPeriod?.monthly).toBeCloseTo(227.32, 2);
    expect(nationalInsurance?.valuesByPeriod?.hourly).toBeCloseTo(1.31, 2);
    expect(pension?.valuesByPeriod?.monthly).toBeCloseTo(204.71, 2);
    expect(pension?.valuesByPeriod?.hourly).toBeCloseTo(1.18, 2);
    expect(netPay?.valuesByPeriod?.monthly).toBeCloseTo(3120.02, 2);
    expect(netPay?.valuesByPeriod?.hourly).toBeCloseTo(18, 2);
  });

  it('keeps marginal-rate calculation out of presentational components', () => {
    const results = calculateTax(payslipInput);

    expect(calculateMarginalTaxRate({ results, input: payslipInput })).toBeGreaterThan(0);
  });
});
