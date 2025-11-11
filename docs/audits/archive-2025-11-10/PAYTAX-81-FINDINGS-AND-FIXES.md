# PAYTAX-81: Accessibility Audit Findings & Required Fixes

**Status:** 🔴 **BLOCKED - 16 failures must be fixed before completion**  
**Date:** November 8, 2025  
**Test File:** `e2e/accessibility-wcag22.spec.ts` (consolidated, best practices)  
**Standard:** WCAG 2.2 Level AA  

---

## 📊 Test Results Summary

**Current Status:** 30/46 tests passing (65% pass rate)

| Test Category | Passed | Failed | Status |
|---------------|--------|--------|--------|
| Desktop + Light Mode | 0/8 pages | 8/8 pages | ❌ All failing |
| Desktop + Dark Mode | 8/8 pages | 0/8 pages | ✅ Perfect |
| Mobile + Light Mode | TBD | TBD | ⏳ Pending |
| Mobile + Dark Mode | TBD | TBD | ⏳ Pending |

**Key Finding:** Dark mode is 100% accessible ✅. Light mode has structural HTML issues ❌.

---

## 🐛 Issues Found

### **NOT Color Contrast!**
Initial testing suggested color contrast issues, but **comprehensive testing revealed structural/semantic HTML problems**.

### Actual Issues:

#### 1. **Duplicate contentinfo Landmarks** (HIGH PRIORITY)
- **Problem:** Multiple `<footer>` elements create duplicate contentinfo landmarks
- **Location:** `Layout.tsx` wraps `<Footer>` component in `<footer>` tag
- **Impact:** Moderate (confuses screen readers)
- **Affected Pages:** ALL pages
- **WCAG Criterion:** 1.3.1 Info and Relationships (Level A)

**Current Code:**
```tsx
// Layout.tsx (WRONG)
<footer>
  <Footer />  {/* Footer.tsx also has <footer> inside */}
</footer>
```

**Fix:**
```tsx
// Layout.tsx (CORRECT)
<Footer />  {/* Footer component handles its own <footer> tag */}
```

---

#### 2. **Landmark Nesting Violations** (HIGH PRIORITY)
- **Problem:** contentinfo landmark nested inside other landmarks
- **Location:** `Layout.tsx` structure
- **Impact:** Moderate (violates landmark hierarchy)
- **Affected Pages:** ALL pages
- **WCAG Criterion:** 1.3.1 Info and Relationships (Level A)

**Fix:** Remove wrapper `<footer>` tag from Layout.tsx

---

#### 3. **Duplicate main Landmarks** (HIGH PRIORITY)
- **Problem:** Multiple `<main>` elements or id="main-content"
- **Location:** `Layout.tsx` has `<main>`, SimpleHero.tsx also has `id="main-content"`
- **Impact:** Moderate (confuses navigation)
- **Affected Pages:** Homepage, possibly others
- **WCAG Criterion:** 1.3.1 Info and Relationships (Level A)

**Current:**
```tsx
// Layout.tsx
<main id={mainContentId}>...</main>

// SimpleHero.tsx
<section id="main-content">...</section>
```

**Fix:** Use one consistent ID approach:
```tsx
// Layout.tsx - Use static ID
<main id="main-content">...</main>

// SimpleHero.tsx - Remove duplicate ID
<section>...</section>
```

---

#### 4. **Skip Link Target Issues** (HIGH PRIORITY)
- **Problem:** Skip link target uses dynamic ID from `useId()`, may not match actual target
- **Location:** Layout.tsx
- **Impact:** Moderate (skip link may not work)
- **Affected Pages:** ALL pages
- **WCAG Criterion:** 2.4.1 Bypass Blocks (Level A)

