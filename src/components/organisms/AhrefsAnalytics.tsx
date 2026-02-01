// src/components/organisms/AhrefsAnalytics.tsx
'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { areCookiesAccepted } from '@/lib/cookieUtils';

// Ahrefs Analytics Key - configure NEXT_PUBLIC_AHREFS_KEY in Vercel environment variables
const AHREFS_KEY = process.env.NEXT_PUBLIC_AHREFS_KEY;

/**
 * Consent-aware Ahrefs Analytics loader
 * Only loads the Ahrefs script if user has accepted analytics cookies
 *
 * Note: Once loaded, the script cannot be unloaded without a page refresh.
 * If consent is revoked after load, users must refresh for the change to take effect.
 */
export function AhrefsAnalytics() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check consent on mount
    const checkConsent = () => {
      setHasConsent(areCookiesAccepted());
    };

    checkConsent();

    // Listen for consent changes from other tabs (storage event)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cookie-consent') {
        checkConsent();
      }
    };

    // Listen for consent changes from same tab (custom event from CookieBanner)
    // The 'storage' event only fires in OTHER tabs, so we need this for same-tab updates
    const handleConsentUpdate = () => {
      checkConsent();
    };

    window.addEventListener('storage', handleStorage);
    document.addEventListener('cookieConsentUpdated', handleConsentUpdate);

    return () => {
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('cookieConsentUpdated', handleConsentUpdate);
    };
  }, []);

  // Don't render if no key configured or no consent
  if (!(AHREFS_KEY && hasConsent)) {
    return null;
  }

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Script id must be static to prevent duplicates
    <Script
      id='ahrefs-analytics'
      src='https://analytics.ahrefs.com/analytics.js'
      data-key={AHREFS_KEY}
      strategy='lazyOnload'
    />
  );
}
