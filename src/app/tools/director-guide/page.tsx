// src/app/tools/director-guide/page.tsx
import { generateMetadata as generateBaseMetadata } from '@/lib/metadata';
import { DirectorDashboard } from '@/components/organisms/DirectorGuide';

const BASE_URL = 'https://payetax.co.uk';

export const metadata = generateBaseMetadata({
  title: 'How Much Can I Pay Myself? | Director Salary Calculator 2025-26',
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
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: `${BASE_URL}/tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Director Guide',
        item: `${BASE_URL}/tools/director-guide`,
      },
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Director Salary & Dividend Calculator',
    description:
      'Calculate the optimal salary and dividend mix for UK company directors. Shows Corporation Tax, Employer NI, and personal tax to set aside.',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the optimal salary for a company director in 2025-26?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For most directors, £12,570 per year (£1,047/month) is optimal. This uses your full Personal Allowance (tax-free), qualifies you for State Pension credits, while minimising Employer NI.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are dividends better than salary for directors?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Generally yes. Dividends are taxed at 8.75% (basic rate) vs 20% income tax + 8% employee NI + 15% employer NI for salary. However, you need profit to pay dividends, and a small salary builds State Pension credits.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much Employer NI do I pay on director salary?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "In 2025-26, Employer NI is 15% on salary above £5,000. For a £12,570 salary, that's approximately £1,135 per year.",
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
