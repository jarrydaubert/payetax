# PayeTax Product Marketing Context

## Product Overview

**Name:** PayeTax
**URL:** https://payetax.co.uk
**Type:** Free UK PAYE tax calculator
**Focus:** Accuracy, privacy, clear user outcomes

## Target Audience

### Primary Users
- UK employees wanting to understand their take-home pay
- Job seekers comparing salary offers
- Self-employed/directors planning tax-efficient income
- HR professionals checking calculations

### User Intent
- "What's my take-home pay?"
- "How much tax will I pay on £X salary?"
- "Compare salary after tax"
- "Director salary vs dividends"

## Key Features

### Main Calculator
- Annual, monthly, weekly, daily breakdowns
- Tax year selection (current + historical)
- Student loan deductions (Plan 1, 2, 4, 5, PGL)
- Pension contributions (various schemes)
- Scottish/Welsh tax rates
- Marriage Allowance transfer
- Blind Person's Allowance

### Director Intelligence (New)
- Optimal salary/dividend split calculator
- Corporation tax integration
- NI optimization for directors
- Tax-efficient extraction planning

### Programmatic SEO Pages
- `/calculator/[salary]-after-tax` - canonical salary result pages (e.g. `/calculator/70000-after-tax`)
- `/calculator/[salary]` - non-canonical inputs redirected to canonical URLs
- Location-specific pages (coming)

## Positioning

### Value Proposition
"Know exactly what you'll take home. UK's most accurate free PAYE calculator with instant breakdowns."

### Differentiators
- **Accuracy first:** Matches HMRC calculations exactly
- **Privacy:** No account required, no data stored
- **Comprehensive:** All tax codes, student loans, pensions
- **Free:** Full functionality, no paywalls
- **Fast:** Instant results, no loading

### Competitors
- HMRC basic calculator (limited)
- TheSalaryCalculator.co.uk
- ListenToTaxman.com
- MoneySavingExpert calculator
- Reed salary calculator

## Brand Voice

### Tone
- Clear and confident
- Helpful, not salesy
- Professional but approachable
- Numbers-focused, precise

### Avoid
- Jargon without explanation
- Vague claims
- Pushy upsells
- American spellings/terms

## Seasonal Context

### Peak Periods
- **January:** Tax year planning, New Year job changes
- **March-April:** End of tax year, P60 season
- **September:** Graduate job starts, back-to-work

### Content Hooks
- Budget announcements (rates may change)
- Tax year changes (April 6)
- Student loan threshold updates
- NI rate changes

## Current Marketing Channels

### Owned
- Website (payetax.co.uk)
- Email list (nascent)
- Blog (/blog)

### Rented
- Twitter/X
- LinkedIn
- Reddit (UKPersonalFinance)

### SEO
- Programmatic salary pages
- Blog content
- Schema markup (FAQPage, WebApplication)

## Conversion Goals

### Primary
- Calculator usage (engagement)
- Email signup (retention)
- Social shares (growth)

### Secondary
- Director Intelligence usage
- Return visits
- Bookmark/save

## Technical Context

### Stack
- Next.js 16, React 19, TypeScript
- Tailwind CSS 4
- Vercel hosting
- No backend/database (client-side calculations)

### Key Files
- `src/app/page.tsx` - Homepage
- `src/app/calculator/[salary]/page.tsx` - Salary pages
- `src/components/organisms/CalculatorContainer.tsx` - Main calculator
- `src/components/organisms/DirectorGuide/` - Director Intelligence components
- `src/app/tools/director-guide/page.tsx` - Director Intelligence route (display name uses "Director Intelligence")

## Constraints

- No user accounts (privacy-first)
- No ads (clean UX)
- Must match HMRC accuracy
- UK-only focus
- Free tier must be genuinely useful
