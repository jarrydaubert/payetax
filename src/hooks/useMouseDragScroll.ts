// src/hooks/useMouseDragScroll.ts
import * as React from 'react';

/**
 * Custom hook to enable mouse drag scrolling on a container element
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
  const isMouseDownRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const startYRef = React.useRef(0);
  const scrollLeftRef = React.useRef(0);
  const scrollTopRef = React.useRef(0);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Ignore if clicking on interactive elements (buttons, links, inputs)
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select')
      ) {
        return;
      }

      isMouseDownRef.current = true;
      startXRef.current = e.pageX - element.offsetLeft;
      startYRef.current = e.pageY - element.offsetTop;
      scrollLeftRef.current = element.scrollLeft;
      scrollTopRef.current = element.scrollTop;

      // Prevent text selection while dragging
      element.style.userSelect = 'none';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current) return;

      e.preventDefault();

      const x = e.pageX - element.offsetLeft;
      const y = e.pageY - element.offsetTop;
      const walkX = (x - startXRef.current) * 2; // Multiplier for scroll speed
      const walkY = (y - startYRef.current) * 2;

      element.scrollLeft = scrollLeftRef.current - walkX;
      element.scrollTop = scrollTopRef.current - walkY;
    };

    const handleMouseUpOrLeave = () => {
      isMouseDownRef.current = false;
      element.style.userSelect = '';
    };

    // Add event listeners
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseup', handleMouseUpOrLeave);
    element.addEventListener('mouseleave', handleMouseUpOrLeave);

    // Cleanup
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseup', handleMouseUpOrLeave);
      element.removeEventListener('mouseleave', handleMouseUpOrLeave);
    };
  }, [ref]);
}
