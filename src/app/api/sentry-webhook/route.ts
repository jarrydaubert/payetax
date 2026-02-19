/**
 * Sentry Webhook Handler → Linear Issue Creation
 *
 * Automatically creates Linear issues when new Sentry errors occur.
 *
 * Setup:
 * 1. Sentry → Settings → Developer Settings → Create Internal Integration
 * 2. Webhook URL: https://payetax.co.uk/api/sentry-webhook
 * 3. Enable: Issue webhooks
 * 4. Copy Client Secret → Add to Vercel as SENTRY_WEBHOOK_SECRET
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { LinearClient } from '@linear/sdk';
import { type NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIdentifier } from '@/lib/security/clientIdentifier';

export const runtime = 'nodejs';

// Max payload size (1MB - webhooks shouldn't be larger)
const MAX_PAYLOAD_SIZE = 1024 * 1024;
const RATE_LIMIT = { max: 30, window: 60000 };

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const SENTRY_WEBHOOK_SECRET = process.env.SENTRY_WEBHOOK_SECRET;
const LINEAR_TEAM_KEY = process.env.LINEAR_TEAM_KEY || 'PAYTAX';

// Cache team ID to avoid lookup on every request
let cachedTeamId: string | null = null;

interface SentryWebhookPayload {
  action: string;
  data: {
    issue?: {
      id: string;
      title: string;
      culprit: string;
      shortId: string;
      permalink: string;
      logger: string | null;
      level: string;
      status: string;
      platform: string;
      project: {
        id: string;
        name: string;
        slug: string;
      };
      metadata: {
        type?: string;
        value?: string;
        filename?: string;
        function?: string;
      };
      count: string;
      userCount: number;
      firstSeen: string;
      lastSeen: string;
    };
    event?: {
      event_id: string;
      contexts?: {
        browser?: { name: string; version: string };
        os?: { name: string; version: string };
        device?: { family: string };
      };
      tags?: Array<{ key: string; value: string }>;
      request?: {
        url: string;
        method: string;
      };
    };
  };
  installation?: {
    uuid: string;
  };
}

/**
 * Verify Sentry webhook signature using HMAC-SHA256 with timing-safe comparison
 * Uses raw bytes to ensure exact payload match
 */
function verifySignature(bodyBuffer: Buffer, signature: string, secret: string): boolean {
  const digest = createHmac('sha256', secret).update(bodyBuffer).digest('hex');
  const normalizedSig = signature.trim().toLowerCase();

  // Use timing-safe comparison to prevent timing attacks
  if (digest.length !== normalizedSig.length) return false;
  return timingSafeEqual(Buffer.from(digest, 'utf8'), Buffer.from(normalizedSig, 'utf8'));
}

/** Get team ID with caching */
async function getTeamId(linear: LinearClient): Promise<string> {
  if (cachedTeamId) return cachedTeamId;

  const teams = await linear.teams();
  const team = teams.nodes.find((t) => t.key === LINEAR_TEAM_KEY);
  if (!team) throw new Error(`Team ${LINEAR_TEAM_KEY} not found`);

  cachedTeamId = team.id;
  return cachedTeamId;
}

