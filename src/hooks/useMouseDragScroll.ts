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
    if (!element) return;

    let hasMoved = false;

    const handlePointerDown = (e: PointerEvent) => {
      // Ignore if clicking on interactive elements (buttons, links, inputs)
      const target = e.target as HTMLElement;
      if (
        ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName) ||
        target.closest('button, a, input, select, textarea')
      ) {
        return;
      }

      e.preventDefault();
      element.setPointerCapture(e.pointerId); // Capture pointer for smooth tracking
      isDraggingRef.current = true;
      hasMoved = false;
      startPosRef.current = { x: e.pageX, y: e.pageY };
      scrollPosRef.current = { left: element.scrollLeft, top: element.scrollTop };

      // Prevent text selection while dragging
      element.style.userSelect = 'none';
      element.style.cursor = 'grabbing';
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;

      e.preventDefault();

      const deltaX = e.pageX - startPosRef.current.x;
      const deltaY = e.pageY - startPosRef.current.y;

      // Only start dragging if threshold is met (prevents accidental drags)
      if (!hasMoved && Math.abs(deltaX) < DRAG_THRESHOLD && Math.abs(deltaY) < DRAG_THRESHOLD) {
        return;
      }

      hasMoved = true;

      // Scroll with 1.5x multiplier for natural feel (reduced from 2x for better control)
      element.scrollLeft = scrollPosRef.current.left - deltaX * 1.5;
      element.scrollTop = scrollPosRef.current.top - deltaY * 1.5;
    };

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      hasMoved = false;
      element.style.userSelect = '';
      element.style.cursor = 'grab';
    };

    // Use Pointer Events for unified mouse/touch/pen support
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
