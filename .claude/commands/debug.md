---
description: Systematic debugging session
argument-hint: [issue description]
---

# /debug - Debugging Session

**CRITICAL INSTRUCTIONS - READ FIRST:**
- Do NOT use the EnterPlanMode tool
- Do NOT save anything to ~/.claude/plans/
- Output ALL findings directly in this conversation as markdown

Start a systematic debugging session for an issue.

## Usage
```
/debug wrong tax calculation for £100k salary
/debug page not rendering on mobile
/debug hydration mismatch error
```

## Debugging Process

### 1. Reproduce
- What are the exact steps?
- What inputs trigger the issue?
- Does it happen consistently?
- What environment? (browser, device, build type)

### 2. Isolate
- When did it start working/breaking?
- What changed recently? (check `git log`)
- Is it code, config, or external service?
- Is it specific to certain inputs?

### 3. Investigate
- Check browser console (client errors)
- Check Sentry (production errors)
- Check build output (Next.js warnings)
- Add strategic console.log statements

### 4. Hypothesize
Form 2-3 hypotheses ranked by likelihood:

| Hypothesis | Likelihood | How to Test |
|------------|------------|-------------|
| A: ... | High | ... |
| B: ... | Medium | ... |
| C: ... | Low | ... |

### 5. Test & Fix
- Test most likely hypothesis first
- Make minimal changes
- Verify fix doesn't break other things
- Add regression test

### 6. Document
- What was the root cause?
- Should we add a test?
- Should we add logging?
- Update docs if needed

## Common Culprits (Next.js + React)

| Symptom | Often Caused By |
|---------|-----------------|
| Hydration mismatch | Date/time rendering, random values, browser APIs in SSR |
| Page blank | Client component missing 'use client', async component error |
| Wrong calculation | Hardcoded tax values (should use taxRates.ts) |
| Layout shift (CLS) | Missing dimensions on images, dynamic content |
| Slow LCP | framer-motion initial={{ opacity: 0 }}, large images |
| State not updating | Zustand selector not reactive, stale closure |
| 404 on refresh | Dynamic route issues, missing generateStaticParams |

## Tax Calculation Debugging

For tax-related bugs:

1. **Verify inputs** - Is the salary/tax code valid?
2. **Check taxRates.ts** - Are rates correct for tax year?
3. **Trace calculation** - Step through the math manually
4. **Compare to HMRC** - Use official calculator
5. **Check edge cases** - £100k taper, Scottish rates

```typescript
// Debug output for tax calculations
console.log({
  salary: input.salary,
  taxYear: input.taxYear,
  taxCode: input.taxCode,
  personalAllowance: calculated.personalAllowance,
  taxableIncome: calculated.taxableIncome,
  incomeTax: calculated.incomeTax,
  ni: calculated.ni,
  takeHome: calculated.takeHome,
});
```

## Useful Commands

```bash
# Development with verbose output
bun run dev --verbose

# Check for TypeScript errors
bun run typecheck

# Check for lint errors
bun run lint

# Run specific test file
bun run test:no-coverage -- taxCalculations

# Check bundle for issues
bun run bundle:analyze
```

## Output Format

```markdown
## Debug: [Issue]

### Reproduction
1. [Step 1]
2. [Step 2]
--> Expected: [X]
--> Actual: [Y]

### Investigation
- Checked: [what you looked at]
- Found: [what you discovered]

### Root Cause
[The actual problem]

### Fix
[What to change, with file:line references]

### Prevention
- [ ] Add test for this case
- [ ] Add validation/error handling
- [ ] Update documentation
```

## Key Files for Debugging

### Configuration
- `next.config.ts` - Build settings
- `tsconfig.json` - TypeScript config
- `sentry.*.config.ts` - Error tracking

### Tax Logic
- `src/constants/taxRates.ts` - Rate definitions
- `src/lib/taxCalculator.ts` - Core calculations
- `src/lib/validation/` - Input schemas

### UI/State
- `src/store/` - Zustand stores
- `src/components/organisms/TaxCalculator/` - Main UI
- `src/app/` - Page components
