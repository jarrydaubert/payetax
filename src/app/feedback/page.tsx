// src/app/feedback/page.tsx
/**
 * Feedback Page - User Feedback and Support Interface
 *
 * This server component provides a feedback collection interface for users to:
 * - Submit bug reports and issues
 * - Provide feature suggestions and improvements
 * - Share general feedback about the calculator
 * - Report accessibility or usability concerns
 *
 * Architecture:
 * - Server component for optimal SEO and initial page load
 * - Client component separation for interactive elements
 * - Suspense boundary for progressive loading
 * - Proper metadata configuration for search engines
 *
 * The page follows Next.js 13+ App Router patterns with proper component
 * separation between server and client components for optimal performance.
 *
 * Features:
 * - Server-side rendering for SEO optimization
 * - Progressive loading with Suspense
 * - Responsive feedback form
 * - Email integration for feedback processing
 * - Professional design matching app aesthetic
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import FeedbackPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Feedback - ToolHubX',
  description: 'Send us your feedback, suggestions, or report issues with the UK Tax Calculator.',
};

/**
 * Feedback Page Server Component
 *
 * Renders the feedback page with proper server/client component separation.
 * Uses Suspense for progressive loading while the client component initializes.
 *
 * @returns JSX element containing the feedback page structure
 */
export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className='glass h-60 animate-pulse rounded-lg' />}>
      <FeedbackPageClient />
    </Suspense>
  );
}
