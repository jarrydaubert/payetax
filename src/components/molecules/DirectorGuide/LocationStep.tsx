// src/components/molecules/DirectorGuide/LocationStep.tsx
'use client';

import { Check, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card';
import { cn } from '@/lib/utils';
import type { Region } from '@/lib/validation/directorValidation';
import {
  useDirectorFormData,
  useDirectorGuideActions,
  useDirectorGuideStore,
} from '@/store/directorGuideStore';

interface LocationStepProps {
  className?: string;
}

/**
 * Step 1: Location selection (Scotland vs rest of UK)
 *
 * Determines income tax rates for salary calculation.
 * Scotland has different bands; dividends use UK rates for all.
 */
export function LocationStep({ className }: LocationStepProps) {
  const { currentStep, stepStatus } = useDirectorGuideStore();
  const formData = useDirectorFormData();
  const { setRegion, completeStep } = useDirectorGuideActions();

  const isActive = currentStep === 'location';
  const isComplete = stepStatus.location;

  const handleSelect = (region: Region) => {
    setRegion(region);
    completeStep('location');
  };

  // Completed state - collapsed
  if (isComplete && !isActive) {
    return (
      <Card className={cn('border-primary/20', className)}>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='flex size-6 items-center justify-center rounded-full bg-primary'>
                <Check className='size-4 text-primary-foreground' />
              </div>
              <CardTitle className='text-base'>Where is your main home?</CardTitle>
            </div>
            <button
              type='button'
              onClick={() => useDirectorGuideStore.getState().editStep('location')}
              className='text-primary text-sm hover:underline'
            >
              Edit
            </button>
          </div>
          <p className='ml-8 text-muted-foreground text-sm'>
            {formData.region === 'scotland' ? 'Scotland' : 'England, Wales, or Northern Ireland'}
          </p>
        </CardHeader>
      </Card>
    );
  }

  // Disabled state
  if (!isActive) {
    return (
      <Card className={cn('border-muted/50 opacity-50', className)} aria-hidden='true'>
        <CardHeader className='pb-3'>
          <div className='flex items-center gap-2'>
            <div className='flex size-6 items-center justify-center rounded-full border border-muted-foreground/30'>
              <span className='text-muted-foreground text-xs'>1</span>
            </div>
            <CardTitle className='text-muted-foreground text-base'>
              Where is your main home?
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
            <MapPin className='size-4 text-primary-foreground' />
          </div>
          <CardTitle className='text-base'>Where is your main home?</CardTitle>
        </div>
        <p className='ml-8 text-muted-foreground text-sm'>
          This determines which tax rates apply to your salary.
        </p>
      </CardHeader>
      <CardContent>
        <fieldset className='ml-8 space-y-3'>
          <legend className='sr-only'>Select your location</legend>

          <label
            className={cn(
              'flex w-full cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors',
              'hover:border-primary hover:bg-primary/5',
              formData.region === 'scotland' && 'border-primary bg-primary/10'
            )}
          >
            <input
              type='radio'
              name='region'
              value='scotland'
              checked={formData.region === 'scotland'}
              onChange={() => handleSelect('scotland')}
              className='sr-only'
            />
            <div
              className={cn(
                'flex size-5 items-center justify-center rounded-full border-2',
                formData.region === 'scotland'
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground/30'
              )}
              aria-hidden='true'
            >
              {formData.region === 'scotland' && (
                <Check className='size-3 text-primary-foreground' />
              )}
            </div>
            <span className='font-medium'>Scotland</span>
          </label>

          <label
            className={cn(
              'flex w-full cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors',
              'hover:border-primary hover:bg-primary/5',
              formData.region === 'rUK' && 'border-primary bg-primary/10'
            )}
          >
            <input
              type='radio'
              name='region'
              value='rUK'
              checked={formData.region === 'rUK'}
              onChange={() => handleSelect('rUK')}
              className='sr-only'
            />
            <div
              className={cn(
                'flex size-5 items-center justify-center rounded-full border-2',
                formData.region === 'rUK'
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground/30'
              )}
              aria-hidden='true'
            >
              {formData.region === 'rUK' && <Check className='size-3 text-primary-foreground' />}
            </div>
            <span className='font-medium'>England, Wales, or Northern Ireland</span>
          </label>
        </fieldset>

        <p className='ml-8 mt-4 text-muted-foreground text-xs'>
          <a
            href='https://www.gov.uk/scottish-income-tax'
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary hover:underline'
          >
            I split my time / not sure →
          </a>{' '}
          Tax residency can be complex. Talk to an accountant.
        </p>
      </CardContent>
    </Card>
  );
}
