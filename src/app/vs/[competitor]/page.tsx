// src/app/vs/[competitor]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StructuredData } from '@/components/organisms/StructuredData';
import { getAllCompetitorSlugs, getCompetitorBySlug } from '@/data/competitors';
import { generateMetadata as generateMetadataHelper, SITE_URL } from '@/lib/metadata';
import { VsPageContent } from './VsPageContent';

interface PageProps {
  params: Promise<{ competitor: string }>;
}

// Only allow known competitor slugs - 404 for unknown
export const dynamicParams = false;

/**
 * Generate static paths for all competitors
 */
export function generateStaticParams() {
  return getAllCompetitorSlugs().map((slug) => ({
    competitor: slug,
  }));
}

/**
 * Generate metadata for each vs page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { competitor: slug } = await params;
  const competitor = getCompetitorBySlug(slug);

  if (!competitor) {
    return {
      title: 'Not Found | PayeTax',
    };
  }

  const title = `PayeTax vs ${competitor.name} | UK Tax Calculator Comparison`;
  const description = `Compare PayeTax and ${competitor.name} side-by-side. See features, pros, cons, and which UK tax calculator is right for you.`;
  const pathname = `/vs/${slug}`;

  return generateMetadataHelper({
    title,
    description,
    keywords: `payetax vs ${competitor.name.toLowerCase()}, ${competitor.shortName?.toLowerCase() ?? competitor.name.toLowerCase()} comparison, uk tax calculator comparison, paye calculator comparison`,
    pathname,
  });
}

export default async function VsPage({ params }: PageProps) {
  const { competitor: slug } = await params;
  const competitor = getCompetitorBySlug(slug);

  if (!competitor) {
    notFound();
  }

  const pageUrl = `${SITE_URL}/vs/${slug}`;
  const vsFaqs = [
    {
      question: `PayeTax vs ${competitor.name}: which is better?`,
      answer: `It depends on your needs. PayeTax is designed for a fast, privacy-first experience with What-If salary comparisons, while ${competitor.name} may suit users with different feature priorities.`,
    },
    {
      question: `Does PayeTax support official HMRC tax rates?`,
      answer:
        'Yes. PayeTax uses official HMRC rates and thresholds for all supported UK tax years.',
    },
    {
      question: `Can I compare salary scenarios in PayeTax?`,
      answer:
        'Yes. PayeTax includes What-If salary comparison so you can evaluate arbitrary salary changes quickly.',
    },
  ];

  return (
    <>
      <StructuredData
        type='breadcrumb'
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: 'Comparisons', url: `${SITE_URL}/best-uk-tax-calculators` },
          { name: `vs ${competitor.name}`, url: pageUrl },
        ]}
      />
      <StructuredData type='faq' faqs={vsFaqs} />
      <VsPageContent competitor={competitor} />
    </>
  );
}
