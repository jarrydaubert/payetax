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

      expect(mockGtag).toHaveBeenCalledWith('event', action, {
        event_category: 'seo_actions',
        event_label: 'blog',
        custom_parameters: expect.objectContaining({
          source: 'blog',
          target: 'https://example.com',
          page_path: expect.any(String),
          user_agent: 'Test User Agent',
          timestamp: expect.any(String),
        }),
      });
    });

    it('logs to console in development mode', () => {
      process.env.NODE_ENV = 'development';
      const action: SEOActionType = 'download';
      const data: SEOAnalyticsData = { source: 'calculator' };

      trackSEOAction(action, data);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '🔍 SEO Analytics:',
        action,
        expect.objectContaining({
          source: 'calculator',
          page_path: expect.any(String),
          user_agent: 'Test User Agent',
          timestamp: expect.any(String),
        })
      );
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
          event_label: 'unknown',
        })
      );
    });

    it('includes page path from window location', () => {
      // JSDOM sets window.location.pathname to "/" by default
      trackSEOAction('form_interaction', {});

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'form_interaction',
        expect.objectContaining({
          custom_parameters: expect.objectContaining({
            page_path: expect.any(String),
          }),
        })
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
        event_category: 'engagement',
        event_label: 'Calculate Tax',
        value: 1,
        custom_parameters: undefined,
      });
    });

    it('uses default category when not provided', () => {
      trackEvent({ action: 'test_action' });

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'test_action',
        expect.objectContaining({
          event_category: 'general',
        })
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
          custom_parameters: customData,
        })
      );
    });
  });

  describe('trackCalculatorEvent', () => {
    it('tracks calculate action', () => {
      trackCalculatorEvent('calculate', { salary: 50000 });

      expect(mockGtag).toHaveBeenCalledWith('event', 'calculator_action', {
        event_category: 'calculator',
        event_label: 'calculate',
        value: undefined,
        custom_parameters: { salary: 50000 },
      });
    });

    it('tracks reset action', () => {
      trackCalculatorEvent('reset');

      expect(mockGtag).toHaveBeenCalledWith('event', 'calculator_action', {
        event_category: 'calculator',
        event_label: 'reset',
        value: undefined,
        custom_parameters: undefined,
      });
    });

    it('tracks update action', () => {
      trackCalculatorEvent('update', { field: 'salary' });

      expect(mockGtag).toHaveBeenCalledWith('event', 'calculator_action', {
        event_category: 'calculator',
        event_label: 'update',
        value: undefined,
        custom_parameters: { field: 'salary' },
      });
    });

    it('tracks error action', () => {
      trackCalculatorEvent('error', { message: 'Invalid input' });

      expect(mockGtag).toHaveBeenCalledWith('event', 'calculator_action', {
        event_category: 'calculator',
        event_label: 'error',
        value: undefined,
        custom_parameters: { message: 'Invalid input' },
      });
    });
  });

  describe('trackCalculatorUsage', () => {
    it('tracks calculator usage with salary range', () => {
      trackCalculatorUsage('paye', '50000-75000');

      expect(mockGtag).toHaveBeenCalledWith('event', 'calculator_usage', {
        event_category: 'engagement',
        event_label: 'paye',
        value: undefined,
        custom_parameters: expect.objectContaining({
          salary_range: '50000-75000',
          timestamp: expect.any(String),
        }),
      });
    });

    it('tracks calculator usage without salary range', () => {
      trackCalculatorUsage('self_employed');

      expect(mockGtag).toHaveBeenCalledWith('event', 'calculator_usage', {
        event_category: 'engagement',
        event_label: 'self_employed',
        value: undefined,
        custom_parameters: expect.objectContaining({
          salary_range: undefined,
          timestamp: expect.any(String),
        }),
      });
    });
  });

  describe('trackPageView', () => {
    it('tracks page view with title', () => {
      process.env.NEXT_PUBLIC_GA_ID = 'GA-TEST-123';
      trackPageView('/calculator', 'Tax Calculator');

      expect(mockGtag).toHaveBeenCalledWith('config', 'GA-TEST-123', {
        page_path: '/calculator',
        page_title: 'Tax Calculator',
      });
    });

    it('tracks page view without title', () => {
      process.env.NEXT_PUBLIC_GA_ID = 'GA-TEST-123';
      trackPageView('/about');

      expect(mockGtag).toHaveBeenCalledWith('config', 'GA-TEST-123', {
        page_path: '/about',
        page_title: undefined,
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

      expect(mockGtag).toHaveBeenCalledWith('config', '', expect.any(Object));
      process.env.NEXT_PUBLIC_GA_ID = originalGaId;
    });
  });

  describe('trackFormInteraction', () => {
    it('tracks form submit', () => {
      trackFormInteraction('contact_form', 'submit', 'email');

      expect(mockGtag).toHaveBeenCalledWith('event', 'form_interaction', {
        event_category: 'seo_actions',
        event_label: 'contact_form',
        custom_parameters: expect.objectContaining({
          source: 'contact_form',
          action_type: 'submit',
          target: 'email',
        }),
      });
    });

    it('tracks form focus', () => {
      trackFormInteraction('calculator_form', 'focus', 'salary');

      expect(mockGtag).toHaveBeenCalledWith('event', 'form_interaction', {
        event_category: 'seo_actions',
        event_label: 'calculator_form',
        custom_parameters: expect.objectContaining({
          source: 'calculator_form',
          action_type: 'focus',
          target: 'salary',
        }),
      });
    });

    it('tracks form interaction without field name', () => {
      trackFormInteraction('feedback_form', 'open');

      expect(mockGtag).toHaveBeenCalledWith('event', 'form_interaction', {
        event_category: 'seo_actions',
        event_label: 'feedback_form',
        custom_parameters: expect.objectContaining({
          source: 'feedback_form',
          action_type: 'open',
          target: undefined,
        }),
      });
    });
  });

  describe('trackPerformanceMetric', () => {
    it('tracks performance metric with default unit', () => {
      trackPerformanceMetric('page_load', 1250);

      expect(mockGtag).toHaveBeenCalledWith('event', 'performance_metric', {
        event_category: 'performance',
        event_label: 'page_load',
        value: 1250,
        custom_parameters: expect.objectContaining({
          unit: 'ms',
          timestamp: expect.any(String),
        }),
      });
    });

    it('tracks performance metric with custom unit', () => {
      trackPerformanceMetric('bundle_size', 2.5, 'MB');

      expect(mockGtag).toHaveBeenCalledWith('event', 'performance_metric', {
        event_category: 'performance',
        event_label: 'bundle_size',
        value: 2.5,
        custom_parameters: expect.objectContaining({
          unit: 'MB',
          timestamp: expect.any(String),
        }),
      });
    });

    it('tracks zero value metrics', () => {
      trackPerformanceMetric('cache_hits', 0);

      expect(mockGtag).toHaveBeenCalledWith('event', 'performance_metric', {
        event_category: 'performance',
        event_label: 'cache_hits',
        value: 0,
        custom_parameters: expect.objectContaining({
          unit: 'ms',
        }),
      });
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

      expect(mockGtag).toHaveBeenCalledWith('event', 'performance_metric', {
        event_category: 'performance',
        event_label: 'page_load_time',
        value: 2000,
        custom_parameters: expect.objectContaining({
          unit: 'ms',
        }),
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'performance_metric', {
        event_category: 'performance',
        event_label: 'dom_content_loaded',
        value: 1500,
        custom_parameters: expect.objectContaining({
          unit: 'ms',
        }),
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'performance_metric', {
        event_category: 'performance',
        event_label: 'time_to_interactive',
        value: 1000,
        custom_parameters: expect.objectContaining({
          unit: 'ms',
        }),
      });
    });

    it('tracks First Contentful Paint', () => {
      (performance.getEntriesByType as jest.Mock).mockReturnValue([]);
      (performance.getEntriesByName as jest.Mock).mockReturnValue([{ startTime: 800 }]);

      trackCoreWebVitals();

      expect(mockGtag).toHaveBeenCalledWith('event', 'performance_metric', {
        event_category: 'performance',
        event_label: 'first_contentful_paint',
        value: 800,
        custom_parameters: expect.objectContaining({
          unit: 'ms',
        }),
      });
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
        expect.any(Error)
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
