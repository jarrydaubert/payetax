# Backlog

> **This is a TODO list only.** No status tracking - when something is done, delete it.
> Keep items actionable and specific. If it's not actionable, it doesn't belong here.

## Monetization Setup

**Note:** All monetization features are built but disabled for launch. See `docs/guides/MONETIZATION.md` for enabling instructions.

- Find local accountant willing to pay per referral (informal partnership)
- Configure `REFERRAL_PARTNER_EMAIL` env var, then enable CTA in `CalculatorContainer.tsx`
- Enable page at `/pricing/business` when ready (currently returns 404)
- Reach out to finance content creators/newsletters about cross-promotion
- Revisit B2B affiliate partner programs (requires company registration)

## Lighthouse / Performance

- Add Content-Security-Policy headers (Best Practices 96→100) - whitelist analytics domains
- Reduce Total Blocking Time on mobile (Performance 98→100) - minor, low priority

## Tech Debt

- Align IncomeSource type in store with validation.ts discriminated union schema
- Add validationError state to calculatorStore for UI feedback on validation failures
- Create tsconfig.test.json to enable type-checking for test files

## Tools Directory Audit

### Missing Tools Index
- No `/tools/page.tsx` index page exists - users can't browse all tools
- Create index page listing all available tools

### Orphaned Tools (in sitemap but no navigation)
- `/tools/marriage-allowance-calculator` - no links to it
- `/tools/national-insurance-calculator` - no links to it
- `/tools/embed-widget` - no links to it

### Footer Links
- Currently only links to: tax-code-decoder, scottish-tax-calculator
- Consider adding "More Tools" section or linking remaining tools

### Director Guide SEO
- `/tools/director-guide` not in sitemap - decide if it should be (full-screen app)

### MarriageAllowanceAlert Component
- Links to gov.uk instead of internal `/tools/marriage-allowance-calculator`
- Consider linking to internal tool instead

### Embed Widget
- Two routes exist and work together:
  - `/embed` - The actual embeddable calculator (iframe content, noindex)
  - `/tools/embed-widget` - Marketing page with embed code generator
- Decision needed: add link elsewhere (footer, /tools page) or remove both if not launching soon

## Director Guide - Post-Review Backlog

> Items identified during 3-reviewer (Grok/Claude/ChatGPT) feedback process

### EducationPanel

- Make Learn cards expandable accordions (currently static, have no onClick)
- Improve DLA warning logic - add "dividends declared" option to avoid false positives
- Move warning logic to engine (return `result.flags.requiresSelfAssessment` etc.) instead of computing in UI

### DashboardLayout

- Add mobile fallback for education panel (currently only inputs has drawer)

### DetailCards

- Gate behind "Show detailed breakdown" toggle (too tax-nerdy for beginner flow)
- Pass `netRevenue` prop (after VAT deduction) instead of gross revenue

### Components Not Yet Reviewed

- `InputsPanel.tsx` - needs 3-reviewer pass
- `MainContent.tsx` - needs 3-reviewer pass
- `SummaryCards.tsx` - needs 3-reviewer pass
- `MoneyFlowChart.tsx` - needs 3-reviewer pass
- `SidebarNav.tsx` - needs 3-reviewer pass
- `OtherIncomeGate.tsx` - needs 3-reviewer pass
- `results/` folder (7 files) - needs 3-reviewer pass
- `warnings/` folder (7 files) - needs 3-reviewer pass


