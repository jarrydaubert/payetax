'use client';

import './globals.css';
import { ErrorState } from '@/components/organisms/ErrorState';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang='en'>
      <body className='min-h-dvh bg-background text-foreground'>
        <ErrorState error={error} reset={reset} boundary='global' />
      </body>
    </html>
  );
}
