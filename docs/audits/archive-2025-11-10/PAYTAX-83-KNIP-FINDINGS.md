# PAYTAX-83: Knip Analysis - Unused Code & Dependencies

**Date:** November 8, 2025  
**Tool:** knip 5.67.1  
**Status:** 🔍 Analysis in Progress

---

## Summary

**Total Findings:**
- 29 unused files
- 17 unused dependencies
- 5 unused devDependencies
- 6 unlisted dependencies
- 4 unlisted binaries
- 86 unused exports

⚠️ **WARNING:** Many findings are FALSE POSITIVES! Review carefully before deleting.

---

## 1. Unused Files (29)

### Blog Posts (13) - ❌ FALSE POSITIVES - DO NOT DELETE

```
content/blog/100k-tax-trap-avoid-60-percent-tax-2025.mdx
content/blog/beginners-guide-to-uk-taxation.mdx
content/blog/higher-rate-taxpayer-guide-uk-2025.mdx
content/blog/how-much-tax-will-i-pay-uk-2025.mdx
content/blog/marriage-allowance-uk-2025-guide.mdx
content/blog/salary-sacrifice-explained-2025-26.mdx
content/blog/scottish-vs-english-tax-rates-2025-comparison.mdx
content/blog/student-loan-repayment-changes-2025-26.mdx
content/blog/uk-tax-calculator-2025-complete-guide.mdx
content/blog/uk-tax-changes-2025-complete-guide.mdx
content/blog/understanding-the-uk-tax-system-2025.mdx
content/blog/understanding-uk-tax-codes.mdx
```

**Why False Positive:**
- Loaded dynamically via `lib/blog.ts` using fs.readFileSync
- Knip can't detect filesystem-based content loading
- These are CORE CONTENT - absolutely needed

**Action:** ❌ DO NOT DELETE

---

### Scripts (7) - ❌ FALSE POSITIVES - DO NOT DELETE

```
scripts/audit-components.js
scripts/audit-meta-descriptions.js
scripts/check-color-contrast.js
scripts/convert-pwa-screenshots.js
scripts/create-all-issues.js
scripts/gen-lucide-imports.js
scripts/update-issue-priority.js
```

**Why False Positive:**
- CLI utilities run manually via `node scripts/...`
- Not imported in code, run as standalone tools
- Used for maintenance, auditing, Linear integration

**Action:** ❌ DO NOT DELETE

---

### PWA/Service Worker Files (2) - ✅ IN USE

```
public/register-sw.js
public/sw.js
```

**Usage Found:**
- `register-sw.js` loaded in src/app/layout.tsx:104
- `sw.js` is the service worker registered by register-sw.js

**Action:** ❌ DO NOT DELETE

---

### Configuration Files (1) - ❓ INVESTIGATE

```
.lighthouserc.js
```

**Check:** Is Lighthouse CI configured in pipeline?

**Action:** ⏸️ INVESTIGATE

---

### Components (6) - ❓ VERIFY CAREFULLY

```
src/components/atoms/Field.tsx
src/components/atoms/Skeleton.tsx
src/components/atoms/ui/kbd.tsx
src/components/ui/index.ts
src/components/ui/kbd.ts
src/hooks/useChartColors.ts
src/lib/validation/atomsValidation.ts
```

**Need to Check:**
- Field.tsx: Exported from ui/index.ts but maybe unused?
- Skeleton.tsx: HAS TESTS - likely used somewhere
- kbd.tsx: Keyboard component - check usage
- ui/index.ts: Barrel export - check if needed
- useChartColors.ts: Custom hook - verify usage

**Action:** ⏸️ VERIFY EACH ONE CAREFULLY

---

## 2. Unused Dependencies (17)

