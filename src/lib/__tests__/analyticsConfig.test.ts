import {
  getGoogleAnalyticsMeasurementId,
  isAnalyticsFlagEnabled,
  isGoogleAnalyticsEnabled,
} from '../analyticsConfig';

describe('analyticsConfig', () => {
  const originalEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS;
  const originalMeasurementId = process.env.NEXT_PUBLIC_GA_ID;

  afterEach(() => {
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = originalEnabled;
    process.env.NEXT_PUBLIC_GA_ID = originalMeasurementId;
  });

  it('enables GA only when the flag and a valid measurement ID are both present', () => {
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'true';
    process.env.NEXT_PUBLIC_GA_ID = 'G-ABCDEFGHIJ';

    expect(getGoogleAnalyticsMeasurementId()).toBe('G-ABCDEFGHIJ');
    expect(isGoogleAnalyticsEnabled()).toBe(true);
  });

  it('fails closed when analytics is disabled', () => {
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'false';
    process.env.NEXT_PUBLIC_GA_ID = 'G-ABCDEFGHIJ';

    expect(getGoogleAnalyticsMeasurementId()).toBeNull();
    expect(isGoogleAnalyticsEnabled()).toBe(false);
  });

  it.each(['FALSE', '0', ' false ', 'typo'])('fails closed for invalid flag %p', (flag) => {
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = flag;
    process.env.NEXT_PUBLIC_GA_ID = 'G-ABCDEFGHIJ';

    expect(isAnalyticsFlagEnabled()).toBe(false);
    expect(getGoogleAnalyticsMeasurementId()).toBeNull();
    expect(isGoogleAnalyticsEnabled()).toBe(false);
  });

  it('preserves the documented default-on flag behavior', () => {
    delete process.env.NEXT_PUBLIC_ENABLE_ANALYTICS;

    expect(isAnalyticsFlagEnabled()).toBe(true);
  });

  it.each([undefined, '', 'UA-12345', 'G-SHORT'])('fails closed for ID %p', (measurementId) => {
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'true';
    process.env.NEXT_PUBLIC_GA_ID = measurementId;

    expect(getGoogleAnalyticsMeasurementId()).toBeNull();
    expect(isGoogleAnalyticsEnabled()).toBe(false);
  });
});
