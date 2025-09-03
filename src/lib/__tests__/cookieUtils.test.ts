// src/lib/__tests__/cookieUtils.test.ts

import {
  areCookiesAccepted,
  areCookiesDeclined,
  type CookieConsent,
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
      delete (window as any).localStorage;

      expect(getCookieConsent()).toBeNull();

      window.localStorage = originalLocalStorage;
    });

    test('should return null in server environment', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(getCookieConsent()).toBeNull();

      global.window = originalWindow;
    });

    test('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      expect(getCookieConsent()).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to get cookie consent status:',
        expect.any(Error)
      );
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
      delete (window as any).localStorage;

      expect(getConsentTimestamp()).toBeNull();

      window.localStorage = originalLocalStorage;
    });

    test('should return null in server environment', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(getConsentTimestamp()).toBeNull();

      global.window = originalWindow;
    });

    test('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      expect(getConsentTimestamp()).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to get consent timestamp:',
        expect.any(Error)
      );
    });

    test('should handle invalid date strings', () => {
      localStorageMock.setItem('cookie-consent-timestamp', 'invalid-date');

      const result = getConsentTimestamp();
      expect(result).toBeInstanceOf(Date);
      expect(isNaN(result!.getTime())).toBe(true);
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
      delete (window as any).localStorage;

      expect(() => clearCookieConsent()).not.toThrow();

      window.localStorage = originalLocalStorage;
    });

    test('should handle server environment gracefully', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(() => clearCookieConsent()).not.toThrow();

      global.window = originalWindow;
    });

    test('should handle localStorage errors gracefully', () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      clearCookieConsent();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to clear cookie consent:',
        expect.any(Error)
      );
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

    test('should return false for consent exactly at 12 months', () => {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      localStorageMock.setItem('cookie-consent-timestamp', twelveMonthsAgo.toISOString());

      expect(isConsentExpired()).toBe(false);
    });

    test('should return true when getConsentTimestamp throws error', () => {
      // Mock getConsentTimestamp to throw error by making localStorage.getItem throw
      const mockError = new Error('localStorage error');
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw mockError;
      });

      // Clear any existing items first to ensure we hit the error path
      localStorageMock.clear();
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw mockError;
      });

      expect(isConsentExpired()).toBe(true);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to check if consent is expired:',
        mockError
      );
    });

    test('should handle edge case around month boundaries', () => {
      // Test around February/March boundary to ensure month calculation is correct
      const testDate = new Date('2024-03-31T10:00:00Z');
      const twelveMonthsEarlier = new Date('2023-03-31T10:00:00Z');

      // Mock current date
      const originalNow = Date.now;
      Date.now = jest.fn(() => testDate.getTime());
      global.Date = class extends Date {
        constructor(...args: any[]) {
          if (args.length === 0) {
            return new (originalNow as any)(Date.now());
          }
          return new (originalNow as any)(...args);
        }
      } as any;

      localStorageMock.setItem('cookie-consent-timestamp', twelveMonthsEarlier.toISOString());

      expect(isConsentExpired()).toBe(false);

      // Restore original Date
      global.Date = originalNow as any;
    });
  });
});
