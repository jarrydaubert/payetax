import { CHART_COLORS } from '../chart';

describe('chart exports', () => {
  it('exposes chart color tokens', () => {
    expect(CHART_COLORS.employment).toBeDefined();
    expect(CHART_COLORS.netPay).toBeDefined();
  });
});
