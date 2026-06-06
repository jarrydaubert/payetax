import type { Event } from '@sentry/nextjs';
import {
  isSentryMonitoredPath,
  normalizeSentryPath,
  shouldDropSentryEventForUnmonitoredPath,
} from '@/lib/sentryScope';

describe('sentryScope', () => {
  it.each([
    ['/', '/'],
    ['https://payetax.co.uk/tools/director-guide?mode=quick', '/tools/director-guide'],
    ['POST /api/send-results?debug=true', '/api/send-results'],
    ['/tools/director-guide/', '/tools/director-guide'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeSentryPath(input)).toBe(expected);
  });

  it.each([
    '/',
    '/calculator',
    '/tools/director-guide',
    '/tools/director-guide/company',
    '/api/send-results',
    '/api/send-director-results',
  ])('keeps calculator-related path %s reportable', (path) => {
    expect(isSentryMonitoredPath(path)).toBe(true);
  });

  it.each([
    '/blog',
    '/blog/tax-codes',
    '/about',
    '/privacy',
    '/tools/tax-code-decoder',
  ])('treats non-calculator path %s as unmonitored', (path) => {
    expect(isSentryMonitoredPath(path)).toBe(false);
  });

  it('drops events for unmonitored request paths', () => {
    const event: Event = {
      request: {
        url: 'https://payetax.co.uk/blog/tax-codes',
      },
    };

    expect(shouldDropSentryEventForUnmonitoredPath(event)).toBe(true);
  });

  it('keeps operational email failures tagged with monitored API routes', () => {
    const event: Event = {
      tags: {
        route: '/api/send-results',
      },
    };

    expect(shouldDropSentryEventForUnmonitoredPath(event)).toBe(false);
  });
});
