// src/app/offline/page.tsx
/**
 * Offline fallback page for PWA
 * Shows when user is offline and page isn't cached
 */

'use client';

import { Calculator, Wifi } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className='flex min-h-screen items-center justify-center pt-20'>
      <div className='container mx-auto max-w-2xl px-4 text-center'>
        <div className='glass-card'>
          <div className='glass-card-inner py-16'>
            {/* Offline Icon */}
            <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/20'>
              <Wifi className='h-10 w-10 text-amber-400' />
            </div>

            {/* Title */}
            <h1 className='mb-4 font-bold text-heading text-white'>You're Offline</h1>

            {/* Description */}
            <p className='mb-8 text-large text-white/80 leading-relaxed'>
              It looks like you're not connected to the internet. Don't worry - PayeTax works
              offline too! Your previous calculations are still available.
            </p>

            {/* Features Available Offline */}
            <div className='mb-8 rounded-lg border border-white/10 bg-white/5 p-6'>
              <h2 className='mb-4 font-semibold text-subheading text-white'>Available Offline:</h2>
              <div className='grid grid-cols-1 gap-4 text-left md:grid-cols-2'>
                <div className='flex items-center gap-3'>
                  <Calculator className='h-5 w-5 flex-shrink-0 text-green-400' />
                  <span className='text-white/90'>Tax calculations</span>
                </div>
                <div className='flex items-center gap-3'>
                  <Calculator className='h-5 w-5 flex-shrink-0 text-green-400' />
                  <span className='text-white/90'>Cached tax rates</span>
                </div>
                <div className='flex items-center gap-3'>
                  <Calculator className='h-5 w-5 flex-shrink-0 text-green-400' />
                  <span className='text-white/90'>Previous results</span>
                </div>
                <div className='flex items-center gap-3'>
                  <Calculator className='h-5 w-5 flex-shrink-0 text-green-400' />
                  <span className='text-white/90'>Saved calculations</span>
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
                  className='text-blue-400 underline underline-offset-2 hover:text-blue-300'
                >
                  Try Calculator Anyway
                </Link>
              </div>
            </div>

            {/* Connection Status */}
            <div className='mt-8 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4'>
              <p className='text-blue-300 text-small'>
                💡 <strong>Tip:</strong> When you're back online, PayeTax will automatically sync
                and show the latest tax rates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
