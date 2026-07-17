/**
 * Canonical client-side Google Analytics gate.
 *
 * The public enablement flag and measurement ID are one fail-closed decision:
 * every GA bootstrap and event path must use this helper rather than checking
 * either environment value independently.
 */

const GA_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{10}$/i;

export function getGoogleAnalyticsMeasurementId(): string | null {
  if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'false') return null;

  const measurementId = process.env.NEXT_PUBLIC_GA_ID?.trim();
  if (!(measurementId && GA_MEASUREMENT_ID_PATTERN.test(measurementId))) return null;

  return measurementId;
}

export function isGoogleAnalyticsEnabled(): boolean {
  return getGoogleAnalyticsMeasurementId() !== null;
}
