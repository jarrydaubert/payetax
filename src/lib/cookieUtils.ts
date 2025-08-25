// src/lib/cookieUtils.ts
// Cookie consent utilities for GDPR compliance

export type CookieConsent = 'accepted' | 'declined' | null;

/**
 * Get the current cookie consent status
 * @returns 'accepted', 'declined', or null if no choice has been made
 */
export function getCookieConsent(): CookieConsent {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const consent = localStorage.getItem('cookie-consent');

    if (consent === 'accepted' || consent === 'declined') {
      return consent as CookieConsent;
    }

    return null;
  } catch (error) {
    console.warn('Failed to get cookie consent status:', error);
    return null;
  }
}

/**
 * Check if cookies have been accepted
 */
export function areCookiesAccepted(): boolean {
  return getCookieConsent() === 'accepted';
}

/**
 * Check if cookies have been explicitly declined
 */
export function areCookiesDeclined(): boolean {
  return getCookieConsent() === 'declined';
}

/**
 * Get the timestamp when consent was last given
 */
export function getConsentTimestamp(): Date | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const timestamp = localStorage.getItem('cookie-consent-timestamp');

    if (timestamp) {
      return new Date(timestamp);
    }

    return null;
  } catch (error) {
    console.warn('Failed to get consent timestamp:', error);
    return null;
  }
}

/**
 * Clear cookie consent (for testing or reset purposes)
 */
export function clearCookieConsent(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('cookie-consent');
      localStorage.removeItem('cookie-consent-timestamp');
    }
  } catch (error) {
    console.warn('Failed to clear cookie consent:', error);
  }
}

/**
 * Check if consent is expired (after 12 months)
 */
export function isConsentExpired(): boolean {
  try {
    const timestamp = getConsentTimestamp();

    if (!timestamp) {
      return false; // No consent given, so not expired
    }

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    return timestamp < twelveMonthsAgo;
  } catch (error) {
    console.warn('Failed to check if consent is expired:', error);
    return true; // Assume expired on error for safety
  }
}
