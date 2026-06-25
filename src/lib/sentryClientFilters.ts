import type { Event, EventHint } from '@sentry/nextjs';

const NON_ACTIONABLE_CLIENT_ERROR_FRAGMENTS = [
  'feature named `hover` was not found',
  'feature named `performanceMetrics` was not found',
  'Connection closed.',
];

const CUSTOM_EVENT_PROMISE_REJECTION =
  'Event `CustomEvent` (type=unhandledrejection) captured as promise rejection';
const INJECTED_APP_SCRIPT_URL_PATTERN = /^app:\/\/\/[a-f0-9]+\/script\.js$/i;
const INVALID_TOKEN_SYNTAX_ERROR = 'Invalid or unexpected token';
const REACT_REMOVE_CHILD_NOT_FOUND_ERROR =
  "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.";
const REACT_DOM_CLIENT_FRAME_PATTERN =
  /(?:^|\/)node_modules\/next\/dist\/compiled\/react-dom\/cjs\/react-dom-client(?:\.production)?\.js$/i;
const TRANSLATED_FONT_BREADCRUMB = 'font > font';

type SentryException = NonNullable<NonNullable<Event['exception']>['values']>[number];
type SentryStackFrame = NonNullable<
  NonNullable<SentryException['stacktrace']>['frames']
>[number] & {
  absPath?: string;
  inApp?: boolean;
};

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

function isInjectedAppScriptSyntaxError(event: Event): boolean {
  return (event.exception?.values ?? []).some((exception: SentryException) => {
    if (exception.type !== 'SyntaxError' || exception.value !== INVALID_TOKEN_SYNTAX_ERROR) {
      return false;
    }

    return (exception.stacktrace?.frames ?? []).some((frame) =>
      [frame.filename, frame.abs_path].some(
        (url) => typeof url === 'string' && INJECTED_APP_SCRIPT_URL_PATTERN.test(url),
      ),
    );
  });
}

function getFrameUrls(frame: SentryStackFrame): string[] {
  return [frame.filename, frame.abs_path, frame.absPath].filter(
    (url): url is string => typeof url === 'string',
  );
}

function isReactDomClientFrame(frame: SentryStackFrame): boolean {
  return getFrameUrls(frame).some((url) => REACT_DOM_CLIENT_FRAME_PATTERN.test(url));
}

function isInAppFrame(frame: SentryStackFrame): boolean {
  return frame.in_app === true || frame.inApp === true;
}

function hasTranslatedFontBreadcrumb(event: Event): boolean {
  return (event.breadcrumbs ?? []).some(
    (breadcrumb) =>
      typeof breadcrumb.message === 'string' &&
      breadcrumb.message.trim() === TRANSLATED_FONT_BREADCRUMB,
  );
}

function isTranslatedReactRemoveChildError(event: Event): boolean {
  if (!hasTranslatedFontBreadcrumb(event)) {
    return false;
  }

  return (event.exception?.values ?? []).some((exception: SentryException) => {
    if (
      exception.type !== 'NotFoundError' ||
      exception.value !== REACT_REMOVE_CHILD_NOT_FOUND_ERROR
    ) {
      return false;
    }

    const frames = (exception.stacktrace?.frames ?? []) as SentryStackFrame[];
    if (!frames.some(isReactDomClientFrame)) {
      return false;
    }

    return !frames.some((frame) => isInAppFrame(frame) && !isReactDomClientFrame(frame));
  });
}

export function shouldDropClientSentryEvent(event: Event, hint?: EventHint): boolean {
  if (isCustomEventPromiseRejection(event, hint)) {
    return true;
  }

  if (isInjectedAppScriptSyntaxError(event)) {
    return true;
  }

  if (isTranslatedReactRemoveChildError(event)) {
    return true;
  }

  return collectEventMessages(event).some((message) =>
    NON_ACTIONABLE_CLIENT_ERROR_FRAGMENTS.some((fragment) => message.includes(fragment)),
  );
}
