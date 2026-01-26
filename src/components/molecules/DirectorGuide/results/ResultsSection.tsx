// src/components/molecules/DirectorGuide/results/ResultsSection.tsx
'use client';

import { AlertTriangle } from 'lucide-react';
import { useId } from 'react';
import { Card, CardContent } from '@/components/atoms/ui/card';
import { cn } from '@/lib/utils';
import {
  type DirectorCalculationResult,
  type DirectorInput,
  isNormalMode,
} from '@/lib/validation/directorValidation';
import { Assumptions } from './Assumptions';
import { CompanyBox } from './CompanyBox';
import { CopyResults } from './CopyResults';
import { HowToDoIt } from './HowToDoIt';
import { PersonalBox } from './PersonalBox';

interface ResultsSectionProps {
  result: DirectorCalculationResult;
  input: DirectorInput;
  className?: string;
}

/**
 * Formats a number as GBP currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Main results section that orchestrates all result components
 *
 * Shows the "two boxes" clarity pattern for company vs personal.
 */
export function ResultsSection({ result, input, className }: ResultsSectionProps) {
  const headingId = useId();

  // Handle survival mode separately
  if (!isNormalMode(result)) {
    return (
      <Card className={cn('border-amber-500/50 bg-amber-500/5', className)}>
        <CardContent className='pt-6'>
          <div className='flex items-start gap-3'>
            <AlertTriangle className='mt-0.5 size-5 shrink-0 text-amber-500' aria-hidden='true' />
            <div>
              <h2 className='font-semibold text-foreground'>
                Your company hasn&apos;t made enough profit yet
              </h2>
              <p className='mt-2 text-muted-foreground text-sm'>
                Based on your numbers, profit is ~{formatCurrency(result.grossProfit)}.
              </p>
              <p className='mt-2 text-muted-foreground text-sm'>
                This isn&apos;t enough to pay yourself a full salary + dividends in the most
                tax-efficient way.
              </p>

              <div className='mt-4'>
                <p className='font-medium text-foreground text-sm'>Your options:</p>
                <ol className='mt-2 space-y-1 text-muted-foreground text-sm'>
                  <li>1. Take a smaller salary (up to your profit)</li>
                  <li>2. Wait until you have more profit before taking dividends</li>
                  <li>
                    3. If you need money now, talk to an accountant about Director&apos;s Loans
                    (there are tax implications)
                  </li>
                </ol>
              </div>

              <p className='mt-4 text-muted-foreground text-sm'>
                This is normal in year 1. Focus on growing the business.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const profit = formatCurrency(result.grossProfit);
  const regionNote =
    result.region === 'scotland' ? 'Scottish resident: Your salary uses Scottish tax rates' : null;

  return (
    <section className={cn('space-y-6', className)} aria-labelledby={headingId}>
      {/* Header */}
      <div>
        <h2 id={headingId} className='font-semibold text-foreground text-xl'>
          Here&apos;s what we worked out
        </h2>
        <p className='mt-1 text-muted-foreground text-sm'>
          Based on ~{profit} profit for the year ahead
        </p>
        {regionNote && <p className='mt-1 text-muted-foreground text-xs'>[{regionNote}]</p>}
      </div>

      {/* Two Boxes - Company vs Personal */}
      <div className='grid gap-4 md:grid-cols-2'>
        <CompanyBox result={result} />
        <PersonalBox result={result} />
      </div>

      {/* How To Do It */}
      <HowToDoIt result={result} />

      {/* Assumptions */}
      <Assumptions region={result.region} taxYear={result.taxYear} />

      {/* Disclaimer + Actions */}
      <Card className='border-border/50 bg-card/50'>
        <CardContent className='pt-6'>
          <div className='flex items-start gap-3'>
            <AlertTriangle className='mt-0.5 size-5 shrink-0 text-amber-500' aria-hidden='true' />
            <div className='flex-1'>
              <p className='font-medium text-foreground text-sm'>Important</p>
              <p className='mt-1 text-muted-foreground text-sm'>
                This is a rough estimate, not advice. For precision and to make sure you&apos;re
                doing it right, talk to an accountant.
              </p>
            </div>
          </div>

          <div className='mt-4 flex flex-wrap gap-3'>
            <CopyResults result={result} input={input} />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
