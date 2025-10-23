# PAYTAX-56: Multiple Income Sources - Implementation Guide

**Status:** 🟡 Ready to implement  
**Time:** 8-12 hours (spread over 2-3 days)  
**URL:** https://linear.app/payetax/issue/PAYTAX-56  
**Depends on:** PAYTAX-55 (completed ✅)

---

## 🎯 What We're Building

**Feature:** Dynamic list of additional income sources with shadcn Collapsible

**User Feedback:** "it would help if there was a way to have more than one source of income eg earnings, pension, state pension, rental income etc"

**HMRC Income Types (from SA100 form):**
1. **Employment Income** - Subject to NI if under SPA (66+)
2. **Private Pension** - Taxable, no NI
3. **State Pension** - Taxable, no NI
4. **Rental Income** - Taxable, no NI
5. **Investment Income** - Taxable, no NI
6. **Other Income** - Taxable, no NI

**UI Design:**
```
Primary Income: £45,000 (existing salary input)

▶ Additional Income Sources (collapsed by default)
  [+ Add Income Source]
  
When expanded:
▼ Additional Income Sources (3)
  1. [Private Pension ▼] £12,000 [Annually ▼] [🗑️]
  2. [State Pension ▼] £11,500 [Annually ▼] [🗑️]
  3. [Rental Income ▼] £650 [Monthly ▼] [🗑️]
  [+ Add Income Source]
```

---

## 📋 Phase 1: Data Structures & Store (30 mins)

### Step 1.1: Define IncomeSource Interface

**File:** `src/store/calculatorStore.ts`  
**Location:** After line 80 (after CalculatorInput interface)

**Add:**
```typescript
/**
 * Represents an additional income source beyond primary employment
 * Used for pensioners and those with multiple income streams
 */
interface IncomeSource {
  /** Unique identifier for React keys and list management */
  id: string;
  /** Type of income (determines NI treatment) */
  type: 'employment' | 'pension' | 'statePension' | 'rental' | 'investment' | 'other';
  /** Optional user-friendly label (e.g., "Pension from Previous Job") */
  label?: string;
  /** Amount of income */
  amount: number;
  /** How often this income is received */
  period: PayPeriod;
}

/**
 * Human-readable labels for income types
 */
const INCOME_TYPE_LABELS: Record<IncomeSource['type'], string> = {
  employment: 'Employment Income',
  pension: 'Private Pension',
  statePension: 'State Pension',
  rental: 'Rental Income',
  investment: 'Investment Income',
  other: 'Other Income',
};
```

### Step 1.2: Add to CalculatorInput Interface

**File:** `src/store/calculatorStore.ts`  
**Location:** Inside CalculatorInput interface (around line 79)

**Add after `allowancesDeductions` field:**
```typescript
  /** Additional income sources (pensions, rental, etc.) */
  incomeSources: IncomeSource[];
```

### Step 1.3: Add to Default State

**File:** `src/store/calculatorStore.ts`  
**Location:** In the create() function default state (around line 150)

**Add after `allowancesDeductions: 0,`:**
```typescript
    incomeSources: [],
```

### Step 1.4: Add Store Actions

**File:** `src/store/calculatorStore.ts`  
**Location:** In the store actions section (around line 400)

**Add these actions:**
```typescript
    // Income Sources Management
    addIncomeSource: () => {
      set((state) => ({
        input: {
          ...state.input,
          incomeSources: [
            ...state.input.incomeSources,
            {
              id: crypto.randomUUID(),
              type: 'pension',
              amount: 0,
              period: PERIODS.ANNUALLY,
            },
          ],
        },
      }));
    },

    updateIncomeSource: (id: string, updates: Partial<IncomeSource>) => {
      set((state) => ({
        input: {
          ...state.input,
          incomeSources: state.input.incomeSources.map((source) =>
            source.id === id ? { ...source, ...updates } : source
          ),
        },
      }));
    },

    removeIncomeSource: (id: string) => {
      set((state) => ({
        input: {
          ...state.input,
          incomeSources: state.input.incomeSources.filter((source) => source.id !== id),
        },
      }));
    },
```

### Step 1.5: Export IncomeSource Type

**File:** `src/store/calculatorStore.ts`  
**Location:** At the top with other exports

