// src/hooks/useHorizontalScrollIndicator.ts
import * as React from 'react';

interface UseHorizontalScrollIndicatorReturn {
  showLeftIndicator: boolean;
  showRightIndicator: boolean;
}

/**
 * Custom hook to manage horizontal scroll indicators
 * Tracks scroll position and determines when to show left/right scroll indicators
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
 *
 * return (
 *   <>
 *     <ScrollIndicator direction="left" visible={showLeftIndicator} />
 *     <div ref={containerRef}>...</div>
 *     <ScrollIndicator direction="right" visible={showRightIndicator} />
 *   </>
 * );
 * ```
 */
export function useHorizontalScrollIndicator<T extends HTMLElement = HTMLDivElement>(
  containerRef: React.RefObject<T | null>,
  deps: React.DependencyList = []
): UseHorizontalScrollIndicatorReturn {
  const [showLeftIndicator, setShowLeftIndicator] = React.useState(false);
  const [showRightIndicator, setShowRightIndicator] = React.useState(false);

  React.useEffect(() => {
    const checkScrollPosition = () => {
      const container = containerRef.current;
      if (!container) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      const hasHorizontalScroll = scrollWidth > clientWidth;

      setShowLeftIndicator(hasHorizontalScroll && scrollLeft > 5);
      setShowRightIndicator(hasHorizontalScroll && scrollLeft < scrollWidth - clientWidth - 5);
    };

    const container = containerRef.current;
    if (container) {
      checkScrollPosition();
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);

      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, ...deps]);

  return { showLeftIndicator, showRightIndicator };
}
