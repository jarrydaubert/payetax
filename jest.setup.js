import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers with jest-axe accessibility matchers
expect.extend(toHaveNoViolations);

// Components read NEXT_PUBLIC_* env vars at module init time.
// Provide stable defaults in Jest to avoid tests depending on local developer env.
process.env.NEXT_PUBLIC_GA_ID ||= 'G-ABCDEFGHIJ';

// Note: TextEncoder/TextDecoder and Fetch API polyfills (Request/Response/Headers)
// are in jest.setup.fetch.js which runs via setupFiles before module imports

// Mock Next.js router (App Router)
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '';
  },
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Mock Next.js dynamic imports
// Returns a placeholder component - actual components should be mocked individually in tests
jest.mock('next/dynamic', () => {
  return function dynamic(_dynamicImport, options) {
    const PlaceholderComponent = () => null;
    PlaceholderComponent.displayName = options?.loading
      ? 'DynamicComponentLoading'
      : 'DynamicComponent';
    PlaceholderComponent.preload = jest.fn();
    return PlaceholderComponent;
  };
});

// Mock lucide-react (ESM) to avoid Jest ESM parsing issues.
// Provide a generic SVG component for all icon exports.
jest.mock('lucide-react', () => {
  const React = require('react');
  const Icon = (props) => React.createElement('svg', { ...props, 'data-lucide': 'icon' });

  return new Proxy(
    { __esModule: true, default: Icon },
    {
      get(target, prop) {
        if (prop in target) return target[prop];
        return Icon;
      },
    },
  );
});

// Mock ResizeObserver (not available in jsdom)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Also set on window for libraries that access it directly
if (typeof window !== 'undefined') {
  window.ResizeObserver = global.ResizeObserver;
}

// Mock IntersectionObserver (not available in jsdom)
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

if (typeof window !== 'undefined') {
  window.IntersectionObserver = global.IntersectionObserver;
}

// Mock window.matchMedia (not available in jsdom)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => {
      // Basic, dynamic-ish matchMedia mock for common queries used in this codebase.
      // Keeps unit tests closer to real behavior (e.g., LandscapePrompt).
      const maxWidth = /\(max-width:\s*(\d+)px\)/i.exec(query)?.[1];
      const minWidth = /\(min-width:\s*(\d+)px\)/i.exec(query)?.[1];

      const isPortrait =
        typeof window.innerWidth === 'number' &&
        typeof window.innerHeight === 'number' &&
        window.innerHeight >= window.innerWidth;

      let matches = false;
      if (maxWidth) matches = window.innerWidth <= Number(maxWidth);
      if (minWidth) matches = window.innerWidth >= Number(minWidth);
      if (/\(orientation:\s*portrait\)/i.test(query)) matches = isPortrait;
      if (/\(orientation:\s*landscape\)/i.test(query)) matches = !isPortrait;

      return {
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
    }),
  });

  // Mock window.scrollTo (not available in jsdom, used by motion-dom animations)
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: jest.fn(),
  });
}

// Console handling: Allow errors through (important for finance app correctness)
// Only mute warnings to reduce noise from third-party libraries
global.console = {
  ...console,
  warn: jest.fn(),
  // error is NOT mocked - real errors should surface in tests
};
