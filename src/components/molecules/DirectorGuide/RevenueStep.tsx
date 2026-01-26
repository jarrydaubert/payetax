// src/components/molecules/DirectorGuide/RevenueStep.tsx
'use client';

import { Check, PoundSterling } from 'lucide-react';
import { useId, useState } from 'react';
import { Button } from '@/components/atoms/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatNumber, parseFormattedValue } from '@/lib/utils';
import {
  useDirectorFormData,
  useDirectorGuideActions,
  useDirectorGuideStore,
  useIsStepAccessible,
} from '@/store/directorGuideStore';

interface RevenueStepProps {
  className?: string;
}

/**
 * Step 2: Annual revenue input with VAT checkbox
 */
export function RevenueStep({ className }: RevenueStepProps) {
  const { currentStep, stepStatus } = useDirectorGuideStore();
  const formData = useDirectorFormData();
  const { setRevenue, setIncludesVat, completeStep } = useDirectorGuideActions();
  const isAccessible = useIsStepAccessible('revenue');

  const isActive = currentStep === 'revenue';
  const isComplete = stepStatus.revenue;

  const inputId = useId();
  const checkboxId = useId();

  const [displayValue, setDisplayValue] = useState(
    formData.revenue ? formatNumber(formData.revenue, 0) : ''
  );

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplayValue(raw);
    const parsed = parseFormattedValue(raw);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      setRevenue(parsed);
    }
  };

  const handleBlur = () => {
    if (formData.revenue !== undefined && formData.revenue > 0) {
      setDisplayValue(formatNumber(formData.revenue, 0));
    }
  };

  const handleContinue = () => {
    if (formData.revenue && formData.revenue > 0) {
      completeStep('revenue');
    }
  };

  // Completed state
  if (isComplete && !isActive) {
    const displayRevenue = formData.revenue ? `£${formatNumber(formData.revenue, 0)}` : '';
    const vatNote = formData.includesVat ? ' (includes VAT)' : '';

    return (
      <Card className={cn('border-primary/20', className)}>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='flex size-6 items-center justify-center rounded-full bg-primary'>
                <Check className='size-4 text-primary-foreground' />
              </div>
              <CardTitle className='text-base'>What&apos;s your annual revenue?</CardTitle>
            </div>
            <button
              type='button'
              onClick={() => useDirectorGuideStore.getState().editStep('revenue')}
              className='text-primary text-sm hover:underline'
            >
              Edit
            </button>
          </div>
          <p className='ml-8 text-muted-foreground text-sm'>
            {displayRevenue}
            {vatNote}
          </p>
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
              <span className='text-muted-foreground text-xs'>2</span>
            </div>
            <CardTitle className='text-muted-foreground text-base'>
              What&apos;s your annual revenue?
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
            <PoundSterling className='size-4 text-primary-foreground' />
          </div>
          <CardTitle className='text-base'>What&apos;s your annual revenue?</CardTitle>
        </div>
        <p className='ml-8 text-muted-foreground text-sm'>
          How much has your company invoiced (or expect to invoice) for the year ahead?
        </p>
      </CardHeader>
      <CardContent>
        <div className='ml-8 space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor={inputId} className='sr-only'>
              Annual revenue
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
                placeholder='100,000'
                className='pl-7'
                autoFocus
              />
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Checkbox
              id={checkboxId}
              checked={formData.includesVat ?? false}
              onCheckedChange={(checked) => setIncludesVat(checked === true)}
            />
            <Label htmlFor={checkboxId} className='text-sm'>
              This includes VAT (we&apos;ll deduct 20%)
            </Label>
          </div>

          <p className='text-muted-foreground text-xs'>
            💡 Tip: Check your accounting software or bank statements.
          </p>

          <Button
            onClick={handleContinue}
            disabled={!formData.revenue || formData.revenue <= 0}
            className='w-full sm:w-auto'
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
