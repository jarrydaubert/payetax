/**
 * Privacy Page Data
 *
 * Static content data for the privacy page, extracted from inline definitions
 * for better maintainability, i18n readiness, and build-time validation.
 *
 * All data is validated via Zod schemas at build time using the `satisfies` pattern.
 *
 * Server-compatible module - no 'use client' needed for static data.
 *
 * @module constants/pages/privacyPageData
 * @created PAYTAX-109 Phase 4 - Data Extraction
 */

import type { LucideIcon } from 'lucide-react';
import Database from 'lucide-react/dist/esm/icons/database.js';
import Eye from 'lucide-react/dist/esm/icons/eye.js';
import FileText from 'lucide-react/dist/esm/icons/file-text.js';
import Globe from 'lucide-react/dist/esm/icons/globe.js';
import Lock from 'lucide-react/dist/esm/icons/lock.js';
import Shield from 'lucide-react/dist/esm/icons/shield.js';
import type { z } from 'zod';
import type { FeatureSchema } from '@/lib/validation/pageDataValidation';

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
      'All tax calculations run in your browser using JavaScript. Your salary, tax code, and personal details never leave your device.',
    gradient: {
      bg: 'from-primary/20 to-accent/20',
      icon: 'text-primary',
      border: 'border-primary/20',
    },
  },
  {
    icon: Database,
    title: 'Zero Server Storage',
    description:
      "We don't store your tax data on our servers. Calculations happen locally, results display instantly, nothing gets saved remotely.",
    gradient: {
      bg: 'from-accent/20 to-primary/20',
      icon: 'text-accent',
      border: 'border-accent/20',
    },
  },
  {
    icon: Eye,
    title: 'Optional Analytics',
    description:
      'Anonymous usage data (page views, device type) only with your consent. You can decline entirely - the calculator works exactly the same.',
    gradient: {
      bg: 'from-primary/10 to-accent/10',
      icon: 'text-primary',
      border: 'border-primary/10',
    },
  },
  {
    icon: Shield,
    title: 'Privacy by Design',
    description:
      "Your privacy isn't a feature we added - it's built into the architecture. We literally cannot see your tax calculations.",
    gradient: {
      bg: 'from-accent/10 to-primary/10',
      icon: 'text-accent',
      border: 'border-accent/10',
    },
  },
] satisfies z.infer<typeof FeatureSchema>[];

/**
 * What we DON'T do - negative list for ComparisonCards
 */
export const PRIVACY_DONT_DO = [
  'Store your tax calculations on servers',
  'Sell, share, or monetize your data',
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
  'Use privacy-focused analytics (Umami)',
  'Respect Do Not Track settings',
  'Provide complete transparency',
  'Keep the site forever free',
  'Maintain open-source code',
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
      'All calculations happen here in your browser. Your salary, tax code, and personal details never leave this device.',
  },
  {
    icon: Globe,
    iconColor: 'bg-primary/80',
    title: 'Our Servers',
    description:
      'We only send you the calculator app. No tax data, no personal information, no calculation results stored.',
  },
  {
    icon: FileText,
    iconColor: 'bg-primary/60',
    title: 'Analytics (Optional)',
    description:
      'Privacy-focused Umami analytics tracks anonymous page views only if you consent. No personal data, no cross-site tracking.',
  },
];
