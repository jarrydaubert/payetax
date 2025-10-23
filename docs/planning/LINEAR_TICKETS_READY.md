# Linear Tickets - Multiple Incomes & Self-Employed Features

**Branch:** `feature/multiple-incomes-self-employed`  
**Created:** 23 October 2025  
**Status:** Ready to create in Linear

---

## 🎯 Overview

Three interconnected features based on critical user feedback from UK tax professional:

1. **PAYTAX-XX:** Auto Age-Based NI Exemption (Quick Win - 2-3 hours)
2. **PAYTAX-YY:** Multiple Income Sources with Accordion (2-3 days)
3. **PAYTAX-ZZ:** Self-Employed Calculator with Tabs (2-3 days)

**Total Estimated Time:** 6-10 days

---

## Ticket 1: Auto Age-Based NI Exemption

### Title
```
⚡ Auto Age-Based NI Exemption (State Pension Age)
```

### Description
```markdown
## Problem

Age dropdown exists but doesn't automatically exempt users from NI contributions:
- ✅ Age dropdown: Under 65, 65-74, 75+
- ❌ Sets age (70, 76) but doesn't affect NI calculations
- ❌ Comment says "no NI" but it's misleading
- ❌ User must manually check "I pay no NI" checkbox
- ❌ Results in incorrect calculations for 12.6M UK pensioners

**User Feedback:** "also it does no deal properly with people over state pension age. They pay no NI on earnings (their employer does)"

## Solution

Auto-detect state pension age (66+) in taxCalculator.ts and exempt from employee NI automatically.

## Current State Pension Age (HMRC)
- **Age 66:** Current SPA for most people
- **Rising to 67:** Gradual increase from 2026-2028
- **Age 65-74 Allowance:** £3,660 extra personal allowance (tapers above £34,600)
- **Age 75+ Allowance:** £3,960 extra personal allowance (tapers above £34,600)

Source: https://www.gov.uk/state-pension-age

## Technical Changes

### 1. Update taxCalculator.ts (Line ~594)
```typescript
// Auto-detect state pension age for NI exemption
const isOverStatePensionAge = input.age !== undefined && input.age >= 66;

// Only calculate employee NI if not exempt
if (!input.payNoNI && input.niCategory !== 'C' && !isOverStatePensionAge) {
  // Calculate NI...
}
```

### 2. Update Age Dropdown Comment (BasicInputs.tsx Line ~237)
**Current (misleading):**
```typescript
else if (value === '65-74')
  setAge(70); // Over state pension age (no NI) ⚠️ WRONG
```

**Fixed:**
```typescript
else if (value === '65-74')
  setAge(70); // Gets £3,660 age allowance, auto-exempt from NI if 66+
