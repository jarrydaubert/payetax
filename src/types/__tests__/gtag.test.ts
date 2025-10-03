// src/types/__tests__/gtag.test.ts

import type {
  GtagConfig,
  GtagConsentDefault,
  GtagConsentUpdate,
  GtagEvent,
  GtagFunction,
} from '../gtag';

describe('Gtag Types', () => {
  describe('GtagConfig interface', () => {
    test('should accept valid configuration properties', () => {
      const validConfig: GtagConfig = {
        page_path: '/test-path',
        page_title: 'Test Page',
        custom_map: { custom_parameter_1: 'dimension1' },
        send_page_view: false,
      };

      expect(validConfig.page_path).toBe('/test-path');
      expect(validConfig.page_title).toBe('Test Page');
      expect(validConfig.custom_map).toEqual({ custom_parameter_1: 'dimension1' });
      expect(validConfig.send_page_view).toBe(false);
    });

    test('should allow arbitrary additional properties', () => {
      const configWithExtra: GtagConfig = {
        page_path: '/test',
        customProperty: 'custom-value',
        numericProperty: 123,
        booleanProperty: true,
      };

      expect(configWithExtra.page_path).toBe('/test');
      expect(configWithExtra.customProperty).toBe('custom-value');
      expect(configWithExtra.numericProperty).toBe(123);
      expect(configWithExtra.booleanProperty).toBe(true);
    });

    test('should allow empty configuration', () => {
      const emptyConfig: GtagConfig = {};
      expect(Object.keys(emptyConfig)).toHaveLength(0);
    });

    test('should accept custom_map with multiple entries', () => {
      const config: GtagConfig = {
        custom_map: {
          param1: 'dimension1',
          param2: 'dimension2',
          param3: 'metric1',
        },
      };

      expect(config.custom_map).toHaveProperty('param1', 'dimension1');
      expect(config.custom_map).toHaveProperty('param2', 'dimension2');
      expect(config.custom_map).toHaveProperty('param3', 'metric1');
    });
  });

  describe('GtagEvent interface', () => {
    test('should accept standard event properties', () => {
      const event: GtagEvent = {
        event_category: 'engagement',
        event_label: 'video',
        value: 1,
        custom_parameters: {
          duration: 30,
          quality: 'hd',
        },
        tool: 'calculator',
      };

      expect(event.event_category).toBe('engagement');
      expect(event.event_label).toBe('video');
      expect(event.value).toBe(1);
      expect(event.custom_parameters).toEqual({
        duration: 30,
        quality: 'hd',
      });
      expect(event.tool).toBe('calculator');
    });

    test('should allow empty event object', () => {
      const emptyEvent: GtagEvent = {};
      expect(Object.keys(emptyEvent)).toHaveLength(0);
    });

    test('should accept custom parameters of various types', () => {
      const event: GtagEvent = {
        custom_parameters: {
          stringParam: 'test',
          numberParam: 42,
          booleanParam: true,
          nullParam: null,
          undefinedParam: undefined,
          objectParam: { nested: 'value' },
          arrayParam: [1, 2, 3],
        },
      };

      expect(event.custom_parameters?.stringParam).toBe('test');
      expect(event.custom_parameters?.numberParam).toBe(42);
      expect(event.custom_parameters?.booleanParam).toBe(true);
      expect(event.custom_parameters?.nullParam).toBeNull();
      expect(event.custom_parameters?.undefinedParam).toBeUndefined();
      expect(event.custom_parameters?.objectParam).toEqual({ nested: 'value' });
      expect(event.custom_parameters?.arrayParam).toEqual([1, 2, 3]);
    });

    test('should allow arbitrary additional properties', () => {
      const eventWithExtras: GtagEvent = {
        event_category: 'test',
        customField: 'custom-value',
        numeric_field: 99,
        array_field: ['a', 'b', 'c'],
      };

      expect(eventWithExtras.event_category).toBe('test');
      expect(eventWithExtras.customField).toBe('custom-value');
      expect(eventWithExtras.numeric_field).toBe(99);
      expect(eventWithExtras.array_field).toEqual(['a', 'b', 'c']);
    });
  });

  describe('GtagConsentUpdate interface', () => {
    test('should accept valid consent update properties', () => {
      const consentUpdate: GtagConsentUpdate = {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        functionality_storage: 'granted',
        personalization_storage: 'denied',
        security_storage: 'granted',
      };

      expect(consentUpdate.analytics_storage).toBe('granted');
      expect(consentUpdate.ad_storage).toBe('denied');
      expect(consentUpdate.functionality_storage).toBe('granted');
      expect(consentUpdate.personalization_storage).toBe('denied');
      expect(consentUpdate.security_storage).toBe('granted');
    });

    test('should allow partial consent updates', () => {
      const partialConsent: GtagConsentUpdate = {
        analytics_storage: 'granted',
        ad_storage: 'denied',
      };

      expect(partialConsent.analytics_storage).toBe('granted');
      expect(partialConsent.ad_storage).toBe('denied');
      expect(partialConsent.functionality_storage).toBeUndefined();
    });

    test('should allow empty consent update', () => {
      const emptyConsent: GtagConsentUpdate = {};
      expect(Object.keys(emptyConsent)).toHaveLength(0);
    });
  });

  describe('GtagConsentDefault interface', () => {
    test('should accept valid consent default properties', () => {
      const consentDefault: GtagConsentDefault = {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        functionality_storage: 'granted',
        personalization_storage: 'denied',
        security_storage: 'granted',
        wait_for_update: 2000,
      };

      expect(consentDefault.analytics_storage).toBe('denied');
      expect(consentDefault.ad_storage).toBe('denied');
      expect(consentDefault.functionality_storage).toBe('granted');
      expect(consentDefault.personalization_storage).toBe('denied');
      expect(consentDefault.security_storage).toBe('granted');
      expect(consentDefault.wait_for_update).toBe(2000);
    });

    test('should allow wait_for_update property', () => {
      const consentWithWait: GtagConsentDefault = {
        analytics_storage: 'denied',
        wait_for_update: 5000,
      };

      expect(consentWithWait.wait_for_update).toBe(5000);
    });
  });

  describe('GtagFunction interface', () => {
    let mockGtag: jest.MockedFunction<GtagFunction>;

    beforeEach(() => {
      mockGtag = jest.fn() as jest.MockedFunction<GtagFunction>;
    });

    test('should accept config command with target ID and config', () => {
      const config: GtagConfig = {
        page_path: '/test',
        page_title: 'Test Page',
      };

      mockGtag('config', 'GA_MEASUREMENT_ID', config);

      expect(mockGtag).toHaveBeenCalledWith('config', 'GA_MEASUREMENT_ID', config);
    });

    test('should accept config command without config object', () => {
      mockGtag('config', 'GA_MEASUREMENT_ID');

      expect(mockGtag).toHaveBeenCalledWith('config', 'GA_MEASUREMENT_ID');
    });

    test('should accept event command with event name and parameters', () => {
      const eventParams: GtagEvent = {
        event_category: 'engagement',
        event_label: 'video',
        value: 1,
      };

      mockGtag('event', 'video_play', eventParams);

      expect(mockGtag).toHaveBeenCalledWith('event', 'video_play', eventParams);
    });

    test('should accept event command without parameters', () => {
      mockGtag('event', 'page_view');

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view');
    });

    test('should accept consent update command', () => {
      const consentUpdate: GtagConsentUpdate = {
        analytics_storage: 'granted',
        ad_storage: 'denied',
      };

      mockGtag('consent', 'update', consentUpdate);

      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', consentUpdate);
    });

    test('should accept consent default command', () => {
      const consentDefault: GtagConsentDefault = {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        wait_for_update: 2000,
      };

      mockGtag('consent', 'default', consentDefault);

      expect(mockGtag).toHaveBeenCalledWith('consent', 'default', consentDefault);
    });

    test('should accept js command with date', () => {
      const date = new Date();

      mockGtag('js', date);

      expect(mockGtag).toHaveBeenCalledWith('js', date);
    });

    test('should accept arbitrary commands with fallback signature', () => {
      mockGtag('custom_command', 'param1', 'param2', 123);

      expect(mockGtag).toHaveBeenCalledWith('custom_command', 'param1', 'param2', 123);
    });

    test('should work with no additional arguments', () => {
      mockGtag('simple_command');

      expect(mockGtag).toHaveBeenCalledWith('simple_command');
    });
  });

  describe('Window interface extension', () => {
    test('should allow gtag to be assigned to window', () => {
      const mockGtagFunction: GtagFunction = jest.fn();

      // This should compile without errors
      if (typeof window !== 'undefined') {
        window.gtag = mockGtagFunction;
        expect(window.gtag).toBe(mockGtagFunction);
      } else {
        // In Node.js environment, we can mock this
        const mockWindow = { gtag: mockGtagFunction } as Window & typeof globalThis;
        expect(mockWindow.gtag).toBe(mockGtagFunction);
      }
    });

    test('should allow gtag to be undefined', () => {
      if (typeof window !== 'undefined') {
        window.gtag = undefined;
        expect(window.gtag).toBeUndefined();
      } else {
        // In Node.js environment, we can mock this
        const mockWindow = { gtag: undefined } as Window & typeof globalThis;
        expect(mockWindow.gtag).toBeUndefined();
      }
    });

    test('should allow checking if gtag exists', () => {
      const mockGtagFunction: GtagFunction = jest.fn();

      if (typeof window !== 'undefined') {
        window.gtag = mockGtagFunction;
        expect(typeof window.gtag).toBe('function');
        expect(window.gtag).toBeDefined();
      } else {
        // In Node.js environment, we can simulate this
        const mockWindow = { gtag: mockGtagFunction } as Window & typeof globalThis;
        expect(typeof mockWindow.gtag).toBe('function');
        expect(mockWindow.gtag).toBeDefined();
      }
    });
  });

  describe('Type safety and compilation', () => {
    test('should enforce correct consent values', () => {
      // These should compile fine
      const validConsent1: GtagConsentUpdate = {
        analytics_storage: 'granted',
      };

      const validConsent2: GtagConsentDefault = {
        ad_storage: 'denied',
      };

      expect(validConsent1.analytics_storage).toBe('granted');
      expect(validConsent2.ad_storage).toBe('denied');

      // TypeScript should prevent invalid values like:
      // analytics_storage: 'invalid' // This would cause a compilation error
    });

    test('should handle complex nested custom parameters', () => {
      const complexEvent: GtagEvent = {
        custom_parameters: {
          user: {
            id: 123,
            name: 'John Doe',
            preferences: {
              theme: 'dark',
              notifications: true,
            },
          },
          session: {
            duration: 1800,
            pages_viewed: 5,
            events: [
              { type: 'click', timestamp: Date.now() },
              { type: 'scroll', timestamp: Date.now() + 1000 },
            ],
          },
        },
      };

      expect(complexEvent.custom_parameters?.user).toBeDefined();
      expect(complexEvent.custom_parameters?.session).toBeDefined();
    });

    test('should allow gtag function calls with proper typing', () => {
      const gtag: GtagFunction = jest.fn();

      // All these calls should be properly typed
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID', { page_path: '/' });
      gtag('event', 'page_view', { page_title: 'Home' });
      gtag('consent', 'default', { analytics_storage: 'denied' });
      gtag('consent', 'update', { analytics_storage: 'granted' });

      expect(gtag).toHaveBeenCalledTimes(5);
    });
  });

  describe('Real-world usage scenarios', () => {
    test('should handle typical e-commerce tracking event', () => {
      const purchaseEvent: GtagEvent = {
        event_category: 'ecommerce',
        event_label: 'purchase',
        value: 99.99,
        custom_parameters: {
          transaction_id: 'T12345',
          currency: 'GBP',
          items: [
            {
              item_id: 'TAX_CALC_PREMIUM',
              item_name: 'Tax Calculator Premium',
              category: 'software',
              quantity: 1,
              price: 99.99,
            },
          ],
        },
      };

      expect(purchaseEvent.value).toBe(99.99);
      expect(purchaseEvent.custom_parameters?.transaction_id).toBe('T12345');
      expect(purchaseEvent.custom_parameters?.currency).toBe('GBP');
    });

    test('should handle tax calculator specific events', () => {
      const calculationEvent: GtagEvent = {
        event_category: 'calculator',
        event_label: 'tax_calculation',
        tool: 'uk_tax_calculator',
        custom_parameters: {
          salary: 50000,
          tax_year: '2024-2025',
          tax_code: '1257L',
          result_type: 'basic_calculation',
          calculation_time: 1234,
        },
      };

      expect(calculationEvent.tool).toBe('uk_tax_calculator');
      expect(calculationEvent.custom_parameters?.salary).toBe(50000);
      expect(calculationEvent.custom_parameters?.tax_year).toBe('2024-2025');
    });

    test('should handle GDPR consent scenarios', () => {
      // Initial denial
      const initialConsent: GtagConsentDefault = {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        functionality_storage: 'granted',
        security_storage: 'granted',
        wait_for_update: 2000,
      };

      // User grants consent
      const updatedConsent: GtagConsentUpdate = {
        analytics_storage: 'granted',
        ad_storage: 'granted',
      };

      expect(initialConsent.analytics_storage).toBe('denied');
      expect(updatedConsent.analytics_storage).toBe('granted');
    });

    test('should handle page tracking with custom parameters', () => {
      const pageConfig: GtagConfig = {
        page_path: '/calculator/results',
        page_title: 'Tax Calculation Results - PayeTax',
        custom_map: {
          calculator_type: 'dimension1',
          user_type: 'dimension2',
        },
        send_page_view: true,
        calculator_type: 'uk_tax',
        user_type: 'premium',
      };

      expect(pageConfig.page_path).toBe('/calculator/results');
      expect(pageConfig.custom_map?.calculator_type).toBe('dimension1');
      expect(pageConfig.calculator_type).toBe('uk_tax');
    });
  });
});
