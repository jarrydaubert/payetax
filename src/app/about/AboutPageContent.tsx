// src/app/about/AboutPageContent.tsx
// Server Component - presentational only, no hooks or handlers.

import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Code2,
  FileText,
  Gauge,
  Lock,
  Scale,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LAB_NOTES = [
  {
    eyebrow: 'Deterministic logic',
    title: 'There is a right answer',
    body: 'PAYE, NI, student loans, pension deductions, and tax codes can be checked against published thresholds and known payslip behaviour.',
    icon: Calculator,
  },
  {
    eyebrow: 'Edge cases',
    title: 'The awkward cases matter',
    body: 'The useful work is in the margins: tax-code variants, Scottish bands, student-loan combinations, Director scenarios, and threshold cliffs.',
    icon: Scale,
  },
  {
    eyebrow: 'Privacy',
    title: 'Salary exploration should stay quiet',
    body: 'Core calculator inputs run in the browser. Email results are opt-in, and production integrations are kept narrow.',
    icon: Lock,
  },
  {
    eyebrow: 'Operations',
    title: 'Public software needs guardrails',
    body: 'CI, Sentry, rate limiting, typed tests, and deploy checks are treated as part of the product, not as ceremony around it.',
    icon: ShieldCheck,
  },
];

const BUILD_RULES = [
  'Tax rates live in a controlled source of truth, then flow into calculators and tests.',
  'User-facing behaviour gets unit or E2E coverage when it can break silently.',
  'External services are kept purposeful: Brevo for result emails, Upstash for rate limiting, Sentry for calculator errors.',
  'Claims stay tied to implementation. If the app cannot prove something, the copy should not say it.',
];

const PROOF_LINKS = [
  {
    title: 'Compliance and sources',
    body: 'HMRC and Revenue Scotland references, assumptions, and calculation limits.',
    href: '/compliance',
    icon: FileText,
  },
  {
    title: 'Director Intelligence',
    body: 'A more complex calculator for salary, dividends, Corporation Tax, and extraction strategy.',
    href: '/tools/director-guide',
    icon: Workflow,
  },
  {
    title: 'Tax guides',
    body: 'Plain-English explainers that connect tax concepts back to calculator behaviour.',
    href: '/blog',
    icon: Code2,
  },
] as const;

