# Component Audit Report
**Date:** 22 October 2025  
**Version:** v3.6.1 (post-cherry-pick)

---

## 📊 Executive Summary

- **Total Files:** 114 (63 source + 51 tests)
- **Highly Used Components:** 8 (Button, Card being top)
- **Unused Components:** 6 (including Field, InputGroup, kbd)
- **Missing Tests:** 7 components
- **Typography Issues:** Inconsistent sizing across components

---

## 🔍 Component Usage Analysis

### ❌ UNUSED/ORPHANED COMPONENTS (6)

**Critical Issues:**

1. **`field.tsx`** - 0 imports
   - **Status:** ⚠️ Recently added shadcn component
   - **Issue:** The problematic horizontal orientation Field was used in commits c9ed59d-b089775 which broke layout
   - **Action:** Either remove OR properly implement with correct flex behavior
   
2. **`input-group.tsx`** - 0 imports  
   - **Status:** ⚠️ Used in BasicInputs v3.6.1 (current) but not detected by grep
   - **Issue:** May have manual imports not caught by pattern matching
   - **Action:** Verify actual usage with direct file inspection

3. **`kbd.tsx`** - 0 imports
   - **Status:** ❌ Truly unused
   - **Action:** Remove if no keyboard shortcut UI planned

4. **`WhatIfInputs.tsx`** - 0 imports
   - **Status:** ⚠️ Actually used in CalculatorInputsSection.tsx
   - **Issue:** Dynamic import may not be detected
   - **Action:** Verify - this is a core feature component

5. **`ComparisonInputs.tsx`** - 0 imports
   - **Status:** ⚠️ Should be used in SalaryComparisonSection
   - **Action:** Verify actual usage

6. **`ComparisonResultsTable.tsx`** - 0 imports
   - **Status:** ⚠️ Should be used in SalaryComparisonSection  
   - **Action:** Verify actual usage

### ⭐ HIGHLY USED COMPONENTS (8)

1. **button.tsx** - 22 imports ✅
2. **card.tsx** - 18 imports ✅
3. **label.tsx** - 6 imports ✅
4. **ScrollIndicator.tsx** - 5 imports ✅
5. **badge.tsx** - 5 imports ✅
6. **input.tsx** - 5 imports ✅
7. **table.tsx** - 5 imports ✅
8. **tooltip.tsx** - 5 imports ✅

---

## 🧪 Test Coverage Analysis

### ⚠️ MISSING TESTS (7 components)

1. **`CategoryFilter.tsx`** - molecules
2. **`MarriageAllowanceAlert.tsx`** - molecules
3. **`TaxTrapInlineAlert.tsx`** - molecules
4. **`WhatIfInputs.tsx`** - organisms ⚠️ CRITICAL
5. **`ComparisonInputs.tsx`** - organisms ⚠️ CRITICAL
6. **`ComparisonResultsTable.tsx`** - organisms (has tests in v3.7.2+)
7. **`SalaryCalculatorPage.tsx`** - salary

**Priority Actions:**
- Add tests for WhatIfInputs and ComparisonInputs (core features)
- Consider adding tests for alert components (user-facing)

---

## 🎨 Typography Consistency Issues

### Current State: INCONSISTENT ❌

**Heading Sizes (Variance Analysis):**

| Element | Sizes Found | Files Affected |
|---------|-------------|----------------|
| H1 | text-4xl, text-2xl sm:text-3xl lg:text-4xl, text-3xl | 3 variants |
| H2 | text-4xl, text-3xl md:text-4xl, text-2xl, text-xl | 4 variants |
| H3 | text-lg, text-xl, text-2xl | 3 variants |

**Body Text Sizes:**

| Purpose | Sizes Found | Consistency |
|---------|-------------|-------------|
| Labels | text-sm | ✅ Consistent |
| Body | text-sm, text-base, text-lg | ❌ Inconsistent |
| Small | text-xs | ✅ Consistent |
| Large | text-xl, text-2xl, text-3xl, text-4xl | ❌ Mixed usage |

### Specific Issues:

1. **Section Headings** - Currently using `text-lg` in:
   - BasicInputs: "Enter Income Tax Details"
   - WhatIfInputs: "What If Scenario"
   - Multiple organisms use `text-4xl` for main headings

