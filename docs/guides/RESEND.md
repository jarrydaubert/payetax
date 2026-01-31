# Resend Email Setup

> All email functionality: newsletter, calculator results, and feedback.

---

## Quick Reference

| Feature | Endpoint/Component | Rate Limit |
|---------|-------------------|------------|
| Newsletter Subscribe | `POST /api/newsletter/subscribe` | 3/min per IP |
| Newsletter Unsubscribe | `GET /api/newsletter/unsubscribe` | - |
| Newsletter Broadcast | `bun run notify-subscribers` | - |
| PAYE Results Email | `POST /api/send-results` | 5/min per IP |
| Director Results Email | `POST /api/send-director-results` | 5/min per IP |
| Feedback Form | Server action `submitFeedback` | 10/min per IP |

---

## Environment Variables

```env
RESEND_API_KEY=re_xxxxx           # From https://resend.com/api-keys
RESEND_AUDIENCE_ID=aud_xxxxx      # From https://resend.com/audiences (newsletter only)
```

Both are configured in Vercel for all environments.

---

## 1. Newsletter System

### Components

| Component | Location |
|-----------|----------|
| Subscribe API | `src/app/api/newsletter/subscribe/route.ts` |
| Unsubscribe API | `src/app/api/newsletter/unsubscribe/route.ts` |
| Signup Component | `src/components/molecules/NewsletterSignup.tsx` |
| Broadcast Script | `scripts/notify-subscribers.ts` |

### Email Templates

| Template | Purpose | Location |
|----------|---------|----------|
| Welcome | Sent on signup | `emails/welcome.tsx` |
| New Blog Post | Newsletter broadcast | `emails/new-blog-post.tsx` |

### Broadcasting New Posts

```bash
# Preview (no emails sent)
bun run notify-subscribers --post="your-post-slug" --dry-run

# Send for real
bun run notify-subscribers --post="your-post-slug"
```

The script:
- Fetches post from `content/blog/{slug}.mdx`
- Gets subscribers from Resend Audience
- Sends branded email with title, excerpt, and CTA
- Tracks announced posts in `.announced-posts.json` (prevents duplicates)
- Has 5-second countdown before sending (Ctrl+C to cancel)

### Subscriber Management

**Dashboard:** https://resend.com/audiences

---

## 2. Email Your Results (PAYE Calculator)

Users can email their tax calculation results from the **home page calculator**.

**Where it appears:** Home page (`/`) - "Email results" button in calculator results panel

| Component | Location |
|-----------|----------|
| API Endpoint | `src/app/api/send-results/route.ts` |
| Form Component | `src/components/molecules/EmailResultsForm.tsx` |
| Validation Schema | `src/lib/validation/emailValidation.ts` |

**Email includes:**
- Take-home pay summary with effective rate
- Full breakdown table (gross, tax, NI, pension, student loan)
- Monthly and annual figures
- Tax year indicator

---

## 3. Director Calculator Results

Directors can email their full tax strategy report from the **Director Guide page**.

**Where it appears:** Director Guide (`/tools/director-guide`) - "Email report" button in results dashboard

| Component | Location |
|-----------|----------|
| API Endpoint | `src/app/api/send-director-results/route.ts` |
| Dialog Component | `src/components/molecules/DirectorGuide/EmailResultsDialog.tsx` |
| Dashboard | `src/components/organisms/DirectorGuide/DirectorDashboard.tsx` |
| Validation Schema | `src/lib/validation/emailValidation.ts` |

**Email includes:**
- Executive summary (take-home, effective rate, savings vs all-salary)
- Strategy comparison table (all-salary, optimal mix, all-dividends)
- Detailed breakdown of recommended strategy
- Company taxes (Corporation Tax, Employer NI)
- Personal taxes (Income Tax, Employee NI, Dividend Tax)
- Monthly set-aside pots for tax liabilities
- Key tax dates (Self Assessment, Corporation Tax due)
- Full tax rates and thresholds reference

---

## 4. Feedback Form

Users can submit feedback via dialog accessible from the **navbar** (desktop) and **mobile menu**.

**Where it appears:** Global - feedback icon in navbar, "Send Feedback" in mobile menu

| Component | Location |
|-----------|----------|
| Server Action | `src/app/actions/feedback.ts` |
| Dialog Component | `src/components/organisms/FeedbackDialog.tsx` |
| Mobile Menu | `src/components/molecules/NavbarMobileMenu.tsx` |
| Validation Schema | `src/lib/validation/moleculesValidation.ts` |

**Features:**
- React 19 server action with `useActionState`
- Next.js 16 `after()` API for non-blocking email send
- Instant UI feedback while email sends in background
- Zod validation for email and message fields

**Email sent to:** `support@payetax.co.uk`

---

## Rate Limits

### Resend Free Tier
- 100 emails/day
- 3,000 emails/month
- Single sending domain

### Our API Limits

| Endpoint | Limit |
|----------|-------|
| Newsletter subscribe | 3/min per IP |
| Send results | 5/min per IP |
| Director results | 5/min per IP |
| Feedback | 10/min per IP |

Rate limiting implemented in `src/lib/rateLimit.ts`.

---

## Troubleshooting

### "Email service not configured" error
Missing `RESEND_API_KEY` env var. Check Vercel dashboard.

### "Newsletter not configured" error
Missing `RESEND_AUDIENCE_ID` env var. Check Vercel dashboard.

### Post already announced
The broadcast script tracks announced posts in `.announced-posts.json`. To re-announce, remove the slug from that file.

### Emails not sending
1. Check Resend dashboard for delivery status
2. Verify domain is verified in Resend
3. Check API logs for errors

### Rate limit hit
Wait 1 minute and retry. If testing, use different IP or clear rate limit store.

---

## File Reference

### API Routes
- `src/app/api/newsletter/subscribe/route.ts`
- `src/app/api/newsletter/unsubscribe/route.ts`
- `src/app/api/send-results/route.ts`
- `src/app/api/send-director-results/route.ts`

### Server Actions
- `src/app/actions/feedback.ts`

### Email Templates
- `emails/welcome.tsx`
- `emails/new-blog-post.tsx`

### Scripts
- `scripts/notify-subscribers.ts`

### Validation
- `src/lib/validation/emailValidation.ts`
- `src/lib/validation/moleculesValidation.ts`

### Components
- `src/components/molecules/NewsletterSignup.tsx` - Footer newsletter signup
- `src/components/molecules/EmailResultsForm.tsx` - PAYE calculator email
- `src/components/molecules/DirectorGuide/EmailResultsDialog.tsx` - Director guide email
- `src/components/organisms/FeedbackDialog.tsx` - Navbar feedback form

---

## Related Docs

- [BLOG_GUIDE.md](../blog/BLOG_GUIDE.md) - Newsletter section with publishing workflow
- [SENTRY_LOGGING.md](../guides/SENTRY_LOGGING.md) - Error monitoring setup
