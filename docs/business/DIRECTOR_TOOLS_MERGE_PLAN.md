# Director Tools Merge Plan

> **Goal:** Merge Director Calculator (pro) into Director Guide, following atomic design principles
> **Created:** January 2026
> **Status:** IN PROGRESS

---

## Complete File Inventory (54 files)

### KEEP (unchanged) - 8 files

| File | Lines | Reason |
|------|-------|--------|
| `src/app/tools/director-guide/page.tsx` | 110 | Route entry point |
| `src/lib/tax/directorCalculator.ts` | 350 | Core calculation |
| `src/lib/tax/strategyComparison.ts` | 522 | Strategy comparison |
| `src/lib/validation/directorValidation.ts` | 318 | Types/validation |
| `src/lib/directorGuideAnalytics.ts` | 173 | Analytics tracking |
| `src/components/molecules/DirectorEmailResultsForm.tsx` | 116 | Email form |
| `src/lib/tax/__tests__/directorCalculator.test.ts` | ~300 | Tests |
| `src/lib/tax/__tests__/directorCalculator.caseStudy.test.ts` | ~500 | Tests |

### MODIFY - 6 files

| File | Lines | Changes |
|------|-------|---------|
| `src/store/directorGuideStore.ts` | 394 | Add Calculator fields (student loans, pension, BIK, EA, strategy) |
| `src/components/organisms/DirectorGuide/DirectorDashboard.tsx` | 174 | Remove wizard, use new layout |
| `src/components/organisms/DirectorGuide/index.ts` | 2 | Update exports |
| `src/components/molecules/DirectorGuide/dashboard/DashboardLayout.tsx` | 177 | Simplify to 2-panel |
| `src/components/molecules/DirectorGuide/dashboard/EducationPanel.tsx` | 190 | Add strategy-aware content |
| `src/components/molecules/DirectorGuide/index.ts` | 27 | Update exports |

### DELETE - 28 files

**Route (2 files):**
| File | Lines | Reason |
|------|-------|--------|
| `src/app/tools/director-calculator/page.tsx` | 8 | Merged into Guide |
| `src/app/tools/director-calculator/DirectorCalculatorClient.tsx` | 2,379 | Broken into molecules |

**Dashboard molecules being replaced (7 files):**
| File | Lines | Reason |
|------|-------|--------|
| `src/components/molecules/DirectorGuide/dashboard/InputsPanel.tsx` | 175 | Replaced by new inputs |
| `src/components/molecules/DirectorGuide/dashboard/MainContent.tsx` | 115 | Replaced by calculator molecules |
| `src/components/molecules/DirectorGuide/dashboard/SummaryCards.tsx` | 102 | Replaced by strategy comparison |
| `src/components/molecules/DirectorGuide/dashboard/DetailCards.tsx` | 208 | Replaced by tax breakdown |
| `src/components/molecules/DirectorGuide/dashboard/MoneyFlowChart.tsx` | 100 | Not in Calculator |
| `src/components/molecules/DirectorGuide/dashboard/SidebarNav.tsx` | 117 | Not needed |
| `src/components/molecules/DirectorGuide/dashboard/OtherIncomeGate.tsx` | 93 | Replaced by numeric input |
| `src/components/molecules/DirectorGuide/dashboard/index.ts` | 11 | Will be recreated |

**Results molecules (7 files):**
| File | Lines | Reason |
|------|-------|--------|
| `src/components/molecules/DirectorGuide/results/Assumptions.tsx` | ~50 | In EducationPanel |
| `src/components/molecules/DirectorGuide/results/CompanyBox.tsx` | ~80 | Replaced by tax pots |
| `src/components/molecules/DirectorGuide/results/PersonalBox.tsx` | ~80 | Replaced by tax pots |
| `src/components/molecules/DirectorGuide/results/CopyResults.tsx` | ~100 | Not in Calculator |
| `src/components/molecules/DirectorGuide/results/HowToDoIt.tsx` | ~60 | In EducationPanel |
| `src/components/molecules/DirectorGuide/results/ResultsSection.tsx` | ~150 | Replaced by strategy |
| `src/components/molecules/DirectorGuide/results/index.ts` | 7 | Folder deleted |

**Warnings molecules (7 files):**
| File | Lines | Reason |
|------|-------|--------|
| `src/components/molecules/DirectorGuide/warnings/VATWarning.tsx` | 40 | Inline in Calculator |
| `src/components/molecules/DirectorGuide/warnings/DLAWarning.tsx` | ~40 | Inline in Calculator |
| `src/components/molecules/DirectorGuide/warnings/ComplexityWarning.tsx` | ~40 | Inline in Calculator |
| `src/components/molecules/DirectorGuide/warnings/OtherIncomeWarning.tsx` | ~40 | Inline in Calculator |
| `src/components/molecules/DirectorGuide/warnings/SurvivalMode.tsx` | 90 | Inline in Calculator |
| `src/components/molecules/DirectorGuide/warnings/AlreadyTakenTooMuchWarning.tsx` | ~40 | Inline in Calculator |
| `src/components/molecules/DirectorGuide/warnings/index.ts` | 7 | Folder deleted |

