/**
 * Tools Directory Data
 *
 * Single source of truth for the PayeTax tool list, shared by the `/tools`
 * index page and the homepage Tools directory section so they never drift.
 */

import type { LucideIcon } from 'lucide-react';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase.mjs';
import HeartHandshake from 'lucide-react/dist/esm/icons/heart-handshake.mjs';
import MapPin from 'lucide-react/dist/esm/icons/map-pin.mjs';
import ScanLine from 'lucide-react/dist/esm/icons/scan-line.mjs';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check.mjs';

export interface ToolLink {
  /** Internal route to the tool */
  href: string;
  /** Tool name */
  title: string;
  /** One-line description of what the tool does */
  description: string;
  /** Lucide icon representing the tool */
  icon: LucideIcon;
}

export const TOOLS: ToolLink[] = [
  {
    href: '/tools/director-guide',
    title: 'Director Intelligence',
    description: 'Salary vs dividends optimizer for UK limited company directors.',
    icon: Briefcase,
  },
  {
    href: '/tools/tax-code-decoder',
    title: 'Tax Code Decoder',
    description: 'Decode HMRC tax codes (1257L, BR, D0, K codes, etc.).',
    icon: ScanLine,
  },
  {
    href: '/tools/scottish-tax-calculator',
    title: 'Scottish Tax Calculator',
    description: 'Calculate take-home using Scotland’s income tax bands.',
    icon: MapPin,
  },
  {
    href: '/tools/national-insurance-calculator',
    title: 'National Insurance Calculator',
    description: 'Employee and employer NI breakdown by tax year.',
    icon: ShieldCheck,
  },
  {
    href: '/tools/marriage-allowance-calculator',
    title: 'Marriage Allowance Calculator',
    description: 'Check eligibility and estimate the savings.',
    icon: HeartHandshake,
  },
];
