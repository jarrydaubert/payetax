// Polyfills that must run before test environment setup (via setupFiles)
// Required because next/server imports Request at module level
// Note: undici doesn't work well with Jest's jsdom, so we use minimal polyfills
// that cover the actual usage patterns in this codebase (.json() method only)

const { TextDecoder, TextEncoder } = require('node:util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Minimal Request/Response/Headers for next/server compatibility
// These cover the actual usage in this codebase - for full fetch testing, use E2E
if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init) {
      this._map = new Map();
      if (init) {
        const entries =
          init instanceof Headers
            ? [...init._map.entries()]
            : Array.isArray(init)
              ? init
              : Object.entries(init);
        for (const [key, value] of entries) {
          this.set(key, value);
        }
      }
    }
    get(name) {
      return this._map.get(name.toLowerCase()) || null;
    }
    set(name, value) {
      this._map.set(name.toLowerCase(), String(value));
    }
    has(name) {
      return this._map.has(name.toLowerCase());
    }
    delete(name) {
      this._map.delete(name.toLowerCase());
    }
    append(name, value) {
      const key = name.toLowerCase();
      const existing = this._map.get(key);
      this._map.set(key, existing ? `${existing}, ${value}` : String(value));
    }
    forEach(cb) {
      this._map.forEach((v, k) => cb(v, k, this));
    }
    entries() {
      return this._map.entries();
    }
    keys() {
      return this._map.keys();
    }
    values() {
      return this._map.values();
    }
    [Symbol.iterator]() {
      return this._map.entries();
    }
  };
}

if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(url, init = {}) {
      this.url = typeof url === 'string' ? url : url.url;
      this.method = init.method || 'GET';
      this.headers = new Headers(init.headers);
      this.body = init.body;
    }
    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }
    async text() {
      return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
    }
  };
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || '';
      this.headers = new Headers(init.headers);
      this.ok = this.status >= 200 && this.status < 300;
    }
    static json(data, init = {}) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: { 'content-type': 'application/json', ...init.headers },
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
