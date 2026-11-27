/**
 * Independently worked amounts in pounds. See README.md for official sources and workings.
 * A paired amount records an unresolved rounding observation, not an accepted expectation.
 */
type ReferenceAmount = number | { readonly independent: number; readonly observed: number };

export const financialFields = [
  'salary',
  'employerNI',
  'employeeNI',
  'taxableProfit',
  'corporationTax',
  'dividends',
  'incomeTax',
  'dividendTax',
  'totalPersonalTax',
  'pension',
  'retainedProfit',
  'takeHome',
] as const;

type FinancialReference = Record<(typeof financialFields)[number], ReferenceAmount>;

export const referenceTaxYear = '2026-2027';
const fullCompanyPeriod = { start: '2026-04-01', end: '2027-03-31' } as const;
const region = 'rUK';
const annual = { mode: 'annual', region, accountingPeriodEnd: fullCompanyPeriod.end } as const;

export const recruiter = {
  companyPeriod: fullCompanyPeriod,
  input: {
    ...annual,
    revenue: 11400,
    expenses: 3120,
    yourSetupSalary: 6708,
    yourSetupDividends: 1065.8,
  },
  grossProfit: 8280,
  expected: {
    allSalary: {
      salary: 7852.17,
      employerNI: 427.83,
      employeeNI: 0,
      taxableProfit: 0,
      corporationTax: 0,
      dividends: 0,
      incomeTax: 0,
      dividendTax: 0,
      totalPersonalTax: 0,
      pension: 0,
      retainedProfit: 0,
      takeHome: 7852.17,
    },
    yourSetup: {
      salary: 6708,
      employerNI: 256.2,
      employeeNI: 0,
      taxableProfit: 1315.8,
      corporationTax: 250,
      dividends: 1065.8,
      incomeTax: 0,
      dividendTax: 0,
      totalPersonalTax: 0,
      pension: 0,
      retainedProfit: 0,
      takeHome: 7773.8,
    },
    allDividends: {
      salary: 0,
      employerNI: 0,
      employeeNI: 0,
      taxableProfit: 8280,
      corporationTax: 1573.2,
      dividends: 6706.8,
      incomeTax: 0,
      dividendTax: 0,
      totalPersonalTax: 0,
      pension: 0,
      retainedProfit: 0,
      takeHome: 6706.8,
    },
  } satisfies Record<string, FinancialReference>,
} as const;

export const consultancy = {
  companyPeriod: fullCompanyPeriod,
  input: { ...annual, revenue: 88000, expenses: 8000, associatedCompaniesCount: 2 },
  grossProfit: 80000,
  otherJob: { otherIncome: 40000, hasOtherPAYEEmployment: true },
  employerPension: { pensionContribution: 10000 },
  tradingLoss: { lossesBroughtForward: 20000 },
  expected: {
    allSalary: {
      salary: 70217.39,
      employerNI: 9782.61,
      employeeNI: 3414.95,
      taxableProfit: 0,
      corporationTax: 0,
      dividends: 0,
      incomeTax: { independent: 15518.95, observed: 15518.96 },
      dividendTax: 0,
      totalPersonalTax: { independent: 18933.9, observed: 18933.91 },
      pension: 0,
      retainedProfit: 0,
      takeHome: { independent: 51283.49, observed: 51283.48 },
    },
    optimalMix: {
      salary: 12570,
      employerNI: 1135.5,
      employeeNI: 0,
      taxableProfit: 66294.5,
      corporationTax: 15693.04,
      dividends: 50601.46,
      incomeTax: 0,
      dividendTax: 8611.27,
      totalPersonalTax: 8611.27,
      pension: 0,
      retainedProfit: 0,
      takeHome: 54560.19,
    },
    allDividends: {
      salary: 0,
      employerNI: 0,
      employeeNI: 0,
      taxableProfit: 80000,
      corporationTax: 19325,
      dividends: 60675,
      incomeTax: 0,
      dividendTax: { independent: 7718.78, observed: 7718.79 },
      totalPersonalTax: { independent: 7718.78, observed: 7718.79 },
      pension: 0,
      retainedProfit: 0,
      takeHome: { independent: 52956.22, observed: 52956.21 },
    },
    otherJob: {
      salary: 12570,
      employerNI: 1135.5,
      employeeNI: 0,
      taxableProfit: 66294.5,
      corporationTax: 15693.04,
      dividends: 50601.46,
      incomeTax: 3608,
      dividendTax: 17911.27,
      totalPersonalTax: 21519.27,
      pension: 0,
      retainedProfit: 0,
      takeHome: 41652.19,
    },
    employerPension: {
      salary: 12570,
      employerNI: 1135.5,
      employeeNI: 0,
      taxableProfit: 56294.5,
      corporationTax: 13043.04,
      dividends: 43251.46,
      incomeTax: 2974,
      dividendTax: { independent: 15283.64, observed: 15283.65 },
      totalPersonalTax: { independent: 18257.64, observed: 18257.65 },
      pension: 10000,
      retainedProfit: 0,
      takeHome: { independent: 37563.82, observed: 37563.81 },
    },
    tradingLoss: {
      salary: 0,
      employerNI: 0,
      employeeNI: 0,
      taxableProfit: 60000,
      corporationTax: 14025,
      dividends: 65975,
      incomeTax: 0,
      dividendTax: { independent: 9613.53, observed: 9613.54 },
      totalPersonalTax: { independent: 9613.53, observed: 9613.54 },
      pension: 0,
      retainedProfit: 0,
      takeHome: { independent: 56361.47, observed: 56361.46 },
    },
  } satisfies Record<string, FinancialReference>,
} as const;

