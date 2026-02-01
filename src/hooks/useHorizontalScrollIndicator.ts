// src/hooks/useHorizontalScrollIndicator.ts
import * as React from 'react';

interface UseHorizontalScrollIndicatorReturn {
  showLeftIndicator: boolean;
  showRightIndicator: boolean;
}

// Edge tolerance in px (accounts for fractional pixels on HiDPI)
const EPS = 2;

// Use useLayoutEffect in browser for correct first paint, useEffect for SSR
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

/**
 * Custom hook to manage horizontal scroll indicators
 * Tracks scroll position and determines when to show left/right scroll indicators
 *
 * Features:
 * - RAF-coalesced measurements (prevents scroll/resize spam)
 * - Passive scroll listener for performance
 * - ResizeObserver for container + content size changes
 * - Stable listeners (only re-measure on deps change, not re-attach)
 * - useLayoutEffect for correct first paint
 *
 * @param containerRef - Ref to the scrollable container element
 * @param deps - Optional dependencies array to trigger recheck
 * @returns Object with showLeftIndicator and showRightIndicator booleans
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { showLeftIndicator, showRightIndicator } = useHorizontalScrollIndicator(containerRef);
 *
 * // Or with dependencies to recheck when they change:
 * const { showLeftIndicator, showRightIndicator } = useHorizontalScrollIndicator(
 *   containerRef,
 *   [visibleColumns]
 * );
 * ```
 */
export function useHorizontalScrollIndicator<T extends HTMLElement = HTMLDivElement>(
  containerRef: React.RefObject<T | null>,
  deps: React.DependencyList = [],
): UseHorizontalScrollIndicatorReturn {
  const [showLeftIndicator, setShowLeftIndicator] = React.useState(false);
  const [showRightIndicator, setShowRightIndicator] = React.useState(false);

  // Keep latest element in a ref to avoid stale closures
  const latestElRef = React.useRef<T | null>(null);

  // RAF-coalesced measurement (prevents scroll/resize storms from spamming setState)
  const rafIdRef = React.useRef<number | null>(null);

  const measure = React.useCallback(() => {
    const el = latestElRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const hasHorizontalScroll = scrollWidth > clientWidth + EPS;

    const nextLeft = hasHorizontalScroll && scrollLeft > EPS;
    const nextRight = hasHorizontalScroll && scrollLeft < scrollWidth - clientWidth - EPS;

    // Avoid unnecessary state updates
    setShowLeftIndicator((prev) => (prev === nextLeft ? prev : nextLeft));
    setShowRightIndicator((prev) => (prev === nextRight ? prev : nextRight));
  }, []);

  const scheduleMeasure = React.useCallback(() => {
    if (rafIdRef.current != null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      measure();
    });
  }, [measure]);

  // Attach listeners/observers when element becomes available (stable, not on deps change)
  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    latestElRef.current = el;
    if (!el) return;

    scheduleMeasure();

    el.addEventListener('scroll', scheduleMeasure, { passive: true });
    window.addEventListener('resize', scheduleMeasure);

    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(el);

    // Also observe content wrapper (helps when scrollWidth changes but container box doesn't)
    const content = el.firstElementChild as Element | null;
    if (content) ro.observe(content);

    return () => {
      latestElRef.current = null;

      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      el.removeEventListener('scroll', scheduleMeasure);
      window.removeEventListener('resize', scheduleMeasure);
      ro.disconnect();
    };
    // Intentionally not depending on deps: listeners should be stable
  }, [containerRef, scheduleMeasure]);

  // Re-measure when deps change, without tearing down listeners
  React.useEffect(() => {
    scheduleMeasure();
    // biome-ignore lint/correctness/useExhaustiveDependencies: deps is intentionally spread from caller
  }, deps);

  return { showLeftIndicator, showRightIndicator };
}
