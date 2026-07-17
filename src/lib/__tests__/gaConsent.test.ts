// src/lib/__tests__/gaConsent.test.ts
import {
  applyConsentUpdate,
  bootstrapGa,
  gtagQueued,
  isGaBootstrapped,
  markGaLoaded,
  pendingEventCount,
  removeGaCookies,
  resetGaConsentStateForTests,
  setGaDisabled,
} from '../gaConsent';

jest.mock('@/lib/cookieUtils', () => ({
  isAnalyticsConsented: jest.fn(() => true),
}));

jest.mock('@/lib/analyticsConfig', () => ({
  getGoogleAnalyticsMeasurementId: jest.fn(),
  isGoogleAnalyticsEnabled: jest.fn(),
}));

import { getGoogleAnalyticsMeasurementId, isGoogleAnalyticsEnabled } from '@/lib/analyticsConfig';
import { isAnalyticsConsented } from '@/lib/cookieUtils';

const mockConsented = isAnalyticsConsented as jest.Mock;
const mockMeasurementId = getGoogleAnalyticsMeasurementId as jest.Mock;
const mockAnalyticsEnabled = isGoogleAnalyticsEnabled as jest.Mock;
const GA_ID = 'G-TESTID1234';

type WindowWithGa = Window & {
  dataLayer?: IArguments[];
  gtag?: unknown;
} & Record<string, unknown>;

const win = window as unknown as WindowWithGa;

/** dataLayer entries as plain arrays for assertions */
function dlEntries(): unknown[][] {
  return (win.dataLayer ?? []).map((args) => Array.from(args as unknown as ArrayLike<unknown>));
}

/** Test fixture writes need document.cookie; jsdom has no Cookie Store API. */
function writeCookie(cookie: string): void {
  // biome-ignore lint/suspicious/noDocumentCookie: jsdom test fixture setup
  document.cookie = cookie;
}

function clearAllCookies(): void {
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0]?.trim();
    if (name) {
      writeCookie(`${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`);
    }
  }
}

