// src/app/scenarios/[slug]/page.tsx
/**
 * Dynamic Scenario Page
 *
 * Renders individual tax scenario pages with:
 * - Pre-filled calculator
 * - Summary stats
 * - Explanation content
 * - Related blog posts
 * - FAQ with schema
 */

import { ArrowLeft, BookOpen, Lightbulb } from 'lucide-react';
import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { ICON_SIZES, LAYOUT, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import {
  getAllScenarioSlugs,
  getCategoryInfo,
  getScenarioBySlug,
  type Scenario,
} from '@/data/scenarios';
import { generateMetadata as generateMetadataHelper, SITE_URL } from '@/lib/metadata';
import { cn } from '@/lib/utils';
import { ScenarioPageClient } from './ScenarioPageClient';

// Next.js 16 config
export const dynamic = 'force-static';
export const dynamicParams = false; // Only pre-generated slugs
export const revalidate = 86400; // Daily revalidation

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate static params for all scenarios
 */
export function generateStaticParams() {
  return getAllScenarioSlugs().map((slug) => ({ slug }));
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const scenario = getScenarioBySlug(slug);

  if (!scenario) {
    return {};
  }

  return generateMetadataHelper({
    title: scenario.title,
    description: scenario.description,
    keywords: scenario.searchIntent.join(', '),
    pathname: `/scenarios/${slug}`,
  });
}

/**
 * Generate JSON-LD structured data
 */
function generateStructuredData(scenario: Scenario) {
  const baseUrl = SITE_URL;

  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: scenario.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  // HowTo Schema (if optimization content exists)
  const howToSchema = scenario.optimization
    ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `How to Optimize Tax at £${scenario.salary.toLocaleString('en-GB')} Salary`,
        description: scenario.description,
        step: [
          {
            '@type': 'HowToStep',
            text: 'Enter your salary in the calculator',
          },
          {
            '@type': 'HowToStep',
            text: 'Adjust pension contribution to see impact',
          },
          {
            '@type': 'HowToStep',
            text: 'Review the tax savings calculation',
          },
        ],
      }
    : null;

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Scenarios',
        item: `${baseUrl}/scenarios`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: scenario.title,
        item: `${baseUrl}/scenarios/${scenario.slug}`,
      },
    ],
  };

  return [faqSchema, breadcrumbSchema, howToSchema].filter(Boolean);
}

