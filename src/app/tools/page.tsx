// src/app/tools/page.tsx
import { ArrowRight, Wrench } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/molecules/PageHero';
import { StructuredData } from '@/components/organisms/StructuredData';
import { Card } from '@/components/ui/card';
import { CURRENT_TAX_YEAR_DISPLAY_SHORT } from '@/constants/freshness';
import { TOOLS } from '@/constants/pages/toolsData';
import { generateMetadata as generateBaseMetadata, SITE_URL } from '@/lib/metadata';
import { cn } from '@/lib/utils';

const toolGuideRows = [
  {
    useCase: 'Estimate PAYE take-home pay',
    tool: 'UK PAYE calculator',
    href: '/',
    includes:
      'Income tax, employee National Insurance, student loans, pension inputs, tax codes, and pay-period breakdowns.',
    excludes:
      'Benefits in kind, irregular payroll corrections, and employer-specific deductions that do not appear in HMRC tables.',
  },
  {
    useCase: 'Compare salary and dividends',
    tool: 'Director Intelligence',
    href: '/tools/director-guide',
    includes:
      'Salary, dividends, Corporation Tax, Employer NI, pension extraction, Employment Allowance, and student-loan set-aside estimates.',
    excludes:
      'Accountant-only judgements such as IR35 status, dividend paperwork, pension carry-forward, and company-specific timing constraints.',
  },
  {
    useCase: 'Understand a tax code',
    tool: 'Tax Code Decoder',
    href: '/tools/tax-code-decoder',
    includes:
      'Common HMRC code patterns including 1257L, BR, D0, D1, K codes, emergency suffixes, and Scottish or Welsh prefixes.',
    excludes:
      'HMRC account access, employer payroll corrections, and personal allowance adjustments that need your tax-code notice.',
  },
  {
    useCase: 'Check Scotland-specific income tax',
    tool: 'Scottish Tax Calculator',
    href: '/tools/scottish-tax-calculator',
    includes:
      'Scottish starter, basic, intermediate, higher, advanced, and top-rate bands compared with England, Wales, and Northern Ireland.',
    excludes:
      'Scottish non-income taxes and residency disputes where HMRC has not confirmed your tax status.',
  },
  {
    useCase: 'Inspect National Insurance only',
    tool: 'National Insurance Calculator',
    href: '/tools/national-insurance-calculator',
    includes:
      'Employee and employer Class 1 thresholds, primary rates, upper rates, and yearly/monthly breakdowns.',
    excludes:
      'Self-employed Class 2/Class 4 planning and specialist category-letter cases outside the calculator scope.',
  },
  {
    useCase: 'Check Marriage Allowance',
    tool: 'Marriage Allowance Calculator',
    href: '/tools/marriage-allowance-calculator',
    includes:
      'Basic eligibility checks and the estimated saving from transferring part of a Personal Allowance.',
    excludes:
      'Backdated HMRC claims, complex partner-income changes, and advice on whether a transfer is right for your household.',
  },
] as const;

const toolsFaq = [
  {
    question: 'Which tax year do these tools use?',
    answer: `The retained calculators are positioned around the current ${CURRENT_TAX_YEAR_DISPLAY_SHORT} tax year and link back to the Compliance page for source dates and rate verification notes.`,
  },
  {
    question: 'Are the tools a replacement for payroll software?',
    answer:
      'No. PayeTax is an illustrative calculator for understanding PAYE-style outcomes. Payroll software, payslips, HMRC records, and accountant advice still win for real submissions and personal edge cases.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'No account is needed. The interactive calculators run in the browser, and result emails are opt-in.',
  },
  {
    question: 'Why are there separate tools instead of one huge calculator?',
    answer:
      'Separate tools keep each calculation focused: PAYE salary estimates, tax-code interpretation, Scotland-specific bands, NI inspection, Marriage Allowance, and director extraction all have different assumptions.',
  },
] as const;

export const metadata = generateBaseMetadata({
  title: 'Free UK Tax Tools | PayeTax',
  description:
    'Free UK tax tools: compare PAYE take-home pay, director salary vs dividends, tax codes, Scottish income tax, National Insurance, and Marriage Allowance.',
  pathname: '/tools',
});

