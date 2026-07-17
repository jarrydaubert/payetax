import {
  CONSENT_LIFETIME_MS,
  clearCookieConsent,
  getConsentExpiryTime,
  getConsentPreferences,
  getConsentTimestamp,
  isAnalyticsConsented,
  isConsentExpired,
  setConsentPreferences,
} from '../cookieUtils';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('cookieUtils', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('structured preferences', () => {
    it('stores and reads structured preferences', () => {
      setConsentPreferences({ analytics: true });

      expect(getConsentPreferences()).toEqual({ analytics: true });
      expect(isAnalyticsConsented()).toBe(true);
    });

    it('reads declined structured preferences', () => {
      localStorageMock.setItem('cookie-consent', JSON.stringify({ analytics: false }));
      localStorageMock.setItem('cookie-consent-timestamp', new Date().toISOString());

      expect(getConsentPreferences()).toEqual({ analytics: false });
      expect(isAnalyticsConsented()).toBe(false);
    });

    it('clears malformed JSON consent payloads', () => {
      localStorageMock.setItem('cookie-consent', '{"analytics":"yes"}');
      localStorageMock.setItem('cookie-consent-timestamp', new Date().toISOString());

      expect(getConsentPreferences()).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cookie-consent');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cookie-consent-timestamp');
    });
  });

  describe('expiry behavior', () => {
    it('returns false for recent consent', () => {
      const recent = new Date(Date.now() - 300 * 24 * 60 * 60 * 1000);
      localStorageMock.setItem('cookie-consent-timestamp', recent.toISOString());

      expect(isConsentExpired()).toBe(false);
    });

    it('returns true for expired consent', () => {
      const old = new Date(Date.now() - 366 * 24 * 60 * 60 * 1000);
      localStorageMock.setItem('cookie-consent-timestamp', old.toISOString());

      expect(isConsentExpired()).toBe(true);
    });

    it('clears consent when expired on read', () => {
      const old = new Date(Date.now() - 366 * 24 * 60 * 60 * 1000);
      localStorageMock.setItem('cookie-consent', JSON.stringify({ analytics: true }));
      localStorageMock.setItem('cookie-consent-timestamp', old.toISOString());

      expect(getConsentPreferences()).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cookie-consent');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cookie-consent-timestamp');
    });

    it('treats a stored preference without a timestamp as expired', () => {
      localStorageMock.setItem('cookie-consent', JSON.stringify({ analytics: true }));

      expect(isConsentExpired()).toBe(true);
    });

    it('is not expired when nothing is stored at all', () => {
      expect(isConsentExpired()).toBe(false);
    });

    it('clears and re-prompts a preference that has no timestamp', () => {
      localStorageMock.setItem('cookie-consent', JSON.stringify({ analytics: true }));

      expect(getConsentPreferences()).toBeNull();
      expect(isAnalyticsConsented()).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cookie-consent');
    });

    it('treats a legacy value without a timestamp as expired', () => {
      localStorageMock.setItem('cookie-consent', 'accepted');

      expect(getConsentPreferences()).toBeNull();
      expect(isAnalyticsConsented()).toBe(false);
    });
  });

  describe('helpers', () => {
    it('clears consent values', () => {
      localStorageMock.setItem('cookie-consent', JSON.stringify({ analytics: true }));
      localStorageMock.setItem('cookie-consent-timestamp', new Date().toISOString());

      clearCookieConsent();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cookie-consent');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cookie-consent-timestamp');
    });

    it('returns valid timestamp when present', () => {
      const ts = new Date('2026-01-01T12:00:00.000Z');
      localStorageMock.setItem('cookie-consent-timestamp', ts.toISOString());

      expect(getConsentTimestamp()?.toISOString()).toBe(ts.toISOString());
      expect(getConsentExpiryTime()).toBe(ts.getTime() + CONSENT_LIFETIME_MS);
    });

    it('uses the canonical analytics consent helper', () => {
      localStorageMock.setItem('cookie-consent', JSON.stringify({ analytics: true }));
      localStorageMock.setItem('cookie-consent-timestamp', new Date().toISOString());

      expect(isAnalyticsConsented()).toBe(true);
    });
  });
});
