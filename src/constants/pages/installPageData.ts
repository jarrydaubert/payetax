/**
 * Install Page Data
 *
 * Platform install steps and benefits for the PWA install guide.
 * Kept in sync with the HowTo structured data declared on the install page.
 *
 * @module constants/pages/installPageData
 */

export interface InstallPlatform {
  /** Platform heading (e.g. "iPhone & iPad") */
  platform: string;
  /** Browser the steps apply to */
  browser: string;
  /** Ordered install steps */
  steps: string[];
}

export const INSTALL_PLATFORMS: InstallPlatform[] = [
  {
    platform: 'iPhone & iPad',
    browser: 'Safari',
    steps: [
      'Open PayeTax in Safari.',
      'Tap the Share icon.',
      'Choose "Add to Home Screen" and confirm.',
    ],
  },
  {
    platform: 'Android',
    browser: 'Chrome',
    steps: [
      'Open PayeTax in Chrome.',
      'Tap the menu (three dots).',
      'Choose "Install app" or "Add to Home screen".',
    ],
  },
  {
    platform: 'Desktop',
    browser: 'Chrome or Edge',
    steps: [
      'Open PayeTax in your browser.',
      'Click the install icon in the address bar.',
      'Confirm the installation.',
    ],
  },
];

export const INSTALL_BENEFITS = [
  'Faster launch straight from your home screen.',
  'A standalone, app-style full-screen experience.',
  'Offline fallback when your connection drops.',
];
