/**
 * StatsGrid Component
 *
 * Displays a responsive grid of stat/metric cards.
 * Used across about, privacy, compliance pages for showcasing key metrics.
 *
 * @module components/molecules/StatsGrid
 */

'use client';

import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/atoms/ui/card';
import { TYPOGRAPHY } from '@/constants/designTokens';
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
 * - Icon support with gradients
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
    className
  );

  return (
    <ul className={gridClasses} aria-label='Statistics'>
      {stats.map((stat, index) => (
        <li key={`stat-${index}-${stat.label}`} style={{ listStyle: 'none' }}>
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
  const { icon: Icon, value, label, description, color } = stat;

  const cardClasses = cn('h-full transition-all duration-300', {
    'hover:shadow-lg': variant === 'elevated',
    'border-2': variant === 'bordered',
    'bg-card/50 backdrop-blur-sm': variant === 'default',
  });

  const iconClasses = cn(
    'mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br',
    color || 'from-primary to-accent'
  );

  return (
    <Card className={cardClasses} role='listitem'>
      <CardContent className='flex flex-col items-center p-6 text-center'>
        {/* Icon */}
        <div className={iconClasses} aria-hidden='true'>
          <Icon className='h-6 w-6 text-white' />
        </div>

        {/* Value */}
        <div
          className={cn(
            TYPOGRAPHY.TEXT_3XL,
            'mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text font-bold text-transparent'
          )}
          aria-label={`${value}`}
        >
          {value}
        </div>

        {/* Label */}
        <div className={cn(TYPOGRAPHY.TEXT_LG, 'mb-2 font-semibold text-foreground')}>{label}</div>

        {/* Optional Description */}
        {description && (
          <p className={cn(TYPOGRAPHY.TEXT_SM, 'text-muted-foreground')}>{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

StatsGrid.displayName = 'StatsGrid';
