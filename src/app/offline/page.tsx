// src/app/offline/page.tsx
/**
 * Offline fallback page for PWA
 * Shows when user is offline and page isn't cached
 */

'use client';

import { CheckCircle, Wifi } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ICON_SIZES } from '@/constants/designTokens';

export default function OfflinePage() {
  return (
    <div className='flex min-h-screen items-center justify-center pt-20'>
      <div className='container mx-auto max-w-2xl px-4 text-center'>
        <div className='glass-card p-8 md:p-16'>
          {/* Offline Icon */}
          <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/20'>
            <Wifi className={`${ICON_SIZES.SIZE_10} text-amber-500`} aria-hidden='true' />
          </div>

          {/* Title */}
          <h1 className='mb-4 font-bold text-4xl text-foreground'>You're Offline</h1>

          {/* Description */}
          <p className='mb-8 text-lg text-muted-foreground leading-relaxed'>
            It looks like you're not connected to the internet. Don't worry - PayeTax works offline
            too! Your previous calculations are still available.
          </p>

          {/* Features Available Offline */}
          <div className='mb-8 rounded-lg border border-border bg-secondary/50 p-6'>
            <h2 className='mb-4 font-semibold text-foreground text-xl'>Available Offline:</h2>
            <div className='grid grid-cols-1 gap-4 text-left md:grid-cols-2'>
              <div className='flex items-center gap-3'>
                <CheckCircle
                  className={`${ICON_SIZES.SIZE_5} flex-shrink-0 text-green-500`}
                  aria-hidden='true'
                />
                <span className='text-muted-foreground'>Tax calculations</span>
              </div>
              <div className='flex items-center gap-3'>
                <CheckCircle
                  className={`${ICON_SIZES.SIZE_5} flex-shrink-0 text-green-500`}
                  aria-hidden='true'
                />
                <span className='text-muted-foreground'>Cached tax rates</span>
              </div>
              <div className='flex items-center gap-3'>
                <CheckCircle
                  className={`${ICON_SIZES.SIZE_5} flex-shrink-0 text-green-500`}
                  aria-hidden='true'
                />
                <span className='text-muted-foreground'>Previous results</span>
              </div>
              <div className='flex items-center gap-3'>
                <CheckCircle
                  className={`${ICON_SIZES.SIZE_5} flex-shrink-0 text-green-500`}
                  aria-hidden='true'
                />
                <span className='text-muted-foreground'>Saved calculations</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='space-y-4'>
            <Button onClick={() => window.history.back()} variant='default' size='lg'>
              Go Back
            </Button>

            <div>
              <Link
                href='/'
                className='text-primary underline underline-offset-2 hover:text-primary/80'
              >
                Try Calculator Anyway
              </Link>
            </div>
          </div>

          {/* Connection Status */}
          <div className='mt-8 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4'>
            <p className='text-blue-500 text-sm'>
              💡 <strong>Tip:</strong> When you're back online, PayeTax will automatically sync and
              show the latest tax rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
