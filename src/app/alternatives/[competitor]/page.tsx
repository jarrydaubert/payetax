// src/app/alternatives/[competitor]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StructuredData } from '@/components/organisms/StructuredData';
import { getAllCompetitorSlugs, getCompetitorBySlug } from '@/data/competitors';
import { generateMetadata as generateMetadataHelper, SITE_URL } from '@/lib/metadata';
import { AlternativePageContent } from './AlternativePageContent';

// Only allow statically generated paths - unknown slugs return 404
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ competitor: string }>;
}

/**
 * Generate static paths for all competitors
 */
export function generateStaticParams() {
  return getAllCompetitorSlugs().map((slug) => ({
    competitor: slug,
  }));
}

/**
 * Generate metadata for each competitor page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { competitor: slug } = await params;
  const competitor = getCompetitorBySlug(slug);

  if (!competitor) {
    return {
      title: 'Not Found | PayeTax',
    };
  }

  const title = `${competitor.name} Alternative | PayeTax UK Tax Calculator`;
  const description = `Looking for an alternative to ${competitor.name}? Compare with PayeTax - a privacy-first UK tax calculator with no display ads and What-If salary comparisons.`;
  const pathname = `/alternatives/${slug}`;

  return generateMetadataHelper({
    title,
    description,
    pathname,
  });
}

export default async function AlternativePage({ params }: PageProps) {
  const { competitor: slug } = await params;
  const competitor = getCompetitorBySlug(slug);

  if (!competitor) {
    notFound();
  }

  const url = `${SITE_URL}/alternatives/${slug}`;
  const competitorBestFor = competitor.bestFor.slice(0, 2).filter(Boolean);
  const competitorBestForText =
    competitorBestFor.length > 0 ? competitorBestFor.join(' or ') : 'its specific feature set';
  const alternativeFaqs = [
    {
      question: `What is a good alternative to ${competitor.name}?`,
      answer: `PayeTax is a strong alternative to ${competitor.name} if you want a clean, mobile-first UK tax calculator with no display ads and What-If salary comparisons.`,
    },
    {
      question: `When should I use ${competitor.name} instead of PayeTax?`,
      answer: `${competitor.name} may be a better fit if you specifically need ${competitorBestForText}.`,
    },
    {
      question: `Does PayeTax use official UK tax rates?`,
      answer:
        'Yes. PayeTax calculations are based on official HMRC rates and thresholds for supported tax years.',
    },
  ];

  return (
    <>
      <StructuredData
        type='breadcrumb'
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: 'Alternatives', url: `${SITE_URL}/alternatives` },
          { name: `${competitor.name} Alternative`, url },
        ]}
      />
      <StructuredData type='faq' faqs={alternativeFaqs} />
      <AlternativePageContent competitor={competitor} />
    </>
  );
}
