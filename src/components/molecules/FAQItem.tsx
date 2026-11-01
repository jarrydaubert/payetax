// src/components/molecules/FAQItem.tsx
import type * as React from 'react';
import { cn } from '@/lib/utils';

export interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

/**
 * FAQ accordion item component
 * Uses design tokens for consistent typography and spacing
 */
export function FAQItem({ question, children }: FAQItemProps) {
  return (
    <details
      className={cn(
        'group overflow-hidden rounded-sm border border-border bg-card transition-colors hover:border-primary/45',
        'p-6',
      )}
    >
      <summary
        className={cn(
          'cursor-pointer font-display font-semibold text-foreground transition-colors hover:text-primary',
          'text-lg',
        )}
      >
        {question}
      </summary>
      <div className={cn('mt-4 text-muted-foreground', 'space-y-3', 'text-sm')}>{children}</div>
    </details>
  );
}