**Tests for deleted files (13 files):**
- `src/components/molecules/DirectorGuide/results/__tests__/*.test.tsx` (6 files)
- `src/components/molecules/DirectorGuide/warnings/__tests__/*.test.tsx` (5 files)
- `src/store/__tests__/directorGuideStore.test.ts` (1 file - will be rewritten)
- `src/lib/validation/__tests__/directorValidation.test.ts` (1 file - may need updates)

### CREATE - 14 new files

**New input molecules (7 files):**
| File | Purpose |
|------|---------|
| `src/components/molecules/DirectorGuide/inputs/CoreInputs.tsx` | Revenue, expenses, region, year-end |
| `src/components/molecules/DirectorGuide/inputs/StudentLoanInputs.tsx` | Plan 1/2/4/Postgrad checkboxes |
| `src/components/molecules/DirectorGuide/inputs/PensionInput.tsx` | Employer pension contribution |
| `src/components/molecules/DirectorGuide/inputs/CompanyCarInput.tsx` | BIK value |
| `src/components/molecules/DirectorGuide/inputs/EmploymentAllowanceInput.tsx` | EA checkbox |
| `src/components/molecules/DirectorGuide/inputs/AlreadyTakenInputs.tsx` | Already taken + via payroll |
| `src/components/molecules/DirectorGuide/inputs/index.ts` | Exports |

**New calculator molecules (7 files):**
| File | Purpose |
|------|---------|
| `src/components/molecules/DirectorGuide/calculator/StrategyComparisonTable.tsx` | 3-strategy table |
| `src/components/molecules/DirectorGuide/calculator/SalarySlider.tsx` | Slider with breakpoints |
| `src/components/molecules/DirectorGuide/calculator/PensionGapWarning.tsx` | NI credits warning |
| `src/components/molecules/DirectorGuide/calculator/TaxBreakdownTable.tsx` | Detailed breakdown |
| `src/components/molecules/DirectorGuide/calculator/KeyDates.tsx` | Dates + .ics export |
| `src/components/molecules/DirectorGuide/calculator/TaxPots.tsx` | Company/Personal pots |
| `src/components/molecules/DirectorGuide/calculator/index.ts` | Exports |

### KEEP (education) - 4 files

| File | Lines | Reason |
|------|-------|--------|
| `src/components/molecules/DirectorGuide/education/WhyThisSalary.tsx` | ~80 | Educational content |
| `src/components/molecules/DirectorGuide/education/WhatAreDividends.tsx` | ~60 | Educational content |
| `src/components/molecules/DirectorGuide/education/WhatIsPayroll.tsx` | ~60 | Educational content |
| `src/components/molecules/DirectorGuide/education/index.ts` | 4 | Exports |
| + 3 test files | ~160 | Keep tests |

---

## Summary

| Action | Files | Lines |
|--------|-------|-------|
| KEEP | 12 | ~2,200 |
| MODIFY | 6 | ~970 |
| DELETE | 28 | ~4,400 |
| CREATE | 14 | ~2,000 (estimated) |
| **Net** | **4 fewer files** | **~800 fewer lines** |

---

## Current Atomic Design Structure

### Director Guide (follows atomic design ✅)

```
organisms/DirectorGuide/
└── DirectorDashboard.tsx          # Orchestrator (174 lines)

molecules/DirectorGuide/
├── dashboard/
│   ├── DashboardLayout.tsx        # 3-panel responsive layout (177 lines)
│   ├── InputsPanel.tsx            # Left inputs (175 lines) - uses Zustand
│   ├── MainContent.tsx            # Center results (115 lines)
│   ├── SummaryCards.tsx           # Top metrics (102 lines)
│   ├── DetailCards.tsx            # Breakdowns (208 lines)
│   ├── MoneyFlowChart.tsx         # Visual chart (100 lines)
│   ├── EducationPanel.tsx         # Right learn panel (190 lines)
│   ├── SidebarNav.tsx             # Navigation (117 lines)
│   └── OtherIncomeGate.tsx        # Modal (93 lines)
├── education/
│   ├── WhyThisSalary.tsx          # Expandable accordion
│   ├── WhatAreDividends.tsx
│   └── WhatIsPayroll.tsx
├── results/
│   ├── ResultsSection.tsx
│   ├── CompanyBox.tsx
│   ├── PersonalBox.tsx
│   ├── Assumptions.tsx
│   ├── CopyResults.tsx
│   └── HowToDoIt.tsx
└── warnings/
    ├── VATWarning.tsx
    ├── DLAWarning.tsx
    ├── ComplexityWarning.tsx
    ├── OtherIncomeWarning.tsx
    ├── SurvivalMode.tsx
    └── AlreadyTakenTooMuchWarning.tsx

store/
└── directorGuideStore.ts          # Zustand state (395 lines)
```

