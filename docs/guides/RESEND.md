# Resend Email Setup

All email functionality (newsletter, calculator results, feedback) uses Resend.

## Source of Truth

- Rate limits: `src/lib/rateLimit.ts`
- API routes: `src/app/api/*`
- Templates: `emails/`
- Broadcast script: `scripts/notify-subscribers.ts`

## Environment Variables

```env
RESEND_API_KEY=re_xxxxx
RESEND_AUDIENCE_ID=aud_xxxxx
```

Both are configured in Vercel for all environments.

## Newsletter

- Subscribe API: `src/app/api/newsletter/subscribe/route.ts`
- Unsubscribe API: `src/app/api/newsletter/unsubscribe/route.ts`
- Signup component: `src/components/molecules/NewsletterSignup.tsx`
- Broadcast script: `scripts/notify-subscribers.ts`

Broadcasting:

```bash
bun run notify-subscribers --post="your-post-slug" --dry-run
bun run notify-subscribers --post="your-post-slug"
```

Subscriber management happens in the Resend dashboard.

## Email Results (PAYE)

- API: `src/app/api/send-results/route.ts`
- Component: `src/components/molecules/EmailResultsForm.tsx`
- Validation: `src/lib/validation/emailValidation.ts`

## Email Results (Director Guide)

- API: `src/app/api/send-director-results/route.ts`
- Component: `src/components/molecules/DirectorGuide/EmailResultsDialog.tsx`
- Dashboard: `src/components/organisms/DirectorGuide/DirectorDashboard.tsx`
- Validation: `src/lib/validation/emailValidation.ts`

## Feedback

- Action: `src/app/actions/feedback.ts`
- Component: `src/components/organisms/FeedbackDialog.tsx`

## Troubleshooting

- Check Resend dashboard for delivery status.
- Verify env vars are set in Vercel.
- For rate-limit behavior, inspect `src/lib/rateLimit.ts`.
