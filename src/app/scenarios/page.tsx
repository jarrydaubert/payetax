// src/app/scenarios/page.tsx
/**
 * Scenario Hub Index Page
 *
 * Lists all tax scenarios organized by category.
 * Each scenario links to a detailed page with pre-filled calculations.
 */

import { ArrowRight, Calculator } from 'lucide-react';
import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ICON_SIZES, LAYOUT, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import {
  getScenariosByCategory,
  SCENARIO_CATEGORIES,
  SCENARIOS,
  type Scenario,
  type ScenarioCategoryInfo,
} from '@/data/scenarios';
import { generateMetadata as generateMetadataHelper } from '@/lib/metadata';
import { cn } from '@/lib/utils';

// Display format for tax year - update when TAX_YEARS changes in taxRates.ts
const CURRENT_TAX_YEAR_DISPLAY = '2025-26';

export const metadata: Metadata = generateMetadataHelper({
  title: 'Tax Scenarios & Calculators | UK Tax Planning Guides',
  description:
    'Explore real UK tax scenarios with pre-calculated examples. Learn how to optimize your tax for £100k+ salaries, student loans, Scottish tax, and more.',
  keywords:
    '100k tax trap, student loan calculator, scottish tax calculator, uk tax scenarios, pension optimization, tax planning uk',
  pathname: '/scenarios',
});

// Static page - revalidate daily
export const revalidate = 86400;

/**
 * Category-specific styling
 */
const categoryStyles: Record<string, { gradient: string; icon: string; border: string }> = {
  'tax-trap': {
    gradient: 'from-amber-500/20 to-orange-500/20',
    icon: '🎯',
    border: 'border-amber-500/30 hover:border-amber-500/50',
  },
  'student-loan': {
    gradient: 'from-blue-500/20 to-cyan-500/20',
    icon: '🎓',
    border: 'border-blue-500/30 hover:border-blue-500/50',
  },
  scottish: {
    gradient: 'from-purple-500/20 to-indigo-500/20',
    icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    border: 'border-purple-500/30 hover:border-purple-500/50',
  },
  'life-stage': {
    gradient: 'from-green-500/20 to-emerald-500/20',
    icon: '📈',
    border: 'border-green-500/30 hover:border-green-500/50',
  },
};