const dividendDrawBasis = { taxBasedMonthlyDraw: 1053, requiredBuffer: 3900 } as const;
const unconstrainedDividendDraw = {
  ...dividendDrawBasis,
  cashBasedCeiling: 2136,
  safeMonthlyDraw: 1053,
  spendingShortfall: 0,
  shortfall: 0,
} as const;

export const contractor = {
  companyPeriod: fullCompanyPeriod,
  input: {
    mode: 'monthly',
    region,
    accountingPeriodEnd: fullCompanyPeriod.end,
    monthlyIncome: 1600,
    monthlyExpenses: 300,
    contractStartMonth: 4,
    minimumMonthlyDraw: 1000,
    runwayMonths: 3,
  },
  projection: { monthsRemaining: 12, projectedRevenue: 19200, projectedExpenses: 3600 },
  grossProfit: 15600,
  expected: {
    allDividends: {
      salary: 0,
      employerNI: 0,
      employeeNI: 0,
      taxableProfit: 15600,
      corporationTax: 2964,
      dividends: 12636,
      incomeTax: 0,
      dividendTax: 0,
      totalPersonalTax: 0,
      pension: 0,
      retainedProfit: 0,
      takeHome: 12636,
    },
    optimalMix: {
      salary: 12570,
      employerNI: 1135.5,
      employeeNI: 0,
      taxableProfit: 1894.5,
      // Exact £359.955 uses the portfolio's half-up CT planning convention.
      corporationTax: 359.96,
      dividends: 1534.54,
      incomeTax: 0,
      dividendTax: 111.21,
      totalPersonalTax: 111.21,
      pension: 0,
      retainedProfit: 0,
      takeHome: 13993.33,
    },
  } satisfies Record<string, FinancialReference>,
  cash: {
    blank: {
      input: { cashInBank: 9000, additionalCommittedCash: undefined },
      expected: unconstrainedDividendDraw,
    },
    explicitZero: {
      input: { cashInBank: 9000, additionalCommittedCash: 0 },
      expected: unconstrainedDividendDraw,
    },
    payable: {
      input: { cashInBank: 9000, additionalCommittedCash: 1500 },
      expected: {
        ...dividendDrawBasis,
        cashBasedCeiling: 636,
        safeMonthlyDraw: 636,
        spendingShortfall: 364,
        shortfall: 0,
      },
    },
    exhausted: {
      input: { cashInBank: 9000, additionalCommittedCash: 2136 },
      expected: {
        ...dividendDrawBasis,
        cashBasedCeiling: 0,
        safeMonthlyDraw: 0,
        spendingShortfall: 1000,
        shortfall: 0,
      },
    },
    bufferShort: {
      input: { cashInBank: 9000, additionalCommittedCash: 2300 },
      expected: {
        ...dividendDrawBasis,
        cashBasedCeiling: 0,
        safeMonthlyDraw: 0,
        spendingShortfall: 1000,
        shortfall: 164,
      },
    },
    zeroBank: {
      input: { cashInBank: 0, additionalCommittedCash: undefined },
      expected: {
        ...dividendDrawBasis,
        cashBasedCeiling: 0,
        safeMonthlyDraw: 0,
        spendingShortfall: 1000,
        shortfall: 3900,
      },
    },
    withPayroll: {
      input: { cashInBank: 5000, additionalCommittedCash: undefined },
      expected: {
        taxBasedMonthlyDraw: 1166.11,
        requiredBuffer: 3900,
        cashBasedCeiling: 0,
        safeMonthlyDraw: 0,
        spendingShortfall: 1000,
        shortfall: 395.46,
      },
    },
  },
} as const;

export const lossMakingStudio = {
  companyPeriod: fullCompanyPeriod,
  input: { ...annual, revenue: 9000, expenses: 12000 },
  evidenceOutsideCalculator: {
    openingRealisedProfits: 9000,
    cashInBank: 4000,
    customerReceivable: 4501,
    shareCapital: 1,
    nearTermLiabilities: 2500,
  },
  expected: {
    tradingLoss: 3000,
    corporationTax: 0,
    realisedProfitsBeforeDistribution: 6000,
    cashAboveKnownLiabilities: 1500,
    illustrativeSalary: 6708,
    illustrativeEmployerNI: 256.2,
    lossAfterIllustrativePayroll: 9964.2,
  },
  observed: 'Survival Mode rules out dividends despite having no opening-reserve input.',
  owner: 'JGF-51',
} as const;

export const firstAccounts = {
  companyPeriod: { start: '2025-05-11', end: '2026-05-31' },
  input: { ...annual, revenue: 83200, expenses: 6000, accountingPeriodEnd: '2026-05-31' },
  shortPeriodInput: { revenue: 4200, expenses: 0 },
  expected: {
    corporationTax: 16492.25,
    companiesHouseAccountsDue: '2027-02-11',
    periods: [
      {
        start: '2025-05-11',
        end: '2026-05-10',
        taxableProfit: 73000,
        corporationTax: 15595,
        paymentDue: '2027-02-11',
        returnDue: '2027-05-31',
      },
      {
        start: '2026-05-11',
        end: '2026-05-31',
        taxableProfit: 4200,
        corporationTax: 897.25,
        paymentDue: '2027-03-01',
        returnDue: '2027-05-31',
      },
    ],
  },
  observed: { wholeAccountsCT: 16708, shortPeriodCT: 798 },
  owner: 'JGF-166',
} as const;
