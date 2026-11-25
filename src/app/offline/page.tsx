// src/app/offline/page.tsx
/**
 * Offline fallback page for PWA
 * Shows when the user is offline and the requested page isn't cached.
 */

import { WifiOff } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { StatusPage } from '@/components/molecules/StatusPage';
import { Button } from '@/components/ui/button';
import { BackButton } from './BackButton';

export const metadata: Metadata = {
  title: { absolute: 'Offline | PayeTax' },
  description: 'How to use the PayeTax calculator offline and check for updates.',
  alternates: { canonical: null },
  robots: { index: false, follow: false },
  openGraph: null,
  twitter: null,
};

export default function OfflinePage() {
  return (
    <StatusPage
      icon={WifiOff}
      tone='warning'
      title="You're offline"
      description={
        <>
          <p>
            If the calculator is cached, you can use it offline with the tax rates included in that
            version of PayeTax.
          </p>
          <p className='mt-3'>
            If you turned on <strong>Remember figures on this device</strong>, your browser can
            refill your inputs. After a reload, select <strong>Calculate</strong> to generate your
            results again.
          </p>
        </>
      }
      actions={
        <>
          <BackButton />
          <Button asChild size='touch' variant='outline' className='rounded-sm bg-card px-6'>
            <Link href='/'>Try calculator anyway</Link>
          </Button>
        </>
      }
      footer='Reload PayeTax when you’re back online to check for updates. If an update is waiting, close all open PayeTax tabs and windows, then reopen PayeTax online.'
    />
  );
}
