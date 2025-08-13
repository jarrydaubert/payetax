'use client';

import dynamic from 'next/dynamic';

// Dynamically import the client-side Analytics component
const AnalyticsClient = dynamic(
  () => import('./Analytics').then((mod) => ({ default: mod.Analytics })),
  {
    loading: () => null,
    ssr: false,
  }
);

/**
 * Client-side analytics wrapper component
 * This component can safely use the 'ssr: false' option with dynamic imports
 */
export function AnalyticsWrapperClient() {
  return <AnalyticsClient />;
}

export default AnalyticsWrapperClient;
