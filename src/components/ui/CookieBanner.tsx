// src/components/ui/CookieBanner.tsx
'use client';

import { Cookie } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import '@/types/gtag';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { getCookieConsent, isConsentExpired } from '@/lib/cookieUtils';

const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      // Check if localStorage is available (for SSR and privacy mode compatibility)
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }

      const consent = getCookieConsent();
      const expired = isConsentExpired();

      // Show banner if no consent has been given or if consent has expired
      if (consent === null || expired) {
        if (expired) {
          console.info('Cookie consent expired, showing banner again');
        }
        const timer = setTimeout(() => setShowBanner(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.warn('Failed to check cookie consent status:', error);
      // Fallback: show banner after delay if localStorage fails
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = useCallback(() => {
    try {
      // Store consent preference
      if (window?.localStorage) {
        localStorage.setItem('cookie-consent', 'accepted');
        localStorage.setItem('cookie-consent-timestamp', new Date().toISOString());
      }

      setShowBanner(false);

      // Update Google Analytics consent if available
      if (window?.gtag) {
        try {
          window.gtag('consent', 'update', {
            analytics_storage: 'granted',
          });
        } catch (gtagError) {
          console.warn('Failed to update gtag consent:', gtagError);
        }
      }

      console.info('Cookie consent: Accepted');
    } catch (error) {
      console.error('Failed to accept cookies:', error);
      // Still hide banner to prevent it from being stuck
      setShowBanner(false);
    }
  }, []);

  const declineCookies = useCallback(() => {
    try {
      // Store decline preference
      if (window?.localStorage) {
        localStorage.setItem('cookie-consent', 'declined');
        localStorage.setItem('cookie-consent-timestamp', new Date().toISOString());
      }

      setShowBanner(false);

      // Update Google Analytics consent if available
      if (window?.gtag) {
        try {
          window.gtag('consent', 'update', {
            analytics_storage: 'denied',
          });
        } catch (gtagError) {
          console.warn('Failed to update gtag consent:', gtagError);
        }
      }

      console.info('Cookie consent: Declined');
    } catch (error) {
      console.error('Failed to decline cookies:', error);
      // Still hide banner to prevent it from being stuck
      setShowBanner(false);
    }
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div className='fixed inset-x-0 bottom-0 z-50 flex justify-center p-4'>
      <Card className='w-full max-w-2xl border-border/50 bg-gray-900/95 shadow-2xl backdrop-blur-xl'>
        <CardContent className='p-6 text-center'>
          <div className='mb-4 flex justify-center'>
            <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-400'>
              <Cookie className='h-6 w-6 text-white' />
            </div>
          </div>
          <h3 className='mb-2 font-semibold text-lg text-white'>We use cookies</h3>
          <p className='text-gray-300 text-sm leading-relaxed'>
            We use cookies to analyze traffic and improve your experience. View our{' '}
            <Link
              href='/privacy'
              className='font-medium text-blue-400 underline-offset-2 hover:underline'
            >
              Privacy Policy
            </Link>{' '}
            to learn more.
          </p>
        </CardContent>

        <CardFooter className='flex justify-center gap-3 p-6 pt-0'>
          <Button onClick={declineCookies} variant='outline' size='sm' className='min-w-[120px]'>
            Decline
          </Button>
          <Button
            onClick={acceptCookies}
            size='sm'
            className='min-w-[120px] bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500'
          >
            Accept All
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CookieBanner;
