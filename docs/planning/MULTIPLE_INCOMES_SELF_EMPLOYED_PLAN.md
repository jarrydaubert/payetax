# Multiple Income Sources & Self-Employed Calculator - Implementation Plan

**Branch:** `feature/multiple-incomes-self-employed`  
**Created:** 23 October 2025  
**Status:** Planning Phase  
**Priority:** 🔴 Critical (User-Requested Features)

---

## 📋 Executive Summary

This document outlines the implementation plan for two major user-requested features:
1. **Multiple Income Sources** - Allow users to input earnings, pensions, state pension, rental income
2. **Self-Employed Calculator** - Add self-employed tax calculation (Class 2 & Class 4 NI)

**User Feedback Source:** Expert UK tax professional, Tuesday 23 Oct 2025

---

## 🎯 Problem Statement

### Current Limitations

**1. Single Income Source Only**
- ❌ Calculator only accepts one salary input
- ❌ No way to add pension income, state pension, rental income
- ❌ Real UK taxpayers often have 2-5 income sources

**2. Age-Based NI Not Automatic**
- ✅ Age dropdown exists (Under 65, 65-74, 75+)
- ❌ Age doesn't automatically affect NI calculations
- ❌ User must manually check "I pay no NI" checkbox
- ❌ Confusing UX - age 66+ should auto-exempt from employee NI

**3. Self-Employed Not Supported**
- ❌ No self-employed option at all
- ❌ User explicitly expected this feature ("I had in my mind it did self-employed too")
- ❌ Missing 5M potential UK users (self-employed market)

---

## 🔍 Current System Analysis

### Age Dropdown Implementation

**Location:** `src/components/organisms/CalculatorInputs/BasicInputs.tsx` (Line ~227)

```typescript
<Select
  value={
    !input.age || input.age < 65
      ? 'under-65'
      : input.age >= 65 && input.age < 75
        ? '65-74'
        : '75-plus'
  }
  onValueChange={(value) => {
    // Set representative age for each bracket (affects NI calculations)
    if (value === 'under-65')
      setAge(undefined); // Use default (working age)
    else if (value === '65-74')
      setAge(70); // Over state pension age (no NI) ⚠️ COMMENT IS MISLEADING
    else setAge(76); // 75+ (no NI) ⚠️ COMMENT IS MISLEADING
  }}
>
  <SelectTrigger id={ageId} className='w-[120px]' data-testid='age-select'>
    <SelectValue placeholder='Select age range' />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value='under-65'>Under 65</SelectItem>
    <SelectItem value='65-74'>65-74</SelectItem>
    <SelectItem value='75-plus'>Over 75</SelectItem>
  </SelectContent>
</Select>
```

**Issue:** Comment says "no NI" but age isn't actually used for NI exemption!

### NI Calculation Logic

**Location:** `src/lib/taxCalculator.ts` (Line ~594)

```typescript
// Only calculate NI if not exempt
// payNoNI = true for people over State Pension age or other exemptions
// niCategory 'C' = employees over State Pension age (no employee NI but employer still pays)
if (!input.payNoNI && input.niCategory !== 'C') {
  const niRates = standardRates.nationalInsurance.employee[input.niCategory];
  // ... calculate NI
}
```

**Current Behavior:**
1. ✅ NI Category 'C' exists (over state pension age)
2. ✅ `payNoNI` flag respected
3. ❌ `input.age` is NOT checked automatically
4. ❌ User must manually select Category C or check "I pay no NI"

---

## 💡 Solution Approach

### Feature 1: Auto Age-Based NI Exemption

**Quick Fix (1-2 hours)**

**Changes Required:**

1. **Update `taxCalculator.ts`** (Line ~594):
```typescript
// Auto-detect state pension age for NI exemption
// State Pension Age: 66 for current year, increasing gradually
const isOverStatePensionAge = input.age !== undefined && input.age >= 66;

// Only calculate NI if not exempt
if (!input.payNoNI && input.niCategory !== 'C' && !isOverStatePensionAge) {
  // ... calculate NI
}
```

2. **Update UI messaging** - Show "No NI (over state pension age)" in results when age >= 66

3. **Update tests** - Add age-based NI exemption test cases

