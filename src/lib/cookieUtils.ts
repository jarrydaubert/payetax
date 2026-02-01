// src/lib/cookieUtils.ts
// Cookie consent utilities for GDPR compliance

import { safeGetItem, safeRemoveItem } from './safeStorage';

export type CookieConsent = 'accepted' | 'declined' | null;

/** Approximately 12 months in milliseconds (365 days) */
const TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Clear cookie consent (for testing, reset, or expiry purposes)
 */
export function clearCookieConsent(): void {
  safeRemoveItem('cookie-consent');
  safeRemoveItem('cookie-consent-timestamp');
}

/**
 * Get the timestamp when consent was last given
 */
export function getConsentTimestamp(): Date | null {
  const timestamp = safeGetItem('cookie-consent-timestamp');
  if (!timestamp) return null;

  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Check if consent is expired (after 12 months)
 * Uses millisecond arithmetic to avoid Date month edge cases
 */
export function isConsentExpired(): boolean {
  const consentDate = getConsentTimestamp();
  if (!consentDate) return false;

  return Date.now() - consentDate.getTime() > TWELVE_MONTHS_MS;
}

/**
 * Get the current cookie consent status.
 * IMPORTANT: If consent is expired, returns null (and clears stored values).
 * This ensures all callers automatically respect the 12-month GDPR window.
 *
 * @returns 'accepted', 'declined', or null if no valid consent exists
 */
export function getCookieConsent(): CookieConsent {
  const consent = safeGetItem('cookie-consent');

  // If we have a value but it's expired, wipe and re-prompt
  if ((consent === 'accepted' || consent === 'declined') && isConsentExpired()) {
    clearCookieConsent();
    return null;
  }

  // Valid, non-expired consent
  if (consent === 'accepted' || consent === 'declined') {
    return consent;
  }

  // If garbage is stored, clear it
  if (consent) {
    clearCookieConsent();
  }

  return null;
}

/**
 * Check if cookies have been accepted (and not expired)
 */
export function areCookiesAccepted(): boolean {
  return getCookieConsent() === 'accepted';
}

/**
 * Check if cookies have been explicitly declined (and not expired)
 */
export function areCookiesDeclined(): boolean {
  return getCookieConsent() === 'declined';
}
