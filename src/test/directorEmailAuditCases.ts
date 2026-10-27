import type { DirectorFormData, StrategyObjective } from '@/store/directorGuideStore';

/** Synthetic display/email parity cases, not independent statutory correctness fixtures. */
export interface DirectorEmailAuditCase {
  id: string;
  form?: Partial<DirectorFormData>;
  salary?: number;
  profitPercent?: number;
  selectedStrategy?: 'optimalMix' | 'allSalary' | 'allDividends';
  objective?: StrategyObjective;
  blocked: boolean;
}

export const DIRECTOR_EMAIL_AUDIT_CASES: readonly DirectorEmailAuditCase[] = [
  { id: 'baseline', blocked: false },
  { id: 'salary-what-if', salary: 20000, blocked: true },
  { id: 'profit-what-if', profitPercent: 25, blocked: true },
  { id: 'selected-dividends', selectedStrategy: 'allDividends', salary: 0, blocked: true },
  { id: 'minimum-ni-objective', objective: 'minimizeNI', blocked: true },
  { id: 'minimum-salary', form: { minimumSalaryRequirement: 20000 }, blocked: false },
  { id: 'scotland', form: { region: 'scotland', minimumSalaryRequirement: 20000 }, blocked: false },
  {
    id: 'pension-and-loans',
    form: { pensionContribution: 6000, studentLoanPlans: ['plan2', 'postgrad'] },
    blocked: false,
  },
  {
    id: 'pension-in-expenses',
    form: { pensionContribution: 6000, isPensionAlreadyDeducted: true },
    blocked: false,
  },
  {
    id: 'benefit-and-losses',
    form: { companyCarBIK: 5000, lossesBroughtForward: 10000 },
    blocked: false,
  },
  { id: 'vat-flag', form: { includesVat: true }, blocked: false },
  { id: 'other-income', form: { otherIncome: 120000 }, blocked: false },
  { id: 'employment-allowance', form: { hasEmploymentAllowance: true }, blocked: true },
  {
    id: 'associated-companies',
    form: { revenue: 300000, associatedCompaniesCount: 4 },
    blocked: false,
  },
  {
    id: 'ytd-and-your-setup',
    form: {
      ytdSalary: 20000,
      ytdDividends: 10000,
      ytdDrawings: 5000,
      yourSetupSalary: 20000,
      yourSetupDividends: 10000,
    },
    blocked: false,
  },
  {
    id: 'custom-year-end',
    form: { yearEndMonth: 'other', yearEndCustom: '06-30' },
    blocked: false,
  },
  {
    id: 'monthly',
    form: {
      mode: 'monthly',
      monthlyIncome: 12000,
      monthlyExpenses: 2000,
      contractStartMonth: 10,
      cashInBank: 10000,
      minimumMonthlyDraw: 2000,
    },
    blocked: true,
  },
  { id: 'survival', form: { revenue: 10000, expenses: 20000 }, blocked: true },
  { id: 'large-profit', form: { revenue: 10000000, expenses: 0 }, blocked: true },
];
