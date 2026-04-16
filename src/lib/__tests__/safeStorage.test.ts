/**
 * @jest-environment jsdom
 */

describe('safeStorage', () => {
  function loadModule() {
    let loaded: typeof import('../safeStorage') | undefined;
    jest.isolateModules(() => {
      loaded = require('../safeStorage') as typeof import('../safeStorage');
    });
    if (!loaded) {
      throw new Error('Failed to load safeStorage module');
    }
    return loaded;
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reads and writes when localStorage is available', () => {
    const storage = {
      getItem: jest.fn((key: string) => (key === 'token' ? 'abc' : null)),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: storage,
      configurable: true,
      writable: true,
    });

    const { safeGetItem, safeSetItem, safeRemoveItem, safeStorage } = loadModule();

    expect(safeGetItem('token')).toBe('abc');
    safeSetItem('token', 'updated');
    safeRemoveItem('token');
    safeStorage.setItem('persisted', 'value');

    expect(storage.setItem).toHaveBeenCalledWith('__storage_test__', '__storage_test__');
    expect(storage.setItem).toHaveBeenCalledWith('token', 'updated');
    expect(storage.setItem).toHaveBeenCalledWith('persisted', 'value');
    expect(storage.removeItem).toHaveBeenCalledWith('token');
  });

  it('fails closed when localStorage access throws', () => {
    const storage = {
      getItem: jest.fn(() => {
        throw new DOMException('Blocked', 'SecurityError');
      }),
      setItem: jest.fn(() => {
        throw new DOMException('Blocked', 'SecurityError');
      }),
      removeItem: jest.fn(() => {
        throw new DOMException('Blocked', 'SecurityError');
      }),
    };

    Object.defineProperty(window, 'localStorage', {
      value: storage,
      configurable: true,
      writable: true,
    });

    const { safeGetItem, safeSetItem, safeRemoveItem, safeStorage } = loadModule();

    expect(safeGetItem('token')).toBeNull();
    expect(() => safeSetItem('token', 'value')).not.toThrow();
    expect(() => safeRemoveItem('token')).not.toThrow();
    expect(() => safeStorage.removeItem('persisted')).not.toThrow();
  });
});
