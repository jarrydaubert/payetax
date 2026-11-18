'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  clearFigures,
  rememberFigures,
  syncFigureStorage,
  useFigureStorage,
} from '@/lib/figureStorage';

export function FigureStorageControls() {
  const detailsId = useId();
  const { enabled, legacy, unavailable, erasureFailed } = useFigureStorage();
  const requestPending = useRef(false);
  const [feedback, setFeedback] = useState<'pending' | 'superseded' | null>(null);
  const pending = feedback === 'pending';
  useEffect(() => {
    syncFigureStorage();
  }, []);
  useEffect(() => {
    if (enabled) setFeedback((current) => (current === 'superseded' ? null : current));
  }, [enabled]);

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
    clearFigures();
  }

  return (
    <section
      aria-label='Remember figures'
      className='my-3 rounded-sm border border-border bg-background p-3 text-sm'
    >
      <label className='flex min-h-11 cursor-pointer items-center gap-3 font-medium'>
        <input
          type='checkbox'
          className='h-5 w-5 accent-primary'
          checked={enabled}
          aria-describedby={detailsId}
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
      <p aria-live='polite' aria-atomic='true' className='text-xs'>
        {pending && 'Waiting to save preference…'}
        {feedback === 'superseded' &&
          !enabled &&
          !unavailable &&
          !erasureFailed &&
          'Remembering is still off because saved figures changed. You can try again.'}
      </p>
      <p id={detailsId} className='text-xs text-muted-foreground'>
        Off by default. Saved inputs expire after 30 days for PAYE or 7 days for Director, and at
        tax-year rollover. Turning this off clears figures and results in open tabs. Analytics
        preferences are separate.
      </p>
      {legacy && (
        <div className='mt-3' role='status'>
          <p>
            Previously saved figures have not been loaded. Restore them and opt in, or clear them to
            start fresh. Restoring replaces the corresponding figures here and clears figures in
            other open tabs.
          </p>
          <button
            type='button'
            className='min-h-11 underline underline-offset-2'
            aria-disabled={pending || undefined}
            onClick={() => enableRemembering(true)}
          >
            Restore saved figures and remember
          </button>
        </div>
      )}
      <button
        type='button'
        className='mt-1 min-h-11 underline underline-offset-2'
        onClick={clearRemembering}
      >
        Clear figures and saved data
      </button>
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
