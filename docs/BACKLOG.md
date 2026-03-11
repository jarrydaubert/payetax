# Backlog

Only open TODO items live here.

## Rules

- No status updates, progress notes, or completed work.
- Every item must include a concrete next step and a clear, testable Definition of Done.
- If an item changes behavior, its DoD must define regression protection: automated coverage at the right layer or an explicit replacement evidence path with a named bug target and oracle.
- When an item is complete, remove it from this file.

## Backlog Mantra

- Open TODO items only.
- Clear, testable DoD only.
- Behavior changes must say how they stay fixed:
  - automated coverage at the right layer, or
  - explicit replacement evidence path with a named bug target and oracle.

## Global DoD Contract (Applies To Every Item)

A backlog item is only complete when all conditions below are true:

1. `Outcome delivered`: the row's scope is implemented exactly as written.
2. `Regression protection defined`: behavior changes add or update automated coverage at the right layer, or explicitly justify why automation is the wrong layer and what evidence replaces it.
3. `Relevant validation passed`: the appropriate repo gates or targeted checks pass.
4. `Evidence attached`: MR/release/evidence docs contain concrete proof for the completed outcome.
5. `Backlog hygiene`: the completed item is removed from this file in the same change set.

If any condition is missing, the item remains open.

---

## P0 - Do Now

| ID | Work Item | Next Step | Definition of Done |
|---|---|---|---|
| `P0-5` | Tax Pack V1 foundation slice | Deliver checkout session route + idempotent webhook handling + order status lifecycle for one paid artifact flow. | A Stripe test-mode purchase completes end-to-end, the order reaches `ready`, one downloadable artifact is generated, and the flow is covered by automated tests for the happy path. |
| `P0-6` | Enforce release verification discipline | Fill `Deployment URL` + `Release Notes URL` in `docs/reports/releases/v<version>.md`, complete checklist, then run `bun run release:report:check`. | Each shipped release has a completed record in `docs/reports/releases/`, the record is linked from release notes/changelog, and `bun run release:report:check` passes. |
| `P0-7` | Close remaining director threshold-interaction gaps | Add cross-interaction regression tests for how other income affects PA taper, dividend allowance usage, and total-income student loan thresholds in director flows. | Director-flow tests explicitly cover each scoped cross-interaction in user-visible outputs, and any unsupported interaction is blocked by an explicit UI guard with test coverage. |
---

## P1 - Next

