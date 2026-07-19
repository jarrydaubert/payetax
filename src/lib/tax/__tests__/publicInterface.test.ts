import * as taxDomain from '@/lib/tax';

describe('tax-domain public interface', () => {
  it('keeps the runtime surface narrow and intentional', () => {
    expect(Object.keys(taxDomain).sort()).toEqual([
      'CURRENT_TAX_YEAR',
      'SCOTTISH_TAX_RATES',
      'TAX_RATES',
      'TAX_YEARS',
      'TAX_YEAR_SOURCES',
      'calculateTax',
      'decodeTaxCode',
      'formatAllowance',
      'formatTaxYearDisplay',
      'taxableThresholdToTotalIncome',
    ]);
  });

  it('does not expose known internal or shadow calculator helpers', () => {
    expect(taxDomain).not.toHaveProperty('calculateNIContributions');
    expect(taxDomain).not.toHaveProperty('calculateIncomeTaxFromBands');
    expect(taxDomain).not.toHaveProperty('calculateDirectorScenario');
    expect(taxDomain).not.toHaveProperty('getAdjustedPersonalAllowance');
  });
});
