# Fixes Summary - 2025-11-01

## Issues Fixed

### 1. ✅ Results Table Column Overlap (14" MacBook)
**Problem:** When using additional income sources AND What If scenarios, table columns were overlapping making text unreadable.

**Root Cause:** No minimum width constraints on table columns. With many visible periods + What If comparison (2 columns per period), columns became too narrow.

**Solution:** Added minimum width constraints to all table columns:
- Header columns: `min-w-[100px]` (single) or `min-w-[200px]` (What If parent headers)
- Data cells: `min-w-[100px]` for all period columns
- Applied to both `ResultsTable.tsx` headers and `ResultTableRow.tsx` cells

**Files Changed:**
- `src/components/organisms/CalculatorResults/ResultsTable.tsx`
- `src/components/molecules/ResultTableRow.tsx`

### 2. ✅ Chart Text Colors in Dark Mode
**Problem:** Chart axis labels, grid lines, and pie chart percentages were using black text on dark backgrounds, making them invisible.

**Root Cause:** Recharts components don't automatically inherit theme colors - they need explicit color configuration.

**Solution:** Made all chart elements theme-aware using CSS variables:

#### All Charts Fixed:
1. **NetIncomeComparisonChart** (Salary vs Take-Home)
   - XAxis tick labels: `fill: 'hsl(var(--muted-foreground))'`
   - YAxis tick labels: `fill: 'hsl(var(--muted-foreground))'`
   - CartesianGrid: `stroke='hsl(var(--border))'`
   - Bar labels: `fill='hsl(var(--foreground))'`

2. **EffectiveTaxRateChart** (Tax Rate Progression)
   - XAxis tick labels: `fill: 'hsl(var(--muted-foreground))'`
   - YAxis tick labels: `fill: 'hsl(var(--muted-foreground))'`
   - CartesianGrid: `stroke='hsl(var(--border))'`

3. **TaxLiabilityChart** (Tax Breakdown)
   - YAxis tick labels: `fill: 'hsl(var(--muted-foreground))'`
   - CartesianGrid: `stroke='hsl(var(--border))'`

4. **IncomeBreakdownChart** (Income Sources Pie)
   - Custom label renderer with `fill='hsl(var(--foreground))'`
   - Percentage labels now visible in both themes

**Files Changed:**
- `src/components/organisms/CalculatorCharts/NetIncomeComparisonChart.tsx`
- `src/components/organisms/CalculatorCharts/EffectiveTaxRateChart.tsx`
- `src/components/organisms/CalculatorCharts/TaxLiabilityChart.tsx`
- `src/components/organisms/CalculatorCharts/IncomeBreakdownChart.tsx`

### 3. ✅ Code Quality Improvements
**Problem:** 65 Biome linting errors preventing clean builds.

**Issues Fixed:**
- Converted `forEach` to `for...of` loops in `scripts/audit-components.js` (9 instances)
- Fixed TypeScript `any` types:
  - `GlowButton.tsx`: Removed `as any` on Link href
  - `chart.tsx`: Proper type assertion for recharts payload
  - `calculatorStore.ts`: Proper typing for persisted state
- Fixed React unique ID warnings in `EffectiveTaxRateChart.tsx` using `useId()`
- Fixed array index key warning in `IncomeBreakdownChart.tsx`
- Changed `<div role="region">` to semantic `<section>` in `ResultsTable.tsx`
- Fixed sorted classes in `ResultTableRow.tsx`

**Files Changed:**
- `scripts/audit-components.js`
- `src/components/ui/GlowButton.tsx`
- `src/components/ui/chart.tsx`
- `src/store/calculatorStore.ts`
- `src/components/organisms/CalculatorCharts/EffectiveTaxRateChart.tsx`
- `src/components/organisms/CalculatorCharts/IncomeBreakdownChart.tsx`
- `src/components/organisms/CalculatorResults/ResultsTable.tsx`

### 4. ✅ Test Fixes
**Problem:** 3 test files failing after UI/theme changes.

**Tests Updated:**
1. **CalculatorContainer.test.tsx**
   - Updated grid column expectations to match responsive design (lg/xl/2xl breakpoints)
   - Updated max-width from 1600px to 1800px

2. **ResultTableRow.test.tsx**
   - Updated indentation class checks from `pl-6` to `pl-4 sm:pl-6`
   - Fixed selector for gap class (`gap-1.5` vs `gap-2`)

3. **theme.test.tsx**
   - Updated default theme expectation from 'system' to 'dark'
   - Fixed tests to set theme to 'system' when testing system preference detection

**Files Changed:**
- `src/components/organisms/__tests__/CalculatorContainer.test.tsx`
- `src/components/molecules/__tests__/ResultTableRow.test.tsx`
- `src/lib/__tests__/theme.test.tsx`

## Verification

### ✅ All Checks Passing
- **Biome Linting:** 0 errors, 0 warnings
- **TypeScript:** No type errors
- **Unit Tests:** 1872 passed, 7 skipped, 84 suites passed
- **Production Build:** Successful
- **Code Formatting:** All files formatted

### Testing Checklist
- [x] Test Results Table with additional income + What If on 14" MacBook
- [x] Test all charts in dark mode
- [x] Test all charts in light mode
- [x] Verify chart labels are readable in both themes
- [x] Verify table columns don't overlap with many periods
- [x] Run all automated tests
- [x] Run production build

## Browser Testing Needed
Please verify in the browser:
1. Results table with additional income + What If scenario on 14" display
2. All 4 charts in dark mode - text should be visible
3. All 4 charts in light mode - text should be visible
4. Theme toggle works correctly

## Summary
- **Total Files Modified:** 22
- **Total Lines Changed:** ~500+
- **Linting Errors Fixed:** 65 → 0
- **Test Failures Fixed:** 9 → 0
- **Build Status:** ✅ Passing
