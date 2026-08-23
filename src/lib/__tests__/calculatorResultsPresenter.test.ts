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
      taxCode: payslipInput.taxCode,
    });

    const gross = rows.find((row) => row.kind === 'gross');
    const taxFree = rows.find((row) => row.kind === 'taxFree');
    const incomeTax = rows.find((row) => row.kind === 'incomeTax');
    const nationalInsurance = rows.find((row) => row.kind === 'nationalInsurance');
    const pension = rows.find((row) => row.kind === 'pension');
    const netPay = rows.find((row) => row.kind === 'netPay');

    expect(gross?.valuesByPeriod?.hourly).toBeCloseTo(23.62, 2);
    expect(taxFree?.valuesByPeriod?.monthly).toBe(1048.26);
    expect(taxFree?.category).toBe('Code Tax-Free Amount');
    expect(incomeTax?.valuesByPeriod?.monthly).toBeCloseTo(568.2, 2);
    expect(incomeTax?.valuesByPeriod?.hourly).toBeCloseTo(3.28, 2);
    expect(nationalInsurance?.valuesByPeriod?.monthly).toBeCloseTo(227.32, 2);
    expect(nationalInsurance?.valuesByPeriod?.hourly).toBeCloseTo(1.31, 2);
    expect(pension?.valuesByPeriod?.monthly).toBeCloseTo(204.71, 2);
    expect(pension?.valuesByPeriod?.hourly).toBeCloseTo(1.18, 2);
    expect(netPay?.valuesByPeriod?.monthly).toBeCloseTo(3120.02, 2);
    expect(netPay?.valuesByPeriod?.hourly).toBeCloseTo(18, 2);
  });

  it('labels a blank-code amount as an estimate rather than a statutory allowance', () => {
    const results = calculateTax({ ...payslipInput, taxCode: '' });
    const rows = buildResultsTableRows({
      results,
      previousYearLabel: '2025',
      taxCode: '',
    });

    expect(rows.find((row) => row.kind === 'taxFree')?.category).toBe('Estimated Tax-Free Amount');
  });

  it('presents a K code as a positive amount added to taxable pay', () => {
    const results = calculateTax({ ...payslipInput, taxCode: 'K475' });
    const rows = buildResultsTableRows({
      results,
      previousYearLabel: '2025',
      taxCode: 'K475',
    });
    const adjustment = rows.find((row) => row.kind === 'taxCodeAdjustment');

    expect(adjustment).toEqual(
      expect.objectContaining({ category: 'Added to Taxable Pay', annual: 4750 }),
    );
    expect(adjustment?.valuesByPeriod?.monthly).toBeGreaterThan(0);
    expect(rows.some((row) => row.category === 'Tax-Free Allowance')).toBe(false);
  });

  it('keeps the calculated code basis authoritative if the input is edited before recalculation', () => {
    const results = calculateTax({ ...payslipInput, taxCode: 'K475' });
    const rows = buildResultsTableRows({
      results,
      previousYearLabel: '2025',
      taxCode: '1257L',
    });

    expect(rows.find((row) => row.kind === 'taxCodeAdjustment')).toEqual(
      expect.objectContaining({ category: 'Added to Taxable Pay', annual: 4_750 }),
    );
  });

  it('keeps marginal-rate calculation out of presentational components', () => {
    const results = calculateTax(payslipInput);

    expect(calculateMarginalTaxRate({ results, input: payslipInput })).toBeGreaterThan(0);
  });

  it('renders percentage values that round to 100 without a decimal place', () => {
    const results = calculateTax({
      ...payslipInput,
      allowancesDeductions: 0,
      pensionContribution: 0,
    });
    const rows = buildResultsTableRows({
      results: {
        ...results,
        taxableIncome: results.grossSalary.annually,
      },
      allowancesDeductions: 0,
      studentLoans: [],
      previousYearLabel: '2025',
    });

    expect(rows.find((row) => row.kind === 'taxable')?.percentage).toBe('100%');
    expect(rows.find((row) => row.kind === 'taxFree')?.percentage).toMatch(/\d+\.\d%/);
  });
});