describe('gaConsent', () => {
  beforeEach(() => {
    resetGaConsentStateForTests();
    mockConsented.mockReturnValue(true);
    mockMeasurementId.mockReturnValue(GA_ID);
    mockAnalyticsEnabled.mockReturnValue(true);
    win.dataLayer = undefined;
    win.gtag = undefined;
    win[`ga-disable-${GA_ID}`] = undefined;
    clearAllCookies();
  });

  describe('bootstrapGa', () => {
    it('pushes js, denied consent default, then config with send_page_view disabled — in order', () => {
      bootstrapGa();

      const entries = dlEntries();
      const jsIndex = entries.findIndex((e) => e[0] === 'js');
      const defaultIndex = entries.findIndex((e) => e[0] === 'consent' && e[1] === 'default');
      const configIndex = entries.findIndex((e) => e[0] === 'config' && e[1] === GA_ID);

      expect(jsIndex).toBeGreaterThanOrEqual(0);
      expect(defaultIndex).toBeGreaterThan(jsIndex);
      expect(configIndex).toBeGreaterThan(defaultIndex);

      expect(entries[defaultIndex][2]).toMatchObject({
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
      expect(entries[configIndex][2]).toMatchObject({ send_page_view: false });
      expect(isGaBootstrapped()).toBe(true);
      expect(typeof win.gtag).toBe('function');
    });

    it('is idempotent — a second call pushes nothing new', () => {
      bootstrapGa();
      const lengthAfterFirst = win.dataLayer?.length ?? 0;

      bootstrapGa();

      expect(win.dataLayer?.length).toBe(lengthAfterFirst);
    });

    it('fails closed without the centrally enabled measurement ID', () => {
      mockMeasurementId.mockReturnValue(null);

      bootstrapGa();

      expect(isGaBootstrapped()).toBe(false);
      expect(win.dataLayer).toBeUndefined();
      expect(win.gtag).toBeUndefined();
    });
  });

  describe('applyConsentUpdate', () => {
    it('never initialises gtag or the dataLayer on an unconsented visit', () => {
      applyConsentUpdate(false);

      expect(win.dataLayer).toBeUndefined();
      expect(win.gtag).toBeUndefined();
      expect(win[`ga-disable-${GA_ID}`]).toBe(true);
    });

    it('pushes an explicit granted update after bootstrap (grant and re-grant)', () => {
      bootstrapGa();
      applyConsentUpdate(true);
      applyConsentUpdate(false);
      applyConsentUpdate(true);

      const updates = dlEntries().filter((e) => e[0] === 'consent' && e[1] === 'update');
      expect(updates).toHaveLength(3);
      expect(updates[0][2]).toMatchObject({ analytics_storage: 'granted' });
      expect(updates[1][2]).toMatchObject({ analytics_storage: 'denied' });
      expect(updates[2][2]).toMatchObject({ analytics_storage: 'granted' });
      expect(win[`ga-disable-${GA_ID}`]).toBe(false);
    });

    it('sets the kill switch on denial and clears it on grant', () => {
      applyConsentUpdate(false);
      expect(win[`ga-disable-${GA_ID}`]).toBe(true);

      applyConsentUpdate(true);
      expect(win[`ga-disable-${GA_ID}`]).toBe(false);
    });
  });

  describe('event queue', () => {
    it('queues events before gtag.js loads and flushes them on load while consented', () => {
      bootstrapGa();
      gtagQueued('event', 'page_view', { page_path: '/' });

      expect(pendingEventCount()).toBe(1);
      expect(dlEntries().some((e) => e[0] === 'event')).toBe(false);

      markGaLoaded();

      expect(pendingEventCount()).toBe(0);
      const events = dlEntries().filter((e) => e[0] === 'event');
      expect(events).toHaveLength(1);
      expect(events[0][1]).toBe('page_view');
    });

    it('pushes straight to the dataLayer once loaded', () => {
      bootstrapGa();
      markGaLoaded();

      gtagQueued('event', 'calculator_usage', { label: 'annual' });

      expect(pendingEventCount()).toBe(0);
      expect(dlEntries().some((e) => e[0] === 'event' && e[1] === 'calculator_usage')).toBe(true);
    });

    it('purges the queue when gtag.js loads after consent was withdrawn', () => {
      bootstrapGa();
      gtagQueued('event', 'page_view', { page_path: '/' });
      mockConsented.mockReturnValue(false);

      markGaLoaded();

      expect(pendingEventCount()).toBe(0);
      expect(dlEntries().some((e) => e[0] === 'event')).toBe(false);
    });

    it('an event queued after acceptance cannot survive withdrawal and replay after re-acceptance', () => {
      // accept → queue → withdraw before gtag.js loads → re-accept → load
      bootstrapGa();
      applyConsentUpdate(true);
      gtagQueued('event', 'calculator_start', { label: 'before-withdrawal' });
      expect(pendingEventCount()).toBe(1);

      applyConsentUpdate(false); // withdrawal purges the queue
      expect(pendingEventCount()).toBe(0);

      applyConsentUpdate(true); // re-accept
      gtagQueued('event', 'calculator_start', { label: 'after-re-accept' });

      markGaLoaded(); // gtag.js finishes loading

      const events = dlEntries().filter((e) => e[0] === 'event' && e[1] === 'calculator_start');
      expect(events).toHaveLength(1);
      expect(events[0][2]).toMatchObject({ label: 'after-re-accept' });
    });

    it('never accumulates events while analytics is disabled or unconfigured', () => {
      gtagQueued('event', 'calculator_start', { label: 'unconfigured' });
      expect(pendingEventCount()).toBe(1);

      mockAnalyticsEnabled.mockReturnValue(false);
      mockMeasurementId.mockReturnValue(null);
      gtagQueued('event', 'calculator_start', { label: 'disabled' });

      expect(pendingEventCount()).toBe(0);
      expect(win.dataLayer).toBeUndefined();
    });
  });

  describe('removeGaCookies', () => {
    it('removes _ga and _ga_* cookies without touching unrelated cookies', () => {
      writeCookie('_ga=GA1.1.111.222; path=/');
      writeCookie('_ga_TESTID1234=GS1.1.333; path=/');
      writeCookie('theme=dark; path=/');

      removeGaCookies();

      expect(document.cookie).not.toContain('_ga=');
      expect(document.cookie).not.toContain('_ga_TESTID1234=');
      expect(document.cookie).toContain('theme=dark');
    });

    it('does not remove cookies that merely start with _ga-like names', () => {
      writeCookie('_gat_custom=1; path=/');
      writeCookie('_gales=1; path=/');

      removeGaCookies();

      expect(document.cookie).toContain('_gat_custom=1');
      expect(document.cookie).toContain('_gales=1');
    });
  });

  describe('setGaDisabled', () => {
    it('sets the per-measurement-id window flag', () => {
      setGaDisabled(true);
      expect(win[`ga-disable-${GA_ID}`]).toBe(true);

      setGaDisabled(false);
      expect(win[`ga-disable-${GA_ID}`]).toBe(false);
    });
  });
});
