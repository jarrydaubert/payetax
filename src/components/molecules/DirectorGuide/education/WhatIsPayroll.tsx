// src/components/molecules/DirectorGuide/education/WhatIsPayroll.tsx
'use client';

import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/lib/utils';

interface WhatIsPayrollProps {
  className?: string;
}

/**
 * Inline accordion explaining what payroll is
 *
 * Educates first-time directors on PAYE basics.
 */
export function WhatIsPayroll({ className }: WhatIsPayrollProps) {
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
        <span className='text-muted-foreground text-sm'>What&apos;s payroll?</span>
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
              <strong className='text-foreground'>Payroll</strong> is the system for paying
              employees (including you as a director) and reporting to HMRC.
            </p>
            <p>When you run payroll, you:</p>
            <ul className='ml-4 list-disc space-y-1'>
              <li>Calculate tax and National Insurance to deduct</li>
              <li>Pay yourself the net amount</li>
              <li>Report to HMRC what you paid (via RTI)</li>
              <li>Pay the tax/NI to HMRC monthly or quarterly</li>
            </ul>
            <p>
              Most directors use software like{' '}
              <strong className='text-foreground'>FreeAgent</strong>,{' '}
              <strong className='text-foreground'>Xero</strong>, or{' '}
              <strong className='text-foreground'>QuickBooks</strong> — or their accountant handles
              it.
            </p>
            <p className='text-xs'>
              You must register as an employer with HMRC before your first payday.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