```

### 3. Update Results Display
Show NI exemption reason in results:
- "National Insurance: £0 (over state pension age)" for age 66+
- Keep existing "No NI" message for manual payNoNI checkbox

### 4. Keep Backward Compatibility
- Keep "I pay no NI" checkbox as override for edge cases
- Keep NI Category 'C' option
- Keep `payNoNI` flag for other exemptions

## Acceptance Criteria

**Calculation Logic:**
- [ ] Age < 66 → Calculate NI normally
- [ ] Age 66-74 → Employee NI = £0, gets £3,660 age allowance
- [ ] Age 75+ → Employee NI = £0, gets £3,960 age allowance
- [ ] Employer NI still calculated for age 66+
- [ ] "I pay no NI" checkbox still works as override

**UI Updates:**
- [ ] Fix misleading comment in BasicInputs.tsx
- [ ] Results show "over state pension age" for age 66+
- [ ] Age dropdown labels accurate

**Tests:**
- [ ] Age 65 pays NI ✓
- [ ] Age 66 no employee NI ✓
- [ ] Age 70 no employee NI + £3,660 allowance ✓
- [ ] Age 76 no employee NI + £3,960 allowance ✓
- [ ] Employer NI calculated for 66+ ✓
- [ ] Manual payNoNI override works ✓
- [ ] NI Category 'C' still works ✓

**Documentation:**
- [ ] Update CONTRIBUTING.md age allowance section
- [ ] Update inputTooltips.ts for age field
- [ ] Update test documentation

## Test Cases

```typescript
describe('Auto Age-Based NI Exemption', () => {
  it('Age 65 - pays NI (below SPA)', () => {
    const result = calculateTax({ ...input, age: 65 });
    expect(result.nationalInsurance.annually).toBeGreaterThan(0);
    expect(result.taxFreeAmount).toBe(12570 + 3660); // Gets age allowance
  });

  it('Age 66 - no employee NI (at SPA)', () => {
    const result = calculateTax({ ...input, age: 66, salary: 30000 });
    expect(result.nationalInsurance.annually).toBe(0);
    expect(result.employerNI).toBeGreaterThan(0); // Employer still pays
    expect(result.taxFreeAmount).toBe(12570 + 3660);
  });

  it('Age 70 - no NI + age allowance', () => {
    const result = calculateTax({ ...input, age: 70, salary: 30000 });
    expect(result.nationalInsurance.annually).toBe(0);
    expect(result.taxFreeAmount).toBe(12570 + 3660);
  });

  it('Age 76 - no NI + higher age allowance', () => {
    const result = calculateTax({ ...input, age: 76, salary: 30000 });
    expect(result.nationalInsurance.annually).toBe(0);
    expect(result.taxFreeAmount).toBe(12570 + 3960); // Higher allowance
  });

  it('Manual payNoNI override still works', () => {
    const result = calculateTax({ ...input, age: 50, payNoNI: true });
    expect(result.nationalInsurance.annually).toBe(0);
  });

  it('NI Category C override still works', () => {
    const result = calculateTax({ ...input, age: 50, niCategory: 'C' });
    expect(result.nationalInsurance.annually).toBe(0);
  });
});
```

## Time Estimate
**2-3 hours** (quick win)

## Priority
🔴 **Urgent** - Legal compliance issue, incorrect calculations for millions of UK pensioners

## Labels
`bug`, `compliance`, `ni-calculation`, `quick-win`

## Dependencies
None - can start immediately
```

---

## Ticket 2: Multiple Income Sources

### Title
```
📊 Multiple Income Sources with Dynamic List (Accordion)
```

### Description
```markdown
## Problem

Current calculator only accepts one salary input. Real UK taxpayers often have multiple income sources:
- Earnings (subject to NI if under SPA)
- Private pension (taxable, no NI)
- State pension (taxable, no NI)
- Rental income (taxable, no NI)
- Investment income (taxable, no NI)

**User Feedback:** "it would help if there was a way to have more than one source of income eg earnings, pension, state pension, rental income etc. No NI any age on the last 3 and no NI on earnings over state pension age"

## Solution

Add collapsible "Additional Income Sources" section with dynamic list using shadcn Collapsible component.

## HMRC Income Types (SA100 Tax Return)

From HMRC SA100 Self Assessment form:

**Employment Income (SA102):**
- PAYE employment earnings
- Subject to NI if under state pension age (66+)

**Pension Income (SA100 Page 3):**
- State Pension (Box 10)
- Other pensions (Box 11)
- Taxable but NO NI at any age

**Property Income (SA105):**
- UK property rental income
- Taxable but NO NI

**Investment Income (SA100 Page 4):**
- Interest from savings (Box 1-3)
- Dividends (Box 4-9)
- Taxable (after allowances) but NO NI

**Other Income (SA100 Page 5):**
- Foreign income
- Trust income
- Taxable but NO NI

Source: https://www.gov.uk/government/publications/self-assessment-tax-return-sa100

## UX Design

### Collapsed State (Default)
```
┌────────────────────────────────────────┐
│ Primary Income                          │
│ ├─ Salary: £45,000 (annually)          │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ ▶ Additional Income Sources            │  ← Collapsible
│   [+ Add Income Source]                 │
└────────────────────────────────────────┘
```

### Expanded State
```
┌────────────────────────────────────────┐
│ ▼ Additional Income Sources (3)        │
│                                         │
│ 1. [Private Pension ▼] £12,000 [🗑️]   │
│    Period: [Annually ▼]                 │
│                                         │
│ 2. [State Pension ▼] £11,500 [🗑️]     │
│    Period: [Annually ▼]                 │
│                                         │
│ 3. [Rental Income ▼] £650 [🗑️]        │
│    Period: [Monthly ▼]                  │
│                                         │
│ [+ Add Income Source]                   │
└────────────────────────────────────────┘
```

## Technical Implementation

### 1. Data Structure
```typescript
interface IncomeSource {
  id: string; // crypto.randomUUID()
  type: 'employment' | 'pension' | 'statePension' | 'rental' | 'investment' | 'other';
  label: string; // User-friendly name
  amount: number;
  period: PayPeriod; // Annual, monthly, etc.
}

