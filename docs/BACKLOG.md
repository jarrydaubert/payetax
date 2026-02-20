# Backlog

Last updated: February 20, 2026

Only active commitments are listed below. Every item has a first action and a measurable done condition.

---

## P0 - Do Now

| ID | Work Item | Next Step | Done When |
|---|---|---|---|
| `P0-4` | Verify distributed rate limiting in production | Run production validation against real Upstash-backed limits on public mutation routes. | Evidence recorded in release notes/runbook showing distributed limits work and in-memory fallback is not used in production. |
| `P0-5` | Tax Pack V1 foundation slice | Deliver checkout session route + idempotent webhook handling + order status lifecycle for one paid artifact flow. | A full Stripe test-mode purchase reaches `ready` state and produces one downloadable artifact end-to-end. |
| `P0-6` | Enforce release verification discipline | Adopt `release:report:*` workflow (`init` -> complete checklist -> `check`) on each release and link report in release notes/changelog. | Each release has a completed verification record in `docs/reports/releases/` linked in release notes/changelog. |
| `P0-7` | Verify director-calculator threshold interactions | Add regression tests for how other income affects PA taper, dividend allowance, and student loan thresholds in director flows. | Tests prove expected threshold interactions or UI guards are added where unsupported. |

---

## P1 - Next

| ID | Work Item | Next Step | Done When |
|---|---|---|---|
| `P1-1` | Visual regression pilot | Add baseline snapshots for homepage hero, calculator results, and Director Intelligence dashboard. | CI flags visual diffs on those three surfaces with an approve/update workflow documented. |
| `P1-11` | Define Tax Pack snapshot contract | Specify deterministic snapshot schema (integer pence, checksum, version fields) and enforce validation. | Snapshot schema is implemented and used by generation pipeline and tests. |
| `P1-12` | Deliver Tax Pack artifact pipeline | Build async generation/storage/download-grant flow (retry + failure handling). | Paid order can generate and retrieve artifacts through signed, expiring download grants. |
| `P1-13` | Complete Tax Pack operational hardening | Implement refund/dispute handling, abandoned-order cleanup, and resend-safe email delivery. | Post-payment lifecycle paths are covered with deterministic state transitions. |
| `P1-14` | Test Tax Pack end-to-end flows | Add integration + E2E tests for checkout, webhook idempotency, artifact generation, grant replay/expiry/revocation. | Test suite reliably catches regressions in purchase and delivery lifecycle. |
| `P1-17` | Investigate low Google referrer share | Run GSC + Ahrefs indexability audit (coverage, canonical, noindex, sitemap, robots, structured data) focused on why Bing/DDG/Yahoo outperform Google. | Root-cause report is documented and prioritized fix tickets are created with owner and ETA. |
| `P1-27` | Track unresolved transitive `minimatch` advisory | Keep `GHSA-3PPC-4F35-3M26` documented as upstream-transitive (`@sentry/node`, Jest toolchain), run monthly `bun run audit:deps`, and update allowlist `lastChecked` metadata after each review. | `bun audit` no longer reports `minimatch <10.2.1` without risky major-force overrides, and this item is closed with the parent package versions that resolved it. |

---

## P2 - Later (Planned Experiments)

| ID | Work Item | Next Step | Done When |
|---|---|---|---|
| `P2-1` | React Compiler experiment | Enable in a controlled branch and compare INP/render metrics against baseline. | Keep/rollback decision documented with measured performance and regression results. |
| `P2-2` | Cache Components / `use cache` experiment | Trial on static-heavy routes and capture TTFB/LCP impact. | Route-by-route decision documented with before/after metrics and rollout plan if beneficial. |
| `P2-4` | Embeddable widget demand validation | Run lightweight demand test with target users/partners before any build work. | Build/no-build decision made from recorded demand signals and opportunity cost review. |
| `P2-5` | Referral rollout validation | Validate demand with accountant discovery calls and instrument "this is complex" interaction tracking. | Go/no-go decision made with evidence and CTA enabled only if partner readiness exists. |
| `P2-6` | Sitemap inclusion policy hardening | Define and enforce data-led sitemap inclusion rules for salary and competitor pages. | Inclusion/exclusion policy is documented and monthly review loop is running. |
| `P2-7` | Accessibility manual regression cadence | Run quarterly keyboard + screen-reader checks across calculator and Director Intelligence. | First quarterly report completed with tracked remediation items. |
| `P2-8` | Sunset legacy compatibility paths | Remove legacy `DIVIDEND_RATES.ALLOWANCE` usage and define a date to drop 64-bit unsubscribe token signatures. | Legacy paths are removed or have dated deprecation plans with owners. |
| `P2-10` | Add growth funnel review cadence | Review sessions -> `calculator_start` -> `calculator_completed` -> monetization click on a regular cadence. | Monthly funnel review notes exist with one decision/action each cycle. |
| `P2-11` | Improve Compare My Setup UX | Add explicit edit/apply/reset/clear flow and objective toggle (`Maximize take-home` vs `Minimize NI`). | Users can compare strategies without hidden prefills and see objective tradeoffs. |
| `P2-12` | Add changed-files coverage gate | Enforce minimum coverage on touched files to reduce regressions in low-traffic modules. | CI blocks PRs that lower coverage below threshold on changed files. |
| `P2-13` | Add SEO freshness pass for top traffic posts | Update top-performing tax posts with explicit tax-year freshness and updated `dateModified` metadata where applicable. | Refresh pass is completed for top 5 traffic-driving posts and changes are indexed successfully in GSC. |
| `P2-14` | Add monthly SEO technical review cadence | Run recurring checks for index coverage, sitemap inclusion, canonicals, and structured data validity. | Monthly SEO review note exists with one action item and owner each cycle. |
| `P2-15` | Decide low-value module test strategy explicitly | For thin wrappers (`safeStorage`, hooks, telemetry/security helpers), either add targeted tests or document why E2E/integration coverage is sufficient. | Audit no longer flags these modules as ambiguous test gaps because each has either tests or explicit rationale in docs. |
