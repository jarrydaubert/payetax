# Backlog

> **This is a TODO list only.** No status tracking - when something is done, delete it.
> Keep items actionable and specific. If it's not actionable, it doesn't belong here.

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

## Director Guide - Consumer Version Features

> Features from DIRECTOR_TOOLS.md spec for the consumer-facing guide (education-first)

### Core Consumer UX (P0)
- Entry choice routing: "I'm new — explain and keep it simple" vs "I know the basics — go straight to the calculator"
- Education-first flow with sections: Understand → Calculate → Plan → Next Steps
- "Sleep at Night" status indicator (🟢🟡🔴) based on set-aside coverage
- Tax Bathtub visualization - visual metaphor for money flow (revenue → expenses → tax pots → take-home)
- Jargon tooltips on EVERY technical term (Wife Test compliance)
- "Safe Monthly Draw (Estimate)" - renamed from "Spendable Now" with cash check reminder

### Educational Content
- "How can I take money from my company?" explainer (Salary vs Dividends vs Director's Loan)
- FAQ section: "Can I just transfer money to my personal account?", "What if my company has no profit yet?", "Do I need to run payroll for just myself?"
- "When to DIY vs When to get an accountant" guidance section
- Questions to ask an accountant template

### First-Year Director Guidance
- "Expenses you might not have thought of" card: accountant fees (£500-2000), payroll software (£100+), Companies House filing (£13), professional indemnity insurance, registered office service
- "Keep a buffer in your business account" recommendation (e.g. 3 months running costs)
- "Your first year costs more" warning - setup costs, accountant onboarding, software subscriptions
- Expense estimation helper for first-timers who don't know their costs yet

### Wizard Flow (Stepper)
- Step 1: Your situation (profit, year-end, VAT, already taken)
- Step 2: Your options (plain English education)
- Step 3: The simple safe approach (£12,570 salary recommendation)
- Step 4: Your numbers + set-asides
- Step 5: Key dates + reminders

### Visualizations
- Money flow diagram (Sankey or bathtub style)
- Two pots visual split (Company Account vs Personal Savings)
- Progress stepper for wizard flow

### Nice-to-Have (P1)
- "Share with my accountant" button (pre-filled message + UTM)
- Glossary drawer (centralized jargon definitions)
- Input confidence level toggle ("rough estimate" vs "from accounts")
- PDF export of results (gated behind email capture for P2)

## Director Calculator - Missing Tests (P0)

> New files added for pro tool have NO test coverage - high risk

| File | Risk | Golden Tests Needed |
|------|------|---------------------|
| `src/lib/tax/employeeNI.ts` | Medium | £12,570→£0, £25k→£994.40, £60k→£3,210.60 |
| `src/lib/tax/incomeTax.ts` | High | rUK vs Scotland rates, PA tapering at £100k+ |
| `src/lib/tax/strategyComparison.ts` | **Critical** | All 3 strategies, verify optimal mix beats others |

### HMRC Sources for Verification
- Income Tax: gov.uk/income-tax-rates
- NI rates: gov.uk/national-insurance-rates-letters  
- Corporation Tax: gov.uk/corporation-tax-rates
- Dividend Tax: gov.uk/tax-on-dividends
- Scottish rates: gov.scot/scottish-income-tax

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

---

## Director Guide (Consumer) - Post-Review Backlog

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


