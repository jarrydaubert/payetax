import { describe, expect, it } from '@jest/globals';
import { calculateSalaryScenario, calculateStrategyComparison } from '../strategyComparison';

const taxYear = '2026-2027';
const inputs = { region: 'rUK', includesVat: false, expenses: 0 } as const;
const sliderInputs = {
  region: 'rUK',
  taxYear,
  otherIncome: 0,
  hasEmploymentAllowance: false,
} as const;

// Full-year category A director, rUK, 2026/27. Secondary Class 1 is 15% above
// £5,000 even beyond the £50,270 UEL. Declared £10,500 EA offsets Class 1 only.
// gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
// gov.uk/government/publications/employment-allowance-more-detailed-guidance/claiming-employment-allowance-further-employer-guidance
describe('Director salary affordability (JGF-45)', () => {
  it.each([
    [0, 79347.83, 652.17, 79347.84, 0.02],
    [10000, 78043.48, 1956.52, 78043.49, 0.01],
  ])(
    'shares the penny-level maximum with £%i BIK and declared allowance',
    (companyCarBIK, salary, employerNI, nextPennySalary, nextPennyShortfall) => {
      const { strategies } = calculateStrategyComparison(
        {
          ...inputs,
          revenue: 100000,
          expenses: 20000,
          companyCarBIK,
          employmentAllowance: true,
          yourSetupSalary: nextPennySalary,
        },
        taxYear,
      );
      // For budget £80,000 less 15% of BIK, solve salary + 15% × (salary − £5,000)
      // − £10,500 = budget. At £79,347.84 net Class 1 also rises by a penny.
      const expected = {
        salary,
        employerNI,
        dividends: 0,
        companyCost: 80000,
        companyShortfall: 0,
      };
      expect(strategies.allSalary).toMatchObject(expected);
      expect(
        calculateSalaryScenario({
          ...sliderInputs,
          hasEmploymentAllowance: true,
          grossProfit: 80000,
          targetSalary: salary,
          companyCarBIK,
        }),
      ).toMatchObject(expected);
      expect(strategies.yourSetup).toMatchObject({
        salary: nextPennySalary,
        companyShortfall: nextPennyShortfall,
        exceedsProfit: true,
      });
    },
  );

  it.each([
    [4999, false, 4999],
    [5000, false, 5000],
    [5001.15, false, 5001],
    [74999, true, 74999],
    [75000, true, 75000],
    [75001.15, true, 75001],
  ])(
    'can spend £%p at the Secondary Threshold or allowance exhaustion',
    (profit, allowance, salary) => {
      // £75,000 is the point where 15% × (£75,000 − £5,000) spends the £10,500 EA.
      expect(
        calculateSalaryScenario({
          ...sliderInputs,
          grossProfit: profit,
          hasEmploymentAllowance: allowance,
          targetSalary: 100000,
        }),
      ).toMatchObject({ salary, dividends: 0, companyCost: profit });
    },
  );

  it.each([
    [50269, 6790.35],
    [50270, 6790.5],
    [50271, 6790.65],
    [60000, 8250],
  ])('respects a feasible £%i floor on either side of the UEL', (salary, employerNI) => {
    // Baseline Mix keeps its bounded search. Above the UEL it evaluates the floor itself.
    const { strategies, recommended } = calculateStrategyComparison(
      {
        ...inputs,
        revenue: 200000,
        minimumSalaryRequirement: salary,
      },
      taxYear,
    );
    expect(strategies.optimalMix).toMatchObject({ salary, employerNI });
    expect(strategies[recommended].salary).toBeGreaterThanOrEqual(salary);
    expect(strategies.allDividends.salary).toBe(0);
  });

  it('reports a minimum one penny above the maximum, even when the fallback balances', () => {
    const { strategies } = calculateStrategyComparison(
      {
        ...inputs,
        revenue: 80000,
        companyCarBIK: 10000,
        employmentAllowance: true,
        minimumSalaryRequirement: 78043.49,
      },
      taxYear,
    );
    const expected = { salary: 78043.48, minimumSalaryShortfall: 0.01, companyShortfall: 0 };
    expect(strategies.optimalMix).toMatchObject(expected);
    expect(
      calculateSalaryScenario({
        ...sliderInputs,
        grossProfit: 80000,
        targetSalary: 0,
        companyCarBIK: 10000,
        hasEmploymentAllowance: true,
        minimumSalary: 78043.49,
      }),
    ).toMatchObject(expected);
  });
});