```
@headlessui/react        package.json:61:6 
@hookform/resolvers      package.json:62:6 
@mdx-js/loader           package.json:63:6 
@mdx-js/react            package.json:64:6 
@next/mdx                package.json:65:6 
@next/third-parties      package.json:66:6 
@radix-ui/react-icons    package.json:70:6 
@radix-ui/react-tabs     package.json:75:6 
@react-email/components  package.json:77:6 
@types/exceljs           package.json:79:6 
exceljs                  package.json:84:6 
js-yaml                  package.json:87:6 
jspdf                    package.json:88:6 
react-hook-form          package.json:95:6 
react-markdown           package.json:96:6 
rehype-highlight         package.json:99:6 
remark-code-import       package.json:102:6
```

### Analysis by Package:

**MDX Related (4):**
- `@mdx-js/loader` - ❌ FALSE POSITIVE - Used in next.config.ts for blog
- `@mdx-js/react` - ❌ FALSE POSITIVE - Used for MDX components
- `@next/mdx` - ❌ FALSE POSITIVE - MDX support
- `react-markdown` - ❓ Check if used or can use MDX instead

**Rehype/Remark (2):**
- `rehype-highlight` - ❓ Check if code highlighting is used
- `remark-code-import` - ❓ Check if code imports are used

**Form Related (2):**
- `react-hook-form` - ❓ Verify form usage
- `@hookform/resolvers` - ❓ Verify form validation

**UI Components (4):**
- `@headlessui/react` - ❓ Check if headless UI is used
- `@radix-ui/react-icons` - ❓ Using lucide-react instead?
- `@radix-ui/react-tabs` - ❓ Check if tabs component is used
- `@next/third-parties` - ❓ Check third-party script loading

**Export Related (3):**
- `exceljs` - ❓ Excel export feature used?
- `@types/exceljs` - Depends on exceljs usage
- `jspdf` - ❓ PDF export feature used?

**Email (1):**
- `@react-email/components` - ❓ Email templates used?

**Config (1):**
- `js-yaml` - ❓ YAML config parsing used?

**Action:** ⏸️ VERIFY EACH USAGE

---

## 3. Unused DevDependencies (5)

```
@edge-runtime/jest-environment  package.json:120:6
@types/nodemailer               package.json:131:6
chokidar-cli                    package.json:135:6
concurrently                    package.json:136:6
tsx                             package.json:142:6
```

### Analysis:

**Testing:**
- `@edge-runtime/jest-environment` - ✅ Likely safe to remove if not using edge runtime tests

**Email:**
- `@types/nodemailer` - ❓ Check if nodemailer is used

**CLI Tools:**
- `chokidar-cli` - ❓ File watching in package.json scripts?
- `concurrently` - ❓ Running multiple commands in package.json?
- `tsx` - ❓ TypeScript execution for scripts?

**Action:** ⏸️ CHECK package.json scripts for usage

---

## 4. Unlisted Dependencies (6)

```
postcss        postcss.config.mjs
@jest/globals  (5 test files)
```

### Analysis:

**PostCSS:**
- Used in postcss.config.mjs but not in package.json
- ✅ Should ADD to dependencies

**@jest/globals:**
- Used in 5 test files
- ✅ Should ADD to devDependencies or use different import

**Action:** ✅ ADD MISSING DEPENDENCIES

---

## 5. Unlisted Binaries (4)

```
open               package.json
sleep              package.json
npm-check-updates  package.json
husky              package.json
```

### Analysis:

**System Commands:**
- `open` - System command (macOS/Linux) - OK
- `sleep` - System command - OK

**Tools:**
- `npm-check-updates` - ❓ Check if installed globally or needs adding
- `husky` - ✅ Should be in devDependencies

**Action:** ⏸️ VERIFY

---

## 6. Unused Exports (86)

### Test Helpers (5) - ❌ FALSE POSITIVE

```
e2e/helpers/tax-test-helpers.ts:
- calculateExpectedIncomeTax
- calculateExpectedNationalInsurance
- calculateExpectedStudentLoan
- calculateExpectedPension
- validateCalculationResults
```

**Why False Positive:**
- Used in e2e tests
- Knip may not detect cross-file test usage

**Action:** ❌ DO NOT DELETE

---

### Fonts (1) - ❓ INVESTIGATE

```
src/app/fonts.ts:
- robotoFlex
```

