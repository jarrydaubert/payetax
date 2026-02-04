// src/lib/__tests__/analytics.test.ts
import {
  type AnalyticsEvent,
  type SEOActionType,
  type SEOAnalyticsData,
  trackCalculatorEvent,
  trackCalculatorUsage,
  trackCoreWebVitals,
  trackEvent,
  trackFormInteraction,
  trackPageView,
  trackPerformanceMetric,
  trackSEOAction,
} from '../analytics';

// Mock cookieUtils to simulate accepted consent
jest.mock('@/lib/cookieUtils', () => ({
  areCookiesAccepted: jest.fn(() => true),
}));

describe('analytics', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let mockGtag: jest.Mock;

  beforeEach(() => {
    // Mock console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Mock gtag
    mockGtag = jest.fn();
    Object.defineProperty(window, 'gtag', {
      value: mockGtag,
      writable: true,
      configurable: true,
    });

    // Mock navigator
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Test User Agent',
      writable: true,
      configurable: true,
    });

    // Set NODE_ENV to test
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    (window as Window & { gtag?: unknown }).gtag = undefined;
    jest.clearAllMocks();
  });

  describe('trackSEOAction', () => {
    it('tracks SEO action with enhanced data', () => {
      const action: SEOActionType = 'external_link';
      const data: SEOAnalyticsData = {
        source: 'blog',
        target: 'https://example.com',
      };

      trackSEOAction(action, data);

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        action,
        expect.objectContaining({
          category: 'seo_actions',
          label: 'blog',
          source: 'blog',
          target: 'https://example.com',
          page_path: '/',
        }),
      );
    });

    it('logs to console in development mode', () => {
      process.env.NODE_ENV = 'development';
      const action: SEOActionType = 'download';
      const data: SEOAnalyticsData = { source: 'calculator' };

      trackSEOAction(action, data);

      expect(consoleLogSpy).toHaveBeenCalledWith('🔍 SEO Analytics:', action, {
        source: 'calculator',
      });
    });

    it('does not log to console in production mode', () => {
      process.env.NODE_ENV = 'production';
      const action: SEOActionType = 'share';

      trackSEOAction(action, {});

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('handles missing gtag gracefully', () => {
      (window as Window & { gtag?: unknown }).gtag = undefined;
      const action: SEOActionType = 'print';

      expect(() => trackSEOAction(action, {})).not.toThrow();
    });

    it('handles errors gracefully', () => {
      mockGtag.mockImplementation(() => {
        throw new Error('Analytics error');
      });

      expect(() => trackSEOAction('scroll_to_top', {})).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Analytics tracking error:', expect.any(Error));
    });

    it('uses unknown as default label when source is not provided', () => {
      trackSEOAction('navigation', {});

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'navigation',
        expect.objectContaining({
          label: 'unknown',
        }),
      );
    });

    it('includes page path from window location', () => {
      // JSDOM sets window.location.pathname to "/" by default
      trackSEOAction('form_interaction', {});

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'form_interaction',
        expect.objectContaining({
          page_path: '/',
        }),
      );
    });
  });

  describe('trackEvent', () => {
    it('tracks general analytics event', () => {
      const event: AnalyticsEvent = {
        action: 'button_click',
        category: 'engagement',
        label: 'Calculate Tax',
        value: 1,
      };

      trackEvent(event);

      expect(mockGtag).toHaveBeenCalledWith('event', 'button_click', {
        category: 'engagement',
        label: 'Calculate Tax',
        value: 1,
      });
    });

    it('uses default category when not provided', () => {
      trackEvent({ action: 'test_action' });

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'test_action',
        expect.objectContaining({
          category: 'general',
        }),
      );
    });

    it('logs to console in development mode', () => {
      process.env.NODE_ENV = 'development';
      const event: AnalyticsEvent = { action: 'test' };

      trackEvent(event);

      expect(consoleLogSpy).toHaveBeenCalledWith('📊 Analytics Event:', event);
    });

    it('handles missing gtag gracefully', () => {
      (window as Window & { gtag?: unknown }).gtag = undefined;

      expect(() => trackEvent({ action: 'test' })).not.toThrow();
    });

    it('handles errors gracefully', () => {
      mockGtag.mockImplementation(() => {
        throw new Error('Tracking error');
      });

      expect(() => trackEvent({ action: 'test' })).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Analytics tracking error:', expect.any(Error));
    });

    it('includes custom data in event', () => {
      const customData = { userId: '123', sessionId: 'abc' };
      trackEvent({
        action: 'custom_event',
        custom_data: customData,
      });

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'custom_event',
        expect.objectContaining({
          ...customData,
        }),
      );
    });
  });

  describe('trackCalculatorEvent', () => {
    it('tracks calculate action', () => {
      trackCalculatorEvent('calculate', { salary: 50000 });

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'calculator_action',
        expect.objectContaining({
          category: 'calculator',
          label: 'calculate',
          salary: 50000,
        }),
      );
    });

    it('tracks reset action', () => {
      trackCalculatorEvent('reset');

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'calculator_action',
        expect.objectContaining({
          category: 'calculator',
          label: 'reset',
        }),
      );
    });

    it('tracks update action', () => {
      trackCalculatorEvent('update', { field: 'salary' });

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'calculator_action',
        expect.objectContaining({
          category: 'calculator',
          label: 'update',
          field: 'salary',
        }),
      );
    });

    it('tracks error action', () => {
      trackCalculatorEvent('error', { message: 'Invalid input' });

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'calculator_action',
        expect.objectContaining({
          category: 'calculator',
          label: 'error',
          message: 'Invalid input',
        }),
      );
    });
  });

  describe('trackCalculatorUsage', () => {
    it('tracks calculator usage with salary range', () => {
      trackCalculatorUsage('paye', '50000-75000');

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'calculator_usage',
        expect.objectContaining({
          category: 'engagement',
          label: 'paye',
          salary_range: '50000-75000',
          timestamp: expect.any(String),
        }),
      );
    });

    it('tracks calculator usage without salary range', () => {
      trackCalculatorUsage('self_employed');

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'calculator_usage',
        expect.objectContaining({
          category: 'engagement',
          label: 'self_employed',
          salary_range: undefined,
          timestamp: expect.any(String),
        }),
      );
    });
  });

  describe('trackPageView', () => {
    it('tracks page view with title', () => {
      process.env.NEXT_PUBLIC_GA_ID = 'GA-TEST-123';
      trackPageView('/calculator', 'Tax Calculator');

      expect(mockGtag).toHaveBeenCalledWith('config', 'GA-TEST-123', {
        page_path: '/calculator',
        page_title: 'Tax Calculator',
        send_page_view: true,
      });
    });

    it('tracks page view without title', () => {
      process.env.NEXT_PUBLIC_GA_ID = 'GA-TEST-123';
      trackPageView('/about');

      expect(mockGtag).toHaveBeenCalledWith('config', 'GA-TEST-123', {
        page_path: '/about',
        page_title: undefined,
        send_page_view: true,
      });
    });

    it('logs to console in development mode', () => {
      process.env.NODE_ENV = 'development';
      trackPageView('/test', 'Test Page');

      expect(consoleLogSpy).toHaveBeenCalledWith('📄 Page View:', '/test', 'Test Page');
    });

    it('handles missing gtag gracefully', () => {
      (window as Window & { gtag?: unknown }).gtag = undefined;

      expect(() => trackPageView('/test')).not.toThrow();
    });

    it('handles errors gracefully', () => {
      mockGtag.mockImplementation(() => {
        throw new Error('Page view error');
      });

      expect(() => trackPageView('/test')).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Page view tracking error:', expect.any(Error));
    });

    it('uses empty string as GA_ID when not set', () => {
      const originalGaId = process.env.NEXT_PUBLIC_GA_ID;
      process.env.NEXT_PUBLIC_GA_ID = '';
      trackPageView('/test');

      expect(mockGtag).not.toHaveBeenCalled();
      process.env.NEXT_PUBLIC_GA_ID = originalGaId;
    });
  });

  describe('trackFormInteraction', () => {
    it('tracks form submit', () => {
      trackFormInteraction('contact_form', 'submit', 'email');

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'form_interaction',
        expect.objectContaining({
          category: 'seo_actions',
          label: 'contact_form',
          source: 'contact_form',
          action_type: 'submit',
          target: 'email',
          page_path: '/',
        }),
      );
    });

    it('tracks form focus', () => {
      trackFormInteraction('calculator_form', 'focus', 'salary');

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'form_interaction',
        expect.objectContaining({
          category: 'seo_actions',
          label: 'calculator_form',
          source: 'calculator_form',
          action_type: 'focus',
          target: 'salary',
          page_path: '/',
        }),
      );
    });

    it('tracks form interaction without field name', () => {
      trackFormInteraction('feedback_form', 'open');

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'form_interaction',
        expect.objectContaining({
          category: 'seo_actions',
          label: 'feedback_form',
          source: 'feedback_form',
          action_type: 'open',
          target: undefined,
          page_path: '/',
        }),
      );
    });
  });

  describe('trackPerformanceMetric', () => {
    it('tracks performance metric with default unit', () => {
      trackPerformanceMetric('page_load', 1250);

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'performance_metric',
        expect.objectContaining({
          category: 'performance',
          label: 'page_load',
          value: 1250,
          unit: 'ms',
          timestamp: expect.any(String),
        }),
      );
    });

    it('tracks performance metric with custom unit', () => {
      trackPerformanceMetric('bundle_size', 2.5, 'MB');

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'performance_metric',
        expect.objectContaining({
          category: 'performance',
          label: 'bundle_size',
          value: 2.5,
          unit: 'MB',
          timestamp: expect.any(String),
        }),
      );
    });

    it('tracks zero value metrics', () => {
      trackPerformanceMetric('cache_hits', 0);

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'performance_metric',
        expect.objectContaining({
          category: 'performance',
          label: 'cache_hits',
          value: 0,
          unit: 'ms',
        }),
      );
    });
  });

  describe('trackCoreWebVitals', () => {
    beforeEach(() => {
      // Mock performance API
      const mockPerformance = {
        getEntriesByType: jest.fn(),
        getEntriesByName: jest.fn(),
      };
      Object.defineProperty(global, 'performance', {
        value: mockPerformance,
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      (global as { performance?: unknown }).performance = undefined;
      (global as { PerformanceObserver?: unknown }).PerformanceObserver = undefined;
    });

    it('tracks navigation timing metrics', () => {
      const mockNavigation = {
        fetchStart: 0,
        loadEventEnd: 2000,
        domContentLoadedEventEnd: 1500,
        domInteractive: 1000,
      };

      (performance.getEntriesByType as jest.Mock).mockReturnValue([mockNavigation]);
      (performance.getEntriesByName as jest.Mock).mockReturnValue([]);

      trackCoreWebVitals();

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'performance_metric',
        expect.objectContaining({
          category: 'performance',
          label: 'page_load_time',
          value: 2000,
          unit: 'ms',
        }),
      );

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'performance_metric',
        expect.objectContaining({
          category: 'performance',
          label: 'dom_content_loaded',
          value: 1500,
          unit: 'ms',
        }),
      );

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'performance_metric',
        expect.objectContaining({
          category: 'performance',
          label: 'time_to_interactive',
          value: 1000,
          unit: 'ms',
        }),
      );
    });

    it('tracks First Contentful Paint', () => {
      (performance.getEntriesByType as jest.Mock).mockReturnValue([]);
      (performance.getEntriesByName as jest.Mock).mockReturnValue([{ startTime: 800 }]);

      trackCoreWebVitals();

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'performance_metric',
        expect.objectContaining({
          category: 'performance',
          label: 'first_contentful_paint',
          value: 800,
          unit: 'ms',
        }),
      );
    });

    it('does not track when window is undefined', () => {
      const originalWindow = global.window;
      (global as { window?: unknown }).window = undefined;

      trackCoreWebVitals();

      expect(mockGtag).not.toHaveBeenCalled();

      (global as { window?: Window }).window = originalWindow;
    });

    it('does not track when performance API is not available', () => {
      (global as { performance?: unknown }).performance = undefined;

      trackCoreWebVitals();

      expect(mockGtag).not.toHaveBeenCalled();
    });

    it('handles missing navigation entry gracefully', () => {
      (performance.getEntriesByType as jest.Mock).mockReturnValue([]);
      (performance.getEntriesByName as jest.Mock).mockReturnValue([]);

      expect(() => trackCoreWebVitals()).not.toThrow();
    });

    it('ignores zero or negative timing values', () => {
      const mockNavigation = {
        fetchStart: 0,
        loadEventEnd: 0, // Zero value
        domContentLoadedEventEnd: -100, // Negative value
        domInteractive: 0,
      };

      (performance.getEntriesByType as jest.Mock).mockReturnValue([mockNavigation]);
      (performance.getEntriesByName as jest.Mock).mockReturnValue([]);

      trackCoreWebVitals();

      // Should not call trackPerformanceMetric for zero/negative values
      expect(mockGtag).not.toHaveBeenCalled();
    });

    it('handles errors gracefully', () => {
      (performance.getEntriesByType as jest.Mock).mockImplementation(() => {
        throw new Error('Performance API error');
      });

      expect(() => trackCoreWebVitals()).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Performance metrics tracking error:',
        expect.any(Error),
      );
    });

    it('tracks LCP when PerformanceObserver is available', () => {
      (performance.getEntriesByType as jest.Mock).mockReturnValue([]);
      (performance.getEntriesByName as jest.Mock).mockReturnValue([]);

      // Mock PerformanceObserver
      const observeFn = jest.fn();
      const disconnectFn = jest.fn();
      global.PerformanceObserver = jest.fn().mockImplementation((callback) => {
        // Simulate LCP entry
        setTimeout(() => {
          callback({
            getEntries: () => [{ renderTime: 1200 }],
          });
        }, 0);
        return {
          observe: observeFn,
          disconnect: disconnectFn,
        };
      }) as unknown as typeof PerformanceObserver;

      trackCoreWebVitals();

      // Wait for async callback
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(observeFn).toHaveBeenCalledWith({
            type: 'largest-contentful-paint',
            buffered: true,
          });
          resolve(undefined);
        }, 10);
      });
    });
  });
});
