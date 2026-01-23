// src/components/organisms/AhrefsAnalytics.tsx
'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { areCookiesAccepted } from '@/lib/cookieUtils';

/**
 * Consent-aware Ahrefs Analytics loader
 * Only loads the Ahrefs script if user has accepted analytics cookies
 */
export function AhrefsAnalytics() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check consent on mount and when localStorage changes
    const checkConsent = () => {
      setHasConsent(areCookiesAccepted());
    };

    checkConsent();

    // Listen for storage changes (consent updates)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cookie-consent') {
        checkConsent();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (!hasConsent) {
    return null;
  }

  return (
    <Script
      src='https://analytics.ahrefs.com/analytics.js'
      data-key='QVltTEcUkJo80YKtGhAvrg'
      strategy='lazyOnload'
    />
  );
}
