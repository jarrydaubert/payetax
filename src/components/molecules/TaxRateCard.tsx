// src/components/molecules/TaxRateCard.tsx

import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
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
    <Card className={cn('overflow-hidden rounded-sm border-border bg-card', SPACING.P_6)}>
      <div className={cn('mb-4 flex items-center', SPACING.GAP_3)}>
        <div className='flex size-10 items-center justify-center rounded-sm border border-primary/25 bg-background text-primary'>
          <Icon className={ICON_SIZES.SIZE_5} />
        </div>
        <h3 className={cn('font-display font-semibold text-foreground', TYPOGRAPHY.TEXT_LG)}>
          {title}
        </h3>
      </div>
      <ul className={SPACING.SPACE_Y_3}>
        {items.map((item) => (
          <li
            key={item.label}
            className={cn(
              'flex justify-between rounded-sm border border-border bg-background',
              SPACING.P_2,
              TYPOGRAPHY.TEXT_SM,
            )}
          >
            <span className='text-muted-foreground'>{item.label}</span>
            <strong className={item.colorClass || 'text-foreground'}>{item.value}</strong>
          </li>
        ))}
        {footerNote && (
          <li className={cn('pt-1 text-center text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>
            {footerNote}
          </li>
        )}
      </ul>
    </Card>
  );
}
