// src/components/organisms/CalculatorContainer.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Download, Mail, Sparkles } from 'lucide-react';
import * as React from 'react';
import { EmailResultsForm } from '@/components/molecules/EmailResultsForm';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ANIMATION_TRANSITIONS, ANIMATION_VARIANTS } from '@/constants/animationTokens';
import { BREAKPOINTS, TIMERS } from '@/constants/ui';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { trackEvent } from '@/lib/analytics';
import type { TaxCalculationResults } from '@/lib/types/calculator';
import { cn, formatCurrency } from '@/lib/utils';
import type { PayeEmailInput } from '@/lib/validation/emailValidation';
import { useShallow } from '@/lib/zustandShallow';
import {
  useCalculatorActions,
  useCalculatorResults,
  useCalculatorStore,
} from '@/store/calculatorStore';
import { CalculatorInputsSection } from './CalculatorInputs/CalculatorInputsSection';
import { ResultsSummaryCards } from './CalculatorResults/ResultsSummaryCards';
import { ResultsTable } from './CalculatorResults/ResultsTable';

type ResultExportInput = Pick<
  PayeEmailInput,
  | 'salary'
  | 'payPeriod'
  | 'taxYear'
  | 'taxCode'
  | 'studentLoanPlans'
  | 'pensionContribution'
  | 'pensionContributionType'
> & {
  region: string;
};

const RESULT_EXPORT_PERIODS = [
  { key: 'annually', label: 'Annual' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'weekly', label: 'Weekly' },
] as const;

function getStudentLoanLabel(plans: ResultExportInput['studentLoanPlans']): string {
  if (plans === 'none') return 'None';
  return plans.map((plan) => plan.replace('plan', 'Plan ')).join(' + ');
}

function buildResultsSummaryText(input: ResultExportInput, results: TaxCalculationResults): string {
  return [
    'PayeTax PAYE estimate',
    `Tax year: ${input.taxYear}`,
    `Region: ${input.region}`,
    `Salary: ${formatCurrency(input.salary, 0)} ${input.payPeriod}`,
    `Tax code: ${input.taxCode || 'Standard personal allowance'}`,
    `Student loan: ${getStudentLoanLabel(input.studentLoanPlans)}`,
    `Pension: ${input.pensionContribution}${input.pensionContributionType === 'percentage' ? '%' : ''}`,
    '',
    `Annual take-home: ${formatCurrency(results.netPay.annually)}`,
    `Monthly take-home: ${formatCurrency(results.netPay.monthly)}`,
    `Annual income tax: ${formatCurrency(results.incomeTax.annually)}`,
    `Annual National Insurance: ${formatCurrency(results.nationalInsurance.annually)}`,
    `Annual student loan: ${formatCurrency(results.studentLoan.annually)}`,
    `Annual pension contribution: ${formatCurrency(results.pensionContribution.annually)}`,
    '',
    'Illustrative only. Not financial or tax advice.',
    'Source: https://payetax.co.uk/',
  ].join('\n');
}

function escapeCsvValue(value: string | number): string {
  const text = String(value);
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}

function buildResultsCsv(input: ResultExportInput, results: TaxCalculationResults): string {
  const metadataRows = [
    ['PayeTax PAYE estimate'],
    ['Tax year', input.taxYear],
    ['Region', input.region],
    ['Salary', input.salary],
    ['Pay period', input.payPeriod],
    ['Tax code', input.taxCode || 'Standard personal allowance'],
    ['Student loan', getStudentLoanLabel(input.studentLoanPlans)],
    [],
  ];

  const resultRows = [
    [
      'Period',
      'Gross salary',
      'Income tax',
      'National Insurance',
      'Student loan',
      'Pension',
      'Take-home pay',
    ],
    ...RESULT_EXPORT_PERIODS.map(({ key, label }) => [
      label,
      results.grossSalary[key],
      results.incomeTax[key],
      results.nationalInsurance[key],
      results.studentLoan[key],
      results.pensionContribution[key],
      results.netPay[key],
    ]),
  ];

  return [...metadataRows, ...resultRows]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n');
}

async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    if (!document.execCommand('copy')) {
      throw new Error('Clipboard fallback failed');
    }
  } finally {
    textarea.remove();
  }
}

