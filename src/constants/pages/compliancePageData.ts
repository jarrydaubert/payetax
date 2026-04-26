/**
 * Compliance Page Data
 *
 * Static content data for the compliance page, extracted from inline definitions
 * for better maintainability, i18n readiness, and build-time validation.
 *
 * Note: Compliance data has custom structures that don't map to existing schemas.
 * These are specialized domain-specific data structures.
 *
 * @module constants/pages/compliancePageData
 * @created PAYTAX-109 Phase 4 - Data Extraction
 */

import type { LucideIcon } from 'lucide-react';
import Award from 'lucide-react/dist/esm/icons/award.mjs';
import Calendar from 'lucide-react/dist/esm/icons/calendar.mjs';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle.mjs';
import FileText from 'lucide-react/dist/esm/icons/file-text.mjs';
import Shield from 'lucide-react/dist/esm/icons/shield.mjs';
import { RATES_LAST_VERIFIED } from '@/constants/freshness';
import {
  HMRC_INCOME_TAX_RATES_URL,
  HMRC_STUDENT_LOAN_REPAYMENT_URL,
  ONS_ASHE_URL,
  REVENUE_SCOTLAND_INCOME_TAX_URL,
} from '@/constants/sources';

/**
 * Compliance feature interface
 */
interface ComplianceFeature {
  title: string;
  description: string;
  details: string[];
  icon: LucideIcon;
  lastUpdated: string;
  source: string;
  color: string;
}

/**
 * Compliance statement interface
 */
interface ComplianceStatement {
  category: string;
  statement: string;
  verification: string;
  lastVerified: string;
}

/**
 * Data source interface
 */
interface DataSource {
  source: string;
  description: string;
  url: string;
  lastAccessed: string;
  reliability: string;
}

const COMPLIANCE_LAST_REVIEWED = RATES_LAST_VERIFIED;

/**
 * HMRC compliance features and certifications
 * Displayed as feature cards on compliance page
 */
const COMPLIANCE_FEATURES: ComplianceFeature[] = [
  {
    title: 'Official HMRC Tax Tables',
    description:
      'All calculations use official HMRC tax rates and thresholds published for each tax year',
    details: [
      'Income tax bands and rates verified against HMRC publications',
      'National Insurance rates updated for Class 1 contributions',
      'Student loan thresholds for all plan types (1, 2, 4, 5, Postgraduate)',
      'Scottish tax rates independently verified against Revenue Scotland',
    ],
    icon: FileText,
    lastUpdated: COMPLIANCE_LAST_REVIEWED,
    source: 'HMRC Gov.UK Publications',
    color: 'from-primary to-accent',
  },
  {
    title: 'Formula Verification',
    description: 'Calculation formulas verified against official HMRC examples and test cases',
    details: [
      'Tested against HMRC published example calculations',
      'Formulas match official PAYE calculation methods',
      'Edge cases validated against gov.uk guidance',
      'Open source — anyone can check our maths',
    ],
    icon: Shield,
    lastUpdated: COMPLIANCE_LAST_REVIEWED,
    source: 'HMRC Example Calculations',
    color: 'from-accent to-primary',
  },
  {
    title: 'Regular Updates',
    description: 'Tax rates and thresholds updated immediately when HMRC announces changes',
    details: [
      'Autumn Budget updates within 24 hours',
      'Spring Statement changes applied same day',
      'Emergency rate changes implemented immediately',
      'Historical rates maintained for comparison',
    ],
    icon: Calendar,
    lastUpdated: COMPLIANCE_LAST_REVIEWED,
    source: 'HMRC Announcements',
    color: 'from-primary/80 to-accent/80',
  },
  {
    title: 'Quality Assurance',
    description:
      'Multi-layer testing and validation ensures calculation accuracy across all scenarios',
    details: [
      'Automated testing against HMRC examples',
      'Manual verification of edge cases',
      'Cross-platform calculation consistency',
      'Professional user feedback integration',
    ],
    icon: Shield,
    lastUpdated: COMPLIANCE_LAST_REVIEWED,
    source: 'Internal QA Process',
    color: 'from-accent/80 to-primary/80',
  },
];

/**
 * Specific HMRC compliance statements
 * Legal/regulatory compliance declarations
 */
const COMPLIANCE_STATEMENTS: ComplianceStatement[] = [
  {
    category: 'Tax Rate Accuracy',
    statement:
      'All tax rates are sourced directly from official HMRC publications and updated within 24 hours of any announced changes.',
    verification: 'Verified against HMRC Income Tax rates and allowances (ITTOIA 2005)',
    lastVerified: COMPLIANCE_LAST_REVIEWED,
  },
  {
    category: 'National Insurance Compliance',
    statement:
      'National Insurance calculations follow official HMRC guidance for Class 1 contributions including current rates and thresholds.',
    verification: 'Compliant with National Insurance Contributions Act 2014 and subsequent updates',
    lastVerified: COMPLIANCE_LAST_REVIEWED,
  },
  {
    category: 'Student Loan Accuracy',
    statement:
      'Student loan calculations are accurate for all current repayment plans as defined by the Student Loans Company.',
    verification: 'Verified against SLC guidance and HMRC PAYE procedures',
    lastVerified: COMPLIANCE_LAST_REVIEWED,
  },
  {
    category: 'Scottish Tax Compliance',
    statement:
      'Scottish tax calculations use official rates published by Revenue Scotland and Scottish Government.',
    verification: 'Compliant with Scotland Act 2016 and Scottish Rate Resolution',
    lastVerified: COMPLIANCE_LAST_REVIEWED,
  },
];

/**
 * Data sources and references
 * Official sources used for calculations
 */
const DATA_SOURCES: DataSource[] = [
  {
    source: 'HM Revenue & Customs',
    description: 'Official UK tax authority providing tax rates, allowances, and guidance',
    url: HMRC_INCOME_TAX_RATES_URL,
    lastAccessed: COMPLIANCE_LAST_REVIEWED,
    reliability: 'Official Government Source',
  },
  {
    source: 'Revenue Scotland',
    description: 'Official Scottish tax authority for devolved Scottish income tax rates',
    url: REVENUE_SCOTLAND_INCOME_TAX_URL,
    lastAccessed: COMPLIANCE_LAST_REVIEWED,
    reliability: 'Official Government Source',
  },
  {
    source: 'Student Loans Company',
    description: 'Official body managing student loans and repayment thresholds',
    url: HMRC_STUDENT_LOAN_REPAYMENT_URL,
    lastAccessed: COMPLIANCE_LAST_REVIEWED,
    reliability: 'Official Government Source',
  },
  {
    source: 'Office for National Statistics',
    description: 'UK national statistics including inflation rates and economic data',
    url: ONS_ASHE_URL,
    lastAccessed: COMPLIANCE_LAST_REVIEWED,
    reliability: 'Official Government Source',
  },
];

/**
 * Compliance stats for StatsGrid component
 * Shows key compliance metrics
 */
const complianceStats = [
  {
    icon: CheckCircle,
    value: '100%',
    label: 'HMRC Rates',
    description: 'All rates sourced from official publications',
    color: 'from-primary to-accent',
  },
  {
    icon: Shield,
    value: '24hrs',
    label: 'Update Time',
    description: 'New rates applied within 24 hours of announcement',
    color: 'from-accent to-primary',
  },
  {
    icon: Award,
    value: '4+',
    label: 'Years Data',
    description: 'Historical rates back to 2020/21 tax year',
    color: 'from-primary to-accent',
  },
];

export { COMPLIANCE_FEATURES, COMPLIANCE_STATEMENTS, complianceStats, DATA_SOURCES };
