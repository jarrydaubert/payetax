/**
 * Summary Cards - Top row of key financial metrics
 *
 * Shows monthly take-home, annual salary, dividends, and corporation tax.
 * Values come from either the slider scenario or selected strategy.
 */
'use client';

import { useActiveDirectorScenario } from '@/components/molecules/DirectorGuide/calculator/useActiveDirectorScenario';
import { cn, formatCurrency } from '@/lib/utils';
import { useDirectorFormValue, useMonthlyModeOutput } from '@/store/directorGuideStore';

interface SummaryCardsProps {
  className?: string;
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
  const monthlyDrawLabel = monthlyDrawAmount === null ? '—' : formatCurrency(monthlyDrawAmount, 0);

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
      value: hasResults ? formatCurrency(activeScenario.salary, 0) : '—',
      subtext: 'Gross via PAYE',
      ariaDescription: hasResults
        ? `Annual gross salary of ${formatCurrency(activeScenario.salary, 0)} paid via PAYE`
        : 'No results available',
    },
    {
      label: 'Annual Dividends',
      value: hasResults ? formatCurrency(activeScenario.dividends, 0) : '—',
      subtext: `Gross declared${hasResults && activeScenario.dividendTax > 0 ? ` (${formatCurrency(netDividends, 0)} after tax)` : ''}`,
      ariaDescription: hasResults
        ? `Annual gross dividends of ${formatCurrency(activeScenario.dividends, 0)}${activeScenario.dividendTax > 0 ? `, ${formatCurrency(netDividends, 0)} after dividend tax` : ''}`
        : 'No results available',
    },
    {
      label: 'Corporation Tax',
      value: hasResults ? formatCurrency(activeScenario.corporationTax, 0) : '—',
      subtext: 'To set aside for HMRC',
      ariaDescription: hasResults
        ? `Corporation tax of ${formatCurrency(activeScenario.corporationTax, 0)} to set aside`
        : 'No results available',
    },
  ];

  return (
    <section
      className={cn(
        'grid grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))] gap-4',
        className,
      )}
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
        'min-w-0 rounded-sm border border-border bg-card p-5 transition-colors hover:border-primary/35',
        highlight && !isEmpty && 'border-primary/35 bg-card',
      )}
      aria-label={ariaDescription}
    >
      <div className='mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wider'>
        {label}
      </div>
      <div
        className={cn(
          'mb-1 break-words font-mono font-semibold text-2xl tracking-tight sm:text-3xl',
          !highlight && 'text-foreground',
          highlight && !isEmpty && 'text-primary',
          isEmpty && 'text-muted-foreground/60',
        )}
      >
        {value}
      </div>
      <div className={cn('text-muted-foreground text-xs', isEmpty && 'text-muted-foreground/60')}>
        {subtext}
      </div>
    </article>
  );
}
