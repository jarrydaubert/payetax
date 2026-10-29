/**
 * Privacy Page Data
 *
 * Static content for the privacy page: a plain-language summary plus the
 * structured data backing the formal UK GDPR policy sections.
 *
 * Claims here are deliberately reconciled with how the app actually works:
 * calculations run in the browser, but choosing to email results sends those
 * inputs to our server and on to Brevo to deliver the email, and abuse
 * protection processes a derived client identifier. See AGENTS.md.
 *
 * @module constants/pages/privacyPageData
 */

import type { LucideIcon } from 'lucide-react';
import Database from 'lucide-react/dist/esm/icons/database.mjs';
import Eye from 'lucide-react/dist/esm/icons/eye.mjs';
import FileText from 'lucide-react/dist/esm/icons/file-text.mjs';
import Globe from 'lucide-react/dist/esm/icons/globe.mjs';
import Lock from 'lucide-react/dist/esm/icons/lock.mjs';
import Shield from 'lucide-react/dist/esm/icons/shield.mjs';
import type { z } from 'zod';
import { SITE_CONTACT_EMAIL } from '@/constants/contact';
import type { FeatureSchema } from '@/lib/validation/pageDataValidation';

/** Update whenever the privacy policy materially changes. */
export const PRIVACY_LAST_UPDATED_ISO = '2026-10-27';
export const PRIVACY_LAST_UPDATED = '27 October 2026';

/** Controller contact email (matches the address used on the compliance page). */
export const PRIVACY_CONTACT_EMAIL = SITE_CONTACT_EMAIL;

// Note: DataFlowCard doesn't have a schema yet, but iconColor is a custom field
interface DataFlowCard {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description: string;
}

/**
 * Privacy principles/features
 * Displayed in FeatureGrid component (2 columns)
 */
export const PRIVACY_PRINCIPLES = [
  {
    icon: Lock,
    title: 'Client-Side Calculations',
    description:
      'Tax calculations run in your browser. We do not attach your calculator figures, financial bands or personal tax answers to analytics or diagnostic reports. Emailing results sends your inputs to our server to prepare the email.',
    gradient: {
      icon: 'text-primary',
    },
  },
  {
    icon: Database,
    title: 'Figures Remembered On Your Device',
    description:
      'Your browser currently remembers calculator inputs on this device, including on shared devices. We do not keep a calculations database. Emailing results creates copies with the email provider and in the recipient’s mailbox.',
    gradient: {
      icon: 'text-accent',
    },
  },
  {
    icon: Eye,
    title: 'Consent-Based Analytics',
    description:
      'Google Analytics only runs after you accept analytics cookies, and withdrawing consent switches it off and removes its cookies. You can decline and the calculator works identically.',
    gradient: {
      icon: 'text-primary',
    },
  },
  {
    icon: Shield,
    title: 'Privacy by Design',
    description:
      'Privacy is built into the architecture, not bolted on. Where data must be processed — to email results or to block abuse — we use the minimum needed and say so plainly.',
    gradient: {
      icon: 'text-accent',
    },
  },
] satisfies z.infer<typeof FeatureSchema>[];

/**
 * What we DON'T do - negative list for ComparisonCards
 */
export const PRIVACY_DONT_DO = [
  'Maintain a database of your calculator figures',
  'Sell your data or use it for advertising',
  'Track you across other websites',
  'Require account creation or login',
  'Use third-party advertising networks',
  'Employ dark patterns or deceptive practices',
];

/**
 * What we DO - positive list for ComparisonCards
 */
export const PRIVACY_DO_DO = [
  'Calculate everything in your browser',
  'Keep calculator figures out of analytics and diagnostic context',
  'Use cookieless traffic and performance signals plus consent-based analytics',
  'Process the minimum data needed to prevent abuse',
  'Tell you exactly which third parties are involved',
  'Let you exercise your UK GDPR rights at any time',
];

/**
 * Data flow explanation cards
 * Displayed in DataFlowCards component (3 columns)
 */
export const PRIVACY_DATA_FLOW: DataFlowCard[] = [
  {
    icon: Database,
    iconColor: 'bg-primary',
    title: 'Your Device',
    description:
      'Calculations happen here. Your browser remembers your salary, tax code and other input answers after you leave. Clear this site’s browser data to remove saved figures; this also clears your consent choice.',
  },
  {
    icon: Globe,
    iconColor: 'bg-primary/80',
    title: 'Our Servers',
    description:
      'We deliver the app and receive ordinary technical request information. Requesting an email sends your inputs and email address to our server so it can prepare the results; we do not save them to a calculations database.',
  },
  {
    icon: FileText,
    iconColor: 'bg-primary/60',
    title: 'Trusted Processors',
    description:
      'Brevo delivers result emails, Cloudflare routes support emails, Upstash powers abuse protection, and consent-based GA4 plus cookieless analytics and Sentry monitoring help us run the site. No cross-site tracking.',
  },
];

