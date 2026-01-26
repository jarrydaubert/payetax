// src/components/molecules/DirectorGuide/education/WhyThisSalary.tsx
'use client';

import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/lib/utils';

interface WhyThisSalaryProps {
  className?: string;
}

/**
 * Inline accordion explaining why £12,570 salary
 *
 * Educates directors on the tax-efficient salary strategy.
 */
export function WhyThisSalary({ className }: WhyThisSalaryProps) {
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
        <span className='text-muted-foreground text-sm'>Why this salary amount?</span>
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
              We recommend <strong className='text-foreground'>£12,570/year</strong> (£1,047/month)
              because it&apos;s the sweet spot:
            </p>
            <ul className='ml-4 list-disc space-y-1'>
              <li>
                <strong className='text-foreground'>Uses your Personal Allowance</strong> — the
                first £12,570 of income is tax-free
              </li>
              <li>
                <strong className='text-foreground'>Builds State Pension</strong> — you need to earn
                above £6,725 to qualify for a year&apos;s NI credit
              </li>
              <li>
                <strong className='text-foreground'>Minimises Employer NI</strong> — the company
                pays 15% NI on salary above £5,000
              </li>
              <li>
                <strong className='text-foreground'>Corporation Tax deductible</strong> — salary
                reduces your company&apos;s taxable profit
              </li>
            </ul>
            <p>
              <strong className='text-foreground'>Why not higher?</strong> Every £1 of salary above
              £12,570 costs you 20% income tax + 8% employee NI + 15% employer NI = ~43% effective
              tax. Dividends are taxed at just 8.75% (basic rate).
            </p>
            <p className='text-xs'>
              Some directors take £9,100 (old NI threshold) to avoid all NI, but you&apos;d miss out
              on full State Pension credits.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
