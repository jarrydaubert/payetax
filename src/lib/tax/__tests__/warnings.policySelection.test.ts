import { jest } from '@jest/globals';

describe('Director warnings policy selection', () => {
  afterEach(() => {
    jest.dontMock('@/constants/taxRates');
    jest.resetModules();
  });

  it('uses the pension warning fields from the requested non-current tax year', async () => {
    jest.resetModules();
    jest.doMock('@/constants/taxRates', () => {
      const actual =
        jest.requireActual<typeof import('@/constants/taxRates')>('@/constants/taxRates');

      return {
        ...actual,
        PENSION_ALLOWANCES: {
          ...actual.PENSION_ALLOWANCES,
          '2023-2024': {
            annualAllowance: 10_000,
            adjustedIncomeTaperThreshold: 20_000,
            minimumTaperedAllowance: 2_000,
            moneyPurchaseAnnualAllowance: 4_000,
            taperRate: 0.25,
          },
          [actual.CURRENT_TAX_YEAR]: {
            annualAllowance: Number.MAX_SAFE_INTEGER,
            adjustedIncomeTaperThreshold: Number.MAX_SAFE_INTEGER,
            minimumTaperedAllowance: Number.MAX_SAFE_INTEGER,
            moneyPurchaseAnnualAllowance: Number.MAX_SAFE_INTEGER,
            taperRate: 0,
          },
        },
      };
    });
    const { getWarnings } = await import('../warnings');

    const warnings = getWarnings({
      profit: 100_000,
      salary: 60_000,
      pensionContribution: 15_000,
      taxYear: '2023-2024',
    });

    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'PENSION_AA_EXCEEDED',
          message: expect.stringContaining(
            'exceeds the £10,000 Annual Allowance by £5,000',
          ) as string,
        }),
        expect.objectContaining({
          type: 'PENSION_TAPER',
          message: expect.stringContaining('Your AA is reduced to ~£2,000') as string,
        }),
      ]),
    );
  });
});
