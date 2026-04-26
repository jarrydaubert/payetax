/**
 * About Page Data
 *
 * Curated content blocks for the About page.
 */

import ChartColumnIncreasing from 'lucide-react/dist/esm/icons/chart-column-increasing.mjs';
import Clock3 from 'lucide-react/dist/esm/icons/clock-3.mjs';
import DatabaseZap from 'lucide-react/dist/esm/icons/database-zap.mjs';
import Eye from 'lucide-react/dist/esm/icons/eye.mjs';
import FileCode from 'lucide-react/dist/esm/icons/file-code.mjs';
import Lock from 'lucide-react/dist/esm/icons/lock.mjs';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw.mjs';
import Scale from 'lucide-react/dist/esm/icons/scale.mjs';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check.mjs';
import Target from 'lucide-react/dist/esm/icons/target.mjs';
import type { z } from 'zod';
import type { FeatureSchema, StatSchema } from '@/lib/validation/pageDataValidation';

export const ABOUT_HERO_STATS = [
  {
    icon: Lock,
    value: '0',
    label: 'Salary fields sold',
    description: 'Core calculator interactions stay in-browser',
    color: 'from-primary to-success',
  },
  {
    icon: Scale,
    value: 'HMRC',
    label: 'Rates source',
    description: 'Thresholds are mapped from official UK guidance',
    color: 'from-success to-primary',
  },
  {
    icon: Clock3,
    value: '< 1s',
    label: 'Typical calculation speed',
    description: 'Designed for instant what-if iteration',
    color: 'from-primary to-accent',
  },
  {
    icon: RefreshCw,
    value: 'Fast',
    label: 'Tax-year updates',
    description: 'Single source in `taxRates.ts` for controlled rollouts',
    color: 'from-primary to-accent',
  },
] satisfies z.infer<typeof StatSchema>[];

export const ABOUT_OPERATING_RULES = [
  {
    icon: Target,
    title: 'Accuracy before growth',
    description:
      'If a design idea conflicts with correct tax outcomes, the design idea loses. Accuracy is the product.',
  },
  {
    icon: DatabaseZap,
    title: 'Data minimization by default',
    description:
      'PayeTax is built to answer your question, not build a profile around your salary behaviour.',
  },
  {
    icon: Eye,
    title: 'Explainable outputs',
    description:
      'We focus on showing where each deduction comes from so you can reason about your pay confidently.',
  },
  {
    icon: FileCode,
    title: 'Maintainable tax engine',
    description:
      'Rates live in one place, logic lives in one place, and tests lock behavior so changes are intentional.',
  },
] satisfies z.infer<typeof FeatureSchema>[];

export const ABOUT_TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Privacy-first architecture',
    description:
      'The calculator is designed to process inputs client-side so day-to-day salary exploration does not require account creation.',
    metric: 'Client-side',
    gradient: {
      bg: 'from-primary/10 to-success/10',
      icon: 'text-primary',
      border: 'border-primary/30',
    },
  },
  {
    icon: ChartColumnIncreasing,
    title: 'Useful, not vanity analytics',
    description:
      'Instrumentation focuses on product quality signals while avoiding raw personal salary telemetry in analytics events.',
    metric: 'Signal > noise',
    gradient: {
      bg: 'from-success/10 to-primary/10',
      icon: 'text-success',
      border: 'border-success/30',
    },
  },
  {
    icon: Scale,
    title: 'Transparent tax assumptions',
    description:
      'When constraints exist, we call them out. We would rather show caveats than silently over-claim accuracy.',
    metric: 'No hidden assumptions',
    gradient: {
      bg: 'from-accent/10 to-primary/10',
      icon: 'text-primary',
      border: 'border-primary/30',
    },
  },
] satisfies z.infer<typeof FeatureSchema>[];

export interface AboutComparisonRow {
  topic: string;
  payeTax: string;
  typical: string;
}

export const ABOUT_COMPARISON_ROWS: AboutComparisonRow[] = [
  {
    topic: 'Business model',
    payeTax: 'Free calculator experience with clear optional add-ons',
    typical: 'Heavy ad density or aggressive lead capture for basic use',
  },
  {
    topic: 'Data handling intent',
    payeTax: 'Designed to minimize personal salary data collection',
    typical: 'Incentivized to collect richer audience data for monetization',
  },
  {
    topic: 'Tax logic ownership',
    payeTax: 'Single source of truth in `src/constants/taxRates.ts`',
    typical: 'Rates and copy spread across UI and logic layers',
  },
  {
    topic: 'Explanation quality',
    payeTax: 'Breakdowns and guidance intended for non-specialists',
    typical: 'Output-first calculators with minimal context',
  },
  {
    topic: 'Offline readiness',
    payeTax: 'Installable PWA with offline fallback support',
    typical: 'Browser-only flow with no install guidance',
  },
];

export const ABOUT_BUILD_PROMISES = [
  'Tax rates and thresholds are updated in one source file before release.',
  'Behavior changes are backed by tests that target user-visible outcomes.',
  'Privacy and accessibility are treated as quality requirements, not extras.',
  'When we cannot model an edge case fully, we call that out explicitly.',
];
