// Type definitions for Google Analytics gtag
// This provides proper types instead of using 'any'

export interface GtagConfig {
  page_path?: string;
  page_title?: string;
  custom_map?: Record<string, string>;
  send_page_view?: boolean;
  [key: string]: string | boolean | number | Record<string, string> | undefined;
}

export interface GtagEvent {
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_parameters?: Record<string, unknown>;
  tool?: string;
  [key: string]: string | number | Record<string, unknown> | undefined;
}

export interface GtagConsentUpdate {
  analytics_storage?: 'granted' | 'denied';
  ad_storage?: 'granted' | 'denied';
  functionality_storage?: 'granted' | 'denied';
  personalization_storage?: 'granted' | 'denied';
  security_storage?: 'granted' | 'denied';
}

export interface GtagConsentDefault {
  analytics_storage?: 'granted' | 'denied';
  ad_storage?: 'granted' | 'denied';
  functionality_storage?: 'granted' | 'denied';
  personalization_storage?: 'granted' | 'denied';
  security_storage?: 'granted' | 'denied';
  wait_for_update?: number;
}

export interface GtagFunction {
  (command: 'config', targetId: string, config?: GtagConfig): void;
  (command: 'event', eventName: string, eventParameters?: GtagEvent): void;
  (command: 'consent', subCommand: 'update', consentParameters: GtagConsentUpdate): void;
  (command: 'consent', subCommand: 'default', consentParameters: GtagConsentDefault): void;
  (command: 'js', date: Date): void;
  (command: string, ...args: unknown[]): void; // Fallback for other commands
}

// Extend the Window interface to include gtag
declare global {
  interface Window {
    gtag?: GtagFunction;
  }
}