| ID | Work Item | Next Step | Definition of Done |
|---|---|---|---|
| `P1-1` | Visual regression pilot | Restore or add the Playwright visual regression spec, then baseline homepage hero, calculator results, and Director Intelligence dashboard. | CI captures baselines for those three surfaces from an active checked-in test spec, fails on diffs for them, and the approve/update workflow is documented in the repo. |
| `P1-11` | Define Tax Pack snapshot contract | Specify deterministic snapshot schema (integer pence, checksum, version fields) and enforce validation. | The schema is documented, validated in code, used by the generation pipeline, and enforced by automated tests that fail on contract drift. |
| `P1-12` | Deliver Tax Pack artifact pipeline | Build async generation/storage/download-grant flow (retry + failure handling). | A paid order can trigger generation, store the artifact, and retrieve it via a signed expiring grant, with retry/failure paths implemented and tested. |
| `P1-13` | Complete Tax Pack operational hardening | Implement refund/dispute handling, abandoned-order cleanup, and resend-safe email delivery. | Refund, dispute, abandonment cleanup, and resend-safe email paths all have deterministic state transitions, documented handling rules, and automated coverage for critical branches. |
| `P1-14` | Test Tax Pack end-to-end flows | Add integration + E2E tests for checkout, webhook idempotency, artifact generation, grant replay/expiry/revocation. | Integration and E2E coverage exists for each scoped flow, and the suite fails on regressions in checkout, delivery, replay, expiry, and revocation behavior. |
| `P1-17` | Investigate low Google referrer share | Run GSC + Ahrefs indexability audit (coverage, canonical, noindex, sitemap, robots, structured data) focused on why Bing/DDG/Yahoo outperform Google. | A root-cause report is published in docs, and each proposed fix has a prioritized ticket with an owner and ETA. |
| `P1-18` | Strengthen internal links to `/best-for/*` landing pages | Audit incoming internal links for `/best-for/contractors`, `/best-for/first-job`, `/best-for/freelancers`, `/best-for/high-earners`, `/best-for/part-time`, `/best-for/pensioners`, `/best-for/scottish`, and `/best-for/students`, then add relevant contextual links from existing hubs, blog posts, tools, and other qualifying pages. | Each scoped `/best-for/*` page is linked from the `/best-for` hub and at least two additional relevant non-navigation internal pages, the added links are checked into page content/templates rather than relying only on shared header/footer chrome, and a fresh crawl/export evidence path no longer reports any scoped `/best-for/*` page as having only one incoming internal link. |
| `P1-27` | Track unresolved transitive dependency advisories | Keep the current upstream-transitive advisories (`minimatch`, `rollup`, `serialize-javascript`) documented in the allowlist with `via` chain and `lastChecked`, run monthly `bun run audit:deps`, and remove entries once upstream or safe overrides resolve them. | The item closes only when `bun run audit:deps` no longer reports the currently tracked high-severity advisories, and the resolving parent package versions or approved overrides are recorded in allowlist history/docs without risky major-force upgrades. |
| `P1-31` | Add production env and enabled-feature contract verification | Expand the env contract so release-sensitive features declare their required production vars, then add a verification step that checks the live Vercel production env against that contract before release completion. | A documented contract covers the required production env for enabled release-sensitive features, an automated check or scripted evidence path verifies the live production env against it, release/runbook flow uses that check, and missing vars fail verification with actionable output. |
| `P1-32` | Stabilize GitLab to Vercel deployment status reconciliation | Reproduce the external-status failure path, then either fix the integration so successful production deploys consistently post a passing status or add a documented, scriptable recovery path that reconciles the commit status to the verified deployment. | A tested workflow exists for both success and failure cases, GitLab commit/pipeline status matches the verified Vercel deployment outcome for the latest tested commit, and the supported recovery path is documented in the ops runbook with concrete commands and evidence. |
| `P1-33` | Split calculator and director orchestration boundaries | Extract pure domain logic, input normalization, and side-effect orchestration into smaller modules so stores are no longer the primary integration layer before more monetization/product surface is added. | Calculator and director stores become thinner adapters over documented service/domain modules, current user-visible behavior is preserved, and regression tests cover the extracted boundaries at the right layer. |
| `P1-34` | Normalize business-doc ownership boundaries | Make `STATE_OF_PLAY.md` the only live/partial/planned snapshot, remove status/rollout sections from evergreen product/spec docs, and rewrite overlapping business docs so each file has one clear job. | `STATE_OF_PLAY.md` is the only business-status snapshot, evergreen business/spec docs no longer contain duplicate rollout or current-status sections, cross-links point to the canonical file for each concern, and the resulting docs match the current product/backlog truth. |

---

## P2 - Later (Planned Experiments)

