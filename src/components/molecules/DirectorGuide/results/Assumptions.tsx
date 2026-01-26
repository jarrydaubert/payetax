// src/components/molecules/DirectorGuide/results/Assumptions.tsx
'use client';

import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Region } from '@/lib/validation/directorValidation';

interface AssumptionsProps {
  region: Region;
  taxYear: string;
  className?: string;
}

/**
 * Collapsible assumptions disclosure
 *
 * Keeps results clean while allowing users to see what's assumed.
 */
export function Assumptions({ region, taxYear, className }: AssumptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  const assumptions = [
    'Your company is your only income',
    'Outside IR35',
    'No Employment Allowance claimed',
    'No pension contributions',
    'No student loan repayments',
    'Standard 12-month accounting year',
    'Full-year trading (adjust for shorter periods)',
    `Tax year ${taxYear} (starting April 6)`,
    region === 'scotland'
      ? 'Scottish salary rates, UK dividend rates'
      : 'UK tax rates for both salary and dividends',
  ];

  return (
    <div className={cn('rounded-lg border border-border/50 bg-card/50', className)}>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='flex w-full items-center justify-between px-4 py-3 text-left'
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className='font-medium text-muted-foreground text-sm'>Assumptions we made</span>
        <ChevronDown
          className={cn(
            'size-4 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          aria-hidden='true'
        />
      </button>

      {isOpen && (
        <div id={contentId} className='border-border/50 border-t px-4 pt-3 pb-4'>
          <ul className='space-y-1.5'>
            {assumptions.map((assumption) => (
              <li key={assumption} className='flex items-start gap-2 text-muted-foreground text-sm'>
                <span className='text-primary' aria-hidden='true'>
                  •
                </span>
                {assumption}
              </li>
            ))}
          </ul>
          <p className='mt-3 text-muted-foreground text-xs'>
            If your year crosses April 6, actual tax may differ.
          </p>
        </div>
      )}
    </div>
  );
}
