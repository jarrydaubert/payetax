#!/usr/bin/env bun
// scripts/notify-subscribers.ts
/**
 * Newsletter Broadcast Script
 *
 * Sends a new blog post notification to all newsletter subscribers.
 *
 * Usage:
 *   bun run notify-subscribers --post="how-national-insurance-works"
 *   bun run notify-subscribers --post="how-national-insurance-works" --dry-run
 *
 * Options:
 *   --post     Blog post slug (required)
 *   --dry-run  Preview without sending emails
 *
 * Environment:
 *   RESEND_API_KEY       - Resend API key
 *   RESEND_AUDIENCE_ID   - Resend audience ID for subscribers
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resend } from 'resend';
import { generateNewBlogPostHtml, generateNewBlogPostText } from '../emails/new-blog-post';
import { shouldMarkPostAsAnnounced } from '../src/lib/newsletter/broadcastPolicy';
import { resolveNewsletterBaseUrl } from '../src/lib/newsletter/emailConfig';
import {
  createUnsubscribeToken,
  resolveUnsubscribeSecret,
} from '../src/lib/newsletter/unsubscribeToken';

// Config
const ANNOUNCED_POSTS_FILE = join(process.cwd(), '.announced-posts.json');
const BATCH_SIZE = 50; // Resend recommends batching
const DELAY_BETWEEN_BATCHES_MS = 1000;
const CONTACT_PAGE_SIZE = 100;
const BASE_URL = resolveNewsletterBaseUrl();

// Types
interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
}

interface Contact {
  id: string;
  email: string;
  unsubscribed: boolean;
}

interface AnnouncedPosts {
  posts: string[];
  lastUpdated: string;
}

function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!(localPart && domain)) return email;
  if (localPart.length <= 2) return `${localPart[0] ?? '*'}*@${domain}`;
  return `${localPart.slice(0, 2)}***@${domain}`;
}

// Parse CLI arguments
function parseArgs(): { postSlug: string; dryRun: boolean } {
  const args = process.argv.slice(2);
  let postSlug = '';
  let dryRun = false;

  for (const arg of args) {
    if (arg.startsWith('--post=')) {
      postSlug = arg.replace('--post=', '').replace(/['"]/g, '');
    } else if (arg === '--dry-run') {
      dryRun = true;
    }
  }

  if (!postSlug) {
    console.error('Error: --post argument is required');
    console.error('Usage: bun run notify-subscribers --post="post-slug"');
    process.exit(1);
  }

  return { postSlug, dryRun };
}

// Load announced posts tracking
function loadAnnouncedPosts(): AnnouncedPosts {
  if (existsSync(ANNOUNCED_POSTS_FILE)) {
    try {
      return JSON.parse(readFileSync(ANNOUNCED_POSTS_FILE, 'utf-8'));
    } catch {
      return { posts: [], lastUpdated: new Date().toISOString() };
    }
  }
  return { posts: [], lastUpdated: new Date().toISOString() };
}

// Save announced posts tracking
function saveAnnouncedPosts(data: AnnouncedPosts): void {
  writeFileSync(ANNOUNCED_POSTS_FILE, JSON.stringify(data, null, 2));
}

// Fetch blog post from MDX files
async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  const mdxPath = join(process.cwd(), 'content', 'blog', `${slug}.mdx`);

  if (!existsSync(mdxPath)) {
    return null;
  }

  const content = readFileSync(mdxPath, 'utf-8');

  // Parse frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return null;
  }

  const frontmatter = frontmatterMatch[1] ?? '';
  const getValue = (key: string): string => {
    const match = frontmatter.match(new RegExp(`^${key}:\\s*['"]?(.+?)['"]?$`, 'm'));
    return match?.[1]?.trim() ?? '';
  };

  return {
    slug,
    title: getValue('title'),
    excerpt: getValue('excerpt'),
    category: getValue('category'),
    publishedAt: getValue('publishedAt'),
  };
}

function getUnsubscribeUrl(email: string): string {
  const token = createUnsubscribeToken(email, resolveUnsubscribeSecret());
  return `${BASE_URL}/api/newsletter/unsubscribe?token=${token}`;
}

interface ContactsPageResponse {
  data: Contact[];
  has_more?: boolean;
}

async function fetchContactsPage(
  audienceId: string,
  after?: string,
): Promise<ContactsPageResponse> {
  const params = new URLSearchParams();
  params.set('limit', String(CONTACT_PAGE_SIZE));
  if (after) params.set('after', after);
  const query = params.toString();
  const endpoint = `https://api.resend.com/audiences/${audienceId}/contacts${query ? `?${query}` : ''}`;

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch contacts: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as ContactsPageResponse;
}

// Fetch all contacts from Resend audience (cursor pagination)
async function fetchContacts(audienceId: string): Promise<Contact[]> {
  const allContacts: Contact[] = [];
  let after: string | undefined;

  while (true) {
    const page = await fetchContactsPage(audienceId, after);
    const pageContacts = page.data || [];
    allContacts.push(...pageContacts);

    if (!page.has_more) {
      break;
    }

    const lastContact = pageContacts.at(-1);
    if (!lastContact?.id) {
      throw new Error('Failed to paginate contacts: missing cursor id on last contact');
    }
    after = lastContact.id;
  }

  const dedupedByEmail = new Map<string, Contact>();
  for (const contact of allContacts) {
    dedupedByEmail.set(contact.email.toLowerCase(), contact);
  }

  return [...dedupedByEmail.values()].filter((c) => !c.unsubscribed);
}

// Send emails in batches
async function sendEmails(
  resend: Resend,
  contacts: Contact[],
  post: BlogPost,
  dryRun: boolean,
): Promise<{ sent: number; failed: number }> {
  const postUrl = `${BASE_URL}/blog/${post.slug}`;
  let sent = 0;
  let failed = 0;

  // Process in batches
  for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
    const batch = contacts.slice(i, i + BATCH_SIZE);

    for (const contact of batch) {
      if (dryRun) {
        console.log(`  [DRY RUN] Would send to: ${maskEmail(contact.email)}`);
        sent++;
        continue;
      }

      try {
        const html = generateNewBlogPostHtml({
          title: post.title,
          excerpt: post.excerpt,
          url: postUrl,
          category: post.category,
          publishedAt: post.publishedAt,
          recipientEmail: contact.email,
        });
        const text = generateNewBlogPostText({
          title: post.title,
          excerpt: post.excerpt,
          url: postUrl,
          category: post.category,
          publishedAt: post.publishedAt,
          recipientEmail: contact.email,
        });
        const unsubscribeUrl = getUnsubscribeUrl(contact.email);

        const { error } = await resend.emails.send({
          from: 'PayeTax <noreply@payetax.co.uk>',
          to: contact.email,
          subject: `New on PayeTax: ${post.title}`,
          html,
          text,
          headers: {
            'List-Unsubscribe': `<${unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        });

        if (error) {
          console.error(`  Failed to send to ${maskEmail(contact.email)}: ${error.message}`);
          failed++;
        } else {
          console.log(`  Sent to: ${maskEmail(contact.email)}`);
          sent++;
        }
      } catch (err) {
        console.error(`  Error sending to ${maskEmail(contact.email)}:`, err);
        failed++;
      }
    }

    // Delay between batches (except for last batch)
    if (i + BATCH_SIZE < contacts.length) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
    }
  }

  return { sent, failed };
}

// Main
async function main() {
  console.log('\n📬 PayeTax Newsletter Broadcast\n');

  // Parse arguments
  const { postSlug, dryRun } = parseArgs();

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No emails will be sent\n');
  }

  // Check environment
  if (!process.env.RESEND_API_KEY) {
    console.error('Error: RESEND_API_KEY environment variable not set');
    process.exit(1);
  }

  if (!process.env.RESEND_AUDIENCE_ID) {
    console.error('Error: RESEND_AUDIENCE_ID environment variable not set');
    process.exit(1);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  // Check if already announced
  const announcedPosts = loadAnnouncedPosts();
  if (announcedPosts.posts.includes(postSlug)) {
    console.error(`Error: Post "${postSlug}" has already been announced.`);
    console.error('To re-announce, remove it from .announced-posts.json');
    process.exit(1);
  }

  // Fetch blog post
  console.log(`📝 Fetching post: ${postSlug}`);
  const post = await fetchBlogPost(postSlug);

  if (!post) {
    console.error(`Error: Post "${postSlug}" not found in content/blog/`);
    process.exit(1);
  }

  console.log(`   Title: ${post.title}`);
  console.log(`   Category: ${post.category}`);
  console.log(`   Published: ${post.publishedAt}\n`);

  // Fetch subscribers
  console.log('👥 Fetching subscribers...');
  const contacts = await fetchContacts(audienceId);
  console.log(`   Found ${contacts.length} active subscribers\n`);

  if (contacts.length === 0) {
    console.log('No subscribers to notify. Exiting.');
    process.exit(0);
  }

  // Confirm before sending (unless dry run)
  if (!dryRun) {
    console.log(`⚠️  About to send ${contacts.length} emails.`);
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n');
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  // Send emails
  console.log('📤 Sending emails...');
  const { sent, failed } = await sendEmails(resend, contacts, post, dryRun);

  const markAsAnnounced = shouldMarkPostAsAnnounced({
    dryRun,
    sent,
    failed,
    expectedRecipients: contacts.length,
  });

  // Track announced post only on complete successful broadcast
  if (markAsAnnounced) {
    announcedPosts.posts.push(postSlug);
    announcedPosts.lastUpdated = new Date().toISOString();
    saveAnnouncedPosts(announcedPosts);
  }

  // Summary
  console.log('\n✅ Complete!');
  console.log(`   Sent: ${sent}`);
  console.log(`   Failed: ${failed}`);

  if (markAsAnnounced) {
    console.log(`   Post "${postSlug}" marked as announced.`);
  } else if (!dryRun) {
    console.log(
      `   Post "${postSlug}" NOT marked announced (sent ${sent}/${contacts.length}, failed ${failed}).`,
    );
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
