# PAYTAX-113: Typography System Audit

**Date:** November 11, 2025  
**Status:** 🟡 IN PROGRESS  
**Auditor:** Claude (Factory.ai)  
**Parent:** PAYTAX-108 (Codebase Audit v2)

---

## 🎯 Objective

Audit the ENTIRE codebase (src/ AND app/) for hardcoded typography classes and migrate to centralized design tokens.

**Goal:** 95%+ typography token adoption across all files.

---

## 📊 Initial Scan Results

### Files with Hardcoded Typography

**Total files:** 52 files  
**Total occurrences:** 209 hardcoded typography classes  
**Current token adoption:** ~40% (estimated)

###Files Breakdown by Directory:

#### **src/app/ (7 files)** - ⚠️ CRITICAL (This was missed in previous audit!)
1. `src/app/page.tsx` - Home page
2. `src/app/blog/[slug]/page.tsx` - Blog post page
3. `src/app/blog/BlogPageClient.tsx` - Blog list page
4. `src/app/blog/category/[slug]/page.tsx` - Category page
5. `src/app/compliance/CompliancePageClient.tsx` - Compliance page
6. `src/app/privacy/PrivacyPageClient.tsx` - Privacy page
7. `src/app/offline/page.tsx` - Offline page

#### **src/components/atoms/ (11 files)**
8. `src/components/atoms/CookieBanner.tsx`
9. `src/components/atoms/CurrencyDisplay.tsx`
10. `src/components/atoms/EmptyState.tsx`
11. `src/components/atoms/ErrorBoundary.tsx`
12. `src/components/atoms/Field.tsx`
13. `src/components/atoms/GlowButton.tsx`
14. `src/components/atoms/GradientHeading.tsx`
15. `src/components/atoms/RateLabel.tsx`
16. `src/components/atoms/ThemeToggle.tsx`
17. `src/components/atoms/ui/chart.tsx`
18. `src/components/atoms/ui/table.tsx`

#### **src/components/molecules/ (7 files)**
19. `src/components/molecules/CallToAction.tsx`
20. `src/components/molecules/ContentSection.tsx`
21. `src/components/molecules/MarriageAllowanceAlert.tsx`
22. `src/components/molecules/mdx-components.tsx`
23. `src/components/molecules/PopularSalaryLinks.tsx`
24. `src/components/molecules/SalaryQuickResults.tsx`
25. `src/components/molecules/SimpleHero.tsx`
26. `src/components/molecules/SustainabilityBadge.tsx`

#### **src/components/organisms/ (4 files)**
27. `src/components/organisms/CalculatorContainer.tsx`
28. `src/components/organisms/SalaryComparison/MarginalRateInsight.tsx`
29. `src/components/organisms/WhatIfComparison/WhatIfComparisonDisplay.tsx`

#### **src/components/pages/ (2 files)**
30. `src/components/pages/HomePageContent.tsx`
31. `src/components/pages/SalaryCalculatorPage.tsx`

#### **src/lib/ (1 file)**
32. `src/lib/tooltipUtils.tsx`

