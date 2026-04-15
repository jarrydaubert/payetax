// src/app/tools/director-guide/page.tsx

import { DirectorDashboard } from '@/components/organisms/DirectorGuide';
import { StructuredData } from '@/components/organisms/StructuredData';
import { CURRENT_TAX_YEAR_DISPLAY_SHORT } from '@/constants/freshness';
import { generateMetadata as generateBaseMetadata, SITE_URL } from '@/lib/metadata';

export const metadata = generateBaseMetadata({
  title: `Director Pay Dashboard | Salary & Dividend Calculator ${CURRENT_TAX_YEAR_DISPLAY_SHORT}`,
  description:
    'Free calculator for UK company directors. Compare salary and dividend scenarios and see estimated tax to set aside.',
  keywords:
    'director salary calculator, salary vs dividends, limited company tax, director dividends, corporation tax calculator, employer NI',
  pathname: '/tools/director-guide',
});

export default function DirectorGuidePage() {
  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL },
    { name: 'Tools', url: `${SITE_URL}/tools` },
    { name: 'Director Intelligence', url: `${SITE_URL}/tools/director-guide` },
  ];

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Director Salary & Dividend Calculator',
    description:
      'Compare salary and dividend scenarios for UK company directors. Shows Corporation Tax, Employer NI, and personal tax to set aside.',
    url: `${SITE_URL}/tools/director-guide`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
    },
  } as const;

  // FAQ schema - uses softer language to avoid over-specific claims that may drift
  const faqItems = [
    {
      question: `How do salary and dividends compare for company directors in ${CURRENT_TAX_YEAR_DISPLAY_SHORT}?`,
      answer:
        'Salary uses your Personal Allowance and can help build State Pension credits, while dividends are often taxed at different rates. The right mix depends on profits, Employment Allowance eligibility, and your wider income.',
    },
    {
      question: 'Are dividends better than salary for directors?',
      answer:
        'Dividends can be more tax-efficient than additional salary because they avoid National Insurance. However, dividends must be paid from profits, and salary can help build State Pension credits. The mix depends on your total income and circumstances.',
    },
    {
      question: 'How is Employer NI calculated on director salary?',
      answer:
        'Employer NI is charged on salary above the Secondary Threshold. Directors use an annual earnings period, so NI is calculated on total annual salary rather than per pay period. Companies eligible for Employment Allowance may offset some or all of this cost.',
    },
  ];

  return (
    <>
      <StructuredData type='breadcrumb' breadcrumbs={breadcrumbItems} />
      <StructuredData type='calculator' data={softwareSchema} />
      <StructuredData type='faq' faqs={faqItems} />
      <StructuredData type='dataset' />
      <DirectorDashboard />
    </>
  );
}