**Add:**
```typescript
export type { IncomeSource };
export { INCOME_TYPE_LABELS };
```

**✅ Phase 1 Complete!** Test by running: `npm run typecheck`

---

## 📋 Phase 2: UI Component (2-3 hours)

### Step 2.1: Create IncomeSourceList Component

**File:** `src/components/organisms/IncomeSourceList.tsx` (NEW FILE)

```typescript
'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NumberInput from '@/components/atoms/NumberInput';
import { PERIODS } from '@/constants/taxRates';
import { useCalculatorActions, useCalculatorStore } from '@/store/calculatorStore';
import { INCOME_TYPE_LABELS } from '@/store/calculatorStore';
import type { IncomeSource } from '@/store/calculatorStore';

export function IncomeSourceList() {
  const incomeSources = useCalculatorStore((state) => state.input.incomeSources);
  const { addIncomeSource, updateIncomeSource, removeIncomeSource } = useCalculatorActions();

  const payPeriodOptions = [
    { value: PERIODS.ANNUALLY, label: 'Annually' },
    { value: PERIODS.MONTHLY, label: 'Monthly' },
    { value: PERIODS.FOUR_WEEKLY, label: '4-Weekly' },
    { value: PERIODS.FORTNIGHTLY, label: 'Fortnightly' },
    { value: PERIODS.WEEKLY, label: 'Weekly' },
  ];

  return (
    <Collapsible defaultOpen={false}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary">
          <span>▶</span>
          Additional Income Sources
          {incomeSources.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {incomeSources.length}
            </Badge>
          )}
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="space-y-3 pt-3">
        {incomeSources.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Add pension income, rental income, or other sources
          </p>
        )}

        {incomeSources.map((source, index) => (
          <div key={source.id} className="flex items-center gap-2 rounded-lg border p-3">
            <Badge variant="outline" className="shrink-0">
              {index + 1}
            </Badge>

            {/* Income Type */}
            <div className="flex-1">
              <Select
                value={source.type}
                onValueChange={(type: IncomeSource['type']) =>
                  updateIncomeSource(source.id, { type })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INCOME_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="w-32">
              <NumberInput
                value={source.amount}
                onChange={(amount) => updateIncomeSource(source.id, { amount })}
                prefix="£"
                decimals={2}
                placeholder="0.00"
                min={0}
              />
            </div>

            {/* Period */}
            <div className="w-32">
              <Select
                value={source.period}
                onValueChange={(period) => updateIncomeSource(source.id, { period })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {payPeriodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeIncomeSource(source.id)}
              aria-label="Remove income source"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Add Button */}
        <Button
          variant="outline"
          onClick={addIncomeSource}
          className="w-full"
          disabled={incomeSources.length >= 10} // Reasonable limit
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Income Source
        </Button>

        {incomeSources.length >= 10 && (
          <p className="text-muted-foreground text-xs">
            Maximum 10 income sources reached
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
```

### Step 2.2: Add to BasicInputs Component

**File:** `src/components/organisms/CalculatorInputs/BasicInputs.tsx`  
**Location:** After the "Allowances & Deductions" section (around line 350)

**Import:**
```typescript
import { IncomeSourceList } from '@/components/organisms/IncomeSourceList';
```

**Add before the closing `</motion.div>`:**
```typescript
        {/* Additional Income Sources */}
        <IncomeSourceList />
```

**✅ Phase 2 Complete!** Test by running: `npm run dev` and check UI

---

## 📋 Phase 3: Calculation Logic (2-3 hours)

### Step 3.1: Update TaxCalculationInput Interface

**File:** `src/lib/taxCalculator.ts`  
**Location:** In TaxCalculationInput interface (around line 90)

**Import at top:**
```typescript
import type { IncomeSource } from '@/store/calculatorStore';
```

**Add to interface:**
```typescript
  /** Additional income sources beyond primary employment */
  incomeSources?: IncomeSource[];
```

### Step 3.2: Update Calculation Logic

**File:** `src/lib/taxCalculator.ts`  
**Location:** In calculateTax function, after gross salary calculation (around line 350)

