/**
 * Landscape Prompt Component
 *
 * Displays a centered animated prompt on mobile devices encouraging users to rotate
 * their device to landscape orientation for easier viewing of the results table.
 *
 * Features:
 * - Only shows on mobile devices (< md breakpoint)
 * - Only shows in portrait orientation
 * - Inline with the results section so it never blocks calculator controls
 * - Animated phone rotation icon
 * - Dismissible (persists via localStorage)
 * - Theme-aware (dark mode support)
 * - Accessible with ARIA labels
 * - Dismissible without interrupting input actions
 */

'use client';

import { Smartphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { BREAKPOINTS } from '@/constants/ui';
import { safeGetItem, safeSetItem } from '@/lib/safeStorage';
import { cn } from '@/lib/utils';

/** Versioned storage key - increment version to show prompt again after redesigns */
const DISMISS_KEY = 'landscapePrompt:dismissed:v1';

interface LandscapePromptProps {
  /**
   * Custom className for styling
   */
  className?: string;
  /**
   * Callback when user dismisses the prompt
   */
  onDismiss?: () => void;
}

/**
 * Landscape Prompt Component
 *
 * Shows a friendly animated prompt on mobile portrait mode suggesting
 * users rotate their device for better viewing of results tables.
 *
 * @example
 * ```tsx
 * <LandscapePrompt />
 * ```
 */
export function LandscapePrompt({ className, onDismiss }: LandscapePromptProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed before (localStorage)
    const dismissed = safeGetItem(DISMISS_KEY) === 'true';
    if (dismissed) return;

    // Check if we're on mobile (< md breakpoint) and in portrait mode
    // Use BREAKPOINTS.MD - 1 to match Tailwind's md:hidden behavior (md starts at 768px)
    const checkOrientation = () => {
      const isMobile = window.matchMedia(`(max-width: ${BREAKPOINTS.MD - 1}px)`).matches;
      const isPortrait = window.matchMedia('(orientation: portrait)').matches;
      setIsVisible(isMobile && isPortrait);
    };

    // Initial check
    checkOrientation();

    // Listen for orientation changes
    const mediaQuery = window.matchMedia('(orientation: portrait)');

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', checkOrientation);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(checkOrientation);
    }

    // Also listen for resize as fallback (iOS Safari, foldables, split view)
    window.addEventListener('resize', checkOrientation, { passive: true });

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', checkOrientation);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(checkOrientation);
      }
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  const handleDismiss = () => {
    safeSetItem(DISMISS_KEY, 'true');
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <output
      aria-live='polite'
      aria-atomic='true'
      className={cn('block md:hidden', 'fade-in animate-in duration-500', className)}
    >
      <div
        className={cn(
          'flex items-center gap-3 rounded-sm border border-primary/30 bg-primary/5 p-3',
          'dark:bg-primary/10',
        )}
      >
        <Smartphone
          className={cn(ICON_SIZES.SIZE_8, 'shrink-0 text-primary', 'animate-wiggle')}
          aria-hidden='true'
        />

        <div className='min-w-0 flex-1'>
          <p className={cn('font-medium text-foreground', TYPOGRAPHY.TEXT_SM)}>
            Rotate for Better View
          </p>
          <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_XS, SPACING.MT_1)}>
            Turn your device sideways for easier viewing
          </p>
        </div>

        <button
          type='button'
          onClick={handleDismiss}
          className={cn(
            'shrink-0 rounded-md p-1',
            'text-muted-foreground hover:text-foreground',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
          )}
          aria-label='Dismiss landscape prompt'
        >
          <X className={ICON_SIZES.SIZE_5} aria-hidden='true' />
        </button>
      </div>
    </output>
  );
}
