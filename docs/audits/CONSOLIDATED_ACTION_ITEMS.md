# Consolidated Action Items - All Outstanding Work

**Created**: October 13, 2025
**Source**: 7 completed audits
**Total Items**: TBD (consolidating...)
**Estimated Time**: TBD

---

## Overview

This document consolidates ALL outstanding action items from completed audits:
1. ✅ Test Coverage Audit (Grade A - 90.46%)
2. ✅ CI/CD Pipeline Audit (Grade A)
3. ✅ Accessibility Audit (Grade B - 82/100)
4. ✅ Security Audit (completed Oct 12)
5. ✅ Performance Audit (completed Oct 12)
6. ✅ SEO Audit (completed Oct 12)
7. ✅ PWA Completion Audit (completed Oct 12)

---

## 🔴 CRITICAL PRIORITY (Must Do Immediately)

### 1. Fix Failing Tests (Test Coverage Audit)
**Source**: Test Coverage Audit
**Priority**: 🔴 Critical
**Time**: 30 minutes
**Impact**: HIGH - Tests currently failing in CI

**Issue**: 2 API route tests failing due to environment variable handling

**Files to Fix**:
- `src/app/api/feedback/__tests__/route.test.ts:226`
- `src/app/api/error-log/__tests__/route.test.ts:131`

**Action**:
```typescript
// In both test files, add proper env variable mocking:
beforeEach(() => {
  delete process.env.RESEND_API_KEY;
  jest.resetModules();
});

// Then test should properly fail when key is missing
```

**Status**: ❌ Not Started

---

### 2. Test Color Contrast (Accessibility Audit)
**Source**: Accessibility Audit
**Priority**: 🔴 Critical
**Time**: 1 hour
**Impact**: HIGH - WCAG AA requirement

**Issue**: Color contrast not tested, may fail WCAG AA (4.5:1 minimum)

**Action**:
```bash
# Run Lighthouse accessibility audit
npx lighthouse http://localhost:3000 --only-categories=accessibility --view

# Check specific colors:
# - text-muted-foreground (may be too light)
# - text-blue-400, text-green-400 on dark backgrounds
# - Gradient text readability
```

**Status**: ❌ Not Started

---

### 3. Add Rate Limiting (Security Audit)
**Source**: Security Audit
**Priority**: 🔴 Critical (High)
**Time**: 2-3 hours
**Impact**: HIGH - Prevent abuse of API routes

**Issue**: No rate limiting on `/api/feedback` and `/api/error-log`

**Action**:
```typescript
// Install rate limiting library
npm install @upstash/ratelimit @upstash/redis

// Or use simple in-memory rate limiting:
// src/lib/rateLimit.ts
import { LRUCache } from 'lru-cache';

const rateLimit = new LRUCache({
  max: 500,
  ttl: 60000, // 1 minute
});

export function checkRateLimit(ip: string): boolean {
  const requests = rateLimit.get(ip) || 0;
  if (requests >= 10) return false; // 10 requests per minute

  rateLimit.set(ip, requests + 1);
  return true;
}

// Apply to both API routes
```

**Files to Update**:
- `src/app/api/feedback/route.ts`
- `src/app/api/error-log/route.ts`
- Create `src/lib/rateLimit.ts`

**Status**: ❌ Not Started

---

## 🟡 HIGH PRIORITY (This Week)

### 4. Increase Touch Target Sizes (Accessibility Audit)
**Source**: Accessibility Audit
**Priority**: 🟡 High
**Time**: 2 hours
**Impact**: MEDIUM - WCAG 2.5.5 requirement

**Issue**: Touch targets are 36-42px, below WCAG standard of 44px

**Action**:
```typescript
// Update button/link sizes in tailwind.config.ts or component styles
// Minimum touch target: 44x44px

// Example fix:
<Button className="min-h-[44px] min-w-[44px] px-4 py-2">
  Click me
</Button>
```

**Files to Update**:
- All button components
- Navigation links
- Interactive icons
- Form inputs

**Status**: ❌ Not Started

---

