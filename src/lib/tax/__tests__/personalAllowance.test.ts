import { getAdjustedPersonalAllowance } from '../personalAllowance';

describe('getAdjustedPersonalAllowance', () => {
  it('keeps the full allowance at the taper threshold', () => {
    expect(getAdjustedPersonalAllowance(100000, '2026-2027')).toBe(12570);
  });

  it('applies the whole-pound taper in the taper band', () => {
    expect(getAdjustedPersonalAllowance(110000, '2026-2027')).toBe(7570);
    expect(getAdjustedPersonalAllowance(116496.46, '2026-2027')).toBe(4322);
  });

  it('floors the allowance at zero once fully tapered', () => {
    expect(getAdjustedPersonalAllowance(125140, '2026-2027')).toBe(0);
    expect(getAdjustedPersonalAllowance(150000, '2026-2027')).toBe(0);
  });
});
