// src/lib/mdx.ts
/**
 * Native Next.js 16 MDX utilities
 * File-system based approach using gray-matter for frontmatter parsing
 * Direct MDX compilation with rehype/remark plugins
 * OPTIMIZED: Cache Components, performance monitoring, and efficient syntax highlighting
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { cacheLife, cacheTag } from 'next/cache';
import { compileMDX } from 'next-mdx-remote/rsc';
import type { ReactNode } from 'react';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
// Note: rehypeAutolinkHeadings removed - custom heading components in mdx-components.tsx
// already render anchor links with Hash icons, so using both creates duplicates
import remarkGfm from 'remark-gfm';
import { mdxComponents } from '@/components/molecules/mdx-components';
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

  // Sort by published date (newest first) - use spread to avoid mutation
  return [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
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
 * Optimized rehype-pretty-code configuration for better performance
 * PAYTAX-77: Reduced complexity while maintaining quality syntax highlighting
 */
const REHYPE_PRETTY_CODE_OPTIONS = {
  theme: 'one-dark-pro',
  keepBackground: false,
  // OPTIMIZATION: Simplified line/word highlighting for better performance
  onVisitLine(node: { children: unknown[] }) {
    // Prevent empty lines from collapsing
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
} as const;

/**
 * Internal MDX compilation function
 * Separated for better testability and caching
 * Returns the rendered MDX content
 */
async function compileMDXInternal(content: string): Promise<ReactNode> {
  const result = await compileMDX({
    source: content,
    components: mdxComponents,
    options: {
      parseFrontmatter: false, // Already parsed with gray-matter
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug, // Adds id attributes to headings
          [rehypePrettyCode, REHYPE_PRETTY_CODE_OPTIONS],
          // Note: rehypeAutolinkHeadings intentionally omitted
          // Custom heading components in mdx-components.tsx handle anchor links
        ],
      },
    },
  });

  return result.content;
}

const BLOG_CACHE_PROFILE = { stale: 600, revalidate: 3600, expire: 86400 } as const;

async function getCachedCompiledMDX(slug: string, _updatedAt: string): Promise<ReactNode | null> {
  'use cache';
  cacheLife(BLOG_CACHE_PROFILE);
  cacheTag('blog', `blog-mdx:${slug}`);

  const post = getPostBySlug(slug);

  if (!post) {
    return null;
  }

  return await compileMDXInternal(post.content);
}

/**
 * Compile MDX content to React component
 * Uses Next.js 16 native MDX compilation with rehype/remark plugins
 * Returns the compiled MDX component
 */