export default async function ScenarioPage({ params }: PageProps) {
  const { slug } = await params;
  const scenario = getScenarioBySlug(slug);

  if (!scenario) {
    notFound();
  }

  const categoryInfo = getCategoryInfo(scenario.category);
  const structuredData = generateStructuredData(scenario);
  const formattedSalary = scenario.salary.toLocaleString('en-GB');

  // Category-specific colors - default to life-stage styling
  const defaultColors = {
    text: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
  };

  const categoryColors: Record<string, { text: string; bg: string; border: string }> = {
    'tax-trap': {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
    },
    'student-loan': {
      text: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
    },
    scottish: {
      text: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
    },
    'life-stage': defaultColors,
  };

  const colors = categoryColors[scenario.category] ?? defaultColors;

  return (
    <>
      {/* Structured Data */}
      {structuredData.map((schema, index) => (
        <script
          key={`structured-data-${String(schema?.['@type'] ?? index)}`}
          type='application/ld+json'
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe - JSON-LD from our own data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className='min-h-screen bg-background'>
        {/* Hero Section */}
        <section className='relative overflow-hidden py-8 sm:py-12'>
          <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent' />
          <div className={cn(LAYOUT.CONTAINER, 'relative')}>
            {/* Breadcrumbs */}
            <nav className={SPACING.MB_6} aria-label='Breadcrumb'>
              <ol
                className={cn('flex items-center', SPACING.GAP_2, 'text-muted-foreground text-sm')}
              >
                <li>
                  <Link href='/' className='hover:text-primary'>
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href={'/scenarios' as Route} className='hover:text-primary'>
                    Scenarios
                  </Link>
                </li>
                <li>/</li>
                <li className='font-medium text-foreground'>£{formattedSalary}</li>
              </ol>
            </nav>

            {/* Category Badge */}
            {categoryInfo && (
              <div
                className={cn(
                  'inline-flex items-center rounded-full px-3 py-1',
                  SPACING.MB_4,
                  colors.bg,
                  colors.border,
                  'border',
                )}
              >
                <span className='mr-2'>{categoryInfo.icon}</span>
                <span className={cn(TYPOGRAPHY.TEXT_SM, 'font-medium', colors.text)}>
                  {categoryInfo.name}
                </span>
              </div>
            )}

            {/* Title */}
            <h1
              className={cn(
                TYPOGRAPHY.TEXT_3XL,
                'sm:text-4xl',
                'font-bold tracking-tight',
                SPACING.MB_4,
              )}
            >
              {scenario.title}
            </h1>

            {/* Description */}
            <p className={cn(TYPOGRAPHY.TEXT_LG, 'max-w-3xl text-muted-foreground')}>
              {scenario.description}
            </p>
          </div>
        </section>

        {/* Main Content - Client Component for interactivity */}
        <ScenarioPageClient scenario={scenario} />

        {/* Explanation Section */}
        <section className={cn(LAYOUT.CONTAINER, SPACING.PY_12)}>
          <div className='mx-auto max-w-3xl'>
            <div className={cn('flex items-center', SPACING.GAP_3, SPACING.MB_6)}>
              <Lightbulb className={cn(ICON_SIZES.SIZE_6, 'text-primary')} />
              <h2 className={cn(TYPOGRAPHY.TEXT_2XL, 'font-bold')}>Understanding This Scenario</h2>
            </div>

            <div
              className={cn(
                'prose prose-invert max-w-none',
                '[&>p]:mb-4 [&>p]:leading-relaxed',
                '[&>ul]:mb-4 [&>ul]:list-disc [&>ul]:pl-6',
                '[&>ol]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6',
                '[&>li]:mb-2',
              )}
            >
              {scenario.explanation.split('\n\n').map((paragraph) => {
                const paragraphKey = paragraph.slice(0, 50).replace(/\s+/g, '-');
                if (paragraph.startsWith('**') && paragraph.includes(':')) {
                  // It's a heading
                  const parts = paragraph.split(':');
                  const heading = parts[0] ?? '';
                  const rest = parts.slice(1);
                  return (
                    <div key={`explanation-${paragraphKey}`} className={SPACING.MB_4}>
                      <h3 className={cn(TYPOGRAPHY.TEXT_LG, 'font-semibold', SPACING.MB_2)}>
                        {heading.replace(/\*\*/g, '')}:
                      </h3>
                      <p>{rest.join(':')}</p>
                    </div>
                  );
                }
                return (
                  <p key={`explanation-${paragraphKey}`} className='whitespace-pre-line'>
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Optimization Section */}
            {scenario.optimization && (
              <Card className={cn(SPACING.MT_8, SPACING.P_6, colors.border, 'border')}>
                <h3 className={cn(TYPOGRAPHY.TEXT_LG, 'font-semibold', SPACING.MB_4)}>
                  Optimization Strategy
                </h3>
                <div
                  className={cn(
                    'prose prose-invert prose-sm max-w-none',
                    '[&>p]:mb-3 [&>ul]:mb-3 [&>ul]:pl-5',
                    '[&>li]:mb-1',
                  )}
                >
                  {scenario.optimization.split('\n\n').map((paragraph) => {
                    const paragraphKey = paragraph.slice(0, 50).replace(/\s+/g, '-');
                    if (paragraph.startsWith('**')) {
                      return (
                        <p key={`opt-${paragraphKey}`} className='font-semibold'>
                          {paragraph.replace(/\*\*/g, '')}
                        </p>
                      );
                    }
                    if (paragraph.startsWith('- ')) {
                      return (
                        <ul key={`opt-${paragraphKey}`}>
                          {paragraph.split('\n').map((item) => (
                            <li key={item.slice(0, 30)}>{item.replace(/^- /, '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={`opt-${paragraphKey}`} className='whitespace-pre-line'>
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        </section>

        {/* Related Blog Posts */}
        {scenario.relatedBlogSlugs.length > 0 && (
          <section className='bg-muted/30 py-12'>
            <div className={LAYOUT.CONTAINER}>
              <div className={cn('flex items-center', SPACING.GAP_3, SPACING.MB_6)}>
                <BookOpen className={cn(ICON_SIZES.SIZE_6, 'text-primary')} />
                <h2 className={cn(TYPOGRAPHY.TEXT_2XL, 'font-bold')}>Related Guides</h2>
              </div>

              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                {scenario.relatedBlogSlugs.map((blogSlug) => (
                  <Link key={blogSlug} href={`/blog/${blogSlug}`}>
                    <Card
                      className={cn(
                        'h-full transition-colors hover:border-primary/50',
                        SPACING.P_4,
                      )}
                    >
                      <h3 className={cn(TYPOGRAPHY.TEXT_SM, 'line-clamp-2 font-medium')}>
                        {formatBlogTitle(blogSlug)}
                      </h3>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {scenario.faqs.length > 0 && (
          <section className={cn(LAYOUT.CONTAINER, SPACING.PY_12)}>
            <h2 className={cn(TYPOGRAPHY.TEXT_2XL, 'font-bold', SPACING.MB_6)}>
              Frequently Asked Questions
            </h2>

            <div className={cn('mx-auto max-w-3xl', SPACING.SPACE_Y_4)}>
              {scenario.faqs.map((faq) => (
                <Card
                  key={faq.question}
                  className={cn(SPACING.P_5, 'transition-colors hover:border-primary/30')}
                >
                  <h3 className={cn(TYPOGRAPHY.TEXT_BASE, 'font-semibold', SPACING.MB_2)}>
                    {faq.question}
                  </h3>
                  <p className={cn(TYPOGRAPHY.TEXT_SM, 'text-muted-foreground leading-relaxed')}>
                    {faq.answer}
                  </p>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Back to Scenarios */}
        <section className={cn(LAYOUT.CONTAINER, SPACING.PY_8)}>
          <Link
            href={'/scenarios' as Route}
            className={cn(
              'inline-flex items-center',
              SPACING.GAP_2,
              'text-muted-foreground transition-colors hover:text-foreground',
            )}
          >
            <ArrowLeft className='size-4' />
            Back to all scenarios
          </Link>
        </section>
      </div>
    </>
  );
}

/**
 * Format blog slug to readable title
 */
function formatBlogTitle(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/Uk/g, 'UK')
    .replace(/Hmrc/g, 'HMRC')
    .replace(/2025 26/g, '2025-26')
    .replace(/2026/g, '2026');
}