**Benefits:**
- ✅ Correct calculations for 12.6M UK pensioners
- ✅ No UI changes needed (age dropdown already exists)
- ✅ Backward compatible (payNoNI checkbox still works)
- ✅ Legal compliance

---

### Feature 2: Multiple Income Sources

**Implementation Options:**

#### Option A: Dynamic List with Add/Remove (Recommended) ⭐

**shadcn Components:**
- `Accordion` - Collapsible "Additional Income Sources" section
- `Button` - Add income source
- `Select` - Income type dropdown
- `Input` - Amount fields
- `Trash2` icon - Remove income source

**UX Flow:**
```
┌─────────────────────────────────────┐
│ Primary Income                       │
│ ├─ Salary: £45,000 (existing input) │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ▼ Additional Income Sources         │  ← Accordion (collapsed by default)
│                                      │
│ [+ Add Income Source]                │  ← Button
└─────────────────────────────────────┘

When expanded:
┌─────────────────────────────────────┐
│ ▼ Additional Income Sources         │
│                                      │
│ 1. [Pension ▼] £12,000 [🗑️]        │
│ 2. [State Pension ▼] £11,500 [🗑️]  │
│ 3. [Rental Income ▼] £8,000 [🗑️]   │
│                                      │
│ [+ Add Income Source]                │
└─────────────────────────────────────┘
```

**Income Types:**
- 🏢 **Employment Income** (subject to NI if under SPA)
- 💼 **Private Pension** (no NI, taxable)
- 🏛️ **State Pension** (no NI, taxable)
- 🏠 **Rental Income** (no NI, taxable)
- 📈 **Investment Income** (no NI, taxable - dividends/interest)
- 💰 **Other Taxable Income** (no NI, taxable)

**Data Structure:**
```typescript
interface IncomeSource {
  id: string; // UUID for list management
  type: 'employment' | 'pension' | 'statePension' | 'rental' | 'investment' | 'other';
  label: string; // User-friendly name
  amount: number;
  period: PayPeriod; // Annual, monthly, etc.
}

interface TaxCalculationInput {
  // ... existing fields
  incomeSources: IncomeSource[]; // NEW
}
```

**Calculation Logic:**
```typescript
// Calculate total income by type
const totalEmploymentIncome = incomeSources
  .filter(s => s.type === 'employment')
  .reduce((sum, s) => sum + convertToAnnual(s.amount, s.period), 0);

const totalOtherIncome = incomeSources
  .filter(s => s.type !== 'employment')
  .reduce((sum, s) => sum + convertToAnnual(s.amount, s.period), 0);

// NI only on employment income (if under SPA)
const niableIncome = isOverStatePensionAge ? 0 : totalEmploymentIncome;

// Tax on all income combined
const totalTaxableIncome = totalEmploymentIncome + totalOtherIncome;
```

**Benefits:**
- ✅ Flexible - any number of income sources
- ✅ Clear separation of NI-able vs non-NI-able income
- ✅ Matches real UK tax system
- ✅ No page navigation needed
- ✅ Gradual disclosure (accordion collapsed by default)

**Complexity:** Medium (2-3 days)

#### Option B: Separate Fields Approach

**UX Flow:**
```
┌─────────────────────────────────────┐
│ Employment Income: £45,000           │
│ Private Pension: £12,000             │
│ State Pension: £11,500               │
│ Rental Income: £8,000                │
│ Other Income: £0                     │
└─────────────────────────────────────┘
```

**Benefits:**
- ✅ Simple implementation
- ✅ All fields visible

**Drawbacks:**
- ❌ Cluttered UI (5+ extra fields)
- ❌ Not scalable (what if user has 2 pensions?)
- ❌ Doesn't match "allowances/deductions" pattern user mentioned

**Complexity:** Low (1 day)

---

### Feature 3: Self-Employed Calculator

**Implementation Options:**

#### Option A: Tabs Approach (Recommended) ⭐

**shadcn Components:**
- `Tabs` - Employment type selector
- Tab 1: "Employed" (current calculator)
- Tab 2: "Self-Employed" (new calculator)

