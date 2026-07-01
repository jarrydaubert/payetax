#!/usr/bin/env bun
/**
 * Blog inventory and refresh queue.
 *
 * This is intentionally non-blocking by default. It helps plan blog image and
 * content refresh batches without turning an in-progress editorial cleanup into
 * a CI failure. Use `--strict` when you want missing/duplicate/bad image assets
 * to fail the command.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { BLOG_CATEGORIES } from '../src/config/blog.config';
import { CURRENT_TAX_YEAR, formatTaxYearDisplay } from '../src/constants/taxRates';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BLOG_DIR = join(ROOT, 'content/blog');
const BLOG_IMAGE_PUBLIC_PREFIX = '/images/blog/';
const BLOG_IMAGE_DIR = join(ROOT, 'public/images/blog');
const TARGET_IMAGE_WIDTH = 1600;
const TARGET_IMAGE_HEIGHT = 1000;

const args = new Set(process.argv.slice(2));
const strict = args.has('--strict');

const categorySlugs = new Set(BLOG_CATEGORIES.map((category) => category.slug));

type ImageSize = {
  width: number;
  height: number;
};

type BlogAuditEntry = {
  slug: string;
  file: string;
  title: string;
  category: string;
  image?: string;
  imageAlt?: string;
  imageSize?: ImageSize;
  wordCount: number;
  bodyStatusLine?: string;
  earlyHorizontalRules: number;
  flags: string[];
};

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function getBlogFiles(): string[] {
  return readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith('.mdx'))
    .sort((a, b) => a.localeCompare(b));
}

function getImageAbsPath(publicImagePath: string): string {
  return join(ROOT, 'public', publicImagePath.replace(/^\//, ''));
}

function getImageSize(imagePath: string): ImageSize | undefined {
  if (!existsSync(imagePath)) return undefined;

  try {
    const output = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', imagePath], {
      encoding: 'utf8',
    });
    const widthMatch = output.match(/pixelWidth:\s*(\d+)/);
    const heightMatch = output.match(/pixelHeight:\s*(\d+)/);

    const widthValue = widthMatch?.[1];
    const heightValue = heightMatch?.[1];
    if (!(widthValue && heightValue)) return undefined;

    return {
      width: Number.parseInt(widthValue, 10),
      height: Number.parseInt(heightValue, 10),
    };
  } catch {
    return undefined;
  }
}

function findBodyStatusLine(content: string): string | undefined {
  const earlyLines = content
    .trimStart()
    .split(/\r?\n/)
    .slice(0, 10)
    .map((line) => line.trim());

  return earlyLines.find((line) => /\*\*(?:Last Updated|Tax Year|Policy status)\*\*/i.test(line));
}

function countEarlyHorizontalRules(content: string): number {
  return content
    .trimStart()
    .split(/\r?\n/)
    .slice(0, 120)
    .filter((line) => line.trim() === '---').length;
}

