/**
 * Director Guide Welcome Dialog
 *
 * First-visit modal to set expectations for the Director Pay Calculator.
 */
'use client';

import { useEffect, useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { safeGetItem, safeSetItem } from '@/lib/safeStorage';

const DISMISS_KEY = 'directorGuideWelcome:dismissed:v1';

export function DirectorGuideWelcomeDialog() {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const checkboxId = useId();

  useEffect(() => {
    const dismissed = safeGetItem(DISMISS_KEY) === 'true';
    if (!dismissed) {
      setOpen(true);
    }
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && dontShowAgain) {
      safeSetItem(DISMISS_KEY, 'true');
    }
    setOpen(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='border-border/50 bg-card/95 text-foreground shadow-2xl backdrop-blur-xl sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Welcome to the Director Pay Calculator</DialogTitle>
          <DialogDescription>A quick overview before you start.</DialogDescription>
        </DialogHeader>

        <div className='mt-4 space-y-5 text-sm'>
          <section>
            <h3 className='font-medium text-foreground'>What it does</h3>
            <ul className='mt-2 list-disc space-y-1 pl-5 text-muted-foreground'>
              <li>Shows how to pay yourself tax-efficiently (salary vs dividends)</li>
              <li>Compares three strategies side by side</li>
              <li>Tells you what to set aside for tax</li>
            </ul>
          </section>

          <section>
            <h3 className='font-medium text-foreground'>What it needs from you</h3>
            <ul className='mt-2 list-disc space-y-1 pl-5 text-muted-foreground'>
              <li>Your annual revenue and expenses (best guess is fine)</li>
            </ul>
          </section>

          <section>
            <h3 className='font-medium text-foreground'>Coming soon</h3>
            <ul className='mt-2 list-disc space-y-1 pl-5 text-muted-foreground'>
              <li>Downloadable tax pack</li>
              <li>Calendar reminders</li>
            </ul>
          </section>
        </div>

        <div className='mt-5 flex items-center gap-2'>
          <Checkbox
            id={checkboxId}
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked === true)}
          />
          <Label htmlFor={checkboxId} className='text-muted-foreground text-sm'>
            Don&apos;t show again
          </Label>
        </div>

        <DialogFooter className='mt-6'>
          <Button type='button' onClick={() => handleOpenChange(false)} variant='brandOutline'>
            Got it, let&apos;s start
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
