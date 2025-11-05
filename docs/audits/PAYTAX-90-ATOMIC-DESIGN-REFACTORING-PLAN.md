# PAYTAX-90: Atomic Design Refactoring Plan

**Linear Issue:** PAYTAX-90  
**Goal:** Maximize Atomic Design principles (7/10 → 9.5/10)  
**Status:** 🚧 IN PROGRESS  
**Date Started:** November 5, 2025  
**Estimated Time:** 8-12 hours

---

## 📊 Current State Analysis

**Component Distribution:**
- /atoms: 8 files
- /molecules: 13 files  
- /organisms: 11 files
- /templates: 2 files
- /pages: 1 file
- **/ui: 29 files** ⚠️ (breaks atomic paradigm)
- /analytics: 1 file ⚠️ (special folder)
- /blog: 1 file ⚠️ (special folder)
- /salary: 1 file ⚠️ (special folder)

**Total:** 74 component files

**Current Atomic Design Score:** 7/10

---

## 🎯 Refactoring Phases

### Phase 1: Create Granular Display Atoms ⚡ (1-2 hours)

**Goal:** Extract reusable display components from molecules

**New Atoms to Create:**

1. **CurrencyDisplay.tsx**
   ```typescript
   // Display £30,000 with proper formatting
   interface CurrencyDisplayProps {
     amount: number;
     showCurrency?: boolean;
     locale?: string;
   }
   ```
   - Extract from: ResultCard, ResultsTable, SalaryCalculatorPage
   - Usage: Consistent currency formatting across app

2. **PercentageDisplay.tsx**
   ```typescript
   // Display 20% with badge styling
   interface PercentageDisplayProps {
     value: number;
     showSign?: boolean;
     variant?: 'default' | 'success' | 'warning';
   }
   ```
   - Extract from: ResultsTable, TaxRateCard, EffectiveTaxRateChart
   - Usage: Tax rates, effective rates, percentages

3. **TaxBadge.tsx**
   ```typescript
   // Display tax band badges (Basic Rate, Higher Rate)
   interface TaxBadgeProps {
     band: 'basic' | 'higher' | 'additional';
     customLabel?: string;
   }
   ```
   - Extract from: ResultsTable, TaxRateCard
   - Usage: Tax band indicators

4. **RateLabel.tsx**
   ```typescript
   // Display "Effective Rate: 25.3%" inline
   interface RateLabelProps {
     label: string;
     rate: number;
     inline?: boolean;
   }
   ```
   - Extract from: Multiple organisms
   - Usage: Any rate display

**Estimated Time:** 1-2 hours

---

### Phase 2: Merge /ui into /atoms 🔀 (2-3 hours)

**Goal:** Eliminate /ui folder, move to atomic hierarchy

**Strategy:**
1. Move all 29 /ui files to /atoms/ui/ subfolder
2. Create /ui/index.ts barrel export for backward compatibility
3. Update imports gradually (can be done later)

**Files to Move (29 total):**

**Keep in atoms/ui/ (shadcn components - 16 files):**
- button.tsx
- input.tsx
- select.tsx
- textarea.tsx
- checkbox.tsx
- label.tsx
- dialog.tsx
- card.tsx
- table.tsx
- badge.tsx
- alert.tsx
- tooltip.tsx
- separator.tsx
- collapsible.tsx
- kbd.tsx
- chart.tsx

