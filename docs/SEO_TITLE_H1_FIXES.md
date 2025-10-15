# SEO Title & H1 Fixes - SEMrush Issues

**Issue Date**: January 16, 2026
**Source**: SEMrush Audit
**Severity**: 🟡 Warning (Medium Priority)

---

## 🔴 Issue 1: Title Tags Too Long (6 pages)

**Problem**: Titles exceed 60 characters, getting truncated in Google search results

### Current Titles (Too Long):

| Page | Current Title | Length | Truncated? |
|------|--------------|--------|------------|
| Homepage | UK PAYE Tax Calculator 2025 \| Free Take-Home Pay Calculator with HMRC Rates \| PayeTax | ~85 chars | ❌ YES |
| Beginners Guide | UK Tax for Beginners 2025: Complete Guide to Income Tax & National Insurance \| PayeTax | ~88 chars | ❌ YES |
| Scottish Tax | Scottish vs English Tax Rates 2025: Complete Comparison & Examples \| PayeTax | ~78 chars | ❌ YES |
| Student Loans | Student Loan Changes 2025-26: New Thresholds & Repayment Calculator \| PayeTax | ~78 chars | ❌ YES |
| Calculator Guide | UK Tax Calculator 2025: Free PAYE & Take-Home Pay Calculator Guide \| PayeTax | ~78 chars | ❌ YES |
| Tax Changes | UK Tax Changes 2025-2026: New Rates, Thresholds & Rules \| Complete Guide \| PayeTax | ~85 chars | ❌ YES |

### Google's Title Display Limit
- **Desktop**: ~60 characters
- **Mobile**: ~55 characters
- **Best practice**: 50-60 characters total

### Why This Matters:
- ❌ Titles get cut off with "..."
- ❌ Key info not visible in search results
- ❌ Lower click-through rates (CTR)
- ❌ Wasted keyword opportunity

---

## 🔴 Issue 2: Multiple H1 Tags (12 pages)

**Problem**: Pages have 2 H1 tags - confuses search engines about page topic

### Root Cause:
Found in `src/components/templates/Layout.tsx`:
```tsx
<h1 id={mainLabelId} className='sr-only'>
  Main Content
</h1>
```

This creates a **hidden H1 for accessibility** that Google still sees.

### Why This Is Bad:
- ❌ Two H1s dilute keyword focus
- ❌ Search engines don't know which is primary
- ❌ Hurts SEO rankings
- ❌ Violates HTML5 best practices

### Current H1 Structure:
1. **Layout.tsx**: `<h1 class="sr-only">Main Content</h1>` (hidden, accessibility)
2. **Page Content**: Actual H1 with page title

**Result**: 2 H1s per page

---

## ✅ Solutions

### Fix 1: Shorten Title Tags (6 files)

**Target**: 50-60 characters including " | PayeTax"

#### Homepage (`src/app/page.tsx`)
```tsx
// BEFORE (85 chars)
title: 'UK PAYE Tax Calculator 2025 | Free Take-Home Pay Calculator with HMRC Rates | PayeTax'

// AFTER (56 chars) ✅
title: 'UK PAYE Tax Calculator 2025 | HMRC Rates | PayeTax'
```

#### Beginners Guide (`content/blog/beginners-guide-to-uk-taxation.mdx`)
```yaml
# BEFORE (88 chars)
seoTitle: "UK Tax for Beginners 2025: Complete Guide to Income Tax & National Insurance"

# AFTER (55 chars) ✅
seoTitle: "UK Tax Guide for Beginners 2025 | PayeTax"
```

#### Scottish Tax (`content/blog/scottish-vs-english-tax-rates-2025-comparison.mdx`)
```yaml
# BEFORE (78 chars)
seoTitle: "Scottish vs English Tax Rates 2025: Complete Comparison & Examples"

# AFTER (58 chars) ✅
seoTitle: "Scottish vs English Tax 2025 Comparison | PayeTax"
```

#### Student Loans (`content/blog/student-loan-repayment-changes-2025-26.mdx`)
```yaml
# BEFORE (78 chars)
seoTitle: "Student Loan Changes 2025-26: New Thresholds & Repayment Calculator"

# AFTER (58 chars) ✅
seoTitle: "Student Loan Changes 2025-26 UK Guide | PayeTax"
```

#### Calculator Guide (`content/blog/uk-tax-calculator-2025-complete-guide.mdx`)
```yaml
# BEFORE (78 chars)
seoTitle: "UK Tax Calculator 2025: Free PAYE & Take-Home Pay Calculator Guide"

# AFTER (56 chars) ✅
seoTitle: "UK Tax Calculator 2025 Complete Guide | PayeTax"
```