### Director Calculator (monolithic ❌)

```
app/tools/director-calculator/
└── DirectorCalculatorClient.tsx   # EVERYTHING in one file (2,379 lines)
    ├── Core inputs (revenue, expenses, region, year-end)
    ├── Director situation (already taken, other income, pension, BIK, EA)
    ├── Student loans (Plan 1/2/4/Postgrad)
    ├── Strategy comparison table
    ├── Salary slider with breakpoints
    ├── Pension gap warning
    ├── Tax breakdown tables
    ├── Key dates with .ics export
    ├── Thresholds reference
    ├── Email results form
    └── All warnings inline
```

---

## Gap Analysis

### Features in Calculator NOT in Guide

| Feature | Calculator | Guide | Priority |
|---------|------------|-------|----------|
| Student Loans (4 plans) | ✅ | ❌ | HIGH |
| Pension Contribution | ✅ | ❌ | HIGH |
| Company Car BIK | ✅ | ❌ | HIGH |
| Employment Allowance | ✅ | ❌ | HIGH |
| Year-end selector | ✅ | ❌ | MEDIUM |
| Strategy Comparison (3) | ✅ | ❌ | HIGH |
| Salary Slider | ✅ | ❌ | HIGH |
| Pension Gap Warning | ✅ | ❌ | HIGH |
| Key Dates + .ics | ✅ | ❌ | MEDIUM |
| Thresholds Table | ✅ | ❌ | LOW |
| Email Results | ✅ | ❌ | MEDIUM |
| Other Income (numeric) | ✅ | ❌ (boolean only) | HIGH |

### Features in Guide NOT in Calculator

| Feature | Guide | Calculator | Priority |
|---------|-------|------------|----------|
| Education Panel | ✅ | ❌ | KEEP |
| Learn Cards | ✅ | ❌ | KEEP |
| Zustand Store | ✅ | ❌ | KEEP |
| Progressive Disclosure | ✅ | ❌ | OPTIONAL |
| DashboardLayout | ✅ | ❌ | KEEP |

---

## Merge Strategy

### Approach: Enhance Guide with Calculator Features

Keep the Guide's atomic structure, but ADD the Calculator's features as new molecules.

### Phase 1: Enhance Store (foundation)

**File:** `store/directorGuideStore.ts`

Add new fields:
```typescript
// New inputs
studentLoanPlans: StudentLoanPlan[];
pensionContribution: number;
companyCarBIK: number;
hasEmploymentAllowance: boolean;
yearEndMonth: '03' | '12' | 'other' | 'unknown';
yearEndCustom: string;
otherIncome: number; // Change from boolean to number

// New results
strategyComparison: StrategyComparison | null;

// New UI state
selectedStrategy: 'allSalary' | 'optimalMix' | 'allDividends';
sliderSalary: number | null;
```

### Phase 2: Create New Molecules

**New files in `molecules/DirectorGuide/`:**

```
calculator/
├── StrategyComparisonTable.tsx    # 3-strategy comparison
├── SalarySlider.tsx               # Slider with breakpoints
├── PensionGapWarning.tsx          # NI credits warning
├── TaxBreakdownTable.tsx          # Detailed breakdown
├── KeyDates.tsx                   # Dates + .ics export
├── ThresholdsReference.tsx        # Tax thresholds table
└── index.ts

inputs/
├── StudentLoanInputs.tsx          # 4 checkboxes
├── PensionInput.tsx               # Employer pension
├── CompanyCarInput.tsx            # BIK value
├── EmploymentAllowanceInput.tsx   # EA checkbox
├── YearEndInput.tsx               # Year-end selector
├── OtherIncomeInput.tsx           # Numeric other income
└── index.ts
```

### Phase 3: Update Existing Molecules

**Modify:** `dashboard/InputsPanel.tsx`
- Add new input components from `inputs/`
- Use Zustand for all state

**Modify:** `dashboard/MainContent.tsx`
- Add StrategyComparisonTable
- Add SalarySlider
- Add PensionGapWarning
- Replace SummaryCards with strategy-aware version