export async function compileMDXContent(
  content: string,
  cacheKey?: { slug: string; updatedAt: string },
): Promise<ReactNode> {
  // Development: Performance monitoring
  const startTime = process.env.NODE_ENV === 'development' ? performance.now() : 0;

  let result: ReactNode | null;

  if (cacheKey) {
    try {
      result = await getCachedCompiledMDX(cacheKey.slug, cacheKey.updatedAt);
    } catch {
      result = null;
    }
  } else {
    result = null;
  }

  if (!result) {
    result = await compileMDXInternal(content);
  }

  // Development: Log performance metrics
  if (process.env.NODE_ENV === 'development' && startTime > 0) {
    const duration = performance.now() - startTime;
    // Performance monitoring - allowed in development
    // biome-ignore lint/suspicious/noConsole: Development performance monitoring
    console.log(`[MDX] Compilation took ${duration.toFixed(2)}ms`);
  }

  return result;
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

/**
 * FAQ item structure for schema.org markup
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export interface HowToStepItem {
  name: string;
  text: string;
}

/**
 * Extract FAQ sections from MDX content for schema.org FAQPage markup
 * Parses markdown to find FAQ headings and their answers
 *
 * Supported patterns:
 * - ### or #### Question (with or without ?)
 * - **Question** (with or without ?)
 * - FAQ sections with headers like "Frequently Asked Questions"
 * - Optional blank line between question and answer
 */
export function extractFAQs(content: string): FAQItem[] {
  const faqs: FAQItem[] = [];
  const seenQuestions = new Set<string>();

  // Find FAQ section - look for common FAQ header patterns
  const faqSectionRegex =
    /(?:^#{1,3}\s*(?:FAQ|Frequently Asked Questions|Common Questions)[^\n]*\n)([\s\S]*?)(?=^#{1,2}\s[^#]|$)/gim;
  const faqSections = content.match(faqSectionRegex);

  if (faqSections) {
    for (const section of faqSections) {
      // Pattern 1: ### or #### Question (optional ?) followed by answer
      // Allows optional blank line between heading and answer
      const headingPattern =
        /^#{3,4}\s*(.+?)\s*\n(?:\n)?([\s\S]*?)(?=\n#{3,4}\s|\n---|\n#{1,2}\s[^#]|$)/gm;
      let match = headingPattern.exec(section);
      while (match) {
        const questionMatch = match[1];
        const answerMatch = match[2];
        if (questionMatch && answerMatch) {
          const question = questionMatch.trim();
          const answer = cleanMarkdownForSchema(answerMatch.trim());
          if (question && answer && !seenQuestions.has(question.toLowerCase())) {
            seenQuestions.add(question.toLowerCase());
            faqs.push({ question, answer });
          }
        }
        match = headingPattern.exec(section);
      }
    }
  }

  // Also look for bold question patterns throughout the document
  // Pattern: **Question** (optional ?) followed by answer
  // Allows optional blank line between question and answer
  const boldQuestionPattern =
    /^\*\*([^*]+?)\*\*\s*\n(?:\n)?([\s\S]*?)(?=\n\*\*[^*]+\*\*|\n#{2,4}\s|$)/gm;
  let boldMatch = boldQuestionPattern.exec(content);
  while (boldMatch) {
    const questionMatch = boldMatch[1];
    const answerMatch = boldMatch[2];
    if (questionMatch && answerMatch) {
      const question = questionMatch.trim();
      const answer = cleanMarkdownForSchema(answerMatch.trim());
      if (question && answer && !seenQuestions.has(question.toLowerCase())) {
        seenQuestions.add(question.toLowerCase());
        faqs.push({ question, answer });
      }
    }
    boldMatch = boldQuestionPattern.exec(content);
  }

  return faqs;
}

const HOW_TO_STEP_MIN_COUNT = 3;
const HOW_TO_STEP_MAX_COUNT = 12;
const HOW_TO_STEP_MAX_LENGTH = 300;

/**
 * Extract HowTo steps from MDX content for schema.org HowTo markup
 *
 * Supported patterns:
 * - ### Step 1: Do something
 * - **Step 1: Do something**
 * - **Step 1**: Do something
 * - Step 1: Do something
 */
export function extractHowToSteps(content: string): HowToStepItem[] {
  const lines = content.split('\n');
  const steps: HowToStepItem[] = [];
  const seenSteps = new Set<string>();

  let currentStep: { name: string; textLines: string[] } | null = null;

  const pushStep = () => {
    if (!currentStep) return;

    const name = currentStep.name.trim();
    const text = cleanMarkdownForSchema(
      currentStep.textLines.join('\n').trim(),
      HOW_TO_STEP_MAX_LENGTH,
    );
    const finalText = text || name;
    const dedupeKey = name.toLowerCase();

    if (name && !seenSteps.has(dedupeKey)) {
      seenSteps.add(dedupeKey);
      steps.push({ name, text: finalText });
    }

    currentStep = null;
  };

  const getStepName = (line: string): string | null => {
    const headingMatch = line.match(/^#{3,4}\s*Step\s*\d+:\s*(.+?)\s*$/i);
    if (headingMatch?.[1]) return headingMatch[1].trim();

    const boldInlineMatch = line.match(/^\*\*Step\s*\d+:\s*(.+?)\*\*\s*$/i);
    if (boldInlineMatch?.[1]) return boldInlineMatch[1].trim();

    const boldColonOutsideMatch = line.match(/^\*\*Step\s*\d+\*\*:\s*(.+?)\s*$/i);
    if (boldColonOutsideMatch?.[1]) return boldColonOutsideMatch[1].trim();

    const plainMatch = line.match(/^Step\s*\d+:\s*(.+?)\s*$/i);
    if (plainMatch?.[1]) return plainMatch[1].trim();

    return null;
  };

  for (const line of lines) {
    const stepName = getStepName(line);
    if (stepName) {
      pushStep();
      currentStep = { name: stepName, textLines: [] };
      continue;
    }

    if (currentStep) {
      if (/^##\s+/.test(line)) {
        pushStep();
        continue;
      }

      currentStep.textLines.push(line);
    }
  }

  pushStep();

  if (steps.length < HOW_TO_STEP_MIN_COUNT) {
    return [];
  }

  return steps.slice(0, HOW_TO_STEP_MAX_COUNT);
}

/** Google recommends FAQ answers under 320 characters for best display */
const FAQ_ANSWER_MAX_LENGTH = 320;

/**
 * Clean markdown content for use in schema.org structured data
 * Removes formatting while preserving readable text
 */
function cleanMarkdownForSchema(text: string, maxLength = FAQ_ANSWER_MAX_LENGTH): string {
  const cleaned = text
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`[^`]+`/g, '')
    // Remove bold/italic
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Remove blockquotes marker
    .replace(/^>\s*/gm, '')
    // Remove list markers
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // Collapse multiple newlines to single space
    .replace(/\n+/g, ' ')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();

  // Limit length for schema, try to break at word boundary
  if (cleaned.length <= maxLength) return cleaned;

  const truncated = cleaned.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > maxLength * 0.8 ? `${truncated.slice(0, lastSpace)}...` : `${truncated}...`;
}
