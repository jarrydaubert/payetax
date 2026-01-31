// src/components/ui/CookieBanner.tsx
'use client';

import { Cookie } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import '@/types/gtag';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { getCookieConsent, isConsentExpired } from '@/lib/cookieUtils';
import { safeSetItem } from '@/lib/safeStorage';
import { cn } from '@/lib/utils';

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
      safeSetItem('cookie-consent', 'accepted');
      safeSetItem('cookie-consent-timestamp', new Date().toISOString());

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
    } catch (error) {
      console.error('Failed to accept cookies:', error);
      // Still hide banner to prevent it from being stuck
      setShowBanner(false);
    }
  }, []);

  const declineCookies = useCallback(() => {
    try {
      // Store decline preference
      safeSetItem('cookie-consent', 'declined');
      safeSetItem('cookie-consent-timestamp', new Date().toISOString());

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
    <div
      className={cn(
        'safe-bottom pointer-events-none fixed inset-x-0 z-40 flex justify-center',
        SPACING.P_2,
        'sm:p-4',
      )}
    >
      <Card className='pointer-events-auto w-full max-w-2xl border-border/50 bg-card/95 shadow-2xl backdrop-blur-xl'>
        <CardContent className={cn('pointer-events-auto text-center', SPACING.P_4, 'sm:p-6')}>
          <div className={cn('flex justify-center', SPACING.MB_4)}>
            <div className='flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end'>
              <Cookie className={`${ICON_SIZES.SIZE_6} text-white`} aria-hidden='true' />
            </div>
          </div>
          <h2 className={cn('font-semibold text-foreground', SPACING.MB_2, TYPOGRAPHY.TEXT_LG)}>
            Cookie preferences
          </h2>
          <p className={cn('text-muted-foreground leading-relaxed', TYPOGRAPHY.TEXT_SM)}>
            We use analytics cookies to understand how visitors use our site and improve your
            experience. Essential cookies (to remember your choice) are always active. See our{' '}
            <Link
              href='/privacy'
              className='font-medium text-primary underline-offset-2 hover:underline'
            >
              Privacy Policy
            </Link>{' '}
            for details.
          </p>
        </CardContent>

        <CardFooter
          className={cn(
            'flex flex-col justify-center pt-0 sm:flex-row sm:p-6',
            SPACING.GAP_2,
            SPACING.P_4,
            'sm:gap-3',
          )}
        >
          <Button onClick={declineCookies} variant='outline' size='touch' className='min-w-[140px]'>
            Essential Only
          </Button>
          <Button
            onClick={acceptCookies}
            size='touch'
            className='min-w-[140px] bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end hover:from-brand-gradient-start/90 hover:to-brand-gradient-end/90'
            data-testid='cookie-accept-all'
          >
            Accept All
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CookieBanner;
