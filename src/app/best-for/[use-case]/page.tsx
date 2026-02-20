// src/app/best-for/[use-case]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StructuredData } from '@/components/organisms/StructuredData';
import { getAllUseCaseSlugs, getUseCaseBySlug } from '@/data/useCases';
import { generateMetadata as generateMetadataHelper, SITE_URL } from '@/lib/metadata';
import { UseCasePageContent } from './UseCasePageContent';

interface PageProps {
  params: Promise<{ 'use-case': string }>;
}

/**
 * Generate static paths for all use cases
 */
export function generateStaticParams() {
  return getAllUseCaseSlugs().map((slug) => ({
    'use-case': slug,
  }));
}

/**
 * Generate metadata for each use case page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { 'use-case': slug } = await params;
  const useCase = getUseCaseBySlug(slug);

  if (!useCase) {
    return {
      title: 'Not Found | PayeTax',
    };
  }

  const title = useCase.title.includes('PayeTax') ? useCase.title : `${useCase.title} | PayeTax`;
  return generateMetadataHelper({
    title,
    description: useCase.description,
    keywords: useCase.searchIntent.join(', '),
    pathname: `/best-for/${slug}`,
    type: 'article',
    section: 'Best For',
    tags: useCase.searchIntent,
  });
}

export default async function UseCasePage({ params }: PageProps) {
  const { 'use-case': slug } = await params;
  const useCase = getUseCaseBySlug(slug);

  if (!useCase) {
    notFound();
  }

  return (
    <>
      <StructuredData
        type='breadcrumb'
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: 'Best For', url: `${SITE_URL}/best-for` },
          { name: useCase.title, url: `${SITE_URL}/best-for/${slug}` },
        ]}
      />
      <StructuredData
        type='calculator'
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: `${useCase.audience} Tax Calculator`,
          url: `${SITE_URL}/best-for/${slug}`,
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'GBP',
          },
          description: useCase.description,
        }}
      />
      <StructuredData type='faq' faqs={useCase.faqs} />
      <UseCasePageContent useCase={useCase} />
    </>
  );
}
