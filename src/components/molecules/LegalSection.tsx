/**
 * LegalSection Molecule
 *
 * Anchored, prose-styled section for long-form legal/policy content
 * (privacy policy, terms). Provides a consistent heading, scroll offset for
 * in-page anchor links, and readable body spacing.
 *
 * Server Component - presentational only.
 *
 * @module components/molecules/LegalSection
 */

import type React from 'react';
import { cn } from '@/lib/utils';

export interface LegalSectionProps {
  /** Anchor id for in-page navigation */
  id: string;
  /** Section heading */
  title: string;
  /** Section body (prose, lists, tables) */
  children: React.ReactNode;
  /** Optional custom className */
  className?: string;
}

export function LegalSection({ id, title, children, className }: LegalSectionProps) {
  return (
    <section id={id} className={cn('scroll-mt-24', className)} aria-labelledby={`${id}-heading`}>
      <h2
        id={`${id}-heading`}
        className='font-display font-semibold text-2xl text-foreground tracking-tight md:text-3xl'
      >
        {title}
      </h2>
      <div className='mt-4 space-y-4 text-muted-foreground leading-relaxed'>{children}</div>
    </section>
  );
}

LegalSection.displayName = 'LegalSection';
