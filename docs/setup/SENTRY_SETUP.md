# 🛡️ Sentry Error Monitoring Setup

**Last Updated**: October 9, 2025
**Priority**: MEDIUM-HIGH - Production Observability
**Time**: 1-2 hours
**Cost**: $0 (Free tier: 5,000 events/month)

---

## Why Sentry for PayeTax?

**Benefits:**
- **Catch Production Errors**: See real user issues before they report them
- **Source Maps**: View actual TypeScript line numbers, not minified JavaScript
- **User Context**: Browser, page path, actions leading to error
- **Performance Monitoring**: Track slow pages and API calls
- **Free Tier**: 5,000 events/month = plenty for early stage

**Use Cases:**
- Monitor calculator bugs (e.g., edge case inputs causing crashes)
- Track API failures (Groq, Ollama, email sending)
- Identify browser compatibility issues
- Monitor production build errors
- Alert on critical errors via email/Slack

---

## Quick Start: Automatic Configuration

### Step 1: Install Sentry

```bash
# Install Next.js SDK
npm install @sentry/nextjs

# Run setup wizard (recommended)
npx @sentry/wizard@latest -i nextjs --org payetax --project javascript-nextjs
```

**Wizard will:**
1. Create Sentry account or link existing
2. Generate DSN (Data Source Name)
3. Create config files automatically
4. Add source map upload to build

---

### Step 2: Environment Variables

**Add to `.env.local`:**

```bash
# Sentry DSN (get from: https://sentry.io/settings/payetax/projects/javascript-nextjs/keys/)
NEXT_PUBLIC_SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project-id]

# Optional: Upload source maps (recommended for prod)
SENTRY_AUTH_TOKEN=sntrys_[your-token]
SENTRY_ORG=payetax
SENTRY_PROJECT=javascript-nextjs
```

**Add to Vercel Environment Variables:**
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_SENTRY_DSN` (Production + Preview)
3. Add `SENTRY_AUTH_TOKEN` (Production only - for source map uploads)

---

### Step 3: Configuration Files

**File:** `sentry.client.config.ts` (created by wizard)

```ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust sample rate for production (1.0 = 100% of errors)
  tracesSampleRate: 1.0,

  // Set environment
  environment: process.env.NODE_ENV,

  // Enable for debugging in dev
  debug: false,

  // Replay session recordings for debugging (10% sample rate)
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Ignore common non-critical errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'ResizeObserver loop limit exceeded',
    // Network errors
    'Network request failed',
    'Failed to fetch',
  ],

  beforeSend(event, hint) {
    // Filter out localhost errors in development
    if (window.location.hostname === 'localhost') {
      return null;
    }

    // Add user context (non-PII)
    event.user = {
      id: sessionStorage.getItem('session_id') || 'anonymous',
    };

    return event;
  },
});
```

**File:** `sentry.server.config.ts` (created by wizard)

```ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 1.0,

  environment: process.env.NODE_ENV,

  debug: false,

  // Server-specific options
  beforeSend(event) {
    // Don't send errors from development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    return event;
  },
});
```

**File:** `sentry.edge.config.ts` (for edge runtime - Sage API)

```ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  debug: false,
});
```

---

### Step 4: Update Next.js Config

**File:** `next.config.ts`

The wizard automatically wraps your config with Sentry:

```ts
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  // Your existing config
  // ...
};

// Wrap with Sentry config
export default withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,

    org: 'payetax',
    project: 'javascript-nextjs',
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload source maps in production builds
    widenClientFileUpload: true,

    // Routes browser requests to Sentry through a Next.js rewrite
    tunnelRoute: '/monitoring',

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
);
```

---

## PayeTax-Specific Integration

### 1. Calculator Error Tracking

**File:** `src/components/organisms/CalculatorContainer.tsx`

```tsx
import * as Sentry from '@sentry/nextjs';

