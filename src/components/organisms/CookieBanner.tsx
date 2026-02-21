// src/components/organisms/CookieBanner.tsx
'use client';

import { Cookie } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { clearCookieConsent, getCookieConsent, isConsentExpired } from '@/lib/cookieUtils';
import { safeSetItem } from '@/lib/safeStorage';
import { cn } from '@/lib/utils';

/**
 * Persist consent choice and notify listeners
 * Analytics.tsx listens to this event to update gtag consent
 */
function persistConsent(value: 'accepted' | 'declined'): void {
  safeSetItem('cookie-consent', value);
  safeSetItem('cookie-consent-timestamp', new Date().toISOString());
  // Notify Analytics.tsx and other listeners (storage event only fires in other tabs)
  document.dispatchEvent(new Event('cookieConsentUpdated'));
}

const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') return;

    try {
      const consent = getCookieConsent();
      const expired = isConsentExpired();

      // If consent expired, clear stored values and treat as no consent
      if (expired) {
        clearCookieConsent();
      }

      // Show banner if no consent or expired (short delay to avoid hydration flash)
      if (consent === null || expired) {
        const timer = setTimeout(() => setShowBanner(true), 500);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Failed to check cookie consent status:', error);
      }
      // Fallback: show banner if localStorage fails
      const timer = setTimeout(() => setShowBanner(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = useCallback(() => {
    try {
      persistConsent('accepted');
    } catch (error) {
      console.error('Failed to accept cookies:', error);
    } finally {
      // Always hide banner to prevent it from being stuck
      setShowBanner(false);
    }
  }, []);

  const declineCookies = useCallback(() => {
    try {
      persistConsent('declined');
    } catch (error) {
      console.error('Failed to decline cookies:', error);
    } finally {
      // Always hide banner to prevent it from being stuck
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
          <Button
            onClick={declineCookies}
            variant='outline'
            size='touch'
            className='min-w-36 border-border/70 bg-background/80 hover:bg-background'
          >
            Essential Only
          </Button>
          <Button
            onClick={acceptCookies}
            variant='accentOutline'
            size='touch'
            className='min-w-36'
            data-testid='cookie-accept-analytics'
          >
            Accept Analytics
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CookieBanner;
