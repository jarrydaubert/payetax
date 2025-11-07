// src/components/molecules/ResultCard.tsx
'use client';

import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { cn } from '@/lib/utils';

interface ResultCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
  delay?: number;
  /** Tooltip text to explain what this metric means */
  tooltip?: string;
}

const variantStyles = {
  default: {
    card: '',
    icon: 'text-primary',
  },
  success: {
    card: '',
    icon: 'text-green-600 dark:text-green-400',
  },
  warning: {
    card: '',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    card: '',
    icon: 'text-primary',
  },
};

/**
 * Result card molecule for displaying key metrics
 *
 * Uses design tokens: TEXT_SM for label, TEXT_2XL for value, SIZE_4 for icon, SPACE_Y_2 for spacing
 * Uses CSS animations instead of Framer Motion for better performance (PAYTAX-80)
 *
 * @param label - The metric label/description
 * @param value - The formatted value to display
 * @param icon - Optional Lucide icon component
 * @param variant - Visual style variant (default, success, warning, info)
 * @param className - Additional CSS classes
 * @param delay - Animation delay in seconds (converted to CSS delay classes)
 * @param tooltip - Optional tooltip text for metric explanation
 */
export function ResultCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
  className,
  delay = 0,
  tooltip,
}: ResultCardProps) {
  const styles = variantStyles[variant];
  const shouldReduceMotion = useMotionPreference();

  const cardContent = (
    <Card className={cn('border-primary/20 p-4', tooltip && 'cursor-help', styles.card)}>
      <div className={SPACING.SPACE_Y_2}>
        <div className='flex items-center justify-between'>
          <p className={cn('font-medium text-foreground/80', TYPOGRAPHY.TEXT_SM)}>{label}</p>
          {Icon && <Icon className={cn(ICON_SIZES.SIZE_4, styles.icon)} />}
        </div>
        <p className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_2XL)}>{value}</p>
      </div>
    </Card>
  );

  // Calculate CSS animation class based on delay
  // Convert delay (seconds) to delay class (1-5)
  const delayClass =
    delay > 0 ? `animate-fade-up-delay-${Math.min(Math.round(delay * 10), 5)}` : 'animate-fade-up';

  // Apply animation only if motion is not reduced
  const animationClass = shouldReduceMotion ? '' : delayClass;

  return (
    <div className={cn(animationClass, className)}>
      {tooltip ? (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
            <TooltipContent className='max-w-xs' side='top'>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        cardContent
      )}
    </div>
  );
}
