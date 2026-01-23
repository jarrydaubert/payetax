# Newsletter Email Service with Resend

## Overview

Add a blog newsletter signup that automatically notifies subscribers when new posts are published.

## Current State

- Resend is already integrated for `send-results` email functionality
- `subscribeToAlerts` field exists in the email API schema but is unused
- **Newsletter subscribe API and component implemented** (see Phase 1 checklist)

## Configuration Required

Before the newsletter works, you must:

1. **Create a Resend Audience** in the Resend dashboard (https://resend.com/audiences)
2. **Add the Audience ID** to your environment variables:

```bash
# Add to .env.local
RESEND_AUDIENCE_ID=aud_xxxxx  # Get this from Resend dashboard
```

> **Note:** Without the `RESEND_AUDIENCE_ID` environment variable, the subscribe API will return a 503 error.

## Resend Free Tier Limits

- 100 emails/day
- 3,000 emails/month
- Single sending domain
- Audiences (subscriber lists) included

Reference: https://resend.com/pricing

## Proposed Architecture

### 1. Subscriber Management

**Add to Resend Audience:**
```
POST /api/newsletter/subscribe
Body: { email: string }
```

Uses Resend's Audiences API to manage subscribers:
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Add subscriber to audience
await resend.contacts.create({
  email: 'subscriber@example.com',
  audienceId: process.env.RESEND_AUDIENCE_ID,
});
```

### 2. Blog Signup Component

Location: Blog pages (sidebar or end of posts)

```tsx
// src/components/molecules/NewsletterSignup.tsx
export function NewsletterSignup() {
  // Simple form: email input + submit
  // Success: "You're subscribed!"
  // Error handling for already subscribed, invalid email
}
```

### 3. Broadcast New Posts

**Trigger Options:**

| Option | Pros | Cons |
|--------|------|------|
| Manual script | Simple, intentional | Requires remembering |
| Build hook | Automatic | Runs on every deploy |
| GitHub Action | Automatic on content merge | More setup |

**Recommended: Manual script with reminder**

```bash
bun run notify-subscribers --post="how-national-insurance-works"
```

Script checks:
1. Post exists and is published
2. Post hasn't been announced before (store in metadata or separate file)
3. Sends to all audience members

### 4. Email Template

```tsx
// emails/new-blog-post.tsx
export function NewBlogPostEmail({ title, excerpt, url }) {
  return (
    <Email>
      <Heading>New on PayeTax</Heading>
      <Text>{title}</Text>
      <Text>{excerpt}</Text>
      <Button href={url}>Read More</Button>
      <Footer>
        <Unsubscribe />
      </Footer>
    </Email>
  );
}
```

## Implementation Checklist

### Phase 1: Subscriber Capture
- [ ] **TODO:** Create Resend Audience in dashboard
- [ ] **TODO:** Add `RESEND_AUDIENCE_ID` to `.env.local`
- [x] Create `/api/newsletter/subscribe` endpoint ✅ `src/app/api/newsletter/subscribe/route.ts`
- [x] Create `NewsletterSignup.tsx` component ✅ `src/components/molecules/NewsletterSignup.tsx`
- [x] Add to Footer ✅ `src/components/molecules/Footer.tsx`
- [x] Add success/error states ✅ (included in component)
- [ ] **TODO:** Test subscription flow (requires Audience ID)

### Phase 2: Email Templates
- [ ] Install `@react-email/components`
- [ ] Create `NewBlogPostEmail` template
- [ ] Preview and test template
- [ ] Add unsubscribe link handling

### Phase 3: Broadcast Functionality
- [ ] Create `scripts/notify-subscribers.ts`
- [ ] Track announced posts (prevent duplicates)
- [ ] Add `bun run notify-subscribers` command
- [ ] Document usage in BLOG_GUIDE.md

### Phase 4: Automation (Optional)
- [ ] GitHub Action to detect new MDX files
- [ ] Auto-trigger on merge to main
- [ ] Slack/Discord notification as alternative

## Environment Variables

```env
# Already exists
RESEND_API_KEY=re_xxxxx

# New
RESEND_AUDIENCE_ID=aud_xxxxx
```

## API Endpoints

### POST /api/newsletter/subscribe

**Request:**
```json
{ "email": "user@example.com" }
```

**Response (success):**
```json
{ "success": true }
```

**Response (error):**
```json
{ "error": "Already subscribed" }
```

### POST /api/newsletter/broadcast

**Request:**
```json
{
  "slug": "how-national-insurance-works-uk-2025",
  "dryRun": false
}
```

**Response:**
```json
{
  "sent": 150,
  "failed": 2
}
```

## Unsubscribe Handling

Resend handles unsubscribe automatically when using their unsubscribe links. Include in every email:

```tsx
<Link href="{{{RESEND_UNSUBSCRIBE_URL}}}">Unsubscribe</Link>
```

## Analytics

Track in GA4:
- `newsletter_signup` - when form submitted
- `newsletter_signup_success` - when confirmed
- `email_opened` - via Resend webhooks (optional)
- `email_clicked` - via Resend webhooks (optional)

## Cost Projection

With Resend free tier (3,000 emails/month):
- 1 post/week = 4 broadcasts/month
- Max subscribers before hitting limit: 750

If growth exceeds this, upgrade to Pro ($20/month for 50k emails).

## Related Files

### Implemented
- `src/app/api/newsletter/subscribe/route.ts` - Subscribe API endpoint
- `src/components/molecules/NewsletterSignup.tsx` - Signup component (3 variants: inline, card, minimal)
- `src/components/molecules/Footer.tsx` - Footer with newsletter signup
- `src/app/globals.css` - Footer newsletter styles

### Reference
- `src/app/api/send-results/route.ts` - Existing Resend integration pattern
- `docs/guides/BLOG_GUIDE.md` - Update with notification workflow
- `.env.local` - Environment variables

### To Create
- `emails/new-blog-post.tsx` - React Email template
- `scripts/notify-subscribers.ts` - Broadcast CLI script

## Future Enhancements

- Welcome email sequence for new subscribers
- Weekly digest option (bundle multiple posts)
- Subscriber preferences (topics, frequency)
- A/B test subject lines via Resend
