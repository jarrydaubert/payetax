// src/hooks/useMouseDragScroll.ts
import * as React from 'react';

/**
 * Custom hook to enable mouse/touch/pen drag scrolling on a container element
 * Uses modern Pointer Events API for unified input handling
 * Allows users to click and drag to scroll horizontally/vertically
 *
 * @param ref - React ref to the scrollable container element
 * @returns void
 *
 * @example
 * ```tsx
 * const containerRef = React.useRef<HTMLDivElement>(null);
 * useMouseDragScroll(containerRef);
 *
 * return (
 *   <div
 *     ref={containerRef}
 *     className="overflow-x-auto cursor-grab active:cursor-grabbing"
 *   >
 *     {content}
 *   </div>
 * );
 * ```
 *
 * @important CRITICAL FIX DOCUMENTATION
 *
 * This hook uses `element.scrollTo({ left, top, behavior: 'instant' })` instead of
 * direct property assignment (`element.scrollLeft = value`) for programmatic scrolling.
 *
 * **Why this matters:**
 * - Direct assignment (`element.scrollLeft = value`) was being IGNORED/BATCHED when the
 *   container had `scroll-behavior: smooth` CSS property
 * - This caused the scroll to appear to update in logs but not actually move on screen
 * - The scrollTo() method with `behavior: 'instant'` properly overrides smooth scrolling
 *   and ensures immediate, reliable scroll updates during drag operations
 *
 * **DO NOT change back to direct assignment** - it will break drag scrolling on elements
 * with smooth scrolling enabled!
 *
 * Bug discovered: 2025-01-24
 * Root cause: CSS scroll-behavior interference with direct scrollLeft/scrollTop assignment
 * Solution: Use scrollTo() API with explicit behavior override
 */
export function useMouseDragScroll<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null>
) {
  const isDraggingRef = React.useRef(false);
  const startPosRef = React.useRef({ x: 0, y: 0 });
  const scrollPosRef = React.useRef({ left: 0, top: 0 });
  const DRAG_THRESHOLD = 5; // pixels - prevents accidental drags

  React.useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    // Optionally log initialization in development
    if (process.env.NODE_ENV === 'development') {
    }

    let hasMoved = false;

    const handlePointerDown = (e: PointerEvent) => {
      // Only handle primary button (left click or touch)
      if (e.button !== 0) {
        return;
      }

      // Ignore if clicking on interactive elements (buttons, links, inputs)
      const target = e.target as HTMLElement;
      if (
        ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName) ||
        target.closest('button, a, input, select, textarea')
      ) {
        return;
      }

      // Blur any active focus to avoid input conflicts
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      // Prevent default to stop text selection
      e.preventDefault();

      // Try to capture pointer - wrap in try/catch in case element doesn't support it
      try {
        element.setPointerCapture(e.pointerId);
      } catch (err) {
        // Fallback for older browsers
        console.warn('⚠️ [DragScroll] Pointer capture failed:', err);
      }

      isDraggingRef.current = true;
      hasMoved = false;
      startPosRef.current = { x: e.pageX, y: e.pageY };
      scrollPosRef.current = { left: element.scrollLeft, top: element.scrollTop };

      // Ensure cursor shows grabbing state
      element.style.cursor = 'grabbing';
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) {
        // Don't log every move event, too noisy
        return;
      }

      e.preventDefault();

      const deltaX = e.pageX - startPosRef.current.x;
      const deltaY = e.pageY - startPosRef.current.y;

      // Only start dragging if threshold is met (prevents accidental drags)
      if (!hasMoved && Math.abs(deltaX) < DRAG_THRESHOLD && Math.abs(deltaY) < DRAG_THRESHOLD) {
        return;
      }

      if (!hasMoved) {
      }

      hasMoved = true;

      // Scroll with 1.5x multiplier for natural feel (reduced from 2x for better control)
      const newScrollLeft = scrollPosRef.current.left - deltaX * 1.5;
      const newScrollTop = scrollPosRef.current.top - deltaY * 1.5;

      // CRITICAL: Use scrollTo() method instead of direct assignment (element.scrollLeft = value)
      // Direct assignment fails when container has scroll-behavior: smooth CSS property
      // The scrollTo() method with behavior: 'instant' properly overrides smooth scrolling
      // and ensures immediate scroll updates during drag. DO NOT change to direct assignment!
      element.scrollTo({
        left: newScrollLeft,
        top: newScrollTop,
        behavior: 'instant',
      });

      if (hasMoved && Math.abs(deltaX) > 10) {
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;

      // Release pointer capture
      try {
        element.releasePointerCapture(e.pointerId);
      } catch (err) {
        console.warn('⚠️ [DragScroll] Pointer release failed:', err);
      }

      isDraggingRef.current = false;
      hasMoved = false;
      element.style.cursor = 'grab';
    };
    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove, { passive: false }); // passive:false needed for preventDefault
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointercancel', handlePointerUp); // Handle cancelled pointers

    // Cleanup
    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [ref]);
}
