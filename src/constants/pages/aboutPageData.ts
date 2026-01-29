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
import BookOpen from 'lucide-react/dist/esm/icons/book-open.js';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase.js';
import Calculator from 'lucide-react/dist/esm/icons/calculator.js';
import Code from 'lucide-react/dist/esm/icons/code.js';
import Eye from 'lucide-react/dist/esm/icons/eye.js';
import FileSearch from 'lucide-react/dist/esm/icons/file-search.js';
import Heart from 'lucide-react/dist/esm/icons/heart.js';
import Lightbulb from 'lucide-react/dist/esm/icons/lightbulb.js';
import Lock from 'lucide-react/dist/esm/icons/lock.js';
import Mail from 'lucide-react/dist/esm/icons/mail.js';
import MapPin from 'lucide-react/dist/esm/icons/map-pin.js';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw.js';
import Rocket from 'lucide-react/dist/esm/icons/rocket.js';
import Shield from 'lucide-react/dist/esm/icons/shield.js';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles.js';
import Target from 'lucide-react/dist/esm/icons/target.js';
import Users from 'lucide-react/dist/esm/icons/users.js';
import WifiOff from 'lucide-react/dist/esm/icons/wifi-off.js';
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
      'You can see exactly how we calculate your tax — our code is public. No hidden fees, no surprise upgrades. What you see is what you get.',
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
    icon: Briefcase,
    title: 'Director Pay Dashboard',
    description:
      'Full salary vs dividends calculator for company directors. Find your optimal extraction strategy with Corporation Tax, Employer NI, and dividend tax all calculated.',
    metric: 'Optimal',
    gradient: {
      bg: 'from-emerald-500/10 to-cyan-500/10',
      icon: 'text-emerald-500',
      border: 'border-emerald-500/30',
    },
  },
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
    icon: FileSearch,
    title: 'Tax Code Decoder',
    description:
      'Enter any UK tax code and get a plain-English explanation. Understand what 1257L, BR, K codes, and Scottish prefixes actually mean for your pay.',
    metric: 'Decoded',
    gradient: {
      bg: 'from-blue-500/10 to-indigo-500/10',
      icon: 'text-blue-500',
      border: 'border-blue-500/30',
    },
  },
  {
    icon: MapPin,
    title: 'Scottish Tax Calculator',
    description:
      'Side-by-side comparison of Scottish vs English tax rates. See exactly how much more (or less) you pay living in Scotland with the same salary.',
    metric: '6 Bands',
    gradient: {
      bg: 'from-sky-500/10 to-blue-500/10',
      icon: 'text-sky-500',
      border: 'border-sky-500/30',
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
  {
    icon: BookOpen,
    title: 'Educational Tax Guides',
    description:
      'In-depth articles on director pay strategies, the £100k tax trap, student loan repayments, and more. Written in plain English, not accountant-speak.',
    metric: '20+',
    gradient: {
      bg: 'from-violet-500/10 to-purple-500/10',
      icon: 'text-violet-500',
      border: 'border-violet-500/30',
    },
  },
  {
    icon: Mail,
    title: 'Email Your Results',
    description:
      'Send your full tax breakdown to yourself for reference. Your data goes straight to your inbox — private, secure, and entirely yours.',
    metric: 'Private',
    gradient: {
      bg: 'from-rose-500/10 to-pink-500/10',
      icon: 'text-rose-500',
      border: 'border-rose-500/30',
    },
  },
  {
    icon: Users,
    title: 'Marriage Allowance Calculator',
    description:
      "Check if you're eligible and see exactly how much you could save — up to £252 per year. Transfer 10% of your Personal Allowance to your spouse in seconds.",
    metric: '£252',
    gradient: {
      bg: 'from-pink-500/10 to-rose-500/10',
      icon: 'text-pink-500',
      border: 'border-pink-500/30',
    },
  },
] satisfies z.infer<typeof FeatureSchema>[];

/**
 * Tech stack features (user-focused benefits)
 * Displayed in FeatureGrid component (3 columns)
 */
export const ABOUT_TECH_STACK = [
  {
    icon: Rocket,
    title: 'Lightning Fast',
    description:
      'Results appear instantly, no waiting. Built with the same technology used by Vercel, Netflix, and other performance-obsessed companies.',
  },
  {
    icon: Code,
    title: 'Bulletproof Calculations',
    description:
      'Every calculation is type-checked and validated. The same rigour banks use for financial software, applied to your tax calculator.',
  },
  {
    icon: Sparkles,
    title: 'Tested to Breaking Point',
    description:
      'Automated tests run hundreds of tax scenarios before every update. Edge cases, Scottish rates, student loans — all verified against HMRC.',
  },
  {
    icon: Lightbulb,
    title: 'Catches Your Mistakes',
    description:
      "Entered £1,000,000 instead of £100,000? We'll spot it. Input validation prevents errors before they happen, so you always get accurate results.",
  },
  {
    icon: RefreshCw,
    title: 'Always Up-to-Date',
    description:
      'HMRC rates updated within 24 hours of any changes. Budget announcements, threshold updates, new tax year rates — reflected immediately.',
  },
  {
    icon: WifiOff,
    title: 'Works Offline',
    description:
      'Installed as an app on your phone or laptop, PayeTax works without internet. Calculate your tax on the train, on a plane, anywhere.',
  },
] satisfies z.infer<typeof FeatureSchema>[];
