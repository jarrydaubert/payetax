// src/app/offline/page.tsx
/**
 * Offline fallback page for PWA
 * Shows when the user is offline and the requested page isn't cached.
 */

import { CheckCircle, WifiOff } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { StatusPage } from '@/components/molecules/StatusPage';
import { Button } from '@/components/ui/button';
import { BackButton } from './BackButton';

// Prevent indexing of utility/fallback pages
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const OFFLINE_FEATURES = [
  'Tax calculations',
  'Cached tax rates',
  'Previous results',
  'Saved calculations',
];

export default function OfflinePage() {
  return (
    <StatusPage
      icon={WifiOff}
      tone='warning'
      title="You're offline"
      description="You're not connected to the internet right now. PayeTax still works offline, and your previous calculations remain available."
      actions={
        <>
          <BackButton />
          <Button asChild size='touch' variant='outline' className='rounded-sm bg-card px-6'>
            <Link href='/'>Try calculator anyway</Link>
          </Button>
        </>
      }
      footer={
        <>
          <strong className='text-foreground'>Tip:</strong> when you're back online, PayeTax
          automatically syncs and shows the latest tax rates.
        </>
      }
    >
      <div className='rounded-sm border border-border bg-background p-6'>
        <h2 className='mb-4 font-display font-semibold text-foreground text-lg'>
          Available offline
        </h2>
        <ul className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          {OFFLINE_FEATURES.map((feature) => (
            <li key={feature} className='flex items-center gap-3'>
              <CheckCircle className='size-5 flex-shrink-0 text-success' aria-hidden='true' />
              <span className='text-foreground/80'>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </StatusPage>
  );
}
