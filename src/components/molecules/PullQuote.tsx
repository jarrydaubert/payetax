// src/components/molecules/PullQuote.tsx
/**
 * Pull Quote Component
 *
 * Decorative quote block with left border accent.
 * Used to break up content and add visual interest.
 *
 * @see docs/planning/BLOG_PAGE_BUILD.md
 */

import { cn } from '@/lib/utils';

interface PullQuoteProps {
  text: string;
  attribution: string;
  className?: string;
}

export function PullQuote({ text, attribution, className }: PullQuoteProps) {
  return (
    <aside
      role='note'
      className={cn(
        'relative my-8 py-6 pl-6',
        'border-gradient-to-b border-l-4 from-cyan-500 to-emerald-500',
        className
      )}
      style={{
        borderImage: 'linear-gradient(to bottom, #06b6d4, #10b981) 1',
      }}
    >
      <blockquote>
        <p className='font-display font-medium text-lg text-white md:text-xl lg:text-2xl'>
          &ldquo;{text}&rdquo;
        </p>
        <footer className='mt-4'>
          <cite className='text-slate-400 text-sm not-italic'>— {attribution}</cite>
        </footer>
      </blockquote>
    </aside>
  );
}

export default PullQuote;
