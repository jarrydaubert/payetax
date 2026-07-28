import { jest } from '@jest/globals';

describe('Director Calculator policy selection', () => {
  afterEach(() => {
    jest.dontMock('@/constants/taxRates');
    jest.resetModules();
  });

  it('uses the requested non-current tax year Payments on Account policy', async () => {
    jest.resetModules();
    jest.doMock('@/constants/taxRates', () => {
      const actual =
        jest.requireActual<typeof import('@/constants/taxRates')>('@/constants/taxRates');

      return {
        ...actual,
        PAYMENTS_ON_ACCOUNT: {
          ...actual.PAYMENTS_ON_ACCOUNT,
          '2023-2024': {
            threshold: 0,
            advanceMultiplier: 2,
          },
          [actual.CURRENT_TAX_YEAR]: {
            threshold: Number.MAX_SAFE_INTEGER,
            advanceMultiplier: 99,
          },
        },
      };
    });
    const { calculateDirectorScenario } = await import('../directorCalculator');

    const result = calculateDirectorScenario(
      {
        region: 'rUK',
        revenue: 100_000,
        includesVat: false,
        expenses: 20_000,
        alreadyTaken: 0,
        alreadyTakenViaPayroll: null,
        confirmedSoleIncome: true,
      },
      '2023-2024',
    );

    expect(result.mode).toBe('normal');
    if (result.mode !== 'normal') return;

    expect(result.includesPOA).toBe(true);
    expect(result.personalTaxAnnual).toBe(result.dividendTax * 2);
  });
});
