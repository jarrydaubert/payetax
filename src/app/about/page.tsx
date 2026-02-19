import { ArrowRight, CheckCircle2, FileText, Shield, Sparkles, Workflow } from 'lucide-react';
import Link from 'next/link';
import { GradientText } from '@/components/atoms/GradientText';
import { FeedbackDialog } from '@/components/organisms/FeedbackDialog';
import { NewsletterCTA } from '@/components/organisms/NewsletterCTA';
import { StructuredData } from '@/components/organisms/StructuredData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LAYOUT, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import {
  ABOUT_BUILD_PROMISES,
  ABOUT_COMPARISON_ROWS,
  ABOUT_HERO_STATS,
  ABOUT_OPERATING_RULES,
  ABOUT_TRUST_PILLARS,
} from '@/constants/pages/aboutPageData';
import { SITE_URL } from '@/lib/metadata';
import { cn } from '@/lib/utils';

export default function AboutPage() {
  return (
    <div className='relative overflow-hidden'>
      <StructuredData
        type='person'
        expert={{
          name: 'Jarryd',
          jobTitle: 'Creator & Developer',
          description: 'Creator of PayeTax, building privacy-first tax tools for UK taxpayers.',
          organization: 'PayeTax',
        }}
      />
      <StructuredData
        type='breadcrumb'
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: 'About', url: `${SITE_URL}/about` },
        ]}
      />

      <section className='border-border/40 border-b py-24 md:py-28'>
        <div className={LAYOUT.CONTAINER_MD}>
          <div className='mx-auto max-w-4xl text-center'>
            <Badge className='mb-4 border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20'>
              <Sparkles className='mr-1.5 size-3.5' />
              About PayeTax
            </Badge>

            <h1 className='font-bold text-4xl text-foreground tracking-tight md:text-6xl'>
              Built to help you{' '}
              <GradientText variant='brand-full' as='span'>
                trust your numbers
              </GradientText>
              <br />
              without trading your privacy
            </h1>

            <p className='mx-auto mt-5 max-w-3xl text-lg text-muted-foreground leading-relaxed md:text-xl'>
              PayeTax exists because salary tools should answer real tax questions quickly and
              clearly, not funnel you into ads, upsells, or data extraction loops.
            </p>

            <div className='mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row'>
              <Button asChild size='touch' variant='brandOutline' className='rounded-xl px-6'>
                <Link href='/'>
                  Open Calculator
                  <ArrowRight className='size-4' />
                </Link>
              </Button>
              <Button
                asChild
                size='touch'
                variant='outline'
                className='rounded-xl border-border/70 bg-card/70 px-6 hover:bg-card'
              >
                <Link href='/compliance'>
                  Compliance & Sources
                  <FileText className='size-4' />
                </Link>
              </Button>
              <Button asChild size='touch' variant='brandOutline' className='rounded-xl px-6'>
                <Link href='/install'>Install App</Link>
              </Button>
            </div>
          </div>

          <div className='mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {ABOUT_HERO_STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.label}
                  className='border-border/50 bg-card/70 p-4 backdrop-blur-sm transition-colors hover:border-cyan-500/30'
                >
                  <div className='mb-3 flex items-center gap-3'>
                    <div
                      className={cn(
                        'flex size-10 items-center justify-center rounded-lg bg-gradient-to-br',
                        stat.color,
                      )}
                    >
                      <Icon className='size-5 text-white' />
                    </div>
                    <div className='font-semibold text-foreground text-xl'>{stat.value}</div>
                  </div>
                  <p className='font-semibold text-foreground text-sm'>{stat.label}</p>
                  {stat.description && (
                    <p className='mt-1 text-muted-foreground text-xs leading-relaxed'>
                      {stat.description}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className={cn(LAYOUT.SECTION, 'border-border/40 border-b')}>
        <div className={LAYOUT.CONTAINER_MD}>
          <div className='grid gap-8 lg:grid-cols-[1.2fr_1fr]'>
            <div>
              <Badge variant='outline' className='mb-4 border-emerald-500/40 text-emerald-200'>
                Why We Exist
              </Badge>
              <h2 className='font-bold text-3xl text-foreground tracking-tight md:text-4xl'>
                A tax calculator should reduce stress,
                <br className='hidden md:block' />
                not create more of it
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

            <Card className='border-emerald-500/25 bg-emerald-500/10 p-6'>
              <h3 className='font-semibold text-emerald-100 text-lg'>Non-negotiables</h3>
              <ul className='mt-4 space-y-4'>
                {ABOUT_OPERATING_RULES.map((rule) => {
                  const Icon = rule.icon;
                  return (
                    <li key={rule.title} className='flex items-start gap-3'>
                      <span className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/20'>
                        <Icon className='size-4 text-emerald-300' />
                      </span>
                      <div>
                        <p className='font-medium text-emerald-100'>{rule.title}</p>
                        <p className='mt-1 text-emerald-100/80 text-sm leading-relaxed'>
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

      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER_MD}>
          <div className='text-center'>
            <Badge variant='outline' className='mb-4 border-cyan-500/35 text-cyan-200'>
              Trust, Explained
            </Badge>
            <h2 className='font-bold text-3xl text-foreground tracking-tight md:text-4xl'>
              Proof, not just positioning
            </h2>
            <p className='mx-auto mt-3 max-w-3xl text-muted-foreground'>
              The point is not to sound privacy-friendly. The point is to make trustworthy behavior
              the default system behavior.
            </p>
          </div>

          <div className='mt-10 grid gap-5 md:grid-cols-3'>
            {ABOUT_TRUST_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card
                  key={pillar.title}
                  className={cn(
                    'h-full rounded-2xl border p-5 transition-transform duration-200 hover:-translate-y-0.5',
                    pillar.gradient?.border,
                    pillar.gradient?.bg,
                  )}
                >
                  <div className='mb-4 flex items-center justify-between'>
                    <span className='rounded-md border border-white/10 bg-black/20 px-2 py-1 font-medium text-foreground text-xs'>
                      {pillar.metric}
                    </span>
                    <Icon className={cn('size-5', pillar.gradient?.icon || 'text-foreground')} />
                  </div>
                  <h3 className='font-semibold text-foreground text-lg'>{pillar.title}</h3>
                  <p className='mt-2 text-muted-foreground text-sm leading-relaxed'>
                    {pillar.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className='border-border/40 border-y bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5 py-14 md:py-20'>
        <div className={LAYOUT.CONTAINER_MD}>
          <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
            <div>
              <Badge variant='outline' className='border-cyan-500/35 text-cyan-200'>
                Comparison
              </Badge>
              <h2 className='mt-3 font-bold text-3xl text-foreground tracking-tight'>
                How PayeTax differs in practice
              </h2>
            </div>
          </div>

          <section
            className='overflow-x-auto rounded-2xl border border-border/60 bg-card/80 shadow-xl backdrop-blur-sm'
            aria-label='PayeTax comparison table'
          >
            <Link
              href='/compliance'
              className='sr-only focus:not-sr-only focus:absolute focus:m-2 focus:rounded-md focus:bg-card focus:px-2 focus:py-1 focus:text-xs'
            >
              Open compliance details
            </Link>
            <table className='w-full min-w-[780px] border-collapse'>
              <thead>
                <tr className='border-border/60 border-b text-left'>
                  <th className='px-5 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                    Area
                  </th>
                  <th className='px-5 py-4 font-semibold text-cyan-200 text-xs uppercase tracking-wider'>
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
                    <td className='px-5 py-4 text-cyan-50 text-sm leading-relaxed'>
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

      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER_MD}>
          <div className='grid gap-8 lg:grid-cols-[1fr_1.1fr]'>
            <Card className='border-border/60 bg-card/85 p-6'>
              <Badge variant='outline' className='mb-4 border-emerald-500/35 text-emerald-200'>
                Build Standards
              </Badge>
              <ul className='space-y-3'>
                {ABOUT_BUILD_PROMISES.map((promise) => (
                  <li key={promise} className='flex items-start gap-3'>
                    <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-400' />
                    <span className='text-muted-foreground text-sm leading-relaxed'>{promise}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className='rounded-2xl border-cyan-500/25 bg-gradient-to-br from-cyan-500/15 to-emerald-500/10 p-6'>
              <Badge className='mb-4 border-cyan-400/35 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/20'>
                From Jarryd
              </Badge>
              <h3 className='font-semibold text-2xl text-foreground tracking-tight'>
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
              <div className='mt-6 flex flex-wrap gap-3'>
                <FeedbackDialog
                  triggerLabel='Send feedback'
                  triggerVariant='outline'
                  triggerClassName='rounded-lg border-border/70 bg-card/70 hover:bg-card'
                />
                <Button asChild variant='brandOutline' className='rounded-lg'>
                  <Link href='/install'>
                    <Workflow className='size-4' />
                    Install PayeTax
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER_SM}>
          <NewsletterCTA
            title='Get UK Tax Updates by Email'
            description='HMRC changes, practical tax guides, and deadline reminders.'
          />
        </div>
      </section>

      <section className='pb-24'>
        <div className={cn(LAYOUT.CONTAINER_XS, LAYOUT.TEXT_CENTER)}>
          <h2 className={cn('font-bold text-foreground tracking-tight', TYPOGRAPHY.TEXT_3XL)}>
            Ready to pressure-test your next pay decision?
          </h2>
          <p className={cn(SPACING.MT_3, 'text-muted-foreground')}>
            Use the calculator, compare outcomes, and keep control of your data.
          </p>
          <div className='mt-6 flex flex-col justify-center gap-3 sm:flex-row'>
            <Button asChild size='touch' variant='brandOutline' className='rounded-xl px-6'>
              <Link href='/'>
                Start Calculating
                <ArrowRight className='size-4' />
              </Link>
            </Button>
            <Button
              asChild
              size='touch'
              variant='outline'
              className='rounded-xl border-border/70 bg-card/70 px-6 hover:bg-card'
            >
              <Link href='/privacy'>
                Privacy Details
                <Shield className='size-4' />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
