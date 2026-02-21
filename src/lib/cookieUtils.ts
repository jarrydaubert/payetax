// src/lib/cookieUtils.ts
// Cookie consent utilities for GDPR/UK cookie compliance

import { safeGetItem, safeRemoveItem, safeSetItem } from './safeStorage';

export type CookieConsent = 'accepted' | 'declined' | null;

export interface ConsentPreferences {
  analytics: boolean;
}

const CONSENT_KEY = 'cookie-consent';
const CONSENT_TIMESTAMP_KEY = 'cookie-consent-timestamp';
/** Approximately 12 months in milliseconds (365 days) */
const TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000;

function parseConsentPreferences(value: string | null): ConsentPreferences | null {
  if (!value) return null;

  if (value === 'accepted') {
    return { analytics: true };
  }
  if (value === 'declined') {
    return { analytics: false };
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (
      parsed &&
      typeof parsed === 'object' &&
      'analytics' in parsed &&
      typeof parsed.analytics === 'boolean'
    ) {
      return { analytics: parsed.analytics };
    }
  } catch {
    return null;
  }

  return null;
}

function maybeMigrateLegacyConsent(raw: string | null): void {
  if (!(raw === 'accepted' || raw === 'declined')) return;

  safeSetItem(CONSENT_KEY, JSON.stringify({ analytics: raw === 'accepted' }));
  // Preserve existing timestamp if present; otherwise initialize now.
  if (!safeGetItem(CONSENT_TIMESTAMP_KEY)) {
    safeSetItem(CONSENT_TIMESTAMP_KEY, new Date().toISOString());
  }
}

/**
 * Clear cookie consent (for testing, reset, or expiry purposes)
 */
export function clearCookieConsent(): void {
  safeRemoveItem(CONSENT_KEY);
  safeRemoveItem(CONSENT_TIMESTAMP_KEY);
}

/**
 * Get the timestamp when consent was last given
 */
export function getConsentTimestamp(): Date | null {
  const timestamp = safeGetItem(CONSENT_TIMESTAMP_KEY);
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

export function setConsentPreferences(preferences: ConsentPreferences): void {
  safeSetItem(CONSENT_KEY, JSON.stringify(preferences));
  safeSetItem(CONSENT_TIMESTAMP_KEY, new Date().toISOString());
}

/**
 * Reads structured preferences and auto-migrates legacy flat values.
 * Returns null when there is no valid, non-expired consent record.
 */
export function getConsentPreferences(): ConsentPreferences | null {
  const raw = safeGetItem(CONSENT_KEY);

  // If consent exists but expired, wipe and re-prompt.
  if (raw !== null && isConsentExpired()) {
    clearCookieConsent();
    return null;
  }

  const parsed = parseConsentPreferences(raw);
  if (!parsed) {
    if (raw) {
      clearCookieConsent();
    }
    return null;
  }

  // Migrate accepted/declined legacy format to JSON once read.
  maybeMigrateLegacyConsent(raw);
  return parsed;
}

/**
 * Backward-compatible legacy status getter.
 */
export function getCookieConsent(): CookieConsent {
  const preferences = getConsentPreferences();
  if (!preferences) return null;
  return preferences.analytics ? 'accepted' : 'declined';
}

export function isAnalyticsConsented(): boolean {
  const preferences = getConsentPreferences();
  return preferences?.analytics === true;
}

/**
 * Backward-compatible alias.
 */
export function areCookiesAccepted(): boolean {
  return isAnalyticsConsented();
}

/**
 * Backward-compatible alias.
 */
export function areCookiesDeclined(): boolean {
  return getCookieConsent() === 'declined';
}
