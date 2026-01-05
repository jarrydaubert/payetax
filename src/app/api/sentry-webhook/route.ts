/**
 * Sentry Webhook Handler → Linear Issue Creation
 * 
 * Automatically creates Linear issues when new Sentry errors occur.
 * Configure in Sentry: Settings → Integrations → Webhooks
 * URL: https://payetax.co.uk/api/sentry-webhook
 */

import { LinearClient } from '@linear/sdk';
import { type NextRequest, NextResponse } from 'next/server';

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const SENTRY_WEBHOOK_SECRET = process.env.SENTRY_WEBHOOK_SECRET;
const LINEAR_TEAM_KEY = process.env.LINEAR_TEAM_KEY || 'PAYTAX';

interface SentryWebhookPayload {
  action: string;
  data: {
    issue: {
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

export async function POST(request: NextRequest) {
  // Verify webhook secret
  const sentrySignature = request.headers.get('sentry-hook-signature');
  if (SENTRY_WEBHOOK_SECRET && sentrySignature !== SENTRY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  if (!LINEAR_API_KEY) {
    console.error('LINEAR_API_KEY not configured');
    return NextResponse.json({ error: 'Linear not configured' }, { status: 500 });
  }

  try {
    const payload: SentryWebhookPayload = await request.json();
    
    // Only create issues for new errors (not resolved, ignored, etc.)
    if (payload.action !== 'created' && payload.action !== 'triggered') {
      return NextResponse.json({ status: 'ignored', reason: `Action: ${payload.action}` });
    }

    const { issue, event } = payload.data;
    
    // Build issue title
    const title = `🐛 Sentry: ${issue.title.slice(0, 100)}`;
    
    // Build issue description with all relevant details
    const description = buildDescription(issue, event);

    // Create Linear issue
    const linear = new LinearClient({ apiKey: LINEAR_API_KEY });
    
    // Get team ID
    const teams = await linear.teams();
    const team = teams.nodes.find((t) => t.key === LINEAR_TEAM_KEY);
    
    if (!team) {
      console.error(`Team ${LINEAR_TEAM_KEY} not found`);
      return NextResponse.json({ error: 'Team not found' }, { status: 500 });
    }

    const createdIssue = await linear.createIssue({
      teamId: team.id,
      title,
      description,
      priority: getPriority(issue.level, Number.parseInt(issue.count, 10)),
      labelIds: [], // Could add 'bug' label if configured
    });

    if (!createdIssue.success) {
      throw new Error('Failed to create Linear issue');
    }

    const linearIssue = await createdIssue.issue;
    
    console.log(`Created Linear issue ${linearIssue?.identifier} from Sentry ${issue.shortId}`);

    return NextResponse.json({
      status: 'created',
      linearIssue: linearIssue?.identifier,
      sentryIssue: issue.shortId,
    });
  } catch (error) {
    console.error('Sentry webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

function buildDescription(
  issue: SentryWebhookPayload['data']['issue'],
  event?: SentryWebhookPayload['data']['event']
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
    if (count >= 10) return 2;  // High
    return 3; // Medium
  }
  if (level === 'warning') {
    return 4; // Low
  }
  return 0; // No priority for info/debug
}

// Allow GET for health checks
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'sentry-webhook',
    linearConfigured: !!LINEAR_API_KEY,
  });
}
