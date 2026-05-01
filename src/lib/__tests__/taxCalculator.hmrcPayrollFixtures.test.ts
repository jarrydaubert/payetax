/**
 * HMRC payroll period fixtures.
 *
 * Sources:
 * - https://www.gov.uk/government/publications/taxable-pay-tables-manual-method
 * - https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026
 */

import { calculatePayrollPeriodDeductions } from '../tax/payrollPeriodDeductions';

describe('HMRC cumulative and non-monthly payroll fixtures', () => {
  const monthlyFixtures = [
    {
      name: 'basic-rate cumulative month 2',
      grossPay: 3000,
      previousGrossPay: 3000,
      previousTaxPaid: 390.4,
      expected: {
        taxFreePayToDate: 2096,
        taxablePayToDate: 3904,
        incomeTaxToDate: 780.8,
        incomeTax: 390.4,
        nationalInsurance: 156.16,
        netPay: 2453.44,
      },
    },
    {
      name: 'higher-rate cumulative month 2',
      grossPay: 8000,
      previousGrossPay: 8000,
      previousTaxPaid: 2152.4,
      expected: {
        taxFreePayToDate: 2096,
        taxablePayToDate: 13904,
        incomeTaxToDate: 4304.8,
        incomeTax: 2152.4,
        nationalInsurance: 327.5,
        netPay: 5520.1,
      },
    },
    {
      name: 'personal-allowance taper cumulative month 2',
      grossPay: 9166.67,
      previousGrossPay: 9166.67,
      previousTaxPaid: 2785.6,
      expected: {
        taxFreePayToDate: 1262,
        taxablePayToDate: 17071,
        incomeTaxToDate: 5571.6,
        incomeTax: 2786,
        nationalInsurance: 350.83,
        netPay: 6029.84,
      },
    },
    {
      name: 'additional-rate cumulative month 2',
      grossPay: 20000,
      previousGrossPay: 20000,
      previousTaxPaid: 7849.95,
      expected: {
        taxFreePayToDate: 0,
        taxablePayToDate: 40000,
        incomeTaxToDate: 15700.35,
        incomeTax: 7850.4,
        nationalInsurance: 567.5,
        netPay: 11582.1,
      },
    },
  ] as const;

  it.each(monthlyFixtures)('matches HMRC PAYE/NI/net outputs for $name', (fixture) => {
    const result = calculatePayrollPeriodDeductions({
      grossPay: fixture.grossPay,
      previousGrossPay: fixture.previousGrossPay,
      previousTaxPaid: fixture.previousTaxPaid,
      payPeriod: 'monthly',
      periodNumber: 2,
      taxYear: '2025-2026',
      taxCode: '1257L',
      niCategory: 'A',
    });

    expect(result.taxFreePayToDate).toBe(fixture.expected.taxFreePayToDate);
    expect(result.taxablePayToDate).toBe(fixture.expected.taxablePayToDate);
    expect(result.incomeTaxToDate).toBeCloseTo(fixture.expected.incomeTaxToDate, 2);
    expect(result.incomeTax).toBeCloseTo(fixture.expected.incomeTax, 2);
    expect(result.nationalInsurance).toBeCloseTo(fixture.expected.nationalInsurance, 2);
    expect(result.netPay).toBeCloseTo(fixture.expected.netPay, 2);
  });

  const nonMonthlyFixtures = [
    {
      name: 'weekly period 2',
      payPeriod: 'weekly',
      grossPay: 800,
      previousGrossPay: 800,
      previousTaxPaid: 111.6,
      expected: {
        taxFreePayToDate: 484,
        taxablePayToDate: 1116,
        incomeTaxToDate: 223.2,
        incomeTax: 111.6,
        nationalInsurance: 44.64,
        netPay: 643.76,
      },
    },
    {
      name: 'fortnightly period 2',
      payPeriod: 'fortnightly',
      grossPay: 1600,
      previousGrossPay: 1600,
      previousTaxPaid: 223.2,
      expected: {
        taxFreePayToDate: 968,
        taxablePayToDate: 2232,
        incomeTaxToDate: 446.4,
        incomeTax: 223.2,
        nationalInsurance: 89.28,
        netPay: 1287.52,
      },
    },
    {
      name: 'four-weekly period 2',
      payPeriod: 'fourWeekly',
      grossPay: 3200,
      previousGrossPay: 3200,
      previousTaxPaid: 446.4,
      expected: {
        taxFreePayToDate: 1936,
        taxablePayToDate: 4464,
        incomeTaxToDate: 892.8,
        incomeTax: 446.4,
        nationalInsurance: 178.56,
        netPay: 2575.04,
      },
    },
  ] as const;

  it.each(nonMonthlyFixtures)('matches HMRC PAYE/NI/net outputs for $name', (fixture) => {
    const result = calculatePayrollPeriodDeductions({
      grossPay: fixture.grossPay,
      previousGrossPay: fixture.previousGrossPay,
      previousTaxPaid: fixture.previousTaxPaid,
      payPeriod: fixture.payPeriod,
      periodNumber: 2,
      taxYear: '2025-2026',
      taxCode: '1257L',
      niCategory: 'A',
    });

    expect(result.taxFreePayToDate).toBe(fixture.expected.taxFreePayToDate);
    expect(result.taxablePayToDate).toBe(fixture.expected.taxablePayToDate);
    expect(result.incomeTaxToDate).toBeCloseTo(fixture.expected.incomeTaxToDate, 2);
    expect(result.incomeTax).toBeCloseTo(fixture.expected.incomeTax, 2);
    expect(result.nationalInsurance).toBeCloseTo(fixture.expected.nationalInsurance, 2);
    expect(result.netPay).toBeCloseTo(fixture.expected.netPay, 2);
  });
});