### 5. Add Autocomplete Attributes (Accessibility Audit)
**Source**: Accessibility Audit
**Priority**: 🟡 High
**Time**: 1 hour
**Impact**: MEDIUM - WCAG 1.3.5 requirement

**Issue**: Form inputs missing `autocomplete` attributes

**Action**:
```tsx
// Add autocomplete to all form inputs
<Input
  type="email"
  autocomplete="email"  // ← Add this
/>
```

**Files to Update**:
- `src/components/molecules/FeedbackDialog.tsx`
- Any other forms with email/name inputs

**Status**: ❌ Not Started

---

### 6. Add Icons to Color-Only Indicators (Accessibility Audit)
**Source**: Accessibility Audit
**Priority**: 🟡 High
**Time**: 2 hours
**Impact**: MEDIUM - WCAG 1.4.1 requirement

**Issue**: Error/success states rely on color alone

**Action**:
```tsx
// Add icons alongside color indicators
import { AlertCircle, CheckCircle } from 'lucide-react';

<span className="text-red-600">
  <AlertCircle className="inline h-4 w-4" /> Error message
</span>

<span className="text-green-600">
  <CheckCircle className="inline h-4 w-4" /> Success message
</span>
```

**Files to Update**:
- `src/components/molecules/ResultTableRow.tsx`
- Any error/success messages
- Status indicators

**Status**: ❌ Not Started

---

### 7. Add Error Announcements (Accessibility Audit)
**Source**: Accessibility Audit
**Priority**: 🟡 High
**Time**: 1 hour
**Impact**: MEDIUM - WCAG 3.3.1 requirement

**Issue**: Form errors not announced to screen readers

**Action**:
```tsx
// Add aria-live regions for dynamic errors
<div
  role="alert"
  aria-live="polite"
  aria-atomic="true"
>
  {error && <p>{error}</p>}
</div>
```

**Files to Update**:
- `src/components/molecules/FeedbackDialog.tsx`
- Form components with validation

**Status**: ❌ Not Started

---

### 8. Set Secret Detection to Blocking (CI/CD Audit)
**Source**: CI/CD Pipeline Audit
**Priority**: 🟡 High
**Time**: 5 minutes
**Impact**: HIGH - Security