2. **Responsive Typography** - Inconsistent breakpoints:
   ```tsx
   // Found multiple patterns:
   text-4xl md:text-5xl         // CalculatorContainer
   text-2xl sm:text-3xl lg:text-4xl // SalaryCalculatorPage
   text-3xl md:text-4xl         // HomePageContent
   text-xs sm:text-sm          // ResultTableRow (older pattern)
   ```

3. **Gradient Text** - Used in 6+ places with same pattern:
   ```tsx
   className='bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end 
              bg-clip-text font-bold text-4xl text-transparent'
   ```
   **Opportunity:** Extract to reusable component/utility

---

## 🔄 Code Duplication Patterns

### High Duplication Areas:

1. **Gradient Headings** (6+ occurrences)
   ```tsx
   // Pattern found in:
   // - CalculatorContainer.tsx (3x)
   // - CalculatorContent.tsx (4x)
   // - SimpleHero.tsx
   // - HomePageContent.tsx
   ```
   **Solution:** Create `<GradientHeading>` component

2. **Muted Text Pattern** (100+ occurrences)
   ```tsx
   className='text-muted-foreground text-sm'
   ```
   **Solution:** Consider utility class or component

3. **Table Headers with responsive sizing** (10+ occurrences)
   ```tsx
   className='min-w-[80px] text-right font-medium text-xs sm:min-w-[90px] ...'
   ```
   **Solution:** Standardize table header component

4. **Card Patterns** (20+ similar structures)
   - CardHeader + CardTitle + CardDescription
   - Could benefit from preset variants

---

## 🎯 Shadcn UI Component Usage

### Well-Used Core Components ✅
- **button** - 22 uses
- **card** - 18 uses  
- **label** - 6 uses
- **tooltip** - 5 uses

### Underutilized Components ⚠️
- **dialog** - 2 uses (FeedbackDialog, potentially more needed)
- **collapsible** - 1 use (CalculatorInputsSection)
- **empty** - 1 use (could be used for "no results" states)
- **separator** - 2 uses (underutilized for section breaks)

### Unused shadcn Components ❌
- **field** - 0 uses (broken in v3.7.x)
- **input-group** - 0 detected (verify manually)
- **kbd** - 0 uses (remove if not planning keyboard shortcuts)

---

## 🏗️ Architecture Opportunities

### 1. Typography System

**Problem:** Inconsistent heading sizes across components

**Solution:** Create typography scale:

```tsx
// Example: src/components/ui/typography.tsx
export const h1 = 'font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight';
export const h2 = 'font-bold text-3xl sm:text-4xl tracking-tight';
export const h3 = 'font-semibold text-xl sm:text-2xl';
export const body = 'text-base';
export const small = 'text-sm';
export const caption = 'text-xs';

// Or use CVA for variant-based component:
const typography = cva('', {
  variants: {
    variant: {
      h1: 'font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight',
      h2: 'font-bold text-3xl sm:text-4xl tracking-tight',
      h3: 'font-semibold text-xl sm:text-2xl',
      // ...
    }
  }
});
```

### 2. Gradient Heading Component

```tsx
// src/components/ui/GradientHeading.tsx
interface GradientHeadingProps {
  level?: 1 | 2 | 3;
  children: React.ReactNode;
  className?: string;
}

export function GradientHeading({ level = 2, children, className }: GradientHeadingProps) {
  const Tag = `h${level}` as const;
  const sizeClasses = {
    1: 'text-4xl sm:text-5xl md:text-6xl',
    2: 'text-3xl sm:text-4xl',
    3: 'text-2xl sm:text-3xl',
  };

  return (
    <Tag 
      className={cn(
        'bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end',
        'bg-clip-text font-bold text-transparent mb-3',
        sizeClasses[level],
        className
      )}
    >
      {children}
    </Tag>
  );
}
```

### 3. Form Field Standardization

**Problem:** BasicInputs uses manual flex layout (v3.6.1) vs Field component (v3.7.x broke)

**Options:**

**Option A:** Stick with manual layout (current v3.6.1)
- ✅ Works reliably
- ❌ More verbose code
- ❌ Less consistent

**Option B:** Fix Field component properly
- ✅ More consistent API
- ✅ Less code duplication
- ⚠️ Requires careful flex behavior tuning

