# Feature Planning Session Summary - 23 October 2025

**Branch:** `feature/multiple-incomes-self-employed` ✅ Created  
**Status:** Awaiting decisions on UX approach  
**Priority:** 🔴 Critical User Feedback

---

## 🎯 What We're Building

Three interconnected features based on expert user feedback:

### 1. ⚡ Auto Age-Based NI Exemption (Quick Win)

**Problem:** Age dropdown exists but doesn't auto-exempt NI  
**Current State:**
- ✅ Age dropdown: Under 65, 65-74, 75+
- ❌ Sets age to 70 or 76 but doesn't affect NI
- ❌ Comment says "no NI" but it's not implemented
- ❌ User must manually check "I pay no NI"

**Solution:** Auto-detect `age >= 66` in taxCalculator.ts  
**Time:** 2-3 hours  
**Impact:** Fixes incorrect calculations for 12.6M UK pensioners

---

### 2. 📊 Multiple Income Sources

**Problem:** Real taxpayers have multiple income streams  
**User Need:** "Add earnings, pension, state pension, rental income etc."

**Your Insight:**
> "like the £312 WFH allowance directly affects your PAYE pay, not additional pay"

**Key Distinction:**
- **Allowances/Deductions** = Reduce taxable income (£312 WFH, blind allowance)
- **Income Sources** = Additional taxable income (pensions, rental, etc.)

**NI Treatment:**
- 🏢 **Employment Income** → Subject to NI (if under SPA)
- 💼 **Pension Income** → Taxable but NO NI
- 🏛️ **State Pension** → Taxable but NO NI
- 🏠 **Rental Income** → Taxable but NO NI

**Two Approaches to Discuss:**

#### Option A: Dynamic List with Accordion ⭐ (My Recommendation)

```
┌────────────────────────────────────────┐
│ Primary Income                          │
│ ├─ Salary: £45,000                     │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ ▶ Additional Income Sources            │  ← Collapsible (uses existing Collapsible component!)
│   [+ Add Income Source]                 │
└────────────────────────────────────────┘

When expanded:
┌────────────────────────────────────────┐
│ ▼ Additional Income Sources            │
│                                         │
│ 1. [Private Pension ▼] £12,000 [🗑️]   │
│ 2. [State Pension ▼] £11,500 [🗑️]     │
│ 3. [Rental Income ▼] £8,000 [🗑️]      │
│                                         │
│ [+ Add Income Source]                   │
└────────────────────────────────────────┘
```

**Pros:**
- ✅ Flexible - any number of sources
- ✅ Clean UI - collapsed by default
- ✅ Uses existing `Collapsible` component (already in project!)
- ✅ Clear NI vs non-NI separation

**Cons:**
- More complex state management
- Need to handle array updates

#### Option B: Fixed Fields (Simpler)

```
┌────────────────────────────────────────┐
│ Employment Income: £45,000              │
│ Private Pension: £12,000                │
│ State Pension: £11,500                  │
│ Rental Income: £8,000                   │
│ Other Income: £0                        │
└────────────────────────────────────────┘
```

**Pros:**
- ✅ Simple implementation
- ✅ All visible

**Cons:**
- ❌ Cluttered (5+ fields always visible)
- ❌ Can't handle multiple pensions
- ❌ Not scalable

**Question:** Which approach do you prefer?

---

### 3. 💼 Self-Employed Calculator

**Problem:** User expected self-employed support, we don't have it  
**User Quote:** "I had in my mind it did self-employed too but couldn't find that option"

**Two Approaches to Discuss:**

#### Option A: Tabs (Employed / Self-Employed) ⭐ (My Recommendation)

```
┌──────────────┬──────────────┐
│  Employed ✓  │ Self-Employed│  ← Tabs
└──────────────┴──────────────┘

Tab 1: Employed
- Current calculator (salary, tax code, etc.)

Tab 2: Self-Employed
- Business income
- Business expenses
- Profit (calculated)
- Class 2 NI: £179.40/year (auto)
- Class 4 NI: 9% on £12,570-£50,270, 2% above
```

**Pros:**
- ✅ Clear separation
- ✅ Single page (no navigation)
- ✅ Can compare employed vs self-employed
- ✅ Standard UX pattern

**Cons:**
- ⚠️ Need to install shadcn `Tabs` component
- More complex state (2 calculator modes)

#### Option B: Dedicated Page (/self-employed)

**Pros:**
- ✅ Complete separation
- ✅ SEO benefits
- ✅ Simpler state

**Cons:**
- ❌ Duplicate code
- ❌ User must navigate away
- ❌ Can't compare easily

**Question:** Tabs or separate page?

---

## 🛠️ Technical Details

### shadcn Components Needed

| Component | Status | Use Case |
|-----------|--------|----------|
| `Collapsible` | ✅ Available | Additional income sources |
| `Tabs` | ❌ Need to install | Employed / Self-Employed |
| `Select` | ✅ Available | Income type dropdown |
| `Button` | ✅ Available | Add/remove actions |
| `Input` | ✅ Available | Amount fields |
| `Badge` | ✅ Available | Income labels |

**Install Commands:**
```bash
# If we choose Tabs approach
npx shadcn@latest add tabs

# Or use Collapsible for expandable sections
# (already installed, just use it!)
```

---

## 📊 Data Structures

### Multiple Income Sources

