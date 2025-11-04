// src/lib/mdx.ts
/**
 * Native Next.js 16 MDX utilities
 * File-system based approach using gray-matter for frontmatter parsing
 * Direct MDX compilation with rehype/remark plugins
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { mdxComponents } from '@/components/blog/mdx-components';
import type { BlogPostFrontmatter } from '@/types/blog';
import { BlogFrontmatterSchema, formatZodErrors } from './validation';

const POSTS_DIRECTORY = path.join(process.cwd(), 'content/blog');

/**
 * Get all MDX files from the blog directory
 */
function getMDXFiles(): string[] {
  if (!fs.existsSync(POSTS_DIRECTORY)) {
    return [];
  }
  return fs.readdirSync(POSTS_DIRECTORY).filter((file) => file.endsWith('.mdx'));
}

/**
 * Read and parse a single MDX file with validation
 */
function readMDXFile(filename: string) {
  const filePath = path.join(POSTS_DIRECTORY, filename);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  // Validate frontmatter with Zod
  const result = BlogFrontmatterSchema.safeParse(data);

  if (!result.success) {
    const errors = formatZodErrors(result.error);
    console.error(`[MDX Validation Error] File: ${filename}`);
    console.error('Validation errors:', errors);
    throw new Error(`Invalid frontmatter in ${filename}:\n${errors.join('\n')}`);
  }

  return {
    frontmatter: { ...result.data, slug: filename.replace(/\.mdx$/, '') } as BlogPostFrontmatter,
    content,
    slug: filename.replace(/\.mdx$/, ''),
  };
}

/**
 * Calculate reading time from content
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Get all blog posts with metadata
 */
export function getAllPosts() {
  const files = getMDXFiles();

  const posts = files.map((filename) => {
    const { frontmatter, content, slug } = readMDXFile(filename);
    const readingTime = calculateReadingTime(content);

    return {
      ...frontmatter,
      slug,
      readingTime,
      wordCount: content.trim().split(/\s+/).length,
      _raw: {
        sourceFilePath: `blog/${filename}`,
        flattenedPath: `blog/${slug}`,
      },
    };
  });

  // Sort by published date (newest first)
  return posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Get a single post by slug
 */
export function getPostBySlug(slug: string) {
  const files = getMDXFiles();
  const filename = files.find((file) => file.replace(/\.mdx$/, '') === slug);

  if (!filename) {
    return null;
  }

  const { frontmatter, content } = readMDXFile(filename);
  const readingTime = calculateReadingTime(content);

  return {
    ...frontmatter,
    slug,
    content,
    readingTime,
    wordCount: content.trim().split(/\s+/).length,
  };
}

/**
 * Compile MDX content to React component
 * Uses Next.js 16 native MDX compilation with rehype/remark plugins
 * Returns the compiled MDX component
 */
export async function compileMDXContent(content: string) {
  const result = await compileMDX({
    source: content,
    components: mdxComponents,
    options: {
      parseFrontmatter: false, // Already parsed with gray-matter
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypePrettyCode,
            {
              theme: 'one-dark-pro',
              keepBackground: false,
              onVisitLine(node: { children: unknown[] }) {
                if (node.children.length === 0) {
                  node.children = [{ type: 'text', value: ' ' }];
                }
              },
              onVisitHighlightedLine(node: { properties: { className: string[] } }) {
                node.properties.className.push('line--highlighted');
              },
              onVisitHighlightedWord(node: { properties: { className: string[] } }) {
                node.properties.className = ['word--highlighted'];
              },
            },
          ],
          [
            rehypeAutolinkHeadings,
            {
              properties: {
                className: ['subheading-anchor'],
                ariaLabel: 'Link to section',
              },
            },
          ],
        ],
      },
    },
  });

  return result.content;
}

/**
 * Get all unique categories from posts
 */
export function getAllCategories() {
  const posts = getAllPosts();
  const categories = new Set(posts.map((post) => post.category));
  return Array.from(categories);
}

/**
 * Get posts by category
 */
export function getPostsByCategory(category: string) {
  const posts = getAllPosts();
  return posts.filter((post) => post.category === category);
}

/**
 * Get all unique tags from posts
 */
export function getAllTags() {
  const posts = getAllPosts();
  const tags = new Set(posts.flatMap((post) => post.tags || []));
  return Array.from(tags);
}

/**
 * Get posts by tag
 */
export function getPostsByTag(tag: string) {
  const posts = getAllPosts();
  return posts.filter((post) => post.tags?.includes(tag));
}

/**
 * Get featured posts
 */
export function getFeaturedPosts(limit?: number) {
  const posts = getAllPosts();
  const featured = posts.filter((post) => post.featured === true);
  return limit ? featured.slice(0, limit) : featured;
}
