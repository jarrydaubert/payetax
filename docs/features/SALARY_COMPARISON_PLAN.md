# Salary Comparison Feature - Implementation Plan

## 🎯 Feature Overview

**Goal:** Side-by-side salary comparison with marginal rate insights

**User Story:**  
As a user considering a salary increase, I want to see a side-by-side comparison of current vs new salary, so that I can understand the real take-home difference after tax.

---

## 📋 Requirements (from Demo Feedback)

### Core Features
- ✅ Expandable section below calculator inputs
- ✅ Compare: Current salary vs New salary
- ✅ **3 input modes:**
  1. Percentage increase (e.g., "10% raise")
  2. £ amount increase (e.g., "+£5,000")
  3. New total salary (e.g., "£45,000")
- ✅ Auto-applies all existing deductions (pension, student loans, NI category, etc.)
- ✅ Diff-highlighted table (green for net gains)
- ✅ **Marginal rate insight:** "You keep 65% of the £10k bump"
- ✅ Dismissible but sticky (state persists)

### Acceptance Criteria
- [ ] Expandable "Compare Salaries" toggle below inputs
- [ ] Three input modes work correctly
- [ ] All deductions from main calculator auto-apply
- [ ] Results table highlights differences with color coding
- [ ] Shows effective marginal rate on increase
- [ ] State persists when toggling (doesn't reset)
- [ ] Mobile responsive
- [ ] Comprehensive tests (unit + integration + error handling)

---

## 🏗️ Architecture (Following Tax Trap Pattern)

### Component Structure
```
src/components/organisms/SalaryComparison/
├── SalaryComparisonSection.tsx          [Main container]
├── ComparisonInputs.tsx                 [Input controls]
├── ComparisonResultsTable.tsx           [Results display]
├── MarginalRateInsight.tsx              [Insight card]
├── __tests__/
│   ├── SalaryComparisonSection.test.tsx
│   ├── ComparisonInputs.test.tsx
│   ├── ComparisonResultsTable.test.tsx
│   ├── MarginalRateInsight.test.tsx
│   └── SalaryComparison.integration.test.tsx

src/lib/
├── salaryComparison.ts                  [Core logic]
└── __tests__/
    ├── salaryComparison.test.ts
    └── salaryComparison.error.test.ts
```

### Reusable Components (from existing)
- ✅ `Card, CardHeader, CardContent` - Layout
- ✅ `Button` - Actions
- ✅ `Input` - Number inputs
- ✅ `Select` - Dropdowns
- ✅ `Badge` - Status indicators
- ✅ `ResultCard` - Display cards (reuse from tax trap)
- ✅ `toast` (sonner) - Notifications

---

## 💻 Implementation Plan

### Phase 1: Core Logic (30 mins)

#### File: `src/lib/salaryComparison.ts`

**Types:**
```typescript
export type ComparisonMode = 'percentage' | 'amount' | 'total';

export interface ComparisonInput {
  mode: ComparisonMode;
  value: number;
  currentSalary: number;
}

export interface ComparisonResults {
  currentSalary: number;
  newSalary: number;
  increase: number;
  increasePercentage: number;
  
  // Tax details
  currentResults: TaxCalculationResults;
  newResults: TaxCalculationResults;
  
  // Differences
  grossDiff: number;
  taxDiff: number;
  niDiff: number;
  studentLoanDiff: number;
  pensionDiff: number;
  netDiff: number;
  
  // Marginal rate
  marginalRate: number; // % of increase kept
  effectiveRate: number; // % of increase lost to tax
}
```

**Functions:**
```typescript
// Calculate new salary based on mode
export function calculateNewSalary(input: ComparisonInput): number

// Calculate comparison results
export function calculateComparison(
  currentInput: TaxCalculationInput,
  comparisonInput: ComparisonInput
): ComparisonResults

// Calculate marginal rate
export function calculateMarginalRate(
  increase: number,
  netIncrease: number
): { marginalRate: number; effectiveRate: number }

// Validation
function isValidComparisonInput(input: ComparisonInput): boolean
```

---

### Phase 2: Input Component (45 mins)

#### File: `src/components/organisms/SalaryComparison/ComparisonInputs.tsx`

**Features:**
- 3 radio buttons for mode selection
- Dynamic input field based on mode
- Real-time validation
- Error states with helpful messages

**Props:**
```typescript
interface ComparisonInputsProps {
  currentSalary: number;
  onCompare: (input: ComparisonInput) => void;
  className?: string;
}
```

**UI Layout:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Compare Salary Scenarios</CardTitle>
    <CardDescription>See how a raise affects your take-home pay</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Mode Selection */}
    <RadioGroup value={mode} onValueChange={setMode}>
      <RadioGroupItem value="percentage" label="Percentage Increase" />
      <RadioGroupItem value="amount" label="£ Amount Increase" />
      <RadioGroupItem value="total" label="New Total Salary" />
    </RadioGroup>
    
    {/* Dynamic Input */}
    {mode === 'percentage' && (
      <Input type="number" suffix="%" placeholder="10" />
    )}
    {mode === 'amount' && (
      <Input type="number" prefix="£" placeholder="5,000" />
    )}
    {mode === 'total' && (
      <Input type="number" prefix="£" placeholder="45,000" />
    )}
    
    {/* Actions */}
    <Button onClick={handleCompare}>Compare Salaries</Button>
  </CardContent>
