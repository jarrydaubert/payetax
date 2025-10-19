# Feature Implementation Plan - Salary Comparison & £100k Tax Trap

**Branch**: `feature/salary-comparison-and-tax-trap-warnings`  
**Created**: January 17, 2026  
**Status**: In Progress  
**Estimated Time**: 6-8 hours total

---

## 🎯 Feature 1: Salary Comparison Toggle

### User Story
**As a** user considering a salary increase  
**I want to** see a side-by-side comparison of current vs new salary  
**So that** I can understand the real take-home difference after tax

### Requirements (from Steven/Demo)
- ✅ Expandable section below calculator inputs
- ✅ Compare: Current salary vs New salary
- ✅ Input options: Percentage increase, £ amount, or total new salary
- ✅ Auto-applies all existing deductions (pension, student loans, etc.)
- ✅ Diff-highlighted table (green for increases, red if applicable)
- ✅ Marginal rate insight: "You keep 65% of the £10k bump"
- ✅ Dismissible but sticky (user preference)

### Acceptance Criteria
- [ ] Expandable "Compare Salaries" section renders below inputs
- [ ] Three input modes work: %, £ increase, total salary
- [ ] All deductions from main calculator auto-apply to comparison
- [ ] Results table highlights differences (green text for gains)
- [ ] Shows "You keep X% of the increase" insight
- [ ] State persists when toggling (doesn't reset)
- [ ] E2E test: £40k → £50k scenario passes
- [ ] Mobile responsive

### Technical Implementation

#### New Components
1. **SalaryComparisonToggle.tsx**
   - Location: `src/components/organisms/SalaryComparison/`
   - Expandable section with toggle button
   - Three input modes: percentage, amount, total
   - Uses existing calculateTax function

2. **ComparisonResultsTable.tsx**
   - Location: `src/components/organisms/SalaryComparison/`
   - Side-by-side comparison table
   - Diff highlighting (green for positive changes)
   - Marginal rate insight card

#### Files to Create
```
src/components/organisms/SalaryComparison/
├── SalaryComparisonToggle.tsx (main component)
├── ComparisonResultsTable.tsx (results display)
├── ComparisonInputs.tsx (input controls)
├── MarginalRateInsight.tsx (insight card)
└── __tests__/
    ├── SalaryComparisonToggle.test.tsx
    └── ComparisonResultsTable.test.tsx
```

#### Files to Modify
- `src/components/organisms/CalculatorContainer.tsx` - Add comparison section
- `src/store/calculatorStore.ts` - Add comparison state (optional)

#### Implementation Steps

**Step 1**: Create ComparisonInputs component (30 min)
```tsx
// Three input modes
- Radio buttons: "Percentage" | "Amount" | "New Total"
- Input field changes based on mode
- Calculate new salary based on mode
```

**Step 2**: Create ComparisonResultsTable component (1 hour)
```tsx
// Side-by-side table
| Metric | Current | New | Difference |
|--------|---------|-----|------------|
| Gross  | £40,000 | £50,000 | +£10,000 ✅ |
| Tax    | £5,486  | £7,486  | +£2,000 |
| NI     | £3,320  | £4,720  | +£1,400 |
| Net    | £31,194 | £37,794 | +£6,600 ✅ |

// Green text for Net increase
```

**Step 3**: Create MarginalRateInsight component (30 min)
```tsx
// Calculate effective rate on increase
const increaseAmount = newSalary - currentSalary;
const netIncrease = newNet - currentNet;
const keepPercentage = (netIncrease / increaseAmount) * 100;

// Display: "You keep 65% of the £10k increase"
```

**Step 4**: Integrate into CalculatorContainer (30 min)
```tsx
// Add after results section
<Collapsible open={comparisonOpen} onOpenChange={setComparisonOpen}>
  <CollapsibleTrigger asChild>
    <Button variant="outline">
      Compare Salaries <ChevronDown />
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <SalaryComparisonToggle />
  </CollapsibleContent>
</Collapsible>
```

**Step 5**: Add E2E test (30 min)
```typescript
// e2e/salary-comparison.spec.ts
test('Compare £40k to £50k salary', async ({ page }) => {
  // Enter £40k
  await page.fill('[data-testid="salary-input"]', '40000');
  await page.click('[data-testid="calculate-button"]');
  
  // Open comparison
  await page.click('text=Compare Salaries');
  
  // Select "Amount" mode
  await page.click('[value="amount"]');
  await page.fill('[data-testid="comparison-amount"]', '10000');
  
  // Verify results
  await expect(page.locator('text=+£10,000')).toBeVisible();
  await expect(page.locator('text=You keep 66%')).toBeVisible();
});
```

---

## 🎯 Feature 2: £100k Tax Trap Banner

### User Story
**As a** high earner (£100k-£125k)  
**I want to** be warned about the 60% effective tax rate  
**So that** I can optimize my tax position with pension contributions

### Requirements (from Steven/Demo)
- ✅ Post-calculation warning banner for £100k-£125k salaries
- ✅ Breakdown of personal allowance taper loss
- ✅ Show effective rate: "£5k allowance gone = 60% effective"
- ✅ One-click pension suggestion (e.g., "£10k contrib to drop below £100k")
- ✅ "Optimize" button pre-fills pension contribution
- ✅ Dismissible but sticky (remembers user dismissed it)
- ✅ Power users see this (higher earners are engaged users)

### Acceptance Criteria
- [ ] Banner shows only when salary £100k-£125,140
- [ ] Explains personal allowance taper clearly
- [ ] Shows exact allowance lost (e.g., "£5,000 lost")
- [ ] Calculates effective rate (always shows 60% in zone)
- [ ] "Optimize" button calculates optimal pension contribution
- [ ] Clicking "Optimize" pre-fills pension field
- [ ] Auto-recalculates with suggested pension
- [ ] Dismissible with X button
- [ ] Dismissal state saved to localStorage
- [ ] Can be re-shown (reset button somewhere)
- [ ] Links to blog post about trap
- [ ] Unit tests for all calculations
- [ ] E2E test for £110k scenario

### Technical Implementation

#### New Components
1. **TaxTrapWarning.tsx**
   - Location: `src/components/organisms/TaxOptimization/`
   - Alert/Banner component
   - Calculates allowance loss
   - Pension optimization suggestion

2. **PensionOptimizer.tsx** (helper)
   - Location: `src/lib/`
   - Calculates optimal pension contribution
   - Returns amount needed to drop below £100k

#### Files to Create
```
src/components/organisms/TaxOptimization/
├── TaxTrapWarning.tsx (main banner)
├── OptimizationCard.tsx (pension suggestion card)
└── __tests__/
    └── TaxTrapWarning.test.tsx

src/lib/
├── pensionOptimizer.ts (calculation logic)
└── __tests__/
    └── pensionOptimizer.test.ts
```

#### Files to Modify
- `src/components/organisms/CalculatorResults/ResultsSummaryCards.tsx` - Add warning banner
- `src/components/organisms/CalculatorInputs/CalculatorInputsSection.tsx` - Accept pre-fill

#### Implementation Steps

**Step 1**: Create pensionOptimizer utility (30 min)
```typescript
// src/lib/pensionOptimizer.ts
export function calculateOptimalPension(salary: number): {
  suggested: number;
  allowanceLost: number;
  effectiveRate: number;
  savingsFromOptimizing: number;
} {
  // For £100k-£125k range
  if (salary < 100000 || salary > 125140) return null;
  
  // Calculate how much allowance is lost
  const excessOver100k = salary - 100000;
  const allowanceLost = Math.min(excessOver100k / 2, 12570);
  
  // Effective rate is 60% in this zone
  const effectiveRate = 60;
  
  // Suggest contributing enough to drop below £100k
  const suggested = excessOver100k;
  
  // Calculate tax savings
  const savingsFromOptimizing = suggested * 0.6; // Save 60% tax
  
  return { suggested, allowanceLost, effectiveRate, savingsFromOptimizing };
}
```

**Step 2**: Create TaxTrapWarning component (1 hour)
```tsx
// src/components/organisms/TaxOptimization/TaxTrapWarning.tsx
export function TaxTrapWarning({ results, onOptimize }) {
  const [dismissed, setDismissed] = useState(() => 
    localStorage.getItem('tax-trap-dismissed') === 'true'
  );
  
  const optimization = calculateOptimalPension(results.grossSalary.annually);
  
  if (!optimization || dismissed) return null;
  
  const handleOptimize = () => {
    onOptimize(optimization.suggested);
  };
  
  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('tax-trap-dismissed', 'true');
  };
  
  return (
    <Alert variant="warning" className="relative">
      <button onClick={handleDismiss} className="absolute top-2 right-2">
        <X className="h-4 w-4" />
      </button>
      
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle>⚠️ You're in the 60% Tax Trap Zone</AlertTitle>
      <AlertDescription>
        <p>
          Your salary is between £100k-£125k, where you lose £1 of 
          personal allowance for every £2 earned.
        </p>
        
        <div className="mt-4 rounded-md bg-muted p-4">
          <h4 className="font-semibold">Your Current Position:</h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Personal allowance lost: £{optimization.allowanceLost.toLocaleString()}</li>
            <li>• Effective tax rate: {optimization.effectiveRate}%</li>
            <li>• You keep only 40p of each £1 earned in this zone</li>
          </ul>
        </div>
        
        <div className="mt-4 rounded-md bg-primary/10 p-4">
          <h4 className="font-semibold text-primary">💡 Optimization Opportunity:</h4>
          <p className="mt-2 text-sm">
            Contribute <strong>£{optimization.suggested.toLocaleString()}</strong> to 
            your pension to drop below £100k and save 
            <strong> £{optimization.savingsFromOptimizing.toLocaleString()}</strong> in tax.
          </p>
          
          <Button 
            onClick={handleOptimize}
            variant="default"
            className="mt-3"
          >
            Optimize My Tax (Pre-fill Pension)
          </Button>
        </div>
        
        <Link 
          href="/blog/higher-rate-taxpayer-guide-uk-2025"
          className="mt-4 text-sm text-primary hover:underline"
        >
          Learn more about the £100k tax trap →
        </Link>
      </AlertDescription>
    </Alert>
  );
}
```

**Step 3**: Integrate into ResultsSummaryCards (15 min)
```tsx
// Add above the summary cards
<TaxTrapWarning 
  results={results}
  onOptimize={(amount) => {
    // Update pension contribution in calculator
    calculatorStore.setState({ 
      pensionContribution: amount,
      pensionContributionType: 'amount'
    });
    // Trigger recalculation
    calculate();
  }}
/>
```

**Step 4**: Add unit tests (30 min)
```typescript
// src/lib/__tests__/pensionOptimizer.test.ts
describe('calculateOptimalPension', () => {
  it('returns null for salary under £100k', () => {
    expect(calculateOptimalPension(90000)).toBeNull();
  });
  
  it('calculates correctly for £110k salary', () => {
    const result = calculateOptimalPension(110000);
    
    expect(result.allowanceLost).toBe(5000); // (110k - 100k) / 2
    expect(result.effectiveRate).toBe(60);
    expect(result.suggested).toBe(10000); // Drop to 100k
    expect(result.savingsFromOptimizing).toBe(6000); // 10k * 60%
  });
  
  it('handles £125k+ where allowance fully lost', () => {
    const result = calculateOptimalPension(130000);
    
    expect(result.allowanceLost).toBe(12570); // Max loss
    expect(result.suggested).toBe(30000); // Drop to 100k
  });
});
```

**Step 5**: Add E2E test (30 min)
```typescript
// e2e/tax-trap-warning.spec.ts
test('Shows tax trap warning for £110k salary', async ({ page }) => {
  await page.goto('/');
  
  // Enter £110k
  await page.fill('[data-testid="salary-input"]', '110000');
  await page.click('[data-testid="calculate-button"]');
  
  // Warning should appear
  await expect(page.locator('text=60% Tax Trap Zone')).toBeVisible();
  await expect(page.locator('text=£5,000')).toBeVisible(); // Allowance lost
  await expect(page.locator('text=£10,000')).toBeVisible(); // Suggested pension
  
  // Click optimize
  await page.click('text=Optimize My Tax');
  
  // Pension field should be pre-filled
  const pensionInput = page.locator('[data-testid="pension-input"]');
  await expect(pensionInput).toHaveValue('10000');
  
  // Results should recalculate automatically
  await expect(page.locator('text=£100,000')).toBeVisible(); // New taxable
});

test('Warning is dismissible and sticky', async ({ page }) => {
  await page.goto('/');
  await page.fill('[data-testid="salary-input"]', '110000');
  await page.click('[data-testid="calculate-button"]');
  
  // Dismiss warning
  await page.click('[aria-label="dismiss"]');
  await expect(page.locator('text=60% Tax Trap Zone')).not.toBeVisible();
  
  // Reload page - should stay dismissed
  await page.reload();
  await page.fill('[data-testid="salary-input"]', '110000');
  await page.click('[data-testid="calculate-button"]');
  await expect(page.locator('text=60% Tax Trap Zone')).not.toBeVisible();
});
```

---

## 📋 Implementation Checklist

### Feature 1: Salary Comparison
- [ ] Create SalaryComparison components folder
- [ ] Build ComparisonInputs (three modes)
- [ ] Build ComparisonResultsTable
- [ ] Build MarginalRateInsight
- [ ] Integrate into CalculatorContainer
- [ ] Add unit tests
- [ ] Add E2E test (£40k → £50k)
- [ ] Test mobile responsive
- [ ] Test with all deduction types

### Feature 2: Tax Trap Warning  
- [ ] Create TaxOptimization components folder
- [ ] Build pensionOptimizer utility + tests
- [ ] Build TaxTrapWarning component
- [ ] Integrate into ResultsSummaryCards
- [ ] Add pension pre-fill functionality
- [ ] Add dismiss/localStorage logic
- [ ] Add unit tests
- [ ] Add E2E test (£110k scenario)
- [ ] Test dismissal persistence

### Polish & Documentation
- [ ] Add loading states where needed
- [ ] Add error handling
- [ ] Test accessibility (keyboard nav, screen readers)
- [ ] Update component documentation
- [ ] Add Storybook stories (optional)
- [ ] Test in all supported browsers
- [ ] Performance check (React DevTools)

---

## ⏱️ Time Estimates

| Task | Estimated Time |
|------|----------------|
| **Feature 1: Salary Comparison** | 3-4 hours |
| - ComparisonInputs | 30 min |
| - ComparisonResultsTable | 1 hour |
| - MarginalRateInsight | 30 min |
| - Integration | 30 min |
| - Testing | 1 hour |
| **Feature 2: Tax Trap Warning** | 3-4 hours |
| - pensionOptimizer | 30 min |
| - TaxTrapWarning component | 1 hour |
| - Integration | 15 min |
| - Pension pre-fill | 30 min |
| - Testing | 1 hour |
| **Polish & Testing** | 1-2 hours |
| **Total** | **7-10 hours** |

---

## 🚀 Getting Started

**Start with Feature 2** (Tax Trap Warning) - it's more impactful and faster!

**Command to run tests**:
```bash
# Unit tests
npm run test -- --watch

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

**Next commit** should be:
```bash
git add .
git commit -m "feat: Add £100k tax trap warning with pension optimization

- Add pensionOptimizer utility to calculate optimal contributions
- Create TaxTrapWarning component with dismissible banner
- Show allowance taper loss and effective 60% rate
- One-click optimize button pre-fills pension field
- Persistent dismissal via localStorage
- Links to blog post for more info
- Unit tests + E2E test for £110k scenario

Closes #4 (from TODO.md)"
```

---

**Let's build! 🚀**
