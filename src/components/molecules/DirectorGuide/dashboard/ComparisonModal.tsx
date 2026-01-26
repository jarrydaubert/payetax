// src/components/molecules/DirectorGuide/dashboard/ComparisonModal.tsx
'use client';

import { Check, CircleDollarSign, CreditCard, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Strategy = 'salary-only' | 'salary-dividends' | 'dividends-only';

interface StrategyData {
  id: Strategy;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  monthlyTakeHome: number;
  annualSalary: number;
  dividends: number;
  incomeTax: number;
  dividendTax: number;
  employeeNI: number;
  corpTax: number;
  pros: string[];
  cons: string[];
  recommended?: boolean;
}

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (strategy: Strategy) => void;
  strategies: StrategyData[];
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
 * Comparison modal showing 3 strategy cards side-by-side
 */
export function ComparisonModal({
  isOpen,
  onClose,
  onSelect,
  strategies,
  className,
}: ComparisonModalProps) {
  if (!isOpen) return null;

  const recommended = strategies.find((s) => s.recommended);
  const recommendedMonthly = recommended?.monthlyTakeHome ?? 0;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm'>
      <div className={cn('relative max-h-[90vh] w-full max-w-5xl overflow-y-auto p-6', className)}>
        {/* Close button */}
        <button
          type='button'
          onClick={onClose}
          className='absolute top-2 right-2 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200'
        >
          <X className='size-5' />
        </button>

        {/* Header */}
        <div className='mb-6 text-center'>
          <h2 className='mb-2 font-semibold text-2xl text-slate-100'>
            Compare Your{' '}
            <span className='bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent'>
              Options
            </span>
          </h2>
          <p className='text-slate-400'>
            See how different payment strategies affect your take-home pay
          </p>
        </div>

        {/* Cards grid */}
        <div className='grid grid-cols-3 gap-4 max-lg:grid-cols-1 max-lg:gap-6'>
          {strategies.map((strategy) => {
            const difference = strategy.monthlyTakeHome - recommendedMonthly;

            return (
              <div
                key={strategy.id}
                className={cn(
                  'relative rounded-2xl border-2 bg-slate-800 p-5 transition-all',
                  strategy.recommended
                    ? 'border-cyan-500 bg-gradient-to-b from-cyan-500/10 to-slate-800'
                    : 'border-white/5 hover:border-white/10'
                )}
              >
                {/* Recommended badge */}
                {strategy.recommended && (
                  <div className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-3 py-1 font-semibold text-slate-950 text-xs'>
                    Recommended
                  </div>
                )}

                {/* Header */}
                <div className='mb-5 border-b border-white/5 pb-5 text-center'>
                  <div
                    className={cn(
                      'mx-auto mb-3 flex size-12 items-center justify-center rounded-xl',
                      strategy.recommended
                        ? 'bg-gradient-to-br from-cyan-500 to-emerald-500'
                        : 'bg-slate-700'
                    )}
                  >
                    <strategy.icon
                      className={cn(
                        'size-6',
                        strategy.recommended ? 'text-slate-950' : 'text-slate-400'
                      )}
                    />
                  </div>
                  <h3 className='mb-1 font-semibold text-lg text-slate-100'>{strategy.title}</h3>
                  <p className='text-slate-500 text-sm'>{strategy.description}</p>
                </div>

                {/* Key result */}
                <div className='mb-5 rounded-xl bg-slate-900 p-4 text-center'>
                  <div className='mb-1 text-slate-500 text-xs uppercase tracking-wider'>
                    Monthly Take-Home
                  </div>
                  <div
                    className={cn(
                      'font-bold text-3xl',
                      strategy.recommended
                        ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent'
                        : 'text-slate-100'
                    )}
                  >
                    {formatCurrency(strategy.monthlyTakeHome)}
                  </div>
                  <div
                    className={cn(
                      'mt-1 text-sm',
                      difference > 0
                        ? 'text-emerald-500'
                        : difference < 0
                          ? 'text-red-400'
                          : 'text-slate-500'
                    )}
                  >
                    {difference > 0
                      ? 'Best option'
                      : difference === 0
                        ? 'Best option'
                        : `${formatCurrency(Math.abs(difference))} less vs optimal`}
                  </div>
                </div>

                {/* Metrics */}
                <div className='mb-4 space-y-0'>
                  <MetricRow label='Annual Salary' value={formatCurrency(strategy.annualSalary)} />
                  <MetricRow label='Dividends' value={formatCurrency(strategy.dividends)} />
                  <MetricRow
                    label='Income Tax'
                    value={formatCurrency(strategy.incomeTax)}
                    type={strategy.incomeTax === 0 ? 'best' : 'worst'}
                  />
                  {strategy.dividendTax > 0 && (
                    <MetricRow label='Dividend Tax' value={formatCurrency(strategy.dividendTax)} />
                  )}
                  {strategy.employeeNI > 0 && (
                    <MetricRow
                      label='Employee NI'
                      value={formatCurrency(strategy.employeeNI)}
                      type='worst'
                    />
                  )}
                  <MetricRow
                    label='Corp Tax'
                    value={formatCurrency(strategy.corpTax)}
                    type={
                      strategy.corpTax === Math.min(...strategies.map((s) => s.corpTax))
                        ? 'best'
                        : strategy.corpTax === Math.max(...strategies.map((s) => s.corpTax))
                          ? 'worst'
                          : undefined
                    }
                  />
                </div>

                {/* Pros & Cons */}
                <div className='border-t border-white/5 pt-4'>
                  <div className='mb-2 text-slate-500 text-xs uppercase tracking-wider'>
                    Considerations
                  </div>
                  <div className='space-y-2'>
                    {strategy.pros.map((pro) => (
                      <div key={pro} className='flex items-start gap-2 text-slate-400 text-sm'>
                        <Check className='mt-0.5 size-4 shrink-0 text-emerald-500' />
                        <span>{pro}</span>
                      </div>
                    ))}
                    {strategy.cons.map((con) => (
                      <div key={con} className='flex items-start gap-2 text-slate-400 text-sm'>
                        <X className='mt-0.5 size-4 shrink-0 text-red-400' />
                        <span>{con}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Select button */}
                <button
                  type='button'
                  onClick={() => onSelect(strategy.id)}
                  className={cn(
                    'mt-5 w-full rounded-lg py-3 font-semibold transition-all',
                    strategy.recommended
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/25'
                      : 'border border-white/10 bg-slate-700 text-slate-200 hover:bg-slate-600'
                  )}
                >
                  Select This Option
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface MetricRowProps {
  label: string;
  value: string;
  type?: 'best' | 'worst';
}

function MetricRow({ label, value, type }: MetricRowProps) {
  return (
    <div className='flex items-center justify-between border-b border-white/5 py-2.5 last:border-b-0'>
      <span className='text-slate-400 text-sm'>{label}</span>
      <span
        className={cn(
          'font-medium',
          type === 'best' && 'text-emerald-500',
          type === 'worst' && 'text-red-400',
          !type && 'text-slate-100'
        )}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Generate strategy data from calculation results
 */
export function generateStrategies(
  revenue: number,
  expenses: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  optimalResult: any
): StrategyData[] {
  // These would be calculated properly with different strategies
  // For now, using approximations based on the mockup

  const grossProfit = revenue - expenses;
  const optimalMonthly = optimalResult?.monthlyTakeHome ?? 0;

  // Salary Only: Take everything as salary (after corp tax on minimal profit)
  const salaryOnlyGross = grossProfit * 0.85; // Rough approximation
  const salaryOnlyTax = Math.max(0, (salaryOnlyGross - 12570) * 0.2);
  const salaryOnlyNI = Math.max(0, (salaryOnlyGross - 12570) * 0.08);
  const salaryOnlyNet = salaryOnlyGross - salaryOnlyTax - salaryOnlyNI;

  // Dividends Only: No salary, all dividends
  const dividendsOnlyProfit = grossProfit;
  const dividendsOnlyCorpTax = dividendsOnlyProfit * 0.19;
  const dividendsOnlyGross = dividendsOnlyProfit - dividendsOnlyCorpTax;
  const dividendsOnlyTax = Math.max(0, (dividendsOnlyGross - 500) * 0.0875);
  const dividendsOnlyNet = dividendsOnlyGross - dividendsOnlyTax;

  return [
    {
      id: 'salary-only',
      title: 'Salary Only',
      description: 'Take everything as PAYE salary',
      icon: CreditCard,
      monthlyTakeHome: Math.round(salaryOnlyNet / 12),
      annualSalary: Math.round(salaryOnlyGross),
      dividends: 0,
      incomeTax: Math.round(salaryOnlyTax),
      dividendTax: 0,
      employeeNI: Math.round(salaryOnlyNI),
      corpTax: Math.round(grossProfit * 0.19 * 0.3), // Lower because salary deducted
      pros: ['Simple - one payment type', 'Builds pension entitlement'],
      cons: ['Highest overall tax burden', 'Pays NI on full amount'],
    },
    {
      id: 'salary-dividends',
      title: 'Salary + Dividends',
      description: 'Optimal tax-efficient mix',
      icon: Check,
      monthlyTakeHome: optimalMonthly,
      annualSalary: optimalResult?.salary ?? 12570,
      dividends: optimalResult?.dividendsAvailable ?? 0,
      incomeTax: 0,
      dividendTax: optimalResult?.dividendTax ?? 0,
      employeeNI: 0,
      corpTax: optimalResult?.corporationTax ?? 0,
      pros: [
        'Lowest overall tax',
        'No employee NI on dividends',
        'Salary within Personal Allowance',
      ],
      cons: ['Requires Self Assessment'],
      recommended: true,
    },
    {
      id: 'dividends-only',
      title: 'Dividends Only',
      description: 'No salary, all dividends',
      icon: CircleDollarSign,
      monthlyTakeHome: Math.round(dividendsOnlyNet / 12),
      annualSalary: 0,
      dividends: Math.round(dividendsOnlyGross),
      incomeTax: 0,
      dividendTax: Math.round(dividendsOnlyTax),
      employeeNI: 0,
      corpTax: Math.round(dividendsOnlyCorpTax),
      pros: ['No NI at all', 'Simplest for company admin'],
      cons: ['Misses salary deduction', 'No state pension credit'],
    },
  ];
}
