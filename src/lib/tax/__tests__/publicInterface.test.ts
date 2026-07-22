import * as taxDomain from '@/lib/tax';

describe('tax-domain public interface', () => {
  it('keeps the runtime surface narrow and intentional', () => {
    expect(Object.keys(taxDomain).sort()).toEqual([
      'CURRENT_TAX_YEAR',
      'SCOTTISH_TAX_RATES',
      'STATE_PENSION_AGE_NI_EXEMPTION',
      'TAX_RATES',
      'TAX_YEARS',
      'TAX_YEAR_SOURCES',
      'calculateEmployeeNI',
      'calculateEmployerNI',
      'calculateIncomeTax',
      'calculateTax',
      'decodeTaxCode',
      'formatAllowance',
      'formatTaxYearDisplay',
      'getClass1PeriodThresholds',
      'getDirectorsAnnualPrimaryRate',
      'getEmployeeClass1MonthSegments',
      'getEmployeeClass1RateForPayDate',
      'getEmployeeNI',
      'getEmployerNI',
      'getEmployerNIRate',
      'getEmployerNIThreshold',
      'getPayDateForTaxPeriod',
      'hasEmergencyTaxCodeSuffix',
      'isEmployeeNIExempt',
      'isTaxCodeEditCandidate',
      'isValidTaxCode',
      'normalizeTaxCode',
      'parseTaxCode',
      'roundToPence',
      'sliceClass1EmployeeEarnings',
      'sliceClass1EmployerEarnings',
      'sliceRukTaxableIncome',
      'sliceScottishTaxableIncome',
      'taxableThresholdToTotalIncome',
    ]);
  });

  it('does not expose known internal or shadow calculator helpers', () => {
    expect(taxDomain).not.toHaveProperty('calculateNIContributions');
    expect(taxDomain).not.toHaveProperty('calculateIncomeTaxFromBands');
    expect(taxDomain).not.toHaveProperty('calculateStudentLoanRepayments');
    expect(taxDomain).not.toHaveProperty('calculatePayrollPeriodDeductions');
    expect(taxDomain).not.toHaveProperty('convertToPeriods');
    expect(taxDomain).not.toHaveProperty('calculateDirectorScenario');
    expect(taxDomain).not.toHaveProperty('getAdjustedPersonalAllowance');
  });
});