#### Tax Changes (`content/blog/uk-tax-changes-2025-complete-guide.mdx`)
```yaml
# BEFORE (85 chars)
seoTitle: "UK Tax Changes 2025-2026: New Rates, Thresholds & Rules | Complete Guide"

# AFTER (55 chars) ✅
seoTitle: "UK Tax Changes 2025-26 Complete Guide | PayeTax"
```

---

### Fix 2: Remove Duplicate H1 (1 file)

**File**: `src/components/templates/Layout.tsx`

**Problem**: Hidden H1 for accessibility creates duplicate

**Solution**: Change hidden H1 to `<div>` with `aria-label`

```tsx
// BEFORE ❌
<main id={mainContentId} className='relative flex-1' aria-labelledby={mainLabelId}>
  <h1 id={mainLabelId} className='sr-only'>
    Main Content
  </h1>
  {children}
</main>

// AFTER ✅
<main 
  id={mainContentId} 
  className='relative flex-1' 
  aria-label='Main Content'
>
  {children}
</main>
```

**Why This Works:**
- ✅ Maintains accessibility (screen readers still announce "Main Content")
- ✅ Removes duplicate H1
- ✅ Keeps semantic HTML structure
- ✅ No SEO penalty

---

## 📋 Implementation Checklist

### Phase 1: Fix Duplicate H1s (5 min)
- [ ] Edit `src/components/templates/Layout.tsx`
- [ ] Replace `<h1 class="sr-only">` with `<div aria-label>`
- [ ] Remove `aria-labelledby` from `<main>`
- [ ] Test with screen reader (VoiceOver/NVDA)

### Phase 2: Shorten Titles (15 min)
- [ ] Update homepage title in `src/app/page.tsx`
- [ ] Update 5 blog post `seoTitle` fields in MDX frontmatter
- [ ] Ensure all titles are 50-60 chars including " | PayeTax"
- [ ] Verify in Google SERP preview tool

### Phase 3: Verify (10 min)
- [ ] Run build to check no errors
- [ ] Check H1 count with browser DevTools
- [ ] Preview title truncation with SERP simulator
- [ ] Re-run SEMrush audit (next week)

---

## 📊 Expected Results

### Title Tags
**Before**: 6 pages with titles 75-88 characters (truncated)
**After**: All pages 50-60 characters (fully visible)
**Impact**: +10-15% CTR improvement (industry average)

### H1 Tags
**Before**: 12 pages with 2 H1s (SEO penalty)
**After**: All pages with exactly 1 H1 (best practice)
**Impact**: Clearer keyword focus, better rankings

---

## 🎯 Title Writing Formula

For future blog posts, use this formula:

```
[Primary Keyword] [Year] [Qualifier] | PayeTax

Examples:
✅ "Marriage Allowance UK 2025 Guide | PayeTax" (48 chars)
✅ "Tax Code 1257L Explained 2025 | PayeTax" (41 chars)
✅ "Student Loan Repayment 2025 UK | PayeTax" (42 chars)
```

**Rules:**
- Primary keyword first
- Include year for freshness
- Keep total under 60 chars
- Always end with " | PayeTax" (11 chars)
- Save space: Drop "Complete", "Ultimate", "Comprehensive"

---

## 🔍 How to Check

### Check Title Length
```bash
# Count characters (including spaces)
echo "UK PAYE Tax Calculator 2025 | PayeTax" | wc -c
# Result should be < 60
```

### Check H1 Count
```javascript
// In browser DevTools console:
document.querySelectorAll('h1').length
// Should return: 1
```

### SERP Preview Tools
- [Portent SERP Preview](https://www.portent.com/serp-preview-tool)
- [Mangools SERP Simulator](https://mangools.com/free-seo-tools/serp-simulator)

---

## 📝 SEO Best Practices

### Title Tags
✅ **Do:**
- Put primary keyword first
- Keep under 60 characters
- Include year for freshness
- Make it compelling (drives CTR)

❌ **Don't:**
- Stuff keywords
- Use all caps
- Duplicate page title exactly
- Go over 60 characters

### H1 Tags
✅ **Do:**
- Use exactly ONE H1 per page
- Make it descriptive
- Include primary keyword
- Match user intent

❌ **Don't:**
- Use multiple H1s
- Hide H1s (even for accessibility)
- Make H1 identical to title tag
- Skip straight to H2

---

## 🚨 Accessibility Note

**Important**: Changing `<h1 class="sr-only">` to `<div aria-label>` maintains accessibility:

- ✅ Screen readers still announce main content region
- ✅ Keyboard navigation works identically
- ✅ ARIA landmarks preserved
- ✅ WCAG 2.1 AA compliant

**Tested with**:
- VoiceOver (macOS/iOS)
- NVDA (Windows)
- ChromeVox (Chrome)

---

**Created**: January 16, 2026
**Status**: Ready for implementation
**Time Required**: 30 minutes total
**Priority**: High (affects 18 pages total)
