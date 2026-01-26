// src/components/molecules/DirectorGuide/ExpensesStep.tsx
'use client';

import { Check, Receipt } from 'lucide-react';
import { useId, useState } from 'react';
import { Button } from '@/components/atoms/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatNumber, parseFormattedValue } from '@/lib/utils';
import {
  useDirectorFormData,
  useDirectorGuideActions,
  useDirectorGuideStore,
  useIsStepAccessible,
} from '@/store/directorGuideStore';

interface ExpensesStepProps {
  className?: string;
}

/**
 * Step 3: Business expenses input
 */
export function ExpensesStep({ className }: ExpensesStepProps) {
  const { currentStep, stepStatus } = useDirectorGuideStore();
  const formData = useDirectorFormData();
  const { setExpenses, completeStep } = useDirectorGuideActions();
  const isAccessible = useIsStepAccessible('expenses');

  const isActive = currentStep === 'expenses';
  const isComplete = stepStatus.expenses;

  const inputId = useId();

  const [displayValue, setDisplayValue] = useState(
    formData.expenses !== undefined ? formatNumber(formData.expenses, 0) : ''
  );

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplayValue(raw);
    const parsed = parseFormattedValue(raw);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      setExpenses(parsed);
    }
  };

  const handleBlur = () => {
    if (formData.expenses !== undefined) {
      setDisplayValue(formatNumber(formData.expenses, 0));
    }
  };

  const handleContinue = () => {
    if (formData.expenses !== undefined) {
      completeStep('expenses');
    }
  };

  // Completed state
  if (isComplete && !isActive) {
    const displayExpenses =
      formData.expenses !== undefined ? `£${formatNumber(formData.expenses, 0)}` : '£0';

    return (
      <Card className={cn('border-primary/20', className)}>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='flex size-6 items-center justify-center rounded-full bg-primary'>
                <Check className='size-4 text-primary-foreground' />
              </div>
              <CardTitle className='text-base'>What are your business expenses?</CardTitle>
            </div>
            <button
              type='button'
              onClick={() => useDirectorGuideStore.getState().editStep('expenses')}
              className='text-primary text-sm hover:underline'
            >
              Edit
            </button>
          </div>
          <p className='ml-8 text-muted-foreground text-sm'>{displayExpenses}</p>
        </CardHeader>
      </Card>
    );
  }

  // Disabled state
  if (!(isActive && isAccessible)) {
    return (
      <Card
        className={cn('border-muted/50 opacity-50', className)}
        aria-hidden='true'
        tabIndex={-1}
      >
        <CardHeader className='pb-3'>
          <div className='flex items-center gap-2'>
            <div className='flex size-6 items-center justify-center rounded-full border border-muted-foreground/30'>
              <span className='text-muted-foreground text-xs'>3</span>
            </div>
            <CardTitle className='text-muted-foreground text-base'>
              What are your business expenses?
            </CardTitle>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Active state
  return (
    <Card className={cn('border-primary', className)} aria-live='polite'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <div className='flex size-6 items-center justify-center rounded-full bg-primary'>
            <Receipt className='size-4 text-primary-foreground' />
          </div>
          <CardTitle className='text-base'>What are your business expenses?</CardTitle>
        </div>
        <p className='ml-8 text-muted-foreground text-sm'>
          Software, equipment, travel, contractors - that kind of thing. Don&apos;t include money
          you&apos;ve paid yourself.
        </p>
      </CardHeader>
      <CardContent>
        <div className='ml-8 space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor={inputId} className='sr-only'>
              Business expenses
            </Label>
            <div className='relative'>
              <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                £
              </span>
              <Input
                id={inputId}
                type='text'
                inputMode='numeric'
                value={displayValue}
                onChange={handleValueChange}
                onBlur={handleBlur}
                placeholder='20,000'
                className='pl-7'
                autoFocus
              />
            </div>
          </div>

          {formData.includesVat && (
            <p className='rounded-lg bg-primary/10 p-3 text-sm'>
              💡 If you&apos;re VAT registered and reclaim VAT on expenses, try to enter expenses
              excluding VAT for a more accurate estimate.
            </p>
          )}

          <Button
            onClick={handleContinue}
            disabled={formData.expenses === undefined}
            className='w-full sm:w-auto'
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
