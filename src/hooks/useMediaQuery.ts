// src/hooks/useMediaQuery.ts
'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook to detect media query matches
 * Useful for responsive animations and conditional rendering
 *
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean - true if media query matches
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isTouch = useMediaQuery('(hover: none)');
 * const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with false for SSR (server-side rendering)
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener function
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Preset hook for mobile detection
 * @returns boolean - true if viewport width <= 768px
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

/**
 * Preset hook for touch device detection
 * @returns boolean - true if device doesn't support hover (touch device)
 */
export function useIsTouch(): boolean {
  return useMediaQuery('(hover: none)');
}

/**
 * Preset hook for small mobile devices
 * @returns boolean - true if viewport width <= 640px
 */
export function useIsSmallMobile(): boolean {
  return useMediaQuery('(max-width: 640px)');
}
