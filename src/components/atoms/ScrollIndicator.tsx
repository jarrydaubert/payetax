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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-none absolute top-0 bottom-0 ${positionClass} z-10 flex w-8 items-center ${gradientClass} from-background to-transparent sm:w-12`}
    >
      <Icon className='size-5 animate-pulse text-primary sm:h-6 sm:w-6' />
    </motion.div>
  );
}
