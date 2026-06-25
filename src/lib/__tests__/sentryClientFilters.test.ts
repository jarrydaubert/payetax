import type { Event, EventHint } from '@sentry/nextjs';
import { shouldDropClientSentryEvent } from '@/lib/sentryClientFilters';

const REACT_REMOVE_CHILD_NOT_FOUND_ERROR =
  "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.";

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

const eventWithTranslatedReactRemoveChildError = (): Event => ({
  breadcrumbs: [
    {
      category: 'ui.click',
      message: 'font > font',
      level: 'info',
    },
  ],
  exception: {
    values: [
      {
        type: 'NotFoundError',
        value: REACT_REMOVE_CHILD_NOT_FOUND_ERROR,
        stacktrace: {
          frames: [
            {
              filename:
                './node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.production.js',
              abs_path:
                'app:///_next/static/chunks/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.production.js',
              in_app: false,
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

  it('drops translated-DOM React removeChild noise from browser page translation', () => {
    expect(shouldDropClientSentryEvent(eventWithTranslatedReactRemoveChildError())).toBe(true);
  });

  it('keeps React removeChild errors without the translation breadcrumb reportable', () => {
    const event = eventWithTranslatedReactRemoveChildError();
    event.breadcrumbs = [];

    expect(shouldDropClientSentryEvent(event)).toBe(false);
  });

  it('keeps React removeChild errors with first-party frames reportable', () => {
    const event = eventWithTranslatedReactRemoveChildError();
    event.exception?.values?.[0]?.stacktrace?.frames?.push({
      filename: 'src/components/organisms/CalculatorContainer.tsx',
      in_app: true,
    });

    expect(shouldDropClientSentryEvent(event)).toBe(false);
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
