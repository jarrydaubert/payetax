import { describe, expect, it } from '@jest/globals';
import { calculateMarriageAllowanceNetSaving } from '../tax/marriageAllowance';

// ITA 2007 ss29, 55B and 55C. The recipient's relief uses the basic rate,
// limited by tax due. The transferor is assessed with £11,310 of allowance.
// 2026–27 rates: https://www.parliament.scot/chamber-and-committees/votes-and-motions/S6M-20844
describe('calculateMarriageAllowanceNetSaving', () => {
  it.each([
    // Low Scottish tax: £1,280 × 19%, below the £252 cap.
    ['scotland', 13_850, 8_000, 243.2, 0, 243.2],
    ['scotland', 15_000, 8_000, 252, 0, 252],
    ['scotland', 40_000, 8_000, 252, 0, 252],
    // Transferor's extra £1,260 is all starter-rate income.
    ['scotland', 40_000, 12_570, 252, 239.4, 12.6],
    ['scotland', 40_000, 12_571, 252, 239.4, 12.6],
    ['rUK', 35_000, 8_000, 252, 0, 252],
    ['rUK', 35_000, 12_000, 252, 138, 114],
    ['rUK', 35_000, 12_570, 252, 252, 0],
    // Recipient tax is £430 × 20%, transferor tax is £1,190 × 20%.
    ['rUK', 13_000, 12_500, 86, 238, -152],
    ['rUK', 12_570, 8_000, 0, 0, 0],
    ['rUK', 12_571, 8_000, 0.2, 0, 0.2],
  ] as const)(
    '%s with recipient £%i and transferor £%i gives the annual household impact',
    (region, recipientIncome, transferorIncome, recipientSaving, transferorAdditionalTax, netSaving) => {
      const result = calculateMarriageAllowanceNetSaving({
        recipientIncome,
        transferorIncome,
        taxYear: '2026-2027',
        region,
      });
      expect(result).toMatchObject({
        eligibility: 'eligible',
        recipientSaving,
        transferorAdditionalTax,
        netSaving,
      });
    },
  );

  it.each([
    ['scotland', 43_662, 8_000, 'eligible'],
    ['scotland', 43_663, 8_000, 'recipient-higher-rate'],
    ['rUK', 50_270, 8_000, 'eligible'],
    ['rUK', 50_271, 8_000, 'recipient-higher-rate'],
    ['scotland', 43_000, 42_402, 'eligible'],
    ['scotland', 43_000, 42_403, 'transferor-higher-rate'],
  ] as const)(
    'checks the %s rate limits before and after the transfer',
    (region, recipientIncome, transferorIncome, eligibility) => {
      const result = calculateMarriageAllowanceNetSaving({
        recipientIncome,
        transferorIncome,
        taxYear: '2026-2027',
        region,
      });
      expect(result?.eligibility).toBe(eligibility);
      if (eligibility !== 'eligible') {
        expect(result).toMatchObject({
          recipientSaving: 0,
          transferorAdditionalTax: 0,
          netSaving: 0,
        });
      }
    },
  );
});
