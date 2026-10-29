import type { Event } from '@sentry/nextjs';
import { SEO_ACTIONS } from '@/lib/analyticsEvents';
import { sanitizeAnalyticsParameters } from '@/lib/analyticsPrivacy';
import { sanitizeSentryBreadcrumb, sanitizeSentryEvent } from '@/lib/sentryPrivacy';
import {
  getTelemetryPageContext,
  sanitizeTelemetryText,
  sanitizeTelemetryUrl,
  sanitizeVercelTelemetry,
} from '@/lib/telemetryUrl';

describe('telemetry data minimisation', () => {
  it.each(SEO_ACTIONS)('cleans the %s label and source identically', (action) => {
    expect(
      sanitizeAnalyticsParameters(action, {
        label: 'https://x.test/?salary=73123#email',
        source: 'https://x.test/?salary=73123#email',
      }),
    ).toEqual({ label: 'https://x.test/', source: 'https://x.test/' });
    expect(
      sanitizeAnalyticsParameters(action, { label: 'paye_calculator', source: 'paye_calculator' }),
    ).toEqual({ label: 'paye_calculator', source: 'paye_calculator' });
    expect(
      sanitizeAnalyticsParameters(action, { label: 'salary 73123', source: 'salary 73123' }),
    ).toEqual({});
  });

  it('only accepts bounded public blog slugs in both label and slug', () => {
    expect(
      sanitizeAnalyticsParameters('blog_article_read', {
        label: 'uk-tax-basics',
        slug: 'uk-tax-basics',
      }),
    ).toEqual({ label: 'uk-tax-basics', slug: 'uk-tax-basics' });
    for (const unsafe of [
      'https://x.test/?salary=73123',
      'salary 73123',
      '73123',
      'x'.repeat(161),
    ]) {
      expect(
        sanitizeAnalyticsParameters('blog_article_read', { label: unsafe, slug: unsafe }),
      ).toEqual({});
    }
    expect(sanitizeAnalyticsParameters('page_view', { label: 'salary 73123' })).toEqual({});
  });

  it.each([
    ['Route /blog/[slug]?salary=73123', 'Route /blog/[slug]'],
    ['Route /tools/(group)/[slug]?salary=73123', 'Route /tools/(group)/[slug]'],
    ['Route ?salary=73123', 'Route [query omitted]'],
    ['Route #salary=73123', 'Route [fragment omitted]'],
  ])('removes private URL text from %s', (text, expected) => {
    expect(sanitizeTelemetryText(text)).toBe(expected);
  });

  it('keeps validated diagnostic references and boundary/request tags without financial extras', () => {
    const safe = sanitizeSentryEvent({
      contexts: {
        error_details: { digest: 'next-digest-42', salary: 73123 },
        request: { url: '/tools?salary=73123' },
      },
      tags: {
        error_boundary: 'tools',
        router_kind: 'App Router',
        request_path: '/tools?salary=73123',
        has_pension: true,
      },
    });
    expect(safe.contexts).toEqual({
      error_details: { digest: 'next-digest-42' },
      request: { url: '/tools' },
    });
    expect(safe.tags).toEqual({
      error_boundary: 'tools',
      router_kind: 'App Router',
      request_path: '/tools',
    });
    expect(JSON.stringify(safe)).not.toContain('73123');
    expect(
      sanitizeSentryEvent({
        contexts: { error_details: { digest: 'https://x.test/?salary=73123' } },
        tags: { error_boundary: 'salary 73123', router_kind: 'salary 73123' },
      }),
    ).toEqual({ contexts: { error_details: {} }, tags: {} });
  });
  it('suppresses Vercel events when its automatic referrer would contain private URL data', () => {
    const referrer = jest.spyOn(document, 'referrer', 'get');
    referrer.mockReturnValue('https://search.test/path?financial=73123');
    expect(sanitizeVercelTelemetry({ url: 'https://payetax.test/' })).toBeNull();
    referrer.mockReturnValue('https://search.test/path');
    expect(sanitizeVercelTelemetry({ url: 'https://payetax.test/' })).toEqual({
      url: 'https://payetax.test/',
    });
    referrer.mockRestore();
  });
  it.each([
    ['https://user:password@example.com/tools?salary=73123#email', 'https://example.com/tools'],
    ['/tools?revenue=73123#results', '/tools'],
    ['app:///_next/static/chunk.js?salary=73123#frame', 'app:///_next/static/chunk.js'],
    ['not a URL?salary=73123', undefined],
    ['javascript:alert(73123)', undefined],
    ['https://[invalid?salary=73123', undefined],
  ])('sanitises URL %s', (value, expected) => {
    expect(sanitizeTelemetryUrl(value)).toBe(expected);
  });

  it('keeps Vercel metrics while removing query strings and fragments', () => {
    expect(
      sanitizeVercelTelemetry({ url: 'https://payetax.test/?salary=73123#results', value: 42 }),
    ).toEqual({ url: 'https://payetax.test/', value: 42 });
    expect(sanitizeVercelTelemetry({ url: 'not a URL?salary=73123' })).toBeNull();
  });

  it('uses explicit clean GA defaults, including a clean referrer', () => {
    window.history.replaceState({}, '', '/?salary=73123#results');
    const referrer = jest
      .spyOn(document, 'referrer', 'get')
      .mockReturnValue('https://search.test/?q=73123#financial');
    expect(getTelemetryPageContext()).toEqual({
      page_path: '/',
      page_location: 'http://localhost/',
      page_referrer: 'https://search.test/',
    });
    referrer.mockRestore();
    window.history.replaceState({}, '', '/');
  });

  it('drops financial derivatives, arbitrary custom data and unsafe labels without losing completion counts', () => {
    expect(
      sanitizeAnalyticsParameters('calculator_completed', {
        category: 'funnel',
        label: 'paye_calculator',
        value: 73123,
        salary_range: '50k_75k',
        region: 'Scotland',
        tax_year: '2026-2027',
        has_pension: true,
        has_student_loan: true,
        nested: [{ salary: 73123 }],
      }),
    ).toEqual({ category: 'funnel', label: 'paye_calculator' });
    expect(
      sanitizeAnalyticsParameters('pro_calculator_completed', {
        label: 'survival',
        profit_bucket: '0_or_loss',
        recommended: true,
      }),
    ).toEqual({});
    expect(
      sanitizeAnalyticsParameters('guide_warning_shown', { label: 'vat-mandatory' }),
    ).toBeNull();
    expect(sanitizeAnalyticsParameters('director_guide_buffer_shortfall_shown', {})).toBeNull();
  });

  it('retains technical anomaly codes and timings, without amounts', () => {
    expect(
      sanitizeAnalyticsParameters('calculator_error', {
        label: 'calculation_anomaly_primary',
        source: 'primary',
        error_type: 'calculation_anomaly',
        anomaly_count: 2,
        anomaly_codes: 'negative_component,non_finite_value',
        salary: 73123,
      }),
    ).toEqual({
      label: 'calculation_anomaly_primary',
      source: 'primary',
      error_type: 'calculation_anomaly',
      anomaly_count: 2,
      anomaly_codes: 'negative_component,non_finite_value',
    });
    expect(
      sanitizeAnalyticsParameters('performance_metric', {
        label: 'page_load_time',
        value: 123,
        unit: 'ms',
        salary: 73123,
      }),
    ).toEqual({ label: 'page_load_time', value: 123, unit: 'ms' });
  });

  it('removes request bodies, nested financial state, user data and tags from diagnostic envelopes', () => {
    const event: Event = {
      message: 'Operational failure: email_delivery_failed',
      release: 'review-build',
      user: { email: 'canary73123@example.com' },
      request: {
        url: 'https://payetax.test/api/send-results?salary=73123#results',
        method: 'POST',
        data: JSON.stringify({ input: { salary: 73123 } }),
        cookies: { session: '73123' },
        headers: {
          Authorization: '73123',
          Cookie: '73123',
          Referer: 'https://payetax.test/?salary=73123',
          'User-Agent': 'test-browser',
        },
      },
      extra: { Error: { nested: [{ input: { salary: 73123 } }] } },
      contexts: {
        calculator_input: { salaryRange: '73123', studentLoanPlans: ['73123'] },
        calculator: { stage: 'primary', region: '73123', nested: { salary: 73123 } },
        operationalFailure: { reason: 'email_delivery_failed', statusCode: 503 },
        runtime: { name: 'Node.js', version: '24' },
      },
      tags: { region: '73123', has_pension: true, reason: 'email_delivery_failed' },
      breadcrumbs: [
        { category: 'navigation', data: { from: '/?salary=73123', to: '/tools#73123' } },
        {
          category: 'calculator',
          message: 'Starting tax calculation',
          data: { salaryRange: '73123', stage: 'primary' },
        },
      ],
      exception: {
        values: [
          {
            type: 'TypeError',
            value: 'Calculation failed',
            stacktrace: {
              frames: [
                {
                  filename: 'https://payetax.test/_next/chunk.js?salary=73123#frame',
                  lineno: 10,
                  vars: { salary: 73123 },
                },
              ],
            },
          },
        ],
      },
    };
    const safe = sanitizeSentryEvent(event);
    expect(JSON.stringify(safe)).not.toContain('73123');
    expect(safe.contexts?.calculator).toEqual({ stage: 'primary' });
    expect(safe.contexts?.operationalFailure).toEqual({
      reason: 'email_delivery_failed',
      statusCode: 503,
    });
    expect(safe.exception?.values?.[0].stacktrace?.frames?.[0]).toEqual({
      filename: 'https://payetax.test/_next/chunk.js',
      lineno: 10,
    });
    expect(safe.request?.method).toBe('POST');
    expect(safe.release).toBe('review-build');
  });

  it('drops opaque bodies regardless of representation and ignores DOM/console breadcrumbs', () => {
    expect(
      sanitizeSentryEvent({ message: 'GET https://payetax.test/?salary=73123#results' }).message,
    ).toBe('GET https://payetax.test/');
    for (const data of ['salary=73123', { input: [{ amount: 73123 }] }, [73123]]) {
      expect(sanitizeSentryEvent({ request: { data } }).request?.data).toBeUndefined();
    }
    expect(
      sanitizeSentryBreadcrumb({ category: 'ui.click', message: 'button[aria-label="£73123"]' }),
    ).toBeNull();
    expect(sanitizeSentryBreadcrumb({ category: 'console', message: '73123' })).toBeNull();
  });
});
