// src/components/molecules/DirectorGuide/education/WhatAreDividends.tsx
'use client';

import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/lib/utils';

interface WhatAreDividendsProps {
  className?: string;
}

/**
 * Inline accordion explaining dividends
 *
 * Educates first-time directors on how dividends work.
 */
export function WhatAreDividends({ className }: WhatAreDividendsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <div className={cn('rounded-lg border border-border/50 bg-card/50', className)}>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='flex w-full items-center justify-between px-4 py-3 text-left'
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className='text-muted-foreground text-sm'>What are dividends?</span>
        <ChevronDown
          className={cn(
            'size-4 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          aria-hidden='true'
        />
      </button>

      {isOpen && (
        <div id={contentId} className='border-t border-border/50 px-4 pb-4 pt-3'>
          <div className='space-y-3 text-muted-foreground text-sm'>
            <p>
              <strong className='text-foreground'>Dividends</strong> are payments from company
              profits to shareholders (that&apos;s you, as the owner).
            </p>
            <p>Key differences from salary:</p>
            <ul className='ml-4 list-disc space-y-1'>
              <li>
                <strong className='text-foreground'>No National Insurance</strong> — unlike salary,
                dividends don&apos;t attract NI
              </li>
              <li>
                <strong className='text-foreground'>Lower tax rates</strong> — 8.75% basic rate vs
                20% income tax
              </li>
              <li>
                <strong className='text-foreground'>Only from profits</strong> — you can only pay
                dividends if the company has profit
              </li>
              <li>
                <strong className='text-foreground'>No payroll needed</strong> — just a board minute
                and bank transfer
              </li>
            </ul>
            <p>
              You get a <strong className='text-foreground'>£500 tax-free dividend allowance</strong>{' '}
              each year.
            </p>
            <p className='text-xs'>
              Dividends are taxed on your personal tax return, not through PAYE.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
