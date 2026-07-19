/**
 * Scottish vertical verification.
 *
 * Annual tool results use statutory annual bands. The main calculator models
 * month-1 PAYE with whole-pound monthly free pay and thresholds, so the public
 * comparison intentionally allows the pre-existing maximum £10 annual variance.
 */

import {
  calculateIncomeTax,
  calculateTax,
  SCOTTISH_TAX_RATES,
  sliceScottishTaxableIncome,
  type TaxCalculationInput,
  type TaxYear,
  taxableThresholdToTotalIncome,
} from '@/lib/tax';

const STATUTORY_TOP_BOUNDARY = 125_140;
const TOOL_ENGINE_TOLERANCE = 10;

const annualFixtures: Array<{
  taxYear: TaxYear;
  expectedTax: Record<(typeof boundarySalaries)[number], number>;
  expectedEngineTax: Record<(typeof boundarySalaries)[number], number>;
}> = [
  {
    taxYear: '2023-2024',
    expectedTax: {
      100000: 30038.48,
      125139: 45875.84,
      125140: 45876.68,
      125141: 45877.15,
      150000: 57560.88,
    },
    expectedEngineTax: {
      100000: 30034.08,
      125139: 45869.76,
      125140: 45874.8,
      125141: 45874.8,
      150000: 57560.28,
    },
  },
  {
    taxYear: '2024-2025',
    expectedTax: {
      100000: 30778.31,
      125139: 47746.91,
      125140: 47747.81,
      125141: 47748.29,
      150000: 59680.61,
    },
    expectedEngineTax: {
      100000: 30773.52,
      125139: 47740.32,
      125140: 47745.72,
      125141: 47745.72,
      150000: 59680.08,
    },
  },
  {
    taxYear: '2025-2026',
    expectedTax: {
      100000: 30763.8,
      125139: 47732.4,
      125140: 47733.3,
      125141: 47733.78,
      150000: 59666.1,
    },
    expectedEngineTax: {
      100000: 30759,
      125139: 47725.8,
      125140: 47731.2,
      125141: 47731.2,
      150000: 59665.56,
    },
  },
  {
    taxYear: '2026-2027',
    expectedTax: {
      100000: 30732.05,
      125139: 47700.65,
      125140: 47701.55,
      125141: 47702.03,
      150000: 59634.35,
    },
    expectedEngineTax: {
      100000: 30727.32,
      125139: 47694.12,
      125140: 47699.52,
      125141: 47699.52,
      150000: 59633.88,
    },
  },
];

const boundarySalaries = [100_000, 125_139, 125_140, 125_141, 150_000] as const;

const taperEntryCases = [
  { taxYear: '2023-2024', salary: 100_175, expectedToolTax: 30_149, expectedEngineTax: 30_139.92 },
  { taxYear: '2024-2025', salary: 100_103, expectedToolTax: 30_848, expectedEngineTax: 30_838.32 },
  { taxYear: '2025-2026', salary: 100_031, expectedToolTax: 30_785, expectedEngineTax: 30_775.2 },
  { taxYear: '2026-2027', salary: 100_007, expectedToolTax: 30_737, expectedEngineTax: 30_727.32 },
] as const satisfies ReadonlyArray<{
  taxYear: TaxYear;
  salary: number;
  expectedToolTax: number;
  expectedEngineTax: number;
}>;

const statutoryCases = annualFixtures.flatMap(({ taxYear, expectedTax, expectedEngineTax }) =>
  boundarySalaries.map((salary) => ({
    taxYear,
    salary,
    expectedTax: expectedTax[salary],
    expectedEngineTax: expectedEngineTax[salary],
  })),
);

function mainEngineInput(salary: number, taxYear: TaxYear, taxCode = 'S1257L') {
  return {
    salary,
    payPeriod: 'annually',
    taxYear,
    taxCode,
    isScottish: true,
    isMarried: false,
    partnerGrossWage: 0,
    isBlind: false,
    payNoNI: false,
    pensionContribution: 0,
    pensionContributionType: 'percentage',
    studentLoanPlans: 'none',
    niCategory: 'A',
    hoursPerWeek: 37.5,
  } satisfies TaxCalculationInput;
}

