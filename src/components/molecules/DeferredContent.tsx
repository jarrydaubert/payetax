// src/components/molecules/DeferredContent.tsx
'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';

interface DeferredContentProps {
  children: ReactNode;
  fallback: ReactNode;
  /** Root margin for intersection observer (default: '200px' - preload 200px before visible) */
  rootMargin?: string;
  /** Fallback timeout in ms to ensure content loads even without scroll (default: 2000ms) */
  timeout?: number;
}

/**
 * Defers rendering of children until:
 * 1. The placeholder enters the viewport (with rootMargin buffer), OR
 * 2. The timeout expires (ensures content loads even without user interaction)
 *
 * This improves mobile LCP by not blocking initial render with heavy components.
 */
export function DeferredContent({
  children,
  fallback,
  rootMargin = '200px',
  timeout = 2000,
}: DeferredContentProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Fallback timer - only set if timeout > 0
    if (timeout > 0) {
      timer = setTimeout(() => {
        setShouldRender(true);
      }, timeout);
    }

    // Intersection Observer - load when approaching viewport
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
          if (timer) clearTimeout(timer);
        }
      },
      { rootMargin },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [rootMargin, timeout]);

  if (!shouldRender) {
    return <div ref={ref}>{fallback}</div>;
  }

  return <>{children}</>;
}
