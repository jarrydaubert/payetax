# Blog Navigation Issue - Root Cause Analysis

**Date:** November 13, 2025  
**Issue:** Blog page link breaks periodically  
**Root Cause:** Next.js route configuration conflicts

---

## 🔍 Why ONLY the Blog Link Breaks

### The Problem

The blog page uses **dynamic query parameters** (`?category=tax-basics&page=2`) for filtering and pagination. This requires special Next.js configuration that keeps getting changed.

**Other pages don't break because:**
- `/` (Calculator) - Static, no query params
- `/about` - Static page
- `/privacy` - Static page
- `/compliance` - Static page

**Only `/blog` breaks because:**
- Uses `searchParams` (async in Next.js 15+)
- Needs dynamic rendering for query params
- Configuration is sensitive to changes

---

## 📜 History of the Issue

### Commit Timeline (Most Recent First):

**1. Today - Image Loading Attributes**
```
58a622c - Remove all blog image loading attributes
c0e93de - Optimize image loading (added priority/loading)
```
**Issue:** Adding `priority` and `loading="lazy"` to Next.js `<Image>` with `fill` prop caused hydration issues
**Fix:** Removed all explicit loading attributes

**2. November 7 - The Original Fix**
```
e10d0a2 - Resolve Next.js 16 production issues - blog navigation & Radix UI
```
**Change:** `force-dynamic` → `dynamicParams: true` with ISR
**Result:** FIXED blog navigation ✅

**3. Before November 7 - Multiple Attempts**
```
- force-static (broke query params)
- force-dynamic (worked but slower, hydration issues)
- Various ISR configurations
```

---

## ✅ Current Working Configuration

**File:** `src/app/blog/page.tsx`

```typescript
// Next.js 16: Route segment config for optimized blog listing
// Use ISR with revalidation to support dynamic params while maintaining performance
export const revalidate = 3600; // ISR: Revalidate every hour for new posts
export const dynamicParams = true; // Allow dynamic search params

export const metadata: Metadata = {
  title: 'TaxInsights by PayeTax | UK Tax Guidance',
  // ...
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams; // ✅ REQUIRED for Next.js 15+
  const currentPage = params.page ? Number.parseInt(...) : 1;
  const selectedCategory = params.category ? ... : undefined;
  
  // Fetch data...
  return <BlogPageClient {...props} />;
}
```

---

## ⚠️ What BREAKS the Blog

### ❌ DON'T USE:

**1. `export const dynamic = 'force-static'`**
```typescript
export const dynamic = 'force-static'; // ❌ BREAKS QUERY PARAMS!
```
**Why:** Pre-renders page at build time, ignores query params  
**Result:** Category filtering and pagination don't work

**2. `export const dynamic = 'force-dynamic'`**
```typescript
export const dynamic = 'force-dynamic'; // ⚠️ WORKS BUT CAUSES ISSUES
```
**Why:** Works but can cause hydration issues, slower  
**Result:** Blog works but may have random breakages

**3. Adding `priority` or `loading` to Images with `fill`**
```typescript
<Image
  src={post.image}
  fill
  priority // ❌ CAUSES HYDRATION ISSUES!
  loading="lazy" // ❌ CAUSES HYDRATION ISSUES!
/>
```
**Why:** Conflicts with Next.js Image optimization  
**Result:** Blog page doesn't render

---

## ✅ What WORKS

### Correct Configuration:

```typescript
// ✅ USE THIS (Current Working State)
export const revalidate = 3600; // ISR
export const dynamicParams = true; // Allow query params
// NO export const dynamic = ... (let Next.js decide)
```

**Why This Works:**
1. **ISR (`revalidate: 3600`)** - Caches for 1 hour, rebuilds as needed
2. **`dynamicParams: true`** - Allows query params to work
3. **No `dynamic` export** - Let Next.js choose optimal rendering
4. **Async `searchParams`** - Required for Next.js 15+

---

## 🛡️ Prevention Strategy

### **⚠️ CRITICAL: DO NOT MODIFY THESE FILES WITHOUT TESTING**

**Protected Files:**
1. `src/app/blog/page.tsx` - Route configuration
2. `src/app/blog/BlogPageClient.tsx` - Client component with Images

**Before ANY changes to these files:**
1. Run E2E tests: `npx playwright test e2e/blog-filtering-pagination.spec.ts`
2. Test navigation: `npx playwright test e2e/navigation-critical.spec.ts`
3. Verify locally: Click TaxInsights link, test filtering

---

## 🧪 Testing Checklist

**To verify blog is working:**

```bash
# 1. Run blog-specific E2E tests
npx playwright test e2e/blog-filtering-pagination.spec.ts --project=chromium

# 2. Run navigation tests
npx playwright test e2e/navigation-critical.spec.ts --project=chromium

# 3. Build and test locally
npm run build
npm start
# Navigate to http://localhost:3000 and click "TaxInsights"
```

**Expected Results:**
- ✅ Blog page loads
- ✅ 9 posts visible initially
- ✅ Category filtering works
- ✅ Pagination works
- ✅ URL updates with query params

---

## 📝 Code Comments Added

**Added to `src/app/blog/page.tsx`:**

```typescript
// ⚠️ CRITICAL: DO NOT CHANGE THIS CONFIGURATION
// This config has been carefully tuned for Next.js 15/16 compatibility
// History: force-static broke query params, force-dynamic caused hydration issues
// Current config (dynamicParams: true + revalidate) is the ONLY working solution
// See: BLOG-NAVIGATION-FIX.md for full explanation
// Last working: November 13, 2025
export const revalidate = 3600;
export const dynamicParams = true;
```

---

## 🔗 Related Issues

### Next.js Changes That Caused This:

**1. Next.js 15+ `searchParams` is now async**
```typescript
// Old (Next.js 14)
function Page({ searchParams }) {
  const page = searchParams.page; // Sync
}

// New (Next.js 15+)
async function Page({ searchParams }) {
  const params = await searchParams; // Must await!
  const page = params.page;
}
```

**2. ISR Configuration Changes**
- Next.js 15+ prefers `dynamicParams` over `dynamic`
- `force-dynamic` and `force-static` are legacy
- ISR (`revalidate`) works better with `dynamicParams`

**3. Image Component Changes**
- `priority` + `fill` can cause hydration issues
- `loading="lazy"` + `fill` can break rendering
- Best to let Next.js handle optimization automatically

---

## 📊 Summary

### Why Blog Breaks Periodically:

1. **Multiple "fixes" tried** - Each breaking in different ways
2. **Next.js 15/16 changes** - Route configuration evolved
3. **Image optimization attempts** - Adding attributes breaks hydration
4. **Lack of documentation** - No record of what works/doesn't work

### Solution:

1. ✅ **Use current config** (`revalidate` + `dynamicParams`)
2. ✅ **Don't touch Images** (no priority/loading attributes)
3. ✅ **Run E2E tests** before deploying blog changes
4. ✅ **Read this doc** before modifying blog files

---

## 🎯 Action Items

- [x] Document root cause
- [x] Add protective comments to code
- [x] Create this reference document
- [ ] Add pre-commit hook to test blog if these files change
- [ ] Consider making blog page immutable (require override to change)

---

**Last Updated:** November 13, 2025  
**Current Status:** ✅ WORKING  
**Configuration:** `revalidate: 3600` + `dynamicParams: true`  
**Do NOT change without testing!**
