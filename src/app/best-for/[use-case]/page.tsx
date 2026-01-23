// src/app/best-for/[use-case]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllUseCaseSlugs, getUseCaseBySlug } from '@/data/useCases';
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

  const title = useCase.title;
  const description = useCase.description;

  return {
    title,
    description,
    keywords: useCase.searchIntent.join(', '),
    alternates: {
      canonical: `https://payetax.co.uk/best-for/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://payetax.co.uk/best-for/${slug}`,
      type: 'article',
      siteName: 'PayeTax',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function UseCasePage({ params }: PageProps) {
  const { 'use-case': slug } = await params;
  const useCase = getUseCaseBySlug(slug);

  if (!useCase) {
    notFound();
  }

  return <UseCasePageContent useCase={useCase} />;
}
