// src/app/tools/director-guide/page.tsx

import { DirectorDashboard } from '@/components/organisms/DirectorGuide';
import { generateMetadata as generateBaseMetadata, SITE_URL } from '@/lib/metadata';

export const metadata = generateBaseMetadata({
  title: 'Director Pay Dashboard | Salary & Dividend Calculator 2025-26',
  description:
    'Free calculator for UK company directors. Find the optimal salary and dividend mix to minimise tax. See exactly how much to pay yourself and set aside for tax.',
  keywords:
    'director salary calculator, how much can I pay myself, dividend vs salary, limited company tax, director dividends, corporation tax calculator, employer NI, optimal salary',
  pathname: '/tools/director-guide',
});

export default function DirectorGuidePage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: `${SITE_URL}/tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Director Guide',
        item: `${SITE_URL}/tools/director-guide`,
      },
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Director Salary & Dividend Calculator',
    description:
      'Calculate the optimal salary and dividend mix for UK company directors. Shows Corporation Tax, Employer NI, and personal tax to set aside.',
    url: `${SITE_URL}/tools/director-guide`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
    },
  };

  // FAQ schema - uses softer language to avoid over-specific claims that may drift
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the optimal salary for a company director in 2025-26?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A common strategy for single-director companies is to pay salary up to the Personal Allowance threshold. This uses your tax-free allowance while qualifying for State Pension credits. The optimal amount depends on your specific circumstances, including Employment Allowance eligibility.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are dividends better than salary for directors?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Dividends are often more tax-efficient than additional salary because they avoid National Insurance. However, you need company profits to pay dividends, and a minimum salary helps build State Pension credits. The best mix depends on your total income and circumstances.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is Employer NI calculated on director salary?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Employer NI is charged on salary above the Secondary Threshold. Directors use an annual earnings period, so NI is calculated on total annual salary rather than per pay period. Companies eligible for Employment Allowance may offset some or all of this cost.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe - JSON-LD from our own data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe - JSON-LD from our own data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe - JSON-LD from our own data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <DirectorDashboard />
    </>
  );
}
