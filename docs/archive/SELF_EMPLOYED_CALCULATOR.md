# Self-Employed Tax Calculator - Implementation Plan

**Status:** 🔴 Not Started (Planned)  
**Priority:** Medium (User-Requested Feature)  
**Estimated Time:** 2-3 days  
**Dependencies:** None (can be implemented independently)

---

## 📋 Executive Summary

Add self-employed tax calculation functionality to PayeTax calculator, supporting:
- Business income and allowable expenses
- Profit calculation
- Class 2 National Insurance (flat rate)
- Class 4 National Insurance (percentage-based)
- Integration with existing income tax calculations

**User Feedback Source:** Expert UK tax professional, Tuesday 23 Oct 2025
> "I had in my mind it did self-employed too"

**Market Opportunity:** 5 million self-employed workers in UK (15% of workforce)

---

## 🎯 Problem Statement

### Current Limitation

- ❌ Calculator only supports PAYE employed workers
- ❌ No self-employed option at all
- ❌ Missing 5M potential UK users
- ❌ Different NI system (Class 2 & 4 vs Class 1 employee NI)

### Self-Employed Tax System (Brief Overview)

**Key Differences from PAYE:**

| Aspect | PAYE Employed | Self-Employed |
|--------|---------------|---------------|
| **Income** | Gross salary | Business profit (income - expenses) |
| **Tax Code** | HMRC-assigned (e.g., 1257L) | N/A (self-assessment) |
| **NI Type** | Class 1 Employee (8-12% on salary) | Class 2 (flat £3.45/week) + Class 4 (9%/2% on profit) |
| **Payment** | Deducted by employer | Self-assessment (2 payments/year) |
| **Pension** | Employer contributions | Self-funded |

---

## 💡 Solution Design

### Option A: Tabs Approach ⭐ **RECOMMENDED**

**UI Component:** shadcn `Tabs`

**Layout:**
```
┌──────────────┬──────────────┐
│  Employed ✓  │ Self-Employed│  ← Tabs
└──────────────┴──────────────┘

Tab 1: Employed (existing calculator)
- Salary, pay period, tax code, NI Category, etc.

Tab 2: Self-Employed (new calculator)
┌────────────────────────────────────────┐
│ Business Income (Gross Receipts)       │
│ £ [_________] [Annually ▼]             │
│                                         │
│ Business Expenses (Allowable)          │
│ £ [_________] [Annually ▼]             │
│                                         │
│ ═══════════════════════════════════    │
│ Taxable Profit: £XX,XXX                │
│ ═══════════════════════════════════    │
│                                         │
│ [ℹ️] Class 2 NI: £179.40/year          │
│     (£3.45/week for profit > £12,570)  │
│                                         │
│ [ℹ️] Class 4 NI: £X,XXX                │
│     - 9% on profit £12,570-£50,270     │
│     - 2% on profit above £50,270       │
│                                         │
│ Tax Region: [England ▼]                │
│ Tax Year: [2025-26 ▼]                  │
│ Student Loan: [None ▼]                 │
└────────────────────────────────────────┘
```