**Check:** Is Roboto Flex font actually used?

**Action:** ⏸️ CHECK font usage

---

### Component Defaults (5) - ❓ VERIFY

```
src/components/atoms/CurrencyDisplay.tsx - default
src/components/atoms/ErrorBoundary.tsx - default
src/components/atoms/PercentageDisplay.tsx - default
src/components/atoms/RateLabel.tsx - default
src/components/atoms/TaxBadge.tsx - default
```

**Why Flagged:**
- These have default exports
- May be imported via barrel exports or dynamic imports

**Action:** ⏸️ VERIFY each import

---

### UI Component Parts (10) - ❌ LIKELY FALSE POSITIVE

```
Shadcn/Radix UI Components:
- badgeVariants
- buttonVariants
- ChartContext, useChart, CHART_COLORS
- DialogPortal, DialogOverlay
- SelectGroup, SelectLabel, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton
- TableFooter, TableCaption
```

**Why Flagged:**
- These are exported for potential use
- Part of shadcn/ui design system
- May be used in tests or future features

**Action:** ⏸️ VERIFY - Could remove if truly unused

---

### Chart Components (4) - ❌ FALSE POSITIVE

```
src/components/organisms/CalculatorCharts/index.tsx:
- ChartsSkeleton
- IncomeBreakdownChart
- NetIncomeComparisonChart
- TaxLiabilityChart
```

**Why False Positive:**
- These are barrel exports from index.tsx
- Actual components used in parent component
- Knip may not detect barrel re-exports properly

**Action:** ❌ DO NOT DELETE

---

### Structured Data (1) - ❓ VERIFY

```
src/components/organisms/StructuredData.tsx:
- StructuredData (function)
```

**Check:** Is StructuredData component imported anywhere?

**Action:** ⏸️ VERIFY usage

---

### UI Barrel Exports (3) - ❓ VERIFY

```
src/components/ui/CallToAction.ts
src/components/ui/ContentSection.ts
src/components/atoms/EmptyState.tsx - EmptyHeader
```

**Check:** Are these actually used?

**Action:** ⏸️ VERIFY each

---

## ⚠️ FALSE POSITIVE SUMMARY

**Definitely Keep (DO NOT DELETE):**
- ✅ All 13 blog posts (core content)
- ✅ All 7 scripts (CLI tools)
- ✅ Both PWA files (service worker)
- ✅ Test helpers (e2e utilities)
- ✅ Chart components (barrel exports)

**Investigate Before Deleting:**
- ⏸️ Component files (6 files)
- ⏸️ Dependencies (17 packages)
- ⏸️ DevDependencies (5 packages)
- ⏸️ UI exports (various)

**Action Required:**
- ✅ ADD missing dependencies (postcss, @jest/globals)

---

## 🎯 Recommended Approach

### Phase 1: Add Missing Dependencies (Safe)
1. Add `postcss` to dependencies
2. Add `@jest/globals` to devDependencies or fix imports
3. Verify `husky` is in devDependencies

### Phase 2: Verify Component Usage (Careful)
1. Search codebase for each "unused" component
2. Check if truly unused or just dynamic imports
3. Remove ONLY if 100% certain not used

### Phase 3: Verify Dependencies (Very Careful)
1. Search codebase for each dependency
2. Check if used in config files (next.config.ts, etc.)
3. Remove ONLY if truly unused

### Phase 4: Clean Exports (Low Priority)
1. Remove unused exports from shadcn components
2. Keep defaults as they may be used

---

## ⚠️ CRITICAL WARNINGS

1. **Blog Posts:** Absolutely do NOT delete - core site content
2. **Scripts:** Do NOT delete - used for maintenance
3. **PWA Files:** Do NOT delete - service worker functionality
4. **Test Helpers:** Do NOT delete - used in e2e tests
5. **MDX Packages:** Likely false positives - verify before removing

**When in doubt, KEEP IT!** Better to have unused code than break the site.

---

**Next Steps:**
1. Review this document
2. Decide what to investigate
3. Be VERY careful with deletions
4. Test thoroughly after each change
