/**
 * DataFlowCards Component
 *
 * Displays a grid of data flow cards showing how data moves through the system.
 * Used on privacy page to explain where data goes (or doesn't go).
 *
 * @module components/molecules/DataFlowCards
 */

'use client';

import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

/**
 * Individual data flow card
 */
export interface DataFlowCard {
  /** Icon representing the flow stage */
  icon: LucideIcon;
  /** Icon color/background classes */
  iconColor?: string;
  /** Title of the stage */
  title: string;
  /** Description of what happens at this stage */
  description: string;
}

/**
 * DataFlowCards component props
 */
export interface DataFlowCardsProps {
  /** Array of data flow cards to display */
  cards: DataFlowCard[];
  /** Number of columns in grid (responsive) */
  columns?: 2 | 3;
  /** Optional custom className */
  className?: string;
}

/**
 * DataFlowCards Component
 *
 * Displays a grid showing data flow stages.
 * Typically 3 columns: Your Device → Transit → Our Servers
 *
 * @example
 * ```tsx
 * <DataFlowCards
 *   cards={[
 *     {
 *       icon: Database,
 *       iconColor: 'bg-primary',
 *       title: 'Your Device',
 *       description: 'All calculations happen here. Your data never leaves.',
 *     },
 *     {
 *       icon: Server,
 *       iconColor: 'bg-primary/80',
 *       title: 'Our Servers',
 *       description: 'Only serve the website code. No tax data stored.',
 *     },
 *   ]}
 *   columns={3}
 * />
 * ```
 */
export function DataFlowCards({ cards, columns = 3, className }: DataFlowCardsProps) {
  const gridClasses = cn(
    'grid gap-4 md:gap-8',
    {
      'md:grid-cols-2': columns === 2,
      'md:grid-cols-3': columns === 3,
    },
    className
  );

  return (
    <div className={gridClasses}>
      {cards.map((card, index) => (
        <DataFlowCardItem key={`${card.title}-${index}`} card={card} />
      ))}
    </div>
  );
}

/**
 * Individual data flow card item
 */
interface DataFlowCardItemProps {
  card: DataFlowCard;
}

function DataFlowCardItem({ card }: DataFlowCardItemProps) {
  const { icon: Icon, iconColor = 'bg-primary', title, description } = card;

  return (
    <Card
      className={cn(
        'h-full border-primary/20 text-center transition-all duration-300 active:scale-[1.02] md:hover:border-primary/40 md:hover:shadow-xl',
        SPACING.P_8
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          `mx-auto mb-6 flex ${'size-20'} items-center justify-center rounded-2xl shadow-lg`,
          iconColor
        )}
      >
        <Icon className={cn(ICON_SIZES.SIZE_10, 'text-primary-foreground')} aria-hidden='true' />
      </div>

      {/* Title */}
      <h3 className={cn('font-bold text-foreground', SPACING.MB_4, TYPOGRAPHY.TEXT_XL)}>{title}</h3>

      {/* Description */}
      <p className='text-muted-foreground leading-relaxed'>{description}</p>
    </Card>
  );
}

DataFlowCards.displayName = 'DataFlowCards';
