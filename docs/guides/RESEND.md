# Email Providers Setup

PayeTax now uses a split provider model:

- Newsletter lifecycle (signup/unsubscribe/broadcasts): Kit
- Transactional app emails (calculator results, referrals, feedback): Resend

## Source Of Truth

- Newsletter APIs: `src/app/api/newsletter/*`
- Kit client: `src/lib/newsletter/kitClient.ts`
- Transactional APIs: `src/app/api/send-results/route.ts`, `src/app/api/send-director-results/route.ts`, `src/app/api/referral/lead/route.ts`
- Rate limits: `src/lib/rateLimit.ts`

## Environment Variables

```env
# Newsletter (Kit)
KIT_API_SECRET=kit_xxxxx
KIT_FORM_ID=12345
NEXT_PUBLIC_KIT_EMBED_UID=648a4b276a
NEXT_PUBLIC_KIT_EMBED_VERSION=2026-02-13-1

# Transactional (Resend)
RESEND_API_KEY=re_xxxxx
```

## Newsletter (Kit)

- Subscribe API: `src/app/api/newsletter/subscribe/route.ts`
- Unsubscribe API (tokenized legacy links): `src/app/api/newsletter/unsubscribe/route.ts`
- Signup UI: `src/components/organisms/NewsletterCTA.tsx`
- Embed spots: homepage sections, blog index, blog categories, and individual blog posts
- Kit Custom CSS source: `docs/guides/KIT_EMBED_CSS.css`

Broadcasting is managed in Kit (broadcasts/sequences/automations), not from this repo.

## Transactional Email (Resend)

- PAYE results: `src/app/api/send-results/route.ts`
- Director results: `src/app/api/send-director-results/route.ts`
- Referral lead emails: `src/app/api/referral/lead/route.ts`
- Feedback action: `src/app/actions/feedback.ts`

## Troubleshooting

- Newsletter signup issues: verify `KIT_API_SECRET` and `KIT_FORM_ID`.
- Transactional email issues: verify `RESEND_API_KEY`.
- Rate limit behavior: inspect `src/lib/rateLimit.ts`.

## Operational Monitoring

- Monthly SPF/DKIM/DMARC checks and reporting: `docs/guides/EMAIL_AUTH_MONITORING.md`