export default function CalculatorContainer() {
  const handleCalculate = (inputs: TaxInputs) => {
    try {
      const results = calculateTax(inputs);
      return results;
    } catch (error) {
      // Send to Sentry with context
      Sentry.captureException(error, {
        tags: {
          component: 'CalculatorContainer',
          action: 'calculate_tax'
        },
        contexts: {
          calculator_inputs: {
            gross_income: inputs.grossIncome,
            tax_code: inputs.taxCode,
            student_loan_plan: inputs.studentLoanPlan,
            scotland: inputs.isScottish
          }
        }
      });

      // Show user-friendly error
      toast.error('Calculation error. Our team has been notified.');

      throw error;
    }
  };
};
```

---

### 2. API Route Error Tracking

**File:** `app/api/sage/route.ts` (Sage AI endpoint)

```tsx
import * as Sentry from '@sentry/nextjs';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const response = await fetch(GROQ_API_URL, {
      // ... Groq API call
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    return NextResponse.json(data);

  } catch (error) {
    // Send to Sentry with API context
    Sentry.captureException(error, {
      tags: {
        api_route: '/api/sage',
        llm_provider: 'groq'
      },
      contexts: {
        groq_api: {
          status: response?.status,
          rate_limit_remaining: response?.headers.get('x-ratelimit-remaining')
        }
      }
    });

    return NextResponse.json(
      { error: 'AI service temporarily unavailable' },
      { status: 500 }
    );
  }
}
```

---

### 3. Form Submission Tracking

**File:** `src/app/feedback/actions.ts`

```tsx
import * as Sentry from '@sentry/nextjs';

export async function sendFeedbackEmail(formData: FormData) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      // ... email sending
    });

    if (!response.ok) {
      throw new Error('Email API failed');
    }

  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        service: 'resend_email',
        email_type: 'feedback'
      }
    });

    throw error;
  }
}
```

---

### 4. Performance Monitoring

**Track Slow Calculations:**

```tsx
import * as Sentry from '@sentry/nextjs';

export function calculateTax(inputs: TaxInputs) {
  const transaction = Sentry.startTransaction({
    name: 'tax_calculation',
    op: 'function'
  });

  try {
    const results = performCalculation(inputs);
    return results;
  } finally {
    transaction.finish();
  }
}
```

---

### 5. User Feedback (Optional)

**Show dialog for errors:**

```tsx
import * as Sentry from '@sentry/nextjs';

