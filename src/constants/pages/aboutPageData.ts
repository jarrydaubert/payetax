/**
 * About Page Data
 *
 * Static content data for the about page, extracted from inline definitions
 * for better maintainability, i18n readiness, and build-time validation.
 *
 * All data is validated via Zod schemas at build time using the `satisfies` pattern.
 *
 * @module constants/pages/aboutPageData
 * @created PAYTAX-109 Phase 4 - Data Extraction
 */

'use client';

import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle.js';
import ArrowLeftRight from 'lucide-react/dist/esm/icons/arrow-left-right.js';
import Award from 'lucide-react/dist/esm/icons/award.js';
import Calculator from 'lucide-react/dist/esm/icons/calculator.js';
import Code from 'lucide-react/dist/esm/icons/code.js';
import Eye from 'lucide-react/dist/esm/icons/eye.js';
import Heart from 'lucide-react/dist/esm/icons/heart.js';
import Lightbulb from 'lucide-react/dist/esm/icons/lightbulb.js';
import Lock from 'lucide-react/dist/esm/icons/lock.js';

import Rocket from 'lucide-react/dist/esm/icons/rocket.js';
import Shield from 'lucide-react/dist/esm/icons/shield.js';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles.js';
import Target from 'lucide-react/dist/esm/icons/target.js';
import Zap from 'lucide-react/dist/esm/icons/zap.js';
import type { z } from 'zod';
import type { FeatureSchema, StatSchema } from '@/lib/validation/pageDataValidation';

/**
 * About page statistics
 * Displayed in StatsGrid component (4 columns)
 */
export const ABOUT_STATS = [
  {
    icon: Calculator,
    value: '100%',
    label: 'Free. No Premium Tiers',
    color: 'from-primary to-accent',
  },
  { icon: Lock, value: '0', label: 'Data Stored', color: 'from-primary/80 to-accent/80' },
  {
    icon: Award,
    value: 'HMRC',
    label: 'Official Rates',
    color: 'from-accent to-primary',
  },
  { icon: Zap, value: '<300kB', label: 'Bundle Size', color: 'from-accent/80 to-primary/80' },
] satisfies z.infer<typeof StatSchema>[];

/**
 * Core values/principles
 * Displayed in FeatureGrid component (2 columns)
 */
export const ABOUT_VALUES = [
  {
    icon: Shield,
    title: 'Privacy is Sacred',
    description:
      "Every calculation runs in your browser. We never see your salary, tax code, or personal details. This isn't a promise — it's technically impossible for us to see it.",
    gradient: {
      bg: 'from-primary/20 to-accent/20',
      icon: 'text-primary',
      border: 'border-primary/20',
    },
  },
  {
    icon: Eye,
    title: 'Radical Transparency',
    description:
      'Our code is public. Our analytics are honest. No tricks, no fees. Just honest tax calculations.',
    gradient: {
      bg: 'from-accent/20 to-primary/20',
      icon: 'text-accent',
      border: 'border-accent/20',
    },
  },
  {
    icon: Target,
    title: 'Accuracy First',
    description:
      'Official HMRC rates updated within 24 hours of changes. Comprehensive testing for Scottish rates, student loans, pensions, and edge cases.',
    gradient: {
      bg: 'from-primary/10 to-accent/10',
      icon: 'text-primary',
      border: 'border-primary/10',
    },
  },
  {
    icon: Heart,
    title: 'Genuinely Free',
    description:
      'No premium tiers, no paywalls, no "upgrade to see more". Every feature is free for everyone, forever. Tax calculations should be accessible to all.',
    gradient: {
      bg: 'from-accent/10 to-primary/10',
      icon: 'text-accent',
      border: 'border-accent/10',
    },
  },
] satisfies z.infer<typeof FeatureSchema>[];

/**
 * Unique differentiating features
 * Displayed in FeatureGrid component (3 columns)
 */
export const ABOUT_UNIQUE_FEATURES = [
  {
    icon: AlertTriangle,
    title: '£100k Tax Trap Detector',
    description:
      "Automatically warns when you're in the 60% effective tax rate zone (£100k-£125k) and shows optimal pension contributions to legally reduce your tax bill.",
    metric: '60%',
    gradient: {
      bg: 'from-amber-500/10 to-orange-500/10',
      icon: 'text-amber-500',
      border: 'border-amber-500/30',
    },
  },
  {
    icon: ArrowLeftRight,
    title: 'What-If Comparisons',
    description:
      'Compare job offers, raises, or "what if I earned X more?" scenarios instantly. See exactly how much of every extra pound you actually keep.',
    metric: 'Instant',
    gradient: {
      bg: 'from-cyan-500/10 to-emerald-500/10',
      icon: 'text-cyan-500',
      border: 'border-cyan-500/30',
    },
  },
  {
    icon: Calculator,
    title: 'Every Deduction Covered',
    description:
      'Student loans (all plans), Scottish tax, pension contributions, marriage allowance, blind allowance — all calculated correctly, all in one place.',
    metric: 'Complete',
    gradient: {
      bg: 'from-purple-500/10 to-pink-500/10',
      icon: 'text-purple-500',
      border: 'border-purple-500/30',
    },
  },
] satisfies z.infer<typeof FeatureSchema>[];

/**
 * Tech stack features
 * Displayed in FeatureGrid component (3 columns)
 */
export const ABOUT_TECH_STACK = [
  {
    icon: Rocket,
    title: 'Next.js 16 & React 19',
    description:
      'Server Components, React Compiler, async request APIs. Built with the latest tech for maximum performance and developer experience.',
  },
  {
    icon: Code,
    title: 'TypeScript Strict Mode',
    description: 'Type-safe calculations mean fewer bugs. Your numbers are right, every time.',
  },
  {
    icon: Sparkles,
    title: 'Modern Development',
    description:
      'Biome for linting/formatting (10/10 strictness), Playwright for E2E testing, Sentry for error monitoring. Professional tooling for a free service.',
  },
  {
    icon: Lightbulb,
    title: 'Zod Validation',
    description:
      'Every input validated at runtime with comprehensive schemas. Type safety meets runtime safety for bulletproof calculations.',
  },
] satisfies z.infer<typeof FeatureSchema>[];
