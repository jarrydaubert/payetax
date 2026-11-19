import { resolveTaxYear } from '../../src/lib/tax/taxPolicy';

export const legacySalary = 54321.98;
export const legacyRevenue = 87654.32;

export function legacyFigureSnapshots(savedAt: number) {
  // Synthetic inputs in the pre-opt-in Zustand partialize/default shapes from 822a0383 (#182's parent).
  const metadata = { _savedAt: savedAt, _taxYear: resolveTaxYear() };
  return {
    'tax-calculator-storage': {
      version: 0,
      state: {
        ...metadata,
        input: {
          salary: legacySalary,
          payPeriod: 'annually',
          taxYear: metadata._taxYear,
          taxCode: '1257L',
          region: 'England',
          isScottish: false,
          isMarried: false,
          partnerGrossWage: 0,
          isBlind: false,
          payNoNI: false,
          studentLoanPlans: 'none',
          pensionContribution: 0,
          pensionContributionType: 'percentage',
          niCategory: 'A',
          hoursPerWeek: 40,
          allowancesDeductions: 0,
          incomeSources: [],
        },
      },
    },
    'director-guide-storage': {
      version: 4,
      state: {
        ...metadata,
        selectedStrategy: 'optimalMix',
        formData: {
          mode: 'annual',
          revenue: legacyRevenue,
          includesVat: false,
          lossesBroughtForward: 0,
          ytdSalary: 0,
          ytdDividends: 0,
          ytdDrawings: 0,
          otherIncome: 0,
          hasOtherPAYEEmployment: false,
          yearEndMonth: '03',
          yearEndCustom: '',
          studentLoanPlans: [],
          pensionContribution: 0,
          isPensionAlreadyDeducted: false,
          companyCarBIK: 0,
          associatedCompaniesCount: 1,
          hasEmploymentAllowance: false,
          contractStartMonth: 4,
          cashInBank: 0,
          minimumMonthlyDraw: 0,
          runwayMonths: 3,
        },
      },
    },
  };
}