/**
 * Data categories table — what we process, why, the lawful basis, and retention.
 * Rendered in the formal policy section.
 */
export interface PrivacyDataCategory {
  category: string;
  data: string;
  purpose: string;
  lawfulBasis: string;
  retention: string;
}

export const PRIVACY_DATA_CATEGORIES: PrivacyDataCategory[] = [
  {
    category: 'Calculator inputs',
    data: 'Salary, tax code, pension, student loan, and similar figures you enter',
    purpose: 'Produce your tax breakdown in your browser',
    lawfulBasis: 'Not collected by us — processed locally on your device',
    retention:
      'Remembered in browser storage on this device; not saved to a PayeTax calculations database',
  },
  {
    category: 'Emailed results',
    data: 'Your email address and calculator inputs; the server prepares the results included in your email',
    purpose: 'Deliver the results email you requested',
    lawfulBasis: 'Performance of your request (Article 6(1)(b))',
    retention:
      'Not saved to a PayeTax calculations database; copies are processed by the email provider and retained in the recipient’s mailbox',
  },
  {
    category: 'Support messages',
    data: 'Your email address, message content, and technical email headers if you contact us',
    purpose: 'Respond to your question or request',
    lawfulBasis: 'Legitimate interests (Article 6(1)(f))',
    retention: 'Held only as needed to handle the enquiry and any follow-up',
  },
  {
    category: 'Analytics',
    data: 'Page views, device/browser type, interaction counts, technical timings and approved results-email campaign labels. No calculator amounts, financial bands, personal tax answers or financial warning conditions',
    purpose: 'Understand which tools are useful and improve the site',
    lawfulBasis: 'Consent (Article 6(1)(a)) — GA4 only after you opt in',
    retention: 'Per Google Analytics retention settings',
  },
  {
    category: 'Aggregate traffic',
    data: 'Aggregated visit and performance counts, designed to work without cookies or persistent identifiers',
    purpose: 'Basic, privacy-preserving traffic measurement',
    lawfulBasis: 'Legitimate interests (Article 6(1)(f))',
    retention: 'Aggregated; not tied to an individual',
  },
  {
    category: 'Error diagnostics',
    data: 'Error types, stacks, app release, route, calculation stage, anomaly codes and technical context on monitored routes. Calculator figures and personal tax answers are excluded from attached context',
    purpose: 'Detect and fix faults that break calculations, public pages, or emails',
    lawfulBasis: 'Legitimate interests (Article 6(1)(f))',
    retention: 'Limited monitoring window',
  },
  {
    category: 'Abuse prevention',
    data: 'Your IP address in a short-lived rate-limit key, or a browser-header fallback if an IP address is unavailable',
    purpose: 'Rate-limit requests to email-results and social-preview image endpoints',
    lawfulBasis: 'Legitimate interests (Article 6(1)(f))',
    retention: 'Short-lived (expires automatically)',
  },
];

/**
 * Third-party processors we rely on.
 * Rendered in the formal policy section.
 */
export interface PrivacyProcessor {
  name: string;
  role: string;
  data: string;
}

export const PRIVACY_PROCESSORS: PrivacyProcessor[] = [
  {
    name: 'Vercel',
    role: 'Hosting, content delivery, cookieless traffic analytics, and speed insights',
    data: 'Technical request data plus aggregated visit and performance signals, designed to work without cookies or persistent identifiers',
  },
  {
    name: 'Brevo',
    role: 'Transactional email delivery for results you ask us to send',
    data: 'Your email address and the results included in that email',
  },
  {
    name: 'Cloudflare',
    role: 'Email routing for inbound support messages',
    data: 'The sender, recipient, subject, and content of support emails you choose to send us',
  },
  {
    name: 'Google Analytics 4',
    role: 'Consent-based product analytics',
    data: 'Page views, interaction counts and technical timings after analytics consent; calculator figures and financial attributes are excluded',
  },
  {
    name: 'Sentry',
    role: 'Error monitoring on retained calculator, tool, blog, and email routes',
    data: 'Technical errors and diagnostic context, excluding attached calculator figures and personal tax answers',
  },
  {
    name: 'Upstash',
    role: 'Distributed rate limiting and abuse protection',
    data: 'Your IP address in a short-lived rate-limit key, or a browser-header fallback if an IP address is unavailable',
  },
];

