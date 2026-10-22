'use client';

import type { ReactNode } from 'react';
import { calculateMarginalTaxRate } from '@/lib/calculatorMarginalTax';
import {
  buildResultsTableRows,
  getResultPeriodValue,
  PERIOD_LABEL_TO_PAY_PERIOD,
} from '@/lib/calculatorResultsPresenter';
import type { PayPeriod } from '@/lib/tax';
import { getTaxCodeRegionOverride, parseTaxCode } from '@/lib/tax';
import type { TaxCalculationInput, TaxCalculationResults } from '@/lib/types/calculator';
import { cn, formatCurrency } from '@/lib/utils';
import { ResultPeriodSelect } from './ResultPeriodSelect';
import { TaxCodeBasisNotice } from './TaxCodeBasisNotice';

interface PayStatementProps {
  results: TaxCalculationResults;
  input: TaxCalculationInput & { region?: string };
  previousYearResults: TaxCalculationResults | null;
  period: PayPeriod;
  onPeriodChange: (period: PayPeriod) => void;
  onCompare: () => void;
  emailAction: ReactNode;
  notice?: ReactNode;
}

export function PayStatement({
  results,
  input,
  previousYearResults,
  period,
  onPeriodChange,
  onCompare,
  emailAction,
  notice,
}: PayStatementProps) {
  const netPayText = formatCurrency(results.netPay[period]);
  const periodLabel =
    Object.entries(PERIOD_LABEL_TO_PAY_PERIOD).find(([, value]) => value === period)?.[0] ??
    'Monthly';
  const region =
    getTaxCodeRegionOverride(parseTaxCode(results.taxCodeBasis?.appliedCode ?? '', 0)) ??
    input.region ??
    (input.isScottish ? 'Scotland' : 'England / Wales / NI');
  const rows = buildResultsTableRows({
    results,
    allowancesDeductions: input.allowancesDeductions,
    studentLoans: input.studentLoanPlans === 'none' ? [] : input.studentLoanPlans,
    previousYearResults,
    previousYearLabel: String(Number(input.taxYear.slice(0, 4)) - 1),
    taxCode: input.taxCode,
  });
  const statementKinds = new Set([
    'gross',
    'incomeTax',
    'nationalInsurance',
    'pension',
    'studentLoan',
    'nonTaxableAllowance',
    'netPay',
  ]);
  const taxAndNI = results.incomeTax.annually + results.nationalInsurance.annually;
  const gross = results.incomeBreakdown?.total ?? results.grossSalary.annually;
  const effectiveRate = gross > 0 ? (taxAndNI / gross) * 100 : 0;
  const labels: Record<string, string> = {
    incomeTax: 'Income Tax',
    netPay: 'Take-home pay',
    gross: 'Gross pay',
  };
  const valueFor = (row: (typeof rows)[number]) =>
    getResultPeriodValue(row.annual, row.valuesByPeriod, period, input.hoursPerWeek);
  return (
    <div className='flex min-w-0 flex-col gap-5'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <h2 className='font-display font-semibold text-2xl sm:text-3xl'>Your take-home pay</h2>
        <ResultPeriodSelect label='View by' value={period} onChange={onPeriodChange} />
      </div>
      <div>
        <p
          className={cn(
            'statement-amount font-mono font-semibold text-primary tabular-nums tracking-tight',
            netPayText.length > 12 && 'statement-amount-long',
          )}
          data-testid='take-home-amount'
        >
          {netPayText}
        </p>
        <p className='mt-1 text-muted-foreground text-sm sm:text-base'>
          {period === 'annually'
            ? `${formatCurrency(results.netPay.monthly)} per month`
            : `${formatCurrency(results.netPay.annually)} per year`}
        </p>
        <p className='mt-3 text-muted-foreground text-xs leading-relaxed'>
          Steady-pay estimate, not an exact payslip.
        </p>
        <p className='mt-1 text-muted-foreground text-xs'>
          {input.taxYear} · {region} ·{' '}
          {results.taxCodeBasis?.appliedCode
            ? `HMRC code ${results.taxCodeBasis.appliedCode}`
            : 'Policy-derived estimate'}
        </p>
      </div>
      {notice}
      {input.incomeSources?.length ? (
        <p className='rounded-sm border border-warning/40 bg-warning/5 p-3 text-sm leading-relaxed'>
          <strong>Additional income accuracy:</strong> multiple sources can affect personal
          allowance, tax bands and student loans. These edge cases are still being verified; totals
          may be understated.
        </p>
      ) : null}
      <table className='w-full text-sm' data-testid='pay-statement'>
        <caption className='sr-only'>Your {periodLabel.toLowerCase()} pay statement</caption>
        <thead>
          <tr className='border-border border-y bg-secondary/50'>
            <th scope='col' className='px-3 py-3 text-left font-medium'>
              Breakdown
            </th>
            <th scope='col' className='px-3 py-3 text-right font-medium'>
              {periodLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows
            .filter(
              (row) =>
                statementKinds.has(row.kind) &&
                (row.kind !== 'nonTaxableAllowance' || row.annual !== 0),
            )
            .map((row) => (
              <tr
                key={row.id}
                className={cn(
                  'border-border/60 border-b',
                  row.kind === 'netPay' && 'border-primary border-t-2 bg-primary/5 font-semibold',
                )}
              >
                <th scope='row' className='max-w-48 px-3 py-3 text-left font-normal leading-snug'>
                  {labels[row.kind] ?? row.category}
                </th>
                <td className='whitespace-nowrap px-3 py-3 text-right font-mono tabular-nums'>
                  {formatCurrency(valueFor(row))}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p className='text-muted-foreground text-sm'>
          Tax &amp; NI:{' '}
          <span className='font-medium text-foreground'>{effectiveRate.toFixed(1)}%</span> of gross
          pay
        </p>
        <div className='flex flex-wrap gap-2'>
          <button type='button' className='statement-action' onClick={onCompare}>
            Compare all 7 periods
          </button>
          {emailAction}
        </div>
      </div>
      <details className='statement-disclosure'>
        <summary>How this estimate is worked out</summary>
        <div className='flex flex-col gap-4 pt-3 text-sm leading-relaxed'>
          <p>
            Tax year {input.taxYear}. Pension contributions are modelled as salary sacrifice;
            amounts in £ are annual. Weekly, daily and hourly figures are equivalents of this
            steady-pay projection. Daily and hourly equivalents use {input.hoursPerWeek} hours per
            week and five working days.
          </p>
          <TaxCodeBasisNotice basis={results.taxCodeBasis} />
          <dl className='statement-workings'>
            {rows
              .filter((row) =>
                [
                  'employment',
                  'otherIncome',
                  'taxFree',
                  'taxCodeAdjustment',
                  'taxable',
                  'taxBand',
                ].includes(row.kind),
              )
              .map((row) => (
                <div key={row.id}>
                  <dt>{row.category}</dt>
                  <dd>{formatCurrency(row.annual)} / year</dd>
                </div>
              ))}
          </dl>
          <p>
            Tax-band amounts show income within each band, before payroll rounding. They are not
            extra deductions.
          </p>
          <p data-testid='next-100-tax'>
            Estimated tax &amp; NI{input.studentLoanPlans !== 'none' ? ' and student loan' : ''} on
            the next £100/year:{' '}
            <strong>
              {formatCurrency(calculateMarginalTaxRate({ results, input, taxYear: input.taxYear }))}
            </strong>
            . This is a rounded payroll difference, not a statutory marginal rate.
          </p>
        </div>
      </details>
      <details className='statement-disclosure'>
        <summary>Employer costs and previous year</summary>
        <dl className='statement-workings pt-3 text-sm'>
          <div>
            <dt>
              Employer National Insurance{' '}
              <span className='block text-muted-foreground text-xs'>
                Paid by your employer; not deducted from your pay
              </span>
            </dt>
            <dd>{formatCurrency(results.employerNI)} / year</dd>
          </div>
          {previousYearResults ? (
            <div>
              <dt>Take-home change from {Number(input.taxYear.slice(0, 4)) - 1}</dt>
              <dd>
                {formatCurrency(results.netPay.annually - previousYearResults.netPay.annually)} /
                year
              </dd>
            </div>
          ) : (
            <div>
              <dt>Previous-year comparison</dt>
              <dd>No supported earlier year</dd>
            </div>
          )}
        </dl>
      </details>
    </div>
  );
}
