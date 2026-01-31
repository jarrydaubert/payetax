#!/usr/bin/env node
/**
 * Meta Description Audit Script
 *
 * Audits all meta descriptions across the PayeTax site:
 * - Checks for optimal length (150-160 characters)
 * - Identifies missing descriptions
 * - Flags descriptions that are too long (>160) or too short (<120)
 *
 * Usage: node scripts/audit-meta-descriptions.js
 */

const fs = require('node:fs');
const glob = require('glob');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const OPTIMAL_MIN = 120;
const OPTIMAL_MAX = 160;
const results = {
  tooLong: [],
  tooShort: [],
  optimal: [],
  missing: [],
  total: 0,
};

/**
 * Extract metadata from Next.js page files
 */
function extractMetadataFromPage(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = filePath.replace(process.cwd(), '');

  // Match description in metadata object or generateMetadata function
  const descriptionMatch = content.match(/description:\s*['"`]([^'"`]+)['"`]/s);

  if (descriptionMatch) {
    const description = descriptionMatch[1].replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
    return { path: relativePath, description, length: description.length };
  }

  return null;
}

/**
 * Extract metadata from MDX blog posts
 */
function extractMetadataFromMDX(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = filePath.replace(process.cwd(), '');

  // Match frontmatter description
  const descriptionMatch = content.match(/^description:\s*['"]([^'"]+)['"]/m);

  if (descriptionMatch) {
    const description = descriptionMatch[1].trim();
    return { path: relativePath, description, length: description.length };
  }

  return null;
}

/**
 * Get URL from file path
 */
function getUrlFromPath(filePath) {
  // Convert file path to URL
  const url = filePath
    .replace(/^\/src\/app/, '')
    .replace(/^\/content\/blog/, '/blog')
    .replace(/\/page\.tsx$/, '')
    .replace(/\.mdx$/, '');

  return url || '/';
}

/**
 * Main audit function
 */
function auditMetaDescriptions() {
  console.log(`${colors.bold}${colors.cyan}🔍 Meta Description Audit${colors.reset}\n`);

  // Find all page files
  const pagePaths = glob.sync('src/app/**/page.tsx', {
    cwd: process.cwd(),
    absolute: true,
  });

  // Find all blog MDX files
  const blogPaths = glob.sync('content/blog/**/*.mdx', {
    cwd: process.cwd(),
    absolute: true,
  });

  console.log(`Found ${pagePaths.length} pages and ${blogPaths.length} blog posts\n`);

  // Audit pages
  for (const pagePath of pagePaths) {
    const meta = extractMetadataFromPage(pagePath);
    const url = getUrlFromPath(meta?.path || pagePath.replace(process.cwd(), ''));

    results.total++;

    if (!meta?.description) {
      results.missing.push({ path: meta?.path || pagePath.replace(process.cwd(), ''), url });
      continue;
    }

    if (meta.length > OPTIMAL_MAX) {
      results.tooLong.push({ ...meta, url });
    } else if (meta.length < OPTIMAL_MIN) {
      results.tooShort.push({ ...meta, url });
    } else {
      results.optimal.push({ ...meta, url });
    }
  }

  // Audit blog posts
  for (const blogPath of blogPaths) {
    const meta = extractMetadataFromMDX(blogPath);
    const url = getUrlFromPath(meta?.path || blogPath.replace(process.cwd(), ''));

    results.total++;

    if (!meta?.description) {
      results.missing.push({ path: meta?.path || blogPath.replace(process.cwd(), ''), url });
      continue;
    }

    if (meta.length > OPTIMAL_MAX) {
      results.tooLong.push({ ...meta, url });
    } else if (meta.length < OPTIMAL_MIN) {
      results.tooShort.push({ ...meta, url });
    } else {
      results.optimal.push({ ...meta, url });
    }
  }

  // Print results
  printResults();
}

/**
 * Print audit results
 */
function printResults() {
  console.log(`${colors.bold}═══════════════════════════════════════════════${colors.reset}\n`);
  console.log(`${colors.bold}SUMMARY${colors.reset}`);
  console.log(`Total pages audited: ${results.total}`);
  console.log(
    `${colors.green}✓ Optimal (${OPTIMAL_MIN}-${OPTIMAL_MAX} chars): ${results.optimal.length}${colors.reset}`,
  );
  console.log(
    `${colors.yellow}⚠ Too Long (>${OPTIMAL_MAX} chars): ${results.tooLong.length}${colors.reset}`,
  );
  console.log(
    `${colors.yellow}⚠ Too Short (<${OPTIMAL_MIN} chars): ${results.tooShort.length}${colors.reset}`,
  );
  console.log(`${colors.red}✗ Missing: ${results.missing.length}${colors.reset}\n`);

  // Too Long
  if (results.tooLong.length > 0) {
    console.log(
      `${colors.bold}${colors.yellow}TOO LONG (>${OPTIMAL_MAX} characters)${colors.reset}`,
    );
    console.log(`These will be truncated in search results:\n`);
    results.tooLong.forEach((item, index) => {
      const excess = item.length - OPTIMAL_MAX;
      console.log(`${index + 1}. ${colors.cyan}${item.url}${colors.reset}`);
      console.log(`   Length: ${item.length} chars (${excess} over limit)`);
      console.log(`   File: ${item.path}`);
      console.log(`   Description: "${item.description.substring(0, 80)}..."`);
      console.log();
    });
  }

  // Too Short
  if (results.tooShort.length > 0) {
    console.log(
      `${colors.bold}${colors.yellow}TOO SHORT (<${OPTIMAL_MIN} characters)${colors.reset}`,
    );
    console.log(`These could be more descriptive:\n`);
    results.tooShort.forEach((item, index) => {
      const deficit = OPTIMAL_MIN - item.length;
      console.log(`${index + 1}. ${colors.cyan}${item.url}${colors.reset}`);
      console.log(`   Length: ${item.length} chars (${deficit} below minimum)`);
      console.log(`   File: ${item.path}`);
      console.log(`   Description: "${item.description}"`);
      console.log();
    });
  }

  // Missing
  if (results.missing.length > 0) {
    console.log(`${colors.bold}${colors.red}MISSING META DESCRIPTIONS${colors.reset}\n`);
    results.missing.forEach((item, index) => {
      console.log(`${index + 1}. ${colors.cyan}${item.url}${colors.reset}`);
      console.log(`   File: ${item.path}`);
      console.log();
    });
  }

  // Optimal
  if (results.optimal.length > 0) {
    console.log(
      `${colors.bold}${colors.green}✓ OPTIMAL (${OPTIMAL_MIN}-${OPTIMAL_MAX} characters)${colors.reset}`,
    );
    console.log(`These are well-optimized:\n`);
    results.optimal.forEach((item, index) => {
      console.log(`${index + 1}. ${colors.cyan}${item.url}${colors.reset} (${item.length} chars)`);
    });
    console.log();
  }

  console.log(`${colors.bold}═══════════════════════════════════════════════${colors.reset}\n`);

  // Recommendations
  console.log(`${colors.bold}RECOMMENDATIONS:${colors.reset}\n`);
  console.log(
    `1. ${colors.yellow}Fix ${results.tooLong.length} descriptions that are too long${colors.reset}`,
  );
  console.log(`   - Target: ${OPTIMAL_MIN}-${OPTIMAL_MAX} characters`);
  console.log(`   - Remove unnecessary words, focus on key benefits\n`);

  console.log(
    `2. ${colors.yellow}Expand ${results.tooShort.length} descriptions that are too short${colors.reset}`,
  );
  console.log(`   - Add more detail, include key keywords`);
  console.log(`   - Highlight unique value proposition\n`);

  if (results.missing.length > 0) {
    console.log(
      `3. ${colors.red}Add ${results.missing.length} missing descriptions${colors.reset}`,
    );
    console.log(`   - CRITICAL: Every page needs a meta description\n`);
  }

  console.log(
    `${colors.green}✓ Estimated Time: ${Math.ceil((results.tooLong.length + results.tooShort.length + results.missing.length) * 3)} minutes${colors.reset}`,
  );
  console.log(`${colors.cyan}  (Avg 3 minutes per description)${colors.reset}\n`);
}

// Run the audit
auditMetaDescriptions();
