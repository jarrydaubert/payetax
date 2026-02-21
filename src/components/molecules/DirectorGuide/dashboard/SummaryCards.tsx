/**
 * Summary Cards - Top row of key financial metrics
 *
 * Shows monthly take-home, annual salary, dividends, and corporation tax.
 * Values come from either the slider scenario or selected strategy.
 */
'use client';

import { GradientText } from '@/components/atoms/GradientText';
import { useActiveDirectorScenario } from '@/components/molecules/DirectorGuide/calculator/useActiveDirectorScenario';
import { cn } from '@/lib/utils';
import { useDirectorFormValue, useMonthlyModeOutput } from '@/store/directorGuideStore';

interface SummaryCardsProps {
  className?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function SummaryCards({ className }: SummaryCardsProps) {
  const { activeScenario } = useActiveDirectorScenario();
  const mode = useDirectorFormValue((state) => state.mode);
  const monthlyModeOutput = useMonthlyModeOutput();
  const isMonthlyMode = mode === 'monthly';

  const hasResults = activeScenario !== null;
  const monthlyDrawAmount = hasResults
    ? isMonthlyMode && monthlyModeOutput
      ? monthlyModeOutput.safeMonthlyDraw
      : activeScenario.takeHome / 12
    : null;
  const monthlyDrawLabel = monthlyDrawAmount === null ? '—' : formatCurrency(monthlyDrawAmount);

  // Calculate net dividends for display (gross dividends - dividend tax)
  const netDividends = hasResults ? activeScenario.dividends - activeScenario.dividendTax : 0;

  const cards = [
    {
      label: 'Safe Monthly Draw',
      value: monthlyDrawLabel,
      subtext: isMonthlyMode
        ? 'Cash-aware + tax-aware (projection)'
        : 'After all taxes (illustrative)',
      highlight: true,
      ariaDescription: hasResults
        ? `Monthly safe draw of ${monthlyDrawLabel}`
        : 'No results available',
    },
    {
      label: 'Annual Salary',
      value: hasResults ? formatCurrency(activeScenario.salary) : '—',
      subtext: 'Gross via PAYE',
      ariaDescription: hasResults
        ? `Annual gross salary of ${formatCurrency(activeScenario.salary)} paid via PAYE`
        : 'No results available',
    },
    {
      label: 'Annual Dividends',
      value: hasResults ? formatCurrency(activeScenario.dividends) : '—',
      subtext: `Gross declared${hasResults && activeScenario.dividendTax > 0 ? ` (${formatCurrency(netDividends)} after tax)` : ''}`,
      ariaDescription: hasResults
        ? `Annual gross dividends of ${formatCurrency(activeScenario.dividends)}${activeScenario.dividendTax > 0 ? `, ${formatCurrency(netDividends)} after dividend tax` : ''}`
        : 'No results available',
    },
    {
      label: 'Corporation Tax',
      value: hasResults ? formatCurrency(activeScenario.corporationTax) : '—',
      subtext: 'To set aside for HMRC',
      ariaDescription: hasResults
        ? `Corporation tax of ${formatCurrency(activeScenario.corporationTax)} to set aside`
        : 'No results available',
    },
  ];

  return (
    <section
      className={cn('grid grid-cols-4 gap-4 max-sm:grid-cols-1 max-lg:grid-cols-2', className)}
      aria-label='Financial summary'
    >
      {cards.map((card) => (
        <SummaryCard key={card.label} {...card} isEmpty={!hasResults} />
      ))}
    </section>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  subtext: string;
  highlight?: boolean;
  isEmpty?: boolean;
  ariaDescription: string;
}

function SummaryCard({
  label,
  value,
  subtext,
  highlight,
  isEmpty,
  ariaDescription,
}: SummaryCardProps) {
  return (
    <article
      className={cn(
        'rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-border/80',
        highlight && !isEmpty && 'border-primary/30 bg-gradient-to-br from-primary/10 to-success/5',
      )}
      aria-label={ariaDescription}
    >
      <div className='mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wider'>
        {label}
      </div>
      <div
        className={cn(
          'mb-1 font-semibold text-3xl tracking-tight',
          !highlight && 'text-foreground',
          isEmpty && 'text-muted-foreground/60',
        )}
      >
        {highlight && !isEmpty ? (
          <GradientText variant='custom' className='bg-gradient-to-r from-primary to-success'>
            {value}
          </GradientText>
        ) : (
          value
        )}
      </div>
      <div className={cn('text-muted-foreground text-xs', isEmpty && 'text-muted-foreground/60')}>
        {subtext}
      </div>
    </article>
  );
}
