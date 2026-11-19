import { describe, expect, it } from '@jest/globals';
import { calculateSalaryScenario, calculateStrategyComparison } from '../strategyComparison';

const taxYear = '2026-2027' as const;
const business = { revenue: 12000, expenses: 0, includesVat: false, employmentAllowance: true };

describe('Director Personal Allowance taper attribution', () => {
  // Annual 2026/27 fixtures. The £12,000 pool funds £12,000 salary, £9,720 dividends
  // at 19% CT, or £6,000 salary + £4,860 dividends. Employment Allowance covers company NI.
  // https://www.gov.uk/corporation-tax-rates
  // https://www.gov.uk/income-tax-rates
  // https://www.gov.uk/guidance/adjusted-net-income
  // https://www.gov.uk/scottish-income-tax
  //
  // At £98k, add £3,860 / £5,000 / £4,430 of lost allowance to the respective salary.
  // All the extra taxable pay is charged at 40% (rUK) or 45% (Scotland).
  // At £120k, the remaining £2,570 allowance is lost in all three cases. The first
  // £7,710 of the additional taxable pay is at 40% / 45%, then 45% / 48%.
  // At £126k there is no allowance to lose, and all additional salary is at 45% / 48%.
  it.each([
    { region: 'rUK', otherIncome: 98000, dividendOnly: 1544, salaryOnly: 6800, mixed: 4172 },
    { region: 'scotland', otherIncome: 98000, dividendOnly: 1737, salaryOnly: 7650, mixed: 4693.5 },
    { region: 'rUK', otherIncome: 120000, dividendOnly: 1028, salaryOnly: 6171, mixed: 3471 },
    {
      region: 'scotland',
      otherIncome: 120000,
      dividendOnly: 1156.5,
      salaryOnly: 6762.3,
      mixed: 3882.3,
    },
    { region: 'rUK', otherIncome: 126000, dividendOnly: 0, salaryOnly: 5400, mixed: 2700 },
    { region: 'scotland', otherIncome: 126000, dividendOnly: 0, salaryOnly: 5760, mixed: 2880 },
  ] as const)('$region with £$otherIncome of other income', (fixture) => {
    const { region, otherIncome, dividendOnly, salaryOnly, mixed } = fixture;
    const { strategies } = calculateStrategyComparison(
      { ...business, region, otherIncome, yourSetupSalary: 6000, yourSetupDividends: 4860 },
      taxYear,
    );
    const slider = {
      grossProfit: business.revenue,
      region,
      taxYear,
      otherIncome,
      hasEmploymentAllowance: true,
    };

    expect(strategies.allDividends).toMatchObject({
      salary: 0,
      dividends: 9720,
      incomeTax: dividendOnly,
    });
    expect(strategies.allDividends.taperTaxOnOtherIncome ?? 0).toBe(dividendOnly);
    expect(strategies.allSalary).toMatchObject({
      salary: 12000,
      dividends: 0,
      incomeTax: salaryOnly,
    });
    expect(strategies.yourSetup).toMatchObject({ salary: 6000, dividends: 4860, incomeTax: mixed });
    expect(calculateSalaryScenario({ ...slider, targetSalary: 6000 })).toMatchObject({
      salary: 6000,
      dividends: 4860,
      incomeTax: mixed,
    });
    expect(strategies.optimalMix).toMatchObject(
      calculateSalaryScenario({ ...slider, targetSalary: strategies.optimalMix.salary }),
    );
  });

  it.each([
    { region: 'rUK', incomeTax: 26392.5, taperTaxOnOtherIncome: 5028 },
    { region: 'scotland', incomeTax: 29031.9, taperTaxOnOtherIncome: 5656.5 },
  ] as const)('attributes taper in the $region Baseline Mix', (fixture) => {
    const { region, incomeTax, taperTaxOnOtherIncome } = fixture;
    const { strategies } = calculateStrategyComparison(
      { ...business, revenue: 60000, region, otherIncome: 100000, minimumSalaryRequirement: 50270 },
      taxYear,
    );
    // With the salary floor at the UEL, the mix has one salary candidate.
    // £9,730 remaining after payroll yields £7,881.30 after CT. The allowance falls to zero,
    // and £62,840 more non-dividend income is taxable. £37,710 is at 40% / 45%, then 45% / 48%.
    expect(strategies.optimalMix).toMatchObject({
      salary: 50270,
      dividends: 7881.3,
      incomeTax,
      taperTaxOnOtherIncome,
    });
  });

  it('attributes the full allowance loss in the reported all-dividend case', () => {
    const { strategies } = calculateStrategyComparison(
      { ...business, revenue: 40000, region: 'rUK', otherIncome: 100000 },
      taxYear,
    );
    // Non-dividend tax: £37,700 × 20% + £62,300 × 40% = £32,460.
    // Other income alone: £37,700 × 20% + £49,730 × 40% = £27,432.
    // Dividends: £500 at 0%, £24,640 at 35.75%, £7,260 at 39.35%.
    // https://www.gov.uk/tax-on-dividends
    expect(strategies.allDividends).toMatchObject({
      dividends: 32400,
      incomeTax: 5028,
      taperTaxOnOtherIncome: 5028,
      dividendTax: 11665.61,
      totalPersonalTax: 16693.61,
      takeHome: 15706.39,
    });
  });

  it('counts taxable benefits and dividends within the dividend allowance when testing for taper', () => {
    const { strategies } = calculateStrategyComparison(
      {
        ...business,
        region: 'rUK',
        otherIncome: 100000,
        companyCarBIK: 2,
        yourSetupDividends: 498,
      },
      taxYear,
    );
    // £500 extra adjusted net income cuts the allowance by £250. With the £2 benefit,
    // £252 more non-dividend income is taxable at 40%. All dividends are at the nil rate.
    expect(strategies.yourSetup).toMatchObject({
      incomeTax: 100.8,
      taperTaxOnOtherIncome: 100,
      dividendTax: 0,
    });
  });

  it.each([
    { dividends: 200, incomeTax: 0 },
    { dividends: 201, incomeTax: 0 },
    { dividends: 202, incomeTax: 0.4 },
  ])(
    'rounds the remaining allowance at the taper start with £$dividends of dividends',
    (fixture) => {
      const { dividends, incomeTax } = fixture;
      const { strategies } = calculateStrategyComparison(
        { ...business, region: 'rUK', otherIncome: 99800, yourSetupDividends: dividends },
        taxYear,
      );
      // Section 35 rounds remaining allowance up, so the first full £1 is lost at £100,002.
      // https://www.legislation.gov.uk/ukpga/2007/3/section/35
      expect(strategies.yourSetup).toMatchObject({ incomeTax, dividendTax: 0 });
    },
  );
});