function downloadTextFile(filename: string, contents: string, mimeType: string): void {
  if (typeof URL.createObjectURL !== 'function') {
    throw new Error('Downloads are not supported in this browser');
  }

  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function CalculatorContainer() {
  // Use optimized selectors to prevent unnecessary re-renders
  const results = useCalculatorResults();
  const previousYearResults = useCalculatorStore((state) => state.previousYearResults);
  const input = useCalculatorStore(
    useShallow((state) => ({
      salary: state.input.salary,
      payPeriod: state.input.payPeriod,
      taxYear: state.input.taxYear,
      taxCode: state.input.taxCode,
      isScottish: state.input.isScottish,
      isMarried: state.input.isMarried,
      partnerGrossWage: state.input.partnerGrossWage,
      isBlind: state.input.isBlind,
      age: state.input.age,
      payNoNI: state.input.payNoNI,
      pensionContribution: state.input.pensionContribution,
      pensionContributionType: state.input.pensionContributionType,
      studentLoanPlans: state.input.studentLoanPlans,
      niCategory: state.input.niCategory,
      hoursPerWeek: state.input.hoursPerWeek,
      allowancesDeductions: state.input.allowancesDeductions,
      incomeSources: state.input.incomeSources,
      region: state.input.region,
    })),
  );
  const { calculate, calculatePreviousYear, setInput } = useCalculatorActions();
  const [, startTransition] = React.useTransition();
  const [visiblePeriods, setVisiblePeriods] = React.useState<string[]>([
    'Yearly',
    'Monthly',
    'Weekly',
    'Daily',
    'Hourly',
  ]);
  const [actionMessage, setActionMessage] = React.useState<{
    tone: 'info' | 'error';
    text: string;
  } | null>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);
  const hasTrackedCalculatorStartRef = React.useRef(false);
  const calcScrollTimeoutRef = React.useRef<number | null>(null);
  const shouldReduceMotion = useMotionPreference();

  // SR-only live region message (event-driven, not region-driven)
  const [liveMessage, setLiveMessage] = React.useState('');

  // Derive showResults from results state
  const showResults = !!results;
  const emailInput: PayeEmailInput = {
    salary: input.salary,
    payPeriod: input.payPeriod,
    taxYear: input.taxYear,
    taxCode: input.taxCode,
    isScottish: input.isScottish,
    isMarried: input.isMarried,
    partnerGrossWage: input.partnerGrossWage,
    isBlind: input.isBlind,
    age: input.age,
    payNoNI: input.payNoNI,
    pensionContribution: input.pensionContribution,
    pensionContributionType: input.pensionContributionType,
    studentLoanPlans: input.studentLoanPlans,
    niCategory: input.niCategory,
    hoursPerWeek: input.hoursPerWeek,
    allowancesDeductions: input.allowancesDeductions,
    incomeSources: input.incomeSources?.length
      ? input.incomeSources.map(({ type, amount, period }) => ({ type, amount, period }))
      : undefined,
  };

  // Cleanup timeouts on unmount to prevent memory leaks
  React.useEffect(() => {
    return () => {
      if (calcScrollTimeoutRef.current) clearTimeout(calcScrollTimeoutRef.current);
    };
  }, []);

  const handleCalculate = () => {
    setActionMessage(null);

    if (!hasTrackedCalculatorStartRef.current) {
      trackEvent({
        action: 'calculator_start',
        category: 'funnel',
        label: 'paye_calculator',
      });
      hasTrackedCalculatorStartRef.current = true;
    }

    // Use React 18's useTransition to mark calculations as non-urgent
    // This keeps the UI responsive during heavy computations
    startTransition(() => {
      calculate();
      calculatePreviousYear();
    });

    if (/\s*(W1|M1|X)$/i.test(input.taxCode)) {
      setActionMessage({
        tone: 'info',
        text: 'Emergency tax code detected. W1, M1, and X codes are non-cumulative and may differ from your final annual tax position.',
      });
    }

    // Announce for screen readers (event-driven)
    setLiveMessage('Tax calculation complete. Results updated.');

    // Clear any pending scroll timeout
    if (calcScrollTimeoutRef.current) clearTimeout(calcScrollTimeoutRef.current);

    // Only scroll to results on mobile (desktop has everything visible)
    calcScrollTimeoutRef.current = window.setTimeout(() => {
      if (window.innerWidth < BREAKPOINTS.LG) {
        resultsRef.current?.scrollIntoView({
          behavior: shouldReduceMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    }, TIMERS.CALC_SCROLL);
  };

  const handleVisiblePeriodsChange = (periods: string[]) => {
    setVisiblePeriods(periods);
  };

  const handleCopyResults = async () => {
    if (!results) return;

    try {
      await copyTextToClipboard(buildResultsSummaryText(input, results));
      setActionMessage({
        tone: 'info',
        text: 'Results copied. The summary stayed in your browser.',
      });
      setLiveMessage('Tax result summary copied to clipboard.');
      trackEvent({
        action: 'result_shared',
        category: 'calculator',
        label: 'copy_results',
      });
    } catch (error) {
      console.error('[CalculatorContainer] Failed to copy results:', error);
      setActionMessage({
        tone: 'error',
        text: 'Could not copy results. Please try again or use email results.',
      });
    }
  };

  const handleDownloadCsv = () => {
    if (!results) return;

    try {
      const roundedSalary = Math.round(input.salary);
      const filename = `payetax-${input.taxYear}-${roundedSalary || 'results'}.csv`;
      downloadTextFile(filename, buildResultsCsv(input, results), 'text/csv;charset=utf-8');
      setActionMessage({
        tone: 'info',
        text: 'CSV downloaded in your browser.',
      });
      setLiveMessage('Tax results CSV downloaded.');
      trackEvent({
        action: 'result_shared',
        category: 'calculator',
        label: 'download_csv',
      });
    } catch (error) {
      console.error('[CalculatorContainer] Failed to download CSV:', error);
      setActionMessage({
        tone: 'error',
        text: 'Could not download the CSV in this browser.',
      });
    }
  };

  const handleApplyPensionOptimization = (pensionAmount: number) => {
    setActionMessage(null);
    try {
      // Validate pension amount
      if (typeof pensionAmount !== 'number' || Number.isNaN(pensionAmount) || pensionAmount < 0) {
        console.error('[CalculatorContainer] Invalid pension amount:', pensionAmount);
        setActionMessage({
          tone: 'error',
          text: 'Invalid pension amount. Please enter a valid pension contribution.',
        });
        return;
      }

      // Update both fields in one store write so the immediate recalculation reads the new value.
      setInput({
        pensionContribution: pensionAmount,
        pensionContributionType: 'amount',
      });

      // Recalculate
      calculate();
      calculatePreviousYear();

      // Show success message
      const formattedAmount = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
      }).format(pensionAmount);
      setLiveMessage(`${formattedAmount} pension contribution applied. Results updated.`);
    } catch (error) {
      console.error('[CalculatorContainer] Error applying pension:', error);
      setActionMessage({
        tone: 'error',
        text: 'Failed to apply pension contribution. Please try entering the amount manually.',
      });
    }
  };

  const resultActions = (
    <div className='flex shrink-0 items-center gap-2'>
      <button
        type='button'
        className='inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        aria-label='Copy tax calculation results'
        title='Copy Results'
        onClick={handleCopyResults}
      >
        <Copy className='h-4 w-4' />
        <span className='sr-only'>Copy Results</span>
      </button>
      <button
        type='button'
        className='inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        aria-label='Download results as CSV file'
        title='Download CSV'
        onClick={handleDownloadCsv}
      >
        <Download className='h-4 w-4' />
        <span className='sr-only'>Download CSV</span>
      </button>
      <Dialog>
        <DialogTrigger asChild>
          <button
            type='button'
            className='inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            aria-label='Email tax calculation results'
            title='Email Results'
          >
            <Mail className='h-4 w-4' />
            <span className='sr-only'>Email Results</span>
          </button>
        </DialogTrigger>
        <DialogContent className='border-border/60 bg-card text-card-foreground sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Email Results</DialogTitle>
            <DialogDescription>Send a copy of this calculation to your inbox.</DialogDescription>
          </DialogHeader>
          <EmailResultsForm input={emailInput} className='w-full' />
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-screen-2xl flex-col sm:px-4 md:py-8 lg:grid lg:grid-cols-[400px_minmax(0,1fr)] xl:grid-cols-[390px_minmax(0,1fr)] xl:px-8 2xl:grid-cols-[380px_minmax(0,1fr)]',
        'gap-3',
        'px-4',
        'py-4',
        'md:gap-6 lg:gap-4 xl:gap-6',
      )}
      data-testid='calculator-section'
    >
      {/* Header - CSS animation for better mobile LCP (no JS blocking) */}
      <div
        className={cn(
          'order-1 grid gap-4 border-border border-y py-5 text-left lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-end lg:py-6',
          'fade-in slide-in-from-top-4 animate-in duration-500',
        )}
      >
        <div>
          <p className='mb-2 font-semibold text-primary text-xs uppercase tracking-[0.18em]'>
            Calculator
          </p>
          <h2 className='font-display font-semibold text-3xl text-foreground leading-tight md:text-4xl'>
            Calculate your take-home pay
          </h2>
          <p className='mt-2 max-w-2xl text-muted-foreground text-sm md:text-base'>
            Enter a salary, choose the tax year and region, then check the period-by-period
            breakdown against official HMRC rates.
          </p>
        </div>
        <p className='border-border border-t pt-3 text-muted-foreground text-xs leading-relaxed lg:border-t-0 lg:border-l lg:pl-5'>
          <strong className='font-semibold text-foreground'>Illustrative only.</strong> Not
          financial or tax advice. Based on HMRC rates for {input.taxYear}, which may change.
        </p>
      </div>

      {/* Summary Cards - Between inputs and table on mobile (order-4), top on desktop (order-2) */}
      <AnimatePresence mode='wait'>
        {showResults && results && (
          <motion.div
            ref={resultsRef}
            variants={shouldReduceMotion ? {} : ANIMATION_VARIANTS.fadeInDown}
            initial={shouldReduceMotion ? {} : 'initial'}
            animate={shouldReduceMotion ? {} : 'animate'}
            exit={shouldReduceMotion ? {} : 'exit'}
            transition={shouldReduceMotion ? { duration: 0 } : ANIMATION_TRANSITIONS.default}
            className='order-4 scroll-mt-6 lg:order-2 lg:col-span-2'
            role='region'
            aria-label='Tax calculation results summary'
          >
            <ResultsSummaryCards results={results} taxYear={input.taxYear} input={input} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* SR-only live region for announcing state changes (event-driven) */}
      <div aria-live='polite' aria-atomic='true' className='sr-only'>
        {liveMessage}
      </div>

      {/* Inputs Section - order-2 on mobile, left column on desktop (sticky) */}
      <Card
        className={cn(
          'order-2 mx-auto w-full max-w-xl lg:sticky lg:top-4 lg:order-3 lg:mx-0 lg:max-w-none lg:self-start',
          'p-3',
          'sm:p-4 md:p-6',
        )}
      >
        <CalculatorInputsSection
          onCalculate={handleCalculate}
          resultAction={showResults ? resultActions : undefined}
        />
      </Card>

      {/* Results column - order-6 on mobile, right column on desktop */}
      <AnimatePresence mode='wait'>
        {showResults && results ? (
          <motion.div
            variants={shouldReduceMotion ? {} : ANIMATION_VARIANTS.scaleIn}
            initial={shouldReduceMotion ? {} : 'initial'}
            animate={shouldReduceMotion ? {} : 'animate'}
            exit={shouldReduceMotion ? {} : 'exit'}
            transition={shouldReduceMotion ? { duration: 0 } : ANIMATION_TRANSITIONS.default}
            className={cn('order-6 flex flex-col', 'gap-4', 'lg:order-3 lg:min-w-0 lg:self-start')}
            data-testid='tax-results'
          >
            <ResultsTable
              results={results}
              studentLoans={input.studentLoanPlans !== 'none' ? input.studentLoanPlans : []}
              allowancesDeductions={input.allowancesDeductions}
              previousYearResults={previousYearResults}
              visiblePeriods={visiblePeriods}
              onVisiblePeriodsChange={handleVisiblePeriodsChange}
              taxYear={input.taxYear}
              onApplyPensionOptimization={handleApplyPensionOptimization}
              marriageAllowance={{
                isMarried: input.isMarried,
                partnerGrossWage: input.partnerGrossWage,
                taxCode: input.taxCode,
                isScottish: input.region === 'Scotland',
              }}
            />
            {actionMessage && (
              <motion.p
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
                className={cn(
                  'rounded-md border px-3 py-2 text-sm',
                  actionMessage.tone === 'error'
                    ? 'border-destructive/30 bg-destructive/10 text-destructive'
                    : 'border-primary/30 bg-primary/10 text-primary',
                )}
                role={actionMessage.tone === 'error' ? 'alert' : 'status'}
              >
                {actionMessage.text}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
            className={cn(
              'order-6 flex min-h-[28rem] items-center justify-center rounded-sm border border-dashed bg-card/70 text-center lg:order-3',
              'p-12',
            )}
          >
            <div>
              <Sparkles className={cn('mx-auto text-muted-foreground', 'mb-4', 'size-12')} />
              <h3 className={cn('font-semibold', 'mb-2', 'text-lg')}>Ready to Calculate</h3>
              <p className={cn('text-muted-foreground', 'text-sm')}>
                Enter your salary. See your take-home pay in seconds.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
