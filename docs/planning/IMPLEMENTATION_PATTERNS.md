# Implementation Patterns Analysis

**Purpose**: Ensure we follow existing patterns and avoid duplication  
**Status**: Pre-implementation audit complete

---

## 🎯 Existing Patterns to Follow

### 1. UI Components (shadcn/ui)

**Available Components**:
- ✅ Button (`src/components/ui/button.tsx`)
- ✅ Card (`src/components/ui/card.tsx`)
- ✅ Dialog (`src/components/ui/dialog.tsx`)
- ❌ Alert - **NOT INSTALLED** (need to add)
- ❌ Collapsible - **NOT INSTALLED** (need to add)

**Action**: Install Alert & Collapsible from shadcn/ui

---

### 2. Banner/Warning Pattern

**Existing**: CookieBanner (`src/components/ui/CookieBanner.tsx`)

**Pattern Used**:
```tsx
// Uses Card + motion + localStorage for dismissal
- Card for container
- useState for show/hide
- localStorage for persistence
- useCallback for actions
- Framer Motion for animations (optional)
```

**We should follow same pattern** for Tax Trap Warning!

---

### 3. State Management Pattern

**Store**: `src/store/calculatorStore.ts` (Zustand)

**Existing Actions**:
```typescript
// All input setters available
setPensionContribution(amount: number)
setPensionContributionType(type: 'percentage' | 'amount')
setSalary(salary: number)
calculate() // Triggers recalculation
```

**Pattern**: Use store actions directly, NO new state needed!

---

### 4. Calculator Integration Pattern

**Container**: `src/components/organisms/CalculatorContainer.tsx`

**Pattern**:
```tsx
// Uses hooks from store
const results = useCalculatorResults();
const { calculate } = useCalculatorActions();
const { setPensionContribution } = useCalculatorActions();

// React.useState for local UI state only
// Call calculate() to trigger recalc
```

---

### 5. Component Organization

**Existing Structure**:
```
src/components/
├── atoms/         (small, reusable)
├── molecules/     (compound components)
├── organisms/     (complex features)
│   ├── CalculatorResults/
│   │   ├── ResultsSummaryCards.tsx  ← WHERE TAX TRAP WARNING GOES
│   │   └── ResultsTable.tsx
│   └── CalculatorContainer.tsx
└── ui/            (shadcn components)
```

**Pattern**: Tax Trap Warning = molecule component used in ResultsSummaryCards

---

## ✅ Corrected Implementation Plan

### Feature 1: £100k Tax Trap Warning

**DO**:
- ✅ Create as molecule: `src/components/molecules/TaxTrapWarning.tsx`
- ✅ Use Card + motion (like CookieBanner pattern)
- ✅ Add to ResultsSummaryCards.tsx
- ✅ Use existing `setPensionContribution()` from store
- ✅ Use localStorage for dismissal (same pattern as CookieBanner)
- ✅ Use existing Button, Card components

**DON'T**:
- ❌ Create new store state
- ❌ Install Alert component (use Card instead)
- ❌ Duplicate dismissal logic
- ❌ Create new organisms folder

**Files to Create**:
```
src/components/molecules/
└── TaxTrapWarning.tsx                    (NEW)

src/lib/
└── pensionOptimizer.ts                   (NEW - utility only)

__tests__/
├── TaxTrapWarning.test.tsx              (NEW)
└── pensionOptimizer.test.ts             (NEW)
```

**Files to Modify**:
```
src/components/organisms/CalculatorResults/
└── ResultsSummaryCards.tsx               (add <TaxTrapWarning />)
```

---

### Feature 2: Salary Comparison Toggle

**DO**:
- ✅ Create as organism: `src/components/organisms/SalaryComparison.tsx`
- ✅ Use existing Dialog component if modal, or inline Card
- ✅ Use existing `calculateTax()` function directly
- ✅ Use React.useState for local comparison state
- ✅ Add to CalculatorContainer.tsx

**DON'T**:
- ❌ Add comparison to store (local state is fine!)
- ❌ Install Collapsible (use details element or just expand/collapse with useState)
- ❌ Duplicate calculation logic
- ❌ Create separate organisms/SalaryComparison/ folder

**Files to Create**:
```
src/components/organisms/
└── SalaryComparison.tsx                  (NEW - single file!)

__tests__/
└── SalaryComparison.test.tsx            (NEW)
```

**Files to Modify**:
```
src/components/organisms/
└── CalculatorContainer.tsx               (add <SalaryComparison />)
```

---

## 🚀 Implementation Order (NO DUPLICATION)

### Step 1: Install shadcn Components (SKIP ALERT)
```bash
# Don't install Alert - use Card pattern instead
# Don't install Collapsible - use React.useState instead
```