function countWords(content: string): number {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

function hasPreviousTaxYearSignal(content: string): boolean {
  return /\b2025[-/](?:26|2026)\b|\b2025 to 2026\b|\b2025-2026\b/i.test(content);
}

function hasCurrentTaxYearSignal(content: string): boolean {
  return /\b2026[-/](?:27|2027)\b|\b2026 to 2027\b|\b2026-2027\b/i.test(content);
}

function hasAmericanSpelling(content: string): boolean {
  return /\b(?:optimi[sz](?:e|ed|ing|ation)|maximi[sz](?:e|ed|ing|ation)|advisor)\b/i.test(content);
}

function hasOldImageStyleSignal(imageAlt: string | undefined): boolean {
  if (!imageAlt) return false;
  return /\b(?:isometric|glow|floating|maze|smartphone|icon|chart|complete guide|explained|official|HMRC)\b/i.test(
    imageAlt,
  );
}

function auditPost(filename: string): BlogAuditEntry {
  const absPath = join(BLOG_DIR, filename);
  const raw = readFileSync(absPath, 'utf8');
  const parsed = matter(raw);
  const data = parsed.data as Record<string, unknown>;
  const content = parsed.content;

  const slug = filename.replace(/\.mdx$/, '');
  const title = asString(data.title) ?? slug;
  const category = asString(data.category) ?? '';
  const image = asString(data.image);
  const imageAlt = asString(data.imageAlt);
  const imageAbsPath = image ? getImageAbsPath(image) : undefined;
  const imageSize = imageAbsPath ? getImageSize(imageAbsPath) : undefined;
  const bodyStatusLine = findBodyStatusLine(content);
  const earlyHorizontalRules = countEarlyHorizontalRules(content);
  const flags: string[] = [];

  if (!categorySlugs.has(category)) flags.push('invalid-category');
  if (!image) flags.push('missing-image');
  if (image && !image.startsWith(BLOG_IMAGE_PUBLIC_PREFIX)) flags.push('non-blog-image-path');
  if (imageAbsPath && !existsSync(imageAbsPath)) flags.push('missing-image-file');
  if (!imageAlt) flags.push('missing-image-alt');
  if (
    imageSize &&
    (imageSize.width !== TARGET_IMAGE_WIDTH || imageSize.height !== TARGET_IMAGE_HEIGHT)
  ) {
    flags.push(`image-size-${imageSize.width}x${imageSize.height}`);
  }
  if (hasOldImageStyleSignal(imageAlt)) flags.push('old-image-style-alt');
  if (bodyStatusLine) flags.push('body-status-line');
  if (earlyHorizontalRules > 0) flags.push(`early-horizontal-rules-${earlyHorizontalRules}`);
  if (slug.includes('2025') && hasCurrentTaxYearSignal(`${title}\n${content.slice(0, 2000)}`)) {
    flags.push('current-year-title-with-2025-slug');
  }
  if (hasPreviousTaxYearSignal(content) && !hasCurrentTaxYearSignal(content)) {
    flags.push('previous-tax-year-content');
  }
  if (/January 2026|5th April 2026|5 April 2026/i.test(content)) {
    flags.push('past-deadline-review');
  }
  if (hasAmericanSpelling(`${title}\n${content}`)) flags.push('uk-english-review');

  return {
    slug,
    file: relative(ROOT, absPath),
    title,
    category,
    image,
    imageAlt,
    imageSize,
    wordCount: countWords(content),
    bodyStatusLine,
    earlyHorizontalRules,
    flags,
  };
}

function printEntries(title: string, entries: BlogAuditEntry[], limit = 12): void {
  console.log(`\n${title}`);

  if (entries.length === 0) {
    console.log('  None');
    return;
  }

  for (const entry of entries.slice(0, limit)) {
    const size = entry.imageSize ? `${entry.imageSize.width}x${entry.imageSize.height}` : 'n/a';
    console.log(`  - ${entry.slug}`);
    console.log(`    category: ${entry.category || 'missing'} | image: ${size}`);
    console.log(`    flags: ${entry.flags.join(', ')}`);
    if (entry.bodyStatusLine) {
      console.log(`    body status: ${entry.bodyStatusLine}`);
    }
  }

  if (entries.length > limit) {
    console.log(`  ...and ${entries.length - limit} more`);
  }
}

function main(): void {
  const entries = getBlogFiles().map(auditPost);
  const imageUsage = new Map<string, BlogAuditEntry[]>();

  for (const entry of entries) {
    if (!entry.image) continue;
    const existing = imageUsage.get(entry.image) ?? [];
    existing.push(entry);
    imageUsage.set(entry.image, existing);
  }

  const duplicateImageEntries = [...imageUsage.values()].filter((usage) => usage.length > 1).flat();
  for (const entry of duplicateImageEntries) {
    if (!entry.flags.includes('duplicate-image-reference')) {
      entry.flags.push('duplicate-image-reference');
    }
  }

  const missingOrBadImages = entries.filter((entry) =>
    entry.flags.some(
      (flag) =>
        [
          'missing-image',
          'non-blog-image-path',
          'missing-image-file',
          'missing-image-alt',
          'old-image-style-alt',
          'duplicate-image-reference',
        ].includes(flag) || flag.startsWith('image-size-'),
    ),
  );
  const contentStructureQueue = entries.filter((entry) =>
    entry.flags.some(
      (flag) =>
        [
          'body-status-line',
          'current-year-title-with-2025-slug',
          'previous-tax-year-content',
          'past-deadline-review',
          'uk-english-review',
        ].includes(flag) || flag.startsWith('early-horizontal-rules-'),
    ),
  );
  const strictFailures = entries.filter((entry) =>
    entry.flags.some(
      (flag) =>
        [
          'missing-image',
          'non-blog-image-path',
          'missing-image-file',
          'missing-image-alt',
          'duplicate-image-reference',
        ].includes(flag) || flag.startsWith('image-size-'),
    ),
  );

  const currentTaxYearDisplay = formatTaxYearDisplay(CURRENT_TAX_YEAR, {
    separator: '/',
    shortEndYear: true,
  });

  console.log('Blog audit inventory');
  console.log(`  Current tax year: ${CURRENT_TAX_YEAR} (${currentTaxYearDisplay})`);
  console.log(`  Posts: ${entries.length}`);
  console.log(`  Images referenced: ${imageUsage.size}`);
  console.log(`  Blog image directory: ${relative(ROOT, BLOG_IMAGE_DIR)}`);
  console.log(`  Duplicate image references: ${duplicateImageEntries.length}`);
  console.log(`  Image refresh candidates: ${missingOrBadImages.length}`);
  console.log(`  Content/structure review candidates: ${contentStructureQueue.length}`);

  printEntries('Image refresh queue', missingOrBadImages);
  printEntries('Content and spacing review queue', contentStructureQueue);

  if (strict && strictFailures.length > 0) {
    console.error('\nStrict blog audit failed.');
    console.error(
      'Fix missing, duplicate, or non-1600x1000 image assets before running strict mode.',
    );
    process.exit(1);
  }

  console.log(
    '\nDone. Use this as a planning report; source-check tax claims before editing copy.',
  );
}

main();
