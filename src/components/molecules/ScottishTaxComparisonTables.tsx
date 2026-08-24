import { type CrawlableRateBand, getCrawlableTaxFacts } from '@/lib/crawlableTaxFacts';
import { calculateAnnualIncomeTaxComparison } from '@/lib/scottishTaxComparison';
import type { TaxYear } from '@/lib/tax';
import { CURRENT_TAX_YEAR, formatTaxYearDisplay, selectTaxPolicy } from '@/lib/tax';
import { cn, formatCurrency } from '@/lib/utils';

export const SCOTTISH_COMPARISON_EXAMPLE_SALARIES = [
  25_000, 35_000, 50_000, 75_000, 100_000, 150_000,
] as const;

interface ComparisonTableProps {
  taxYear?: TaxYear;
}

function PolicyTable({ label, rows }: { label: string; rows: CrawlableRateBand[] }) {
  return (
    <div>
      <h3 className='mb-3 font-display font-semibold text-foreground text-xl'>{label}</h3>
      <div className='overflow-x-auto border border-border bg-card'>
        <table className='w-full min-w-xl bg-card'>
          <thead className='border-border border-b bg-muted/45'>
            <tr>
              <th className='px-4 py-3 text-left font-semibold text-muted-foreground text-sm'>
                Band
              </th>
              <th className='px-4 py-3 text-left font-semibold text-muted-foreground text-sm'>
                Gross income
              </th>
              <th className='px-4 py-3 text-right font-semibold text-muted-foreground text-sm'>
                Rate
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {rows.map((row) => (
              <tr key={row.band}>
                <td className='px-4 py-3 text-foreground/90'>{row.band}</td>
                <td className='px-4 py-3 text-foreground/90 tabular-nums'>{row.range}</td>
                <td className='px-4 py-3 text-right text-foreground/90 tabular-nums'>{row.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ScottishTaxBandsTable({ taxYear = CURRENT_TAX_YEAR }: ComparisonTableProps) {
  const policy = selectTaxPolicy(taxYear);
  const facts = getCrawlableTaxFacts(policy.taxYear);
  const taxYearDisplay = formatTaxYearDisplay(facts.taxYear, { shortEndYear: true });
  const allowanceNilAt =
    policy.ruk.personalAllowanceReductionThreshold +
    policy.ruk.personalAllowance / policy.ruk.personalAllowanceReductionRate;

  return (
    <div className='not-prose my-8 space-y-8' data-testid='scottish-tax-bands-table'>
      <PolicyTable label={`Scotland (${taxYearDisplay})`} rows={facts.scottishIncomeTaxBands} />
      <PolicyTable label={`England (${taxYearDisplay})`} rows={facts.restOfUkIncomeTaxBands} />
      <p className='text-muted-foreground text-sm'>
        Gross-income ranges assume the standard Personal Allowance. It is reduced when adjusted net
        income exceeds {formatCurrency(policy.ruk.personalAllowanceReductionThreshold, 0)} and is
        nil at {formatCurrency(allowanceNilAt, 0)} or more.
      </p>
    </div>
  );
}

function describeDifference(difference: number): string {
  if (difference === 0) return 'Same Income Tax';
  const region = difference > 0 ? 'Scotland' : 'England';
  return `${region} ${formatCurrency(Math.abs(difference), 0)} higher`;
}

export function ScottishTaxExamplesTable({ taxYear = CURRENT_TAX_YEAR }: ComparisonTableProps) {
  const taxYearDisplay = formatTaxYearDisplay(taxYear, { shortEndYear: true });

  return (
    <div
      className='not-prose my-8 overflow-x-auto border border-border bg-card'
      data-testid='scottish-tax-examples-table'
    >
      <table className='w-full min-w-3xl bg-card'>
        <caption className='p-4 text-left text-muted-foreground text-sm'>
          Annual Income Tax for {taxYearDisplay}, rounded to the nearest pound
        </caption>
        <thead className='border-border border-b bg-muted/45'>
          <tr>
            {['Salary', 'Scotland', 'England', 'Difference'].map((heading) => (
              <th
                className={cn(
                  'px-4 py-3 font-semibold text-muted-foreground text-sm',
                  heading === 'Salary' ? 'text-left' : 'text-right',
                )}
                key={heading}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-border'>
          {SCOTTISH_COMPARISON_EXAMPLE_SALARIES.map((salary) => {
            const comparison = calculateAnnualIncomeTaxComparison(salary, taxYear);
            return (
              <tr key={salary}>
                <th className='px-4 py-3 text-left font-medium text-foreground tabular-nums'>
                  {formatCurrency(salary, 0)}
                </th>
                <td className='px-4 py-3 text-right text-foreground/90 tabular-nums'>
                  {formatCurrency(comparison.scottishTax, 0)}
                </td>
                <td className='px-4 py-3 text-right text-foreground/90 tabular-nums'>
                  {formatCurrency(comparison.rukTax, 0)}
                </td>
                <td className='px-4 py-3 text-right text-foreground/90 tabular-nums'>
                  {describeDifference(comparison.difference)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