</Card>
```

---

### Phase 3: Results Table (1 hour)

#### File: `src/components/organisms/SalaryComparison/ComparisonResultsTable.tsx`

**Features:**
- Side-by-side comparison
- Diff highlighting (green for gains, amber for losses)
- Responsive mobile layout (stacks on small screens)
- Expandable rows for details

**Props:**
```typescript
interface ComparisonResultsTableProps {
  results: ComparisonResults;
  className?: string;
}
```

**Table Structure:**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Metric</TableHead>
      <TableHead className="text-right">Current</TableHead>
      <TableHead className="text-right">New</TableHead>
      <TableHead className="text-right">Difference</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {/* Gross Salary */}
    <TableRow>
      <TableCell>Gross Salary</TableCell>
      <TableCell className="text-right">{formatCurrency(current)}</TableCell>
      <TableCell className="text-right">{formatCurrency(new)}</TableCell>
      <TableCell className="text-right text-green-600">
        +{formatCurrency(diff)}
      </TableCell>
    </TableRow>
    
    {/* Tax */}
    <TableRow>
      <TableCell>Income Tax</TableCell>
      <TableCell className="text-right">{formatCurrency(currentTax)}</TableCell>
      <TableCell className="text-right">{formatCurrency(newTax)}</TableCell>
      <TableCell className="text-right text-amber-600">
        +{formatCurrency(taxDiff)}
      </TableCell>
    </TableRow>
    
    {/* ... NI, Student Loan, Pension, etc. */}
    
    {/* Net Pay (highlighted) */}
    <TableRow className="border-t-2 font-bold">
      <TableCell>Take-Home Pay</TableCell>
      <TableCell className="text-right">{formatCurrency(currentNet)}</TableCell>
      <TableCell className="text-right">{formatCurrency(newNet)}</TableCell>
      <TableCell className="text-right text-green-600 text-lg">
        +{formatCurrency(netDiff)} ✅
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

### Phase 4: Marginal Rate Insight (30 mins)

#### File: `src/components/organisms/SalaryComparison/MarginalRateInsight.tsx`

**Features:**
- Shows % of increase kept
- Visual progress bar
- Explanation of calculation

**Props:**
```typescript
interface MarginalRateInsightProps {
  increase: number;
  netIncrease: number;
  marginalRate: number;
  effectiveRate: number;
  className?: string;
}
```

**UI:**
```tsx
<Card className="border-primary/20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
  <CardContent className="pt-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="font-semibold text-lg">Marginal Rate</h3>
        <p className="text-sm text-muted-foreground">
          On your {formatCurrency(increase, 0)} increase
        </p>
      </div>
      <Badge variant="success" className="text-xl">
        {marginalRate}%
      </Badge>
    </div>
    
    {/* Progress Bar */}
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>You keep</span>
        <span className="font-semibold text-green-600">
          {formatCurrency(netIncrease, 0)}
        </span>
      </div>
      <Progress value={marginalRate} className="h-3" />
    </div>
    
    {/* Explanation */}
    <p className="text-xs text-muted-foreground mt-4">
      You keep {marginalRate}% of the {formatCurrency(increase, 0)} increase.
      The remaining {effectiveRate}% goes to tax, NI, and deductions.
    </p>
  </CardContent>
</Card>
```

---

### Phase 5: Main Container (30 mins)

#### File: `src/components/organisms/SalaryComparison/SalaryComparisonSection.tsx`

**Features:**
- Collapsible section
- State management
- Orchestrates child components

**Props:**
```typescript
interface SalaryComparisonSectionProps {
  currentInput: TaxCalculationInput;
  currentResults: TaxCalculationResults;
  className?: string;
}
```

**State:**
```typescript
const [isOpen, setIsOpen] = useState(false);
const [comparisonInput, setComparisonInput] = useState<ComparisonInput | null>(null);
const [comparisonResults, setComparisonResults] = useState<ComparisonResults | null>(null);
```

**Layout:**
```tsx
<Collapsible open={isOpen} onOpenChange={setIsOpen}>
  <CollapsibleTrigger asChild>
    <Button variant="outline" className="w-full">
      <ArrowLeftRight className="mr-2 size-4" />
      Compare Salary Scenarios
      <ChevronDown className={cn("ml-auto size-4 transition-transform", isOpen && "rotate-180")} />
    </Button>
  </CollapsibleTrigger>
  
  <CollapsibleContent className="space-y-4 mt-4">
    <ComparisonInputs 
      currentSalary={currentInput.salary}
      onCompare={handleCompare}
    />
    
    {comparisonResults && (
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-4"
        >
          <MarginalRateInsight {...comparisonResults} />
          <ComparisonResultsTable results={comparisonResults} />
        </motion.div>
      </AnimatePresence>
    )}
  </CollapsibleContent>
