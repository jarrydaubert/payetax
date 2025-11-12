// src/components/molecules/ResultCard.tsx
'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ANIMATION_GESTURES,
  ANIMATION_TRANSITIONS,
  ANIMATION_VARIANTS,
} from '@/constants/animationTokens';
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
  /** Enable scroll-triggered reveal animation (default: false for backward compatibility) */
  revealOnScroll?: boolean;
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
 * Supports both immediate and scroll-triggered reveal animations with accessibility support
 *
 * @param label - The metric label/description
 * @param value - The formatted value to display
 * @param icon - Optional Lucide icon component
 * @param variant - Visual style variant (default, success, warning, info)
 * @param className - Additional CSS classes
 * @param delay - Animation delay in seconds (only for immediate animations)
 * @param tooltip - Optional tooltip text for metric explanation
 * @param revealOnScroll - Enable scroll-triggered reveal (default: false for backward compatibility)
 */
export function ResultCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
  className,
  delay = 0,
  tooltip,
  revealOnScroll = false,
}: ResultCardProps) {
  const styles = variantStyles[variant];
  const shouldReduceMotion = useMotionPreference();

  const cardContent = (
    <Card className={cn('border-primary/20', SPACING.P_4, tooltip && 'cursor-help', styles.card)}>
      <div className={SPACING.SPACE_Y_2}>
        <div className='flex items-center justify-between'>
          <p className={cn('font-medium text-foreground/80', TYPOGRAPHY.TEXT_SM)}>{label}</p>
          {Icon && <Icon className={cn(ICON_SIZES.SIZE_4, styles.icon)} />}
        </div>
        <p className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_2XL)}>{value}</p>
      </div>
    </Card>
  );

  // Animation props based on reveal mode and motion preference
  const animationProps = shouldReduceMotion
    ? {} // No animation if user prefers reduced motion
    : revealOnScroll
      ? {
          // Scroll-triggered reveal
          initial: 'initial',
          whileInView: 'animate',
          viewport: { once: true, margin: '-50px' },
          variants: ANIMATION_VARIANTS.fadeInUp,
          transition: {
            ...ANIMATION_TRANSITIONS.default,
            delay,
          },
        }
      : {
          // Immediate reveal (legacy behavior)
          initial: 'initial',
          animate: 'animate',
          variants: ANIMATION_VARIANTS.fadeInUp,
          transition: {
            ...ANIMATION_TRANSITIONS.default,
            delay,
          },
        };

  // Gesture animations (PAYTAX-75: Framer Motion Maximization)
  const gestureProps = shouldReduceMotion
    ? {}
    : {
        whileHover: ANIMATION_GESTURES.hoverGentle,
        whileTap: ANIMATION_GESTURES.tapGentle,
      };

  return (
    <motion.div {...animationProps} {...gestureProps} className={className}>
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
    </motion.div>
  );
}
