// src/components/molecules/TaxRateCard.tsx

import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface TaxRateItem {
  label: string;
  value: string;
  colorClass?: string;
}

export interface TaxRateCardProps {
  icon: LucideIcon;
  title: string;
  items: TaxRateItem[];
  footerNote?: string;
}

/**
 * Tax rate information card molecule
 * Displays tax rates, thresholds, or related information in a structured card layout
 * Uses design tokens: TEXT_LG for title, TEXT_SM for items, SIZE_5 for icon, GAP_3/SPACE_Y_3 for spacing
 */
export function TaxRateCard({ icon: Icon, title, items, footerNote }: TaxRateCardProps) {
  return (
    <Card className={cn('overflow-hidden rounded-sm border-border bg-card', 'p-6')}>
      <div className={cn('mb-4 flex items-center', 'gap-3')}>
        <div className='flex size-10 items-center justify-center rounded-sm border border-primary/25 bg-background text-primary'>
          <Icon className={'size-5'} />
        </div>
        <h3 className={cn('font-display font-semibold text-foreground', 'text-lg')}>{title}</h3>
      </div>
      <ul className={'space-y-3'}>
        {items.map((item) => (
          <li
            key={item.label}
            className={cn(
              'flex justify-between rounded-sm border border-border bg-background',
              'p-2',
              'text-sm',
            )}
          >
            <span className='text-muted-foreground'>{item.label}</span>
            <strong className={item.colorClass || 'text-foreground'}>{item.value}</strong>
          </li>
        ))}
        {footerNote && (
          <li className={cn('pt-1 text-center text-muted-foreground', 'text-xs')}>{footerNote}</li>
        )}
      </ul>
    </Card>
  );
}
