'use client';

import { ErrorState } from '@/components/organisms/ErrorState';

export default function ToolsError({
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
      boundary='tools'
      title='Something went wrong'
      description='This tool hit an unexpected error. Try refreshing, or head back to explore other tools.'
    />
  );
}
