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
import type { FeatureSchema } from '@/lib/validation/pageDataValidation';

/** Update whenever the privacy policy materially changes. */
export const PRIVACY_LAST_UPDATED = '11 June 2026';

/** Controller contact email (matches the address used on the compliance page). */
export const PRIVACY_CONTACT_EMAIL = 'support@payetax.co.uk';

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
      'Tax calculations run in your browser. Your salary and tax details are not sent to our servers to get a result — they only leave your device if you choose to email your results.',
    gradient: {
      icon: 'text-primary',
    },
  },
  {
    icon: Database,
    title: 'No Stored Tax Data',
    description:
      "We don't keep a copy of your calculations. Nothing about your salary or results is written to a PayeTax database, before or after you calculate.",
    gradient: {
      icon: 'text-accent',
    },
  },
  {
    icon: Eye,
    title: 'Consent-Based Analytics',
    description:
      'Google Analytics only runs after you accept analytics cookies. Cookieless traffic counts contain no personal data. You can decline and the calculator works identically.',
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
  'Keep a copy of your tax calculations',
  'Sell, share, or monetise your data',
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
  'Only send data when you ask us to email results',
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
      'Calculations happen here in your browser. Your salary, tax code, and personal details stay on your device unless you choose to email your results.',
  },
  {
    icon: Globe,
    iconColor: 'bg-primary/80',
    title: 'Our Servers',
    description:
      'We send you the calculator app. We only receive your inputs if you request an email of your results — and even then we do not store them.',
  },
  {
    icon: FileText,
    iconColor: 'bg-primary/60',
    title: 'Trusted Processors',
    description:
      'Brevo delivers result emails, Upstash powers abuse protection, and consent-based GA4 plus cookieless analytics and Sentry monitoring help us run the site. No cross-site tracking.',
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
    retention: 'Never stored on our servers',
  },
  {
    category: 'Emailed results',
    data: 'Your email address and the calculated results you ask us to send',
    purpose: 'Deliver the results email you requested',
    lawfulBasis: 'Performance of your request (Article 6(1)(b))',
    retention: 'Not stored by us; held only in our email provider’s sending logs',
  },
  {
    category: 'Analytics',
    data: 'Page views, device/browser type, and pseudonymous usage events',
    purpose: 'Understand which tools are useful and improve the site',
    lawfulBasis: 'Consent (Article 6(1)(a)) — GA4 only after you opt in',
    retention: 'Per Google Analytics retention settings',
  },
  {
    category: 'Aggregate traffic',
    data: 'Cookieless, aggregated visit counts with no personal identifiers',
    purpose: 'Basic, privacy-preserving traffic measurement',
    lawfulBasis: 'Legitimate interests (Article 6(1)(f))',
    retention: 'Aggregated; not tied to an individual',
  },
  {
    category: 'Error diagnostics',
    data: 'Technical error context on monitored calculator and email routes',
    purpose: 'Detect and fix faults that break calculations or emails',
    lawfulBasis: 'Legitimate interests (Article 6(1)(f))',
    retention: 'Limited monitoring window',
  },
  {
    category: 'Abuse prevention',
    data: 'A short-lived client identifier derived from your IP address',
    purpose: 'Rate-limit requests and protect the email endpoints from abuse',
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
    data: 'Technical request data plus aggregate, non-identifying visit and performance signals',
  },
  {
    name: 'Brevo',
    role: 'Transactional email delivery for results you ask us to send',
    data: 'Your email address and the results included in that email',
  },
  {
    name: 'Google Analytics 4',
    role: 'Consent-based product analytics',
    data: 'Pseudonymous usage events, loaded only after you accept analytics cookies',
  },
  {
    name: 'Sentry',
    role: 'Error monitoring on key calculator and email routes',
    data: 'Technical error and diagnostic context',
  },
  {
    name: 'Upstash',
    role: 'Distributed rate limiting and abuse protection',
    data: 'A short-lived client identifier derived from your IP address',
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