| ID | Work Item | Next Step | Definition of Done |
|---|---|---|---|
| `P2-1` | React Compiler experiment | Enable in a controlled branch and compare INP/render metrics against baseline. | A keep or rollback decision is documented with before/after metrics, regression findings, and the exact branch/config tested. |
| `P2-2` | Cache Components / `use cache` experiment | Trial on static-heavy routes and capture TTFB/LCP impact. | Each tested route has a documented before/after measurement, a keep/rollback call, and a rollout plan only where the change is beneficial. |
| `P2-4` | Embeddable widget demand validation | Run lightweight demand test with target users/partners before any build work. | Demand evidence is recorded, opportunity cost is reviewed, and a build/no-build decision is documented before any implementation starts. |
| `P2-5` | Referral rollout validation | Validate demand with accountant discovery calls and instrument "this is complex" interaction tracking. | Discovery notes and interaction data are recorded, a go/no-go decision is documented, and the CTA stays disabled unless partner readiness is confirmed. |
| `P2-6` | Sitemap inclusion policy hardening | Apply `docs/guides/SITEMAP_POLICY.md` and record explicit include/exclude decisions in `docs/reports/seo-tech/YYYY-MM.md`. | The policy is applied in docs/process, and at least one monthly SEO tech report records route-family include/exclude decisions with rationale using that policy. |
| `P2-7` | Accessibility manual regression cadence | Run quarterly keyboard + screen-reader checks across calculator and Director Intelligence. | The first quarterly audit report exists, issues are logged with owners/severity, and follow-up remediation items are tracked. |
| `P2-12` | Add changed-files coverage gate | Enforce minimum coverage on touched files to reduce regressions in low-traffic modules. | CI blocks changes that drop touched-file coverage below the agreed threshold, and the threshold plus rationale are documented in the repo. |
| `P2-13` | Add SEO freshness pass for top traffic posts | Submit the 5 refreshed URLs to GSC indexing and record crawl/index status in the monthly SEO report. | The top 5 target posts are refreshed, submitted to GSC, and their crawl/index status is recorded in the monthly SEO report. |
| `P2-14` | Add monthly SEO technical review cadence | Complete the open checklist in `docs/reports/seo-tech/YYYY-MM.md` and continue using `seo:report:init`/`seo:report:status` monthly. | At least one monthly SEO technical review note exists with a completed checklist, one action item, and a named owner. |
| `P2-15` | Decide low-value module test strategy explicitly | For thin wrappers (`safeStorage`, hooks, telemetry/security helpers), either add targeted tests or document why E2E/integration coverage is sufficient. | Each scoped module has either targeted tests or explicit written rationale for relying on higher-level coverage, and the audit no longer flags the set as ambiguous. |
| `P2-16` | Evaluate shadcn AI workflow adoption (`create` + `skills`) | Run `npx shadcn@latest create` and `npx skills add shadcn/ui` in a disposable sandbox, compare the generated project flow and injected component context against the current app (`components.json`, aliases, UI primitives, local agent skills), and document keep/adopt/migrate recommendation. | A written evaluation covers `create` and `skills`, states whether to keep/adopt/migrate, explains overlap or conflict with the repo's existing agent-skill system, and includes required migration and rollback steps. |
| `P2-18` | Move route-shell branching to App Router layouts | Replace pathname-based fullscreen branching with route groups or nested layouts so the shared shell can stay server-first. | Fullscreen routes use dedicated layout boundaries, the root layout no longer needs client pathname checks for shell selection, and behavior matches the current UX. |
| `P2-19` | Consolidate the UI import surface | Choose one canonical UI component path (`@/components/ui` or equivalent), codemod existing imports, and block mixed patterns from reappearing. | UI consumers import from one canonical path, legacy shim imports are removed or deprecated behind a lint-enforced rule, and no mixed import style remains in app code. |
| `P2-20` | Centralize site and SEO configuration | Move site URL, metadata defaults, verification codes, and sitemap selection policy into one typed configuration layer or versioned data source used by metadata, sitemap, and docs-driven workflows. | Metadata generation, sitemap logic, and site identity values read from one typed source of truth, duplicated hardcoded values are removed, and SEO route-selection policy no longer lives only inside executable app logic. |
| `P2-21` | Simplify the analytics and consent integration surface | Introduce a single analytics gateway/consent orchestration layer so vendor adapters stay thin and page instrumentation logic is not embedded in one large client component. | Consent state has one source of truth, vendor adapters are isolated behind small modules, analytics page instrumentation is easier to test, and current user-visible analytics behavior is preserved. |
| `P2-22` | Rationalize custom framework configuration | Audit `next.config.ts` customizations, remove the ones without a measured payoff or hard requirement, and document the rationale for the remainder. | `next.config.ts` is materially smaller or clearer, every remaining non-default customization has a documented reason or measured benefit, and build/runtime behavior matches the current production intent. |
| `P2-24` | Evaluate `agency-agents` repo for selective reuse | Review https://github.com/msitarzewski/agency-agents against the current `.claude/skills`, identify any non-overlapping agents worth adapting, and document keep/cherry-pick/ignore recommendations. | A written evaluation records the repo URL, maps notable agents to PayeTax use cases, calls out overlap/conflict with the existing skill system, and recommends whether to adapt any specific agents. |
| `P2-25` | Make monthly funnel reporting operational instead of scaffold-only | Define the actual data source and extraction method for sessions and core funnel events, then complete the first report with real numbers and one follow-through action. | Funnel reports no longer rely on `TBD` placeholders for core metrics, the monthly workflow documents where numbers come from, and at least one completed report contains real metrics, one decision, and one tracked action. |
| `P2-26` | Shrink styling guidance to enforceable rules | Reduce `STYLING-GUIDELINES.md` to a shorter standard backed by the actual lint/audit rules and backlog exceptions rather than long-form prose. | The styling guide is materially shorter, references the enforcing scripts or rules for each hard constraint, and any remaining exceptions are tracked explicitly rather than hidden in narrative guidance. |
| `P2-27` | Add a decision record index for architectural choices | Create a small ADR/decision index so accepted technical decisions like currency arithmetic, analytics contracts, and other future tradeoff calls are easy to find and keep current. | A decision index exists, accepted decisions are linked from it, new architecture-level decisions have an obvious home, and duplicate decision rationale no longer needs to be repeated across unrelated docs. |
| `P2-28` | Derive skills inventory docs from the actual installed setup | Reduce manual drift in skills docs by generating or validating the installed commands/skills inventory from the checked-in `.claude` setup and pinned versions. | The skills inventory in docs is generated or machine-validated against the installed setup, drift is detectable in repo checks, and the human-written docs focus on usage and policy rather than manually maintained lists. |
