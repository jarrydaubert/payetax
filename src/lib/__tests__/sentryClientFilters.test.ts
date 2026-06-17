import type { Event, EventHint } from '@sentry/nextjs';
import { shouldDropClientSentryEvent } from '@/lib/sentryClientFilters';

const eventWithExceptionValue = (value: string): Event => ({
  exception: {
    values: [{ value }],
  },
});

const eventWithInjectedScriptSyntaxError = (): Event => ({
  exception: {
    values: [
      {
        type: 'SyntaxError',
        value: 'Invalid or unexpected token',
        stacktrace: {
          frames: [
            {
              filename: 'app:///f3e623ce0222733b/script.js',
              abs_path: 'app:///f3e623ce0222733b/script.js',
              lineno: 1,
              colno: 1,
              in_app: true,
            },
          ],
        },
      },
    ],
  },
});

describe('shouldDropClientSentryEvent', () => {
  it.each([
    'feature named `hover` was not found',
    'feature named `performanceMetrics` was not found',
    'Connection closed.',
    'Event `CustomEvent` (type=unhandledrejection) captured as promise rejection',
  ])('drops proven non-actionable client noise: %s', (message) => {
    expect(shouldDropClientSentryEvent(eventWithExceptionValue(message))).toBe(true);
  });

  it('drops browser CustomEvent promise rejection objects', () => {
    const hint: EventHint = {
      originalException: new CustomEvent('unhandledrejection'),
    };

    expect(shouldDropClientSentryEvent({}, hint)).toBe(true);
  });

  it('drops injected app-scheme script syntax noise', () => {
    expect(shouldDropClientSentryEvent(eventWithInjectedScriptSyntaxError())).toBe(true);
  });

  it('keeps first-party syntax errors reportable', () => {
    const event: Event = {
      exception: {
        values: [
          {
            type: 'SyntaxError',
            value: 'Invalid or unexpected token',
            stacktrace: {
              frames: [{ filename: '/_next/static/chunks/app.js' }],
            },
          },
        ],
      },
    };

    expect(shouldDropClientSentryEvent(event)).toBe(false);
  });

  it('keeps normal application errors reportable', () => {
    expect(shouldDropClientSentryEvent(eventWithExceptionValue('Calculation failed'))).toBe(false);
  });
});
