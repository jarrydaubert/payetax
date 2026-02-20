---
description: Deep code/architecture audit of a system or file
argument-hint: [target]
---

# /audit - Deep Code Audit

**CRITICAL INSTRUCTIONS:**
- Do NOT use planning/spec modes or persist artifacts to disk
- Output ALL audit findings directly in this conversation as markdown
- Do NOT write or modify code (small illustrative snippets for fixes are OK)
- If a file isn't provided, list what's needed and proceed with best-effort; do not invent content
- Tax Pack pre-live guardrail: Tax Pack is planned (not live); unless explicitly requested, audit shipped flows only and mark Tax Pack gaps as deferred.

## Severity Definitions

| Level | Criteria |
|-------|----------|
| **CRITICAL** | Security exploit, tax correctness error, data loss, legal/compliance exposure |
| **HIGH** | User-facing correctness, broken flows, major perf regressions, trust issues |
| **MEDIUM** | Maintainability, test gaps, minor perf issues, code quality |
| **LOW** | Style consistency, minor refactors, documentation |

## Usage

```
/audit [target]
```

**Allowed targets:**
- `calculator` - Tax calculator system (taxCalculator.ts, CalculatorContainer, taxRates.ts)
- `director` - Director Intelligence (`/tools/director-guide` page, send-director-results API)
- `emails` - Email flows (newsletter, send-results, welcome templates)
- `api` - API routes (all /api/* endpoints)
- `security` - Security focus (auth, rate limiting, tokens, headers, PII)
- `performance` - Performance patterns (bundle, LCP, hydration)
- `components` - Component architecture (atoms/molecules/organisms)
- `[file path]` - Specific file audit

**Constraints:**
- Max 30 findings in main table; collapse additional into "Additional Notes"
- If line numbers cannot be verified from provided content, use `file + symbol/section + snippet`

## Required Output Format

### 1. Scope & Evidence (required)
List what was actually reviewed:
- Files examined (with commit/ref if available)
- What was inferred vs directly observed
- What could NOT be verified (needs measurement/runtime)

### 2. Prioritized Summary (required)
Before the full table:
- **Stop-ship items** (if any)
- **Top 5 risks** (with brief "why")
- **Top 5 quick wins** (low effort / high impact)

### 3. Findings Table

| Issue | Severity | Location | Evidence | Recommendation |
|-------|----------|----------|----------|----------------|
| ... | CRITICAL/HIGH/MEDIUM/LOW | file:line or file + section | Verified/Inferred/Unverified | ... |

**Evidence tags:**
- `Verified` - Seen in provided code
- `Inferred` - Reasonable assumption not directly observed
- `Unverified` - Needs measurement / runtime / repo access

### 4. Non-goals & Assumptions
What was intentionally out of scope and key assumptions made.

---

## Audit Checklists

### Tax Correctness (PayeTax-specific)
- [ ] Calculations match HMRC official rates/thresholds
- [ ] Edge cases handled (£100k trap, Scottish rates, student loan plans)
- [ ] Rounding follows HMRC conventions
- [ ] Tax year versioning correct (rates come from taxRates.ts)
- [ ] Disclaimers present on calculation outputs
- [ ] Golden master tests cover critical scenarios

### Security & Privacy
- [ ] No PII in logs (emails, salaries, IPs sanitized)
- [ ] Rate limiting on public endpoints (not using global "unknown" bucket)
- [ ] Signed tokens for sensitive operations (unsubscribe, email results)
- [ ] CSRF protection (origin/referer checks on POST)
- [ ] Body size limits on API routes
- [ ] Secrets in env vars, not code (fail closed in production)
- [ ] HTML escaping on email template interpolations
- [ ] No email enumeration side-channels
- [ ] Security headers (CSP, X-Content-Type-Options, Referrer-Policy)

### Architecture (if repo uses Atomic Design)
- [ ] Components categorized appropriately (atoms/molecules/organisms/templates)
- [ ] Atoms are pure presentation (minimal/no logic)
- [ ] Molecules compose atoms; organisms contain business logic
- [ ] Templates define page layouts only

### SOLID Principles
- [ ] **Single Responsibility** - Each module has one reason to change
- [ ] **Open/Closed** - Open for extension, closed for modification
- [ ] **Liskov Substitution** - Subtypes substitutable for base types
- [ ] **Interface Segregation** - Small, focused interfaces
- [ ] **Dependency Inversion** - Depend on abstractions

### Clean Code (guidelines, not absolutes)
- [ ] Functions generally <20 lines (exceptions for pure mapping/formatting)
- [ ] Generally ≤3 parameters (consider options object for more)
- [ ] No magic numbers (use named constants)
- [ ] Meaningful variable names
- [ ] No commented-out code
- [ ] No TODO/FIXME without tracked issue (Linear/GitHub/Jira)

### Component Patterns
- [ ] Server vs Client components used appropriately
- [ ] 'use client' only where needed
- [ ] No unnecessary client-side hydration

### State Management
- [ ] Zustand stores follow conventions
- [ ] Avoid prop drilling beyond 2 levels (prefer composition/context before global stores)
- [ ] State updates are immutable
- [ ] Computed values use selectors

### Validation (Zod)
- [ ] User inputs have schemas with bounds (finite, min/max)
- [ ] Schemas in `src/lib/validation/`
- [ ] User-friendly error messages
- [ ] Type inference used (`z.infer<typeof schema>`)

### TypeScript
- [ ] Strict mode enabled
- [ ] No `any` types (use `unknown` + type guards)
- [ ] Explicit return types on exported functions
- [ ] No unsafe type casts (`as X`) without justification

### Performance (may require measurement - mark Unverified if not checked)
- [ ] Bundle size under 3MB (check with `bun run bundle:analyze`)
- [ ] Dynamic imports for heavy components
- [ ] Images optimized (WebP, proper sizing)
- [ ] No blocking scripts above fold

### Accessibility (WCAG 2.2 AA) (may require runtime check)
- [ ] Semantic HTML elements
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Color contrast meets 4.5:1 ratio

### Error Handling
- [ ] User-friendly error messages
- [ ] Errors logged to observability tool (Sentry/equivalent)
- [ ] Graceful degradation on failures
- [ ] No unhandled promise rejections

---

## Key Files by Target

### calculator
- `src/lib/taxCalculator.ts` - Core logic
- `src/constants/taxRates.ts` - Rate definitions
- `src/components/organisms/CalculatorContainer.tsx` - UI

### director
- `src/app/tools/director-guide/page.tsx`
- `src/app/api/send-director-results/route.ts`
- `src/components/organisms/DirectorGuide/`

### emails
- `emails/welcome.tsx`, `emails/new-blog-post.tsx`
- `src/app/api/newsletter/subscribe/route.ts`
- `src/app/api/newsletter/unsubscribe/route.ts`
- `src/app/api/send-results/route.ts`

### api
- `src/app/api/**/*.ts`

### security
- Rate limiting: `src/lib/rateLimit.ts`
- Token generation: `emails/welcome.tsx` (generateUnsubscribeToken)
- All API routes for auth/headers/body limits
