/**
 * Custom hook to detect user's motion preference
 * 
 * Checks the `prefers-reduced-motion` media query to respect user's
 * accessibility preferences for animations. Required for WCAG 2.2 compliance.
 * 
 * @returns {boolean} True if user prefers reduced motion, false otherwise
 * 
 * @example
 * ```typescript
 * function AnimatedCard() {
 *   const shouldReduceMotion = useMotionPreference();
 *   
 *   return (
 *     <motion.div
 *       initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
 *       animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
 *     >
 *       {content}
 *     </motion.div>
 *   );
 * }
 * ```
 * 
 * @module hooks/useMotionPreference
 */

'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect if user prefers reduced motion for accessibility
 * 
 * Monitors the `(prefers-reduced-motion: reduce)` media query and updates
 * when the preference changes. Animations should be disabled or significantly
 * reduced when this returns true.
 * 
 * @returns Whether the user prefers reduced motion
 */
export function useMotionPreference(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for matchMedia support (SSR safety)
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handler);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);

  return prefersReducedMotion;
}