export function AboutPageContent() {
  return (
    <main className='min-h-screen bg-background bg-ledger-grid'>
      <section className='border-border/70 border-b pt-24 pb-14 md:pt-28 md:pb-20'>
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.72fr)] lg:items-end'>
            <div className='min-w-0'>
              <p className='mb-4 font-semibold text-primary text-xs uppercase tracking-[0.32em]'>
                About PayeTax
              </p>
              <h1 className='max-w-4xl font-display font-semibold text-5xl text-foreground leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl'>
                A UK tax calculator built as a working test lab.
              </h1>
              <p className='mt-6 max-w-2xl text-foreground/75 text-lg leading-8'>
                PayeTax is Jarryd Aubert&apos;s R&amp;D project for deterministic tax calculation,
                edge-case handling, deployment hygiene, and clear public documentation. The useful
                output is not just the number. It is being able to explain why the number changed.
              </p>
              <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
                <Button asChild size='touch' className='rounded-sm px-6'>
                  <Link href='/'>
                    Open calculator
                    <ArrowRight className='size-4' aria-hidden='true' />
                  </Link>
                </Button>
                <Button asChild size='touch' variant='outline' className='rounded-sm bg-card px-6'>
                  <Link href='/compliance'>View sources</Link>
                </Button>
              </div>
            </div>

            <aside className='min-w-0 border border-border bg-card p-5 sm:p-6'>
              <p className='font-semibold text-primary text-xs uppercase tracking-[0.28em]'>
                Project boundary
              </p>
              <div className='mt-5 grid gap-5'>
                <div>
                  <h2 className='font-display font-semibold text-2xl text-foreground'>
                    What it is
                  </h2>
                  <p className='mt-2 text-foreground/75 text-sm leading-6'>
                    A public calculator and engineering surface for testing known tax rules, awkward
                    inputs, and production quality controls.
                  </p>
                </div>
                <div className='border-border border-t pt-5'>
                  <h2 className='font-display font-semibold text-2xl text-foreground'>
                    What it is not
                  </h2>
                  <p className='mt-2 text-foreground/75 text-sm leading-6'>
                    Not financial advice, not a lead-generation funnel, and not a replacement for a
                    qualified accountant when your situation needs one.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className='border-border/70 border-b py-12 md:py-16'>
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='grid gap-px overflow-hidden border border-border bg-border md:grid-cols-4'>
            {LAB_NOTES.map((note) => {
              const Icon = note.icon;
              return (
                <article key={note.title} className='min-w-0 bg-card p-5 sm:p-6'>
                  <Icon className='mb-6 size-5 text-primary' aria-hidden='true' />
                  <p className='font-semibold text-primary text-xs uppercase tracking-[0.24em]'>
                    {note.eyebrow}
                  </p>
                  <h2 className='mt-3 font-display font-semibold text-2xl text-foreground leading-tight'>
                    {note.title}
                  </h2>
                  <p className='mt-3 text-foreground/70 text-sm leading-6'>{note.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className='border-border/70 border-b py-14 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]'>
            <div>
              <p className='font-semibold text-primary text-xs uppercase tracking-[0.32em]'>
                How it is built
              </p>
              <h2 className='mt-4 max-w-xl font-display font-semibold text-4xl text-foreground leading-tight md:text-5xl'>
                Boring controls on purpose.
              </h2>
              <p className='mt-5 max-w-xl text-foreground/75 leading-7'>
                PayeTax is intentionally small in product scope and strict in engineering scope. The
                aim is to keep the calculator easy to use while making the hard-to-see parts
                observable, testable, and repeatable.
              </p>
            </div>

            <div className='min-w-0 border border-border bg-card'>
              {BUILD_RULES.map((rule, index) => (
                <div
                  key={rule}
                  className={cn(
                    'grid gap-4 border-border p-5 sm:grid-cols-[3rem_1fr] sm:p-6',
                    index !== BUILD_RULES.length - 1 && 'border-b',
                  )}
                >
                  <span className='flex size-10 items-center justify-center border border-primary/35 bg-background font-mono text-primary text-sm'>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className='text-foreground/78 leading-7'>{rule}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className='py-14 md:py-20'>
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)]'>
            <div>
              <p className='font-semibold text-primary text-xs uppercase tracking-[0.32em]'>
                What to inspect
              </p>
              <h2 className='mt-4 font-display font-semibold text-4xl text-foreground leading-tight md:text-5xl'>
                The proof should be reachable.
              </h2>
              <div className='mt-8 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3'>
                {PROOF_LINKS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className='group min-w-0 bg-card p-5 transition-colors hover:bg-muted/35 focus:outline-none focus:ring-2 focus:ring-primary/60 sm:p-6'
                    >
                      <Icon className='size-5 text-primary' aria-hidden='true' />
                      <h3 className='mt-5 font-display font-semibold text-2xl text-foreground leading-tight'>
                        {item.title}
                      </h3>
                      <p className='mt-3 text-foreground/70 text-sm leading-6'>{item.body}</p>
                      <span className='mt-5 inline-flex items-center gap-2 font-medium text-primary text-sm'>
                        Open
                        <ArrowRight
                          className='size-4 transition-transform group-hover:translate-x-1'
                          aria-hidden='true'
                        />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <aside className='min-w-0 border border-primary/30 bg-card p-5 sm:p-6'>
              <Gauge className='size-5 text-primary' aria-hidden='true' />
              <h2 className='mt-5 font-display font-semibold text-3xl text-foreground leading-tight'>
                The standard is practical confidence.
              </h2>
              <p className='mt-4 text-foreground/75 leading-7'>
                The calculator should feel fast and calm, but it also has to survive real inputs,
                tax-year updates, email delivery failures, rate-limit pressure, and deploys.
              </p>
              <ul className='mt-6 space-y-3'>
                {[
                  'Official source links stay public.',
                  'Operational failures should be visible.',
                  'The page should explain limits before users trip over them.',
                ].map((item) => (
                  <li key={item} className='flex gap-3 text-foreground/78 text-sm leading-6'>
                    <CheckCircle2
                      className='mt-0.5 size-4 shrink-0 text-primary'
                      aria-hidden='true'
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

AboutPageContent.displayName = 'AboutPageContent';
