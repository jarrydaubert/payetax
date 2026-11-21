'use client';

import { ChevronDown } from 'lucide-react';
import { type MouseEvent, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  clearFigures,
  rememberFigures,
  syncFigureStorage,
  useFigureStorage,
} from '@/lib/figureStorage';
import { cn } from '@/lib/utils';

export const LEGACY_RESTORE_SELECTOR = '[data-legacy-restore]';

export function FigureStorageAlert({ className }: { className?: string }) {
  const unavailable = useFigureStorage((state) => state.unavailable);
  const erasureFailed = useFigureStorage((state) => state.erasureFailed);
  if (!(unavailable || erasureFailed)) return null;

  return (
    <p role='alert' className={cn('text-sm', className)}>
      {erasureFailed
        ? 'Current figures were cleared, but saved data could not be fully removed. Allow site storage and clear again, or remove this site’s data in your browser settings.'
        : 'Remembering is off because this browser cannot save figures reliably. You can still calculate. Previously saved data may remain; use your browser settings to remove it.'}
    </p>
  );
}

export function FigureStorageControls() {
  const detailsId = useId();
  const legacyReasonId = `${detailsId}-legacy`;
  const restoreDetailsId = `${detailsId}-restore`;
  const clearDetailsId = `${detailsId}-clear`;
  const optionsId = `${detailsId}-options`;
  const { enabled, legacy, unavailable, erasureFailed } = useFigureStorage();
  const checkbox = useRef<HTMLInputElement>(null);
  const returnFocus = useRef(false);
  const requestPending = useRef(false);
  const [feedback, setFeedback] = useState<'pending' | 'superseded' | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const pending = feedback === 'pending';
  useEffect(() => {
    syncFigureStorage();
  }, []);
  useEffect(() => {
    if (enabled) setFeedback((current) => (current === 'superseded' ? null : current));
  }, [enabled]);
  useEffect(() => {
    if (legacy || !returnFocus.current) return;
    returnFocus.current = false;
    const input = checkbox.current;
    if (input && input.ownerDocument.activeElement === input.ownerDocument.body) input.focus();
  }, [legacy]);

  async function enableRemembering(restoreLegacy = false) {
    if (requestPending.current) return;
    requestPending.current = true;
    setFeedback('pending');
    let superseded = false;
    try {
      superseded = (await rememberFigures(restoreLegacy)) === 'superseded';
    } finally {
      requestPending.current = false;
      setFeedback(superseded && !useFigureStorage.getState().enabled ? 'superseded' : null);
    }
  }

  function clearRemembering() {
    setFeedback((current) => (current === 'pending' ? current : null));
    return clearFigures();
  }

  async function chooseLegacyAction(event: MouseEvent<HTMLButtonElement>, restore: boolean) {
    const action = event.currentTarget;
    returnFocus.current = action === action.ownerDocument.activeElement;
    await (restore ? enableRemembering(true) : clearRemembering());
    if (useFigureStorage.getState().legacy) returnFocus.current = false;
  }

  return (
    <section aria-label='Remember figures' className='border-t border-border pt-2 text-sm'>
      <div className='flex flex-wrap items-start gap-x-3'>
        <div className='min-w-0 grow basis-52'>
          <label
            className={cn(
              'flex min-h-11 items-center gap-2 font-medium',
              legacy ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer',
            )}
          >
            <input
              ref={checkbox}
              type='checkbox'
              className='size-5 shrink-0 accent-primary disabled:cursor-not-allowed disabled:opacity-50'
              checked={enabled}
              aria-label='Remember figures on this device (PAYE and Director)'
              aria-describedby={legacy ? `${legacyReasonId} ${detailsId}` : detailsId}
              disabled={legacy}
              aria-disabled={pending || undefined}
              onChange={(event) => {
                if (requestPending.current) return;
                if (event.target.checked) enableRemembering();
                else clearRemembering();
              }}
            />
            Remember figures on this device
          </label>
          <p id={detailsId} className='text-xs text-muted-foreground'>
            Saves only your PAYE and Director inputs.
            {enabled &&
              ' Turning this off clears figures and results for both calculators in open tabs.'}
          </p>
        </div>
        {!legacy && (
          <Button
            type='button'
            variant='ghost'
            size='touch'
            className='px-2 text-muted-foreground hover:text-foreground'
            aria-expanded={optionsOpen}
            aria-controls={optionsId}
            onClick={() => setOptionsOpen((open) => !open)}
          >
            Saved data options
            <ChevronDown
              aria-hidden='true'
              className={cn('transition-transform', optionsOpen && 'rotate-180')}
            />
          </Button>
        )}
      </div>
      {legacy && (
        <p id={legacyReasonId} className='mt-3 font-medium'>
          Your previously saved figures haven’t been loaded. Choose Restore or Clear to enable this
          checkbox.
        </p>
      )}
      <p aria-live='polite' aria-atomic='true' className='text-xs'>
        {pending && 'Waiting to save preference…'}
        {feedback === 'superseded' &&
          !enabled &&
          !unavailable &&
          !erasureFailed &&
          'Remembering is still off because saved figures changed. You can try again.'}
      </p>
      {legacy && (
        <div className='mt-2 mb-3 space-y-3'>
          <p className='text-xs text-muted-foreground'>
            <span id={restoreDetailsId}>
              Restoring replaces the corresponding figures here and clears figures in other open
              tabs.
            </span>{' '}
            <span id={clearDetailsId}>
              Clearing discards current figures and results in all open tabs and deletes saved
              figures for both calculators. Analytics preferences are separate.
            </span>
          </p>
          <div className='flex flex-wrap gap-2'>
            <Button
              type='button'
              size='touch'
              className='h-auto min-h-11 whitespace-normal'
              data-legacy-restore
              aria-describedby={restoreDetailsId}
              aria-disabled={pending || undefined}
              onClick={(event) => chooseLegacyAction(event, true)}
            >
              Restore saved figures and remember
            </Button>
            <Button
              type='button'
              variant='outline'
              size='touch'
              className='h-auto min-h-11 border-destructive whitespace-normal text-destructive hover:bg-destructive/10 hover:text-destructive'
              aria-describedby={clearDetailsId}
              onClick={(event) => chooseLegacyAction(event, false)}
            >
              Clear figures and start fresh
            </Button>
          </div>
        </div>
      )}
      {!legacy && (
        <div id={optionsId} hidden={!optionsOpen} className='mt-2 space-y-2'>
          <p className='text-xs text-muted-foreground'>
            Off by default. Saved inputs expire after 30 days for PAYE or 7 days for Director, and
            at tax-year rollover.
          </p>
          <p id={clearDetailsId} className='text-xs text-muted-foreground'>
            Clearing removes current figures, results and saved inputs for both PAYE and Director
            across open tabs. Analytics preferences are separate.
          </p>
          <Button
            type='button'
            variant='outline'
            size='touch'
            className='h-auto min-h-11 border-destructive whitespace-normal text-destructive hover:bg-destructive/10 hover:text-destructive'
            aria-describedby={clearDetailsId}
            onClick={clearRemembering}
          >
            Clear figures and saved data
          </Button>
        </div>
      )}
      <FigureStorageAlert className='mt-2' />
    </section>
  );
}