**Benefits:**
- ✅ Clear separation (no confusion between employed/self-employed)
- ✅ All-in-one tool (users don't navigate away)
- ✅ Can compare employed vs self-employed scenarios
- ✅ Native shadcn component (already in project)
- ✅ Mobile-friendly (tabs stack on small screens)

**Complexity:** Medium (2-3 days)

---

### Option B: Dedicated Page Approach

**URL Structure:**
- `/` - Employed calculator (current)
- `/self-employed` - Self-employed calculator (new page)

**Benefits:**
- ✅ Complete code separation
- ✅ Simpler state management
- ✅ SEO benefits (separate landing page for "self employed tax calculator")
- ✅ Can optimize content/copy for self-employed users

**Drawbacks:**
- ❌ Duplicate code (two separate calculators)
- ❌ User must navigate between pages
- ❌ Can't easily toggle between employed/self-employed modes
- ❌ More maintenance overhead

**Complexity:** High (3-4 days + routing + navigation updates)

---

## 📐 Data Structure

### TypeScript Interfaces

```typescript
/**
 * Self-employed calculator input
 */
interface SelfEmployedInput {
  /** Gross business income (receipts/turnover) */
  businessIncome: number;
  
  /** Pay period for business income */
  businessIncomePeriod: PayPeriod;
  
  /** Allowable business expenses */
  businessExpenses: number;
  
  /** Pay period for expenses */
  businessExpensesPeriod: PayPeriod;
  
  /** Calculated taxable profit (income - expenses) */
  profit: number;
  
  /** Tax region (England, Scotland, Wales, NI) */
  region: 'England' | 'Scotland' | 'Wales' | 'Northern Ireland';
  
  /** Tax year */
  taxYear: TaxYear;
  
  /** Student loan plan (if applicable) */
  studentLoanPlan: StudentLoanPlan | 'none';
  
  /** Age (affects personal allowance taper) */
  age?: number;
  
  /** Is blind (affects blind person's allowance) */
  isBlind: boolean;
}

/**
 * Self-employed calculation results
 */
interface SelfEmployedResults {
  /** Annual taxable profit */
  profit: number;
  
  /** Class 2 NI (flat rate) */
  class2NI: number;
  
  /** Class 4 NI (percentage-based) */
  class4NI: number;
  
  /** Total NI contributions */
  totalNI: number;
  
  /** Income tax (on profit) */
  incomeTax: number;
  
  /** Student loan repayment */
  studentLoanRepayment: number;
  
  /** Total tax + NI + student loan */
  totalDeductions: number;
  
  /** Take-home profit after all deductions */
  netProfit: number;
  
  /** Effective tax rate */
  effectiveTaxRate: number;
  
  /** Breakdown by component */
  breakdown: {
    class2Weekly: number;
    class2Annual: number;
    class4Lower: number;  // 9% band
    class4Upper: number;  // 2% band
    taxByBand: TaxBand[];
  };
}
```

---

## 🧮 Self-Employed NI Calculation Logic

### Class 2 NI (Flat Rate)

**2025-26 Rates:**
- £3.45 per week if profit > £12,570
- £0 if profit ≤ £12,570

```typescript
/**
 * Calculate Class 2 National Insurance
 * Flat weekly rate for self-employed with profits above threshold
 */
function calculateClass2NI(annualProfit: number): number {
  const CLASS_2_WEEKLY_RATE = 3.45; // 2025-26
  const CLASS_2_THRESHOLD = 12570;  // Same as personal allowance
  
  if (annualProfit <= CLASS_2_THRESHOLD) {
    return 0;
  }
  
  // Pay £3.45 per week for full year
  return CLASS_2_WEEKLY_RATE * 52;
}
```

**Annual Class 2 NI:** £179.40 (if profit > £12,570)

---

### Class 4 NI (Percentage-Based)

**2025-26 Rates:**
- 9% on profits between £12,570 and £50,270
- 2% on profits above £50,270

```typescript
/**
 * Calculate Class 4 National Insurance
 * Percentage-based on profit bands
 */
function calculateClass4NI(annualProfit: number): number {
  const LOWER_THRESHOLD = 12570;  // 9% starts here
  const UPPER_THRESHOLD = 50270;  // 2% starts here
  const LOWER_RATE = 0.09;        // 9%
  const UPPER_RATE = 0.02;        // 2%
  
  let class4NI = 0;
  
  if (annualProfit <= LOWER_THRESHOLD) {
    return 0;
  }
  
  // Calculate 9% on profit between £12,570 and £50,270
  const lowerBandProfit = Math.min(
    annualProfit - LOWER_THRESHOLD,
    UPPER_THRESHOLD - LOWER_THRESHOLD
  );
  class4NI += lowerBandProfit * LOWER_RATE;
  
  // Calculate 2% on profit above £50,270
  if (annualProfit > UPPER_THRESHOLD) {
    const upperBandProfit = annualProfit - UPPER_THRESHOLD;
    class4NI += upperBandProfit * UPPER_RATE;
  }
  
  return class4NI;
}
```

**Example Calculations:**

| Annual Profit | Class 2 | Class 4 (9%) | Class 4 (2%) | Total NI |
|---------------|---------|--------------|--------------|----------|
| £10,000 | £0 | £0 | £0 | **£0** |
| £20,000 | £179.40 | £668.70 | £0 | **£848.10** |
| £40,000 | £179.40 | £2,469.00 | £0 | **£2,648.40** |
| £60,000 | £179.40 | £3,393.00 | £194.60 | **£3,767.00** |
| £100,000 | £179.40 | £3,393.00 | £994.60 | **£4,567.00** |

---

### Income Tax Calculation

**Same as PAYE employed:**
- Personal Allowance: £12,570 (tapers above £100k)
- Basic rate (20%): £12,571 - £50,270
- Higher rate (40%): £50,271 - £125,140
- Additional rate (45%): Above £125,140

**Scottish rates apply if region = Scotland**

```typescript
/**
 * Calculate self-employed income tax
 * Reuses existing tax calculation logic with profit as taxable income
 */
function calculateSelfEmployedTax(
  profit: number,
  region: string,
  taxYear: TaxYear,
  isBlind: boolean,
  age?: number
): TaxCalculationResults {
  // Use existing calculateTax() function
  // Pass profit as 'salary' equivalent
  return calculateTax({
    salary: profit,
    payPeriod: 'annually',
    taxCode: '1257L', // Standard (self-employed don't use tax codes, but calculator needs it)
    region,
    taxYear,
    isScottish: region === 'Scotland',
    payNoNI: true, // Skip employee NI (we calculate Class 2/4 separately)
    niCategory: 'A',
    studentLoanPlan: 'none', // Handle separately
    pensionContribution: 0,
    isBlind,
    age,
    // ... other fields
  });
}
```

---

## 🎨 UI Components

### shadcn Components Needed

| Component | Use Case | Status |
|-----------|----------|--------|
| **Tabs** | Employment type switcher | ✅ Already in project |
| **Input** | Business income/expenses | ✅ Already in project |
| **Select** | Pay period, region, tax year | ✅ Already in project |
| **Badge** | "New" badge on Self-Employed tab | ✅ Already in project |
| **Alert** | Info boxes for NI explanations | ✅ Already in project |
| **Separator** | Visual dividers | ✅ Already in project |

### New Components to Create

**`SelfEmployedInputs.tsx`**
```typescript
/**
 * Self-employed calculator input form
 * Displays business income, expenses, and profit calculation
 */
export function SelfEmployedInputs() {
  const { input, setBusinessIncome, setBusinessExpenses } = useCalculatorStore();
  
  const profit = input.businessIncome - input.businessExpenses;
  
  return (
    <div className="space-y-4">
      {/* Business Income */}
      <div>
        <Label>Business Income (Gross Receipts)</Label>
        <NumberInput
          value={input.businessIncome}
          onChange={setBusinessIncome}
          prefix="£"
        />
      </div>
      
      {/* Business Expenses */}
      <div>
        <Label>Business Expenses (Allowable)</Label>
        <NumberInput
          value={input.businessExpenses}
          onChange={setBusinessExpenses}
          prefix="£"
        />
      </div>
      
      {/* Calculated Profit */}
      <Alert>
        <Calculator className="h-4 w-4" />
        <AlertTitle>Taxable Profit</AlertTitle>
        <AlertDescription>
          £{profit.toLocaleString()} (Income - Expenses)
        </AlertDescription>
      </Alert>
      
      {/* NI Preview */}
      <div className="rounded-lg border p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Class 2 NI</span>
          <span>£{calculateClass2NI(profit).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Class 4 NI</span>
          <span>£{calculateClass4NI(profit).toFixed(2)}</span>
        </div>
      </div>
      
      {/* Other inputs (region, tax year, student loan, etc.) */}
    </div>
  );
}
```

---

## 🧪 Testing Strategy

### Unit Tests

**Class 2 NI:**
- Profit £10,000 → £0 (below threshold)
- Profit £12,570 → £0 (at threshold)
- Profit £12,571 → £179.40 (above threshold)
- Profit £100,000 → £179.40 (always flat rate)

**Class 4 NI:**
- Profit £12,570 → £0 (at lower threshold)
- Profit £20,000 → £668.70 (9% band only)
- Profit £50,270 → £3,393.00 (top of 9% band)
- Profit £60,000 → £3,587.60 (9% + 2% bands)
- Profit £100,000 → £4,387.60 (both bands)

**Combined NI + Tax:**
- Verify profit £40k → total tax + NI matches HMRC examples
- Verify Scottish rates apply correctly
- Verify student loan repayment on profit
- Verify personal allowance taper (profit > £100k)

### Integration Tests

**Tab Switching:**
- Switch from Employed → Self-Employed → inputs clear
- Switch back to Employed → previous inputs restored
- Results update correctly when switching tabs

**Profit Calculation:**
- Business income changes → profit recalculates
- Business expenses changes → profit recalculates
- Profit = 0 when income = expenses

### E2E Tests

**Complete Flow:**
1. Navigate to calculator
2. Click "Self-Employed" tab
3. Enter business income: £60,000
4. Enter business expenses: £10,000
5. Verify profit: £50,000
6. Verify Class 2 NI: £179.40
7. Verify Class 4 NI: £3,393.00
8. Verify total tax + NI displayed
9. Verify breakdown shows all components

---

## 📂 Files to Create/Modify

### New Files

1. **`src/components/organisms/SelfEmployedInputs.tsx`**
   - Business income/expenses form
   - Profit calculation display
   - NI preview

2. **`src/lib/__tests__/selfEmployedNI.test.ts`**
   - Class 2 NI tests
   - Class 4 NI tests
   - Combined calculations

### Modified Files

1. **`src/store/calculatorStore.ts`**
   - Add `employmentType: 'employed' | 'selfEmployed'`
   - Add `businessIncome: number`
   - Add `businessExpenses: number`
   - Add actions for self-employed inputs

2. **`src/lib/taxCalculator.ts`**
   - Add `calculateClass2NI()`
   - Add `calculateClass4NI()`
   - Add `calculateSelfEmployedResults()`

3. **`src/components/organisms/CalculatorInputs/BasicInputs.tsx`**
   - Wrap in Tabs component
   - Tab 1: Existing employed inputs
   - Tab 2: `<SelfEmployedInputs />`

4. **`src/components/organisms/CalculatorResults/ResultsSummaryCards.tsx`**
   - Show Class 2 & Class 4 NI cards (instead of employee NI)
   - Adjust labels for self-employed

5. **`src/constants/taxRates.ts`**
   - Add `CLASS_2_NI_RATE = 3.45`
   - Add `CLASS_2_THRESHOLD = 12570`
   - Add `CLASS_4_LOWER_RATE = 0.09`
   - Add `CLASS_4_UPPER_RATE = 0.02`
   - Add `CLASS_4_LOWER_THRESHOLD = 12570`
   - Add `CLASS_4_UPPER_THRESHOLD = 50270`

---

## 📝 Implementation Checklist

### Phase 1: Core Calculation Logic (4-6 hours)

- [ ] Add Class 2 NI calculation function
- [ ] Add Class 4 NI calculation function
- [ ] Add unit tests for both (15+ test cases)
- [ ] Verify against HMRC examples

### Phase 2: State Management (2-3 hours)

- [ ] Update `calculatorStore.ts` with self-employed fields
- [ ] Add `employmentType` state (employed/selfEmployed)
- [ ] Add `businessIncome` and `businessExpenses` state
- [ ] Add actions: `setBusinessIncome()`, `setBusinessExpenses()`, `setEmploymentType()`
- [ ] Add computed `profit` getter

### Phase 3: UI Components (6-8 hours)

- [ ] Create `SelfEmployedInputs.tsx` component
- [ ] Add Tabs wrapper to `BasicInputs.tsx`
- [ ] Add business income input with period selector
- [ ] Add business expenses input with period selector
- [ ] Add profit calculation display
- [ ] Add Class 2 & Class 4 NI preview
- [ ] Add region/tax year/student loan selectors

### Phase 4: Results Display (3-4 hours)

- [ ] Update `ResultsSummaryCards.tsx` for self-employed mode
- [ ] Show Class 2 NI card (instead of employee NI)
- [ ] Show Class 4 NI card (new)
- [ ] Show income tax card (same as employed)
- [ ] Show student loan card (if applicable)
- [ ] Show net profit card (instead of take-home pay)
- [ ] Add breakdown showing 9% and 2% Class 4 bands

### Phase 5: Testing & Polish (3-4 hours)

- [ ] Integration tests for tab switching
- [ ] E2E test for complete self-employed flow
- [ ] Accessibility testing (keyboard nav, screen readers)
- [ ] Mobile responsive testing
- [ ] Add tooltips explaining Class 2 & 4 NI
- [ ] Add help text for allowable expenses

### Phase 6: Documentation (1-2 hours)

- [ ] Update `USER_GUIDE.md` with self-employed instructions
- [ ] Add "What expenses can I claim?" help section
- [ ] Update README.md feature list
- [ ] Consider blog post: "Self-Employed Tax Calculator Guide"

**Total Time Estimate:** 19-27 hours (2.5-3.5 days)

---

## 🚀 Future Enhancements (Not Included in MVP)

### V2 Features

1. **Mixed Employment**
   - Employed + Self-Employed (many contractors have both)
   - Combined Class 1 + Class 2 + Class 4 NI
   - Aggregate income for tax bands

2. **Expense Categories**
   - Pre-fill common expenses (home office, travel, equipment)
   - Simplified expenses (flat rate)
   - Mileage calculator

3. **Self-Assessment Payment Dates**
   - Show payment on account deadlines
   - Calculate two payment amounts
   - Show balancing payment

4. **VAT Calculator**
   - Check if turnover > £90k (VAT registration threshold)
   - Flat Rate Scheme calculator
   - Standard VAT calculation

5. **Sole Trader vs Limited Company Comparison**
   - Show tax difference between structures
   - Corporation tax + dividend tax vs self-employed
   - Help users decide on business structure

---

## ❓ Questions to Resolve

1. **Expense Input:**
   - Should we provide expense categories or just total? (Start with total - simpler)
   - Should we show examples of allowable expenses? (Yes - tooltip)

2. **Tax Code:**
   - Self-employed don't use tax codes. How do we handle age allowance? (Add age input like employed tab)
   - Should we hide tax code field? (Yes - not relevant)

3. **Period Selector:**
   - Should profit auto-calculate from different periods? (Yes - like salary)
   - Example: Monthly income £5k, monthly expenses £1k = £48k profit

4. **Student Loans:**
   - Do self-employed repay differently? (No - same thresholds, through self-assessment)
   - Keep same student loan logic? (Yes)

5. **Results Display:**
   - Should we show monthly/weekly breakdown? (Yes - for consistency)
   - Should we show tax owed vs tax already paid? (No - calculator not payment tracker)

---

## 📚 HMRC References

**Official Sources:**
- [Self-employed National Insurance rates 2025-26](https://www.gov.uk/self-employed-national-insurance-rates)
- [Class 2 National Insurance](https://www.gov.uk/national-insurance/class-2)
- [Class 4 National Insurance](https://www.gov.uk/national-insurance/class-4)
- [Work out your taxable profits](https://www.gov.uk/self-employed-records/work-out-your-taxable-profit)
- [Simplified expenses](https://www.gov.uk/simpler-income-tax-simplified-expenses)

---

## 🎯 Success Criteria

**MVP is successful if:**
- ✅ User can enter business income and expenses
- ✅ Profit calculates automatically
- ✅ Class 2 NI calculates correctly (£179.40 if profit > £12,570)
- ✅ Class 4 NI calculates correctly (9% and 2% bands)
- ✅ Income tax calculates on profit (reusing existing logic)
- ✅ Results show total tax + NI + net profit
- ✅ Can switch between Employed and Self-Employed tabs
- ✅ All calculations match HMRC examples
- ✅ Mobile responsive
- ✅ Accessible (WCAG 2.2 AA)

**Bonus achievements:**
- Blog post explaining self-employed taxes drives traffic
- SEO ranking for "self employed tax calculator UK"
- Positive user feedback on ease of use

---

**Ready to implement?** Start with Phase 1 (calculation logic + tests) to validate approach before building UI.

---

*Last updated: November 2025*  
*Document owner: PayeTax Development Team*  
*Review cycle: Before implementation*