describe('Scottish tax vertical', () => {
  it.each(statutoryCases)('pins annual statutory output for $taxYear at £$salary', ({
    taxYear,
    salary,
    expectedTax,
  }) => {
    const annual = calculateIncomeTax(salary, 'scotland', taxYear);
    const rates = SCOTTISH_TAX_RATES[taxYear];
    const sliced = sliceScottishTaxableIncome(
      annual.taxableIncome,
      rates.bands.map((band) => ({
        name: band.name,
        rate: band.rate,
        taxableIncomeUpperBound: band.threshold,
      })),
    );

    expect(annual.incomeTax).toBeCloseTo(expectedTax, 2);
    expect(sliced.incomeTax).toBeCloseTo(expectedTax, 2);
    expect(annual.personalAllowance).toBe(salary === 100_000 ? 12_570 : salary === 125_139 ? 1 : 0);

    const topSlice = sliced.slices.find((slice) => slice.name === 'Top rate');
    if (salary <= STATUTORY_TOP_BOUNDARY) {
      expect(topSlice).toBeUndefined();
    } else {
      expect(topSlice?.taxableIncomeLowerBound).toBe(STATUTORY_TOP_BOUNDARY);
      expect(topSlice?.taxableAmount).toBe(salary - STATUTORY_TOP_BOUNDARY);
    }
  });

  it.each(annualFixtures)('keeps the £125,140 taxable and total boundary explicit for $taxYear', ({
    taxYear,
  }) => {
    const rates = SCOTTISH_TAX_RATES[taxYear];
    const advancedBand = rates.bands.find((band) => band.name === 'Advanced rate');
    const preTopBand = advancedBand ?? rates.bands.find((band) => band.name === 'Higher rate');

    expect(preTopBand?.threshold).toBe(STATUTORY_TOP_BOUNDARY);
    expect(
      taxableThresholdToTotalIncome(
        preTopBand?.threshold ?? 0,
        rates.personalAllowance,
        rates.personalAllowanceReductionThreshold,
      ),
    ).toBe(STATUTORY_TOP_BOUNDARY);
  });

  it.each(
    statutoryCases,
  )('keeps annual tool and month-1 engine output within documented tolerance for $taxYear at £$salary', ({
    taxYear,
    salary,
    expectedEngineTax,
  }) => {
    const toolTax = Math.round(calculateIncomeTax(salary, 'scotland', taxYear).incomeTax);
    const engineTax = calculateTax(mainEngineInput(salary, taxYear)).incomeTax.annually;

    expect(engineTax).toBeCloseTo(expectedEngineTax, 2);
    expect(Math.abs(toolTax - engineTax)).toBeLessThanOrEqual(TOOL_ENGINE_TOLERANCE);
  });

  it.each(taperEntryCases)('covers the personal-allowance taper entry for $taxYear at £$salary', ({
    taxYear,
    salary,
    expectedToolTax,
    expectedEngineTax,
  }) => {
    const toolTax = Math.round(calculateIncomeTax(salary, 'scotland', taxYear).incomeTax);
    const engineTax = calculateTax(mainEngineInput(salary, taxYear)).incomeTax.annually;

    expect(toolTax).toBe(expectedToolTax);
    expect(engineTax).toBeCloseTo(expectedEngineTax, 2);
    expect(Math.abs(toolTax - engineTax)).toBeLessThanOrEqual(TOOL_ENGINE_TOLERANCE);
  });

  it.each([
    ['2023-2024', 'SBR', 20],
    ['2023-2024', 'SD0', 21],
    ['2023-2024', 'SD1', 42],
    ['2023-2024', 'SD2', 47],
    ['2023-2024', 'SD3', 47],
    ['2024-2025', 'SBR', 20],
    ['2024-2025', 'SD0', 21],
    ['2024-2025', 'SD1', 42],
    ['2024-2025', 'SD2', 45],
    ['2024-2025', 'SD3', 48],
    ['2025-2026', 'SBR', 20],
    ['2025-2026', 'SD0', 21],
    ['2025-2026', 'SD1', 42],
    ['2025-2026', 'SD2', 45],
    ['2025-2026', 'SD3', 48],
    ['2026-2027', 'SBR', 20],
    ['2026-2027', 'SD0', 21],
    ['2026-2027', 'SD1', 42],
    ['2026-2027', 'SD2', 45],
    ['2026-2027', 'SD3', 48],
  ] as const)('preserves $taxCode flat-rate behaviour in $taxYear', (taxYear, taxCode, expectedRate) => {
    const result = calculateTax(mainEngineInput(30_000, taxYear, taxCode));

    expect(result.taxFreeAmount).toBe(0);
    expect(result.taxBands).toHaveLength(1);
    expect(result.taxBands[0]?.rate).toBe(expectedRate);
    expect(result.incomeTax.annually).toBeCloseTo(30_000 * (expectedRate / 100), 2);
  });
});
