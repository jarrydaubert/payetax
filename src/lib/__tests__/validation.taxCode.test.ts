import { describe, expect, it } from '@jest/globals';
import { TaxCodeSchema } from '../validation';

describe('TaxCodeSchema', () => {
  it('accepts Welsh/Scottish prefixes, prefixed special codes, and emergency suffixes', () => {
    const validCodes = [
      'C1257L',
      'S1257L',
      'CK100',
      'SK100',
      'SBR',
      'CBR',
      'SD0',
      'SD0W1',
      'SD2',
      'SD3',
      'SD2M1',
      'SNT',
      'S0T',
      'C0T',
    ];

    for (const code of validCodes) {
      const result = TaxCodeSchema.safeParse(code);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(code);
      }
    }
  });

  it('rejects D2/D3 without the Scottish prefix (no rUK equivalent exists)', () => {
    for (const code of ['D2', 'D3', 'CD2', 'CD3']) {
      expect(TaxCodeSchema.safeParse(code).success).toBe(false);
    }
  });
});
