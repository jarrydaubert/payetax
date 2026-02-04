import * as DirectorGuide from '../index';

describe('DirectorGuide molecules index', () => {
  it('exports calculator and input components', () => {
    expect(DirectorGuide.SalarySlider).toBeDefined();
    expect(DirectorGuide.StrategyComparisonTable).toBeDefined();
    expect(DirectorGuide.CoreInputs).toBeDefined();
    expect(DirectorGuide.StudentLoanInputs).toBeDefined();
  });
});
