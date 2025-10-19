# UX Improvements Status

**Date:** January 18, 2025
**Branch:** feature/salary-comparison-and-tax-trap-warnings

## ✅ COMPLETED (13/16 items)

### 1. Tooltip Placement Fixed
- Changed from `side="right"` to `side="top"` 
- Prevents overlap with £ symbols and input fields
- **Files:** `LabelTooltip.tsx`

### 2. What If Helper Text Removed
- Removed "How you want to specify the change"
- Removed "Positive = increase, negative = decrease"
- Tooltips now provide guidance instead
- **Files:** `WhatIfInputs.tsx`

### 3. Results Table: Category → Payslip
- Renamed column header from "Category" to "Payslip"
- Reduced column width from 160px to 140px
- **Files:** `ResultsTable.tsx`

### 4. Results Table: Pension [You] → Pension
- Removed "[You]" suffix from pension row
- **Files:** `ResultsTable.tsx`

### 5. Pension Footnote Removed
- Deleted "*Pension calculated as salary sacrifice..." text
- Tooltips provide this information now
- **Files:** `ResultsTable.tsx`

### 6. Added "Enter Income Tax Details" Heading
- New H3 heading above all inputs
- **Files:** `BasicInputs.tsx`

### 7. 3 Checkboxes on 1 Row
- Married, Blind Allowance, I pay no NI now horizontal
- Checkbox-first layout with inline tooltips
- **Files:** `BasicInputs.tsx`

### 8. Hours Per Week Field Removed
- Removed field and all references
- HMRC assumes standard hours
- **Files:** `BasicInputs.tsx`, `calculatorStore.ts`

### 9. Pay Period Dropdown Fixed
- Added missing: 4-Weekly, Fortnightly, Daily, Hourly
- Now matches Display Periods in results table
- Ordered logically: Annually → Hourly
- **Files:** `BasicInputs.tsx`

### 10. Age Changed to Dropdown
- Options: Under 60, 60-65, 65-74, 75+
- Maps to representative ages for NI calculations
- Ages 65+ trigger no NI (state pension age)
- **Calculation Impact:** Sets `age` value that affects NI
- **Files:** `BasicInputs.tsx`, `inputTooltips.ts`

### 11. Pension: Combined Row with Icon Dropdown
- Type + Amount on single row
- Small dropdown with Percent (%) and PoundSterling (£) icons
- Input field dynamically shows prefix/suffix
- Width: 70px dropdown + flex input
- **Files:** `BasicInputs.tsx` (imported Percent, PoundSterling icons)

### 12. Default Tax Code Logic
- Empty tax code defaults to 1257L
- Scotland region defaults to S1257L
- Applied in `calculate()` function before calculations
- Placeholder updates based on region
- **Calculation Impact:** Uses default allowance if blank
- **Files:** `BasicInputs.tsx`, `calculatorStore.ts`

### 13. Previous Year → Actual Year
- Changed "Net Change from Previous Year" to "Net Change from 2024"
- Dynamically calculates from current tax year (2025-2026 → 2024)
- **Files:** `ResultsTable.tsx`

---

## ⚠️ REMAINING WORK (3 items)

### 14. Fix What If Allowances Auto-Population
**Issue:** Allowances/Deductions row shows What If columns (£26.00, £6.00) even when What If is not active
**Root Cause:** What If results not properly cleared
**Impact:** Visual bug, doesn't affect calculations
**Files to Fix:** 
- `calculatorStore.ts` - ensure `whatIfResults` cleared properly
- `CalculatorInputsSection.tsx` - already clears on close, may need additional check

### 15. Update All Affected Tests
**Failing Tests:**
- `BasicInputs.test.tsx` - needs updates for:
  - Removed hours field
  - 3 checkboxes layout
  - Age dropdown instead of input
  - Combined pension row
- `ResultsTable.test.tsx` - needs updates for:
  - "Payslip" instead of "Category"
  - "Pension" instead of "Pension [You]"
  - Dynamic year label
  - No pension footnote
- `calculatorStore.whatif.test.ts` - precision issues, What If clearing
- `sitemap.test.ts`, `error-log/route.test.ts`, `feedback/route.test.ts` - unrelated failures

### 16. Verify Calculations
**Critical Checks:**
- ✅ Default tax code uses correct allowance (1257L = £12,570)
- ✅ Scotland uses S1257L prefix
- ⚠️ Age dropdown sets correct values for NI calculations
- ⚠️ Pension combined input works for both % and £
- ⚠️ What If calculations exclude unwanted fields

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Test with empty tax code → should use 1257L/S1257L
- [ ] Test Scotland region → placeholder shows S1257L
- [ ] Test age 65-74 → no NI contributions
- [ ] Test age 75+ → no NI contributions
- [ ] Test age under 60 → full NI
- [ ] Test pension % → shows % suffix
- [ ] Test pension £ → shows £ prefix
- [ ] Test What If → Allowances should NOT appear
- [ ] Test all pay periods match display periods
- [ ] Test 3 checkboxes on mobile (wrap behavior)

### Automated Tests
- [ ] Update BasicInputs.test.tsx (age dropdown, pension combined, checkboxes)
- [ ] Update ResultsTable.test.tsx (Payslip, Pension, year label)
- [ ] Fix What If test precision issues
- [ ] Ensure all tests pass

---

## 📊 Impact Summary

### Calculations Affected
1. **Tax Code**: Defaults applied in `calculate()`
2. **Age/NI**: Age dropdown sets representative ages affecting NI calculations
3. **Pension**: No change to calculation logic, just UI reorganization

### Files Modified
1. `BasicInputs.tsx` - Major refactor (heading, checkboxes, age, pension, hours removed)
2. `calculatorStore.ts` - Default tax code logic
3. `ResultsTable.tsx` - Column names, year label, footnote removed
4. `WhatIfInputs.tsx` - Helper text removed
5. `LabelTooltip.tsx` - Tooltip positioning
6. `inputTooltips.ts` - Age tooltip updated

### Test Files Requiring Updates
1. `BasicInputs.test.tsx`
2. `ResultsTable.test.tsx`
3. `calculatorStore.whatif.test.ts`
4. `AdvancedInputs.test.tsx` - may need deletion (component removed)

---

## 🚀 Next Steps

1. **Immediate:** Fix What If Allowances bug
2. **High Priority:** Update all failing tests
3. **Verify:** Manual testing of calculations
4. **Deploy:** Once all tests pass

---

## 📝 Notes

- Age dropdown uses representative ages (62, 70, 76) for NI threshold calculations
- State pension age in UK is currently 66-67 (varies by birth year)
- 65+ generally triggers no NI for simplicity
- Default tax code ensures calculations work even with empty input
- Pension combined row saves vertical space significantly
