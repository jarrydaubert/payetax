// src/app/alternatives/[competitor]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StructuredData } from '@/components/organisms/StructuredData';
import { getAllCompetitorSlugs, getCompetitorBySlug } from '@/data/competitors';
import { AlternativePageContent } from './AlternativePageContent';

const SITE_URL = 'https://payetax.co.uk';

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
  const description = `Looking for an alternative to ${competitor.name}? Compare with PayeTax - modern, ad-free, and privacy-first UK tax calculator with What-If scenarios.`;
  const url = `${SITE_URL}/alternatives/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'PayeTax',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${competitor.name} Alternative`,
      description,
    },
  };
}

export default async function AlternativePage({ params }: PageProps) {
  const { competitor: slug } = await params;
  const competitor = getCompetitorBySlug(slug);

  if (!competitor) {
    notFound();
  }

  const url = `${SITE_URL}/alternatives/${slug}`;

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
      <AlternativePageContent competitor={competitor} />
    </>
  );
}
