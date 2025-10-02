// src/components/ui/CookieBanner.tsx

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Cookie, Shield, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useId, useState } from 'react';
import '@/types/gtag';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { getCookieConsent, isConsentExpired } from '@/lib/cookieUtils';

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

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className='-translate-x-1/2 fixed bottom-[calc(1rem+240px)] left-1/2 z-[60] w-[calc(100vw-2rem)] max-w-md'
          role='dialog'
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <Card className='relative overflow-hidden border-0 bg-gradient-to-br from-card/95 to-card/90 shadow-2xl backdrop-blur-xl'>
            {/* Animated gradient background */}
            <motion.div
              className='absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10'
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }}
            />

            {/* Close button */}
            <motion.button
              type='button'
              onClick={declineCookies}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className='absolute top-3 right-3 z-10 rounded-full bg-background/50 p-1.5 text-foreground/60 transition-colors hover:bg-background/80 hover:text-foreground'
              aria-label='Decline cookies and dismiss'
            >
              <X className='h-4 w-4' />
            </motion.button>

            <CardHeader className='relative pb-3'>
              <div className='flex items-start gap-3'>
                {/* Icon with animation */}
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  }}
                  className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 border-purple-500/40 bg-gradient-to-br from-purple-500/30 to-pink-500/20'
                >
                  <Cookie className='h-6 w-6 text-purple-400' />
                </motion.div>

                <div className='flex-1'>
                  <h3
                    id={titleId}
                    className='mb-1 flex items-center gap-2 font-bold text-foreground text-lg'
                  >
                    We use cookies
                    <Shield className='h-4 w-4 text-green-400' />
                  </h3>
                  <p id={descriptionId} className='text-muted-foreground text-sm leading-relaxed'>
                    We use cookies to analyze traffic and improve your experience.{' '}
                    <Link
                      href='/privacy'
                      className='font-medium text-purple-400 underline decoration-purple-400/30 underline-offset-2 transition-colors hover:text-purple-300 hover:decoration-purple-300/50'
                    >
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className='relative pb-3'>
              {/* Privacy features */}
              <div className='flex flex-wrap gap-2 text-xs'>
                {[
                  { icon: '🔒', text: 'Privacy first' },
                  { icon: '📊', text: 'Analytics only' },
                  { icon: '✓', text: 'GDPR compliant' },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index, duration: 0.2 }}
                    className='flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-2 py-1'
                  >
                    <span className='text-base'>{feature.icon}</span>
                    <span className='font-medium text-foreground/80'>{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>

            <CardFooter className='relative flex gap-2 pt-0'>
              <Button
                onClick={declineCookies}
                variant='outline'
                size='sm'
                className='flex-1 border-border/50 hover:bg-background/50'
              >
                Decline
              </Button>
              <Button
                onClick={acceptCookies}
                variant='default'
                size='sm'
                className='group relative flex-1 overflow-hidden'
              >
                <motion.span
                  className='absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500'
                  whileHover={{ scale: 1.05 }}
                />
                <span className='relative flex items-center justify-center gap-1.5'>
                  <Cookie className='h-3.5 w-3.5' />
                  Accept
                </span>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