**UX Flow:**
```
┌──────────────┬──────────────┐
│  Employed    │ Self-Employed│  ← Tabs
└──────────────┴──────────────┘

Tab 1: Employed (existing inputs)
- Salary, pay period, tax code, etc.

Tab 2: Self-Employed (new inputs)
- Business income
- Business expenses
- Profit (calculated)
- Class 2 NI (auto if profit > £12,570)
- Class 4 NI (9% on £12,570-£50,270, 2% above)
```

**Self-Employed Inputs:**
```typescript
interface SelfEmployedInput {
  businessIncome: number; // Gross receipts
  businessExpenses: number; // Allowable expenses
  profit: number; // Calculated: income - expenses
  class2NI: boolean; // Auto-set if profit > threshold
  class4NI: boolean; // Auto-set if profit > threshold
}
```

**Self-Employed NI Calculation (2025-26):**
```typescript
// Class 2 NI (flat rate)
const class2NIWeekly = 3.45; // £3.45 per week
const class2NIAnnual = profit > 12570 ? class2NIWeekly * 52 : 0;

// Class 4 NI (percentage)
let class4NI = 0;
if (profit > 12570) {
  const lowerBand = Math.min(profit - 12570, 50270 - 12570);
  class4NI += lowerBand * 0.09; // 9% on £12,570-£50,270
  
  if (profit > 50270) {
    class4NI += (profit - 50270) * 0.02; // 2% above £50,270
  }
}

const totalNI = class2NIAnnual + class4NI;
```

**Benefits:**
- ✅ Clear separation (employed vs self-employed)
- ✅ No confusion between different tax systems
- ✅ Room for self-employed-specific inputs
- ✅ Native component (shadcn Tabs)

**Complexity:** Medium-High (2-3 days)

#### Option B: Dedicated Page Approach

**URL Structure:**
- `/` - Employed calculator (current)
- `/self-employed` - Self-employed calculator (new page)

**Benefits:**
- ✅ Complete separation
- ✅ Simpler state management
- ✅ SEO benefits (separate pages)

**Drawbacks:**
- ❌ Duplicate code (two separate calculators)
- ❌ User must navigate away
- ❌ Can't easily compare employed vs self-employed

**Complexity:** High (3-4 days)

---

## 🎨 shadcn Components Research

### Components Available

| Component | Use Case | Status |
|-----------|----------|--------|
| **Tabs** | Employment type selector | ✅ Available |
| **Accordion** | Additional income sources | ✅ Available |
| **Select** | Income type dropdown | ✅ Available |
| **Input** | Amount fields | ✅ Available |
| **Button** | Add/remove actions | ✅ Available |
| **Dialog** | Confirmation modals | ✅ Available |
| **Badge** | Income type labels | ✅ Available |
| **Separator** | Visual dividers | ✅ Available |

### Dynamic List Pattern (Multiple Incomes)

**Example Implementation:**

```typescript
const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);

const addIncomeSource = () => {
  setIncomeSources([
    ...incomeSources,
    {
      id: crypto.randomUUID(),
      type: 'pension',
      label: '',
      amount: 0,
      period: 'annually',
    },
  ]);
};

const removeIncomeSource = (id: string) => {
  setIncomeSources(incomeSources.filter(s => s.id !== id));
};

const updateIncomeSource = (id: string, updates: Partial<IncomeSource>) => {
  setIncomeSources(
    incomeSources.map(s => (s.id === id ? { ...s, ...updates } : s))
  );
};
```

**Render:**