</Collapsible>
```

---

### Phase 6: Integration (30 mins)

#### Modify: `src/components/organisms/CalculatorContainer.tsx`

**Add after results section:**
```tsx
{/* Salary Comparison Section - After results */}
<AnimatePresence mode="wait">
  {showResults && results && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="order-8 lg:col-span-2"
    >
      <SalaryComparisonSection
        currentInput={input}
        currentResults={results}
      />
    </motion.div>
  )}
</AnimatePresence>
```

---

## 🧪 Testing Strategy (Following Tax Trap Pattern)

### Unit Tests (100+ tests)

#### `salaryComparison.test.ts`
- ✅ calculateNewSalary() with all modes
- ✅ calculateComparison() with various scenarios
- ✅ calculateMarginalRate() accuracy
- ✅ Edge cases (£100k trap interaction, etc.)

#### `salaryComparison.error.test.ts`
- ✅ Invalid inputs (NaN, Infinity, negative)
- ✅ Boundary conditions
- ✅ Type coercion edge cases
- ✅ Never throws errors

#### Component Tests
- ✅ `ComparisonInputs.test.tsx` - All modes, validation
- ✅ `ComparisonResultsTable.test.tsx` - Rendering, formatting
- ✅ `MarginalRateInsight.test.tsx` - Calculations, display
- ✅ `SalaryComparisonSection.test.tsx` - Integration

### Integration Tests

#### `SalaryComparison.integration.test.tsx`
- ✅ £40k → £50k scenario (10% increase)
- ✅ £40k → £45k scenario (£5k increase)
- ✅ £40k → £50k scenario (new total)
- ✅ With all deductions applied
- ✅ Scottish tax code scenario
- ✅ Tax trap zone interaction (£100k → £110k)

---

## ♿ Accessibility Checklist

- [ ] Keyboard navigation (all interactive elements)
- [ ] ARIA labels on radio groups
- [ ] Screen reader announcements for results
- [ ] High contrast mode support
- [ ] Focus indicators visible
- [ ] Mobile touch targets (44x44px minimum)

---

## 🎨 Design Tokens (Reuse from Tax Trap)

```tsx
// Colors
- Success (net gains): text-green-600 dark:text-green-400
- Warning (losses): text-amber-600 dark:text-amber-400  
- Primary: border-primary/20
- Muted: text-muted-foreground

// Spacing
- Card padding: p-4 sm:p-6
- Gap between sections: space-y-4
- Responsive breakpoints: sm:, md:, lg:

// Animations
- Framer Motion: 0.3s duration
- GPU-accelerated transforms
```

---

## 🚀 Implementation Timeline

| Phase | Task | Time | Total |
|-------|------|------|-------|
| 1 | Core logic (`salaryComparison.ts`) | 30 min | 0.5h |
| 2 | ComparisonInputs component | 45 min | 1.25h |
| 3 | ComparisonResultsTable component | 1 hour | 2.25h |
| 4 | MarginalRateInsight component | 30 min | 2.75h |
| 5 | SalaryComparisonSection container | 30 min | 3.25h |
| 6 | Integration into CalculatorContainer | 30 min | 3.75h |
| 7 | Unit tests (all files) | 1.5 hours | 5.25h |
| 8 | Integration tests | 45 min | 6h |
| 9 | Error handling tests | 30 min | 6.5h |
| 10 | Documentation | 30 min | 7h |

**Estimated Total: 7 hours**

---

## 📚 Documentation Deliverables

1. `SALARY_COMPARISON.md` - Feature guide
2. `SALARY_COMPARISON_API.md` - API reference
3. JSDoc comments on all exports
4. Usage examples in tests
5. Add to main feature summary

---

## ✅ Definition of Done

- [ ] All components created and tested
- [ ] 100+ tests passing (unit + integration + error)
- [ ] Error handling comprehensive (never crashes)
- [ ] Accessibility WCAG 2.1 AA compliant
- [ ] Mobile responsive verified
- [ ] Documentation complete
- [ ] Build successful
- [ ] Code review improvements applied
- [ ] Ready for v2.0.0 release

---

## 🎯 Success Metrics

**User Experience:**
- Comparison completes in < 100ms
- Mobile layout stacks cleanly
- All input modes work intuitively

**Technical Quality:**
- Test coverage: 100% edge cases
- Error handling: Bulletproof
- Performance: Optimized with memoization

**Accessibility:**
- Screen reader compatible
- Keyboard navigable
- High contrast support

---

*Ready to implement! Following proven tax trap pattern.* 🚀
