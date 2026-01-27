// src/components/molecules/DirectorGuide/dashboard/OtherIncomeGate.tsx
'use client';

import { AlertTriangle, Briefcase, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OtherIncomeGateProps {
  isOpen: boolean;
  onConfirmSoleIncome: () => void;
  onHasOtherIncome: () => void;
  className?: string;
}

/**
 * Gate modal asking if this company is the user's only income source.
 * Critical for accurate calculations - other income affects tax bands.
 */
export function OtherIncomeGate({
  isOpen,
  onConfirmSoleIncome,
  onHasOtherIncome,
  className,
}: OtherIncomeGateProps) {
  if (!isOpen) return null;

  return (
    <div className={cn('fixed inset-0 z-50 overflow-y-auto bg-slate-950', className)}>
      <div className='flex min-h-screen items-center justify-center p-6'>
        <div className='w-full max-w-lg space-y-6'>
          {/* Header */}
          <div className='text-center'>
            <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-cyan-500/10'>
              <AlertTriangle className='size-8 text-cyan-500' />
            </div>
            <h2 className='mb-2 font-semibold text-2xl text-slate-100'>One quick question</h2>
            <p className='text-slate-400'>This helps us give you accurate numbers</p>
          </div>

          {/* Question */}
          <div className='rounded-xl border border-white/10 bg-slate-900 p-6'>
            <p className='mb-6 text-center text-slate-200'>
              Is this company your <strong>only source of income</strong> this tax year?
            </p>

            <div className='grid gap-4 sm:grid-cols-2'>
              {/* Yes - Sole income */}
              <button
                type='button'
                onClick={onConfirmSoleIncome}
                className='group flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-slate-800 p-6 transition-all hover:border-cyan-500/50 hover:bg-slate-800/80'
              >
                <div className='flex size-12 items-center justify-center rounded-full bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/20'>
                  <Building2 className='size-6 text-emerald-500' />
                </div>
                <div className='text-center'>
                  <div className='font-medium text-slate-100'>Yes, only this company</div>
                  <div className='mt-1 text-slate-500 text-sm'>
                    No salary, freelance, or other income
                  </div>
                </div>
              </button>

              {/* No - Has other income */}
              <button
                type='button'
                onClick={onHasOtherIncome}
                className='group flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-slate-800 p-6 transition-all hover:border-amber-500/50 hover:bg-slate-800/80'
              >
                <div className='flex size-12 items-center justify-center rounded-full bg-amber-500/10 transition-colors group-hover:bg-amber-500/20'>
                  <Briefcase className='size-6 text-amber-500' />
                </div>
                <div className='text-center'>
                  <div className='font-medium text-slate-100'>No, I have other income</div>
                  <div className='mt-1 text-slate-500 text-sm'>Job, freelance, rental, etc.</div>
                </div>
              </button>
            </div>
          </div>

          {/* Why this matters */}
          <div className='rounded-lg border border-white/5 bg-slate-900/50 p-4'>
            <p className='text-center text-slate-500 text-sm'>
              <strong className='text-slate-400'>Why does this matter?</strong>
              <br />
              Other income uses up your tax-free allowances, which changes how much tax you'll pay
              on company earnings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
