# Release Verification Report - {{VERSION}}

Date: {{DATE}}
Release Version: {{VERSION}}
Commit: {{COMMIT_SHA}}
Deployment URL: TBD
Releasing Engineer: TBD
Status: IN_PROGRESS

Reference checklist: `docs/guides/POST_RELEASE_VALIDATION.md`

---

## 0) Local Preflight

- [ ] `bun run release:verify` passed
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
- [ ] IndexNow secret enforcement verified
- [ ] Sentry webhook signature handling verified

Notes:
- 

## 3) Email + Webhooks

- [ ] Newsletter subscribe appears in Kit
- [ ] Unsubscribe link works
- [ ] PAYE results email verified
- [ ] Director results email verified
- [ ] Referral lead emails verified

Notes:
- 

## 4) Accessibility + Performance Spot Check

- [ ] Keyboard/focus sanity pass complete
- [ ] Screen-reader/live-region sanity pass complete
- [ ] Lighthouse desktop + mobile run captured
- [ ] No major console/runtime regressions

Notes:
- 

## 5) Observability + Analytics

- [ ] Sentry release tagging and error volume sane
- [ ] No repeating `calculation_anomaly` alerts
- [ ] Key analytics funnel events observed
- [ ] No obvious analytics PII leakage

Notes:
- 

## 6) SEO + Indexing

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
