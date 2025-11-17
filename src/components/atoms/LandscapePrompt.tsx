/**
 * Landscape Prompt Component
 *
 * Displays an animated prompt on mobile devices encouraging users to rotate
 * their device to landscape orientation for optimal viewing of results tables
 * and charts.
 *
 * Features:
 * - Only shows on mobile devices (< md breakpoint)
 * - Only shows in portrait orientation
 * - Animated phone rotation icon
 * - Dismissible (persists via localStorage)
 * - Theme-aware (dark mode support)
 * - Accessible with ARIA labels
 *
 * PAYTAX-58: recharts 3.4.1 optimization - landscape viewing
 * Updated: Added to ResultsTable for better mobile UX on payslip data
 */

'use client';

import { Smartphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

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
 * users rotate their device for better viewing of results tables and charts.
 *
 * @example
 * ```tsx
 * <LandscapePrompt />
 * ```
 */
export function LandscapePrompt({ className, onDismiss }: LandscapePromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed before (localStorage)
    const dismissed = localStorage.getItem('landscape-prompt-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    // Check if we're on mobile and in portrait mode
    const checkOrientation = () => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const isPortrait = window.matchMedia('(orientation: portrait)').matches;

      setIsVisible(isMobile && isPortrait && !isDismissed);
    };

    // Initial check
    checkOrientation();

    // Listen for orientation changes
    const mediaQuery = window.matchMedia('(orientation: portrait)');
    const handleOrientationChange = () => checkOrientation();

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleOrientationChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleOrientationChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleOrientationChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleOrientationChange);
      }
    };
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    localStorage.setItem('landscape-prompt-dismissed', 'true');
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <output
      className={cn(
        'fixed right-4 bottom-4 left-4 z-50 md:hidden',
        'slide-in-from-bottom-5 fade-in animate-in duration-500',
        className
      )}
      aria-live='polite'
      aria-label='Rotate device for better viewing of results'
    >
      <div
        className={cn(
          'glass-card relative flex items-center gap-3 p-4',
          'border-primary/20 bg-primary/5 backdrop-blur-lg',
          'shadow-lg dark:bg-primary/10'
        )}
      >
        {/* Animated Phone Icon */}
        <div className='flex-shrink-0'>
          <Smartphone
            className={cn(
              ICON_SIZES.SIZE_8,
              'text-primary',
              'animate-[wiggle_1s_ease-in-out_infinite]'
            )}
            aria-hidden='true'
          />
        </div>

        {/* Message */}
        <div className='flex-1'>
          <p className={cn('font-medium text-foreground', TYPOGRAPHY.TEXT_SM)}>
            Rotate for Better View
          </p>
          <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_XS, SPACING.MT_1)}>
            Turn your device sideways for easier viewing
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className={cn(
            'flex-shrink-0 rounded-md p-1',
            'text-muted-foreground hover:text-foreground',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          )}
          aria-label='Dismiss landscape prompt'
          type='button'
        >
          <X className={ICON_SIZES.SIZE_5} aria-hidden='true' />
        </button>
      </div>

      <style jsx>{`
        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(-3deg);
          }
          50% {
            transform: rotate(3deg);
          }
        }
      `}</style>
    </output>
  );
}
