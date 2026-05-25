import type { Event, EventHint } from '@sentry/nextjs';

const NON_ACTIONABLE_CLIENT_ERROR_FRAGMENTS = [
  'feature named `hover` was not found',
  'feature named `performanceMetrics` was not found',
  'Connection closed.',
];

const CUSTOM_EVENT_PROMISE_REJECTION =
  'Event `CustomEvent` (type=unhandledrejection) captured as promise rejection';

function collectEventMessages(event: Event): string[] {
  const messages: string[] = [];

  if (typeof event.message === 'string') {
    messages.push(event.message);
  }

  for (const exception of event.exception?.values ?? []) {
    if (typeof exception.value === 'string') {
      messages.push(exception.value);
    }
  }

  return messages;
}

function isCustomEventPromiseRejection(event: Event, hint?: EventHint): boolean {
  const originalException = hint?.originalException;

  if (typeof CustomEvent !== 'undefined' && originalException instanceof CustomEvent) {
    return true;
  }

  return collectEventMessages(event).some((message) =>
    message.includes(CUSTOM_EVENT_PROMISE_REJECTION),
  );
}

export function shouldDropClientSentryEvent(event: Event, hint?: EventHint): boolean {
  if (isCustomEventPromiseRejection(event, hint)) {
    return true;
  }

  return collectEventMessages(event).some((message) =>
    NON_ACTIONABLE_CLIENT_ERROR_FRAGMENTS.some((fragment) => message.includes(fragment)),
  );
}
