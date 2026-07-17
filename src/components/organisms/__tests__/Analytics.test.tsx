/**
 * @jest-environment jsdom
 */
// src/components/organisms/__tests__/Analytics.test.tsx

import { render, waitFor } from '@testing-library/react';
import { getGoogleAnalyticsMeasurementId } from '@/lib/analyticsConfig';
import { CONSENT_LIFETIME_MS } from '@/lib/cookieUtils';
import { pendingEventCount, resetGaConsentStateForTests } from '@/lib/gaConsent';
import { Analytics } from '../Analytics';

jest.mock('@/lib/analyticsConfig', () => ({
  getGoogleAnalyticsMeasurementId: jest.fn(),
  isGoogleAnalyticsEnabled: jest.fn(() => true),
}));

// Mock next/navigation with a mutable pathname so route changes can be simulated
let mockPathname = '/';
const mockSearchParams = new URLSearchParams();
let mockAutoLoadGaScript = true;
const mockGaScriptCallbacks = new Map<number, { onLoad?: () => void; onError?: () => void }>();
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

// Mock next/script: simulate the external gtag.js script loading after mount
jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ children, onLoad, onReady, onError, src, ...props }: any) => {
    const { useEffect } = require('react');
    useEffect(() => {
      const attempt = Number(new URL(src).searchParams.get('payetax_retry'));
      mockGaScriptCallbacks.set(attempt, { onLoad, onError });
      if (mockAutoLoadGaScript) {
        onLoad?.();
        onReady?.();
      }
    }, [onLoad, onReady, onError, src]);
    return children ? (
      <script {...props} src={src}>
        {children}
      </script>
    ) : (
      <script {...props} src={src} />
    );
  },
}));

const GA_ID = process.env.NEXT_PUBLIC_GA_ID as string;
const mockGetMeasurementId = getGoogleAnalyticsMeasurementId as jest.Mock;

type WindowWithGa = Window & {
  dataLayer?: IArguments[];
  gtag?: unknown;
  consentMode?: { isConsentGiven: boolean };
} & Record<string, unknown>;

const win = window as unknown as WindowWithGa;

/** dataLayer entries as plain arrays for assertions */
function dlEntries(): unknown[][] {
  return (win.dataLayer ?? []).map((args) => Array.from(args as unknown as ArrayLike<unknown>));
}

function pageViews(): unknown[][] {
  return dlEntries().filter((e) => e[0] === 'event' && e[1] === 'page_view');
}

function consentUpdates(): unknown[][] {
  return dlEntries().filter((e) => e[0] === 'consent' && e[1] === 'update');
}

