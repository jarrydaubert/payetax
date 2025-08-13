// src/components/analytics/AnalyticsWrapper.tsx
// Server component wrapper for analytics that can be safely imported into the root layout
import { Suspense } from 'react';
import AnalyticsWrapperClient from './AnalyticsWrapperClient';

/**
 * Analytics Wrapper Component
 * This is a server component that safely defers to a client component
 * for actual analytics implementation
 */
export function AnalyticsWrapper() {
  return (
    <Suspense fallback={null}>
      <AnalyticsWrapperClient />
    </Suspense>
  );
}

export default AnalyticsWrapper;
