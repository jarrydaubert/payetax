---
description: Deep code/architecture audit of a system or file
argument-hint: [target]
---

# /audit - Deep Code Audit

**CRITICAL INSTRUCTIONS - READ FIRST:**
- Do NOT use the EnterPlanMode tool
- Do NOT save anything to ~/.claude/plans/
- Do NOT create any files
- Output ALL audit findings directly in this conversation as markdown

Run a comprehensive audit of the specified system or file.

**Rules:**
- DO NOT write or modify code
- OUTPUT directly in the chat response
- DO identify issues, anti-patterns, and improvements
- DO reference file locations and line numbers
- LEAVE implementation to the builder session

## Usage
```
/audit [target]
```

**Examples:**
- `/audit calculator` - Audit tax calculator system
- `/audit components` - Audit component architecture
- `/audit src/lib/utils/taxCalculations.ts` - Audit specific file
- `/audit performance` - Focus on performance patterns

## Audit Checklist

### Architecture (Atomic Design)
- [ ] Components properly categorized (atoms/molecules/organisms/templates)
- [ ] No logic in atoms (pure presentation)
- [ ] Molecules compose atoms correctly
- [ ] Organisms contain business logic
- [ ] Templates define page layouts only

### Component Patterns
- [ ] Server vs Client components used appropriately
- [ ] 'use client' directive only where needed
- [ ] No unnecessary client-side hydration
- [ ] Proper use of React Server Components

### State Management
- [ ] Zustand stores follow conventions
- [ ] No prop drilling (use stores)
- [ ] State updates are immutable
- [ ] Computed values use selectors

### Validation (Zod)
- [ ] All user inputs have schemas
- [ ] Schemas in `src/lib/validation/`
- [ ] Error messages are user-friendly
- [ ] Type inference used (`z.infer<typeof schema>`)

### TypeScript
- [ ] Strict mode enabled
- [ ] No `any` types (use `unknown` + type guards)
- [ ] Explicit return types on functions
- [ ] Proper interface vs type usage

### Performance
- [ ] Bundle size under 3MB
- [ ] Dynamic imports for heavy components
- [ ] Images optimized (WebP, proper sizing)
- [ ] No blocking scripts above fold

### Accessibility (WCAG 2.2 AA)
- [ ] Semantic HTML elements
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Color contrast meets 4.5:1 ratio

### Error Handling
- [ ] User-friendly error messages
- [ ] Errors logged to Sentry
- [ ] Graceful degradation on failures
- [ ] No unhandled promise rejections

## Output Format

Provide findings as:

| Issue | Severity | Location | Recommendation |
|-------|----------|----------|----------------|
| ... | CRITICAL/HIGH/MEDIUM/LOW | file:line | ... |

## Key Files to Review

### Core Architecture
- `src/components/` - Component hierarchy
- `src/store/` - Zustand stores
- `src/lib/validation/` - Zod schemas
- `src/constants/` - Configuration

### Tax Calculations
- `src/lib/utils/taxCalculations.ts` - Core logic
- `src/constants/taxRates.ts` - Rate definitions
- `src/components/organisms/TaxCalculator/` - Calculator UI

### Configuration
- `next.config.ts` - Next.js settings
- `tsconfig.json` - TypeScript settings
- `biome.json` - Linting rules
