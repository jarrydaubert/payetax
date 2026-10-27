# PayeTax supporting-pages audit — 27 October 2026

Independent review of the public site's supporting pages (About, Privacy, Compliance, Install, Offline, Tools hub, 404, blog index, `llms.txt`/robots/sitemap, and site-wide chrome). The main calculator and the Director Intelligence calculation logic were out of scope, except where they affect a supporting-page claim.

## 1. Method and evidence base

| Evidence | Detail |
| --- | --- |
| Code | Detached worktree of `origin/main` at `534b8eff` (read-only, in scratchpad). No changes to the repo, branches or other worktrees. |
| Live site | `https://payetax.co.uk`, captured 27 Oct 2026 ~12:10–12:20 UTC. Footer shows `v5.1.4`. |
| Browser | Playwright Chromium, desktop 1366×900 and mobile 390×844, at 11 routes. Recorded title/meta/canonical/robots, headings, JSON-LD, links, overflow, third-party requests before consent, console errors, and axe-core (WCAG 2.0/2.1/2.2 A+AA tags). |
| GA payload test | Accepted cookies, entered £45,000 and pressed Calculate. GA requests were **intercepted and aborted**, so no data reached the production property. |
| External | GOV.UK employer rates 2026–27, revenue.scot, legislation.gov.uk (ITA 2007, NICA 2014, ITTOIA 2005), ICO/DUAA guidance (via search), plus link status checks. |
| Backlog cross-check | Each finding is marked **[Tracked]** if `docs/BACKLOG.md` already owns it, otherwise **[New]**. |

**Classification used below**
- **Defect** — confirmed against code, the live site and/or a primary source.
- **Opinion** — a judgement call; reasonable people may differ.
- **Uncertain** — I could not verify it; it needs evidence or legal input.

Severity: **High** = misleading users about privacy, money or authority; **Medium** = materially inaccurate or a compliance gap; **Low** = polish or hygiene.

Limitations: I am not a lawyer, and the regulatory points are framed as risks to confirm, not legal conclusions. Live checks used Chromium only (no WebKit, no physical devices). I did not log in to Search Console, GA, Sentry, Upstash or Vercel. The axe results are automated only; I did no manual screen-reader pass.

---

## 2. Executive summary

