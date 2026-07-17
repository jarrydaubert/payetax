// src/lib/cookieUtils.ts
// Cookie consent utilities for GDPR/UK cookie compliance

import { safeGetItem, safeRemoveItem, safeSetItem } from './safeStorage';

export interface ConsentPreferences {
  analytics: boolean;
}

export const CONSENT_STORAGE_KEY = 'cookie-consent';
const CONSENT_KEY = CONSENT_STORAGE_KEY;
export const CONSENT_TIMESTAMP_STORAGE_KEY = 'cookie-consent-timestamp';
const CONSENT_TIMESTAMP_KEY = CONSENT_TIMESTAMP_STORAGE_KEY;
/** Approximately 12 months in milliseconds (365 days) */
export const CONSENT_LIFETIME_MS = 365 * 24 * 60 * 60 * 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isConsentPreferences(value: unknown): value is ConsentPreferences {
  return isRecord(value) && typeof value.analytics === 'boolean';
}

function maybeMigrateLegacyConsent(raw: string | null): void {
  if (!(raw === 'accepted' || raw === 'declined')) return;

  safeSetItem(CONSENT_KEY, JSON.stringify({ analytics: raw === 'accepted' }));
  // Preserve existing timestamp if present; otherwise initialize now.
  if (!safeGetItem(CONSENT_TIMESTAMP_KEY)) {
    safeSetItem(CONSENT_TIMESTAMP_KEY, new Date().toISOString());
  }
}

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
    if (isConsentPreferences(parsed)) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
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

/** Millisecond timestamp when the current consent choice expires. */
export function getConsentExpiryTime(): number | null {
  const consentDate = getConsentTimestamp();
  return consentDate ? consentDate.getTime() + CONSENT_LIFETIME_MS : null;
}

/**
 * Check if consent is expired (after 12 months)
 * Uses millisecond arithmetic to avoid Date month edge cases
 *
 * A stored preference without a valid timestamp cannot prove freshness,
 * so it is treated as expired and the user is re-prompted.
 */
export function isConsentExpired(): boolean {
  const consentDate = getConsentTimestamp();
  if (!consentDate) {
    return safeGetItem(CONSENT_KEY) !== null;
  }

  return Date.now() - consentDate.getTime() >= CONSENT_LIFETIME_MS;
}

export function setConsentPreferences(preferences: ConsentPreferences): void {
  // Timestamp first: a preference visible without a timestamp reads as expired.
  safeSetItem(CONSENT_TIMESTAMP_KEY, new Date().toISOString());
  safeSetItem(CONSENT_KEY, JSON.stringify(preferences));
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

  maybeMigrateLegacyConsent(raw);
  return parsed;
}

export function isAnalyticsConsented(): boolean {
  const preferences = getConsentPreferences();
  return preferences?.analytics === true;
}
