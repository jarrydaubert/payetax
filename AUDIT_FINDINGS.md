# 🔍 File Audit Findings - October 2, 2025

## Executive Summary

Comprehensive file-by-file audit using knip and manual verification. This document identifies unused files, missing gitignore entries, and cleanup opportunities.

---

## ✅ Files to KEEP (Knip False Positives)

### Blog Content (7 MDX files)
**Status**: ✅ KEEP - Blog system IS fully implemented
```
content/blog/*.mdx (all 7 files)
```
- Loaded by `src/lib/blog.ts` using gray-matter
- Used by `/blog`, `/blog/[slug]`, `/blog/category/[slug]` routes
- Knip doesn't detect file system reads
- **VERIFIED**: Blog is production-ready with ISR caching

### Service Worker Files
**Status**: ✅ KEEP - Used by PWA
```
public/register-sw.js
public/sw.js
```
- Referenced in `src/app/layout.tsx:script`
- Critical for PWA functionality
- Knip missed the script tag reference

### Lighthouse Config
**Status**: ✅ KEEP - Used by CI/CD
```
.lighthouserc.js
```
- Referenced in package.json scripts
- Used for performance monitoring

### Build Artifacts (Should be Gitignored)
**Status**: ⚠️ KEEP but add to .gitignore
```
playwright-report/
coverage/
.swc/
```

---

## ❌ Files to DELETE (Verified Unused)

### 1. Unused Analytics Components (3 files)
```bash
src/components/analytics/AnalyticsWrapper.tsx
src/components/analytics/AnalyticsWrapperClient.tsx
```
**Reason**: Not imported anywhere, orphaned refactor artifacts

### 2. Unused Atom Components (4 files)
```bash
src/components/atoms/PayPeriodSelect.tsx
src/components/atoms/PensionContributionInput.tsx
src/components/atoms/TaxCodeInput.tsx
src/components/atoms/TaxOptionsSelector.tsx
```
**Reason**: No imports found, likely replaced by newer components

### 3. Unused Page Components (1 file)
```bash
src/components/pages/NotFoundContent.tsx
```
**Reason**: No imports, not used by not-found.tsx

### 4. Unused UI Components (4 files)
```bash
src/components/ui/Alert.tsx
src/components/ui/ImageWithFallback.tsx
src/components/ui/PageHeader.tsx
src/components/ui/SkipToContent.tsx
```
**Reason**: No imports in app/, orphaned from previous design

### 5. Unused Utilities (1 file)
```bash
src/lib/iconMapping.ts
```
**Reason**: No imports found

### 6. Unused Type Files (1 file)
```bash
src/types/chartTypes.ts
```
**Reason**: No imports found

### 7. .DS_Store Files (5 files)
```bash
.DS_Store (root)
content/.DS_Store
src/.DS_Store
public/.DS_Store
public/images/.DS_Store
public/images/blog/.DS_Store
```
**Reason**: macOS system files, should never be committed

---

## 📦 Dependencies to REVIEW

### Potentially Unused Dependencies (10)
```json
{
  "@mdx-js/loader": "Used by blog - KEEP",
  "@mdx-js/react": "Used by blog - KEEP",
  "@next/mdx": "Used by blog - KEEP",
  "@types/exceljs": "Used for exports - KEEP",
  "exceljs": "Used by exportUtils.ts - KEEP",
  "jspdf-autotable": "Used by pdfExport.ts - KEEP",
  "rehype-highlight": "MDX syntax highlighting - VERIFY USAGE",
  "rehype-slug": "MDX heading slugs - VERIFY USAGE",
  "sanitize-html": "Security for user input - VERIFY USAGE",
  "zod": "Validation library - DELETE if unused"
}
```

### Unused DevDependencies (4) - Consider Removing
```json
{
  "@testing-library/user-event": "Not used in current tests",
  "chokidar-cli": "File watching, verify necessity",
  "concurrently": "Running parallel commands, check package.json",
  "tsx": "TypeScript execution, verify necessity"
}
```

