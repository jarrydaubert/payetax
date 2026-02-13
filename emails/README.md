# Email Templates

Newsletter templates were removed from the app codebase.

Newsletter lifecycle is now handled in Kit:

- Signup: `src/app/api/newsletter/subscribe/route.ts`
- Unsubscribe (legacy token links): `src/app/api/newsletter/unsubscribe/route.ts`
- Broadcasts/sequences: configured in Kit dashboard

Transactional app emails are defined in `src/lib/email/` and sent via Resend.

See `docs/guides/RESEND.md` for provider setup.
