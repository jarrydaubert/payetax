// src/components/molecules/DirectorGuide/dashboard/MainContent.tsx
'use client';

import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DirectorCalculationResult } from '@/lib/validation/directorValidation';
import { DetailCards } from './DetailCards';
import { MoneyFlowChart } from './MoneyFlowChart';
import { SummaryCards } from './SummaryCards';

interface MainContentProps {
  result: DirectorCalculationResult | null;
  revenue?: number;
  expenses?: number;
  onRecalculate?: () => void;
  className?: string;
}

/**
 * Main content area of the dashboard showing results
 */
export function MainContent({
  result,
  revenue = 0,
  expenses = 0,
  onRecalculate,
  className,
}: MainContentProps) {
  const hasResults = result !== null;

  return (
    <main className={cn('p-6 bg-slate-950', className)}>
      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='font-semibold text-2xl text-slate-100'>
          Director Pay{' '}
          <span className='bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent'>
            Dashboard
          </span>
        </h1>
        {hasResults && (
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={onRecalculate}
              className='flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-slate-400 text-sm transition-all hover:bg-slate-700 hover:text-slate-200'
            >
              <RefreshCw className='size-4' />
              Recalculate
            </button>
          </div>
        )}
      </div>

      {/* Empty state or results */}
      {!hasResults ? (
        <EmptyState />
      ) : (
        <>
          {/* Summary Cards */}
          <SummaryCards result={result} className='mb-6' />

          {/* Detail Grid */}
          <DetailCards result={result} revenue={revenue} expenses={expenses} className='mb-6' />

          {/* Money Flow Chart */}
          <MoneyFlowChart result={result} revenue={revenue} expenses={expenses} />
        </>
      )}
    </main>
  );
}

/**
 * Empty state shown before calculation
 */
function EmptyState() {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/50'>
      <div className='mx-auto max-w-md text-center'>
        <div className='mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20'>
          <svg
            className='size-10 text-cyan-500'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
            />
          </svg>
        </div>
        <h2 className='mb-2 font-semibold text-lg text-slate-100'>Ready to calculate</h2>
        <p className='mb-6 text-slate-500'>
          Enter your company revenue and expenses on the left, then hit <strong>Calculate</strong>{' '}
          to see your optimal salary and dividend mix.
        </p>
        <div className='flex items-center justify-center gap-2 text-slate-600 text-sm'>
          <span className='size-2 animate-pulse rounded-full bg-cyan-500' />
          Waiting for input...
        </div>
      </div>
    </div>
  );
}
