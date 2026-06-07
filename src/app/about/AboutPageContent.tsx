// src/app/about/AboutPageContent.tsx
// Server Component - presentational only, no hooks or handlers.

import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  Shield,
  Sparkles,
  Workflow,
} from 'lucide-react';
import Link from 'next/link';
import { FeatureGrid } from '@/components/molecules/FeatureGrid';
import { PageHero } from '@/components/molecules/PageHero';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { StatsGrid } from '@/components/molecules/StatsGrid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ABOUT_BUILD_PROMISES,
  ABOUT_COMPARISON_ROWS,
  ABOUT_HERO_STATS,
  ABOUT_OPERATING_RULES,
  ABOUT_TRUST_PILLARS,
} from '@/constants/pages/aboutPageData';

export function AboutPageContent() {
  return (
    <div className='min-h-screen'>
      {/* Hero */}
      <PageHero
        badge={{ icon: Sparkles, text: 'About PayeTax' }}
        title='Trust your numbers without trading your privacy'
        subtitle='PayeTax exists because salary tools should answer real tax questions quickly and clearly, not funnel you into ads, upsells, or data-extraction loops.'
      />

      {/* Hero actions + stats */}
      <section className='border-border/40 border-b py-12 md:py-16'>
        <div className='container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto flex w-full max-w-2xl flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center'>
            <Button
              asChild
              size='touch'
              className='w-full rounded-sm px-5 sm:w-auto sm:min-w-[12rem]'
            >
              <Link href='/'>
                Open Calculator
                <ArrowRight className='size-4' aria-hidden='true' />
              </Link>
            </Button>
            <Button
              asChild
              size='touch'
              variant='outline'
              className='w-full rounded-sm bg-card px-5 sm:w-auto sm:min-w-[12rem]'
            >
              <Link href='/compliance'>
                Compliance & Sources
                <FileText className='size-4' aria-hidden='true' />
              </Link>
            </Button>
            <Button
              asChild
              size='touch'
              variant='outline'
              className='w-full rounded-sm bg-card px-5 sm:w-auto sm:min-w-[12rem]'
            >
              <Link href='/install'>
                Install App
                <Download className='size-4' aria-hidden='true' />
              </Link>
            </Button>
          </div>

          <div className='mt-12'>
            <StatsGrid stats={ABOUT_HERO_STATS} columns={4} variant='elevated' />
          </div>
        </div>
      </section>

      {/* Why we exist + non-negotiables */}
      <section className='border-border/40 border-b py-12 md:py-20'>
        <div className='container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
          <div className='grid gap-8 lg:grid-cols-[1.2fr_1fr]'>
            <div>
              <Badge variant='outline' className='mb-4 border-success/40 text-success'>
                Why We Exist
              </Badge>
              <h2 className='font-display font-semibold text-3xl text-foreground leading-tight md:text-4xl'>
                A tax calculator should reduce stress, not create more of it
              </h2>
              <div className='mt-5 space-y-4 text-muted-foreground leading-relaxed'>
                <p>
                  Most people do not need more financial noise. They need a reliable answer they can
                  explain to themselves and act on.
                </p>
                <p>
                  PayeTax is designed around that principle: fast calculations, understandable
                  breakdowns, and a privacy posture that aligns with user trust.
                </p>
                <p>
                  If we ever have to choose between growth tricks and user confidence, we pick user
                  confidence.
                </p>
              </div>
            </div>

            <Card className='rounded-sm border-success/30 bg-card p-6'>
              <h3 className='font-display font-semibold text-foreground text-lg'>
                Non-negotiables
              </h3>
              <ul className='mt-4 space-y-4'>
                {ABOUT_OPERATING_RULES.map((rule) => {
                  const Icon = rule.icon;
                  return (
                    <li key={rule.title} className='flex items-start gap-3'>
                      <span className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-sm bg-success/20'>
                        <Icon className='size-4 text-success' aria-hidden='true' />
                      </span>
                      <div>
                        <p className='font-medium text-foreground'>{rule.title}</p>
                        <p className='mt-1 text-muted-foreground text-sm leading-relaxed'>
                          {rule.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust pillars */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
          <FeatureGrid
            heading={{
              badge: { text: 'Trust, Explained' },
              title: 'Proof, not just positioning',
              subtitle:
                'The point is not to sound privacy-friendly. The point is to make trustworthy behaviour the default.',
              align: 'center',
            }}
            features={ABOUT_TRUST_PILLARS}
            columns={3}
            variant='showcase'
          />
        </div>
      </section>

      {/* Comparison */}
      <section className='border-border/70 border-y bg-ledger-grid py-14 md:py-20'>
        <div className='container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
          <SectionHeading badge={{ text: 'Comparison' }} title='How PayeTax differs in practice' />

          <section
            className='overflow-x-auto rounded-sm border border-border bg-card'
            aria-label='PayeTax comparison table'
          >
            <table className='w-full min-w-3xl border-collapse'>
              <thead>
                <tr className='border-border/60 border-b text-left'>
                  <th className='px-5 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                    Area
                  </th>
                  <th className='px-5 py-4 font-semibold text-primary text-xs uppercase tracking-wider'>
                    PayeTax
                  </th>
                  <th className='px-5 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                    Typical experience
                  </th>
                </tr>
              </thead>
              <tbody>
                {ABOUT_COMPARISON_ROWS.map((row) => (
                  <tr key={row.topic} className='border-border/40 border-b align-top last:border-0'>
                    <td className='px-5 py-4 font-semibold text-foreground text-sm'>{row.topic}</td>
                    <td className='px-5 py-4 text-foreground text-sm leading-relaxed'>
                      {row.payeTax}
                    </td>
                    <td className='px-5 py-4 text-muted-foreground text-sm leading-relaxed'>
                      {row.typical}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </section>

      {/* Build standards + bio */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
          <div className='grid gap-8 lg:grid-cols-[1fr_1.1fr]'>
            <Card className='rounded-sm border-border bg-card p-6'>
              <Badge variant='outline' className='mb-4 border-success/35 text-success'>
                Build Standards
              </Badge>
              <ul className='space-y-3'>
                {ABOUT_BUILD_PROMISES.map((promise) => (
                  <li key={promise} className='flex items-start gap-3'>
                    <CheckCircle2
                      className='mt-0.5 size-4 shrink-0 text-success'
                      aria-hidden='true'
                    />
                    <span className='text-muted-foreground text-sm leading-relaxed'>{promise}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className='rounded-sm border-primary/25 bg-card p-6'>
              <Badge
                variant='outline'
                className='mb-4 rounded-sm border-primary/35 bg-background text-primary'
              >
                From Jarryd
              </Badge>
              <h3 className='font-display font-semibold text-2xl text-foreground tracking-tight'>
                I built the tool I wished existed
              </h3>
              <p className='mt-4 text-muted-foreground leading-relaxed'>
                I kept running into salary calculators that were hard to trust or painful to use.
                PayeTax started as a practical fix for that: fast numbers, transparent assumptions,
                and no games.
              </p>
              <p className='mt-4 text-muted-foreground leading-relaxed'>
                The goal is simple: give people enough clarity to make better pay decisions without
                needing an accounting background.
              </p>
              <ul className='mt-4 space-y-2 text-muted-foreground text-sm leading-relaxed'>
                <li>Built and maintains the PAYE engine used across PayeTax calculators.</li>
                <li>
                  Verifies tax-year updates against official HMRC and Revenue Scotland sources.
                </li>
                <li>Uses automated unit and end-to-end checks before production releases.</li>
              </ul>
              <div className='mt-6 flex flex-wrap gap-3'>
                <Button asChild variant='outline' className='rounded-sm bg-card'>
                  <Link href='/install'>
                    <Workflow className='size-4' aria-hidden='true' />
                    Install PayeTax
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className='pb-24'>
        <div className='container mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8'>
          <h2 className='font-display font-semibold text-3xl text-foreground tracking-tight'>
            Ready to pressure-test your next pay decision?
          </h2>
          <p className='mt-3 text-muted-foreground'>
            Use the calculator, compare outcomes, and keep control of your data.
          </p>
          <div className='mt-6 flex flex-col justify-center gap-3 sm:flex-row'>
            <Button asChild size='touch' className='rounded-sm px-6'>
              <Link href='/'>
                Start Calculating
                <ArrowRight className='size-4' aria-hidden='true' />
              </Link>
            </Button>
            <Button
              asChild
              size='touch'
              variant='outline'
              className='rounded-sm border-border bg-card px-6 hover:border-primary/45'
            >
              <Link href='/privacy'>
                Privacy Details
                <Shield className='size-4' aria-hidden='true' />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

AboutPageContent.displayName = 'AboutPageContent';
