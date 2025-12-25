// src/app/blog/page.tsx

import type { Metadata } from 'next';
import { getBlogCategories, getBlogPosts, getFeaturedPost } from '@/lib/blog';
import { BlogPageClient } from './BlogPageClient';

// ⚠️ CRITICAL: DO NOT CHANGE THIS CONFIGURATION WITHOUT TESTING
// This config has been carefully tuned for Next.js 15/16 compatibility
// History: force-static broke query params, force-dynamic caused hydration issues
// Current config (dynamicParams: true + revalidate) is the ONLY working solution
// See: BLOG-NAVIGATION-FIX.md for full explanation and testing requirements
// Last verified working: November 13, 2025
// Tests to run before changing: npx playwright test e2e/blog-filtering-pagination.spec.ts
export const revalidate = 3600; // ISR: Revalidate every hour for new posts
export const dynamicParams = true; // Allow dynamic search params - REQUIRED for filtering/pagination

export const metadata: Metadata = {
  title: 'TaxInsights by PayeTax | UK Tax Guidance',
  description:
    'Expert UK tax guides based on official HMRC rates. PAYE, self-assessment, tax planning, and financial insights for 2025-26. Clear explanations, no jargon.',
  keywords:
    'TaxInsights, UK tax blog, PAYE updates, tax insights, UK tax news, tax guidance, self-assessment tips, financial advice',
  alternates: {
    canonical: 'https://payetax.co.uk/blog',
  },
  openGraph: {
    title: 'TaxInsights by PayeTax | UK Tax Guidance',
    description:
      'Clear, actionable UK tax information based on official HMRC rates and guidance. Stay informed with the latest tax news, PAYE updates, self-assessment guides, and practical financial insights.',
    url: 'https://payetax.co.uk/blog',
    type: 'website',
    siteName: 'TaxInsights by PayeTax',
    images: ['/images/blog/taxinsights-og.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TaxInsights by PayeTax',
    description:
      'Clear, actionable UK tax information based on official HMRC rates and guidance. Stay informed with the latest tax news, PAYE updates, and practical financial insights.',
    images: ['/images/blog/taxinsights-og.jpg'],
  },
};

export default async function BlogPage() {
  // Fetch all data in parallel - client handles filtering/pagination
  const [featuredPost, categories, allPosts] = await Promise.all([
    getFeaturedPost(),
    getBlogCategories(),
    getBlogPosts({ pageSize: 1000 }),
  ]);

  return <BlogPageClient featuredPost={featuredPost} categories={categories} allPosts={allPosts} />;
}
