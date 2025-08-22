// src/app/blog/page.tsx

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getBlogCategories, getBlogPosts, getBlogPostsCount, getFeaturedPost } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'UK Tax Insights & Updates | ToolHubX Blog',
  description:
    'Stay informed with the latest UK tax news, expert guidance, and practical advice for taxpayers. Explore articles on PAYE, self-assessment, tax codes, and more.',
  keywords:
    'UK tax blog, PAYE updates, tax insights, UK tax news, tax guidance, self-assessment tips',
  alternates: {
    canonical: 'https://toolhubx.uk/blog',
  },
  openGraph: {
    title: 'UK Tax Insights & Updates | ToolHubX Blog',
    description: 'Expert tax guidance, practical advice, and the latest updates on UK taxation.',
    url: 'https://toolhubx.uk/blog',
    type: 'website',
    images: ['/images/blog-og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UK Tax Insights & Updates | ToolHubX Blog',
    description: 'Expert tax guidance, practical advice, and the latest updates on UK taxation.',
    images: ['/images/blog-twitter-image.jpg'],
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const currentPage = params.page
    ? Number.parseInt(Array.isArray(params.page) ? params.page[0] : params.page, 10)
    : 1;
  const selectedCategory = params.category
    ? Array.isArray(params.category)
      ? params.category[0]
      : params.category
    : undefined;

  const [posts, featuredPost, categories] = await Promise.all([
    getBlogPosts({
      page: currentPage,
      pageSize: 12,
      category: selectedCategory,
    }),
    getFeaturedPost(),
    getBlogCategories(),
  ]);

  const totalCount = await getBlogPostsCount(selectedCategory);
  const totalPages = Math.ceil(totalCount / 12);

  return (
    <div className="pt-20"> {/* Add top padding to clear fixed navbar */}
      <div className="container mx-auto px-4 py-12">
        {/* Header with back button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calculator
          </Link>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              UK Tax Insights & Updates
            </h1>
            <p className="text-lg text-white max-w-3xl mx-auto">
              Expert guidance, practical advice, and the latest updates on UK taxation.
            </p>
            {selectedCategory && (
              <div className="mt-4">
                <span className="text-small text-white/90">Showing posts in: </span>
                <span className="text-primary font-medium">
                  {categories.find(cat => cat.slug === selectedCategory)?.name || selectedCategory}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/blog"
                className={`px-4 py-2 rounded-full text-small font-medium transition-all duration-200 ${
                  !selectedCategory
                    ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                    : 'glass text-white/90 hover:glass-strong hover:scale-105'
                }`}
              >
                All Posts
                <span className="ml-1 text-caption opacity-75">
                  ({totalCount})
                </span>
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/blog?category=${category.slug}`}
                  className={`px-4 py-2 rounded-full text-small font-medium transition-all duration-200 ${
                    selectedCategory === category.slug
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : 'glass text-white/90 hover:glass-strong hover:scale-105'
                  }`}
                >
                  {category.name}
                  <span className="ml-1 text-caption opacity-75">
                    ({category.count || 0})
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Featured Post */}
        {featuredPost && !selectedCategory && currentPage === 1 && (
          <Link href={`/blog/${featuredPost.slug}`} className="block mb-12">
            <div className="glass-card border border-foreground/10 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 group">
              <div className="glass-card-inner p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 text-caption font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-full uppercase tracking-wide">
                        Featured
                      </span>
                      <span className="text-small text-white/90">
                        {formatDate(featuredPost.publishedAt)}
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-white leading-tight group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-white/90 mb-6 text-lg leading-relaxed">{featuredPost.excerpt}</p>
                    <div className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-lg group transition-colors">
                      <span>Read Article</span>
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                  {featuredPost.image && (
                    <div className="relative h-80 rounded-xl overflow-hidden shadow-lg">
                      <Image
                        src={featuredPost.image}
                        alt={featuredPost.imageAlt || featuredPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {posts.map((post: any) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
                  <article className="glass-card group hover:shadow-2xl hover:border-primary/20 transition-all duration-500 border border-foreground/10 h-full">
                    <div className="glass-card-inner p-6 h-full flex flex-col">
                      {post.image && (
                        <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                          <Image
                            src={post.image}
                            alt={post.imageAlt || post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 text-caption text-primary bg-primary/10 rounded-full font-medium">
                          {post.category}
                        </span>
                        <span className="text-caption text-white/90">
                          {formatDate(post.publishedAt)}
                        </span>
                        {post.readTime && (
                          <span className="text-caption text-white/90">• {post.readTime}</span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white leading-tight group-hover:text-primary transition-colors flex-grow">
                        {post.title}
                      </h3>
                      <p className="text-white mb-4 leading-relaxed text-small line-clamp-3">{post.excerpt}</p>
                      <div className="inline-flex items-center text-primary hover:text-primary/80 font-medium group mt-auto">
                        <span>Read More</span>
                        <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/blog?page=${currentPage - 1}${selectedCategory ? `&category=${selectedCategory}` : ''}`}
                    className="px-4 py-2 glass text-white/90 rounded-lg hover:glass-strong transition-colors"
                  >
                    Previous
                  </Link>
                )}
                
                <span className="px-4 py-2 text-white/90">
                  Page {currentPage} of {totalPages}
                </span>

                {currentPage < totalPages && (
                  <Link
                    href={`/blog?page=${currentPage + 1}${selectedCategory ? `&category=${selectedCategory}` : ''}`}
                    className="px-4 py-2 glass text-white/90 rounded-lg hover:glass-strong transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/90">No blog posts found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