```typescript
interface IncomeSource {
  id: string; // UUID for React keys
  type: 'employment' | 'pension' | 'statePension' | 'rental' | 'investment' | 'other';
  label: string; // Optional custom label
  amount: number;
  period: PayPeriod; // Annual, monthly, etc.
}

interface TaxCalculationInput {
  // ... existing fields
  incomeSources: IncomeSource[]; // NEW
}
```

### Tax Calculation Changes

```typescript
// Separate NI-able vs non-NI-able income
const employmentIncome = incomeSources
  .filter(s => s.type === 'employment')
  .reduce((sum, s) => sum + convertToAnnual(s.amount, s.period), 0);

const otherIncome = incomeSources
  .filter(s => s.type !== 'employment')
  .reduce((sum, s) => sum + convertToAnnual(s.amount, s.period), 0);

// NI only on employment income (and only if under SPA)
const niableIncome = isOverStatePensionAge ? 0 : employmentIncome;

// Tax on all income combined
const totalTaxableIncome = employmentIncome + otherIncome;
```

---

## 🎯 Implementation Phases

### Phase 1: Age-Based NI (2-3 hours) ⚡

**What:** Auto-exempt from NI if age >= 66

**Changes:**
1. Update `taxCalculator.ts` line ~594
2. Add age check: `const isOverSPA = input.age >= 66`
3. Update condition: `if (!payNoNI && niCategory !== 'C' && !isOverSPA)`
4. Add UI message in results
5. Write tests

**Ready to start immediately!**

---

### Phase 2: Multiple Incomes (2-3 days) 📊

**What:** Dynamic list of income sources with Collapsible

**Components Needed:**
- ✅ `Collapsible` (already available)
- ✅ `Select` (already available)
- ✅ `Button` (already available)
- ✅ `NumberInput` (already available)

**Steps:**
1. Add `incomeSources` to calculator store
2. Create `IncomeSourceList` component
3. Add/remove/update handlers
4. Update `taxCalculator.ts` to handle multiple sources
5. Update results display
6. Write tests

**Blockers:** None - all components available!

---

### Phase 3: Self-Employed (2-3 days) 💼

**What:** Tabs or separate page for self-employed

**If Tabs Approach:**
1. Install: `npx shadcn@latest add tabs`
2. Create `EmploymentTypeTabs` component
3. Create `SelfEmployedInputs` component
4. Implement Class 2 & 4 NI logic
5. Update results display
6. Write tests

**If Separate Page:**
1. Create `/app/self-employed/page.tsx`
2. Copy and modify calculator components
3. Implement Class 2 & 4 NI logic
4. Update navigation
5. Write tests

**Blockers:** Decision needed on approach

---

## ❓ Decisions Needed

### 1. Multiple Income Sources

**Question:** Dynamic list (Option A) or fixed fields (Option B)?

**Your Thoughts:**
> "maybe users can add items, creates a list (label + amount) they can self add"

**My Recommendation:** Option A (Dynamic List with Collapsible)
- Matches your vision
- More flexible
- Uses existing components
- Better UX (collapsed by default)

**Your Decision:** ?

---

### 2. Self-Employed Calculator

**Question:** Tabs (Option A) or dedicated page (Option B)?

**Your Thoughts:**
> "either we have 2 very distinct tabs a user selects, then inputs refresh based on that, or, a new page dedicated to this"

**My Recommendation:** Tabs (Option A)
- Single page experience
- Easy to compare
- More discoverable
- Standard UX pattern

**Your Decision:** ?

---

### 3. Implementation Order

**My Recommendation:**
1. ⚡ **Phase 1 First** - Age-based NI (2-3 hours, critical fix)
2. 📊 **Phase 2 Next** - Multiple incomes (user priority)
3. 💼 **Phase 3 Last** - Self-employed (bigger feature)

**Your Preference:** ?

---

## 🚀 Next Actions

**Awaiting Your Input On:**

1. ✅ Do you prefer **dynamic list (Collapsible)** or **fixed fields** for multiple incomes?
2. ✅ Do you prefer **tabs** or **dedicated page** for self-employed?
3. ✅ Should we start with Phase 1 (age-based NI) immediately?

**Once Decided:**

1. Create Linear issues for approved phases
2. Start Phase 1 (age-based NI) - can do this now if you want!
3. Implement Phase 2 & 3 based on your preferred approach

---

## 💬 Your Quotes from Discussion

> "hang on, we have age dropdown for this very reason, dont we implement anything based on the age?? we should!"

**Response:** You're absolutely right! Age dropdown exists but the NI logic doesn't check it. Comment says "no NI" but it's misleading. Quick 2-hour fix!

> "i dont want extra banners, etc. should just work, based on user selections"

**Response:** Agreed! No banners. Age >= 66 should silently exempt from NI. Results just show "National Insurance: £0 (over state pension age)" in breakdown.

> "for items 2 & 3, we need a planning session on those"

**Response:** This is it! Full analysis above with your options.

> "lets have a think out these and see how shadcn components can help us here!"

**Response:** Good news - `Collapsible` already available! `Tabs` needs install. Both are perfect for this.

> "either way, lets create a new feature branch for this"

**Response:** ✅ Done! `feature/multiple-incomes-self-employed` created and checked out.

---

## 📖 Full Technical Plan

See: `docs/planning/MULTIPLE_INCOMES_SELF_EMPLOYED_PLAN.md` for complete technical details, code examples, testing strategy, and implementation specifics.

---

**Ready to decide and ship?** 🚀

Let me know your preferences and we can start coding!
