'use client';

import { type MouseEvent, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  clearFigures,
  rememberFigures,
  syncFigureStorage,
  useFigureStorage,
} from '@/lib/figureStorage';
import { cn } from '@/lib/utils';

export function FigureStorageControls() {
  const detailsId = useId();
  const legacyReasonId = `${detailsId}-legacy`;
  const restoreDetailsId = `${detailsId}-restore`;
  const clearDetailsId = `${detailsId}-clear`;
  const { enabled, legacy, unavailable, erasureFailed } = useFigureStorage();
  const checkbox = useRef<HTMLInputElement>(null);
  const returnFocus = useRef(false);
  const requestPending = useRef(false);
  const [feedback, setFeedback] = useState<'pending' | 'superseded' | null>(null);
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
    <section
      aria-label='Remember figures'
      className='my-3 rounded-sm border border-border bg-background p-3 text-sm'
    >
      <label
        className={cn(
          'flex min-h-11 items-center gap-3 font-medium',
          legacy ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer',
        )}
      >
        <input
          ref={checkbox}
          type='checkbox'
          className='size-5 shrink-0 accent-primary disabled:cursor-not-allowed disabled:opacity-50'
          checked={enabled}
          aria-describedby={legacy ? `${legacyReasonId} ${detailsId}` : detailsId}
          disabled={legacy}
          aria-disabled={pending || undefined}
          onChange={(event) => {
            if (requestPending.current) return;
            if (event.target.checked) enableRemembering();
            else clearRemembering();
          }}
        />
        Remember figures on this device (PAYE and Director)
      </label>
      {legacy && (
        <p id={legacyReasonId}>
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
              figures for both calculators.
            </span>
          </p>
          <div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap'>
            <Button
              type='button'
              size='touch'
              className='h-auto min-h-11 whitespace-normal'
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
      <p id={detailsId} className='text-xs text-muted-foreground'>
        Off by default. Saved inputs expire after 30 days for PAYE or 7 days for Director, and at
        tax-year rollover. Turning this off clears figures and results in open tabs. Analytics
        preferences are separate.
      </p>
      {!legacy && (
        <button
          type='button'
          className='mt-1 min-h-11 underline underline-offset-2'
          onClick={clearRemembering}
        >
          Clear figures and saved data
        </button>
      )}
      {(unavailable || erasureFailed) && (
        <p role='alert' className='mt-2 text-sm'>
          {erasureFailed
            ? 'Current figures were cleared, but saved data could not be fully removed. Allow site storage and clear again, or remove this site’s data in your browser settings.'
            : 'Remembering is off because this browser cannot save figures reliably. You can still calculate. Previously saved data may remain; use your browser settings to remove it.'}
        </p>
      )}
    </section>
  );
}
