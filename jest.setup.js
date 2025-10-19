import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'node:util';
import { toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers with jest-axe accessibility matchers
expect.extend(toHaveNoViolations);

// Polyfill TextEncoder/TextDecoder for Node.js (required by Next.js modules)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill Request/Response for Next.js web APIs
// These are basic polyfills - for full Web APIs, tests should use proper environment
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.init = init || {};
      this.status = this.init.status || 200;
      this.statusText = this.init.statusText || '';
      this.headers = new Headers(this.init.headers || {});
      this.ok = this.status >= 200 && this.status < 300;
    }

    static json(data, init) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...(init?.headers || {}),
        },
      });
    }

    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }

    async text() {
      return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
    }
  };
}

if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(url, init) {
      this.url = url;
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers || {});
      this.body = init?.body;
    }

    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }
  };
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init) {
      this.map = new Map();
      if (init) {
        if (init instanceof Headers) {
          init.forEach((value, key) => this.set(key, value));
        } else if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.set(key, value));
        } else {
          Object.entries(init).forEach(([key, value]) => this.set(key, value));
        }
      }
    }

    get(name) {
      return this.map.get(name.toLowerCase()) || null;
    }

    set(name, value) {
      this.map.set(name.toLowerCase(), String(value));
    }

    has(name) {
      return this.map.has(name.toLowerCase());
    }

    delete(name) {
      this.map.delete(name.toLowerCase());
    }

    forEach(callback) {
      this.map.forEach((value, key) => callback(value, key, this));
    }

    entries() {
      return this.map.entries();
    }

    keys() {
      return this.map.keys();
    }

    values() {
      return this.map.values();
    }

    [Symbol.iterator]() {
      return this.map.entries();
    }
  };
}

// Optional: configure or set up a testing framework before each test
// Add global test utilities, mocks, or configurations here

// Mock Next.js router
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
}));

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => {
  return function dynamic(fn) {
    const Component = fn();
    Component.displayName = 'DynamicComponent';
    return Component;
  };
});

// Mock ResizeObserver (not available in jsdom)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver (not available in jsdom)
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia (not available in jsdom, only needed in browser environments)
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
}

// Mock console methods in tests to avoid noise
global.console = {
  ...console,
  // uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