function ErrorBoundaryComponent() {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div>
          <h2>Something went wrong</h2>
          <button
            onClick={() => {
              Sentry.showReportDialog({
                eventId: Sentry.lastEventId(),
                title: 'It looks like we're having issues.',
                subtitle: 'Our team has been notified.',
                user: {
                  email: sessionStorage.getItem('user_email') || undefined
                }
              });
            }}
          >
            Report feedback
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

---

## Free Tier Limits

**What You Get (Free):**
- 5,000 errors/month (resets monthly)
- 10,000 performance transactions/month
- 1GB attachment storage
- 30-day event retention
- Source map uploads
- Email alerts
- Basic integrations (Slack, GitHub)

**What's NOT Included:**
- Advanced features (custom dashboards, advanced filtering)
- Extended retention (90+ days)
- Team collaboration (1 user only on free tier)

**Monitoring Usage:**
- Dashboard: https://sentry.io/organizations/payetax/stats/
- Set up email alerts at 80% quota

**Upgrade Triggers:**
- If errors exceed 5K/month consistently
- If you need team access (£26/month for Team plan)
- If you need longer retention

---

## Testing Sentry Setup

### 1. Trigger Test Error (Development)

**Create test page:** `app/sentry-test/page.tsx`

```tsx
'use client';

import * as Sentry from '@sentry/nextjs';

export default function SentryTestPage() {
  return (
    <div className="p-8">
      <h1>Sentry Test Page</h1>

      <button
        onClick={() => {
          throw new Error('Test Error: Sentry is working!');
        }}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Throw Test Error
      </button>

      <button
        onClick={() => {
          Sentry.captureMessage('Test Message: Manual capture', 'info');
        }}
        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Send Test Message
      </button>

      <button
        onClick={() => {
          Sentry.captureException(new Error('Test Exception'), {
            tags: {
              test: 'manual_trigger'
            },
            contexts: {
              test_context: {
                user_action: 'clicked_test_button',
                timestamp: new Date().toISOString()
              }
            }
          });
        }}
        className="ml-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        Send Test Exception
      </button>
    </div>
  );
}
```

**Test Flow:**
1. Run `npm run dev`
2. Visit `http://localhost:3000/sentry-test`
3. Click "Throw Test Error"
4. Check Sentry dashboard: https://sentry.io/organizations/payetax/issues/

**Expected Result:**
- Error appears in Sentry within 10-30 seconds
- Shows source file + line number
- Includes browser context (Chrome, Safari, etc.)

---

### 2. Verify Source Maps (Production)

**After deployment:**

```bash
# Build with source maps
npm run build

# Check Sentry CLI uploaded maps
npx sentry-cli sourcemaps list --org payetax --project javascript-nextjs
```

**Verify in Sentry:**
1. Trigger error in production: `https://payetax.co.uk/sentry-test`
2. View error in Sentry dashboard
3. Check stack trace shows TypeScript filenames (not minified `_app-[hash].js`)

---

## Alert Configuration

### 1. Email Alerts

**Setup:**
1. Go to https://sentry.io/settings/payetax/projects/javascript-nextjs/alerts/
2. Click "Create Alert Rule"
3. Choose "Issues"
4. Set conditions:
   - **Trigger:** An issue is first seen
   - **Filter:** All issues OR tag:critical equals "true"
5. Action: Send email to your address

**Recommended Alerts:**
- **Critical Errors:** Immediate email (payment failures, data loss)
- **High Volume:** Email if >50 errors/hour
- **New Errors:** Email for first occurrence of new error type

---

### 2. Slack Integration (Optional)

**Setup:**
1. Go to https://sentry.io/settings/payetax/integrations/slack/
2. Connect Slack workspace
3. Configure alert rule to post to #errors channel

---

## Best Practices for PayeTax

### 1. Tag Strategy

Use consistent tags for filtering:

```tsx
Sentry.captureException(error, {
  tags: {
    component: 'CalculatorResults',    // Component name
    feature: 'tax_calculation',        // Feature area
    critical: 'true',                  // Severity flag
    user_type: 'anonymous'             // Auth status
  }
});
```

**Common Tags:**
- `component`: React component name
- `feature`: calculator | sage | blog | feedback
- `critical`: true | false
- `api_route`: /api/sage | /api/feedback
- `browser`: chrome | safari | firefox

---

### 2. Context Breadcrumbs

Add breadcrumbs for debugging:

```tsx
Sentry.addBreadcrumb({
  category: 'calculator',
  message: 'User changed gross income',
  level: 'info',
  data: {
    old_value: 30000,
    new_value: 35000
  }
});
```

---

### 3. Release Tracking

**Tag releases for better debugging:**

Update `sentry.client.config.ts`:

```ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA, // Vercel provides this
  environment: process.env.VERCEL_ENV || 'development',
});
```

**Benefits:**
- See which errors appeared in which deployment
- Track error trends across releases
- Quick rollback if new version has issues

---

### 4. Privacy Considerations

**IMPORTANT:** Don't send PII (Personally Identifiable Information)

**Safe:**
```tsx
Sentry.setUser({
  id: hashSessionId(sessionId),  // Hashed ID
  ip_address: '{{auto}}'          // Sentry auto-redacts last octet
});
```

**NEVER Send:**
- Email addresses
- Names
- Tax calculations with identifiable data
- Income amounts linked to users

**Scrub Sensitive Data:**

```ts
Sentry.init({
  beforeSend(event) {
    // Remove query strings with potential PII
    if (event.request?.url) {
      event.request.url = event.request.url.split('?')[0];
    }

    // Scrub form data
    if (event.request?.data) {
      delete event.request.data.email;
      delete event.request.data.name;
    }

    return event;
  }
});
```

---

## Monitoring Dashboard Setup

### Key Metrics to Track

**Create custom dashboard:** https://sentry.io/organizations/payetax/dashboards/

**Widgets to Add:**

1. **Error Rate Over Time**
   - Metric: Count of errors
   - Group by: Hour/Day
   - Filter: environment:production

2. **Top 10 Errors**
   - Metric: Count
   - Group by: Error message
   - Sort: Descending

3. **Errors by Component**
   - Metric: Count
   - Group by: tag:component
   - Visual: Bar chart

4. **Performance (P95 Response Time)**
   - Metric: transaction.duration
   - Percentile: 95th
   - Filter: transaction.op:navigation

5. **Browser Breakdown**
   - Metric: Count
   - Group by: browser.name
   - Visual: Pie chart

---

## Maintenance & Monitoring

### Weekly Tasks
- [ ] Review error dashboard for new issues
- [ ] Check quota usage (should stay <5K/month)
- [ ] Resolve critical errors flagged in email

### Monthly Tasks
- [ ] Review error trends (increasing/decreasing)
- [ ] Update alert thresholds if needed
- [ ] Archive resolved issues in Sentry

### Quarterly Tasks
- [ ] Audit tags and context data
- [ ] Review privacy compliance (no PII leaking)
- [ ] Evaluate upgrade need (if hitting 5K limit)

---

## Troubleshooting

### Source Maps Not Working

**Symptom:** Errors show minified file names (e.g., `_app-abc123.js:1:2345`)

**Fix:**
1. Check `SENTRY_AUTH_TOKEN` is set in Vercel
2. Verify `hideSourceMaps: true` in `next.config.ts`
3. Run `npx sentry-cli sourcemaps list` to confirm upload
4. Rebuild and redeploy

---

### Too Many Errors (Quota Exceeded)

**Symptom:** Email warning "80% of error quota used"

**Fix:**
1. **Identify noise:** Check if one error is spamming (e.g., bot traffic)
2. **Filter in `beforeSend`:**
   ```ts
   beforeSend(event) {
     if (event.message?.includes('ResizeObserver')) {
       return null; // Ignore this error
     }
     return event;
   }
   ```
3. **Adjust sample rate:**
   ```ts
   tracesSampleRate: 0.5, // Sample 50% of errors
   ```
4. **Upgrade plan** if legitimate errors exceed 5K/month

---

### Errors Not Appearing

**Symptom:** Triggered error, but nothing in Sentry dashboard

**Check:**
1. `NEXT_PUBLIC_SENTRY_DSN` is set correctly
2. Not running on `localhost` (filtered in `beforeSend`)
3. Network tab shows POST to `sentry.io/api/.../envelope/`
4. Sentry CLI connected: `npx @sentry/wizard --help`

---

## Integration with Existing Error System

**Current Setup:** PayeTax sends error emails via Resend

**Strategy:** **Supplement, don't replace**

```tsx
// In error handler
try {
  // ... operation
} catch (error) {
  // 1. Send to Sentry (for developers)
  Sentry.captureException(error);

  // 2. Send email (for critical errors only)
  if (isCritical(error)) {
    await sendErrorEmail(error);
  }

  // 3. Show user-friendly message
  toast.error('Something went wrong. Please try again.');
}
```

**When to Use Each:**

| Error Type | Sentry | Email | User Toast |
|------------|--------|-------|------------|
| Calculator bug | ✅ | ❌ | ✅ |
| API rate limit | ✅ | ❌ | ✅ |
| Database failure | ✅ | ✅ (critical) | ✅ |
| Form validation | ❌ | ❌ | ✅ |
| Network timeout | ✅ | ❌ | ✅ |

---

## Cost Projections

**Free Tier Capacity:**
- 5,000 errors/month = ~167 errors/day
- Typical fintech app: 20-50 errors/day (pre-optimization)
- PayeTax traffic (estimated): 100-200 visitors/day → ~10-30 errors/day

**Conclusion:** Free tier should suffice for 6-12 months

**Upgrade Triggers:**
- Traffic >1,000 visitors/day
- Complex features (Sage AI, premium calc) introduce more edge cases
- Team grows (need multi-user access)

**Paid Plan Costs:**
- Developer: $26/month (50K errors, 100K transactions)
- Team: $80/month (100K errors, 500K transactions)

---

## Recommended Next Steps

**Week 1:**
1. ✅ Run Sentry wizard: `npx @sentry/wizard@latest -i nextjs`
2. ✅ Add environment variables to Vercel
3. ✅ Test with `/sentry-test` page
4. ✅ Verify source maps after production deployment

**Week 2:**
5. ✅ Add error tracking to calculator
6. ✅ Add tracking to Sage API route
7. ✅ Configure email alerts
8. ✅ Create monitoring dashboard

**Week 3:**
9. ✅ Review first week of real errors
10. ✅ Tune `beforeSend` filters
11. ✅ Document common error resolutions
12. ✅ Add to team runbook

---

## Summary

**Sentry Setup Checklist:**
- [ ] Install: `npm install @sentry/nextjs`
- [ ] Run wizard: `npx @sentry/wizard@latest -i nextjs`
- [ ] Add `NEXT_PUBLIC_SENTRY_DSN` to `.env.local` and Vercel
- [ ] Test with `/sentry-test` page
- [ ] Add error tracking to calculator, API routes, forms
- [ ] Configure email alerts for critical errors
- [ ] Verify source maps in production
- [ ] Create monitoring dashboard
- [ ] Document error resolution process

**Expected Benefits:**
- **Pre-Launch:** Catch build/deployment errors
- **Week 1:** Identify browser compatibility issues
- **Month 1:** Reduce support burden by 20% (proactive fixes)
- **Month 3:** Data-driven prioritization (fix most common errors first)

**Total Setup Time:** 1-2 hours
**Ongoing Maintenance:** 30 minutes/week

---

**Ready to set up Sentry?** Start with the wizard command and I'll help troubleshoot any issues! 🛡️
