// src/components/molecules/TaxRateCard.tsx
'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ANIMATION_GESTURES } from '@/constants/animationTokens';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { useMotionPreference } from '@/hooks/useMotionPreference';
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
 * Enhanced with Framer Motion gestures (PAYTAX-75: Maximization)
 */
export function TaxRateCard({ icon: Icon, title, items, footerNote }: TaxRateCardProps) {
  const shouldReduceMotion = useMotionPreference();

  // Gesture animations (PAYTAX-75: Framer Motion Maximization)
  const gestureProps = shouldReduceMotion
    ? {}
    : {
        whileHover: ANIMATION_GESTURES.hover,
        whileTap: ANIMATION_GESTURES.tapGentle,
      };

  return (
    <motion.div {...gestureProps}>
      <Card className='group overflow-hidden border-primary/20 p-6'>
        <div className={cn('mb-4 flex items-center', SPACING.GAP_3)}>
          <div className='flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end'>
            <Icon className={cn(ICON_SIZES.SIZE_5, 'text-white')} />
          </div>
          <h3 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_LG)}>{title}</h3>
        </div>
        <ul className={SPACING.SPACE_Y_3}>
          {items.map((item) => (
            <li
              key={item.label}
              className={cn('flex justify-between rounded-md bg-muted/30 p-2', TYPOGRAPHY.TEXT_SM)}
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
    </motion.div>
  );
}
