import { describe, expect, it } from '@jest/globals';
import { calculateMarriageAllowanceNetSaving } from '../tax/marriageAllowance';

describe('calculateMarriageAllowanceNetSaving', () => {
  it('calculates full rUK saving when transferor is well below PA', () => {
    const result = calculateMarriageAllowanceNetSaving({
      recipientIncome: 35000,
      transferorIncome: 8000,
      taxYear: '2025-2026',
      region: 'rUK',
    });

    expect(result).not.toBeNull();
    expect(result?.netSaving).toBeCloseTo(252, 1);
  });

  it('reduces saving when transferor is near PA (rUK)', () => {
    const result = calculateMarriageAllowanceNetSaving({
      recipientIncome: 35000,
      transferorIncome: 12000,
      taxYear: '2025-2026',
      region: 'rUK',
    });

    expect(result).not.toBeNull();
    expect(result?.netSaving).toBeCloseTo(114, 1);
  });

  it('uses Scottish rates for net saving', () => {
    const result = calculateMarriageAllowanceNetSaving({
      recipientIncome: 40000,
      transferorIncome: 8000,
      taxYear: '2025-2026',
      region: 'scotland',
    });

    expect(result).not.toBeNull();
    // Scottish intermediate rate (21%) on transfer amount.
    expect(result?.netSaving).toBeCloseTo(264.6, 1);
  });
});
