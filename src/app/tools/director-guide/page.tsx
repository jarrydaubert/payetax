// src/app/tools/director-guide/page.tsx

import { DirectorDashboard } from '@/components/organisms/DirectorGuide';
import { StructuredData } from '@/components/organisms/StructuredData';
import { CURRENT_TAX_YEAR_DISPLAY_SHORT } from '@/constants/freshness';
import { generateMetadata as generateBaseMetadata, SITE_URL } from '@/lib/metadata';
import { directorGuideFaqItems } from './faq';

export const metadata = generateBaseMetadata({
  title: `Director Pay Dashboard | Salary & Dividend Calculator ${CURRENT_TAX_YEAR_DISPLAY_SHORT}`,
  description:
    'Free calculator for UK company directors. Compare salary and dividend scenarios and see estimated tax to set aside.',
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

  return (
    <>
      <StructuredData type='breadcrumb' breadcrumbs={breadcrumbItems} />
      <StructuredData type='calculator' data={softwareSchema} />
      <StructuredData type='faq' faqs={directorGuideFaqItems} />
      <StructuredData type='dataset' />
      <DirectorDashboard />
      <section className='border-border/70 border-t bg-background py-12 md:py-16'>
        <div className='container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
          <p className='font-semibold text-primary text-xs uppercase tracking-[0.28em]'>
            Director FAQs
          </p>
          <h2 className='mt-3 font-display font-semibold text-3xl text-foreground leading-tight md:text-4xl'>
            Common director pay questions
          </h2>
          <div className='mt-6 divide-y divide-border border-border border-y'>
            {directorGuideFaqItems.map((item) => (
              <article key={item.question} className='py-5'>
                <h3 className='font-semibold text-foreground text-lg leading-7'>{item.question}</h3>
                <p className='mt-2 text-foreground/75 leading-7'>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
