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
- `- [~]` explicitly deferred or non-blocking with justification in `Notes`

---

## 0) Local Preflight

- [ ] `bun run release:verify` passed
- [ ] `bun run check:production-env-contract` passed against the intended Vercel Production project, if production env values changed
- [ ] Key output and caveats captured below

Notes:
- TBD

## 1) Production Smoke

- [ ] Homepage and calculator CTA path works
- [ ] PAYE calculator works for at least two salaries
- [ ] Director Intelligence flow completes
- [ ] Blog index and one post load cleanly

Notes:
- TBD

## 2) Security + Abuse Controls

- [ ] CSRF/origin enforcement verified
- [ ] Rate limiting verified when rate-limit env values changed
- [ ] Sentry monitoring configuration verified

Notes:
- TBD

## 3) Results Email

- [ ] PAYE results email route returns success through the configured transactional email provider
- [ ] Director results email route returns success through the configured transactional email provider

Notes:
- TBD

## 4) Accessibility + Performance Spot Check

- [ ] Keyboard/focus sanity pass complete
- [ ] Lighthouse desktop and mobile run captured if UI or performance changed
- [ ] No major console/runtime regressions

Notes:
- TBD

## 5) Observability + Analytics

- [ ] Sentry release tagging and error volume sane
- [ ] No repeating `calculation_anomaly` alerts
- [ ] Vercel Web Analytics and Speed Insights visible after production traffic
- [ ] GA4 page view visible after accepting analytics cookies, if GA4 changed

Notes:
- TBD

## 6) SEO + Indexing

- [ ] `robots.txt` and `sitemap.xml` reachable
- [ ] Canonical/metadata sanity on key pages
- [ ] Structured data validation spot check completed if metadata changed

Notes:
- TBD

## Final Decision

- [ ] Validation complete
- [ ] `Status` updated to `COMPLETE`
- [ ] Release notes/changelog link to this report

Decision Notes:
- TBD
