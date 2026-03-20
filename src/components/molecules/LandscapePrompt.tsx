/**
 * Landscape Prompt Component
 *
 * Displays a centered animated prompt on mobile devices encouraging users to rotate
 * their device to landscape orientation for easier viewing of the results table.
 *
 * Features:
 * - Only shows on mobile devices (< md breakpoint)
 * - Only shows in portrait orientation
 * - Centered on screen (not blocking scroll-to-top button)
 * - Animated phone rotation icon
 * - Dismissible (persists via localStorage)
 * - Theme-aware (dark mode support)
 * - Accessible with ARIA labels
 * - Click-through overlay (only card is interactive)
 *
 * Updated: Centered positioning to avoid UI conflicts with fixed buttons
 */

'use client';

import { Smartphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [portalMounted, setPortalMounted] = useState(false);

  useEffect(() => {
    setPortalMounted(true);
    return () => setPortalMounted(false);
  }, []);

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

  if (!(isVisible && portalMounted)) {
    return null;
  }

  const prompt = (
    <output
      aria-live='polite'
      aria-atomic='true'
      className={cn(
        'fixed inset-0 z-[9998] flex items-center justify-center md:hidden',
        'fade-in animate-in duration-500',
        'pointer-events-none', // Allow clicks through to content
        className,
      )}
    >
      <div
        className={cn(
          'glass-card relative mx-4 flex max-w-sm items-center gap-3 p-4',
          'pointer-events-auto', // Enable clicks on the card itself
          'border-primary/20 bg-primary/5 backdrop-blur-lg',
          'shadow-lg dark:bg-primary/10',
        )}
      >
        {/* Animated Phone Icon - uses animate-wiggle from Tailwind config */}
        <div className='flex-shrink-0'>
          <Smartphone
            className={cn(ICON_SIZES.SIZE_8, 'text-primary', 'animate-wiggle')}
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
          type='button'
          onClick={handleDismiss}
          className={cn(
            'flex-shrink-0 rounded-md p-1',
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

  return createPortal(prompt, document.body);
}