// Annual figures for one company, with no exempt distributions and provision costs already deducted.
// Class 1A and secondary Class 1: gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
// Deductible NI: gov.uk/hmrc-internal-manuals/business-income-manual/bim42523
// CT: 19% up to £50k, then 25% less 3/200 of the gap to £250k, then 25%.
// gov.uk/hmrc-internal-manuals/company-taxation-manual/ctm03925
describe('Director company budget (JGF-43)', () => {
  it('reserves £1,500 for Class 1A before taxing or distributing the £80,000 profit', () => {
    const { strategies } = calculateStrategyComparison(
      { ...inputs, revenue: 80000, companyCarBIK: 10000 },
      taxYear,
    );
    const { allDividends } = strategies;
    expect(allDividends).toMatchObject({
      class1ANI: 1500,
      employerNI: 1500,
      taxableProfit: 78500,
      corporationTax: 17052.5,
      dividends: 61447.5,
    });
    expect(allDividends.companyCost + allDividends.dividends).toBeCloseTo(80000, 2);
  });

  it('deducts both classes of employer NI from mix and custom-salary estimates', () => {
    const { strategies } = calculateStrategyComparison(
      {
        ...inputs,
        revenue: 85000,
        pensionContribution: 5000,
        companyCarBIK: 10000,
        minimumSalaryRequirement: 12570,
        yourSetupSalary: 20000,
        yourSetupDividends: 20000,
      },
      taxYear,
    );
    // £78,500 − £12,570 − £1,135.50 = £64,794.50. CT £13,420.54.
    expect(strategies.optimalMix).toMatchObject({
      salary: 12570,
      employerNI: 2635.5,
      taxableProfit: 64794.5,
      corporationTax: 13420.54,
      dividends: 51373.96,
    });
    // £78,500 − £20,000 − £2,250 = £56,250. CT £11,156.25.
    const companyTaxes = { employerNI: 3750, taxableProfit: 56250, corporationTax: 11156.25 };
    expect(strategies.yourSetup).toMatchObject({
      ...companyTaxes,
      dividends: 20000,
      retainedProfit: 25093.75,
      exceedsProfit: false,
    });
    expect(
      calculateSalaryScenario({
        ...sliderInputs,
        grossProfit: 80000,
        targetSalary: 20000,
        companyCarBIK: 10000,
      }),
    ).toMatchObject({ ...companyTaxes, dividends: 45093.75 });
  });

  it.each([
    [49000, 9310, 9025],
    [50000, 9500, 9215],
    [51000, 9765, 9405],
    [51500, 9897.5, 9500],
    [52500, 10162.5, 9765],
    [249000, 62235, 61837.5],
    [250000, 62500, 62102.5],
    [251000, 62750, 62367.5],
    [251500, 62875, 62500],
    [252500, 63125, 62750],
  ])(
    'applies the appropriate CT band on £%i before and after the deduction',
    (profit, noBIKTax, withBIKTax) => {
      for (const [companyCarBIK, class1A, corporationTax] of [
        [0, 0, noBIKTax],
        [10000, 1500, withBIKTax],
      ]) {
        const {
          strategies: { allDividends },
        } = calculateStrategyComparison({ ...inputs, revenue: profit, companyCarBIK }, taxYear);
        expect(allDividends).toMatchObject({
          employerNI: class1A,
          taxableProfit: profit - class1A,
          corporationTax,
          dividends: profit - class1A - corporationTax,
        });
      }
    },
  );

  it.each([0, 10000.05])(
    'reconciles all strategies and the slider to the penny with £%p BIK',
    (companyCarBIK) => {
      const profit = 80000.99;
      const {
        strategies: { yourSetup, ...fullExtraction },
      } = calculateStrategyComparison(
        {
          ...inputs,
          revenue: profit,
          companyCarBIK,
          yourSetupSalary: 20000,
          yourSetupDividends: 20000,
        },
        taxYear,
      );
      const slider = calculateSalaryScenario({
        ...sliderInputs,
        targetSalary: 100000,
        grossProfit: profit,
        companyCarBIK,
      });
      for (const scenario of [...Object.values(fullExtraction), slider]) {
        const outgoings =
          scenario.salary + scenario.employerNI + scenario.corporationTax + scenario.dividends;
        expect(Math.abs(Math.round((outgoings - profit) * 100))).toBeLessThanOrEqual(1);
        expect(scenario.companyCost + scenario.dividends + scenario.retainedProfit).toBeCloseTo(
          profit,
          2,
        );
        expect(scenario.companyShortfall).toBe(0);
      }
      if (!yourSetup) throw new Error('Expected Your Setup for the entered salary and dividends');
      expect(yourSetup.companyCost + yourSetup.dividends).toBeLessThan(profit);
      expect(yourSetup.companyCost + yourSetup.dividends + yourSetup.retainedProfit).toBeCloseTo(
        profit,
        2,
      );
    },
  );

  it.each([0, 1000, 1500])(
    'preserves Class 1A and reports the balance with £%i profit',
    (profit) => {
      const companyCarBIK = 10000;
      const { strategies } = calculateStrategyComparison(
        { ...inputs, revenue: profit, companyCarBIK },
        taxYear,
      );
      const slider = calculateSalaryScenario({
        ...sliderInputs,
        grossProfit: profit,
        targetSalary: 10000,
        companyCarBIK,
      });
      for (const scenario of [
        strategies.allSalary,
        strategies.optimalMix,
        strategies.allDividends,
        slider,
      ]) {
        expect(scenario).toMatchObject({
          salary: 0,
          employerNI: 1500,
          corporationTax: 0,
          dividends: 0,
          retainedProfit: 0,
          companyCost: 1500,
          companyShortfall: 1500 - profit,
        });
      }
    },
  );

  it('reports the shortfall on entered obligations in Your Setup', () => {
    const { strategies } = calculateStrategyComparison(
      {
        ...inputs,
        revenue: 6000,
        companyCarBIK: 10000,
        yourSetupSalary: 6000,
        yourSetupDividends: 100,
      },
      taxYear,
    );
    expect(strategies.yourSetup).toMatchObject({
      employerNI: 1650,
      corporationTax: 0,
      dividends: 100,
      retainedProfit: 0,
      companyShortfall: 1750,
      exceedsProfit: true,
    });
  });

  it('uses brought-forward losses for CT without treating them as company cash', () => {
    const {
      strategies: { allDividends },
    } = calculateStrategyComparison(
      { ...inputs, revenue: 80000, companyCarBIK: 10000, lossesBroughtForward: 10000 },
      taxYear,
    );
    // £78,500 of cash profit after Class 1A. CT on £68,500 is £17,125 − £2,722.50.
    expect(allDividends).toMatchObject({
      taxableProfit: 68500,
      corporationTax: 14402.5,
      dividends: 64097.5,
    });
  });

  it('preserves the pension and Class 1A when the pension uses all available profit', () => {
    const { strategies } = calculateStrategyComparison(
      { ...inputs, revenue: 1500, pensionContribution: 1500, companyCarBIK: 10000 },
      taxYear,
    );
    for (const scenario of Object.values(strategies)) {
      expect(scenario).toMatchObject({
        pension: 1500,
        employerNI: 1500,
        dividends: 0,
        companyShortfall: 1500,
      });
    }
  });
});
