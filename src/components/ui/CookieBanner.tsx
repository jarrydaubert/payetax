/**
 * src/components/ui/CookieBanner.tsx
 *
 * A GDPR-compliant cookie consent banner that allows users
 * to manage their cookie preferences. This component handles
 * essential cookies, analytics cookies, and preference storage.
 */

'use client';

import { Dialog } from '@headlessui/react';
import { BarChart2, CookieIcon, ShieldCheck, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * CookieBanner component displays a GDPR-compliant cookie consent dialog
 * when a user first visits the site. It stores user preferences in localStorage
 * and dispatches events to update consent mode in analytics.
 *
 * @returns Cookie consent banner component
 */
const CookieBanner: React.FC = () => {
  // State for controlling banner visibility and animation
  const [showBanner, setShowBanner] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  // Check for existing cookie consent when component mounts
  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem('cookie-consent');

    if (!cookieConsent) {
      // Short delay before showing banner for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
        // Add a small delay before animating in
        setTimeout(() => setAnimate(true), 100);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  /**
   * Accepts all cookies and saves preference to localStorage
   */
  const acceptCookies = useCallback(() => {
    // First animate out
    setAnimate(false);

    setTimeout(() => {
      // Save preference in localStorage
      localStorage.setItem('cookie-consent', 'accepted');
      setShowBanner(false);

      // Dispatch custom event for analytics
      const event = new Event('cookieConsentUpdated');
      window.dispatchEvent(event);

      // If window.gtag exists, update consent mode
      if (typeof window !== 'undefined' && 'gtag' in window) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'granted',
          functionality_storage: 'granted',
          personalization_storage: 'granted',
        });
      }
    }, 300);
  }, []);

  /**
   * Declines non-essential cookies and saves preference to localStorage
   */
  const declineCookies = useCallback(() => {
    // First animate out
    setAnimate(false);

    setTimeout(() => {
      // Save preference in localStorage
      localStorage.setItem('cookie-consent', 'declined');
      setShowBanner(false);

      // Dispatch custom event for analytics
      const event = new Event('cookieConsentUpdated');
      window.dispatchEvent(event);

      // If window.gtag exists, update consent mode to denied
      if (typeof window !== 'undefined' && 'gtag' in window) {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          functionality_storage: 'denied',
          personalization_storage: 'denied',
        });
      }
    }, 300);
  }, []);

  // Don't render anything if banner shouldn't be shown
  if (!showBanner) {
    return null;
  }

  return (
    <dialog
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black/20 backdrop-blur-sm transition-opacity duration-300',
        animate ? 'opacity-100' : 'opacity-0'
      )}
      aria-modal="true"
      aria-labelledby="cookie-banner-title"
      open
    >
      <Dialog
        open={showBanner}
        onClose={() => {}} // Prevent closing by escape key
        className="relative z-50"
        static
      >
        <div className="fixed inset-0" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel
            className={cn(
              'glass-card max-w-md w-full relative overflow-hidden transition-all duration-300 transform',
              animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            )}
          >
            {/* Decorative background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 -z-10" />

            <div className="glass-card-inner">
              {/* Header with icon */}
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-glass-l3 backdrop-blur-glass-sm mr-3 text-primary glow-sm">
                  <CookieIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <Dialog.Title
                  id="cookie-banner-title"
                  className="text-lg font-medium text-foreground"
                >
                  Cookie Preferences
                </Dialog.Title>
                <button
                  type="button"
                  onClick={declineCookies}
                  className="ml-auto p-1 rounded-full hover:bg-glass-l3 text-foreground/70 hover:text-foreground transition-colors"
                  aria-label="Close cookie banner and decline non-essential cookies"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <Dialog.Description className="text-sm text-foreground/80 mb-4">
                We use cookies to improve your experience and analyze site usage. By continuing, you
                agree to our cookie policy.
              </Dialog.Description>

              {/* Cookie types */}
              <div className="space-y-3 mb-5 glass-card-l3 backdrop-blur-glass-sm p-3 rounded-lg">
                <div className="flex items-start">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      id="cookies-essential"
                      name="cookies-essential"
                      type="checkbox"
                      className="form-checkbox"
                      checked
                      disabled
                      aria-describedby="essential-cookies-description"
                    />
                  </div>
                  <div className="ml-3">
                    <label
                      htmlFor="cookies-essential"
                      className="text-sm font-medium text-foreground"
                    >
                      Essential Cookies
                    </label>
                    <p id="essential-cookies-description" className="text-xs text-foreground/70">
                      Required for basic function. Cannot be disabled.
                    </p>
                  </div>
                  <ShieldCheck className="h-4 w-4 ml-auto text-success" aria-hidden="true" />
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      id="cookies-analytics"
                      name="cookies-analytics"
                      type="checkbox"
                      className="form-checkbox"
                      checked={analyticsEnabled}
                      onChange={() => setAnalyticsEnabled(!analyticsEnabled)}
                      aria-describedby="analytics-cookies-description"
                    />
                  </div>
                  <div className="ml-3">
                    <label
                      htmlFor="cookies-analytics"
                      className="text-sm font-medium text-foreground"
                    >
                      Analytics Cookies
                    </label>
                    <p id="analytics-cookies-description" className="text-xs text-foreground/70">
                      Help us improve by tracking anonymous usage data.
                    </p>
                  </div>
                  <BarChart2 className="h-4 w-4 ml-auto text-primary" aria-hidden="true" />
                </div>
              </div>

              {/* Buttons - mobile first with column layout that switches to row on larger screens */}
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={declineCookies}
                  className="glass-btn order-2 sm:order-1 py-2 px-4 text-sm rounded-lg"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={acceptCookies}
                  className="glass-btn-primary relative overflow-hidden order-1 sm:order-2 py-2 px-4 text-sm rounded-lg"
                >
                  <span className="absolute inset-0 bg-gradient-primary opacity-80 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                  <span className="relative z-10">Accept All</span>
                </button>
              </div>

              {/* Footer link */}
              <div className="mt-3 text-center">
                <Link
                  href="/privacy"
                  className="text-xs text-primary hover:text-primary/90 underline underline-offset-2 transition-colors duration-200"
                >
                  Learn more in our Privacy Policy
                </Link>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </dialog>
  );
};

export default CookieBanner;
