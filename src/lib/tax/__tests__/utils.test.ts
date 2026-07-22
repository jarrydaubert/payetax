import { roundToPence } from '../utils';

describe('roundToPence', () => {
  it('rounds positive values to the nearest penny', () => {
    expect(roundToPence(12.344)).toBe(12.34);
    expect(roundToPence(12.346)).toBe(12.35);
  });

  it('preserves JavaScript rounding for positive and negative half-pennies', () => {
    expect(roundToPence(1.125)).toBe(1.13);
    expect(roundToPence(-1.125)).toBe(-1.12);
  });

  it('rounds ordinary negative values to the nearest penny', () => {
    expect(roundToPence(-12.344)).toBe(-12.34);
    expect(roundToPence(-12.346)).toBe(-12.35);
  });

  it('leaves zero unchanged', () => {
    expect(roundToPence(0)).toBe(0);
  });
});
