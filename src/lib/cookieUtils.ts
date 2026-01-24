// src/lib/cookieUtils.ts
// Cookie consent utilities for GDPR compliance

import { safeGetItem, safeRemoveItem } from './safeStorage';

export type CookieConsent = 'accepted' | 'declined' | null;

/**
 * Get the current cookie consent status
 * @returns 'accepted', 'declined', or null if no choice has been made
 */
export function getCookieConsent(): CookieConsent {
  const consent = safeGetItem('cookie-consent');

  if (consent === 'accepted' || consent === 'declined') {
    return consent as CookieConsent;
  }

  return null;
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
  const timestamp = safeGetItem('cookie-consent-timestamp');

  if (timestamp) {
    const date = new Date(timestamp);
    // Validate the date is valid
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

/**
 * Clear cookie consent (for testing or reset purposes)
 */
export function clearCookieConsent(): void {
  safeRemoveItem('cookie-consent');
  safeRemoveItem('cookie-consent-timestamp');
}

/**
 * Check if consent is expired (after 12 months)
 */
export function isConsentExpired(): boolean {
  const consentDate = getConsentTimestamp();

  if (!consentDate) {
    return false; // No consent given, so not expired
  }

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  return consentDate < twelveMonthsAgo;
}
