import type { Event, EventHint } from '@sentry/nextjs';
import { shouldDropClientSentryEvent } from '@/lib/sentryClientFilters';

const eventWithExceptionValue = (value: string): Event => ({
  exception: {
    values: [{ value }],
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

  it('keeps normal application errors reportable', () => {
    expect(shouldDropClientSentryEvent(eventWithExceptionValue('Calculation failed'))).toBe(false);
  });
});
