'use client';

import { useActiveDirectorScenario } from '@/components/molecules/DirectorGuide/calculator/useActiveDirectorScenario';
import { roundToPence } from '@/lib/tax';
import { formatCurrency } from '@/lib/utils';
import { useMonthlyModeOutput, useSubmittedDirectorForm } from '@/store/directorGuideStore';

type DetailRow = [label: string, amount: number];

export function DetailCards() {
  const { financials, isProfitWhatIfActive } = useActiveDirectorScenario();
  const formData = useSubmittedDirectorForm();
  const monthlyOutput = useMonthlyModeOutput();
  if (!(formData && financials)) return null;

  const {
    companyBalance,
    companyBalanceLabel,
    profitAfterBusinessExpenses,
    profitAfterPension,
    scenario,
  } = financials;
  const revenue = formData.mode === 'monthly' ? monthlyOutput?.projectedRevenue : formData.revenue;
  const expenses =
    formData.mode === 'monthly' ? monthlyOutput?.projectedExpenses : formData.expenses;
  if (revenue === undefined || expenses === undefined) return null;

  const profitLabel = isProfitWhatIfActive
    ? 'Adjusted company profit'
    : 'Profit after business expenses';
  const employerNILabel = scenario.class1ANI > 0 ? 'Employer NI (incl. Class 1A)' : 'Employer NI';
  const taperTax = scenario.taperTaxOnOtherIncome ?? 0;
  const taxableProfitLabel =
    roundToPence(profitAfterPension - scenario.salary - scenario.employerNI) < 0
      ? 'Taxable profit (floored at £0)'
      : 'Taxable profit';

  return (
    <div className='grid grid-cols-2 gap-4 max-lg:grid-cols-1'>
      <DetailCard
        title='Corporation Tax'
        rows={[
          ...(!isProfitWhatIfActive
            ? ([
                ['Revenue', revenue],
                ['Business expenses', -expenses],
              ] satisfies DetailRow[])
            : []),
          [profitLabel, profitAfterBusinessExpenses],
          ...(scenario.pension > 0
            ? ([
                ['Employer pension', -scenario.pension],
                ['Profit after employer pension', profitAfterPension],
              ] satisfies DetailRow[])
            : []),
          [`Salary + ${employerNILabel}`, -(scenario.salary + scenario.employerNI)],
          ...(scenario.lossReliefUsed > 0
            ? ([['Trading loss relief used', -scenario.lossReliefUsed]] satisfies DetailRow[])
            : []),
          [taxableProfitLabel, scenario.taxableProfit],
        ]}
        total={['Estimated Corporation Tax', scenario.corporationTax]}
      />

      <DetailCard
        title='Company Allocation'
        rows={[
          [profitLabel, profitAfterBusinessExpenses],
          ...(scenario.pension > 0
            ? ([['Employer pension', -scenario.pension]] satisfies DetailRow[])
            : []),
          ['Gross salary', -scenario.salary],
          [employerNILabel, -scenario.employerNI],
          ['Corporation Tax', -scenario.corporationTax],
          ['Gross dividends', -scenario.dividends],
        ]}
        total={[companyBalanceLabel, companyBalance]}
      />

      <DetailCard
        title='Dividend Breakdown'
        rows={[
          ['Gross dividends', scenario.dividends],
          ['Personal Allowance used', -scenario.dividendPersonalAllowanceUsed],
          ['Dividend allowance used at nil rate', -scenario.dividendNilRateUsed],
          ['Dividends subject to positive rates', scenario.dividendsSubjectToTax],
        ]}
        total={['Estimated dividend tax', scenario.dividendTax]}
      />

      <DetailCard
        title='Personal Take-Home'
        rows={[
          ['Gross salary', scenario.salary],
          ['Gross dividends', scenario.dividends],
          ['Income Tax on salary and benefits', -(scenario.incomeTax - taperTax)],
          ...(taperTax > 0
            ? ([['Extra Income Tax on other income', -taperTax]] satisfies DetailRow[])
            : []),
          ['Employee NI', -scenario.employeeNI],
          ['Dividend tax', -scenario.dividendTax],
          ...(scenario.studentLoan > 0
            ? ([['Student loan from this scenario', -scenario.studentLoan]] satisfies DetailRow[])
            : []),
        ]}
        total={['Estimated annual take-home', scenario.takeHome]}
      />
    </div>
  );
}

function DetailCard({
  title,
  rows,
  total,
}: {
  title: string;
  rows: DetailRow[];
  total: DetailRow;
}) {
  return (
    <div className='rounded-sm border border-border/60 bg-card p-5'>
      <h3 className='mb-3 font-semibold text-foreground'>{title}</h3>
      <dl className='text-sm'>
        {rows.map(([label, amount]) => (
          <div
            key={label}
            className='flex justify-between gap-2 border-b border-border/50 py-2.5 last:border-b-0'
          >
            <dt className='text-muted-foreground'>{label}</dt>
            <dd className='shrink-0 font-mono'>{formatCurrency(amount === 0 ? 0 : amount)}</dd>
          </div>
        ))}
        <div className='mt-2 flex justify-between gap-2 border-t border-border/70 pt-3 font-semibold'>
          <dt>{total[0]}</dt>
          <dd className='shrink-0 font-mono'>{formatCurrency(total[1])}</dd>
        </div>
      </dl>
    </div>
  );
}