function storeConsent(analytics: boolean): void {
  window.localStorage.setItem('cookie-consent-timestamp', new Date().toISOString());
  window.localStorage.setItem('cookie-consent', JSON.stringify({ analytics }));
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

describe('Analytics Component', () => {
  beforeEach(() => {
    mockPathname = '/';
    mockAutoLoadGaScript = true;
    mockGaScriptCallbacks.clear();
    mockGetMeasurementId.mockReturnValue(GA_ID);
    resetGaConsentStateForTests();
    window.localStorage.clear();
    clearAllCookies();
    win.dataLayer = undefined;
    win.gtag = undefined;
    win.consentMode = undefined;
    win[`ga-disable-${GA_ID}`] = undefined;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('stays Google-free before any consent decision', async () => {
      const { container } = render(<Analytics />);

      await waitFor(() => {
        expect(win.consentMode?.isConsentGiven).toBe(false);
      });

      expect(container.querySelector('#ga-script')).not.toBeInTheDocument();
      expect(win.dataLayer).toBeUndefined();
      expect(win.gtag).toBeUndefined();
      expect(consentUpdates()).toHaveLength(0);
    });

    it('renders the gtag.js script and bootstraps GA after stored consent', async () => {
      storeConsent(true);

      const { container } = render(<Analytics />);

      await waitFor(() => {
        const script = container.querySelector('#ga-script');
        expect(script).toBeInTheDocument();
        expect(script?.getAttribute('src')).toContain(GA_ID);
        expect(script).toHaveAttribute('strategy', 'afterInteractive');
      });

      const entries = dlEntries();
      const defaultIndex = entries.findIndex((e) => e[0] === 'consent' && e[1] === 'default');
      const configIndex = entries.findIndex((e) => e[0] === 'config' && e[1] === GA_ID);
      const updateIndex = entries.findIndex((e) => e[0] === 'consent' && e[1] === 'update');

      expect(defaultIndex).toBeGreaterThanOrEqual(0);
      expect(configIndex).toBeGreaterThan(defaultIndex);
      expect(updateIndex).toBeGreaterThan(configIndex);
      expect(entries[defaultIndex][2]).toMatchObject({ analytics_storage: 'denied' });
      expect(entries[configIndex][2]).toMatchObject({ send_page_view: false });
      expect(entries[updateIndex][2]).toMatchObject({
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    });

    it('sets consentMode.isConsentGiven to true when consent accepted', async () => {
      storeConsent(true);

      render(<Analytics />);

      await waitFor(() => {
        expect(win.consentMode?.isConsentGiven).toBe(true);
      });
    });

    it('flips the kill switch and stays quiet for a stored rejection', async () => {
      storeConsent(false);

      const { container } = render(<Analytics />);

      await waitFor(() => {
        expect(win.consentMode?.isConsentGiven).toBe(false);
      });

      expect(container.querySelector('#ga-script')).not.toBeInTheDocument();
      expect(win[`ga-disable-${GA_ID}`]).toBe(true);
      expect(win.dataLayer).toBeUndefined();
    });

    it('removes stale GA cookies on an unconsented mount', async () => {
      writeCookie('_ga=GA1.1.111.222; path=/');
      writeCookie(`_ga_${GA_ID.replace('G-', '')}=GS1.1.333; path=/`);
      writeCookie('theme=dark; path=/');

      render(<Analytics />);

      await waitFor(() => {
        expect(win.consentMode?.isConsentGiven).toBe(false);
      });

      expect(document.cookie).not.toContain('_ga');
      expect(document.cookie).toContain('theme=dark');
    });

    it('does not bootstrap or queue when the central analytics gate is closed', async () => {
      mockGetMeasurementId.mockReturnValue(null);
      storeConsent(true);
      writeCookie('_ga=GA1.1.111.222; path=/');

      const { container } = render(<Analytics />);

      await waitFor(() => {
        expect(win.consentMode?.isConsentGiven).toBe(false);
      });

      expect(container.querySelector('#ga-script')).not.toBeInTheDocument();
      expect(win.dataLayer).toBeUndefined();
      expect(win.gtag).toBeUndefined();
      expect(document.cookie).not.toContain('_ga=');
    });
  });

  describe('Page View Tracking', () => {
    it('sends one explicit page_view event per navigation (queued until gtag.js loads)', async () => {
      storeConsent(true);

      render(<Analytics />);

      await waitFor(() => {
        expect(pageViews()).toHaveLength(1);
      });
      expect(pageViews()[0][2]).toMatchObject({ page_path: '/' });
    });

    it('does not send a duplicate page_view when effects re-run on the same URL', async () => {
      storeConsent(true);

      const { rerender } = render(<Analytics />);
      await waitFor(() => expect(pageViews()).toHaveLength(1));

      rerender(<Analytics />);

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(pageViews()).toHaveLength(1);
    });

    it('counts route revisits as new page views', async () => {
      storeConsent(true);

      const { rerender } = render(<Analytics />);
      await waitFor(() => expect(pageViews()).toHaveLength(1));

      mockPathname = '/tools';
      rerender(<Analytics />);
      await waitFor(() => expect(pageViews()).toHaveLength(2));

      mockPathname = '/';
      rerender(<Analytics />);

      await waitFor(() => expect(pageViews()).toHaveLength(3));
      expect(pageViews().map((e) => (e[2] as { page_path: string }).page_path)).toEqual([
        '/',
        '/tools',
        '/',
      ]);
    });

    it('uses query changes for navigation dedupe without sending query values to GA', async () => {
      storeConsent(true);
      const searchParams = new URLSearchParams(
        'email=alice%40example.com&taxCode=K500&utm_source=test',
      );
      jest.spyOn(require('next/navigation'), 'useSearchParams').mockReturnValue(searchParams);

      render(<Analytics />);

      await waitFor(() => {
        expect(pageViews()).toHaveLength(1);
      });
      const pageView = pageViews()[0][2] as { page_path: string; page_location: string };
      expect(pageView.page_path).toBe('/');
      expect(pageView.page_location).toBe(`${window.location.origin}/`);
      expect(JSON.stringify(pageView)).not.toContain('alice@example.com');
      expect(JSON.stringify(pageView)).not.toContain('K500');
      expect(JSON.stringify(pageView)).not.toContain('utm_source');
    });

    it('handles undefined searchParams', async () => {
      storeConsent(true);
      jest.spyOn(require('next/navigation'), 'useSearchParams').mockReturnValue(null);

      render(<Analytics />);

      await waitFor(() => {
        expect(pageViews()).toHaveLength(1);
      });
    });

    it('does not track page views without consent', async () => {
      render(<Analytics />);

      await waitFor(() => {
        expect(win.consentMode?.isConsentGiven).toBe(false);
      });

      expect(pageViews()).toHaveLength(0);
    });
  });

  describe('Consent Transitions', () => {
    it('withdrawal pushes a denied update, sets the kill switch, and removes GA cookies', async () => {
      storeConsent(true);
      const { container } = render(<Analytics />);
      await waitFor(() => expect(win.consentMode?.isConsentGiven).toBe(true));

      writeCookie('_ga=GA1.1.111.222; path=/');
      writeCookie('_ga_TEST=GS1.1.333; path=/');
      storeConsent(false);

      document.dispatchEvent(
        new CustomEvent('cookieConsentUpdated', { detail: { analytics: false } }),
      );

      await waitFor(() => {
        expect(win.consentMode?.isConsentGiven).toBe(false);
      });

      const updates = consentUpdates();
      expect(updates[updates.length - 1][2]).toMatchObject({ analytics_storage: 'denied' });
      expect(win[`ga-disable-${GA_ID}`]).toBe(true);
      expect(document.cookie).not.toContain('_ga');
      expect(container.querySelector('#ga-script')).not.toBeInTheDocument();
    });

    it('applies an explicit denial immediately when persisted consent is stale', async () => {
      storeConsent(true);
      render(<Analytics />);
      await waitFor(() => expect(win.consentMode?.isConsentGiven).toBe(true));

      // Simulate a storage write failure: the runtime denial must still win.
      document.dispatchEvent(
        new CustomEvent('cookieConsentUpdated', { detail: { analytics: false } }),
      );

      await waitFor(() => expect(win.consentMode?.isConsentGiven).toBe(false));
      expect(win[`ga-disable-${GA_ID}`]).toBe(true);
    });

    it('re-accepting in the same tab pushes an explicit granted update and resumes page views', async () => {
      storeConsent(true);
      render(<Analytics />);
      await waitFor(() => expect(pageViews()).toHaveLength(1));

      storeConsent(false);
      document.dispatchEvent(
        new CustomEvent('cookieConsentUpdated', { detail: { analytics: false } }),
      );
      await waitFor(() => expect(win.consentMode?.isConsentGiven).toBe(false));

      storeConsent(true);
      document.dispatchEvent(
        new CustomEvent('cookieConsentUpdated', { detail: { analytics: true } }),
      );

      await waitFor(() => {
        expect(win.consentMode?.isConsentGiven).toBe(true);
      });

      const updates = consentUpdates().map((e) => e[2] as { analytics_storage: string });
      expect(updates.map((u) => u.analytics_storage)).toEqual(['granted', 'denied', 'granted']);
      expect(win[`ga-disable-${GA_ID}`]).toBe(false);

      // lastTrackedUrl was reset, so the current page is tracked again
      await waitFor(() => {
        expect(pageViews()).toHaveLength(2);
      });
    });

    it('ignores an out-of-order failure from a superseded script attempt', async () => {
      mockAutoLoadGaScript = false;
      storeConsent(true);
      const { rerender } = render(<Analytics />);
      await waitFor(() => expect(mockGaScriptCallbacks.has(1)).toBe(true));

      storeConsent(false);
      document.dispatchEvent(
        new CustomEvent('cookieConsentUpdated', { detail: { analytics: false } }),
      );
      await waitFor(() => expect(win.consentMode?.isConsentGiven).toBe(false));
      storeConsent(true);
      document.dispatchEvent(
        new CustomEvent('cookieConsentUpdated', { detail: { analytics: true } }),
      );
      await waitFor(() => expect(mockGaScriptCallbacks.has(2)).toBe(true));
      await waitFor(() => expect(pendingEventCount()).toBe(1));

      mockGaScriptCallbacks.get(2)?.onLoad?.();
      await waitFor(() => expect(pageViews()).toHaveLength(1));
      mockGaScriptCallbacks.get(1)?.onError?.();

      mockPathname = '/tools';
      rerender(<Analytics />);
      await waitFor(() => expect(pageViews()).toHaveLength(2));
    });

    it('handles consent granted from another tab via storage event', async () => {
      render(<Analytics />);
      await waitFor(() => expect(win.consentMode?.isConsentGiven).toBe(false));

      storeConsent(true);
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'cookie-consent',
          newValue: JSON.stringify({ analytics: true }),
        }),
      );

      await waitFor(() => {
        expect(win.consentMode?.isConsentGiven).toBe(true);
      });
    });

    it('does not duplicate a page view for a repeated accepted storage event', async () => {
      storeConsent(true);
      render(<Analytics />);
      await waitFor(() => expect(pageViews()).toHaveLength(1));

      storeConsent(true);
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'cookie-consent',
          newValue: JSON.stringify({ analytics: true }),
        }),
      );

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(pageViews()).toHaveLength(1);
      expect(consentUpdates()).toHaveLength(1);
    });

    it('handles consent revocation from another tab via storage event', async () => {
      storeConsent(true);
      render(<Analytics />);
      await waitFor(() => expect(win.consentMode?.isConsentGiven).toBe(true));

      window.localStorage.setItem('cookie-consent', JSON.stringify({ analytics: false }));
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'cookie-consent',
          newValue: JSON.stringify({ analytics: false }),
        }),
      );

      await waitFor(() => {
        expect(win.consentMode?.isConsentGiven).toBe(false);
      });
      expect(win[`ga-disable-${GA_ID}`]).toBe(true);
    });

    it('does not grant cross-tab consent when the timestamp is missing', async () => {
      render(<Analytics />);
      await waitFor(() => expect(win.consentMode?.isConsentGiven).toBe(false));

      window.localStorage.setItem('cookie-consent', JSON.stringify({ analytics: true }));
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'cookie-consent',
          newValue: JSON.stringify({ analytics: true }),
        }),
      );

      await waitFor(() => expect(win.consentMode?.isConsentGiven).toBe(false));
      expect(window.localStorage.getItem('cookie-consent')).toBeNull();
      expect(win.dataLayer).toBeUndefined();
    });

    it('withdraws consent when another tab removes only the timestamp', async () => {
      storeConsent(true);
      render(<Analytics />);
      await waitFor(() => expect(win.consentMode?.isConsentGiven).toBe(true));

      window.localStorage.removeItem('cookie-consent-timestamp');
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'cookie-consent-timestamp',
          newValue: null,
        }),
      );

      await waitFor(() => expect(win.consentMode?.isConsentGiven).toBe(false));
      expect(win[`ga-disable-${GA_ID}`]).toBe(true);
      expect(window.localStorage.getItem('cookie-consent')).toBeNull();
    });

    it('withdraws consent when another tab clears localStorage', async () => {
      storeConsent(true);
      render(<Analytics />);
      await waitFor(() => expect(win.consentMode?.isConsentGiven).toBe(true));
      writeCookie('_ga=GA1.1.111.222; path=/');

      window.localStorage.clear();
      window.dispatchEvent(new StorageEvent('storage', { key: null }));

      await waitFor(() => expect(win.consentMode?.isConsentGiven).toBe(false));
      expect(win[`ga-disable-${GA_ID}`]).toBe(true);
      expect(document.cookie).not.toContain('_ga=');
    });

    it('disables GA and removes its cookies when consent expires in an open tab', async () => {
      const expiresSoon = new Date(Date.now() - CONSENT_LIFETIME_MS + 80);
      window.localStorage.setItem('cookie-consent-timestamp', expiresSoon.toISOString());
      window.localStorage.setItem('cookie-consent', JSON.stringify({ analytics: true }));

      const { container } = render(<Analytics />);
      await waitFor(() => expect(win.consentMode?.isConsentGiven).toBe(true));

      writeCookie('_ga=GA1.1.111.222; path=/');

      await new Promise((resolve) => setTimeout(resolve, 120));
      await waitFor(() => expect(win.consentMode?.isConsentGiven).toBe(false));

      expect(win[`ga-disable-${GA_ID}`]).toBe(true);
      expect(document.cookie).not.toContain('_ga=');
      expect(container.querySelector('#ga-script')).not.toBeInTheDocument();
    });

    it('expires a rejection recorded in an already-open tab', async () => {
      const expiredHandler = jest.fn();
      document.addEventListener('cookieConsentExpired', expiredHandler);
      render(<Analytics />);
      await waitFor(() => expect(win.consentMode?.isConsentGiven).toBe(false));

      const expiresSoon = new Date(Date.now() - CONSENT_LIFETIME_MS + 80);
      window.localStorage.setItem('cookie-consent-timestamp', expiresSoon.toISOString());
      window.localStorage.setItem('cookie-consent', JSON.stringify({ analytics: false }));
      document.dispatchEvent(
        new CustomEvent('cookieConsentUpdated', { detail: { analytics: false } }),
      );

      await new Promise((resolve) => setTimeout(resolve, 120));
      await waitFor(() => expect(expiredHandler).toHaveBeenCalledTimes(1));

      expect(window.localStorage.getItem('cookie-consent')).toBeNull();
      expect(window.localStorage.getItem('cookie-consent-timestamp')).toBeNull();
      expect(win.dataLayer).toBeUndefined();
      document.removeEventListener('cookieConsentExpired', expiredHandler);
    });

    it('expires stored consent in an open tab while the analytics gate is closed', async () => {
      mockGetMeasurementId.mockReturnValue(null);
      const expiresSoon = new Date(Date.now() - CONSENT_LIFETIME_MS + 80);
      window.localStorage.setItem('cookie-consent-timestamp', expiresSoon.toISOString());
      window.localStorage.setItem('cookie-consent', JSON.stringify({ analytics: true }));

      render(<Analytics />);
      await waitFor(() => expect(win.consentMode?.isConsentGiven).toBe(false));

      await new Promise((resolve) => setTimeout(resolve, 120));
      await waitFor(() => expect(window.localStorage.getItem('cookie-consent')).toBeNull());

      expect(window.localStorage.getItem('cookie-consent-timestamp')).toBeNull();
      expect(win.dataLayer).toBeUndefined();
    });
  });

  describe('SEO Metrics - Scroll Depth', () => {
    it('tracks scroll depth events through the queue', async () => {
      storeConsent(true);

      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 2000,
        configurable: true,
      });
      Object.defineProperty(document.documentElement, 'clientHeight', {
        value: 800,
        configurable: true,
      });
      let scrollY = 0;
      Object.defineProperty(window, 'scrollY', {
        get: () => scrollY,
        set: (v) => {
          scrollY = v;
        },
        configurable: true,
      });

      render(<Analytics />);
      await waitFor(() => expect(pageViews()).toHaveLength(1));

      window.scrollY = 600;
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('scroll'));

      await waitFor(() => {
        const scrollEvents = dlEntries().filter((e) => e[0] === 'event' && e[1] === 'scroll_depth');
        expect(scrollEvents).toHaveLength(2);
        expect(scrollEvents.map((event) => (event[2] as { label: string }).label)).toEqual([
          '25%',
          '50%',
        ]);
      });
    });

    it('does not track scroll on pages shorter than viewport', async () => {
      storeConsent(true);

      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 500,
        configurable: true,
      });
      Object.defineProperty(document.documentElement, 'clientHeight', {
        value: 800,
        configurable: true,
      });

      render(<Analytics />);
      await waitFor(() => expect(pageViews()).toHaveLength(1));

      window.dispatchEvent(new Event('scroll'));
      await new Promise((resolve) => setTimeout(resolve, 100));

      const scrollEvents = dlEntries().filter((e) => e[0] === 'event' && e[1] === 'scroll_depth');
      expect(scrollEvents).toHaveLength(0);
    });
  });

  describe('SEO Metrics - Time on Page', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('tracks time spent when navigating away', async () => {
      storeConsent(true);

      render(<Analytics />);

      await waitFor(() => {
        expect(win.consentMode?.isConsentGiven).toBe(true);
      });

      jest.advanceTimersByTime(35000);
      window.dispatchEvent(new Event('beforeunload'));

      const timeEvents = dlEntries().filter((e) => e[0] === 'event' && e[1] === 'time_on_page');
      expect(timeEvents.length).toBeGreaterThan(0);
      expect((timeEvents[0][2] as { value: number }).value).toBeGreaterThanOrEqual(30);
    });

    it('does not track if time spent is less than 30 seconds', async () => {
      storeConsent(true);

      render(<Analytics />);

      await waitFor(() => {
        expect(win.consentMode?.isConsentGiven).toBe(true);
      });

      jest.advanceTimersByTime(15000);
      window.dispatchEvent(new Event('beforeunload'));

      const timeEvents = dlEntries().filter((e) => e[0] === 'event' && e[1] === 'time_on_page');
      expect(timeEvents).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('renders without error when nothing is stored', () => {
      expect(() => render(<Analytics />)).not.toThrow();
    });

    it('cleans up event listeners on unmount', async () => {
      storeConsent(true);

      const { unmount } = render(<Analytics />);

      await waitFor(() => {
        expect(win.consentMode?.isConsentGiven).toBe(true);
      });

      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const removeDocEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
      expect(removeDocEventListenerSpy).toHaveBeenCalledWith(
        'cookieConsentUpdated',
        expect.any(Function),
      );
    });
  });
});
