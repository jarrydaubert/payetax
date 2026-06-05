// src/components/molecules/FAQItem.tsx
import type * as React from 'react';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
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
        SPACING.P_6,
      )}
    >
      <summary
        className={cn(
          'cursor-pointer font-display font-semibold text-foreground transition-colors hover:text-primary',
          TYPOGRAPHY.TEXT_LG,
        )}
      >
        {question}
      </summary>
      <div className={cn('mt-4 text-muted-foreground', SPACING.SPACE_Y_3, TYPOGRAPHY.TEXT_SM)}>
        {children}
      </div>
    </details>
  );
}
