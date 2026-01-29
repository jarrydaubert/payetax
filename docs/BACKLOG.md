# Backlog

> **This is a TODO list only.** No status tracking - when something is done, delete it.
> Keep items actionable and specific. If it's not actionable, it doesn't belong here.

---

## Recurring / Floating Items

> These are not one-time tasks - keep them here as reminders

### After Each HMRC/Gov Budget Change
- Review ALL blog posts for outdated tax rates, thresholds, and allowances
- Update `publishedAt` / `updatedAt` dates on affected posts
- Check director-related posts especially (salary thresholds, dividend allowance, CT rates)
- Verify calculator constants in `src/constants/taxRates.ts` are updated first
- Key posts to check: director guides, £100k tax trap, Scottish rates comparison, student loans

---

## Director Calculator Spec Completeness

- Review `docs/business/DIRECTOR_CALCULATOR_BUILD.md` for missing features/scenarios
- Verify all inputs, outputs, warnings, and edge cases are documented
- Delete this item when spec matches implementation completely

## Documentation Library (P1)

- Implement docs library per `docs/business/DOCS_LIBRARY_SPEC.md`
- Fumadocs-based `/docs` section explaining every calculator input/output
- HMRC source links on every page ("Trust signals")
- Tooltips with "Learn more" links from calculator fields

## Blog Page Redesign

- Implement blog page redesign per `docs/planning/BLOG_PAGE_BUILD.md`

## Monetization Setup

**Note:** All monetization features are built but disabled for launch. See `docs/guides/MONETIZATION.md` for enabling instructions.

- Find local accountant willing to pay per referral (informal partnership)
- Configure `REFERRAL_PARTNER_EMAIL` env var, then enable CTA in `CalculatorContainer.tsx`
- Enable page at `/pricing/business` when ready (currently returns 404)
- Reach out to finance content creators/newsletters about cross-promotion
- Revisit B2B affiliate partner programs (requires company registration)

## Lighthouse / Performance

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

### MarriageAllowanceAlert Component
- Links to gov.uk instead of internal `/tools/marriage-allowance-calculator`
- Consider linking to internal tool instead

### Embed Widget
- Two routes exist and work together:
  - `/embed` - The actual embeddable calculator (iframe content, noindex)
  - `/tools/embed-widget` - Marketing page with embed code generator
- Decision needed: add link elsewhere (footer, /tools page) or remove both if not launching soon

## Director Calculator - Missing Tests (P0)

> New files added for pro tool have NO test coverage - high risk

### Spec File Implementation
- Uncomment and implement tests in `src/lib/tax/__tests__/directorCalculator.spec.ts` once calculator dev is complete
- 3,000+ line test spec with HMRC CA44 official examples, ruthless edge cases, security tests
- TDD approach: uncomment one test at a time, write minimal code to pass

| File | Risk | Golden Tests Needed |
|------|------|---------------------|
| `src/lib/tax/employeeNI.ts` | Medium | £12,570→£0, £25k→£994.40, £60k→£3,210.60 |
| `src/lib/tax/incomeTax.ts` | High | rUK vs Scotland rates, PA tapering at £100k+ |
| `src/lib/tax/strategyComparison.ts` | **Critical** | All 3 strategies, verify optimal mix beats others |

### Golden Example Test Improvements
- Tighten `directorCalculator.test.ts` golden example tolerances (currently ±30%, should be ±£100)
- Use `toBeCloseTo(expected, -2)` instead of wide `toBeGreaterThan/LessThan` ranges

### Other Income Scenarios (P0)
- Test: Other income (£30k) consumes basic band → dividends hit higher rate sooner
- Test: Other income (£105k) triggers PA taper → affects dividend tax + salary tax
- Test: Scottish vs rUK divergence when salary exceeds PA (Scottish rates differ, dividends same)

### HMRC Sources for Verification
- Income Tax: gov.uk/income-tax-rates
- NI rates: gov.uk/national-insurance-rates-letters  
- Corporation Tax: gov.uk/corporation-tax-rates
- Dividend Tax: gov.uk/tax-on-dividends
- Scottish rates: gov.scot/scottish-income-tax

---

## Other Income Input (P0 - High Impact)

> "Assumes this is your only income" as a footnote is NOT sufficient - can be wrong by thousands

### Consumer Guide - Currently Broken
- `directorCalculator.ts` uses `confirmedSoleIncome: boolean` flag only
- Does NOT accept an amount to adjust tax bands
- **Fix:** Add "Is this your only income?" Yes/No + optional "Roughly how much? £____" field
- If "No/Not sure" selected, show warning: "Personal tax numbers may be too low"
- Add helper text: "Redundancy: only amount over £30,000 counts"

### Pro Tool - Already Correct (verify with tests)
- `strategyComparison.ts` passes `otherIncome` through all calculations ✅
- UI has `otherIncome` input field ✅
- Need tests to verify band consumption and PA taper

### Output Positioning (for users with PAYE history)
- Don't try to net off PAYE withheld in v1.0
- Label clearly: "If you've had PAYE income, treat this set-aside as a safety buffer"

---

## Validation Schema Improvements

### Schema Consistency Constraints
- Consider refinement: if `alreadyTaken === 0` then `alreadyTakenViaPayroll` should be `null`
- Prevents confusing state combinations

### Result Schema Strictness
- `DirectorResultSchema` monetary outputs are plain `z.number()`
- Should add `.finite()` and mostly non-negative constraints
- Currently would accept nonsense like `-999999` for `annualTakeHome`

---

## Director Calculator - "Compare My Setup" Feature (P1) ✅ APPROVED

> **Status:** APPROVED — Option B (Always-On Custom Row) unanimously selected by all 4 reviewers.
> **Full spec:** See `docs/business/DIRECTOR_CALCULATOR_BUILD.md` → "Feature: Compare My Setup Mode"

---

## Director Calculator (Pro Tool) - Post-Review Backlog

> Items identified during 3-reviewer (Grok/Claude/ChatGPT) feedback of Pro calculator

### UI/UX Improvements
- Refactor `DirectorCalculatorClient.tsx` (1,200 lines) into smaller components
- Replace setTimeout .ics hack with combined multi-event .ics file
- Add .ics UID random suffix to prevent collisions
- Soften VAT warning wording ("may need to register promptly")
- Add keyboard-first flow (Enter to calculate)
- Add field-level validation errors (not just generic revenue error)
- Add analytics events: `pro_calculator_started`, `pro_calculator_completed`, `pro_strategy_selected`, `pro_calendar_downloaded`

### Accessibility
- Full keyboard navigation audit for strategy table rows
- ARIA labels for icons/tooltips
- Accordion for assumptions section on mobile

### SA Date Logic (Complex Edge Case)
- Current logic ties SA date to company year-end
- Technically SA deadline depends on tax year income was received
- Consider adding "Income taken in tax year: 2025/26 or 2026/27" input for accuracy




