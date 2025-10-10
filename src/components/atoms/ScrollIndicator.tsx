// src/components/atoms/ScrollIndicator.tsx
'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollIndicatorProps {
  direction: 'left' | 'right';
  visible: boolean;
}

/**
 * Scroll indicator component that shows when table content can be scrolled.
 * Displays animated chevron icon with gradient background.
 * Follows atomic design pattern - single responsibility for scroll indication.
 */
export function ScrollIndicator({ direction, visible }: ScrollIndicatorProps) {
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
      className={`pointer-events-none absolute inset-y-0 ${positionClass} z-10 flex w-16 items-center ${gradientClass} from-background via-background/90 to-transparent md:w-20`}
      aria-hidden='true'
    >
      <div className='flex size-8 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm md:size-10'>
        <Icon className='size-5 text-primary drop-shadow-lg md:size-6' strokeWidth={2.5} />
      </div>
    </motion.div>
  );
}