export default function ScenariosPage() {
  return (
    <div className='min-h-dvh bg-background'>
      {/* Hero Section */}
      <section className='relative overflow-hidden py-16 sm:py-24'>
        <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5' />
        <div className={cn(LAYOUT.CONTAINER, 'relative')}>
          <div className='mx-auto max-w-3xl text-center'>
            <h1
              className={cn(
                TYPOGRAPHY.TEXT_4XL,
                'sm:text-5xl',
                'font-bold tracking-tight',
                SPACING.MB_4,
              )}
            >
              <span className='bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text text-transparent'>
                Tax Scenarios
              </span>
            </h1>
            <p className={cn(TYPOGRAPHY.TEXT_LG, 'text-muted-foreground', SPACING.MB_8)}>
              Real UK tax situations with pre-calculated examples. Find your scenario, see the
              numbers, and learn how to optimize your tax.
            </p>

            {/* Quick Stats */}
            <div className={cn('grid grid-cols-3', SPACING.GAP_4, 'mx-auto max-w-lg')}>
              <QuickStat value={SCENARIOS.length.toString()} label='Scenarios' />
              <QuickStat value='£100k-£500k' label='Salary Range' />
              <QuickStat value={CURRENT_TAX_YEAR_DISPLAY} label='Tax Year' />
            </div>
          </div>
        </div>
      </section>

      {/* Scenario Categories */}
      <section className={cn(LAYOUT.CONTAINER, SPACING.PY_12)}>
        <div className={SPACING.SPACE_Y_16}>
          {SCENARIO_CATEGORIES.map((category) => (
            <CategorySection key={category.slug} category={category} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className='bg-muted/30 py-16'>
        <div className={cn(LAYOUT.CONTAINER, 'text-center')}>
          <Calculator className={cn(ICON_SIZES.SIZE_12, 'mx-auto mb-4 text-primary')} />
          <h2 className={cn(TYPOGRAPHY.TEXT_2XL, 'font-bold', SPACING.MB_3)}>
            Can't Find Your Scenario?
          </h2>
          <p className={cn(TYPOGRAPHY.TEXT_BASE, 'text-muted-foreground', SPACING.MB_6)}>
            Use our full calculator to enter your exact details and get a personalized breakdown.
          </p>
          <Link
            href='/#calculator'
            className={cn(
              'inline-flex items-center',
              SPACING.GAP_2,
              'rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground',
              'transition-colors hover:bg-primary/90',
            )}
          >
            Open Calculator
            <ArrowRight className='size-4' />
          </Link>
        </div>
      </section>
    </div>
  );
}

/**
 * Quick stat display
 */
function QuickStat({ value, label }: { value: string; label: string }) {
  return (
    <div className='text-center'>
      <p className={cn(TYPOGRAPHY.TEXT_2XL, 'font-bold text-primary')}>{value}</p>
      <p className={cn(TYPOGRAPHY.TEXT_SM, 'text-muted-foreground')}>{label}</p>
    </div>
  );
}

/**
 * Default category styles
 */
const defaultStyles = {
  gradient: 'from-green-500/20 to-emerald-500/20',
  icon: '📈',
  border: 'border-green-500/30 hover:border-green-500/50',
};

/**
 * Category section with scenarios
 */
function CategorySection({ category }: { category: ScenarioCategoryInfo }) {
  const scenarios = getScenariosByCategory(category.slug);
  const styles = categoryStyles[category.slug] ?? defaultStyles;

  if (scenarios.length === 0) return null;

  return (
    <div>
      {/* Category Header */}
      <div className={cn('flex items-center', SPACING.GAP_3, SPACING.MB_6)}>
        <span className='text-3xl' aria-hidden='true'>
          {styles.icon}
        </span>
        <div>
          <h2 className={cn(TYPOGRAPHY.TEXT_2XL, 'font-bold')}>{category.name}</h2>
          <p className={cn(TYPOGRAPHY.TEXT_SM, 'text-muted-foreground')}>{category.description}</p>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3')}>
        {scenarios.map((scenario) => (
          <ScenarioCard key={scenario.slug} scenario={scenario} styles={styles} />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual scenario card
 */
function ScenarioCard({
  scenario,
  styles,
}: {
  scenario: Scenario;
  styles: { gradient: string; border: string };
}) {
  const formattedSalary = scenario.salary.toLocaleString('en-GB');

  return (
    <Link href={`/scenarios/${scenario.slug}` as Route}>
      <Card
        className={cn(
          'group relative overflow-hidden transition-all duration-200',
          'hover:-translate-y-0.5 hover:shadow-lg',
          styles.border,
          SPACING.P_0,
        )}
      >
        {/* Gradient background */}
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', styles.gradient)} />

        {/* Content */}
        <div className={cn('relative', SPACING.P_4, 'sm:p-5')}>
          {/* Salary Badge */}
          <div
            className={cn(
              'inline-flex items-center rounded-full bg-background/80 px-3 py-1',
              TYPOGRAPHY.TEXT_SM,
              'font-semibold',
              SPACING.MB_3,
            )}
          >
            £{formattedSalary}
          </div>

          {/* Title */}
          <h3 className={cn(TYPOGRAPHY.TEXT_BASE, 'font-semibold leading-tight', SPACING.MB_2)}>
            {scenario.title.replace(/^£[\d,]+k?\s+/i, '').trim()}
          </h3>

          {/* Description */}
          <p className={cn(TYPOGRAPHY.TEXT_SM, 'line-clamp-2 text-muted-foreground')}>
            {scenario.description}
          </p>

          {/* Arrow indicator */}
          <div
            className={cn(
              'absolute right-4 bottom-4 text-muted-foreground',
              'transition-transform group-hover:translate-x-1',
            )}
          >
            <ArrowRight className='size-4' />
          </div>
        </div>

        {/* High priority indicator */}
        {scenario.highPriority && (
          <div className='absolute top-0 right-0'>
            <div
              className={cn(
                'bg-primary/90 text-primary-foreground',
                'px-2 py-0.5 font-medium text-xs',
                'rounded-bl-lg',
              )}
            >
              Popular
            </div>
          </div>
        )}
      </Card>
    </Link>
  );
}
