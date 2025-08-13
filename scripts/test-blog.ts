// scripts/test-blog.ts
/**
 * Test script to verify the blog system is working correctly
 * Run with: npx tsx scripts/test-blog.ts
 */

import { getBlogCategories, getBlogPostBySlug, getBlogPosts, getFeaturedPost } from '@/lib/blog';

async function testBlogSystem() {
  try {
    const _allPosts = await getBlogPosts({ pageSize: 10 });

    const featuredPost = await getFeaturedPost();
    if (featuredPost) {
    } else {
    }

    const postBySlug = await getBlogPostBySlug('understanding-uk-tax-codes');
    if (postBySlug) {
    } else {
    }

    const _categories = await getBlogCategories();
  } catch (_error) {}
}

// Run the tests
testBlogSystem();