### Step 2: Create TaxTrapWarning (2 hours)
```tsx
// src/components/molecules/TaxTrapWarning.tsx
// Follow CookieBanner pattern exactly!

import { useState, useCallback, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCalculatorActions } from '@/store/calculatorStore';
import { calculateOptimalPension } from '@/lib/pensionOptimizer';

export function TaxTrapWarning({ results }) {
  const [dismissed, setDismissed] = useState(() => 
    localStorage.getItem('tax-trap-dismissed') === 'true'
  );
  
  const { setPensionContribution, setPensionContributionType, calculate } = useCalculatorActions();
  
  const optimization = calculateOptimalPension(results.grossSalary.annually);
  
  if (!optimization || dismissed) return null;
  
  const handleOptimize = useCallback(() => {
    setPensionContribution(optimization.suggested);
    setPensionContributionType('amount');
    calculate();
  }, [optimization, setPensionContribution, setPensionContributionType, calculate]);
  
  const handleDismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem('tax-trap-dismissed', 'true');
  }, []);
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="relative border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              ⚠️ You're in the 60% Tax Trap Zone
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-sm">
              Your salary is between £100k-£125k, where you lose £1 of personal 
              allowance for every £2 earned.
            </p>
            
            {/* Rest of content... */}
            
            <Button onClick={handleOptimize} variant="default">
              Optimize My Tax (Pre-fill Pension)
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
```

### Step 3: Add to ResultsSummaryCards (15 min)
```tsx
// src/components/organisms/CalculatorResults/ResultsSummaryCards.tsx

import { TaxTrapWarning } from '@/components/molecules/TaxTrapWarning';

export function ResultsSummaryCards({ results }) {
  return (
    <div className="space-y-6">
      {/* Add warning before summary cards */}
      <TaxTrapWarning results={results} />
      
      {/* Existing summary cards... */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* ... */}
      </div>
    </div>
  );
}
```

### Step 4: Create pensionOptimizer utility (30 min)
```typescript
// src/lib/pensionOptimizer.ts

export interface PensionOptimization {
  suggested: number;
  allowanceLost: number;
  effectiveRate: number;
  savingsFromOptimizing: number;
}

export function calculateOptimalPension(
  salary: number
): PensionOptimization | null {
  // Only for £100k-£125k range
  if (salary < 100000 || salary > 125140) return null;
  
  const excessOver100k = salary - 100000;
  const allowanceLost = Math.min(excessOver100k / 2, 12570);
  const effectiveRate = 60; // Always 60% in this zone
  const suggested = Math.ceil(excessOver100k / 1000) * 1000; // Round up to nearest 1k
  const savingsFromOptimizing = suggested * 0.6;
  
  return { suggested, allowanceLost, effectiveRate, savingsFromOptimizing };
}
```

### Step 5: Create SalaryComparison (3-4 hours)
```tsx
// src/components/organisms/SalaryComparison.tsx
// Single file component - no subfolder needed!

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCalculatorStore } from '@/store/calculatorStore';
import { calculateTax } from '@/lib/taxCalculator';

export function SalaryComparison() {
  const [isOpen, setIsOpen] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<'percentage' | 'amount' | 'total'>('amount');
  const [comparisonValue, setComparisonValue] = useState<number>(5000);
  
  const input = useCalculatorStore(state => state.input);
  const currentResults = useCalculatorStore(state => state.results);
  
  if (!currentResults) return null;
  
  // Calculate new salary based on mode
  const newSalary = comparisonMode === 'percentage' 
    ? input.salary * (1 + comparisonValue / 100)
    : comparisonMode === 'amount'
    ? input.salary + comparisonValue
    : comparisonValue;
  
  // Reuse calculateTax with new salary
  const comparisonResults = calculateTax({
    ...input,
    salary: newSalary
  });
  
  return (
    <Card>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        Compare Salaries
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </Button>
      
      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Input controls */}
          {/* Comparison table */}
        </div>
      )}
    </Card>
  );
}
```

### Step 6: Add to CalculatorContainer (15 min)
```tsx
// src/components/organisms/CalculatorContainer.tsx

import { SalaryComparison } from './SalaryComparison';

export function CalculatorContainer() {
  // ... existing code ...
  
  return (
    <div className="container mx-auto max-w-[1600px] px-4">
      <Card>
        {/* Existing inputs */}
        <CalculatorInputsSection />
        
        {/* Calculate button */}
        <Button onClick={handleCalculate}>Calculate</Button>
        
        {/* NEW: Salary Comparison */}
        {results && <SalaryComparison />}
        
        {/* Results */}
        {showResults && results && (
          <>
            <ResultsSummaryCards results={results} />
            <ResultsTable results={results} />
          </>
        )}
      </Card>
    </div>
  );
}
```

---

## ✅ Final Checklist

**Before Starting**:
- [x] Audit existing patterns ✅
- [x] Check installed components ✅
- [x] Identify reusable patterns ✅
- [x] Plan file structure ✅

**During Implementation**:
- [ ] Use existing Button, Card components
- [ ] Follow CookieBanner dismissal pattern
- [ ] Use existing store actions
- [ ] NO new folders unless necessary
- [ ] Single file components where possible
- [ ] Reuse calculateTax() directly

**After Implementation**:
- [ ] Run tests: `npm run test`
- [ ] Run build: `npm run build`
- [ ] Test manually on localhost
- [ ] Check no console errors
- [ ] Verify mobile responsive

---

**Ready to start! Begin with TaxTrapWarning (easiest, 2 hours)** 🚀
