// src/lib/__tests__/analytics.test.ts

import {
  type AnalyticsEvent,
  type SEOAnalyticsData,
  trackCalculatorEvent,
  trackCalculatorUsage,
  trackEvent,
  trackFormInteraction,
  trackPageView,
  trackPerformanceMetric,
  trackSEOAction,
} from '../analytics';

// Mock window.gtag
const mockGtag = jest.fn();
Object.defineProperty(window, 'gtag', {
  value: mockGtag,
  writable: true,
});

// Mock environment variables
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_GA_ID: '',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
};

// Mock window.location properly for JSDOM
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/test-page',
    href: 'https://example.com/test-page',
    origin: 'https://example.com',
  },
  writable: true,
});

// Mock navigator.userAgent
Object.defineProperty(navigator, 'userAgent', {
  value: 'Test User Agent',
  writable: true,
});

// Mock process.env
const originalNodeEnv = process.env.NODE_ENV;

describe('Analytics Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.log.mockClear();
    consoleSpy.warn.mockClear();
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('trackSEOAction', () => {
    test('should track SEO action with enhanced data', () => {
      const data: SEOAnalyticsData = {
        source: 'header',
        target: 'external-link',
      };

      trackSEOAction('external_link', data);

      expect(mockGtag).toHaveBeenCalledWith('event', 'external_link', {
        event_category: 'seo_actions',
        event_label: 'header',
        custom_parameters: expect.objectContaining({
          source: 'header',
          target: 'external-link',
          page_path: '/test-page',
          user_agent: 'Test User Agent',
          timestamp: expect.any(String),
        }),
      });
    });

    test('should log to console in development mode', () => {
      process.env.NODE_ENV = 'development';

      trackSEOAction('download', { source: 'button' });

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '🔍 SEO Analytics:',
        'download',
        expect.objectContaining({
          source: 'button',
          page_path: '/test-page',
        })
      );
    });

    test('should handle missing gtag gracefully', () => {
      // Temporarily remove gtag
      const originalGtag = window.gtag;
      (window as any).gtag = undefined;

      expect(() => {
        trackSEOAction('navigation', { source: 'menu' });
      }).not.toThrow();

      // Restore gtag
      window.gtag = originalGtag;
    });

    test('should handle errors gracefully', () => {
      mockGtag.mockImplementationOnce(() => {
        throw new Error('Tracking error');
      });

      trackSEOAction('print', {});

      expect(consoleSpy.warn).toHaveBeenCalledWith('Analytics tracking error:', expect.any(Error));
    });

    test('should work with minimal data', () => {
      trackSEOAction('share');

      expect(mockGtag).toHaveBeenCalledWith('event', 'share', {
        event_category: 'seo_actions',
        event_label: 'unknown',
        custom_parameters: expect.objectContaining({
          page_path: '/test-page',
          timestamp: expect.any(String),
        }),
      });
    });
  });

  describe('trackEvent', () => {
    test('should track general analytics event', () => {
      const event: AnalyticsEvent = {
        action: 'button_click',
        category: 'engagement',
        label: 'cta_button',
        value: 1,
        custom_data: { button_id: 'main-cta' },
      };

      trackEvent(event);

      expect(mockGtag).toHaveBeenCalledWith('event', 'button_click', {
        event_category: 'engagement',
        event_label: 'cta_button',
        value: 1,
        custom_parameters: { button_id: 'main-cta' },
      });
    });

    test('should use default category when not provided', () => {
      const event: AnalyticsEvent = {
        action: 'test_action',
      };

      trackEvent(event);

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_action', {
        event_category: 'general',
        event_label: undefined,
        value: undefined,
        custom_parameters: undefined,
      });
    });

    test('should log to console in development mode', () => {
      process.env.NODE_ENV = 'development';

      const event: AnalyticsEvent = { action: 'test' };
      trackEvent(event);

      expect(consoleSpy.log).toHaveBeenCalledWith('📊 Analytics Event:', event);
    });

    test('should handle tracking errors gracefully', () => {
      mockGtag.mockImplementationOnce(() => {
        throw new Error('Tracking failed');
      });

      trackEvent({ action: 'error_test' });

      expect(consoleSpy.warn).toHaveBeenCalledWith('Analytics tracking error:', expect.any(Error));
    });
  });

  describe('trackCalculatorEvent', () => {
    test('should track calculator-specific events', () => {
      const data = { salary: 50000, taxYear: '2024-2025' };

      trackCalculatorEvent('calculate', data);

      expect(mockGtag).toHaveBeenCalledWith('event', 'calculator_action', {
        event_category: 'calculator',
        event_label: 'calculate',
        value: undefined,
        custom_parameters: data,
      });
    });

    test('should handle all calculator action types', () => {
      const actions: Array<'calculate' | 'reset' | 'update' | 'error'> = [
        'calculate',
        'reset',
        'update',
        'error',
      ];

      actions.forEach((action) => {
        trackCalculatorEvent(action);
        expect(mockGtag).toHaveBeenCalledWith('event', 'calculator_action', {
          event_category: 'calculator',
          event_label: action,
          value: undefined,
          custom_parameters: undefined,
        });
      });

      expect(mockGtag).toHaveBeenCalledTimes(4);
    });
  });

  describe('trackCalculatorUsage', () => {
    test('should track calculator usage with salary range', () => {
      trackCalculatorUsage('paye_calculation', '40k-60k');

      expect(mockGtag).toHaveBeenCalledWith('event', 'calculator_usage', {
        event_category: 'engagement',
        event_label: 'paye_calculation',
        value: undefined,
        custom_parameters: {
          salary_range: '40k-60k',
          timestamp: expect.any(String),
        },
      });
    });

    test('should track calculator usage without salary range', () => {
      trackCalculatorUsage('basic_calculation');

      expect(mockGtag).toHaveBeenCalledWith('event', 'calculator_usage', {
        event_category: 'engagement',
        event_label: 'basic_calculation',
        value: undefined,
        custom_parameters: {
          salary_range: undefined,
          timestamp: expect.any(String),
        },
      });
    });
  });

  describe('trackPageView', () => {
    test('should track page views with title', () => {
      trackPageView('/calculator', 'Tax Calculator');

      expect(mockGtag).toHaveBeenCalledWith('config', '', {
        page_path: '/calculator',
        page_title: 'Tax Calculator',
      });
    });

    test('should track page views without title', () => {
      trackPageView('/about');

      expect(mockGtag).toHaveBeenCalledWith('config', '', {
        page_path: '/about',
        page_title: undefined,
      });
    });

    test('should use GA_ID from environment', () => {
      process.env.NEXT_PUBLIC_GA_ID = 'GA-12345';

      trackPageView('/test');

      expect(mockGtag).toHaveBeenCalledWith('config', 'GA-12345', {
        page_path: '/test',
        page_title: undefined,
      });

      process.env.NEXT_PUBLIC_GA_ID = undefined;
    });

    test('should log in development mode', () => {
      process.env.NODE_ENV = 'development';

      trackPageView('/dev-page', 'Dev Page');

      expect(consoleSpy.log).toHaveBeenCalledWith('📄 Page View:', '/dev-page', 'Dev Page');
    });

    test('should handle errors gracefully', () => {
      mockGtag.mockImplementationOnce(() => {
        throw new Error('Page view error');
      });

      trackPageView('/error-page');

      expect(consoleSpy.warn).toHaveBeenCalledWith('Page view tracking error:', expect.any(Error));
    });
  });

  describe('trackFormInteraction', () => {
    test('should track form interactions', () => {
      trackFormInteraction('tax_calculator_form', 'submit', 'salary_field');

      expect(mockGtag).toHaveBeenCalledWith('event', 'form_interaction', {
        event_category: 'seo_actions',
        event_label: 'tax_calculator_form',
        custom_parameters: expect.objectContaining({
          source: 'tax_calculator_form',
          action_type: 'submit',
          target: 'salary_field',
        }),
      });
    });

    test('should track form interactions without field name', () => {
      trackFormInteraction('contact_form', 'focus');

      expect(mockGtag).toHaveBeenCalledWith('event', 'form_interaction', {
        event_category: 'seo_actions',
        event_label: 'contact_form',
        custom_parameters: expect.objectContaining({
          source: 'contact_form',
          action_type: 'focus',
          target: undefined,
        }),
      });
    });
  });

  describe('trackPerformanceMetric', () => {
    test('should track performance metrics with default unit', () => {
      trackPerformanceMetric('load_time', 1500);

      expect(mockGtag).toHaveBeenCalledWith('event', 'performance_metric', {
        event_category: 'performance',
        event_label: 'load_time',
        value: 1500,
        custom_parameters: {
          unit: 'ms',
          timestamp: expect.any(String),
        },
      });
    });

    test('should track performance metrics with custom unit', () => {
      trackPerformanceMetric('memory_usage', 50.5, 'MB');

      expect(mockGtag).toHaveBeenCalledWith('event', 'performance_metric', {
        event_category: 'performance',
        event_label: 'memory_usage',
        value: 50.5,
        custom_parameters: {
          unit: 'MB',
          timestamp: expect.any(String),
        },
      });
    });
  });
});
