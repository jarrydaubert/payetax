// src/components/organisms/ClarityAnalytics.tsx
'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { areCookiesAccepted } from '@/lib/cookieUtils';

// Microsoft Clarity Project ID - configure NEXT_PUBLIC_CLARITY_ID in Vercel environment variables
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_ID;
const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false';

/**
 * Consent-aware Microsoft Clarity loader
 * Only loads Clarity when analytics consent is granted
 *
 * Note: Once loaded, Clarity cannot be unloaded without a page refresh.
 * If consent is revoked after load, users must refresh for the change to take effect.
 */
export function ClarityAnalytics() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      setHasConsent(areCookiesAccepted());
    };

    checkConsent();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cookie-consent') {
        checkConsent();
      }
    };

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

  // Don't render if analytics are disabled, no project id is configured, or consent is missing.
  if (!(ANALYTICS_ENABLED && CLARITY_PROJECT_ID && hasConsent)) {
    return null;
  }

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Script id must be static to prevent duplicates
    <Script id='microsoft-clarity' strategy='lazyOnload'>
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
      `}
    </Script>
  );
}
