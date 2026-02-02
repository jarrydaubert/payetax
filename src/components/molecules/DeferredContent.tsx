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
  /**
   * Force render when the current URL hash matches one of these values.
   * Useful when content is deferred but must be reachable via in-page navigation (e.g. navbar anchor links).
   */
  forceRenderOnHash?: string | string[];
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
  forceRenderOnHash,
}: DeferredContentProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hashTargets = Array.isArray(forceRenderOnHash)
      ? forceRenderOnHash
      : forceRenderOnHash
        ? [forceRenderOnHash]
        : [];

    const hashMatches = () => hashTargets.length > 0 && hashTargets.includes(window.location.hash);

    // If the user arrived via an anchor link, render immediately so scrolling can work.
    if (hashMatches()) {
      setShouldRender(true);
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;

    // Fallback timer - only set if timeout > 0
    if (timeout > 0) {
      timer = setTimeout(() => {
        setShouldRender(true);
      }, timeout);
    }

    // If hash changes to a forced target later (e.g. navbar click), render immediately.
    const onHashChange = () => {
      if (hashMatches()) {
        setShouldRender(true);
      }
    };
    window.addEventListener('hashchange', onHashChange);

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
      window.removeEventListener('hashchange', onHashChange);
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [rootMargin, timeout, forceRenderOnHash]);

  if (!shouldRender) {
    return <div ref={ref}>{fallback}</div>;
  }

  return <>{children}</>;
}