**Add after `const annualGrossSalary = ...` section:**
```typescript
  // ---------------
  // Calculate additional income from other sources
  // ---------------
  
  let additionalIncome = 0;
  let employmentIncome = annualGrossSalary; // Primary salary
  
  if (input.incomeSources && input.incomeSources.length > 0) {
    for (const source of input.incomeSources) {
      const sourceAnnual = convertPeriodToAnnual(
        source.amount,
        source.period,
        input.hoursPerWeek
      );
      
      if (source.type === 'employment') {
        // Additional employment income - subject to NI if under SPA
        employmentIncome += sourceAnnual;
      } else {
        // Other income (pensions, rental, etc.) - taxable but no NI
        additionalIncome += sourceAnnual;
      }
    }
  }
  
  // Total gross income for tax purposes
  const totalGrossIncome = employmentIncome + additionalIncome;
  
  // Update monthly calculations to use total income for tax
  // But keep employment income separate for NI calculations
  const monthlyGrossSalary = totalGrossIncome / 12;
  const monthlyEmploymentIncome = employmentIncome / 12;
```

### Step 3.3: Update NI Calculation

**File:** `src/lib/taxCalculator.ts`  
**Location:** In NI calculation section (around line 600)

**Change from:**
```typescript
  // NI is based on the same taxable adjusted salary as income tax
```

**To:**
```typescript
  // NI is ONLY calculated on employment income (not pensions, rental, etc.)
  // Use employment income for NI, but total income for tax
  const monthlyTaxableAdjustedSalaryForNI = monthlyEmploymentIncome - monthlyPensionContribution;
```

**Update the NI calculations to use `monthlyTaxableAdjustedSalaryForNI` instead of `monthlyTaxableAdjustedSalary`**

### Step 3.4: Update Results Interface

**File:** `src/lib/taxCalculator.ts`  
**Location:** In TaxCalculationResults interface

**Add:**
```typescript
  /** Breakdown of income by source */
  incomeBreakdown?: {
    employment: number;
    nonEmployment: number;
    total: number;
  };
```

**In the return statement, add:**
```typescript
    incomeBreakdown: input.incomeSources && input.incomeSources.length > 0 ? {
      employment: employmentIncome,
      nonEmployment: additionalIncome,
      total: totalGrossIncome,
    } : undefined,
```

**✅ Phase 3 Complete!** Test calculations with: `npm run test -- taxCalculator`

---

## 📋 Phase 4: Results Display (1 hour)

### Step 4.1: Update Results Table

**File:** `src/components/organisms/CalculatorResults/ResultsTable.tsx`  
**Location:** After gross pay row (around line 100)

**Add if income sources exist:**
```typescript
        {results.incomeBreakdown && (
          <>
            <TableRow className="border-t-2 border-border">
              <TableCell colSpan={selectedPeriods.length + 2} className="font-semibold">
                Income Breakdown
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6">Employment Income</TableCell>
              <TableCell className="text-right">
                {formatCurrency(results.incomeBreakdown.employment)}
              </TableCell>
              {selectedPeriods.map((period) => (
                <TableCell key={period} className="text-right">
                  {formatCurrency(convertAnnualToPeriod(results.incomeBreakdown.employment, period))}
                </TableCell>
              ))}
              <TableCell className="text-right">100%</TableCell>
            </TableRow>
            {results.incomeBreakdown.nonEmployment > 0 && (
              <TableRow>
                <TableCell className="pl-6">Other Income (No NI)</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(results.incomeBreakdown.nonEmployment)}
                </TableCell>
                {selectedPeriods.map((period) => (
                  <TableCell key={period} className="text-right">
                    {formatCurrency(convertAnnualToPeriod(results.incomeBreakdown.nonEmployment, period))}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  {((results.incomeBreakdown.nonEmployment / results.incomeBreakdown.total) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
            )}
          </>
        )}
```

**✅ Phase 4 Complete!** Test in browser with dev server

---

## 📋 Phase 5: Testing & Documentation (2-3 hours)

### Step 5.1: Create Test File

**File:** `src/lib/__tests__/taxCalculator.multipleIncomes.test.ts` (NEW FILE)

