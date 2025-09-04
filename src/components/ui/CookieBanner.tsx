// src/components/ui/CookieBanner.tsx

'use client';

import { Cookie } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useId, useState } from 'react';
import '@/types/gtag';
import Button from '@/components/ui/Button';
import { getCookieConsent, isConsentExpired } from '@/lib/cookieUtils';
import { cn } from '@/lib/utils';

const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

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
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('cookie-consent', 'accepted');
        localStorage.setItem('cookie-consent-timestamp', new Date().toISOString());
      }

      setShowBanner(false);

      // Update Google Analytics consent if available
      if (typeof window !== 'undefined' && window.gtag) {
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
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('cookie-consent', 'declined');
        localStorage.setItem('cookie-consent-timestamp', new Date().toISOString());
      }

      setShowBanner(false);

      // Update Google Analytics consent if available
      if (typeof window !== 'undefined' && window.gtag) {
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

  if (!showBanner) return null;

  return (
    <div
      className={cn(
        'fixed right-4 bottom-28 z-[60] w-80 max-w-[calc(100vw-2rem)]',
        'glass-card border border-border/50',
        'animate-slide-in-from-bottom-8'
      )}
      role='dialog'
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className='p-4'>
        <div className='mb-3 flex items-start gap-3'>
          <Cookie className='mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400' />
          <div>
            <h3 id={titleId} className='mb-1 font-medium text-sm text-white'>
              We use cookies
            </h3>
            <p id={descriptionId} className='text-gray-300 text-xs leading-relaxed'>
              We use cookies to analyze traffic and improve your experience.{' '}
              <Link
                href='/privacy'
                className='text-purple-400 underline underline-offset-2 hover:text-purple-300'
              >
                Learn more
              </Link>
            </p>
          </div>
        </div>

        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={declineCookies}
            className='flex-1 px-3 py-1.5 text-xs'
          >
            Decline
          </Button>
          <Button
            variant='primary'
            size='sm'
            onClick={acceptCookies}
            className='flex-1 px-3 py-1.5 text-xs'
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