```typescript
<Accordion type="single" collapsible defaultValue="">
  <AccordionItem value="income-sources">
    <AccordionTrigger>
      Additional Income Sources ({incomeSources.length})
    </AccordionTrigger>
    <AccordionContent>
      {incomeSources.map((source, index) => (
        <div key={source.id} className="flex gap-2 items-center">
          <Badge variant="outline">{index + 1}</Badge>
          <Select
            value={source.type}
            onValueChange={(type) => updateIncomeSource(source.id, { type })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pension">Private Pension</SelectItem>
              <SelectItem value="statePension">State Pension</SelectItem>
              <SelectItem value="rental">Rental Income</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <NumberInput
            value={source.amount}
            onChange={(amount) => updateIncomeSource(source.id, { amount })}
            prefix="£"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeIncomeSource(source.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" onClick={addIncomeSource}>
        <Plus className="h-4 w-4 mr-2" />
        Add Income Source
      </Button>
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

## 📐 Recommended Implementation Plan

### Phase 1: Quick Wins (1-2 days) ⚡

**Priority 1: Auto Age-Based NI Exemption**
- Update `taxCalculator.ts` to check `input.age >= 66`
- Add UI messaging for age-based NI exemption
- Write tests
- **Time:** 2-3 hours
- **Impact:** Critical - fixes incorrect calculations for 12.6M pensioners

### Phase 2: Multiple Income Sources (2-3 days) 📊

**Priority 2: Dynamic Income Source List**
- Add `Accordion` component for "Additional Income Sources"
- Implement dynamic list with add/remove
- Add income type selector (pension, state pension, rental, etc.)
- Update `taxCalculator.ts` to handle multiple income sources
- Separate NI-able vs non-NI-able income
- Update results display to show income breakdown
- Write tests
- **Time:** 2-3 days
- **Impact:** High - makes calculator useful for pensioners & property investors

### Phase 3: Self-Employed Calculator (2-3 days) 💼

**Priority 3: Employment Type Tabs**
- Add `Tabs` component (Employed / Self-Employed)
- Create self-employed input section
- Implement Class 2 & Class 4 NI calculations
- Update results display for self-employed
- Write tests
- **Time:** 2-3 days
- **Impact:** High - doubles addressable market (5M self-employed)

### Phase 4: Polish & Documentation (1 day) ✨

**Priority 4: UX Polish**
- Add tooltips explaining income types
- Add examples/help text
- Update user guide
- Blog post announcing new features
- **Time:** 1 day
- **Impact:** Medium - improved UX

**Total Estimated Time:** 6-10 days

---

## 🧪 Testing Strategy

### Unit Tests

**Age-Based NI:**
- Age 65 → pays NI
- Age 66 → no NI
- Age 70 → no NI
- Employer NI still calculated for 66+

**Multiple Income Sources:**
- Single employment income (current behavior)
- Employment + pension income
- Multiple pension sources
- State pension + rental income
- All income types combined

**Self-Employed:**
- Profit below £12,570 → no NI
- Profit £12,570-£50,270 → Class 2 + 9% Class 4
- Profit above £50,270 → Class 2 + 9% + 2% Class 4
- Business expenses deduction

### Integration Tests

- Age dropdown changes → NI auto-updates
- Add/remove income sources → totals update
- Switch tabs employed ↔ self-employed → inputs clear/restore

### E2E Tests

- Complete flow: Age 67, pension + state pension → correct tax
- Complete flow: Self-employed £60k profit → correct Class 2 & 4 NI

---

## 📋 Questions for Discussion

1. **Age-Based NI:**
   - ✅ Should we fix the comment in `BasicInputs.tsx` that says "no NI" but doesn't implement it?
   - ✅ Should we keep the "I pay no NI" checkbox as an override? (Yes - for edge cases)

2. **Multiple Income Sources:**
   - ✅ **Preferred Approach:** Option A (Dynamic List with Accordion)
   - How many default income sources should we show? (None - user adds as needed)
   - Should we allow custom labels per income source? (Yes - "Pension 1", "Pension 2", etc.)

3. **Self-Employed:**
   - ✅ **Preferred Approach:** Tabs (Employed / Self-Employed)
   - Should we support mixed (employed + self-employed)? (Phase 4 - future)
   - Do we need separate Scottish self-employed rates? (Check HMRC rules)

4. **UX Details:**
   - Should accordion be open/closed by default? (Closed - gradual disclosure)
   - Should we persist income sources in localStorage? (Yes - like other inputs)
   - Should we have a "common scenarios" preset? (Phase 4 - nice to have)

---

## 🚀 Next Steps

1. ✅ Review this plan
2. ✅ Agree on approach for each feature
3. ⬜ Create Linear issues (one per phase)
4. ⬜ Start with Phase 1 (Age-Based NI - quick win)
5. ⬜ Implement Phase 2 & 3 in parallel if resources allow

---

**Ready to proceed?** Let's discuss which approach you prefer for each feature!
