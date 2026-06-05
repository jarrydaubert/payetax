/**
 * StatsGrid Component
 *
 * Displays a responsive grid of stat/metric cards.
 * Used across about, privacy, compliance pages for showcasing key metrics.
 *
 * @module components/molecules/StatsGrid
 */

import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';
import type { StatData } from '@/lib/validation/pageDataValidation';

/**
 * Individual stat item interface
 * Matches StatSchema from validation
 */
export interface Stat extends Omit<StatData, 'icon'> {
  icon: LucideIcon;
}

/**
 * StatsGrid component props
 */
export interface StatsGridProps {
  /** Array of stats to display */
  stats: Stat[];
  /** Number of columns in grid (responsive) */
  columns?: 2 | 3 | 4;
  /** Visual variant */
  variant?: 'default' | 'elevated' | 'bordered';
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * StatsGrid displays a responsive grid of stat cards
 *
 * Features:
 * - Responsive grid layout (1-4 columns)
 * - Design token usage for consistency
 * - Icon support
 * - Multiple visual variants
 * - Accessible markup
 *
 * @example
 * ```tsx
 * import { Calculator, Lock, Zap } from 'lucide-react';
 * import { StatsGrid } from '@/components/molecules/StatsGrid';
 *
 * const stats = [
 *   { icon: Calculator, value: '100%', label: 'Free Forever' },
 *   { icon: Lock, value: '0', label: 'Data Stored' },
 *   { icon: Zap, value: '<300kB', label: 'Bundle Size' },
 * ];
 *
 * <StatsGrid stats={stats} columns={3} variant="elevated" />
 * ```
 */
export function StatsGrid({ stats, columns = 3, variant = 'default', className }: StatsGridProps) {
  const gridClasses = cn(
    'grid gap-6',
    {
      'grid-cols-1 md:grid-cols-2': columns === 2,
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': columns === 3,
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-4': columns === 4,
    },
    className,
  );

  return (
    <ul className={gridClasses} aria-label='Statistics'>
      {stats.map((stat) => (
        <li key={`${stat.label}-${stat.value}`} className='list-none'>
          <StatCard stat={stat} variant={variant} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Individual stat card component
 */
interface StatCardProps {
  stat: Stat;
  variant: 'default' | 'elevated' | 'bordered';
}

function StatCard({ stat, variant }: StatCardProps) {
  const { icon: Icon, value, label, description } = stat;

  const cardClasses = cn('h-full rounded-sm border-border bg-card transition-colors', {
    'hover:border-primary/45': variant === 'elevated',
    'border-2': variant === 'bordered',
  });

  const iconClasses =
    'mb-4 flex h-12 w-12 items-center justify-center rounded-sm border border-primary/25 bg-background text-primary';

  return (
    <Card className={cardClasses}>
      <CardContent className={cn('flex flex-col items-center text-center', SPACING.P_6)}>
        {/* Icon */}
        <div className={iconClasses} aria-hidden='true'>
          <Icon className='h-6 w-6' />
        </div>

        {/* Value */}
        <div
          className={cn(
            TYPOGRAPHY.TEXT_3XL,
            'mb-2 font-mono font-semibold text-foreground tracking-tight',
          )}
        >
          {value}
        </div>

        {/* Label */}
        <div className={cn(TYPOGRAPHY.TEXT_LG, 'font-semibold text-foreground', SPACING.MB_2)}>
          {label}
        </div>

        {/* Optional Description */}
        {description && (
          <p className={cn(TYPOGRAPHY.TEXT_SM, 'text-muted-foreground')}>{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

StatsGrid.displayName = 'StatsGrid';
