import type { Event } from '@sentry/nextjs';
import * as Sentry from '@sentry/nextjs';
import { render, screen } from '@testing-library/react';
import { sanitizeSentryEvent } from '@/lib/sentryPrivacy';
import { onRequestError } from '../../../../instrumentation';
import { ErrorBoundary } from '../ErrorBoundary';
import { ErrorState } from '../ErrorState';

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn(), withScope: jest.fn() }));

describe('production Sentry diagnostic producers', () => {
  let reported: Event[];
  let tags: NonNullable<Event['tags']>;
  let contexts: NonNullable<Event['contexts']>;

  beforeEach(() => {
    reported = [];
    tags = {};
    contexts = {};
    window.history.replaceState({}, '', '/tools/tax-code-decoder');
    jest.mocked(Sentry.captureException).mockImplementation((_error, options) => {
      const capture = options as Event | undefined;
      reported.push(
        sanitizeSentryEvent({
          tags: { ...tags, ...capture?.tags },
          contexts: { ...contexts, ...capture?.contexts },
          extra: { input: { salary: 73123 } },
        }),
      );
      return 'diagnostic-event-id';
    });
    jest.mocked(Sentry.withScope).mockImplementation((callback: unknown) => {
      (callback as (scope: unknown) => void)({
        setTag: (key: string, value: string) => {
          tags[key] = value;
        },
        setContext: (key: string, value: Record<string, unknown>) => {
          contexts[key] = value;
        },
        setLevel: jest.fn(),
      });
    });
  });

  it('keeps the ErrorState digest shown to a user and its boundary tag', () => {
    const error = Object.assign(new Error('Technical failure'), { digest: 'next-42' });
    render(<ErrorState error={error} reset={jest.fn()} boundary='tools' />);
    expect(screen.getByText('Error ID: next-42')).toBeVisible();
    expect(reported[0]?.contexts?.error_details).toEqual({ digest: 'next-42' });
    expect(reported[0]?.tags?.error_boundary).toBe('tools');
    expect(JSON.stringify(reported)).not.toContain('73123');
  });

  it('keeps ErrorBoundary identification and a useful React component stack', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    function FailedChild(): never {
      throw new Error('Technical boundary failure');
    }
    try {
      render(
        <ErrorBoundary>
          <FailedChild />
        </ErrorBoundary>,
      );
      expect(screen.getByText('diagnostic-event-id')).toBeVisible();
      expect(reported[0]?.tags?.error_boundary).toBe('component');
      expect(reported[0]?.contexts?.react?.componentStack).toEqual(
        expect.stringContaining('FailedChild'),
      );
      expect(JSON.stringify(reported)).not.toContain('73123');
    } finally {
      consoleError.mockRestore();
    }
  });

  it.each([
    'App Router',
    'Pages Router',
  ] as const)('keeps onRequestError %s tags and cleans the request path', async (routerKind) => {
    await onRequestError(
      new Error('Technical request failure'),
      { path: '/tools/director-guide?salary=73123#email' },
      { routerKind },
    );
    expect(reported[0]?.tags).toEqual({
      router_kind: routerKind,
      request_path: '/tools/director-guide',
    });
    expect(reported[0]?.contexts?.request).toEqual({ url: '/tools/director-guide' });
    expect(JSON.stringify(reported)).not.toContain('73123');
  });
});
