/**
 * DataFlowCards Component
 *
 * Displays a grid of data flow cards showing how data moves through the system.
 * Used on privacy page to explain where data goes (or doesn't go).
 *
 * Server Component - no hooks or event handlers needed.
 *
 * @module components/molecules/DataFlowCards
 */

import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
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
    className,
  );

  return (
    <div className={gridClasses}>
      {cards.map((card) => (
        <DataFlowCardItem key={`${card.title}-${card.description}`} card={card} />
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
  const { icon: Icon, title, description } = card;

  return (
    <Card
      className={cn(
        'h-full rounded-sm border-primary/20 bg-card text-center transition-colors md:hover:border-primary/45',
        'p-8',
      )}
    >
      {/* Icon */}
      <div className='mx-auto mb-6 flex size-20 items-center justify-center rounded-sm border border-primary/25 bg-background text-primary'>
        <Icon className={'size-10'} aria-hidden='true' />
      </div>

      {/* Title */}
      <h3 className={cn('font-display font-semibold text-foreground', 'mb-4', 'text-xl')}>
        {title}
      </h3>

      {/* Description */}
      <p className='text-muted-foreground leading-relaxed'>{description}</p>
    </Card>
  );
}

DataFlowCards.displayName = 'DataFlowCards';
