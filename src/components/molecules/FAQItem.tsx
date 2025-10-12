// src/components/molecules/FAQItem.tsx
import type * as React from 'react';

export interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

export function FAQItem({ question, children }: FAQItemProps) {
  return (
    <details className='group overflow-hidden rounded-xl border-2 border-border/20 bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg'>
      <summary className='cursor-pointer font-bold text-foreground text-lg transition-colors hover:text-primary'>
        {question}
      </summary>
      <div className='mt-4 space-y-3 text-muted-foreground text-sm'>{children}</div>
    </details>
  );
}
