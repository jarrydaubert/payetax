// Type definitions for Google Analytics gtag
// This provides proper types instead of using 'any'

/** Consent state for GA storage types */
type ConsentState = 'granted' | 'denied';

/** Primitive values that gtag accepts */
type GtagPrimitive = string | number | boolean;

export interface GtagConfig {
  page_path?: string;
  page_title?: string;
  custom_map?: Record<string, string>;
  send_page_view?: boolean;
  [key: string]: GtagPrimitive | Record<string, string> | undefined;
}

export interface GtagEvent {
  event_category?: string;
  event_label?: string;
  value?: number;
  tool?: string;
  non_interaction?: boolean;
  // Custom params should be passed at top level, not nested
  [key: string]: GtagPrimitive | Record<string, unknown> | undefined;
}

/** Shared consent fields */
interface ConsentBase {
  analytics_storage?: ConsentState;
  ad_storage?: ConsentState;
  ad_user_data?: ConsentState;
  ad_personalization?: ConsentState;
  functionality_storage?: ConsentState;
  personalization_storage?: ConsentState;
  security_storage?: ConsentState;
}

export interface GtagConsentUpdate extends ConsentBase {}

export interface GtagConsentDefault extends ConsentBase {
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