1. **The Privacy page's central promise is not literally true.** It says "The only time your inputs leave your device is when you choose to email your results." With analytics consent, GA4 receives a salary band, region, tax year and loan/pension flags (verified live). Sentry error breadcrumbs carry a salary band without consent. Neither is disclosed in the policy's data tables. **High, Defect, [New].**
2. **The Compliance page is the weakest page on the site.** Its claims are largely generic marketing copy, and several are false or unsupported. The backlog already tracks some of them. New ones from this audit:
   - the Revenue Scotland source link is **404**;
   - "Open source" (the licence is proprietary);
   - "deployed from repository release tags" (it isn't; `v5.1.4` predates 87 commits);
   - ONS listed as a calculation source (unused);
   - NICA 2014 cited for Class 1;
   - promised "calculation limits" that don't exist on the page.

   Meanwhile the project's *real* verification method, which is genuinely strong, is barely described. **High (as a whole), mixed tracked/new.**
3. **Browser storage of salary inputs is undisclosed.** Salary, tax code, pension and loan inputs (and Director figures) persist in `localStorage` with no mention in the policy's storage inventory and no "forget my figures" control. This matters on shared devices. **Medium, Defect (transparency) / Uncertain (PECR classification), [New]** for the main calculator.
4. **The Offline page over-promises.** It lists "Previous results" and "Saved calculations" (neither exists) and says the app "automatically syncs and shows the latest tax rates" (it doesn't). **Medium, Defect, [New].**
5. **The consent mechanics themselves are good.** No third-party request fired before consent on any of the 22 page/viewport loads. GA isn't even bootstrapped until opt-in, ad signals are denied, and withdrawal removes cookies. This is better than most UK sites and worth protecting.

---

## 3. What already works well

- **Consent implementation (verified live).** There were zero third-party hosts requested before consent across all routes and viewports. gtag is only bootstrapped after opt-in (`src/lib/gaConsent.ts`), with `ad_storage`/`ad_user_data`/`ad_personalization` denied. Reject has the same size as Accept in the banner, there is a 12-month re-prompt, and cross-tab sync works.
- **Privacy policy structure.** It has a plain-language summary followed by a formal policy with a lawful-basis table, a named processor list (Vercel, Brevo, Cloudflare, GA4, Sentry, Upstash), a storage table, rights, and the ICO route. That structure is above average for a one-person project.
- **Security headers.** Strict CSP with `frame-ancestors 'none'`, HSTS with preload, `nosniff`, a Permissions-Policy and a strict referrer policy.
- **Structural accessibility.** One H1 per page, a skip link, header/main/footer landmarks, and no horizontal overflow at 390px. axe found violations on only two of eleven routes (§5.9).
- **SEO hygiene.**
  - Canonicals are correct on indexable pages, and the 404 returns a real 404 with `noindex`.
  - www redirects to the apex domain with a 308.
  - The sitemap lists only retained routes, and `/offline` is excluded.
- **Honest framing on About.** "Not financial advice, not a lead-generation funnel" and "Claims stay tied to implementation" set the right standard. The Compliance page doesn't yet meet it.
- **Published figures spot-checked correctly.** The `llms.txt` student-loan thresholds (£26,900 / £29,385 / £33,795 / £25,000 / £21,000), NI PT/UEL (£12,570 / £50,270, 8%/2%) and Personal Allowance match GOV.UK's *Rates and thresholds for employers 2026 to 2027*.
- **Verification work is stronger than the site lets on.** The hand-derived fixtures follow HMRC's PAYE tax table routines v24.0 and Tables A (e.g. `uk-baseline-2026-27.json`). That is real evidence, and the Compliance page should lead with it.

---

## 4. Page-by-page findings

### 4.1 About (`/about`)

| # | Finding | Class | Sev | Status |
| --- | --- | --- | --- | --- |
| A1 | **Revenue Scotland is credited as a rates source in two places.** "Tax bands and thresholds are tied back to HMRC and Revenue Scotland sources" (`AboutPageContent.tsx:64`) and "HMRC and Revenue Scotland references" (`:81`). Revenue Scotland doesn't administer Scottish Income Tax: its site lists LBTT, Landfill, Aggregates, the Building Safety Levy and ADT. HMRC administers the tax and the Scottish Parliament sets the rates. | Defect | Med | **[New]**: the backlog item lists homepage, Compliance and `llms.txt`, but not About |
| A2 | **About promises "explicit calculation limits" and Compliance "assumptions, and calculation limits".** The Compliance page has no limits or assumptions section (the only match in its text is "assumptions and rate coverage are explicit"). | Defect | Med | Related to the backlog's "Documented modelling assumptions" item, but this cross-link promise isn't tracked |
| A3 | **"Public methodology" and "The proof should be reachable", but no link to the repository or verification fixtures.** The three proof links are Compliance, Director Intelligence and the Blog, none of which shows proof. | Opinion | Med | [New] |
| A4 | **The audience is mismatched.** The page reads as an engineering portfolio ("test lab", "deployment hygiene", "Boring controls on purpose"). A taxpayer deciding whether to trust a number doesn't learn who Jarryd is, whether any tax professional reviews content, how to report an error, or what isn't covered. For a money (YMYL) site, that is the trust content that matters. | Opinion | Med | [New] |
| A5 | **No contact route on the page.** It has no email and no "report a calculation error" link; the contact is only in the footer as "Support". | Opinion | Low | [New] |
| A6 | **Person JSON-LD `knowsAbout: "HMRC compliance"`.** Combined with the "HMRC Compliance" page title, this reinforces an authority claim the project can't evidence. `jobTitle: "Software tester…"` is honest; keep that tone. | Opinion | Low | [New] |
| A7 | **Design.** The editorial "Ledger" design is distinctive and calm, and the hierarchy is clear. At desktop, the cookie banner overlaps the first trust card until dismissed (normal for a floating banner). | Strength | — | — |

### 4.2 Privacy (`/privacy`)

| # | Finding | Class | Sev | Status |
| --- | --- | --- | --- | --- |
| P1 | **Derived salary data goes to Google after consent.** The hero says inputs leave the device *only* when emailing. The live capture after consent + Calculate shows events `calculator_action`, `calculator_usage` and `calculator_completed` with `ep.salary_range=35k_50k`, `ep.region=England`, `ep.tax_year=2026-2027`, `ep.has_student_loan`, `ep.has_pension` (source: `calculatorStore.ts:1077-1098`). Director sends `revenue_bucket`/`expenses_bucket` (`directorGuideAnalytics.ts:104-121`). The Analytics row describes only "page views, device/browser type, and pseudonymous usage events". | Defect | **High** | [New] |
| P2 | **A salary band goes to Sentry without consent.** Breadcrumbs carry `salaryRange` (`calculatorStore.ts:594, 1033, 1044`), and the client scrubber filters `salary` but not `salaryRange` (`instrumentation-client.ts`). Sentry runs under legitimate interests, which is defensible, but the policy's "Error diagnostics: technical error context" doesn't mention it. | Defect | Med | [New] |
| P3 | **Calculator inputs persist in `localStorage`.** Keys `tax-calculator-storage` (salary, tax code, pension, loans) and `director-guide-storage` (revenue, expenses…), plus `taxTrapAlertDismissed`, `pwa-install-banner-dismissed-at` and `director-guide-education-collapsed:v1`. The storage inventory lists only `_ga`, `_ga_*`, `cookie-consent` and `cookie-consent-timestamp`. "Your Tax Data Stays On Your Device" is true but incomplete: users aren't told it *stays* after they leave, or how to clear it. | Defect (transparency) | Med | Director part [Tracked] in the DI audit ("told figures are remembered on this device…"); main calculator and policy [New] |
| P4 | **"A short-lived client identifier derived from your IP address".** The Upstash key is the raw IP (`rateLimit.ts:211`, `clientIdentifier.ts:36-42`); the fallback is base64 of the user agent, which the code comment wrongly calls "hashed". Short-lived is true (TTL = window). The limiter also covers `/api/og`, not just "the email endpoints". | Defect (wording) | Low | [New] |
| P5 | **GA retention is "Per Google Analytics retention settings".** UK GDPR Art. 13(2)(a) requires the period or the criteria. State the configured value (2 or 14 months). | Defect (likely) | Low | [New] |
| P6 | **Complaints wording predates DUAA s.103 (in force 19 June 2026).** Controllers must now let people complain to them directly, acknowledge within 30 days, and mention this right in privacy notices. The page only says "We would appreciate the chance to resolve any concern first." | Uncertain (legal) | Med | [New] |
| P7 | **Opportunity under DUAA's statistical-purposes exception (PECR Sch. A1, in force 5 Feb 2026; ICO final guidance 29 Apr 2026).** First-party analytics used only to improve the service can now run on an opt-out basis with clear information. GA4 likely still needs consent given Google's processing. This is not a defect; it's a decision worth recording either way. | Opinion | Low | [New] |
| P8 | **Accessibility.** The ICO link is distinguished by colour only (1.64:1 against body text, needs 3:1 or an underline): axe `link-in-text-block`. On mobile, the three policy tables are scrollable regions that aren't keyboard-focusable: axe `scrollable-region-focusable` ×3. Dark-mode privacy failures are already in the backlog. | Defect | Med | Dark mode [Tracked]; these two [New] |
| P9 | **"Track you across other websites — we don't"** is consistent with ad storage denied. **"Written to meet UK GDPR"** is a self-assessment; I'd soften it to "written to explain…". | Opinion | Low | [New] |
| P10 | **The point of collection is inconsistent.** The Director email dialog links the Privacy policy (`EmailResultsDialog.tsx:132-137`). The main calculator's `EmailResultsForm` has no privacy link or notice at the point where the email address is collected. | Defect | Med | [New] (calculator surface; flagging for the owner of MC work) |
| P11 | **Unverified controller details.** The controller is named (Jarryd Aubert) with no geographic address. Whether an ICO data-protection fee/registration is required wasn't checked. | Uncertain | Low | [New] |

### 4.3 Compliance (`/compliance`)

| # | Finding | Class | Sev | Status |
| --- | --- | --- | --- | --- |
| C1 | **"Historical rates back to 2020/21", "4+ Years Data".** `TAX_YEARS` is 2023-24 to 2026-27 (`taxRates.ts:124`). | Defect | Med | [Tracked] |
| C2 | **"New rates applied within 24 hours", "Autumn Budget updates within 24 hours", "Spring Statement changes applied same day", "Emergency rate changes implemented immediately".** These are unverifiable. They are also conceptually wrong: announced rates normally take effect from a later date, so applying them within 24 hours would make current-year results wrong. | Defect | High | [Tracked] |
| C3 | **ITTOIA 2005 cited for income-tax rates.** ITTOIA covers trading, property and savings/other income. Rates and bands sit in ITA 2007 Part 2 Ch. 2 (ss.6–13) plus annual Finance Acts and charging provisions. | Defect | Med | [Tracked] |
| C4 | **"Compliant with National Insurance Contributions Act 2014" for Class 1.** NICA 2014 covers Employment Allowance, the age-related secondary percentage, GAAR and similar (legislation.gov.uk contents). Class 1 rates and thresholds derive from SSCBA 1992 as amended and annual regulations. "Compliant with" is itself an overclaim. | Defect | Med | **[New]**: the backlog item cites ITTOIA only |
| C5 | **Revenue Scotland as "Official Scottish tax authority for devolved Scottish income tax rates", and "independently verified against Revenue Scotland".** The "Visit Source" link `https://www.revenue.scot/taxes/income-tax` **returns 404** (also used in `llms.txt`). The code's own sources use gov.scot/mygov.scot. | Defect | Med | Misattribution [Tracked]; dead link [New evidence] |
| C6 | **"Open source — anyone can check our maths".** The repo is public, but `LICENSE` is "Proprietary License… All rights reserved". Say "source-available" or "public repository". | Defect | Med | [New] |
| C7 | **"App release v5.1.4 — Version currently deployed from repository release tags".** Vercel deploys from Git (`vercel.json`, CI has no tag deploy). Tag `v5.1.4` is from 14 June 2026 and `main` is 87 commits past it. Production baseline `44d8d02` (#134) still reports 5.1.4, so the version shown doesn't identify the running build. | Defect | Med | [New] |
| C8 | **ONS listed among "Official Government Sources — All calculations verified against these".** `ONS_ASHE_URL` is referenced only by the Compliance data; no calculation uses ONS. The description ("inflation rates") also doesn't match the linked page (earnings and working hours). | Defect | Low | [New] |
| C9 | **"Student Loans Company" card links to a GOV.UK page.** That is a labelling issue, not wrong data. | Defect | Low | [New] |
| C10 | **"Tested against HMRC published example calculations" / "Formulas match official PAYE calculation methods".** The fixtures are hand-derived from HMRC's PAYE routines v24.0 and Tables A, not from a set of HMRC-published worked examples. The real method is more defensible than the claim, so describe that instead. "Cross-platform calculation consistency" has no evidence I could find. | Uncertain → likely overclaim | Med | [Tracked] in spirit ("Replace unsupported accuracy/verification claims") |
| C11 | **Framing.** The title is "HMRC Compliance & Data Sources", the H1 "Official HMRC Tax Rates & Compliance", plus "Official Compliance Statements — Verified against UK tax law and regulations" and "100% HMRC Rates". HMRC doesn't certify calculators. Combined with no "not affiliated with HMRC" statement anywhere on the site, this risks implying endorsement. | Opinion (strong) | High | Partly [Tracked] |
| C12 | **Date formats are inconsistent.** The snapshot shows "1 July 2026" while cards show raw ISO "Last updated: 2026-07-01" and "Last accessed: 2026-07-01" (`CompliancePageContent.tsx:161, 244, 290`). | Defect | Low | [New] |
| C13 | **The "Recent Source Checks" log is stale.** The last entry was reviewed 20 June 2026. GOV.UK's employer-rates page has since been updated (1 Sept 2026: advisory fuel rates, not PAYE-relevant). That is fine materially, but a "recent" log that goes four months without an entry undermines itself. | Opinion | Low | [New] |
| C14 | **Public file path.** "Single source of truth: src/constants/taxRates.ts" is shown to the public without a link. Either link it to the repo or drop it. | Opinion | Low | [New] |
| C15 | **Design.** Generic centred hero, badges and stat tiles ("100%", "24hrs", "4+") give it a marketing feel, unlike About's editorial tone. The stat tiles are exactly the unsupported numbers. | Opinion | Med | [New] |

### 4.4 Install (`/install`)

| # | Finding | Class | Sev | Status |
| --- | --- | --- | --- | --- |
| I1 | **The content is accurate in substance.** The SW precaches `/` so the calculator works offline, and "Offline fallback" is an honest phrase. The meta "offline support" is acceptable. | Strength | — | — |
| I2 | **HowTo JSON-LD.** Google retired HowTo rich results in 2023. This is harmless but has no search value; keep it only if it serves other consumers. | Opinion | Low | [New] |
| I3 | **iOS steps may be outdated.** The steps say "Tap the Share icon → Add to Home Screen". Recent iOS versions moved the Share entry and added an "Open as Web App" toggle; this needs re-checking on current iOS. | Uncertain | Low | [New] |
| I4 | **The manifest declares a `share_target` with `action: "/"`.** The calculator ignores shared text/URL (query prefill was removed per PROJECT_STATE), so "Share to PayeTax" opens a blank calculator. | Defect (minor UX) | Low | [New] |

### 4.5 Offline (`/offline`)

| # | Finding | Class | Sev | Status |
| --- | --- | --- | --- | --- |
| O1 | **It lists "Previous results" and "Saved calculations" as available, and says "your previous calculations remain available".** Results are explicitly not persisted (`calculatorStore.ts:1271`) and there is no saved-calculations feature; only *inputs* persist. | Defect | Med | [New] |
| O2 | **"When you're back online, PayeTax automatically syncs and shows the latest tax rates."** There is no sync. Rates ship in the JS bundle and update only when a new SW/build is fetched. | Defect | Med | [New] |
| O3 | **Inherited metadata.** It has the generic home title "UK PAYE Tax Calculator \| PayeTax" and **canonical `https://payetax.co.uk/`** alongside `noindex`. Robots blocks crawling, so there is little impact, but the signals conflict. | Defect | Low | [New] |

### 4.6 Tools hub (`/tools`)

| # | Finding | Class | Sev | Status |
| --- | --- | --- | --- | --- |
| T1 | **The use-case table ("Includes / Does not cover") is excellent.** It is the clearest scoping content on the site and the model for the missing Compliance limits section. | Strength | — | — |
| T2 | **"…with source and limitation notes linked from the Compliance page".** No limitation notes exist there (same issue as A2). | Defect | Med | [New] |
| T3 | **"Salary vs dividends optimizer" (`toolsData.ts:30`).** This conflicts with the DI audit direction ("qualified estimates replace unbounded recommendation/optimal claims"). It also uses US spelling where the rest of the site uses "optimise". | Opinion | Low | Direction [Tracked] in DI audit; hub copy [New] |
| T4 | **Navigation.** The header shows Calculator, Director Intelligence, Blog and About; Tools appears only in the footer. On a site with five tools, the hub is under-exposed. | Opinion | Low | [New] |

### 4.7 404 (`/no-such-page`)

The 404 is correct: status 404, `noindex`, no canonical or OG, and three useful exits. The only console error is the expected 404 resource. No issues.

### 4.8 Blog index (`/blog`), light touch

- **Sub-brand inconsistency.** The page is titled "TaxInsights by PayeTax". "TaxInsights" appears nowhere else. *Opinion, Low.*
- **Stale "2025" titles remain in listings and `llms.txt`.** Examples: "Understanding the UK Tax System: Complete Guide 2025", "Higher Rate Taxpayer Guide UK 2025", "Marriage Allowance UK 2025", "UK Tax Changes 2025-2026". **[Tracked]** under Content accuracy (evergreen/historical policy, stale titles).

### 4.9 Director Intelligence shell (`/tools/director-guide`), chrome only

| # | Finding | Class | Sev | Status |
| --- | --- | --- | --- | --- |
| D1 | **The full-screen layout drops the footer and the cookie banner** (`Layout.tsx:18-37`). Links on the page are limited to calculator, tools, blog, about, decoder and Scottish calculator. There is no Privacy, Compliance or Cookie Settings link. A visitor who consented elsewhere can't withdraw consent from this page, and a direct visitor never sees the banner. Withdrawal must be "as easy as giving" consent. | Defect | Med | [New] |
| D2 | **axe `color-contrast` ×3.** Field hint text is #6e7884 on #fffefa = 4.44:1 at 12px (needs 4.5:1). | Defect | Low | Possibly covered by DI P2 accessibility items; verify |

### 4.10 Terms (`/terms`): does not exist

`/terms`, `/terms-of-service`, `/cookies`, `/contact` and `/accessibility` all return 404. No terms of use or disclaimer page exists. Disclaimers are scattered ("not financial advice" on About and Tools), and there is no site-wide "not affiliated with HMRC" statement.
- **Opinion (Med):** add a short Terms/Disclaimer page covering estimates only, no liability for decisions, no HMRC affiliation, acceptable use of the email feature, and IP (consistent with the proprietary licence). Link it from the footer.
- **Uncertain:** whether the E-Commerce Regulations 2002 reg. 6 service-provider information duty applies to a free, non-commercial site. It hinges on "normally provided for remuneration", so get a quick legal view.
- **Opinion (Low):** an accessibility statement is not legally required for a private site, but would fit the project's quality story.

### 4.11 Machine-readable surfaces (`llms.txt`, robots, sitemap, JSON-LD)

| # | Finding | Class | Sev | Status |
| --- | --- | --- | --- | --- |
| M1 | **`llms.txt` says "Search crawlers and AI crawlers are allowed".** `robots.txt` fully disallows GPTBot, Google-Extended, Applebot-Extended and CCBot. | Defect | Med | [New] |
| M2 | **The robots policy is internally inconsistent.** It blocks OpenAI, Google and Apple *training* agents and CCBot, but not Anthropic's ClaudeBot, Meta-ExternalAgent, Bytespider and others, which fall through to `*: Allow`. Pick a principle and apply it. | Opinion | Low | [New] |
| M3 | **`llms.txt` "salary inputs are not stored"** has the same issue as P3: not stored *by PayeTax servers*, but stored in the browser. | Defect (wording) | Low | [New] |
| M4 | **Organization JSON-LD on every page includes `sameAs: https://twitter.com/PayeTaxUK`.** I could not verify that the account exists or is controlled by the project. If it doesn't, remove it. | Uncertain | Low | [New] |
| M5 | **Homepage `FinancialService` JSON-LD advertises separate "Student Loan Calculator" and "Pension Calculator" services.** They are not separate tools. PayeTax is also not a financial service, so the structured data should mirror visible content. | Opinion (likely guideline issue) | Low | [New] |
| M6 | **`Dataset` JSON-LD declares a CC0 licence.** The repo is "All rights reserved". If CC0 for the rate data is intended, say so on the site; otherwise it is contradictory. `dateModified` is hard-coded to 2026-04-06 although rates were re-verified on 1 July 2026. | Opinion / Defect | Low | Projection ownership [Tracked] (Foundation: Dataset JSON-LD) |
| M7 | **The CSP still allow-lists `https://giscus.app` in script, connect and frame sources** (`next.config.ts:46,57,60`), but nothing in `src/` uses giscus. Remove the unused third-party allowance. | Defect (hygiene) | Low | [New] |

---

## 5. Cross-site findings

1. **The claims discipline is inconsistent.** About states the right rule ("If the app cannot prove something, the copy should not say it"). Privacy mostly follows it. Compliance, Offline and `llms.txt` break it. The issue isn't one bad page; there is simply no review gate for public claims on supporting pages.
2. **There is no single place for "assumptions and limits".** About, Tools and `llms.txt` all point to Compliance for limits that aren't there. The Tools table and PROJECT_STATE's Month 1 projection notes contain exactly what is needed.
3. **Authority signalling outruns the evidence.** "Official HMRC", "HMRC Compliance", "100% HMRC Rates", `knowsAbout: HMRC compliance` and the missing non-affiliation statement add up to an implied endorsement. Plain wording ("uses rates published by HMRC and the Scottish Government") is just as persuasive and accurate.
4. **Visual language differs between pages.** About and the 404 use the editorial Ledger style. Privacy, Compliance and Install use centred badge heroes and card grids. This is not a defect, but the marketing-style pages are also the ones with the weakest claims.
5. **Dates and versions are inconsistent.** There are ISO and long-form dates side by side, and a static version string that doesn't identify the running build. A short commit SHA (already available as `VERCEL_GIT_COMMIT_SHA`) would make "what is deployed" verifiable, which fits the R&D positioning.
6. **The footer is solid but thin on trust content.** It has no disclaimer line and no non-affiliation statement, and the copyright year is hard-coded (`© 2026`). The `min-h-6` (24px) targets meet WCAG 2.2 2.5.8 minimum.
7. **`translate="no"` and `<meta name="google" content="notranslate">` on every page** stop browser translation for users with limited English. This is probably deliberate (to avoid hydration breakage), but it has an inclusion cost. *Opinion, Low.*
8. **The viewport declares `colorScheme: 'light dark'`**, but the theme provider forces light. Dark-mode users may get dark scrollbars or form controls on a light page before hydration. *Low; dark-mode issues are already partly tracked.*

---

## 6. Prioritised recommendations

**Priority 1: correct misleading public claims (small, copy-only changes)**
1. Rewrite the Privacy hero and the "Data we process" Analytics and Error-diagnostics rows to disclose salary band, region, tax year and loan/pension flags (GA, with consent) and the salary band in Sentry breadcrumbs (P1, P2). Alternatively, stop sending them. A salary band plus region is low-risk but is still financial information, and the promise is explicit.
2. Remove or rewrite every unsupported Compliance claim in one PR:
   - remove C2 and the statistic tiles;
   - fix C1 and C3–C9;
   - fix the dead Revenue Scotland link and the attribution in About (A1);
   - change "Open source" to "public repository";
   - replace "deployed from release tags" with the actual commit SHA.

   Merge this into the existing Trust-and-sourcing backlog items rather than opening a parallel list.
3. Fix the Offline page copy (O1, O2) and its metadata (O3).
4. Align `llms.txt` with `robots.txt` (M1).

**Priority 2: close transparency and compliance gaps**

5. Add the persisted `localStorage` keys to the storage inventory, with retention and how to clear them. Add a visible "Clear saved figures" control on the main calculator (P3); the Director equivalent is already in DI scope.
6. Give the Director Intelligence full-screen layout a minimal footer with Privacy, Cookie Settings and Compliance links (D1).
7. Add a privacy notice and link at the main calculator's email form (P10).
8. Update the complaints section for DUAA s.103, state the GA retention period, and fix the "derived from your IP" wording (P4–P6). Get a short legal review of P6, P11 and the Terms question.
9. Fix the axe findings: underline in-text links on Privacy, give the scrollable tables `tabIndex=0` with a label, and raise the Director hint contrast (P8, D2).

**Priority 3: rebuild Compliance as a "Methodology & limits" page**

10. Replace the marketing structure with:
    - **Sources:** the actual URLs from `TAX_YEAR_SOURCES`, with legal bases (ITA 2007, the Scottish rate resolution, SSCBA 1992 / annual NIC regulations).
    - **Method:** a Month 1 steady-pay projection following PAYE routines v24.0 and Tables A, with the hand-derived fixtures linked.
    - **Supported years:** 2023-24 to 2026-27.
    - **Limits:** reuse the Tools "Does not cover" column.
    - **Change log:** real dated entries.

    This also satisfies the existing backlog items "Documented modelling assumptions" and "public verification report".
11. Add a site-wide one-line disclaimer in the footer ("Estimates only, not financial advice. Not affiliated with HMRC.") and a short Terms page.
12. Reposition About for the taxpayer as well as the engineer. Keep the lab framing, and add "Who builds this", "How to report a mistake", "What we don't cover" and a link to the repo and fixtures.

**Priority 4: hygiene**

13. Remove giscus from the CSP (M7), verify or remove the Twitter `sameAs` (M4), and trim the `FinancialService` offers (M5).
14. Resolve the CC0 vs proprietary contradiction (M6). Normalise date formatting (C12). Add the Tools hub to the header (T4).
15. Decide and record the robots training-crawler principle (M2) and the DUAA analytics-exemption stance (P7).

---

## 7. Open questions and unverified items

- Is GA4 data retention set to 2 or 14 months? Is Google Signals off? (No GA admin access.)
- Does Sentry store IP addresses for client events? (Depends on SDK `sendDefaultPii` defaults and project settings; not checked.)
- Is an ICO data-protection fee payable or paid? (Not checked.)
- Does `@PayeTaxUK` on X exist and belong to the project?
- Are the iOS install steps current on today's iOS?
- I verified only the Chromium rendering. I did not run WebKit or a physical-device pass, or a manual screen-reader pass.
- Live is `v5.1.4`, but I could not determine whether #135 is deployed. Content findings were the same in code (`534b8eff`) and live for every supporting page checked.

## 8. Sources

- GOV.UK, Rates and thresholds for employers 2026 to 2027: https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
- Revenue Scotland home (taxes administered): https://revenue.scot/ · dead link checked: https://www.revenue.scot/taxes/income-tax (HTTP 404)
- Income Tax Act 2007, Part 2 Chapter 2 (rates): https://www.legislation.gov.uk/ukpga/2007/3/part/2/chapter/2
- National Insurance Contributions Act 2014, contents: https://www.legislation.gov.uk/ukpga/2014/7/contents
- ITTOIA 2005, contents: https://www.legislation.gov.uk/ukpga/2005/5/contents
- ICO, DUAA, what it means for organisations: https://ico.org.uk/about-the-ico/what-we-do/legislation-we-cover/data-use-and-access-act-2025/the-data-use-and-access-act-2025-what-does-it-mean-for-organisations/
- Secondary summaries of the DUAA PECR exceptions and complaints duty: https://www.hunton.com/privacy-and-cybersecurity-law-blog/uk-ico-publishes-guidance-on-storage-and-access-technologies · https://www.womblebonddickinson.com/uk/insights/articles-and-briefings/new-exceptions-non-intrusive-cookies-icos-updated-guidance-has · https://privacymatters.dlapiper.com/2026/06/uk-new-complaints-handling-rules-under-duaa-take-effect-on-19-june-2026-are-you-ready/ · https://cms.law/en/gbr/legal-updates/data-use-and-access-act-2025-new-statutory-rules-on-handling-data-protection-complaints-from-19th-june-2026
- HMRC, PAYE tax table routines (payroll technical specifications): https://www.gov.uk/government/publications/payroll-technical-specifications-income-tax

Raw evidence (alongside this report): `live-audit/results.json`, `live-audit/*.png` (22 full-page screenshots), `live/*.html` (raw HTML, robots, sitemap, llms.txt), `scripts/audit.cjs`, `scripts/ga-payload.cjs`. The scripts require Playwright from the absolute path of the main checkout's `node_modules`, and `audit.cjs` writes to `../live-audit` relative to itself. Adapt both before reuse.
