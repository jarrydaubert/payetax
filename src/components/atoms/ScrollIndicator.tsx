'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { memo } from 'react';
import { cn } from '@/lib/utils';

interface ScrollIndicatorProps {
  direction: 'left' | 'right';
  visible: boolean;
}

/**
 * Scroll indicator component that shows when table content can be scrolled.
 * Displays a static chevron hint at the scroll edge.
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

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-y-0 z-30 flex w-12 items-center transition-opacity md:w-14',
        positionClass,
        'bg-background/95',
        visible ? 'opacity-100' : 'opacity-0',
      )}
      aria-hidden='true'
    >
      <div className='flex size-8 items-center justify-center rounded-sm border border-border bg-card md:size-10'>
        <Icon className='size-5 text-primary md:size-6' strokeWidth={2.5} />
      </div>
    </div>
  );
});
