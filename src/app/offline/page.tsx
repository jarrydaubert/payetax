// src/app/offline/page.tsx
/**
 * Offline fallback page for PWA
 * Shows when user is offline and page isn't cached
 */

import { CheckCircle, Wifi } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ICON_SIZES, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';
import { BackButton } from './BackButton';

// Prevent indexing of utility/fallback pages
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className='flex min-h-dvh items-center justify-center bg-ledger-grid pt-20'>
      <div className='container mx-auto max-w-2xl px-4 text-center'>
        <div className='border border-border bg-card p-8 md:p-16'>
          {/* Offline Icon */}
          <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-sm border border-warning/40 bg-background'>
            <Wifi className={`${ICON_SIZES.SIZE_10} text-warning`} aria-hidden='true' />
          </div>

          {/* Title */}
          <h1
            className={cn('mb-4 font-display font-semibold text-foreground', TYPOGRAPHY.TEXT_4XL)}
          >
            You're Offline
          </h1>

          {/* Description */}
          <p className={cn('mb-8 text-muted-foreground leading-relaxed', TYPOGRAPHY.TEXT_LG)}>
            It looks like you're not connected to the internet. Don't worry - PayeTax works offline
            too! Your previous calculations are still available.
          </p>

          {/* Features Available Offline */}
          <div className='mb-8 border border-border bg-background p-6'>
            <h2
              className={cn('mb-4 font-display font-semibold text-foreground', TYPOGRAPHY.TEXT_XL)}
            >
              Available Offline:
            </h2>
            <div className='grid grid-cols-1 gap-4 text-left md:grid-cols-2'>
              <div className='flex items-center gap-3'>
                <CheckCircle
                  className={`${ICON_SIZES.SIZE_5} flex-shrink-0 text-success`}
                  aria-hidden='true'
                />
                <span className='text-foreground/80'>Tax calculations</span>
              </div>
              <div className='flex items-center gap-3'>
                <CheckCircle
                  className={`${ICON_SIZES.SIZE_5} flex-shrink-0 text-success`}
                  aria-hidden='true'
                />
                <span className='text-foreground/80'>Cached tax rates</span>
              </div>
              <div className='flex items-center gap-3'>
                <CheckCircle
                  className={`${ICON_SIZES.SIZE_5} flex-shrink-0 text-success`}
                  aria-hidden='true'
                />
                <span className='text-foreground/80'>Previous results</span>
              </div>
              <div className='flex items-center gap-3'>
                <CheckCircle
                  className={`${ICON_SIZES.SIZE_5} flex-shrink-0 text-success`}
                  aria-hidden='true'
                />
                <span className='text-foreground/80'>Saved calculations</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='space-y-4'>
            <BackButton />

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
          <div className='mt-8 border border-primary/30 bg-background p-4'>
            <p className={cn('text-primary', TYPOGRAPHY.TEXT_SM)}>
              <strong>Tip:</strong> When you're back online, PayeTax will automatically sync and
              show the latest tax rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
