// src/components/atoms/ScrollIndicator.tsx
'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { memo } from 'react';
import { ICON_SIZES } from '@/constants/designTokens';
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
 * Performance: Memoized with React 19 to prevent re-renders during scroll events
 */
export const ScrollIndicator = memo(function ScrollIndicator({
  direction,
  visible,
}: ScrollIndicatorProps) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  const positionClass = direction === 'left' ? 'left-0 justify-start' : 'right-0 justify-end';
  const gradientClass = direction === 'left' ? 'bg-gradient-to-r' : 'bg-gradient-to-l';

  // Right indicator bounces to show users they can scroll
  const animationProps =
    direction === 'right' && visible
      ? {
          opacity: 1,
          x: [0, -8, 0],
          transition: {
            opacity: { duration: 0.2 },
            x: {
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 0.5,
              ease: 'easeInOut',
            },
          },
        }
      : {
          opacity: visible ? 1 : 0,
          x: 0,
          transition: { duration: 0.2 },
        };

  return (
    <motion.div
      initial={{ opacity: 0, x: 0 }}
      animate={animationProps}
      className={cn(
        'pointer-events-none absolute inset-y-0 z-30 flex w-16 items-center md:w-20',
        positionClass,
        gradientClass,
        'from-background via-background/90 to-transparent',
      )}
      aria-hidden='true'
    >
      <div className='flex size-8 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm md:size-10'>
        <Icon
          className={cn(ICON_SIZES.SIZE_5, ICON_SIZES.SIZE_6, 'text-primary drop-shadow-lg')}
          strokeWidth={2.5}
        />
      </div>
    </motion.div>
  );
});
