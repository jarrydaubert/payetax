# Backlog

Last updated: February 20, 2026

Only active commitments are listed below. Every item has a first action and a measurable done condition.

---

## P0 - Do Now

| ID | Work Item | Next Step | Done When |
|---|---|---|---|
| `P0-4` | Verify distributed rate limiting in production | Run production validation against real Upstash-backed limits on public mutation routes. | Evidence recorded in release notes/runbook showing distributed limits work and in-memory fallback is not used in production. |
| `P0-5` | Tax Pack V1 foundation slice | Deliver checkout session route + idempotent webhook handling + order status lifecycle for one paid artifact flow. | A full Stripe test-mode purchase reaches `ready` state and produces one downloadable artifact end-to-end. |
| `P0-6` | Enforce release verification discipline | Use `bun run release:verify` and `POST_RELEASE_VALIDATION.md` on each release; store pass/fail notes. | Each release has a completed verification record linked in release notes/changelog. |
| `P0-7` | Verify director-calculator threshold interactions | Add regression tests for how other income affects PA taper, dividend allowance, and student loan thresholds in director flows. | Tests prove expected threshold interactions or UI guards are added where unsupported. |
| `P0-8` | Improve Director Intelligence assumption clarity | Add explicit assumptions panel and MTD timeline note in Director Intelligence outputs. | Users can see model assumptions and MTD scope/timeline without leaving results flow. |

---

## P1 - Next

| ID | Work Item | Next Step | Done When |
|---|---|---|---|
| `P1-1` | Visual regression pilot | Add baseline snapshots for homepage hero, calculator results, and Director Intelligence dashboard. | CI flags visual diffs on those three surfaces with an approve/update workflow documented. |
| `P1-2` | Currency arithmetic strategy review | Compare current rounding-to-pence approach against integer-pence/decimal alternatives and document tradeoffs. | Decision doc is published and linked from `SYSTEM_OVERVIEW.md`, with follow-up implementation ticket if needed. |
| `P1-3` | Bot-mitigation hardening for mutation endpoints | Evaluate Turnstile/challenge + heuristic throttling on `/api/newsletter/*`, `/api/send-results`, `/api/referral/lead`. | Chosen approach is implemented (or explicitly rejected with rationale) and false-positive risk is documented. |
| `P1-4` | Calculation anomaly monitoring | Define and ship alerts for impossible outputs (NaN, invalid effective rate bounds, negative post-tax totals where disallowed). | Alerts are live, tested in non-prod, and runbook response steps are documented. |
| `P1-5` | SPF/DKIM/DMARC monitoring cadence | Define monthly monitoring checklist and owner process for Kit/Resend domains. | Recurring check exists with first completed report and remediation path documented. |
| `P1-6` | Package manager/runtime alignment | Decide and document one install/build path across local, CI, and Vercel (Bun vs npm). | Build pipeline uses one documented source of truth and lockfile drift is eliminated. |
| `P1-7` | Clear remaining skipped/todo tests | Resolve known skipped tests and replace director NI `it.todo` placeholders with implemented tests. | Skipped/todo count for known items is zero (or explicitly justified in test comments). |
| `P1-9` | Formalize HMRC rounding divergence policy | Document exact-match vs tolerance rules for known HMRC rounding edge cases. | Policy is published and referenced by tax verification tests. |
| `P1-10` | Migrate remaining hardcoded fallback tax literals | Replace fallback literals in UI fallback paths with source-of-truth derived defaults. | No tax-rate fallback literals remain outside approved constants modules. |
| `P1-11` | Define Tax Pack snapshot contract | Specify deterministic snapshot schema (integer pence, checksum, version fields) and enforce validation. | Snapshot schema is implemented and used by generation pipeline and tests. |
| `P1-12` | Deliver Tax Pack artifact pipeline | Build async generation/storage/download-grant flow (retry + failure handling). | Paid order can generate and retrieve artifacts through signed, expiring download grants. |
| `P1-13` | Complete Tax Pack operational hardening | Implement refund/dispute handling, abandoned-order cleanup, and resend-safe email delivery. | Post-payment lifecycle paths are covered with deterministic state transitions. |
| `P1-14` | Test Tax Pack end-to-end flows | Add integration + E2E tests for checkout, webhook idempotency, artifact generation, grant replay/expiry/revocation. | Test suite reliably catches regressions in purchase and delivery lifecycle. |
| `P1-15` | Make coverage workflow CI-safe | Split report-opening behavior from coverage command so headless/sandbox runs do not fail. | Coverage commands run cleanly in local headless and CI contexts. |
| `P1-16` | Add test-audit metrics generator | Create script to output suites/tests/skips/todos/coverage from current run artifacts. | Audit numbers are generated from script output instead of manual snapshots. |
| `P1-17` | Investigate low Google referrer share | Run GSC + Ahrefs indexability audit (coverage, canonical, noindex, sitemap, robots, structured data) focused on why Bing/DDG/Yahoo outperform Google. | Root-cause report is documented and prioritized fix tickets are created with owner and ETA. |
| `P1-18` | Strengthen internal links from top organic blog pages | Add contextual internal links from top blog landing pages to calculator and relevant tool pages. | Top 10 organic blog pages each include at least 2 relevant internal links to core conversion pages and pass crawl validation. |
| `P1-19` | Remove temporary dependency advisory allowlist | Re-check `CVE-2025-69873` transitive path (`webpack > schema-utils > ajv`) after upstream updates and remove allowlist entry when fixed. | `bun run audit:deps` passes with no allowlisted advisories and `scripts/dependency-advisory-allowlist.ts` entry is removed. |

