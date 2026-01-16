# CLAUDE.md - PayeTax

UK PAYE Tax Calculator: Accurate, HMRC-compliant tax calculations for take-home pay.

## Working Style

When working on PayeTax, prioritize:

1. **Accuracy-first** - Tax calculations must match HMRC exactly. Verify against official sources.
2. **Single source of truth** - All tax rates live in `src/constants/taxRates.ts`. Never hardcode values.
3. **Test behavior** - Test what users see, not implementation details.
4. **Performance** - Keep bundle <3MB, optimize LCP for above-fold content.

**Before suggesting code changes:**
- Check if the pattern already exists in the codebase
- Verify tax calculations against `src/constants/taxRates.ts`
- Consider accessibility (WCAG 2.2 AA)

**After making changes:**
- Run `bun run fix-all` (format, lint, typecheck)
- Run `bun run test:no-coverage` (fast tests)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 + Turbopack |
| UI | React 19 |
| Language | TypeScript 5.9 (strict) |
| Styling | Tailwind CSS 4 |
| Validation | Zod 4 |
| State | Zustand 5 |
| Testing | Jest + Playwright |
| Linting | Biome |
| Package Manager | Bun |

## Quick Commands

```bash
bun run dev                 # Start dev server
bun run fix-all             # Format, lint, typecheck
bun run test:no-coverage    # Fast tests (~6s)
bun run test                # Full tests with coverage
bun run test:e2e            # Playwright E2E
bun run bundle:analyze      # Bundle analysis
bun run linear:me           # View Linear issues
```

## Project Structure

```
src/
├── app/                    # Next.js pages
├── components/
│   ├── atoms/              # Button, Input, etc.
│   ├── molecules/          # SearchBar, Card, etc.
│   ├── organisms/          # Header, Calculator, etc.
│   └── templates/          # Page layouts
├── lib/
│   ├── validation/         # Zod schemas
│   └── utils/              # Helpers (tax calculations)
├── constants/
│   └── taxRates.ts         # SINGLE SOURCE OF TRUTH for tax rates
├── hooks/                  # Custom React hooks
├── store/                  # Zustand stores
└── types/                  # TypeScript types
```

## UK Tax Domain Knowledge

### Key Concepts

- **PAYE**: Pay As You Earn - UK's tax withholding system
- **Tax Code**: e.g., "1257L" = £12,570 personal allowance (1257 × 10)
- **Personal Allowance**: £12,570 (2024/25, 2025/26) - income below this is tax-free
- **NI (National Insurance)**: Social security contributions

### Tax Bands (England, Wales, NI - 2025/26)

| Band | Rate | Income Range |
|------|------|--------------|
| Personal Allowance | 0% | £0 - £12,570 |
| Basic | 20% | £12,571 - £50,270 |
| Higher | 40% | £50,271 - £125,140 |
| Additional | 45% | £125,140+ |

### Critical Edge Cases

1. **£100k-£125k "Tax Trap"**: Personal allowance tapers at £1 for every £2 over £100k = effective 60% rate
2. **Scottish Residents**: 6 different tax bands (use "S" prefix tax codes)
3. **Student Loans**: Multiple plan types with different thresholds
4. **NI Categories**: A (standard), B, C, H, J, M, Z for different employment types

### Single Source of Truth

All tax rates, thresholds, and allowances are defined in:
```
src/constants/taxRates.ts
```

**NEVER hardcode tax values elsewhere.** If you find hardcoded values, that's a bug.

## Custom Commands

Specialized expert modes available via slash commands:

### Analysis Only (advise, don't implement)

| Command | Role | Use For |
|---------|------|---------|
| `/security` | Security Architect | OWASP, supply chain, modern threats |
| `/audit` | Architecture Reviewer | SOLID principles, code quality |
| `/finance` | UK Tax Specialist | HMRC compliance, calculation accuracy |
| `/plan` | Architect | Feature design, planning |
| `/perf` | Performance Engineer | Core Web Vitals, LCP, bundle analysis |
| `/a11y` | Accessibility Specialist | WCAG 2.2 AA, screen readers, keyboard |

### Implementation (writes code)

| Command | Role | Use For |
|---------|------|---------|
| `/test` | Test Engineer | Coverage gaps, mutation testing |
| `/debug` | Debugger | Fix issues |

## HMRC Compliance

Calculations must match HMRC exactly. Key sources:
- Tax rates: https://www.gov.uk/income-tax-rates
- NI rates: https://www.gov.uk/national-insurance-rates-letters
- Scottish rates: https://www.gov.scot/scottish-income-tax/
- Student loans: https://www.gov.uk/repaying-your-student-loan

When verifying calculations:
1. Use official HMRC calculators for comparison
2. Document expected values with mathematical proof
3. Test edge cases explicitly (£0, £12,570, £50,270, £100,000, £125,140)

## Full Guidelines

See `CONTRIBUTING.md` for complete development guidelines including:
- Testing philosophy
- Code quality standards
- Git workflow
- Linear integration
- Icon usage patterns
