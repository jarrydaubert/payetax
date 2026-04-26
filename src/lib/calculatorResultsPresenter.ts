import type { PayPeriod } from '@/constants/taxRates';
import type { TaxCalculationResults } from '@/lib/types/calculator';

export type ResultsTableRowKind =
  | 'gross'
  | 'employment'
  | 'otherIncome'
  | 'taxFree'
  | 'taxable'
  | 'incomeTax'
  | 'taxBand'
  | 'studentLoan'
  | 'nationalInsurance'
  | 'pension'
  | 'nonTaxableAllowance'
  | 'netPay'
  | 'employerNI'
  | 'yearChange';

export interface ResultsTableRowViewModel {
  id: string;
  kind: ResultsTableRowKind;
  category: string;
  annual: number;
  whatIfAnnual?: number;
  valuesByPeriod?: Partial<Record<PayPeriod, number>>;
  whatIfValuesByPeriod?: Partial<Record<PayPeriod, number>>;
  percentage: string;
  isHighlight?: boolean;
  isSubRow?: boolean;
}

interface BuildResultsTableRowsInput {
  results: TaxCalculationResults;
  allowancesDeductions?: number;
  studentLoans?: string[];
  previousYearResults?: TaxCalculationResults | null;
  whatIfResults?: TaxCalculationResults | null;
  previousYearLabel: string;
}

export const PERIOD_LABEL_TO_PAY_PERIOD: Record<string, PayPeriod> = {
  Yearly: 'annually',
  Monthly: 'monthly',
  '4-Weekly': 'fourWeekly',
  Fortnightly: 'fortnightly',
  Weekly: 'weekly',
  Daily: 'daily',
  Hourly: 'hourly',
};

function calculatePercentage(amount: number, total: number): string {
  if (total === 0) return '0.0%';
  const percentage = Math.abs((amount / total) * 100);
  return `${Math.min(percentage, 999.9).toFixed(1)}%`;
}

function getGrossAnnual(results: TaxCalculationResults): number {
  return results.incomeBreakdown?.total ?? results.grossSalary.annually;
}

function periodDiff(
  current: Record<PayPeriod, number>,
  previous: Record<PayPeriod, number>,
): Record<PayPeriod, number> {
  return {
    annually: current.annually - previous.annually,
    monthly: current.monthly - previous.monthly,
    fourWeekly: current.fourWeekly - previous.fourWeekly,
    fortnightly: current.fortnightly - previous.fortnightly,
    weekly: current.weekly - previous.weekly,
    daily: current.daily - previous.daily,
    hourly: current.hourly - previous.hourly,
  };
}

