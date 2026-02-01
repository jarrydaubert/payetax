'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { memo } from 'react';
import { cn } from '@/lib/utils';

interface ScrollIndicatorProps {
  direction: 'left' | 'right';
  visible: boolean;
}

/**
 * Scroll indicator component that shows when table content can be scrolled.
 * Displays animated chevron icon with gradient background.
 * Follows atomic design pattern - single responsibility for scroll indication.
 *
 * Note: memo() prevents re-renders only when props don't change.
 * For scroll performance, throttle the parent's scroll listener.
 */
export const ScrollIndicator = memo(function ScrollIndicator({
  direction,
  visible,
}: ScrollIndicatorProps) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  const positionClass = direction === 'left' ? 'left-0 justify-start' : 'right-0 justify-end';
  const gradientClass = direction === 'left' ? 'bg-gradient-to-r' : 'bg-gradient-to-l';

  // Respect reduced motion preferences
  const prefersReducedMotion = useReducedMotion();

  // Animation variants for consistent shape (always use arrays for x)
  const getAnimateProps = () => {
    if (!visible) {
      return {
        opacity: 0,
        x: [0, 0, 0],
        transition: { duration: 0.2 },
      };
    }

    // Right indicator bounces to show users they can scroll
    // Limited to 3 cycles to avoid annoyance/battery drain
    if (direction === 'right' && !prefersReducedMotion) {
      return {
        opacity: 1,
        x: [0, -8, 0],
        transition: {
          opacity: { duration: 0.2 },
          x: {
            duration: 1.5,
            repeat: 3,
            repeatDelay: 0.5,
            ease: 'easeInOut' as const,
          },
        },
      };
    }

    return {
      opacity: 1,
      x: [0, 0, 0],
      transition: { duration: 0.2 },
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: [0, 0, 0] }}
      animate={getAnimateProps()}
      className={cn(
        'pointer-events-none absolute inset-y-0 z-30 flex w-16 items-center md:w-20',
        positionClass,
        gradientClass,
        // Use surface token for more reliable theming
        'from-background via-background/90 to-transparent',
      )}
      aria-hidden='true'
    >
      <div className='flex size-8 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm md:size-10'>
        <Icon className='size-5 text-primary drop-shadow-lg md:size-6' strokeWidth={2.5} />
      </div>
    </motion.div>
  );
});
