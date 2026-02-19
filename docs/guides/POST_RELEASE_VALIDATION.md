# Post-Release Validation Guide

Use this after every production release for checks that cannot be trusted fully from local automation alone.

Owner: on-call/releasing engineer.

Evidence: record each item as `PASS`/`FAIL` with timestamp and deployment URL in release notes or Linear.

---

## 1) Production Smoke (Critical User Paths)

Goal: confirm core journeys still work in the real deployed environment.

- [ ] Homepage loads and main CTA scrolls to calculator.
- [ ] PAYE calculator computes result for at least two salaries and updates charts/table.
- [ ] Director Guide completes end-to-end with results shown.
- [ ] Blog page and one dynamic blog post load without hydration errors.
- [ ] OG image endpoint responds for at least one route.

Suggested minimum browsers/devices:
- [ ] Chrome desktop (latest)
- [ ] Safari iOS (latest stable)
- [ ] Firefox desktop (latest)

---

## 2) Security and Abuse Controls (Production-Only Confidence)

Goal: confirm runtime protections are effective with real edge/network behavior.

- [ ] CSRF/origin protections reject invalid-origin POST requests on public mutation APIs.
- [ ] Rate limiting throttles repeated requests from same client and recovers after window.
- [ ] Upstash-backed distributed rate limiting is active (not in-memory fallback).
- [ ] `/api/indexnow` rejects missing/invalid secret and accepts valid secret.
- [ ] `/api/sentry-webhook` rejects invalid signature and accepts valid signed test payload.

---

## 3) Email and Webhook Flows

Goal: verify third-party integrations from real production infra.

- [ ] Newsletter subscribe sends success response and appears in Kit.
- [ ] Unsubscribe token link works from a real received email.
- [ ] PAYE results email sends and all links render correctly.
- [ ] Director results email sends and content renders correctly.
- [ ] Referral lead flow sends user confirmation; partner notification fires.

---

## 4) Accessibility Manual Checks

Goal: validate behavior that static/unit checks cannot guarantee.

- [ ] Keyboard-only navigation works for calculator and director guide (visible focus throughout).
- [ ] Screen reader announces calculation updates/live region content as expected.
- [ ] Decorative icons are not announced as meaningful content.
- [ ] No obvious contrast failures on key pages (homepage, calculator, director guide).

Recommended tools:
- axe DevTools quick scan on key pages
- VoiceOver (macOS/iOS) or NVDA (Windows) spot checks

---

## 5) Performance and Real-World UX

Goal: catch regressions not visible in local bundle/test runs.

- [ ] Run Lighthouse desktop + mobile against production and compare to previous release.
- [ ] Validate no new layout shifts during initial calculator/director guide load.
- [ ] Confirm interaction responsiveness on low-power mobile for core flows.
- [ ] Confirm no abnormal JS errors in browser console during core flows.

---

## 6) Observability and Error Monitoring

Goal: ensure release health after traffic hits production.

- [ ] Sentry receives events with correct release version.
- [ ] Error volume in first 1-2 hours is not materially above baseline.
- [ ] No new repeated server/API failures in Vercel logs.
- [ ] No broken webhook retries/backlogs (Sentry webhook, email providers).

---

## 7) SEO and Indexing Checks

Goal: verify crawl/index behavior that local checks cannot fully validate.

- [ ] `robots.txt` and `sitemap.xml` are reachable and correct in production.
- [ ] Canonical tags and key metadata present on homepage, calculator page, one blog post.
- [ ] Structured data validates on at least one content page and one tool page.
- [ ] IndexNow route can submit valid URLs in production with secret.

---

## 8) Data and Analytics Sanity

Goal: verify event pipelines in live environment.

- [ ] Key funnel events are firing (`calculator_start`, `calculator_completion`, director-guide core events).
- [ ] No obvious PII leakage in analytics payloads.
- [ ] Event volume shape looks normal vs prior release window.

---

## 9) Exit Criteria

Release is considered fully validated only when:

- [ ] All critical checks in sections 1-3 pass, and
- [ ] No unresolved `FAIL` in sections 4-9 without documented owner + ETA, and
- [ ] Any rollback-worthy issue has been explicitly ruled out.

If rollback is needed, trigger normal rollback process and re-run this checklist on the rollback deployment.