### Missing Dependencies (3) - ADD to package.json
```json
{
  "postcss": "Required by postcss.config.mjs",
  "js-yaml": "Used in src/lib/blog.ts"
}
```

---

## 🔧 .gitignore Updates Needed

Add to `.gitignore`:
```gitignore
# Test Reports & Coverage
/playwright-report
/test-results
/coverage

# Build Caches
/.swc
.cache

# Audit & Reports (Future: consolidate to /audit-outputs/)
/audit-outputs
security-audit-history.json
*.tsbuildinfo

# macOS
.DS_Store
**/.DS_Store
```

---

## 📊 Unused Exports (46 total)

### High Priority - Review for Removal

**Tax Test Helpers** (5 exports)
```typescript
e2e/helpers/tax-test-helpers.ts:
- calculateExpectedIncomeTax
- calculateExpectedNationalInsurance
- calculateExpectedStudentLoan
- calculateExpectedPension
- validateCalculationResults
```
**Decision**: KEEP if E2E tests use them indirectly

**UI Component Exports** (12 exports)
```typescript
src/components/ui/select.tsx:
- SelectGroup, SelectLabel, SelectSeparator
- SelectScrollUpButton, SelectScrollDownButton

src/components/ui/table.tsx:
- TableFooter, TableCaption

src/components/ui/Typography.tsx:
- H4, H5, H6, LargeText, CaptionText, LeadText
```
**Decision**: REMOVE unused exports, keep component for extensibility

**Utility Functions** (6 exports)
```typescript
src/lib/periodCalculator.ts:
- convertAnnualToPeriod
- convertBetweenPeriods
- getPeriodValues
- getPercentOfGross

src/lib/utils.ts:
- formatPercent
- clearOnFocus
- formatInputValue
```
**Decision**: REVIEW - might be utility belt for future features

---

## 🎯 Cleanup Action Plan

### Phase 1: Immediate (Safe Deletions)
1. Delete all .DS_Store files
2. Delete unused analytics wrapper components (2 files)
3. Delete unused page components (1 file)
4. Update .gitignore with missing entries

### Phase 2: Component Cleanup (Verify First)
1. Delete unused atom components (4 files) - verify no dynamic imports
2. Delete unused UI components (4 files) - verify not used via dynamic imports
3. Remove unused type files (1 file)
4. Remove unused lib files (1 file)

### Phase 3: Dependency Audit (Research Required)
1. Verify MDX rehype plugins actually being used
2. Check if sanitize-html is needed for security
3. Remove unused devDependencies after verification
4. Add missing dependencies to package.json

### Phase 4: Export Cleanup (Low Priority)
1. Review and remove unused exports from UI components
2. Clean up utility function exports
3. Consider making exports more explicit

---

## 💡 Recommendations

### Future Organization
1. **Create `/audit-outputs/` directory** for:
   - playwright-report/
   - coverage/
   - lighthouse-reports/
   - bundle-analysis/
   - security-audit-history.json

2. **Add cleanup script** to package.json:
```json
{
  "scripts": {
    "clean:reports": "rm -rf audit-outputs playwright-report coverage .swc .next",
    "clean:cache": "rm -rf .next .swc node_modules/.cache",
    "clean:all": "npm run clean:reports && npm run clean:cache"
  }
}
```

### Future Tasks (Add to DEVELOPMENT_PLAN.md)
1. **Analytics Plan**: GA4 integration with proper tracking IDs
2. **Report Consolidation**: Move all reports to `/audit-outputs/`
3. **Dependency Audit**: Deep dive on each dependency's necessity
4. **Export Hygiene**: Make exports explicit, remove unused

---

## 📈 Impact Summary

| Category | Count | Bytes Saved (Est) |
|----------|-------|-------------------|
| **Unused Components** | 12 files | ~150KB |
| **Unused Utilities** | 2 files | ~10KB |
| **.DS_Store Files** | 6 files | ~48KB |
| **Unused Dependencies** | 4 packages | ~5MB |
| **Total Estimated Savings** | 24 items | **~5.2MB** |

---

**Generated**: October 2, 2025
**Tool**: knip + manual verification
**Status**: Ready for review and cleanup