```typescript
import { calculateTax } from '../taxCalculator';
import type { TaxCalculationInput } from '../taxCalculator';
import { PERIODS } from '@/constants/taxRates';

describe('Multiple Income Sources (PAYTAX-56)', () => {
  const createInput = (overrides?: Partial<TaxCalculationInput>): TaxCalculationInput => ({
    salary: 30000,
    payPeriod: PERIODS.ANNUALLY,
    taxYear: '2025-2026',
    taxCode: '1257L',
    isScottish: false,
    isMarried: false,
    partnerGrossWage: 0,
    isBlind: false,
    payNoNI: false,
    pensionContribution: 0,
    pensionContributionType: 'percentage',
    studentLoanPlan: 'none',
    niCategory: 'A',
    hoursPerWeek: 40,
    incomeSources: [],
    ...overrides,
  });

  it('Single employment income (baseline - no additional sources)', () => {
    const result = calculateTax(createInput({ salary: 30000 }));
    
    expect(result.grossSalary.annually).toBe(30000);
    expect(result.nationalInsurance.annually).toBeGreaterThan(0);
    expect(result.incomeBreakdown).toBeUndefined();
  });

  it('Employment + Private Pension (age 67, no NI)', () => {
    const result = calculateTax(createInput({
      salary: 30000,
      age: 67,
      payNoNI: true,
      incomeSources: [
        { id: '1', type: 'pension', amount: 12000, period: PERIODS.ANNUALLY },
      ],
    }));
    
    expect(result.grossSalary.annually).toBe(42000); // Combined
    expect(result.nationalInsurance.annually).toBe(0); // Age 67
    expect(result.incomeBreakdown?.employment).toBe(30000);
    expect(result.incomeBreakdown?.nonEmployment).toBe(12000);
    expect(result.incomeBreakdown?.total).toBe(42000);
  });

  it('State Pension + Rental Income (monthly)', () => {
    const result = calculateTax(createInput({
      salary: 0,
      age: 68,
      payNoNI: true,
      incomeSources: [
        { id: '1', type: 'statePension', amount: 11500, period: PERIODS.ANNUALLY },
        { id: '2', type: 'rental', amount: 650, period: PERIODS.MONTHLY },
      ],
    }));
    
    const totalIncome = 11500 + (650 * 12); // £19,300
    expect(result.grossSalary.annually).toBe(19300);
    expect(result.nationalInsurance.annually).toBe(0);
    expect(result.incomeBreakdown?.nonEmployment).toBe(19300);
  });

  it('Multiple employment sources - both subject to NI', () => {
    const result = calculateTax(createInput({
      salary: 25000,
      age: 50,
      incomeSources: [
        { id: '1', type: 'employment', amount: 10000, period: PERIODS.ANNUALLY },
      ],
    }));
    
    const totalEmployment = 35000;
    expect(result.grossSalary.annually).toBe(35000);
    expect(result.nationalInsurance.annually).toBeGreaterThan(0);
    expect(result.incomeBreakdown?.employment).toBe(35000);
  });

  it('Employment + Pension + Rental (age 50, pays NI)', () => {
    const result = calculateTax(createInput({
      salary: 30000,
      age: 50,
      incomeSources: [
        { id: '1', type: 'pension', amount: 8000, period: PERIODS.ANNUALLY },
        { id: '2', type: 'rental', amount: 500, period: PERIODS.MONTHLY },
      ],
    }));
    
    const totalIncome = 30000 + 8000 + (500 * 12); // £44,000
    expect(result.grossSalary.annually).toBe(44000);
    // NI only on £30k employment income
    expect(result.nationalInsurance.annually).toBeCloseTo(1394.4, 1);
  });

  it('All 6 income types combined', () => {
    const result = calculateTax(createInput({
      salary: 20000,
      age: 50,
      incomeSources: [
        { id: '1', type: 'employment', amount: 5000, period: PERIODS.ANNUALLY },
        { id: '2', type: 'pension', amount: 8000, period: PERIODS.ANNUALLY },
        { id: '3', type: 'statePension', amount: 11500, period: PERIODS.ANNUALLY },
        { id: '4', type: 'rental', amount: 400, period: PERIODS.MONTHLY },
        { id: '5', type: 'investment', amount: 2000, period: PERIODS.ANNUALLY },
        { id: '6', type: 'other', amount: 1000, period: PERIODS.ANNUALLY },
      ],
    }));
    
    const totalEmployment = 25000; // £20k + £5k
    const totalOther = 8000 + 11500 + (400 * 12) + 2000 + 1000; // £27,300
    const totalIncome = totalEmployment + totalOther; // £52,300
    
    expect(result.grossSalary.annually).toBe(52300);
    expect(result.incomeBreakdown?.employment).toBe(25000);
    expect(result.incomeBreakdown?.nonEmployment).toBe(27300);
  });

  it('Zero primary salary, only pension income', () => {
    const result = calculateTax(createInput({
      salary: 0,
      age: 70,
      payNoNI: true,
      incomeSources: [
        { id: '1', type: 'pension', amount: 15000, period: PERIODS.ANNUALLY },
      ],
    }));
    
    expect(result.grossSalary.annually).toBe(15000);
    expect(result.nationalInsurance.annually).toBe(0);
    expect(result.incomeBreakdown?.employment).toBe(0);
    expect(result.incomeBreakdown?.nonEmployment).toBe(15000);
  });

  it('Period conversion works correctly (weekly to annual)', () => {
    const result = calculateTax(createInput({
      salary: 30000,
      incomeSources: [
        { id: '1', type: 'rental', amount: 150, period: PERIODS.WEEKLY },
      ],
    }));
    
    const weeklyToAnnual = 150 * 52; // £7,800
    expect(result.grossSalary.annually).toBe(30000 + 7800);
  });
});
```

