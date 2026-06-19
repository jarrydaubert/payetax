import Link from 'next/link';
import { getCrawlableTaxFacts } from '@/lib/crawlableTaxFacts';
import { cn } from '@/lib/utils';

function FactsTable({
  caption,
  headers,
  rows,
}: {
  caption: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className='overflow-hidden rounded-sm border border-border bg-background'>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[34rem] border-collapse text-sm'>
          <caption className='sr-only'>{caption}</caption>
          <thead className='border-border border-b bg-muted/35 text-left'>
            <tr>
              {headers.map((header) => (
                <th key={header} scope='col' className='px-4 py-3 font-semibold text-foreground'>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join('|')} className='border-border/70 border-b last:border-b-0'>
                {row.map((cell, index) => (
                  <td
                    key={`${row[0]}-${cell}`}
                    className={cn(
                      'px-4 py-3 text-muted-foreground',
                      index === 0 && 'font-medium text-foreground',
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CrawlableTaxFacts() {
  const facts = getCrawlableTaxFacts();
  const visibleExamples = facts.salaryExamples.filter((example) =>
    [20_000, 30_000, 40_000, 50_000, 60_000, 80_000, 100_000].includes(example.salary),
  );

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Static ID required for crawler and llms.txt anchor.
    <section
      className='relative z-[1] border-border border-b bg-ledger-grid px-4 py-16 md:py-24'
      id='tax-rates-and-take-home'
      data-testid='crawlable-tax-facts'
    >
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end'>
          <div>
            <div className='mb-3 font-semibold text-primary text-xs uppercase tracking-[0.18em]'>
              Static reference
            </div>
            <h2 className='font-display font-semibold text-4xl text-foreground leading-[0.98] md:text-6xl'>
              PAYE rates and take-home examples
            </h2>
          </div>
          <div className='space-y-3 text-muted-foreground text-sm leading-relaxed'>
            <p>
              Static reference for {facts.taxYearLabel}, covering {facts.taxYearDateRange}.{' '}
              {facts.assumptions}
            </p>
            <p>
              Rates last verified {facts.ratesVerifiedOn}. See the{' '}
              <Link href='/compliance' className='text-foreground underline underline-offset-2'>
                compliance notes
              </Link>{' '}
              and source links below.
            </p>
          </div>
        </div>

        <div className='grid gap-8'>
          <FactsTable
            caption={`Take-home pay examples for ${facts.taxYearLabel}`}
            headers={[
              'Gross salary',
              'Income tax',
              'Employee NI',
              'Annual take-home',
              'Monthly take-home',
            ]}
            rows={visibleExamples.map((example) => [
              example.salaryLabel,
              example.incomeTaxLabel,
              example.nationalInsuranceLabel,
              example.annualTakeHomeLabel,
              example.monthlyTakeHomeLabel,
            ])}
          />

          <div className='grid gap-8 lg:grid-cols-2'>
            <FactsTable
              caption={`England, Wales and Northern Ireland income tax bands for ${facts.taxYearLabel}`}
              headers={['Band', 'Annual income range', 'Rate']}
              rows={facts.restOfUkIncomeTaxBands.map((band) => [band.band, band.range, band.rate])}
            />

            <FactsTable
              caption={`Scottish income tax bands for ${facts.taxYearLabel}`}
              headers={['Band', 'Annual income range', 'Rate']}
              rows={facts.scottishIncomeTaxBands.map((band) => [band.band, band.range, band.rate])}
            />
          </div>

          <div className='grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]'>
            <FactsTable
              caption={`Employee National Insurance category A bands for ${facts.taxYearLabel}`}
              headers={['Band', 'Annual earnings range', 'Rate']}
              rows={facts.employeeNiBands.map((band) => [band.band, band.range, band.rate])}
            />

            <FactsTable
              caption={`Student loan thresholds for ${facts.taxYearLabel}`}
              headers={['Plan', 'Annual threshold', 'Repayment rate']}
              rows={facts.studentLoanRates.map((loan) => [loan.plan, loan.threshold, loan.rate])}
            />
          </div>
        </div>

        <p className='mt-6 max-w-4xl text-muted-foreground text-xs leading-relaxed'>
          Official source links:{' '}
          {facts.sourceUrls.map((url, index) => (
            <span key={url}>
              <a
                href={url}
                className='underline underline-offset-2 hover:text-foreground'
                rel='noopener noreferrer'
                target='_blank'
              >
                {new URL(url).hostname.replace(/^www\./, '')}
              </a>
              {index < facts.sourceUrls.length - 1 ? ', ' : '.'}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