/**
 * Cookie and local-storage inventory.
 * Rendered in the cookies section of the formal policy.
 *
 * GA cookie lifetimes are browser-side defaults and deliberately stated
 * separately from GA4's server-side data-retention settings.
 */
export interface PrivacyStorageItem {
  name: string;
  type: string;
  purpose: string;
  duration: string;
}

export const PRIVACY_STORAGE_INVENTORY: PrivacyStorageItem[] = [
  {
    name: 'tax-calculator-storage',
    type: 'localStorage (calculator inputs)',
    purpose:
      'Automatically remembers PAYE inputs, including salary, tax code, pension, loan and allowance answers, on this device',
    duration:
      'Until site data is cleared or overwritten. Snapshots older than 30 days are not restored; this is not scheduled deletion',
  },
  {
    name: 'director-guide-storage',
    type: 'localStorage (calculator inputs)',
    purpose:
      'Automatically remembers Director company/personal inputs and the selected strategy on this device',
    duration:
      'Until site data is cleared or overwritten. Snapshots older than 7 days or from another tax year are not restored; this is not scheduled deletion',
  },
  {
    name: 'taxTrapAlertDismissed',
    type: 'localStorage (interface preference)',
    purpose: 'Remembers dismissal of the pension alert',
    duration: 'Until site data is cleared',
  },
  {
    name: 'pwa-install-banner-dismissed-at',
    type: 'localStorage (interface preference)',
    purpose: 'Suppresses the install prompt for 7 days after dismissal',
    duration: 'Until site data is cleared or overwritten; the dismissal is used for 7 days',
  },
  {
    name: 'director-guide-education-collapsed:v1',
    type: 'localStorage (interface preference)',
    purpose: 'Remembers whether the Director Learn panel is collapsed',
    duration: 'Until site data is cleared or overwritten',
  },
  {
    name: '_ga',
    type: 'Cookie (Google Analytics)',
    purpose: 'Distinguishes visitors for consent-based analytics',
    duration:
      'Google’s default of up to 2 years, subject to browser restrictions; removed when you reject or withdraw consent or your consent expires',
  },
  {
    name: '_ga_*',
    type: 'Cookie (Google Analytics)',
    purpose: 'Keeps analytics session state for consent-based analytics',
    duration: 'Same as _ga',
  },
  {
    name: 'cookie-consent',
    type: 'localStorage (essential)',
    purpose: 'Remembers your consent choice',
    duration: 'Until you clear it; we re-ask after 12 months',
  },
  {
    name: 'cookie-consent-timestamp',
    type: 'localStorage (essential)',
    purpose: 'Records when you made your choice so it can expire',
    duration: 'Until you clear it; a choice without a valid timestamp is treated as expired',
  },
];

/**
 * Data subject rights under UK GDPR.
 */
export interface PrivacyRight {
  title: string;
  description: string;
}

export const PRIVACY_RIGHTS: PrivacyRight[] = [
  { title: 'Access', description: 'Ask whether we process data about you and request a copy.' },
  {
    title: 'Rectification',
    description: 'Ask us to correct data that is inaccurate or incomplete.',
  },
  { title: 'Erasure', description: 'Ask us to delete data we hold about you, where applicable.' },
  {
    title: 'Restriction',
    description: 'Ask us to limit how we use your data in certain circumstances.',
  },
  { title: 'Portability', description: 'Receive data you provided in a portable format.' },
  {
    title: 'Objection',
    description: 'Object to processing based on legitimate interests, including analytics.',
  },
  {
    title: 'Withdraw consent',
    description: 'Withdraw analytics consent at any time via Cookie Settings.',
  },
  {
    title: 'Complain to the ICO',
    description: 'Raise a concern with the UK Information Commissioner’s Office at ico.org.uk.',
  },
];

/**
 * In-page navigation for the formal policy sections.
 */
export const PRIVACY_TOC: { id: string; label: string }[] = [
  { id: 'controller', label: 'Who we are' },
  { id: 'data-we-process', label: 'Data we process' },
  { id: 'processors', label: 'Third parties' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'your-rights', label: 'Your rights' },
  { id: 'contact', label: 'Contact & complaints' },
];