**Issue**: Secret detection allows failures (won't block commits with secrets)

**Action**:
```yaml
# Update .gitlab-ci.yml
secret_detection:
  allow_failure: false  # Change from true
```

**Files to Update**:
- `.gitlab-ci.yml` (line 30)

**Status**: ❌ Not Started

---

### 9. Add Pre-Push Hook (CI/CD Audit)
**Source**: CI/CD Pipeline Audit
**Priority**: 🟡 High
**Time**: 5 minutes
**Impact**: MEDIUM - Prevent broken pushes

**Issue**: No pre-push hook to run full test suite

**Action**:
```bash
# Create .husky/pre-push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🧪 Running tests before push..."
npm run test:quick || {
  echo "❌ Tests failed. Please fix before pushing."
  exit 1
}

echo "✅ Pre-push checks passed!"
```

**Files to Create**:
- `.husky/pre-push`

**Status**: ❌ Not Started

---

### 10. Add CSRF Protection (Security Audit)
**Source**: Security Audit
**Priority**: 🟡 High
**Time**: 2-3 hours
**Impact**: MEDIUM - Security best practice

**Issue**: No CSRF tokens on API routes

**Action**:
```typescript
// Install csrf library
npm install csrf

// Add CSRF middleware
// src/middleware.ts or in API routes
import { Csrf } from 'csrf';

const csrf = new Csrf();

// Generate token for forms
// Validate token in API routes
```

**Files to Update**:
- `src/app/api/feedback/route.ts`
- `src/app/api/error-log/route.ts`
- Add CSRF token to forms

**Status**: ❌ Not Started

---

## 🟢 MEDIUM PRIORITY (Next Sprint)

### 11. Add Blog System Tests (Test Coverage Audit)
**Source**: Test Coverage Audit
**Priority**: 🟢 Medium
**Time**: 4-6 hours
**Impact**: MEDIUM - Blog is key SEO strategy

**Issue**:
- `blog.ts`: 28.87% coverage (should be 80%+)
- `BlogPageClient.tsx`: 0% coverage (should be 70%+)

**Action**:
- Write tests for related posts algorithm
- Test search functionality
- Test pagination logic
- Test category filtering
- Test client-side state management

**Files to Create**:
- `src/lib/__tests__/blog.test.ts` (expand existing)
- `src/app/blog/__tests__/BlogPageClient.test.tsx` (new)

**Status**: ❌ Not Started

---

### 12. Improve Store Function Coverage (Test Coverage Audit)
**Source**: Test Coverage Audit
**Priority**: 🟢 Medium
**Time**: 2-3 hours
**Impact**: MEDIUM - Store heavily used

**Issue**: calculatorStore.ts has 31% function coverage (18 uncovered functions)

**Action**:
- Add integration tests for store actions
- Test complex state update scenarios
- Test persistence logic
- Target: 60%+ function coverage

**Files to Update**:
- `src/store/__tests__/calculatorStore.test.ts`

**Status**: ❌ Not Started

---

### 13. Harden CSP (Security Audit)
**Source**: Security Audit
**Priority**: 🟢 Medium
**Time**: 1-2 hours
**Impact**: MEDIUM - Security hardening

**Issue**: CSP allows 'unsafe-inline' and 'unsafe-eval'

**Action**:
```typescript
// Update next.config.ts
// Remove unsafe-inline/unsafe-eval where possible
// Use nonces for inline scripts
// Switch to hash-based CSP
```

**Files to Update**:
- `next.config.ts` (CSP headers)

**Status**: ❌ Not Started

---

### 14. Add Input Validation (Security Audit)
**Source**: Security Audit
**Priority**: 🟢 Medium
**Time**: 1-2 hours
**Impact**: MEDIUM - Data integrity

**Issue**: Limited input validation on calculator fields

**Action**:
```typescript
// Add comprehensive validation
// - Salary: 0 - 10,000,000
// - Tax code: Valid HMRC format
// - Age: 0-120
// - etc.

// Use Zod for validation
const salarySchema = z.number().min(0).max(10_000_000);
```

**Files to Update**:
- `src/store/calculatorStore.ts`
- Add validation schemas

**Status**: ❌ Not Started

---

### 15. Optimize Bundle Size (Performance Audit)
**Source**: Performance Audit
**Priority**: 🟢 Medium
**Time**: 3-4 hours
**Impact**: MEDIUM - Performance

**Issue**:
- 281 KB unused JavaScript (71% waste)
- TBT 590ms (target: <300ms)

**Actions**:
1. **Code Splitting**: Dynamic imports for heavy components
2. **Tree-Shaking**: Remove unused exports
3. **Defer Third-Party Scripts**: Load GA4/Sentry after page load
4. **Remove Unused Dependencies**: Analyze with `npm run bundle:analyze`

**Files to Update**:
- Various component imports (add `next/dynamic`)
- `src/app/layout.tsx` (defer analytics)
- `package.json` (remove unused deps)

**Status**: ❌ Not Started

---

### 16. Fix PWA Cache Bug (PWA Audit)
**Source**: PWA Completion Audit
**Priority**: 🟢 Medium
**Time**: 15 minutes
**Impact**: LOW - Already fixed in v1.2.0

**Issue**: Service worker cache cleanup references wrong app name

**Action**: ✅ ALREADY FIXED in v1.2.0 (cache names updated to use constants)

**Status**: ✅ Complete

---

### 17. Add Keyboard Shortcuts Documentation (Accessibility Audit)
**Source**: Accessibility Audit
**Priority**: 🟢 Low
**Time**: 1 hour
**Impact**: LOW - Nice to have

**Issue**: No documentation for keyboard shortcuts

**Action**:
- Document Tab navigation
- Document form keyboard shortcuts
- Add help modal with shortcuts list

**Files to Create**:
- Keyboard shortcuts documentation

**Status**: ❌ Not Started

---

### 18. Add Automated A11y Testing (Accessibility Audit)
**Source**: Accessibility Audit
**Priority**: 🟢 Low
**Time**: 2 hours
**Impact**: LOW - Maintenance

**Issue**: No automated accessibility testing in CI

**Action**:
```bash
# Install axe-core or jest-axe
npm install --save-dev jest-axe

# Add to component tests
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('should have no a11y violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Files to Update**:
- `jest.setup.js`
- Component tests

**Status**: ❌ Not Started

---

### 19. Add Pipeline Notifications (CI/CD Audit)
**Source**: CI/CD Pipeline Audit
**Priority**: 🟢 Low
**Time**: 15 minutes
**Impact**: LOW - Better DX

**Issue**: No Slack/Discord/Email notifications on pipeline failures

**Action**:
- Configure GitLab integrations
- Settings → Integrations → Slack
- Add webhook URL
- Enable pipeline failure notifications

**Status**: ❌ Not Started

---

### 20. Update CI Coverage Thresholds (Test Coverage Audit)
**Source**: Test Coverage Audit
**Priority**: 🟢 Low
**Time**: 5 minutes
**Impact**: LOW - Maintenance

**Issue**: Coverage thresholds too low (current coverage 90%, threshold 80%)

**Action**:
```javascript
// Update jest.config.js
coverageThreshold: {
  global: {
    statements: 85,  // Increase from 80
    branches: 80,    // Increase from 75
    functions: 75,   // Increase from 70
    lines: 85,       // Increase from 80
  },
  './src/lib/taxCalculator.ts': {
    statements: 99,
    branches: 97,
    functions: 100,
    lines: 99,
  },
}
```

**Files to Update**:
- `jest.config.js`

**Status**: ❌ Not Started

---

## Summary Statistics

### By Priority

| Priority | Count | Total Time |
|----------|-------|------------|
| 🔴 Critical | 3 | ~4 hours |
| 🟡 High | 7 | ~14 hours |
| 🟢 Medium | 10 | ~22 hours |
| **TOTAL** | **20 items** | **~40 hours** |

---

### By Source Audit

| Audit | Outstanding Items |
|-------|-------------------|
| Test Coverage | 4 |
| Accessibility | 6 |
| CI/CD Pipeline | 3 |
| Security | 4 |
| Performance | 1 |
| PWA | 1 (done) |
| SEO | 0 ✅ |

---

### Quick Wins (<30 min each)

1. ✅ Fix failing tests (30 min)
2. ✅ Set secret detection to blocking (5 min)
3. ✅ Add pre-push hook (5 min)
4. ✅ Add autocomplete attributes (1 hr)
5. ✅ Update CI coverage thresholds (5 min)

**Total Quick Wins**: 5 items, ~2 hours

---

## Recommended Execution Order

### Phase 1: Critical Fixes (Day 1 - 4 hours)
1. Fix failing tests (30 min)
2. Test color contrast (1 hr)
3. Add rate limiting (2-3 hrs)

### Phase 2: High Priority Security & A11y (Day 2-3 - 10 hours)
4. Increase touch targets (2 hrs)
5. Add autocomplete (1 hr)
6. Add icons to color indicators (2 hrs)
7. Add error announcements (1 hr)
8. Add CSRF protection (2-3 hrs)
9. Set secret detection to blocking (5 min)
10. Add pre-push hook (5 min)

### Phase 3: Testing & Validation (Day 4-5 - 8 hours)
11. Add blog system tests (4-6 hrs)
12. Improve store coverage (2-3 hrs)

### Phase 4: Performance & Hardening (Week 2 - 8 hours)
13. Harden CSP (1-2 hrs)
14. Add input validation (1-2 hrs)
15. Optimize bundle size (3-4 hrs)

### Phase 5: Nice-to-Haves (Future)
16-20. Documentation, automation, notifications

---

## Next Steps

1. Review this consolidated list
2. Confirm priorities
3. Start with Phase 1 (Critical Fixes)
4. Track progress in this document

---

**Last Updated**: October 13, 2025
**Status**: Ready for execution
