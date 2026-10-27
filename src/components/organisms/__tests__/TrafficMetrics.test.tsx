import { render } from '@testing-library/react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { TrafficMetrics } from '../TrafficMetrics';

jest.mock('@vercel/analytics/next', () => ({ Analytics: jest.fn(() => null) }));
jest.mock('@vercel/speed-insights/next', () => ({ SpeedInsights: jest.fn(() => null) }));

function renderProviders(url: string) {
  render(<TrafficMetrics />);
  const analyticsBeforeSend = jest.mocked(Analytics).mock.calls[0]?.[0].beforeSend;
  const speedBeforeSend = jest.mocked(SpeedInsights).mock.calls[0]?.[0].beforeSend;
  if (!(analyticsBeforeSend && speedBeforeSend)) {
    throw new Error('Both mounted telemetry providers must have a beforeSend callback');
  }
  const pageView = { type: 'pageview' as const, url };
  const vital = { type: 'vital' as const, url, route: '/tools/director-guide' };
  return [
    { input: pageView, send: () => analyticsBeforeSend(pageView) },
    { input: vital, send: () => speedBeforeSend(vital) },
  ];
}

describe('TrafficMetrics privacy integration', () => {
  let referrer: jest.SpyInstance;

  beforeEach(() => {
    referrer = jest.spyOn(document, 'referrer', 'get').mockReturnValue('');
  });

  afterEach(() => {
    referrer.mockRestore();
  });

  it('cleans private URLs for both providers while preserving event metadata and original inputs', () => {
    const url =
      'https://private-user:private-password@payetax.test/tools/director-guide?salary=73123#results';
    for (const { input, send } of renderProviders(url)) {
      const event = send();
      expect(event).toEqual({ ...input, url: 'https://payetax.test/tools/director-guide' });
      expect(JSON.stringify(event)).not.toMatch(/73123|private-user|private-password/);
      expect(input.url).toBe(url);
    }
  });

  it('keeps useful page views and speed measurements with a safe referrer', () => {
    referrer.mockReturnValue('https://search.test/guides');
    for (const { input, send } of renderProviders('https://payetax.test/tools/director-guide')) {
      expect(send()).toEqual(input);
    }
  });

  it.each([
    'https://search.test/?salary=73123',
    'https://payetax.test/?salary=73123',
    'https://search.test/#salary=73123',
    'https://private-user:private-password@search.test/',
  ])('suppresses both providers when the current referrer is unsafe: %s', (unsafeReferrer) => {
    const providers = renderProviders('https://payetax.test/tools/director-guide');
    for (const { input, send } of providers) expect(send()).toEqual(input);
    referrer.mockReturnValue(unsafeReferrer);
    for (const { send } of providers) expect(send()).toBeNull();
    referrer.mockReturnValue('https://search.test/');
    for (const { input, send } of providers) expect(send()).toEqual(input);
  });

  it.each([
    'javascript:alert(73123)',
    'https://[invalid?salary=73123',
  ])('discards unsupported or malformed event URLs from both providers: %s', (url) => {
    for (const { send } of renderProviders(url)) expect(send()).toBeNull();
  });
});