### Step 5.2: Run Tests

```bash
npm run test -- taxCalculator.multipleIncomes
npm run test -- taxCalculator  # All calculator tests
```

### Step 5.3: Update Tooltips

**File:** `src/config/inputTooltips.ts`

**Add:**
```typescript
  additionalIncome: {
    label: 'Additional Income Sources',
    content: (
      <>
        <p>Add income from sources other than your main employment:</p>
        <ul className="mt-2 space-y-1">
          <li>• <strong>Private Pension:</strong> Company or personal pensions (no NI)</li>
          <li>• <strong>State Pension:</strong> UK state pension (no NI)</li>
          <li>• <strong>Rental Income:</strong> Property rental (no NI)</li>
          <li>• <strong>Investment:</strong> Dividends, interest (no NI)</li>
          <li>• <strong>Other:</strong> Any other taxable income (no NI)</li>
        </ul>
        <p className="mt-2 text-xs">
          National Insurance is only charged on employment income (if under age 66).
        </p>
      </>
    ),
  },
```

### Step 5.4: Update Documentation

**File:** `CONTRIBUTING.md`

**Add section:**
```markdown
### Multiple Income Sources

**Feature:** Users can add multiple income sources beyond primary employment

**Income Types:**
- Employment: Subject to NI if under state pension age
- Private Pension: Taxable, no NI
- State Pension: Taxable, no NI  
- Rental Income: Taxable, no NI
- Investment: Taxable, no NI
- Other: Taxable, no NI

**Calculation:**
- NI calculated only on employment income
- Income tax calculated on total income
- Age-based NI exemption still applies (66+)
```

**✅ Phase 5 Complete!** All done!

---

## ✅ Definition of Done

- [ ] IncomeSource interface defined
- [ ] Store updated with actions
- [ ] IncomeSourceList component created
- [ ] Integrated into BasicInputs
- [ ] Calculation logic updated
- [ ] Results display shows breakdown
- [ ] 8 test cases written and passing
- [ ] All existing tests still pass
- [ ] Tooltips added
- [ ] Documentation updated
- [ ] Manual browser testing complete
- [ ] Committed and pushed

---

## 🎯 Key Implementation Notes

**NI Calculation:**
- Only employment income subject to NI
- Age 66+ exemption still applies (from PAYTAX-55)
- Multiple employment sources combine for NI

**Tax Calculation:**
- All income types are taxable
- Personal allowance applies to total income
- Tax bands calculated on total income

**Period Conversion:**
- Each income source has its own period
- Convert all to annual for calculations
- Use `convertPeriodToAnnual()` helper

**UI/UX:**
- Collapsible collapsed by default
- Max 10 income sources (reasonable limit)
- Clear labeling of income types
- Badge shows count

---

## 🚀 Getting Started

1. Open this guide
2. Start with Phase 1 (30 mins)
3. Test after each phase
4. Take breaks between phases
5. Total time: 8-12 hours over 2-3 days

**Good luck!** 💪

This is the biggest feature of the three. Take your time and test thoroughly!
