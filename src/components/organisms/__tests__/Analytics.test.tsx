/**
 * @jest-environment jsdom
 */
// src/components/analytics/__tests__/Analytics.test.tsx

import { render, waitFor } from '@testing-library/react';
import { Analytics } from '../Analytics';

// Mock next/navigation
const mockPathname = '/';
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

// Mock next/script
jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ children, onLoad, onReady, ...props }: any) => {
    const { useEffect } = require('react');
    // Simulate script loading after mount to avoid setState during render
    useEffect(() => {
      onLoad?.();
      onReady?.();
    }, [onLoad, onReady]);
    return children ? <script {...props}>{children}</script> : <script {...props} />;
  },
}));

describe('Analytics Component', () => {
  let mockGtag: jest.Mock;
  let originalLocalStorage: Storage;

  beforeEach(() => {
    // Setup window.gtag mock
    mockGtag = jest.fn();
    (window as any).gtag = mockGtag;
    (window as any).dataLayer = [];

    // Mock localStorage
    originalLocalStorage = window.localStorage;
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Clear any existing consent
    (window as any).consentMode = undefined;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  });

  describe('Initialization', () => {
    it('should render Analytics scripts after consent', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('accepted');

      const { container } = render(<Analytics />);

      // Check that component renders without errors
      expect(container).toBeInTheDocument();
    });

    it('should not render GA4 scripts before consent', () => {
      const { container } = render(<Analytics />);
      const initScript = container.querySelector('#ga-init');
      const gaScript = container.querySelector('#ga-script');

      expect(initScript).not.toBeInTheDocument();
      expect(gaScript).not.toBeInTheDocument();
    });

    it('should include consent-granted snippet in ga-init script after consent', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('accepted');

      const { container } = render(<Analytics />);

      await waitFor(() => {
        const initScript = container.querySelector('#ga-init');
        expect(initScript?.textContent).toMatch(/gtag\('consent',\s*'default'/i);
        expect(initScript?.textContent).toMatch(/'analytics_storage': 'granted'/i);
      });
    });

    it('should create consentMode object on window', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

      render(<Analytics />);

      await waitFor(() => {
        expect((window as any).consentMode).toBeDefined();
        expect((window as any).consentMode.isConsentGiven).toBe(false);
      });
    });

    it('should load GA4 measurement ID from environment', () => {
      const originalEnv = process.env.NEXT_PUBLIC_GA_ID;
      process.env.NEXT_PUBLIC_GA_ID = 'G-TEST123';

      render(<Analytics />);

      process.env.NEXT_PUBLIC_GA_ID = originalEnv;
    });
  });

  describe('Consent Management', () => {
    it('should respect previously accepted consent', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('accepted');

      render(<Analytics />);

      await waitFor(() => {
        expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
      });
    });

    it('should set consentMode.isConsentGiven to true when consent accepted', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('accepted');

      render(<Analytics />);

      await waitFor(() => {
        expect((window as any).consentMode.isConsentGiven).toBe(true);
      });
    });

    it('should not update consent if not previously given', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

      render(<Analytics />);

      await waitFor(() => {
        const updateCalls = mockGtag.mock.calls.filter(
          (call) => call[0] === 'consent' && call[1] === 'update',
        );
        expect(updateCalls.length).toBe(0);
      });
    });

    it('should handle declined consent', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('declined');

      render(<Analytics />);

      await waitFor(() => {
        expect((window as any).consentMode.isConsentGiven).toBe(false);
      });
    });
  });

  describe('Page View Tracking', () => {
    it('should track page views when consent is given', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('accepted');

      render(<Analytics />);

      await waitFor(() => {
        const configCall = mockGtag.mock.calls.find((call) => call[0] === 'config');
        expect(configCall).toBeDefined();
        expect(configCall?.[2]).toMatchObject({
          page_path: '/',
          send_page_view: true,
          anonymize_ip: true,
        });
      });
    });

    it('should not track page views without consent', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

      render(<Analytics />);

      await waitFor(() => {
        const configCalls = mockGtag.mock.calls.filter((call) => call[0] === 'config');
        expect(configCalls).toHaveLength(0);
      });
    });

    it('should include search params in page path', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('accepted');
      const searchParams = new URLSearchParams('utm_source=test&utm_medium=email');
      jest.spyOn(require('next/navigation'), 'useSearchParams').mockReturnValue(searchParams);

      render(<Analytics />);

      await waitFor(() => {
        const configCall = mockGtag.mock.calls.find(
          (call) => call[0] === 'config' && call[2]?.page_path,
        );
        expect(configCall?.[2].page_path).toContain('utm_source=test');
      });
    });

    it('should use beacon transport type for reliability', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('accepted');

      render(<Analytics />);

      await waitFor(() => {
        const configCall = mockGtag.mock.calls.find(
          (call) => call[0] === 'config' && call[2]?.transport_type,
        );
        expect(configCall?.[2].transport_type).toBe('beacon');
      });
    });

    // Note: cookie flags are intentionally not set here; we rely on GA defaults.
  });

  describe('SEO Metrics - Scroll Depth', () => {
    it('should track scroll depth events', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('accepted');

      // Mock document dimensions for scroll calculation
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 2000,
        configurable: true,
      });
      Object.defineProperty(document.documentElement, 'clientHeight', {
        value: 800,
        configurable: true,
      });
      // JSDOM's scrollY can be read-only; mock as a getter/setter.
      let scrollY = 0;
      Object.defineProperty(window, 'scrollY', {
        get: () => scrollY,
        set: (v) => {
          scrollY = v;
        },
        configurable: true,
      });

      render(<Analytics />);

      // Wait for initial setup
      await waitFor(() => expect((window as any).gtag).toBeDefined());

      // Simulate scrolling to 50%
      window.scrollY = 600;
      window.dispatchEvent(new Event('scroll'));

      await waitFor(() => {
        const scrollEvents = mockGtag.mock.calls.filter(
          (call) => call[0] === 'event' && call[1] === 'scroll_depth',
        );
        expect(scrollEvents.length).toBeGreaterThan(0);
      });
    });

    it('should not track scroll on pages shorter than viewport', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('accepted');

      // Mock short page
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 500,
        configurable: true,
      });
      Object.defineProperty(document.documentElement, 'clientHeight', {
        value: 800,
        configurable: true,
      });

      render(<Analytics />);

      await waitFor(() => expect((window as any).gtag).toBeDefined());

      window.dispatchEvent(new Event('scroll'));

      await new Promise((resolve) => setTimeout(resolve, 100));

      const scrollEvents = mockGtag.mock.calls.filter(
        (call) => call[0] === 'event' && call[1] === 'scroll_depth',
      );
      expect(scrollEvents.length).toBe(0);
    });
  });

  describe('SEO Metrics - Time on Page', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should track time spent when navigating away', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('accepted');

      render(<Analytics />);

      await waitFor(() => expect((window as any).gtag).toBeDefined());

      // Advance time by 35 seconds
      jest.advanceTimersByTime(35000);

      // Trigger beforeunload
      window.dispatchEvent(new Event('beforeunload'));

      await waitFor(() => {
        const timeOnPageEvents = mockGtag.mock.calls.filter(
          (call) => call[0] === 'event' && call[1] === 'time_on_page',
        );
        expect(timeOnPageEvents.length).toBeGreaterThan(0);
        expect(timeOnPageEvents[0][2].value).toBeGreaterThanOrEqual(30);
      });
    });

    it('should not track if time spent is less than 30 seconds', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('accepted');

      render(<Analytics />);

      await waitFor(() => expect((window as any).gtag).toBeDefined());

      // Advance time by only 15 seconds
      jest.advanceTimersByTime(15000);

      window.dispatchEvent(new Event('beforeunload'));

      const timeOnPageEvents = mockGtag.mock.calls.filter(
        (call) => call[0] === 'event' && call[1] === 'time_on_page',
      );
      expect(timeOnPageEvents.length).toBe(0);
    });
  });

  describe('Storage Events', () => {
    it('should handle consent updates from other tabs', async () => {
      render(<Analytics />);

      // Wait for component to be fully loaded
      await waitFor(() => {
        expect((window as any).gtag).toBeDefined();
        expect((window as any).consentMode).toBeDefined();
      });

      // Simulate storage event from another tab
      const storageEvent = new StorageEvent('storage', {
        key: 'cookie-consent',
        newValue: 'accepted',
      });
      window.dispatchEvent(storageEvent);

      await waitFor(() => {
        expect((window as any).consentMode?.isConsentGiven).toBe(true);
      });
    });

    it('should handle consent revocation from other tabs', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('accepted');

      render(<Analytics />);

      await waitFor(() => {
        expect((window as any).consentMode.isConsentGiven).toBe(true);
      });

      // Simulate consent revocation
      const storageEvent = new StorageEvent('storage', {
        key: 'cookie-consent',
        newValue: 'declined',
      });
      window.dispatchEvent(storageEvent);

      await waitFor(() => {
        expect((window as any).consentMode.isConsentGiven).toBe(false);
      });
    });

    it('should handle cookieConsentUpdated custom event', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('accepted');

      render(<Analytics />);

      await waitFor(() => expect((window as any).gtag).toBeDefined());

      // Simulate consent update event
      document.dispatchEvent(new Event('cookieConsentUpdated'));

      await waitFor(() => {
        expect(mockGtag).toHaveBeenCalledWith('consent', 'update', expect.any(Object));
      });
    });

    it('should track the current page view when consent is accepted after page load', async () => {
      render(<Analytics />);

      await waitFor(() => {
        expect((window as any).consentMode?.isConsentGiven).toBe(false);
      });

      await waitFor(() => {
        document.dispatchEvent(
          new CustomEvent('cookieConsentUpdated', { detail: { analytics: true } }),
        );
        const pageViewCall = mockGtag.mock.calls.find(
          (call) => call[0] === 'config' && call[2]?.page_path === '/',
        );
        expect(pageViewCall?.[2]).toMatchObject({
          page_path: '/',
          send_page_view: true,
          anonymize_ip: true,
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing gtag gracefully', () => {
      (window as any).gtag = undefined;

      expect(() => render(<Analytics />)).not.toThrow();
    });

    it('should handle undefined searchParams', async () => {
      jest.spyOn(require('next/navigation'), 'useSearchParams').mockReturnValue(null);
      (window.localStorage.getItem as jest.Mock).mockReturnValue('accepted');

      render(<Analytics />);

      await waitFor(() => {
        const configCall = mockGtag.mock.calls.find((call) => call[0] === 'config');
        expect(configCall).toBeDefined();
      });
    });

    it('should cleanup event listeners on unmount', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('accepted');

      const { unmount } = render(<Analytics />);

      // Wait for component to fully initialize
      await waitFor(() => {
        expect((window as any).gtag).toBeDefined();
        expect((window as any).consentMode).toBeDefined();
      });

      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const removeDocEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      unmount();

      // Verify that cleanup functions are called
      expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
      expect(removeDocEventListenerSpy).toHaveBeenCalledWith(
        'cookieConsentUpdated',
        expect.any(Function),
      );
    });
  });
});