#### **src/constants/ (1 file)** - Contains token definitions (SKIP)
33. `src/constants/designTokens.ts` - ✅ Token source (don't modify)

#### **Test files (20 files)** - Update if testing typography directly
- Various `__tests__/*.test.tsx` files

---

## 🎨 Available Typography Tokens

```typescript
export const TYPOGRAPHY = {
  TEXT_6XL: 'text-6xl',    // 3.75rem / 60px - Hero headlines
  TEXT_5XL: 'text-5xl',    // 3rem / 48px - Extra large headlines
  TEXT_4XL: 'text-4xl',    // 2.25rem / 36px - Large headlines
  TEXT_3XL: 'text-3xl',    // 1.875rem / 30px - Major headings
  TEXT_2XL: 'text-2xl',    // 1.5rem / 24px - Large headings
  TEXT_XL: 'text-xl',      // 1.25rem / 20px - Section headings
  TEXT_LG: 'text-lg',      // 1.125rem / 18px - Card titles
  TEXT_BASE: 'text-base',  // 1rem / 16px - Body text
  TEXT_SM: 'text-sm',      // 0.875rem / 14px - Labels, small text
  TEXT_XS: 'text-xs',      // 0.75rem / 12px - Helper text
} as const;
```

---

## 🚨 Key Problems Identified

### 1. **src/app/ Directory Completely Ignored** ⚠️ CRITICAL
- 7 page files with hardcoded typography
- These are user-facing pages!
- Previous refactoring work in components/ was never used in actual pages

### 2. **Test Files Not Updated**
- 20 test files still reference old patterns
- Tests won't catch typography violations

### 3. **Inconsistent Patterns**
- Some files mix tokens with hardcoded classes
- No clear adoption strategy

---

## 📋 Migration Strategy (Proper Implementation)

### Phase 1: Critical Pages (src/app/) - 7 files ⚠️ PRIORITY 1
**Why first:** These are the actual user-facing pages that render!

1. `src/app/page.tsx` - Homepage (most important!)
2. `src/app/blog/BlogPageClient.tsx` - Blog list
3. `src/app/blog/[slug]/page.tsx` - Blog posts
4. `src/app/blog/category/[slug]/page.tsx` - Categories
5. `src/app/privacy/PrivacyPageClient.tsx` - Privacy page
6. `src/app/compliance/CompliancePageClient.tsx` - Compliance page
7. `src/app/offline/page.tsx` - Offline page

**Workflow per file:**
1. Read file
2. Find all `text-*` classes
3. Replace with `TYPOGRAPHY.*` tokens
4. Add import: `import { TYPOGRAPHY } from '@/constants/designTokens'`
5. Update className to use `cn()` helper if needed
6. Run `npm run fix-all`
7. Run `npm run build`
8. Test in browser (light + dark mode)
9. Commit

---

### Phase 2: Component Library (components/) - 25 files
**Why second:** These are used by pages, fix them after pages work

#### Priority 2A: Organisms (4 files) - User-facing complex components
1. `src/components/organisms/CalculatorContainer.tsx`
2. `src/components/organisms/SalaryComparison/MarginalRateInsight.tsx`
3. `src/components/organisms/WhatIfComparison/WhatIfComparisonDisplay.tsx`

#### Priority 2B: Molecules (7 files) - Reusable composite components
1. `src/components/molecules/CallToAction.tsx`
2. `src/components/molecules/ContentSection.tsx`
3. `src/components/molecules/MarriageAllowanceAlert.tsx`
4. `src/components/molecules/mdx-components.tsx`
5. `src/components/molecules/PopularSalaryLinks.tsx`
6. `src/components/molecules/SalaryQuickResults.tsx`
7. `src/components/molecules/SimpleHero.tsx`
8. `src/components/molecules/SustainabilityBadge.tsx`

#### Priority 2C: Atoms (11 files) - Basic building blocks
1. `src/components/atoms/CookieBanner.tsx`
2. `src/components/atoms/CurrencyDisplay.tsx`
3. `src/components/atoms/EmptyState.tsx`
4. `src/components/atoms/ErrorBoundary.tsx`
5. `src/components/atoms/Field.tsx`
6. `src/components/atoms/GlowButton.tsx`
7. `src/components/atoms/GradientHeading.tsx`
8. `src/components/atoms/RateLabel.tsx`
9. `src/components/atoms/ThemeToggle.tsx`
10. `src/components/atoms/ui/chart.tsx`
11. `src/components/atoms/ui/table.tsx`

---

### Phase 3: Page Components (2 files)
1. `src/components/pages/HomePageContent.tsx`
2. `src/components/pages/SalaryCalculatorPage.tsx`

---

### Phase 4: Utilities (1 file)
1. `src/lib/tooltipUtils.tsx`

---

### Phase 5: Update Tests (20 files)
- Update test files to use tokens
- Add tests that verify token usage
- Ensure no new hardcoded classes can be added

---

## 🧪 Testing Requirements (MANDATORY)

For EACH file we update, we MUST:

### 1. Visual Testing
```bash
# Start dev server
npm run dev

# Check in browser:
# - Light mode renders correctly
# - Dark mode renders correctly
# - Typography sizes match design
# - No layout shifts
```

### 2. Build Testing
```bash
# Must pass before committing!
npm run fix-all
npm run build
```

### 3. Automated Testing
```bash
# Run tests
npm run test:no-coverage

# If tests fail, fix them!
```

### 4. Accessibility Testing
```bash
# Run a11y tests
npm run audit:a11y
```

---

## ✅ Acceptance Criteria

- [ ] All 32 production files migrated (excludes tests & token file)
- [ ] All test files updated
- [ ] Zero hardcoded typography classes remaining (except in designTokens.ts)
- [ ] `npm run fix-all` passes
- [ ] `npm run build` succeeds
- [ ] All tests pass
- [ ] Visual verification in browser (light + dark mode)
- [ ] Token adoption rate: 95%+

---

## 📊 Success Metrics

**Before:**
- Token adoption: ~40%
- Hardcoded classes: 209
- Files needing update: 52

**After (Target):**
- Token adoption: 95%+
- Hardcoded classes: <10 (only edge cases with justification)
- Files needing update: 0

---

## 🔍 Example Migration

### Before (Hardcoded):
```tsx
<h1 className="text-4xl font-bold mb-8">
  Welcome to PayeTax
</h1>
```

### After (Using Tokens):
```tsx
import { TYPOGRAPHY, SPACING } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

<h1 className={cn('font-bold', TYPOGRAPHY.TEXT_4XL, SPACING.MB_8)}>
  Welcome to PayeTax
</h1>
```

---

## 🚀 Next Steps

1. **Start with src/app/page.tsx** (homepage - most critical!)
2. Work through Phase 1 (all src/app/ files)
3. Test thoroughly after each file
4. Run fix-all and build after each batch
5. Only move to Phase 2 when Phase 1 is complete and tested

---

**STATUS:** Ready to begin Phase 1, File 1 (src/app/page.tsx)