**Move to atoms/ (custom atoms - 13 files):**
- ThemeToggle.tsx → atoms/ThemeToggle.tsx
- CookieBanner.tsx → atoms/CookieBanner.tsx
- ErrorBoundary.tsx → atoms/ErrorBoundary.tsx
- spinner.tsx → atoms/Spinner.tsx
- skeleton.tsx → atoms/Skeleton.tsx
- empty.tsx → atoms/EmptyState.tsx
- field.tsx → atoms/Field.tsx
- CallToAction.tsx → molecules/CallToAction.tsx (it's composite)
- ContentSection.tsx → molecules/ContentSection.tsx (it's composite)
- gradient-heading.tsx → atoms/GradientHeading.tsx
- GlowButton.tsx → atoms/GlowButton.tsx
- SustainabilityBadge.tsx → molecules/SustainabilityBadge.tsx
- PageContainer.tsx → templates/PageContainer.tsx
- StructuredData.tsx → organisms/StructuredData.tsx (844 lines, complex)

**Backward Compatibility:**
```typescript
// src/components/ui/index.ts (NEW)
// Re-export everything from atoms/ui and atoms for backward compatibility
export * from '../atoms/ui/button';
export * from '../atoms/ui/input';
// ... all exports
export * from '../atoms/ThemeToggle';
export * from '../atoms/CookieBanner';
// ...
```

**Estimated Time:** 2-3 hours

---

### Phase 3: Reclassify Components by Complexity 🔄 (1-2 hours)

**Goal:** Move components to correct atomic level

**Moves Required:**

1. **SimpleNavbar: molecules/ → organisms/**
   - Why: 100+ lines, complex state, multiple atoms
   - Current: molecules/SimpleNavbar.tsx
   - New: organisms/SimpleNavbar.tsx

2. **FeedbackDialog: molecules/ → organisms/**
   - Why: Form with validation, API call, complex logic
   - Current: molecules/FeedbackDialog.tsx
   - New: organisms/FeedbackDialog.tsx

3. **SimpleHero: organisms/ → molecules/**
   - Why: ~60 lines, just text + button, no complex state
   - Current: organisms/SimpleHero.tsx
   - New: molecules/SimpleHero.tsx

4. **Analytics: analytics/ → organisms/**
   - Why: Complex GA4 logic, consent management
   - Current: analytics/Analytics.tsx
   - New: organisms/Analytics.tsx

5. **mdx-components: blog/ → molecules/**
   - Why: Each component is simple, composite nature
   - Current: blog/mdx-components.tsx
   - New: molecules/MdxComponents.tsx

6. **SalaryCalculatorPage: salary/ → pages/**
   - Why: Full page component
   - Current: salary/SalaryCalculatorPage.tsx
   - New: pages/SalaryCalculatorPage.tsx

**Delete Empty Folders:**
- /components/analytics/
- /components/blog/
- /components/salary/

**Estimated Time:** 1-2 hours

---

### Phase 4: Split Large Organisms 🔪 (3-4 hours)

**Goal:** Break 400+ line organisms into molecules

#### 4.1 Split CalculatorContent.tsx (463 lines)

**Current Structure:** Monolithic organism

**New Structure:**
```
organisms/
  CalculatorContent.tsx (150 lines) - Orchestrator

molecules/
  TaxSystemOverview.tsx - UK tax system section
  PopularSalaryLinks.tsx - Popular salary calculator grid
  FeaturedTaxResources.tsx - Featured blog posts section
  TaxTopicsGrid.tsx - Browse topics section
```

**Extract:**
- TaxSystemOverview → molecules/ (~80 lines)
- PopularSalaryLinks → molecules/ (~60 lines)
- FeaturedTaxResources → molecules/ (~80 lines)
- TaxTopicsGrid → molecules/ (~60 lines)

#### 4.2 Split ResultsTable.tsx (488 lines)

**Current Structure:** Monolithic table organism

**New Structure:**
```
organisms/
  ResultsTable.tsx (200 lines) - Table orchestrator

molecules/
  ResultsTableHeader.tsx - Period headers with What If
  ResultsTableRow.tsx (exists, enhance)
  PeriodSelectorCard.tsx (exists, keep)
  ResultsTableControls.tsx - Display period checkboxes
```

**Extract:**
- ResultsTableHeader → molecules/ (~80 lines)
- ResultsTableControls → molecules/ (~60 lines)
- Simplify ResultsTable to use molecules

#### 4.3 Split BasicInputs.tsx (362 lines)

**Current Structure:** Large form organism

**New Structure:**
```
organisms/
  BasicInputs.tsx (150 lines) - Form orchestrator

molecules/
  SalaryInputGroup.tsx - Salary + period + hours
  TaxDetailsGroup.tsx - Tax code + region + year
  PensionInputGroup.tsx - Pension contribution inputs
  DeductionsGroup.tsx - NI + student loan + blind allowance
```

**Extract:**
- SalaryInputGroup → molecules/ (~60 lines)
- TaxDetailsGroup → molecules/ (~60 lines)
- PensionInputGroup → molecules/ (~50 lines)
- DeductionsGroup → molecules/ (~60 lines)

**Estimated Time:** 3-4 hours

---

### Phase 5: Update All Imports 🔗 (1-2 hours)

**Goal:** Fix all import statements across codebase

**Strategy:**
1. Use find/replace for each moved file
2. Update index.ts barrel exports
3. Verify TypeScript compiles
4. Run tests

**Commands:**
```bash
# Find all imports of moved files
grep -r "from '@/components/ui/ThemeToggle'" src/
grep -r "from '@/components/analytics/Analytics'" src/
# ... for each moved file
```

**Estimated Time:** 1-2 hours

---

### Phase 6: Testing & Validation ✅ (1-2 hours)

**Goal:** Ensure nothing breaks

**Checklist:**
- [ ] TypeScript compiles: `npm run typecheck`
- [ ] Linting passes: `npm run fix-all`
- [ ] Tests pass: `npm run test`
- [ ] Build succeeds: `npm run build`
- [ ] Dev server runs: `npm run dev`
- [ ] Visually test major pages

**Estimated Time:** 1-2 hours

---

## 📊 Expected Outcomes

**Before (7/10):**
- ❌ UI folder breaks paradigm
- ❌ Special folders outside hierarchy
- ❌ Some misclassifications
- ❌ Large 400+ line organisms
- ❌ Missing granular atoms

**After (9.5/10):**
- ✅ True atomic design compliance
- ✅ All components in atomic hierarchy
- ✅ Properly classified by complexity
- ✅ Organisms < 250 lines
- ✅ Granular display atoms
- ✅ Better component discoverability
- ✅ Improved code reusability
- ✅ Clearer mental model

**Component Distribution After:**
- atoms: 30+ files (8 + 13 from ui + 4 new + 5 reclassified)
- molecules: 25+ files (13 + 9 extracted + 3 reclassified)
- organisms: 15+ files (11 + 4 reclassified - 3 split)
- templates: 3 files (2 + 1 from ui)
- pages: 2 files (1 + 1 from salary)
- **ui: 0 files** (eliminated, backward compatible exports)
- **Special folders: 0** (eliminated)

---

## 🎯 Success Metrics

**Quantitative:**
- Atomic Design Score: 7/10 → 9.5/10 ✅
- Average organism size: 250 lines → 180 lines ✅
- Components in atomic hierarchy: 86% → 100% ✅
- Display atom reusability: Low → High ✅

**Qualitative:**
- Easier component discovery ✅
- Clearer complexity levels ✅
- Better onboarding experience ✅
- More maintainable codebase ✅

---

## 📝 Implementation Notes

**Backward Compatibility:**
- Keep /ui as barrel export
- Gradual import migration (not urgent)
- No breaking changes for users

**Testing Strategy:**
- Run tests after each phase
- Visual regression testing
- Incremental commits

**Rollback Plan:**
- Git commits per phase
- Can revert individual phases
- Tags before starting refactoring

---

## 🚀 Next Steps

1. ✅ Create this plan document
2. ⏳ Phase 1: Create granular atoms
3. ⏳ Phase 2: Merge /ui
4. ⏳ Phase 3: Reclassify components
5. ⏳ Phase 4: Split large organisms
6. ⏳ Phase 5: Update imports
7. ⏳ Phase 6: Testing & validation
8. ⏳ Update ARCHITECTURE.md
9. ⏳ Commit with v4.5.0 tag
10. ⏳ Mark PAYTAX-90 as Done

---

**Status:** 🚧 Phase 1 starting...  
**Progress:** 0% → Target: 100%  
**Time Spent:** 0h → Target: 8-12h

Let's maximize this atomic design! 🎨
