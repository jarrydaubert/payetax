// src/app/alternatives/[competitor]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StructuredData } from '@/components/organisms/StructuredData';
import { getAllCompetitorSlugs, getCompetitorBySlug } from '@/data/competitors';
import { AlternativePageContent } from './AlternativePageContent';

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

  return {
    title,
    description,
    keywords: `${competitor.name.toLowerCase()} alternative, uk tax calculator alternative, ${competitor.shortName.toLowerCase()} alternative, paye calculator, take home pay calculator`,
    alternates: {
      canonical: `https://payetax.co.uk/alternatives/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://payetax.co.uk/alternatives/${slug}`,
      type: 'article',
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

  const title = `${competitor.name} Alternative | PayeTax UK Tax Calculator`;
  const description = `Looking for an alternative to ${competitor.name}? Compare with PayeTax - modern, ad-free, and privacy-first UK tax calculator with What-If scenarios.`;

  return (
    <>
      <StructuredData
        type='article'
        articleData={{
          title,
          description,
          url: `https://payetax.co.uk/alternatives/${slug}`,
          imageUrl: 'https://payetax.co.uk/images/og-image.png',
          publishDate: '2025-01-01T00:00:00Z',
          authorName: 'PayeTax',
        }}
      />
      <StructuredData
        type='breadcrumb'
        breadcrumbs={[
          { name: 'Home', url: 'https://payetax.co.uk' },
          { name: 'Alternatives', url: 'https://payetax.co.uk/alternatives' },
          {
            name: `${competitor.name} Alternative`,
            url: `https://payetax.co.uk/alternatives/${slug}`,
          },
        ]}
      />
      <AlternativePageContent competitor={competitor} />
    </>
  );
}
