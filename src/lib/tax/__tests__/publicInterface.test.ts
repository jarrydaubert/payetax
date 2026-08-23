import * as taxDomain from '@/lib/tax';
import * as taxCodeDecoder from '@/lib/tax-code-decoder';

describe('tax-domain public interface', () => {
  it('keeps the runtime surface narrow and intentional', () => {
    expect(Object.keys(taxDomain).sort()).toEqual([
      'CURRENT_TAX_YEAR',
      'SCOTTISH_TAX_RATES',
      'STATE_PENSION_AGE_NI_EXEMPTION',
      'TAX_CODE_MAX_LENGTH',
      'TAX_CODE_NON_CUMULATIVE_MARKERS',
      'TAX_RATES',
      'TAX_YEARS',
      'TAX_YEAR_SOURCES',
      'calculateEmployeeNI',
      'calculateEmployerNI',
      'calculateIncomeTax',
      'calculateTax',
      'formatTaxYearDisplay',
      'getClass1PeriodThresholds',
      'getDirectorsAnnualPrimaryRate',
      'getEmployeeClass1MonthSegments',
      'getEmployeeClass1RateForPayDate',
      'getEmployeeNI',
      'getEmployerNI',
      'getEmployerNIRate',
      'getEmployerNIThreshold',
      'getMonthlyKCodeAdditionalPay',
      'getPayDateForTaxPeriod',
      'getTaxCodeRegionOverride',
      'hasNonCumulativeTaxCodeMarker',
      'isEmployeeNIExempt',
      'isTaxCodeEditCandidate',
      'isValidTaxCode',
      'normalizeTaxCode',
      'parseSupportedTaxYear',
      'parseTaxCode',
      'resolveTaxYear',
      'roundToPence',
      'selectTaxPolicy',
      'sliceClass1EmployeeEarnings',
      'sliceClass1EmployerEarnings',
      'sliceRukTaxableIncome',
      'sliceScottishTaxableIncome',
      'taxableThresholdToTotalIncome',
    ]);
  });

  it('keeps decoder prose on its decoder-only public interface', () => {
    expect(Object.keys(taxCodeDecoder).sort()).toEqual([
      'CURRENT_TAX_YEAR_DISPLAY',
      'TAX_CODE_MAX_LENGTH',
      'TAX_CODE_REFERENCE_ENTRIES',
      'decodeTaxCode',
      'formatTaxCodeAmount',
      'normalizeTaxCode',
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