**Recommended:** Option B - Fix Field component

```tsx
// Fix the issue in field.tsx line 58:
// Change from:
'[&>[data-slot=field-label]]:flex-auto',  // This makes labels expand

// To:
'[&>[data-slot=field-label]]:flex-none',  // Labels only take needed space
```

### 4. Table Component Variants

**Problem:** Responsive table headers have repeated patterns

**Solution:** Add table header variants:

```tsx
// In table.tsx
const tableHeadVariants = cva('...', {
  variants: {
    size: {
      responsive: 'min-w-[80px] sm:min-w-[90px] md:min-w-[100px] lg:min-w-[110px]',
      fixed: 'min-w-[80px]',
    },
    highlight: {
      blue: 'bg-blue-500/10',
      purple: 'bg-purple-500/10',
      none: '',
    }
  }
});
```

---

## 🚨 Critical Action Items

### Immediate (This Session)

1. ✅ **Document unused components** 
2. ⚠️ **Verify "unused" components** - Some may have dynamic imports
3. ❌ **Remove truly unused:** kbd.tsx (if confirmed)
4. ✅ **Document typography inconsistencies**

### Short-term (Next 1-2 sessions)

1. **Fix Field component** or decide to remove
2. **Add missing tests** for WhatIfInputs & ComparisonInputs
3. **Create GradientHeading component**
4. **Standardize typography scale**

### Medium-term (Next week)

1. **Refactor to use GradientHeading** across all pages
2. **Add table header variants**
3. **Create typography documentation**
4. **Add tests for alert components**

---

## 📈 Improvement Opportunities

### Code Quality
- **Reduce duplication:** 6+ gradient heading patterns → 1 component
- **Standardize typography:** 10+ heading variants → 3-4 standard sizes
- **Test coverage:** 7 untested components → 0

### Developer Experience  
- **Consistent API:** Field component OR manual layout (pick one)
- **Documentation:** Add Storybook examples (future)
- **Type safety:** Ensure all shadcn components have proper types

### Performance
- **Bundle size:** Remove unused ui/kbd.tsx
- **Code splitting:** Already good (no issues found)

---

## ✅ Strengths

1. **Good test coverage overall:** 51/63 = 81%
2. **Well-organized structure:** Atomic design pattern working well
3. **Popular components are solid:** Button, Card heavily used and stable
4. **UI consistency:** shadcn provides good base

---

## 📝 Recommendations

### Priority 1: Field Component Decision

**Vote: FIX IT** (not remove)

**Rationale:**
- More consistent API across codebase
- Less code duplication
- Better maintainability
- Just needs one line fix (flex-auto → flex-none)

**Action:**
```tsx
// src/components/ui/field.tsx line 58
// Change:
'[&>[data-slot=field-label]]:flex-auto',
// To:
'[&>[data-slot=field-label]]:flex-none',
```

### Priority 2: Typography Standardization

**Create a typography scale** matching current v3.6.1 production:

```tsx
export const typography = {
  // Headings
  h1: 'font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight',
  h2: 'font-bold text-3xl sm:text-4xl tracking-tight',
  h3: 'font-semibold text-xl sm:text-2xl',
  
  // Section headings (for input sections)
  sectionHeading: 'font-semibold text-lg text-foreground',
  
  // Body text
  body: {
    large: 'text-lg text-muted-foreground',
    base: 'text-base',
    small: 'text-sm',
  },
  
  // Specialized
  label: 'text-sm whitespace-nowrap',
  caption: 'text-xs text-muted-foreground',
  mono: 'font-mono text-sm',
};
```

### Priority 3: Add Missing Tests

Order by importance:
1. WhatIfInputs.test.tsx (critical feature)
2. ComparisonInputs.test.tsx (critical feature)  
3. MarriageAllowanceAlert.test.tsx (user-facing)
4. TaxTrapInlineAlert.test.tsx (user-facing)
5. CategoryFilter.test.tsx (blog feature)

---

## 🎬 Next Steps

**For this session:**
1. ✅ Review this audit report
2. Decide on Field component (fix vs remove)
3. Plan typography refactor approach

**For next session:**
1. Implement Field fix
2. Create typography system
3. Add critical component tests
4. Refactor gradient headings

---

**Report End**
