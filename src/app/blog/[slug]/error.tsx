'use client';

import { ErrorState } from '@/components/organisms/ErrorState';

export default function BlogPostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      boundary='blog'
      title='Article not available'
      description="We couldn't load this article. It may have been moved or there was a temporary issue."
    />
  );
}