export function buildResultsTableRows({
  results,
  allowancesDeductions = 0,
  studentLoans = [],
  previousYearResults = null,
  whatIfResults = null,
  previousYearLabel,
}: BuildResultsTableRowsInput): ResultsTableRowViewModel[] {
  const grossAnnual = getGrossAnnual(results);
  const whatIfGrossAnnual = whatIfResults ? getGrossAnnual(whatIfResults) : undefined;
  const yearChange = previousYearResults
    ? results.netPay.annually - previousYearResults.netPay.annually
    : 0;

  const rows: ResultsTableRowViewModel[] = [
    {
      id: 'gross-pay',
      kind: 'gross',
      category: 'Gross Pay',
      annual: grossAnnual,
      whatIfAnnual: whatIfGrossAnnual,
      valuesByPeriod: results.incomeBreakdown ? undefined : results.grossSalary,
      whatIfValuesByPeriod: whatIfResults?.incomeBreakdown ? undefined : whatIfResults?.grossSalary,
      percentage: '100%',
    },
  ];

  if (results.incomeBreakdown) {
    rows.push({
      id: 'employment-income',
      kind: 'employment',
      category: 'Employment Income',
      annual: results.incomeBreakdown.employment,
      whatIfAnnual: whatIfResults?.incomeBreakdown?.employment,
      percentage: calculatePercentage(results.incomeBreakdown.employment, grossAnnual),
      isSubRow: true,
    });

    if (results.incomeBreakdown.nonEmployment > 0) {
      rows.push({
        id: 'other-income',
        kind: 'otherIncome',
        category: 'Other Income (No NI)',
        annual: results.incomeBreakdown.nonEmployment,
        whatIfAnnual: whatIfResults?.incomeBreakdown?.nonEmployment,
        percentage: calculatePercentage(results.incomeBreakdown.nonEmployment, grossAnnual),
        isSubRow: true,
      });
    }
  }

  rows.push(
    {
      id: 'tax-free-allowance',
      kind: 'taxFree',
      category: 'Tax-Free Allowance',
      annual: results.taxFreeAmount,
      whatIfAnnual: whatIfResults?.taxFreeAmount,
      valuesByPeriod: results.taxFreeAmountByPeriod,
      whatIfValuesByPeriod: whatIfResults?.taxFreeAmountByPeriod,
      percentage: calculatePercentage(results.taxFreeAmount, grossAnnual),
    },
    {
      id: 'total-taxable',
      kind: 'taxable',
      category: 'Total Taxable',
      annual: results.taxableIncome,
      whatIfAnnual: whatIfResults?.taxableIncome,
      percentage: calculatePercentage(results.taxableIncome, grossAnnual),
    },
    {
      id: 'income-tax',
      kind: 'incomeTax',
      category: 'Total Tax Due',
      annual: results.incomeTax.annually,
      whatIfAnnual: whatIfResults?.incomeTax.annually,
      valuesByPeriod: results.incomeTax,
      whatIfValuesByPeriod: whatIfResults?.incomeTax,
      percentage: calculatePercentage(results.incomeTax.annually, grossAnnual),
    },
  );

  rows.push(
    ...results.taxBands.map((band, index) => ({
      id: `tax-band-${band.rate}-${index}`,
      kind: 'taxBand' as const,
      category: `${band.rate}% Rate`,
      annual: band.amount,
      whatIfAnnual: whatIfResults?.taxBands[index]?.amount,
      percentage: calculatePercentage(band.amount, grossAnnual),
      isSubRow: true,
    })),
  );

  if (studentLoans.length > 0) {
    rows.push({
      id: 'student-loan',
      kind: 'studentLoan',
      category: `Student Loan${studentLoans.length > 1 ? 's' : ''}`,
      annual: results.studentLoan.annually,
      whatIfAnnual: whatIfResults?.studentLoan.annually,
      valuesByPeriod: results.studentLoan,
      whatIfValuesByPeriod: whatIfResults?.studentLoan,
      percentage: calculatePercentage(results.studentLoan.annually, grossAnnual),
    });
  }

  rows.push(
    {
      id: 'national-insurance',
      kind: 'nationalInsurance',
      category: 'National Insurance',
      annual: results.nationalInsurance.annually,
      whatIfAnnual: whatIfResults?.nationalInsurance.annually,
      valuesByPeriod: results.nationalInsurance,
      whatIfValuesByPeriod: whatIfResults?.nationalInsurance,
      percentage: calculatePercentage(results.nationalInsurance.annually, grossAnnual),
    },
    {
      id: 'pension',
      kind: 'pension',
      category: 'Pension',
      annual: results.pensionContribution.annually,
      whatIfAnnual: whatIfResults?.pensionContribution.annually,
      valuesByPeriod: results.pensionContribution,
      whatIfValuesByPeriod: whatIfResults?.pensionContribution,
      percentage: calculatePercentage(results.pensionContribution.annually, grossAnnual),
    },
    {
      id: 'non-taxable-allowances',
      kind: 'nonTaxableAllowance',
      category: 'Non-taxable allowance(s)',
      annual: allowancesDeductions,
      whatIfAnnual: whatIfResults ? allowancesDeductions : undefined,
      percentage: calculatePercentage(allowancesDeductions, grossAnnual),
    },
    {
      id: 'net-pay',
      kind: 'netPay',
      category: 'Net Pay',
      annual: results.netPay.annually,
      whatIfAnnual: whatIfResults?.netPay.annually,
      valuesByPeriod: results.netPay,
      whatIfValuesByPeriod: whatIfResults?.netPay,
      percentage: calculatePercentage(results.netPay.annually, grossAnnual),
      isHighlight: true,
    },
    {
      id: 'employer-ni',
      kind: 'employerNI',
      category: 'Employers NI',
      annual: results.employerNI,
      whatIfAnnual: whatIfResults?.employerNI,
      percentage: calculatePercentage(results.employerNI, grossAnnual),
    },
  );

  if (previousYearResults) {
    const whatIfYearChange =
      whatIfResults && previousYearResults
        ? whatIfResults.netPay.annually - previousYearResults.netPay.annually
        : undefined;

    rows.push({
      id: 'year-change',
      kind: 'yearChange',
      category: `Net Change from ${previousYearLabel}`,
      annual: yearChange,
      whatIfAnnual: whatIfYearChange,
      valuesByPeriod: periodDiff(results.netPay, previousYearResults.netPay),
      whatIfValuesByPeriod: whatIfResults
        ? periodDiff(whatIfResults.netPay, previousYearResults.netPay)
        : undefined,
      percentage: calculatePercentage(yearChange, previousYearResults.netPay.annually),
    });
  }

  return rows;
}
