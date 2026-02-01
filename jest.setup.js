import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers with jest-axe accessibility matchers
expect.extend(toHaveNoViolations);

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
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
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