Status note (February 20, 2026):
- `P1-8` completed: guardrail implemented via `scripts/check-test-skips.ts` + `scripts/test-debt-allowlist.ts`, wired into `bun run fix-all`.

---

## P2 - Later (Planned Experiments)

| ID | Work Item | Next Step | Done When |
|---|---|---|---|
| `P2-1` | React Compiler experiment | Enable in a controlled branch and compare INP/render metrics against baseline. | Keep/rollback decision documented with measured performance and regression results. |
| `P2-2` | Cache Components / `use cache` experiment | Trial on static-heavy routes and capture TTFB/LCP impact. | Route-by-route decision documented with before/after metrics and rollout plan if beneficial. |
| `P2-3` | Compliance integrity transparency section | Draft `/compliance` addition with engine version, tax-rules version, and last verification date. | Section is published or explicitly deferred with rationale after trust-impact review. |
| `P2-4` | Embeddable widget demand validation | Run lightweight demand test with target users/partners before any build work. | Build/no-build decision made from recorded demand signals and opportunity cost review. |
| `P2-5` | Referral rollout validation | Validate demand with accountant discovery calls and instrument "this is complex" interaction tracking. | Go/no-go decision made with evidence and CTA enabled only if partner readiness exists. |
| `P2-6` | Sitemap inclusion policy hardening | Define and enforce data-led sitemap inclusion rules for salary and competitor pages. | Inclusion/exclusion policy is documented and monthly review loop is running. |
| `P2-7` | Accessibility manual regression cadence | Run quarterly keyboard + screen-reader checks across calculator and Director Intelligence. | First quarterly report completed with tracked remediation items. |
| `P2-8` | Sunset legacy compatibility paths | Remove legacy `DIVIDEND_RATES.ALLOWANCE` usage and define a date to drop 64-bit unsubscribe token signatures. | Legacy paths are removed or have dated deprecation plans with owners. |
| `P2-9` | Strengthen blog conversion operations | Ensure each new post ships with primary/secondary CTA placement and internal links to calculator/director/compliance pages. | Editorial checklist is updated and applied to new posts by default. |
| `P2-10` | Add growth funnel review cadence | Review sessions -> `calculator_start` -> `calculator_completed` -> monetization click on a regular cadence. | Monthly funnel review notes exist with one decision/action each cycle. |
| `P2-11` | Improve Compare My Setup UX | Add explicit edit/apply/reset/clear flow and objective toggle (`Maximize take-home` vs `Minimize NI`). | Users can compare strategies without hidden prefills and see objective tradeoffs. |
| `P2-12` | Add changed-files coverage gate | Enforce minimum coverage on touched files to reduce regressions in low-traffic modules. | CI blocks PRs that lower coverage below threshold on changed files. |
| `P2-13` | Add SEO freshness pass for top traffic posts | Update top-performing tax posts with explicit tax-year freshness and updated `dateModified` metadata where applicable. | Refresh pass is completed for top 5 traffic-driving posts and changes are indexed successfully in GSC. |
| `P2-14` | Add monthly SEO technical review cadence | Run recurring checks for index coverage, sitemap inclusion, canonicals, and structured data validity. | Monthly SEO review note exists with one action item and owner each cycle. |