interface TaxCalculationInput {
  // ... existing fields
  incomeSources: IncomeSource[]; // NEW - additional income
}
```

### 2. Calculator Store Update
```typescript
// Add to calculatorStore.ts
incomeSources: IncomeSource[] = [];

// Actions
addIncomeSource: (source: IncomeSource) => void;
updateIncomeSource: (id: string, updates: Partial<IncomeSource>) => void;
removeIncomeSource: (id: string) => void;
```

### 3. Component Structure
```typescript
// New component: IncomeSourceList.tsx
<Collapsible defaultOpen={false}>
  <CollapsibleTrigger>
    Additional Income Sources ({incomeSources.length})
  </CollapsibleTrigger>
  <CollapsibleContent>
    {incomeSources.map((source, index) => (
      <div key={source.id} className="flex gap-2 items-center">
        <Badge variant="outline">{index + 1}</Badge>
        <Select value={source.type} onValueChange={(type) => update(source.id, { type })}>
          <SelectItem value="pension">Private Pension</SelectItem>
          <SelectItem value="statePension">State Pension</SelectItem>
          <SelectItem value="rental">Rental Income</SelectItem>
          <SelectItem value="investment">Investment</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </Select>
        <NumberInput
          value={source.amount}
          onChange={(amount) => update(source.id, { amount })}
          prefix="£"
        />
        <Select value={source.period} onValueChange={(period) => update(source.id, { period })}>
          {/* Pay periods */}
        </Select>
        <Button variant="ghost" size="icon" onClick={() => remove(source.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ))}
    <Button variant="outline" onClick={addNew}>
      <Plus className="h-4 w-4 mr-2" />
      Add Income Source
    </Button>
  </CollapsibleContent>
</Collapsible>
```

### 4. Calculation Logic Update
```typescript
// In taxCalculator.ts

// Separate NI-able vs non-NI-able income
const employmentIncome = input.salary + incomeSources
  .filter(s => s.type === 'employment')
  .reduce((sum, s) => sum + convertToAnnual(s.amount, s.period), 0);

const nonNIIncome = incomeSources
  .filter(s => s.type !== 'employment')
  .reduce((sum, s) => sum + convertToAnnual(s.amount, s.period), 0);

// Total taxable income (all sources)
const totalGrossIncome = employmentIncome + nonNIIncome;

// NI only on employment income (and only if under SPA)
const niableIncome = isOverStatePensionAge ? 0 : employmentIncome;

// Tax calculated on total income after allowances
const taxableIncome = Math.max(0, totalGrossIncome - personalAllowance);
```

### 5. Results Display Update
Show income breakdown:
```
Income Breakdown:
├─ Employment: £45,000
├─ Private Pension: £12,000
├─ State Pension: £11,500
└─ Total Gross: £68,500

Tax Calculation:
├─ Personal Allowance: £12,570
├─ Taxable Income: £55,930
├─ Income Tax: £11,432
└─ National Insurance: £0 (over state pension age)
```

## shadcn Components Used

- ✅ **Collapsible** (already installed)
- ✅ **Select** (already installed)
- ✅ **Button** (already installed)
- ✅ **Badge** (already installed)
- ✅ **NumberInput** (custom, already exists)

## Acceptance Criteria

**Data Management:**
- [ ] Add income source with type, amount, period
- [ ] Update income source (any field)
- [ ] Remove income source
- [ ] Persist in localStorage (like other inputs)
- [ ] Max 10 income sources (reasonable limit)

**Income Types:**
- [ ] Employment - subject to NI if under SPA
- [ ] Private Pension - taxable, no NI
- [ ] State Pension - taxable, no NI
- [ ] Rental Income - taxable, no NI
- [ ] Investment - taxable, no NI
- [ ] Other - taxable, no NI

**Calculation:**
- [ ] All income combined for tax calculation
- [ ] Only employment income subject to NI
- [ ] Age 66+ no NI on any income
- [ ] Personal allowance applied to total income
- [ ] Tax bands calculated correctly

**UI/UX:**
- [ ] Accordion collapsed by default
- [ ] Count badge shows number of sources
- [ ] Each source has clear type label
- [ ] Period selector per source
- [ ] Remove button with confirmation (if >0)
- [ ] Add button always visible

**Tests:**
- [ ] Single employment income (baseline)
- [ ] Employment + pension
- [ ] Multiple pensions
- [ ] State pension + rental income
- [ ] All income types combined
- [ ] Age 66+ with multiple incomes (no NI)
- [ ] Add/update/remove operations
- [ ] Period conversion for each source

**Documentation:**
- [ ] Update CONTRIBUTING.md with income types
- [ ] Add tooltip for "Additional Income Sources"
- [ ] Update USER_GUIDE.md with examples
- [ ] Document HMRC SA100 mapping

## Test Cases

```typescript
describe('Multiple Income Sources', () => {
  it('Employment + Private Pension (age 67)', () => {
    const result = calculateTax({
      ...input,
      age: 67,
      salary: 30000,
      incomeSources: [
        { type: 'pension', amount: 12000, period: 'annually' }
      ]
    });
    
    expect(result.grossSalary.annually).toBe(42000); // Combined
    expect(result.nationalInsurance.annually).toBe(0); // Age 67
    expect(result.taxableIncome).toBe(42000 - 16230); // With age allowance
  });

  it('State Pension + Rental (monthly)', () => {
    const result = calculateTax({
      ...input,
      age: 68,
      salary: 0,
      incomeSources: [
        { type: 'statePension', amount: 11500, period: 'annually' },
        { type: 'rental', amount: 650, period: 'monthly' }
      ]
    });
    
    const totalIncome = 11500 + (650 * 12); // £19,300
    expect(result.grossSalary.annually).toBe(19300);
    expect(result.nationalInsurance.annually).toBe(0);
  });

  it('Multiple income types, age 50 (under SPA)', () => {
    const result = calculateTax({
      ...input,
      age: 50,
      salary: 30000, // Employment
      incomeSources: [
        { type: 'pension', amount: 8000, period: 'annually' },
        { type: 'rental', amount: 500, period: 'monthly' }
      ]
    });
    
    // Total: £30k + £8k + £6k = £44k
    expect(result.grossSalary.annually).toBe(44000);
    // NI only on £30k employment income
    expect(result.nationalInsurance.annually).toBeCloseTo(1394.4, 1);
  });
});
```

## Time Estimate
**2-3 days**

## Priority
🔴 **High** - Major user-requested feature, 12.6M UK pensioners affected

## Labels
`feature`, `income-sources`, `calculation`, `ui-enhancement`

## Dependencies
- **PAYTAX-XX** (Age-based NI) - Should complete first for correct NI calculation
```

---

## Ticket 3: Self-Employed Calculator

### Title
```
💼 Self-Employed Calculator with Tabs (Class 2 & 4 NI)
```

### Description
```markdown
## Problem

Calculator only supports PAYE employees. User expected self-employed support.

**User Feedback:** "I had in my mind it did self-employed too but couldn't find that option on it. Is that a plan you have?"

**Market Impact:** 5M self-employed in UK (doubles addressable market)

## Solution

Add "Employment Type" tabs with shadcn Tabs component:
- Tab 1: Employed (existing calculator)
- Tab 2: Self-Employed (new calculator)

## HMRC Self-Employed Tax Rules (2025-26)

### National Insurance

**Class 2 NI:**
- **Rate:** £3.45 per week (£179.40 per year)
- **Threshold:** Only pay if profit > £6,725
- **Status:** Being abolished - may be £0 in 2026-27

**Class 4 NI:**
- **Rate:** 6% on profits £12,571 - £50,270
- **Rate:** 2% on profits above £50,270
- **Threshold:** First £12,570 is NI-free

### Income Tax
- Same as employed (20%, 40%, 45% bands)
- Deduct business expenses first
- Personal allowance applies to profit

### Payments on Account
If tax + Class 4 NI > £1,000:
- Pay 50% by 31 January
- Pay 50% by 31 July

Source: https://www.gov.uk/self-employed-national-insurance-rates

## Reference Implementation

Old ToolHubX calculator found at:
`/Desktop/Projects Archive/ToolHubX/toolhubx-latest/src/app/tools/self-employed-tax-calculator/page.tsx`

**Key logic:**
```typescript
// Income Tax (same as employed)
const profit = grossIncome - allowableExpenses;
const taxableProfit = Math.max(0, profit - personalAllowance);

// Class 2 NI
const smallProfitsThreshold = 6725;
if (profit > smallProfitsThreshold) {
  niClass2 = 3.45 * 52; // £179.40
}

// Class 4 NI
if (profit > 12570) {
  const lowerBand = Math.min(profit - 12570, 50270 - 12570);
  niClass4 = lowerBand * 0.06; // 6%
  
  if (profit > 50270) {
    niClass4 += (profit - 50270) * 0.02; // 2%
  }
}

// Payments on Account
if (incomeTax + niClass4 > 1000) {
  paymentOnAccount = (incomeTax + niClass4) / 2; // Per installment
}
```

## UX Design

### Tabs Layout
```
┌──────────────┬──────────────┐
│  Employed ✓  │ Self-Employed│  ← Tabs
└──────────────┴──────────────┘

Tab 1: Employed
[Current calculator - no changes]

Tab 2: Self-Employed
┌─────────────────────────────────────┐
│ Business Income: £50,000            │
│ Business Expenses: £8,000           │
│ ─────────────────────────────────── │
│ Profit: £42,000 (calculated)        │
│                                      │
│ Tax Year: 2025-2026                 │
│ Region: England                     │
│                                      │
│ [Calculate]                         │
└─────────────────────────────────────┘

Results:
┌─────────────────────────────────────┐
│ Profit: £42,000                     │
│ Personal Allowance: £12,570         │
│ Taxable Profit: £29,430             │
│                                      │
│ Income Tax: £5,886                  │
│ NI Class 2: £179.40                 │
│ NI Class 4: £1,737.60               │
│ Total Tax & NI: £7,803              │
│                                      │
│ Net Income: £34,197                 │
│ Monthly: £2,850                     │
│                                      │
│ ⚠️ Payments on Account: £3,812      │
│    (2 installments of £3,812 each)  │
└─────────────────────────────────────┘
```

## Technical Implementation

### 1. Install shadcn Tabs
```bash
npx shadcn@latest add tabs
```

### 2. Data Structure
```typescript
type EmploymentType = 'employed' | 'selfEmployed';

interface SelfEmployedInput {
  businessIncome: number;
  businessExpenses: number;
  taxYear: TaxYear;
  region: Region;
}

interface SelfEmployedResults {
  profit: number;
  personalAllowance: number;
  taxableProfit: number;
  incomeTax: number;
  niClass2: number;
  niClass4: number;
  totalTaxAndNI: number;
  netIncome: number;
  monthlyNet: number;
  paymentOnAccount: number; // Per installment (if > £1k total)
}
```

### 3. Component Structure
```typescript
// New component: EmploymentTypeTabs.tsx
<Tabs defaultValue="employed" value={employmentType} onValueChange={setEmploymentType}>
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="employed">Employed (PAYE)</TabsTrigger>
    <TabsTrigger value="selfEmployed">Self-Employed</TabsTrigger>
  </TabsList>
  
  <TabsContent value="employed">
    <BasicInputs /> {/* Existing component */}
    <CalculatorResults />
  </TabsContent>
  
  <TabsContent value="selfEmployed">
    <SelfEmployedInputs /> {/* New component */}
    <SelfEmployedResults />
  </TabsContent>
</Tabs>
```

### 4. Calculation Logic
```typescript
// New file: lib/selfEmployedCalculator.ts

export function calculateSelfEmployedTax(input: SelfEmployedInput): SelfEmployedResults {
  // 1. Calculate profit
  const profit = input.businessIncome - input.businessExpenses;
  
  // 2. Get rates for tax year
  const rates = TAX_RATES[input.taxYear];
  const personalAllowance = rates.personalAllowance;
  
  // 3. Calculate taxable profit
  const taxableProfit = Math.max(0, profit - personalAllowance);
  
  // 4. Calculate Income Tax (same bands as employed)
  let incomeTax = 0;
  const isScottish = input.region === 'Scotland';
  const taxBands = isScottish ? SCOTTISH_TAX_RATES[input.taxYear].bands : rates.bands;
  
  // [Apply tax bands - same logic as employed]
  
  // 5. Calculate Class 2 NI
  const smallProfitsThreshold = 6725;
  const niClass2 = profit > smallProfitsThreshold ? 3.45 * 52 : 0;
  
  // 6. Calculate Class 4 NI
  let niClass4 = 0;
  const lowerProfitsLimit = 12570;
  const upperProfitsLimit = 50270;
  
  if (profit > lowerProfitsLimit) {
    const lowerBand = Math.min(profit - lowerProfitsLimit, upperProfitsLimit - lowerProfitsLimit);
    niClass4 = lowerBand * 0.06; // 6%
    
    if (profit > upperProfitsLimit) {
      niClass4 += (profit - upperProfitsLimit) * 0.02; // 2%
    }
  }
  
  // 7. Calculate totals
  const totalTaxAndNI = incomeTax + niClass2 + niClass4;
  const netIncome = profit - totalTaxAndNI;
  const monthlyNet = netIncome / 12;
  
  // 8. Payments on Account
  const paymentOnAccount = totalTaxAndNI > 1000 ? totalTaxAndNI / 2 : 0;
  
  return {
    profit: roundToPence(profit),
    personalAllowance,
    taxableProfit: roundToPence(taxableProfit),
    incomeTax: roundToPence(incomeTax),
    niClass2: roundToPence(niClass2),
    niClass4: roundToPence(niClass4),
    totalTaxAndNI: roundToPence(totalTaxAndNI),
    netIncome: roundToPence(netIncome),
    monthlyNet: roundToPence(monthlyNet),
    paymentOnAccount: roundToPence(paymentOnAccount),
  };
}
```

## shadcn Components Used

- ⚠️ **Tabs** (needs install: `npx shadcn@latest add tabs`)
- ✅ **NumberInput** (custom, already exists)
- ✅ **Select** (already installed)
- ✅ **Button** (already installed)
- ✅ **Alert** (already installed) - for Payments on Account warning

## Acceptance Criteria

**UI/UX:**
- [ ] Tabs switch between Employed / Self-Employed
- [ ] Self-employed inputs: Business Income, Expenses
- [ ] Auto-calculate profit (income - expenses)
- [ ] Tax year and region selectors
- [ ] Clear results breakdown
- [ ] Payments on Account warning (if > £1k)

**Calculations:**
- [ ] Profit calculated correctly
- [ ] Income tax same as employed (HMRC bands)
- [ ] Class 2 NI: £179.40 if profit > £6,725
- [ ] Class 4 NI: 6% on £12,571-£50,270, 2% above
- [ ] Payments on Account if tax + Class 4 > £1,000
- [ ] Scottish tax rates applied correctly

**Data Management:**
- [ ] Employment type persisted in store
- [ ] Self-employed inputs persisted in localStorage
- [ ] Tab switches clear/restore inputs appropriately

**Tests:**
- [ ] Profit below £12,570 (no income tax, only Class 2 NI)
- [ ] Profit £12,570-£50,270 (basic rate + Class 2 + 6% Class 4)
- [ ] Profit above £50,270 (higher rate + Class 2 + 6%/2% Class 4)
- [ ] Payments on Account triggered at £1,001 total tax
- [ ] Scottish self-employed rates
- [ ] Zero expenses (income = profit)
- [ ] Expenses exceed income (£0 profit, no tax/NI)

**Documentation:**
- [ ] Update CONTRIBUTING.md with self-employed calculations
- [ ] Add tooltips for Class 2 and Class 4 NI
- [ ] Update USER_GUIDE.md with self-employed examples
- [ ] Link to HMRC guidance

## Test Cases

```typescript
describe('Self-Employed Calculator', () => {
  it('Profit £20,000 - basic calculations', () => {
    const result = calculateSelfEmployedTax({
      businessIncome: 25000,
      businessExpenses: 5000,
      taxYear: '2025-2026',
      region: 'England',
    });
    
    expect(result.profit).toBe(20000);
    expect(result.taxableProfit).toBe(7430); // £20k - £12,570
    expect(result.incomeTax).toBeCloseTo(1486, 0); // £7,430 × 20%
    expect(result.niClass2).toBeCloseTo(179.4, 1);
    expect(result.niClass4).toBeCloseTo(445.8, 1); // (£20k - £12,570) × 6%
  });

  it('Profit £60,000 - higher rate taxpayer', () => {
    const result = calculateSelfEmployedTax({
      businessIncome: 70000,
      businessExpenses: 10000,
      taxYear: '2025-2026',
      region: 'England',
    });
    
    expect(result.profit).toBe(60000);
    expect(result.niClass4).toBeCloseTo(2456.6, 1);
    // (£50,270 - £12,570) × 6% + (£60k - £50,270) × 2%
    // = £37,700 × 6% + £9,730 × 2%
    // = £2,262 + £194.60 = £2,456.60
    
    // Payments on Account should trigger
    expect(result.paymentOnAccount).toBeGreaterThan(0);
  });

  it('Profit £6,000 - below Class 2 threshold', () => {
    const result = calculateSelfEmployedTax({
      businessIncome: 8000,
      businessExpenses: 2000,
      taxYear: '2025-2026',
      region: 'England',
    });
    
    expect(result.profit).toBe(6000);
    expect(result.niClass2).toBe(0); // Below £6,725 threshold
    expect(result.niClass4).toBe(0); // Below £12,570
    expect(result.incomeTax).toBe(0); // Below personal allowance
  });

  it('Expenses exceed income - no tax/NI', () => {
    const result = calculateSelfEmployedTax({
      businessIncome: 10000,
      businessExpenses: 15000,
      taxYear: '2025-2026',
      region: 'England',
    });
    
    expect(result.profit).toBe(-5000);
    expect(result.incomeTax).toBe(0);
    expect(result.niClass2).toBe(0);
    expect(result.niClass4).toBe(0);
  });
});
```

## Time Estimate
**2-3 days**
- Day 1: Install Tabs, create components, basic UI
- Day 2: Implement calculator logic, integrate with store
- Day 3: Write tests, documentation, polish

## Priority
🔴 **High** - User-requested feature, doubles addressable market (5M self-employed)

## Labels
`feature`, `self-employed`, `calculation`, `ui-enhancement`

## Dependencies
- **shadcn Tabs component** (needs install)
- **PAYTAX-XX** (Age-based NI) - For correct NI rates
```

---

## Summary Table

| Ticket | Title | Est. Time | Priority | Dependencies |
|--------|-------|-----------|----------|--------------|
| PAYTAX-XX | Auto Age-Based NI Exemption | 2-3 hours | 🔴 Urgent | None |
| PAYTAX-YY | Multiple Income Sources | 2-3 days | 🔴 High | PAYTAX-XX |
| PAYTAX-ZZ | Self-Employed Calculator | 2-3 days | 🔴 High | shadcn Tabs |

**Total:** 6-10 days for all 3 features

---

## Next Steps

1. ✅ Copy these ticket descriptions into Linear
2. ✅ Set up dependencies (PAYTAX-YY depends on PAYTAX-XX)
3. ✅ Assign to team/self
4. ✅ Start with PAYTAX-XX (quick win - 2-3 hours)
5. ✅ Then tackle PAYTAX-YY and PAYTAX-ZZ in parallel if resources allow

---

**Ready to create these tickets in Linear!** 🚀