**Keep unchanged:**
- `dashboard/DashboardLayout.tsx`
- `dashboard/EducationPanel.tsx`
- `education/*`

### Phase 4: Update Organism

**Modify:** `organisms/DirectorGuide/DirectorDashboard.tsx`
- Wire up new store fields
- Call `calculateStrategyComparison()` in addition to `calculateDirectorScenario()`
- Pass strategy data to MainContent

### Phase 5: Delete Calculator Route

After verification:
- Delete `app/tools/director-calculator/`
- Redirect `/tools/director-calculator` → `/tools/director-guide`

### Phase 6: Cleanup

Delete orphaned molecules:
- `molecules/DirectorGuide/results/*` (replaced by Calculator output)
- `molecules/DirectorGuide/warnings/*` (replaced by inline + EducationPanel)
- `dashboard/OtherIncomeGate.tsx` (replaced by numeric input)
- `dashboard/SidebarNav.tsx` (not needed)

---

## File-by-File Execution Plan

### Step 1: Store Enhancement
- [ ] Add new types to `directorValidation.ts`
- [ ] Add new fields to `directorGuideStore.ts`
- [ ] Add new actions (setStudentLoanPlans, etc.)
- [ ] Update calculate() to call strategyComparison

### Step 2: New Input Molecules
- [ ] Create `molecules/DirectorGuide/inputs/StudentLoanInputs.tsx`
- [ ] Create `molecules/DirectorGuide/inputs/PensionInput.tsx`
- [ ] Create `molecules/DirectorGuide/inputs/CompanyCarInput.tsx`
- [ ] Create `molecules/DirectorGuide/inputs/EmploymentAllowanceInput.tsx`
- [ ] Create `molecules/DirectorGuide/inputs/YearEndInput.tsx`
- [ ] Create `molecules/DirectorGuide/inputs/OtherIncomeInput.tsx`
- [ ] Create `molecules/DirectorGuide/inputs/index.ts`

### Step 3: New Calculator Molecules
- [ ] Create `molecules/DirectorGuide/calculator/StrategyComparisonTable.tsx`
- [ ] Create `molecules/DirectorGuide/calculator/SalarySlider.tsx`
- [ ] Create `molecules/DirectorGuide/calculator/PensionGapWarning.tsx`
- [ ] Create `molecules/DirectorGuide/calculator/TaxBreakdownTable.tsx`
- [ ] Create `molecules/DirectorGuide/calculator/KeyDates.tsx`
- [ ] Create `molecules/DirectorGuide/calculator/ThresholdsReference.tsx`
- [ ] Create `molecules/DirectorGuide/calculator/index.ts`

### Step 4: Update InputsPanel
- [ ] Import new input molecules
- [ ] Add to form layout
- [ ] Wire to Zustand store

### Step 5: Update MainContent
- [ ] Import new calculator molecules
- [ ] Replace simple results with strategy comparison
- [ ] Add slider and warnings

### Step 6: Update DirectorDashboard
- [ ] Update calculation logic
- [ ] Pass new props to children

### Step 7: Test & Verify
- [ ] Run existing tests
- [ ] Manual testing
- [ ] Verify all features work

### Step 8: Cleanup
- [ ] Delete `app/tools/director-calculator/`
- [ ] Add redirect
- [ ] Delete unused molecules
- [ ] Delete unused tests

---

## Estimated Effort

| Phase | Files | Est. Time |
|-------|-------|-----------|
| Store Enhancement | 2 | 1 hour |
| New Input Molecules | 7 | 2 hours |
| New Calculator Molecules | 7 | 3 hours |
| Update InputsPanel | 1 | 1 hour |
| Update MainContent | 1 | 2 hours |
| Update DirectorDashboard | 1 | 1 hour |
| Test & Verify | - | 1 hour |
| Cleanup | 10+ | 30 mins |
| **Total** | **~30 files** | **~11 hours** |

---

## Decisions Made

1. **No progressive disclosure** - All inputs visible (like Calculator)
2. **Delete SidebarNav** - Not needed
3. **Delete OtherIncomeGate** - Replace with numeric input
4. **Delete step wizard logic** - Direct calculation
5. **Keep EducationPanel** - Core differentiator
6. **Keep DashboardLayout** - 2-panel (main + education)

---

## Alternative: Simpler Approach

If 11 hours is too much, consider:

**Option B: Calculator with Education sidebar**
- Move Calculator to Guide route (keep as single file)
- Add EducationPanel as sidebar wrapper
- Don't refactor into atomic design
- ~2 hours work
- Breaks atomic design principles
- Harder to maintain long-term

**Recommendation:** Phase the work. Do Phase 1-2 first (store + inputs), verify it works, then continue.