**Current:**
```tsx
const mainContentId = useId(); // Generates random ID like ":r1:"
<a href={`#${mainContentId}`}>Skip to main content</a>
<main id={mainContentId}>...</main>
```

**Fix:** Use static, predictable ID:
```tsx
<a href="#main-content">Skip to main content</a>
<main id="main-content">...</main>
```

---

#### 5. **Heading Order Violations** (MEDIUM PRIORITY)
- **Problem:** Heading levels skip (h1 → h3, skipping h2)
- **Location:** Calculator page, Compliance page
- **Impact:** Moderate (confuses document outline)
- **Affected Pages:** Calculator, Compliance (2-3 pages)
- **WCAG Criterion:** 1.3.1 Info and Relationships (Level A)

**Fix:** Ensure sequential heading order:
- h1 (page title)
- h2 (major sections)
- h3 (subsections)
- Never skip levels

---

#### 6. **Meta Viewport Zoom Restriction** (LOW PRIORITY)
- **Problem:** Viewport may restrict zoom to less than 500%
- **Location:** `app/layout.tsx` or `next.config.ts`
- **Impact:** Minor (affects zoom accessibility)
- **Affected Pages:** ALL pages
- **WCAG Criterion:** 1.4.4 Resize Text (Level AA)

**Current:** (check `app/layout.tsx`)
```tsx
viewport: {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // ❌ WRONG - restricts zoom
}
```

**Fix:**
```tsx
viewport: {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // ✅ Allow 500% zoom
  userScalable: true, // ✅ Allow user zoom
}
```

Or simply:
```tsx
viewport: 'width=device-width, initial-scale=1' // No max-scale = infinite zoom ✅
```

---

## 🔧 Fix Implementation Priority

### Phase 1: Critical Fixes (15 minutes)
1. ✅ Remove `<footer>` wrapper from `Layout.tsx` (line 37)
2. ✅ Change dynamic skip link ID to static "main-content"
3. ✅ Remove duplicate `id="main-content"` from SimpleHero.tsx
4. ✅ Fix meta viewport to allow 500% zoom

### Phase 2: Content Fixes (10 minutes)
5. ✅ Fix heading order on Calculator page
6. ✅ Fix heading order on Compliance page

### Phase 3: Verification (5 minutes)
7. ✅ Run `npx playwright test e2e/accessibility-wcag22.spec.ts`
8. ✅ Confirm 46/46 tests pass (100%)

**Total Estimated Time:** 30 minutes

---

## 📝 Implementation Steps

### Step 1: Fix Layout.tsx

```tsx
// BEFORE
<footer>
  <Footer />
</footer>

// AFTER
<Footer />
```

```tsx
// BEFORE
const mainContentId = useId();
<a href={`#${mainContentId}`} className='skip-link'>
<main id={mainContentId}>

// AFTER
<a href="#main-content" className='skip-link'>
<main id="main-content">
```

### Step 2: Fix SimpleHero.tsx

```tsx
// BEFORE
<section id='main-content' ...>

// AFTER  
<section> {/* Remove id, Layout.tsx owns #main-content */}
```

### Step 3: Fix app/layout.tsx Viewport

```tsx
// BEFORE
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // ❌
}

// AFTER
export const viewport = 'width=device-width, initial-scale=1'; // ✅ No zoom restriction
```

### Step 4: Fix Heading Order

Audit calculator and compliance pages:
- Ensure h1 → h2 → h3 sequential
- No skipping levels
- Use browser DevTools to check heading outline

### Step 5: Run Tests

```bash
# Run consolidated accessibility tests
npx playwright test e2e/accessibility-wcag22.spec.ts --project=chromium

# Expected: 46/46 passing ✅
```

---

## 🎯 Success Criteria

**PAYTAX-81 can ONLY be marked complete when:**

1. ✅ All 46 tests in `e2e/accessibility-wcag22.spec.ts` pass
2. ✅ No WCAG 2.2 Level AA violations found by axe-core
3. ✅ Desktop + Mobile × Light + Dark = 100% passing
4. ✅ All pages tested: 8 pages × 2 viewports × 2 themes
5. ✅ Interactive elements tested (tooltips, menus, forms)
6. ✅ Error pages tested (404, offline)
7. ✅ Blog dynamic content tested

**Do NOT mark complete with any failing tests.**

---

## 📚 References

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Landmark Regions](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/)
- [Skip Links](https://webaim.org/techniques/skipnav/)
- [Heading Order](https://www.w3.org/WAI/tutorials/page-structure/headings/)

---

## 📈 Progress Tracking

- [x] Comprehensive test suite created (`accessibility-wcag22.spec.ts`)
- [x] Issues identified (6 specific problems)
- [ ] Fix #1: Duplicate footer landmarks
- [ ] Fix #2: Landmark nesting
- [ ] Fix #3: Duplicate main landmarks
- [ ] Fix #4: Skip link target
- [ ] Fix #5: Heading order
- [ ] Fix #6: Meta viewport zoom
- [ ] All tests passing (46/46)
- [ ] Audit document updated
- [ ] PAYTAX-81 marked complete in Linear

**Current Blocker:** Need to implement fixes above before marking complete.

---

**Next Action:** Implement Phase 1 fixes (15 minutes) and re-run tests.
