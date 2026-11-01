// src/components/molecules/ResultCard.tsx
'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ANIMATION_GESTURES,
  ANIMATION_TRANSITIONS,
  ANIMATION_VARIANTS,
} from '@/constants/animationTokens';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { cn } from '@/lib/utils';

/** Supported visual variants for result cards */
type ResultCardVariant = 'default' | 'success' | 'warning' | 'info';

interface ResultCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  variant?: ResultCardVariant;
  className?: string;
  /**
   * Animation delay in seconds
   * @deprecated Prefer parent container stagger (ANIMATION_CONTAINER_VARIANTS) over per-card delay
   */
  delay?: number;
  /**
   * Tooltip text to explain what this metric means
   * Note: Parent must wrap with TooltipProvider for tooltips to work
   */
  tooltip?: string;
  /** Optional controlled state so a result row can allow only one explanation. */
  tooltipOpen?: boolean;
  onTooltipOpenChange?: (open: boolean) => void;
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
    icon: 'text-success',
  },
  warning: {
    card: '',
    icon: 'text-warning',
  },
  info: {
    card: '',
    icon: 'text-primary',
  },
} as const satisfies Record<ResultCardVariant, { card: string; icon: string }>;

/**
 * Result card molecule for displaying key metrics
 *
 * Uses design tokens: TEXT_SM for label, TEXT_2XL for value, SIZE_4 for icon, SPACE_Y_2 for spacing
 * Supports both immediate and scroll-triggered reveal animations with accessibility support
 * Memoized to prevent unnecessary re-renders in result grids
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
export const ResultCard = memo(function ResultCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
  className,
  delay = 0,
  tooltip,
  tooltipOpen: controlledTooltipOpen,
  onTooltipOpenChange,
  revealOnScroll = false,
}: ResultCardProps) {
  const styles = variantStyles[variant];
  const shouldReduceMotion = useMotionPreference();
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const showTooltip = Boolean(tooltip) && canHover;
  const [localTooltipOpen, setLocalTooltipOpen] = useState(false);
  const tooltipOpen = controlledTooltipOpen ?? localTooltipOpen;
  const setTooltipOpen = onTooltipOpenChange ?? setLocalTooltipOpen;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const keyboardFocusRef = useRef(false);

  useEffect(() => {
    if (!canHover) {
      keyboardFocusRef.current = false;
      setTooltipOpen(false);
    }
  }, [canHover, setTooltipOpen]);

  // Card visual content
  const cardVisual = (
    <Card className={cn('p-4', 'rounded-sm border-border bg-card shadow-none', styles.card)}>
      <div className={cn('space-y-2')}>
        <div className='flex items-center justify-between'>
          <p
            className={cn('font-medium tracking-[0.12em] text-foreground/80 uppercase', 'text-sm')}
          >
            {label}
          </p>
          {Icon && <Icon className={cn('size-4', styles.icon, 'opacity-80')} aria-hidden='true' />}
        </div>
        <p className={cn('font-mono font-semibold text-foreground tabular-nums', 'text-2xl')}>
          {value}
        </p>
      </div>
    </Card>
  );

  // Touch cards contain only static content, including before hydration.
  const cardContent = showTooltip ? (
    <button
      ref={triggerRef}
      type='button'
      onFocus={(event) => {
        keyboardFocusRef.current = event.currentTarget.matches(':focus-visible');
      }}
      onPointerDown={() => {
        keyboardFocusRef.current = false;
      }}
      onBlur={() => {
        keyboardFocusRef.current = false;
        setTooltipOpen(false);
      }}
      onClick={(event) => {
        // Native Enter/Space and assistive activation produce a click with detail 0.
        event.preventDefault();
        keyboardFocusRef.current = event.detail === 0;
        setTooltipOpen(event.detail === 0 ? !tooltipOpen : false);
      }}
      className={cn(
        'w-full cursor-help text-left',
        'rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
      )}
    >
      {cardVisual}
    </button>
  ) : (
    cardVisual
  );

  // Animation props based on reveal mode and motion preference
  const animationProps = shouldReduceMotion
    ? {
        initial: false as const,
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      }
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
  // Disable hover scale when tooltip exists to avoid jitter/position recalculation
  const gestureProps =
    shouldReduceMotion || !canHover
      ? {}
      : tooltip
        ? {} // Avoid a second tab stop on Framer's tap-enabled wrapper.
        : {
            whileHover: ANIMATION_GESTURES.hoverGentle,
            whileTap: ANIMATION_GESTURES.tapGentle,
          };

  return (
    <motion.div {...animationProps} {...gestureProps} className={className}>
      {showTooltip ? (
        <Tooltip
          open={tooltipOpen}
          onOpenChange={(open) => {
            // Focus scrolling must not dismiss keyboard help; Escape and blur still do.
            if (
              open ||
              !keyboardFocusRef.current ||
              document.activeElement !== triggerRef.current
            ) {
              setTooltipOpen(open);
            }
          }}
        >
          <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
          <TooltipContent
            className='max-w-xs'
            side='top'
            onEscapeKeyDown={() => setTooltipOpen(false)}
            onPointerDownOutside={() => setTooltipOpen(false)}
          >
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        cardContent
      )}
    </motion.div>
  );
});