export async function POST(request: NextRequest) {
  // Require webhook secret to be configured
  if (!SENTRY_WEBHOOK_SECRET) {
    console.error('[sentry-webhook] SENTRY_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const clientId = getClientIdentifier(request, { fallbackPrefix: 'ua:' });
  if (!(await checkRateLimit(`sentry-webhook:${clientId}`, RATE_LIMIT))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Check payload size before reading
  const contentLength = request.headers.get('content-length');
  if (contentLength && Number.parseInt(contentLength, 10) > MAX_PAYLOAD_SIZE) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  // Get raw body as bytes for signature verification
  const bodyBuffer = Buffer.from(await request.arrayBuffer());
  if (bodyBuffer.length > MAX_PAYLOAD_SIZE) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  // Verify webhook signature (mandatory)
  const sentrySignature = request.headers.get('sentry-hook-signature');
  if (!(sentrySignature && verifySignature(bodyBuffer, sentrySignature, SENTRY_WEBHOOK_SECRET))) {
    console.error('[sentry-webhook] Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Check resource type
  const resource = request.headers.get('sentry-hook-resource');
  if (resource !== 'issue') {
    return NextResponse.json({ status: 'ignored', reason: `Resource: ${resource}` });
  }

  if (!LINEAR_API_KEY) {
    console.error('[sentry-webhook] LINEAR_API_KEY not configured');
    return NextResponse.json({ error: 'Linear not configured' }, { status: 500 });
  }

  // Parse JSON with explicit error handling
  let payload: SentryWebhookPayload;
  try {
    payload = JSON.parse(bodyBuffer.toString('utf8'));
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Only create issues for NEW errors (not triggered/resolved/etc.)
  // Note: 'triggered' happens on regressions/alerts and would create duplicates
  if (payload.action !== 'created') {
    return NextResponse.json({ status: 'ignored', reason: `Action: ${payload.action}` });
  }

  const { issue, event } = payload.data;

  if (!issue) {
    return NextResponse.json({ status: 'ignored', reason: 'No issue data' });
  }

  try {
    const linear = new LinearClient({ apiKey: LINEAR_API_KEY });
    const teamId = await getTeamId(linear);

    // Build issue with Sentry ID in description for potential future deduplication
    const title = `🐛 Sentry: ${issue.title.slice(0, 100)}`;
    const description = buildDescription(issue, event);

    const createdIssue = await linear.createIssue({
      teamId,
      title,
      description,
      priority: getPriority(issue.level, Number.parseInt(issue.count, 10)),
      labelIds: [],
    });

    if (!createdIssue.success) {
      throw new Error('Failed to create Linear issue');
    }

    const linearIssue = await createdIssue.issue;

    // biome-ignore lint/suspicious/noConsole: Webhook logging for observability
    console.info(
      `[sentry-webhook] Created Linear issue ${linearIssue?.identifier} for Sentry ${issue.shortId}`,
    );

    return NextResponse.json({
      status: 'created',
      linearIssue: linearIssue?.identifier,
      sentryIssue: issue.shortId,
    });
  } catch (error) {
    console.error('[sentry-webhook] Error:', error, { sentryIssue: issue.shortId });
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}

function buildDescription(
  issue: NonNullable<SentryWebhookPayload['data']['issue']>,
  event?: SentryWebhookPayload['data']['event'],
): string {
  const lines: string[] = [];

  // Error summary
  lines.push('## Error Details');
  lines.push('');
  lines.push(`**Type:** ${issue.metadata.type || issue.level}`);
  lines.push(`**Message:** ${issue.metadata.value || issue.title}`);
  lines.push(`**Location:** ${issue.culprit}`);
  lines.push('');

  // Stats
  lines.push('## Impact');
  lines.push('');
  lines.push(`- **Occurrences:** ${issue.count}`);
  lines.push(`- **Users affected:** ${issue.userCount}`);
  lines.push(`- **First seen:** ${new Date(issue.firstSeen).toLocaleString()}`);
  lines.push(`- **Last seen:** ${new Date(issue.lastSeen).toLocaleString()}`);
  lines.push('');

  // Request context if available
  if (event?.request) {
    lines.push('## Request');
    lines.push('');
    lines.push(`- **URL:** ${event.request.url}`);
    lines.push(`- **Method:** ${event.request.method}`);
    lines.push('');
  }

  // Browser/OS context
  if (event?.contexts) {
    lines.push('## Environment');
    lines.push('');
    if (event.contexts.browser) {
      lines.push(`- **Browser:** ${event.contexts.browser.name} ${event.contexts.browser.version}`);
    }
    if (event.contexts.os) {
      lines.push(`- **OS:** ${event.contexts.os.name} ${event.contexts.os.version}`);
    }
    lines.push('');
  }

  // Links
  lines.push('## Links');
  lines.push('');
  lines.push(`[View in Sentry](${issue.permalink})`);
  lines.push('');

  // File info if available
  if (issue.metadata.filename) {
    lines.push('## Source');
    lines.push('');
    lines.push('```');
    lines.push(`File: ${issue.metadata.filename}`);
    if (issue.metadata.function) {
      lines.push(`Function: ${issue.metadata.function}`);
    }
    lines.push('```');
  }

  return lines.join('\n');
}

function getPriority(level: string, count: number): number {
  // Linear priorities: 0 = No priority, 1 = Urgent, 2 = High, 3 = Medium, 4 = Low
  if (level === 'fatal' || level === 'error') {
    if (count >= 100) return 1; // Urgent
    if (count >= 10) return 2; // High
    return 3; // Medium
  }
  if (level === 'warning') {
    return 4; // Low
  }
  return 0; // No priority for info/debug
}

// Allow GET for health checks (no config exposure for security)
export function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'sentry-webhook',
  });
}