export default function ToolsPage() {
  const tools = TOOLS;

  return (
    <>
      <StructuredData
        type='breadcrumb'
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: 'Tools', url: `${SITE_URL}/tools` },
        ]}
      />
      <StructuredData
        type='itemlist'
        itemList={{
          listName: 'PayeTax Tools',
          listDescription: 'Free UK tax tools and calculators.',
          items: tools.map((tool, index) => ({
            name: tool.title,
            url: `${SITE_URL}${tool.href}`,
            description: tool.description,
            position: index + 1,
          })),
        }}
      />

      <div className={'min-h-screen'}>
        <PageHero
          badge={{ icon: Wrench, text: 'Free Tax Tools' }}
          title='Free UK Tax Tools'
          subtitle='Quick calculators and explainers built on current HMRC rates. No signup.'
        />

        <section className={cn('py-12 md:py-20', 'pt-0 md:pt-0')}>
          <div className={'container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'}>
            <div className='grid gap-4 md:grid-cols-2'>
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href as Route}
                  data-testid={`tools-link-${tool.href.split('/').pop()}`}
                  className='group block h-full'
                >
                  <Card
                    className={cn(
                      'flex h-full flex-col justify-between rounded-sm border-border bg-card p-5 transition-colors',
                      'hover:border-primary/55',
                    )}
                  >
                    <div>
                      <h2
                        className={cn(
                          'font-display font-semibold text-foreground transition-colors group-hover:text-primary',
                          'text-xl',
                        )}
                      >
                        {tool.title}
                      </h2>
                      <p className={cn('mt-2 text-muted-foreground leading-relaxed', 'text-sm')}>
                        {tool.description}
                      </p>
                    </div>

                    <span
                      className={cn(
                        'mt-5 inline-flex items-center gap-1 whitespace-nowrap font-medium text-primary',
                        'text-sm',
                        'gap-1',
                      )}
                    >
                      Use Tool
                      <ArrowRight className='size-4' />
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className='border-border/60 border-y bg-card py-12 md:py-20'>
          <div className='container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
            <div className='mb-8 max-w-3xl'>
              <p className='mb-3 font-semibold text-primary text-xs uppercase tracking-[0.22em]'>
                Tool chooser
              </p>
              <h2 className='font-display font-semibold text-4xl text-foreground leading-tight'>
                Which PayeTax tool should I use?
              </h2>
              <p className='mt-4 text-muted-foreground leading-relaxed'>
                Use the main PAYE calculator when you want a fast take-home estimate from salary.
                Use the specialist tools when a single part of the calculation needs more context:
                director extraction, Scottish bands, National Insurance, Marriage Allowance, or an
                HMRC tax code.
              </p>
            </div>

            <div className='overflow-x-auto rounded-sm border border-border bg-background'>
              <table className='w-full min-w-[760px] border-collapse text-left text-sm'>
                <caption className='sr-only'>PayeTax tool chooser by use case</caption>
                <thead>
                  <tr className='border-border/60 border-b bg-card'>
                    <th className='px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                      Use case
                    </th>
                    <th className='px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                      Tool
                    </th>
                    <th className='px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                      Includes
                    </th>
                    <th className='px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                      Does not cover
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {toolGuideRows.map((row) => (
                    <tr
                      key={row.useCase}
                      className='border-border/50 border-b align-top last:border-b-0'
                    >
                      <th scope='row' className='px-4 py-4 font-semibold text-foreground'>
                        {row.useCase}
                      </th>
                      <td className='px-4 py-4'>
                        <Link
                          href={row.href as Route}
                          className='inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80'
                        >
                          {row.tool}
                          <ArrowRight className='size-3' aria-hidden='true' />
                        </Link>
                      </td>
                      <td className='px-4 py-4 text-muted-foreground leading-relaxed'>
                        {row.includes}
                      </td>
                      <td className='px-4 py-4 text-muted-foreground leading-relaxed'>
                        {row.excludes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className='py-12 md:py-20'>
          <div className='container mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] lg:px-8'>
            <div>
              <p className='mb-3 font-semibold text-primary text-xs uppercase tracking-[0.22em]'>
                Coverage
              </p>
              <h2 className='font-display font-semibold text-4xl text-foreground leading-tight'>
                Current coverage and limits
              </h2>
              <p className='mt-4 text-muted-foreground leading-relaxed'>
                PayeTax keeps the public toolset intentionally narrow. It covers common PAYE-style
                salary calculations and focused UK tax questions, with source and limitation notes
                linked from the Compliance page.
              </p>
              <ul className='mt-6 space-y-3 text-muted-foreground text-sm leading-relaxed'>
                <li>
                  <span className='font-medium text-foreground'>Tax year:</span>{' '}
                  {CURRENT_TAX_YEAR_DISPLAY_SHORT} rates and thresholds for the retained
                  calculators.
                </li>
                <li>
                  <span className='font-medium text-foreground'>Regions:</span> England, Wales,
                  Northern Ireland, and Scotland where the tool supports regional income tax.
                </li>
                <li>
                  <span className='font-medium text-foreground'>Privacy:</span> salary exploration
                  runs in-browser; emailed results are optional.
                </li>
                <li>
                  <span className='font-medium text-foreground'>Limits:</span> illustrative only,
                  not payroll, tax, legal, or financial advice.
                </li>
              </ul>
            </div>

            <div className='border-border border-y'>
              {toolsFaq.map((item) => (
                <article
                  key={item.question}
                  className='border-border border-b py-5 last:border-b-0'
                >
                  <h3 className='font-semibold text-foreground text-lg'>{item.question}</h3>
                  <p className='mt-2 text-muted-foreground text-sm leading-relaxed'>
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
