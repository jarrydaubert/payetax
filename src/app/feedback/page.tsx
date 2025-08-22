import type { Metadata } from 'next';
import { Suspense } from 'react';
import FeedbackPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Feedback - ToolHubX',
  description: 'Send us your feedback, suggestions, or report issues with the UK Tax Calculator.',
};

/**
 * Feedback page with proper separation of server and client components
 */
export default function FeedbackPage() {
  return (
    <Suspense
      fallback={<div className="h-60 glass animate-pulse rounded-lg" />}
    >
      <FeedbackPageClient />
    </Suspense>
  );
}
