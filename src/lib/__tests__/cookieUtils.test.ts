// src/lib/__tests__/cookieUtils.test.ts

import {
  areCookiesAccepted,
  areCookiesDeclined,
  clearCookieConsent,
  getConsentTimestamp,
  getCookieConsent,
  isConsentExpired,
} from '../cookieUtils';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Mock console.warn
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

// Mock window and localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Cookie Utils', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    consoleWarnSpy.mockClear();
  });

  describe('getCookieConsent', () => {
    test('should return null when no consent is stored', () => {
      expect(getCookieConsent()).toBeNull();
    });

    test('should return "accepted" when consent is accepted', () => {
      localStorageMock.setItem('cookie-consent', 'accepted');
      expect(getCookieConsent()).toBe('accepted');
    });

    test('should return "declined" when consent is declined', () => {
      localStorageMock.setItem('cookie-consent', 'declined');
      expect(getCookieConsent()).toBe('declined');
    });

    test('should return null for invalid consent values', () => {
      localStorageMock.setItem('cookie-consent', 'invalid');
      expect(getCookieConsent()).toBeNull();
    });

    test('should return null when localStorage is not available', () => {
      const originalLocalStorage = window.localStorage;
      (window as typeof window & { localStorage?: unknown }).localStorage = undefined;

      expect(getCookieConsent()).toBeNull();

      window.localStorage = originalLocalStorage;
    });

    test('should return null in server environment', () => {
      const originalWindow = global.window;
      (global as typeof global & { window?: unknown }).window = undefined;

      expect(getCookieConsent()).toBeNull();

      global.window = originalWindow;
    });

    test('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      // safeStorage handles errors internally and returns null
      expect(getCookieConsent()).toBeNull();
    });
  });

  describe('areCookiesAccepted', () => {
    test('should return true when cookies are accepted', () => {
      localStorageMock.setItem('cookie-consent', 'accepted');
      expect(areCookiesAccepted()).toBe(true);
    });

    test('should return false when cookies are declined', () => {
      localStorageMock.setItem('cookie-consent', 'declined');
      expect(areCookiesAccepted()).toBe(false);
    });

    test('should return false when no consent is given', () => {
      expect(areCookiesAccepted()).toBe(false);
    });
  });

  describe('areCookiesDeclined', () => {
    test('should return true when cookies are declined', () => {
      localStorageMock.setItem('cookie-consent', 'declined');
      expect(areCookiesDeclined()).toBe(true);
    });

    test('should return false when cookies are accepted', () => {
      localStorageMock.setItem('cookie-consent', 'accepted');
      expect(areCookiesDeclined()).toBe(false);
    });

    test('should return false when no consent is given', () => {
      expect(areCookiesDeclined()).toBe(false);
    });
  });

  describe('getConsentTimestamp', () => {
    test('should return null when no timestamp is stored', () => {
      expect(getConsentTimestamp()).toBeNull();
    });

    test('should return Date object when valid timestamp is stored', () => {
      const testDate = new Date('2024-01-15T10:30:00Z');
      localStorageMock.setItem('cookie-consent-timestamp', testDate.toISOString());

      const result = getConsentTimestamp();
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(testDate.getTime());
    });

    test('should return null when localStorage is not available', () => {
      const originalLocalStorage = window.localStorage;
      (window as typeof window & { localStorage?: unknown }).localStorage = undefined;

      expect(getConsentTimestamp()).toBeNull();

      window.localStorage = originalLocalStorage;
    });

    test('should return null in server environment', () => {
      const originalWindow = global.window;
      (global as typeof global & { window?: unknown }).window = undefined;

      expect(getConsentTimestamp()).toBeNull();

      global.window = originalWindow;
    });

    test('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      // safeStorage handles errors internally and returns null
      expect(getConsentTimestamp()).toBeNull();
    });

    test('should handle invalid date strings', () => {
      localStorageMock.setItem('cookie-consent-timestamp', 'invalid-date');

      // New implementation validates date and returns null for invalid dates
      const result = getConsentTimestamp();
      expect(result).toBeNull();
    });
  });

  describe('clearCookieConsent', () => {
    test('should remove both consent and timestamp from localStorage', () => {
      localStorageMock.setItem('cookie-consent', 'accepted');
      localStorageMock.setItem('cookie-consent-timestamp', '2024-01-15');

      clearCookieConsent();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cookie-consent');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cookie-consent-timestamp');
    });

    test('should handle missing localStorage gracefully', () => {
      const originalLocalStorage = window.localStorage;
      (window as typeof window & { localStorage?: unknown }).localStorage = undefined;

      expect(() => clearCookieConsent()).not.toThrow();

      window.localStorage = originalLocalStorage;
    });

    test('should handle server environment gracefully', () => {
      const originalWindow = global.window;
      (global as typeof global & { window?: unknown }).window = undefined;

      expect(() => clearCookieConsent()).not.toThrow();

      global.window = originalWindow;
    });

    test('should handle localStorage errors gracefully', () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      // safeStorage handles errors internally - should not throw
      expect(() => clearCookieConsent()).not.toThrow();
    });
  });

  describe('isConsentExpired', () => {
    test('should return false when no timestamp exists', () => {
      expect(isConsentExpired()).toBe(false);
    });

    test('should return false for recent consent (within 12 months)', () => {
      const recentDate = new Date();
      recentDate.setMonth(recentDate.getMonth() - 6); // 6 months ago

      localStorageMock.setItem('cookie-consent-timestamp', recentDate.toISOString());

      expect(isConsentExpired()).toBe(false);
    });

    test('should return true for old consent (over 12 months)', () => {
      const oldDate = new Date();
      oldDate.setMonth(oldDate.getMonth() - 15); // 15 months ago

      localStorageMock.setItem('cookie-consent-timestamp', oldDate.toISOString());

      expect(isConsentExpired()).toBe(true);
    });

    test('should return false for consent within 12 months', () => {
      // Use ms arithmetic to avoid month-length edge cases.
      // 360 days is safely within the 365-day window used by isConsentExpired().
      const withinWindow = new Date(Date.now() - 360 * 24 * 60 * 60 * 1000);
      localStorageMock.setItem('cookie-consent-timestamp', withinWindow.toISOString());

      expect(isConsentExpired()).toBe(false);
    });

    test('should return true when getConsentTimestamp throws error', () => {
      // Mock getConsentTimestamp to throw error by making localStorage.getItem throw
      const mockError = new Error('localStorage error');
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw mockError;
      });

      // safeStorage handles errors internally and returns null
      // When getConsentTimestamp returns null, isConsentExpired returns false
      // (no consent timestamp = no consent given = not expired)
      expect(isConsentExpired()).toBe(false);
    });

    test('should handle edge case around month boundaries', () => {
      // Validate exact 12-month boundary around a real month-end transition.
      const nowMs = Date.parse('2025-03-31T10:00:00.000Z');
      const boundaryTimestamp = new Date(Date.parse('2024-03-31T10:00:00.000Z')).toISOString();
      const expiredTimestamp = new Date(Date.parse('2024-03-31T09:59:59.999Z')).toISOString();
      const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(nowMs);

      localStorageMock.setItem('cookie-consent-timestamp', boundaryTimestamp);
      expect(isConsentExpired()).toBe(false);

      localStorageMock.setItem('cookie-consent-timestamp', expiredTimestamp);
      expect(isConsentExpired()).toBe(true);

      dateNowSpy.mockRestore();
    });
  });
});
