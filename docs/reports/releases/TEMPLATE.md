# Release Verification Report - {{VERSION}}

Date: {{DATE}}
Release Version: {{VERSION}}
Commit: {{COMMIT_SHA}}
Deployment URL: TBD
Release Notes URL: TBD
Releasing Engineer: TBD
Status: IN_PROGRESS

Reference checklist: `docs/guides/POST_RELEASE_VALIDATION.md`

Legend:
- `- [x]` complete
- `- [ ]` blocking and still open
- `- [~]` explicitly deferred/non-blocking with justification in `Notes`

---

## 0) Local Preflight

- [ ] `bun run release:verify` passed
- [ ] `docs/guides/VERCEL_MIGRATION.md` is complete if this is the first production deploy from the GitHub repo
- [ ] `bun run check:production-env-contract` passed against the intended Vercel Production project
- [ ] Key output/caveats captured below

Notes:
- 

## 1) Production Smoke

- [ ] Homepage + calculator CTA path works
- [ ] PAYE calculator works for at least two salaries
- [ ] Director Intelligence flow completes
- [ ] Blog index + one post loads cleanly

Notes:
- 

## 2) Security + Abuse Controls

- [ ] CSRF/origin enforcement verified
- [ ] Rate limiting verified (distributed, not in-memory fallback)
  - Evidence: `bun run ops:verify-rate-limit` output captured below
- [ ] IndexNow secret enforcement verified
- [ ] Sentry webhook signature handling verified

Notes:
- 

## 3) Email + Webhooks

- [ ] Newsletter subscribe returns success and appears in Kit
- [ ] Unsubscribe token link returns success and the subscriber is unsubscribed or absent in Kit
- [ ] PAYE results email route returns success and Resend records the outbound message
- [ ] Director results email route returns success and Resend records the outbound message
- [ ] Referral lead flow verified when enabled by the production env contract

Notes:
- 

## 4) Accessibility + Performance Spot Check (Deferrable With Notes)

- [ ] Keyboard/focus sanity pass complete
- [ ] Screen-reader/live-region sanity pass complete
- [ ] Lighthouse desktop + mobile run captured
- [ ] No major console/runtime regressions

Notes:
- 

## 5) Observability + Analytics (Deferrable With Notes Unless A Live Blocker Is Active)

- [ ] Sentry release tagging and error volume sane
- [ ] No repeating `calculation_anomaly` alerts
- [ ] Key analytics funnel events observed
- [ ] No obvious analytics PII leakage

Notes:
- 

## 6) SEO + Indexing (Deferrable With Notes)

- [ ] `robots.txt` and `sitemap.xml` reachable
- [ ] Canonical/metadata sanity on key pages
- [ ] Structured data validation spot check completed

Notes:
- 

## Final Decision

- [ ] Validation complete
- [ ] `Status` updated to `COMPLETE`
- [ ] Release notes/changelog link to this report

Decision Notes:
- 
