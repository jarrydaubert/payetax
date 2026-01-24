// src/app/vs/[competitor]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StructuredData } from '@/components/organisms/StructuredData';
import { getAllCompetitorSlugs, getCompetitorBySlug } from '@/data/competitors';
import { VsPageContent } from './VsPageContent';

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

  return {
    title,
    description,
    keywords: `payetax vs ${competitor.name.toLowerCase()}, ${competitor.shortName.toLowerCase()} comparison, uk tax calculator comparison, paye calculator comparison`,
    alternates: {
      canonical: `https://payetax.co.uk/vs/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://payetax.co.uk/vs/${slug}`,
      type: 'article',
      siteName: 'PayeTax',
    },
    twitter: {
      card: 'summary_large_image',
      title: `PayeTax vs ${competitor.name}`,
      description,
    },
  };
}

export default async function VsPage({ params }: PageProps) {
  const { competitor: slug } = await params;
  const competitor = getCompetitorBySlug(slug);

  if (!competitor) {
    notFound();
  }

  const title = `PayeTax vs ${competitor.name} | UK Tax Calculator Comparison`;
  const description = `Compare PayeTax and ${competitor.name} side-by-side. See features, pros, cons, and which UK tax calculator is right for you.`;

  return (
    <>
      <StructuredData
        type='article'
        articleData={{
          title,
          description,
          url: `https://payetax.co.uk/vs/${slug}`,
          imageUrl: 'https://payetax.co.uk/images/og-image.png',
          publishDate: '2025-01-01T00:00:00Z',
          authorName: 'PayeTax',
        }}
      />
      <StructuredData
        type='breadcrumb'
        breadcrumbs={[
          { name: 'Home', url: 'https://payetax.co.uk' },
          { name: 'Comparisons', url: 'https://payetax.co.uk/best-uk-tax-calculators' },
          { name: `vs ${competitor.name}`, url: `https://payetax.co.uk/vs/${slug}` },
        ]}
      />
      <VsPageContent competitor={competitor} />
    </>
  );
}
