// src/components/ui/CookieBanner.tsx

'use client';

import { Cookie } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
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
        const timer = setTimeout(() => setShowBanner(true), 2000);
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
      if (typeof window !== 'undefined' && 'gtag' in window) {
        try {
          (window as any).gtag('consent', 'update', {
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
      if (typeof window !== 'undefined' && 'gtag' in window) {
        try {
          (window as any).gtag('consent', 'update', {
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
        'fixed bottom-4 right-4 z-50 max-w-sm',
        'glass-card border border-border/50',
        'animate-in slide-in-from-bottom-8 duration-500'
      )}
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-description"
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Cookie className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 id="cookie-title" className="font-medium text-sm text-foreground mb-1">
              We use cookies
            </h3>
            <p id="cookie-description" className="text-xs text-foreground/80 leading-relaxed">
              We use cookies to analyze traffic and improve your experience.{' '}
              <Link 
                href="/privacy" 
                className="text-primary hover:text-primary/80 underline underline-offset-2"
              >
                Learn more
              </Link>
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={declineCookies}
            className="text-xs px-3 py-1.5 flex-1"
          >
            Decline
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={acceptCookies}
            className="text-xs px-3 py-1.5 flex-1"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
