# £100k Tax Trap Optimizer Feature

## Overview

The Tax Trap Optimizer is a feature that automatically detects when users enter salaries in the £100,000-£125,140 range and provides intelligent pension contribution recommendations to avoid the 60% effective tax rate zone.

## The Problem: £100k Tax Trap

### What is it?

When annual income exceeds £100,000, the personal allowance (£12,570 for 2025-26) begins to taper away at a rate of £1 for every £2 earned. This creates an effective tax rate of **60%** in this income band.

**Breakdown:**
- **40%** - Higher rate income tax
- **20%** - From losing £1 of tax-free allowance for every £2 earned

The personal allowance is completely eliminated at £125,140.

### Who Does This Affect?

Anyone with adjusted net income between £100,000 and £125,140, including:
- High earners
- Those receiving bonuses that push them over £100k
- People with income from multiple sources
- Scottish taxpayers (same trap applies)

## The Solution: Strategic Pension Contributions

Pension contributions reduce **adjusted net income** BEFORE the personal allowance taper calculation. This means:

1. **£1 pension contribution** = **60p tax saved** (in the trap zone)
2. **Plus 25% pension tax relief** from HMRC
3. **Preserves personal allowance** = more tax-free income

### Example

**Scenario: £110,000 salary**

| Without Optimization | With £10,000 Pension |
|---------------------|----------------------|
| Gross: £110,000 | Gross: £110,000 |
| Pension: £0 | Pension: £10,000 |
| Personal Allowance: £7,570 | Personal Allowance: £12,570 |
| Effective Tax Rate: 60% | Effective Tax Rate: 40% |
| **Tax Saved: £0** | **Tax Saved: ~£6,000** |

## Feature Components

### 1. **TaxTrapWarning Component**
📍 Location: `src/components/molecules/TaxTrapWarning.tsx`

**Purpose:** Alert banner that appears when trap is detected

**Features:**
- Displays effective tax rate badge
- Shows amount of personal allowance lost
- Explains the £1 for £2 reduction rule
- "Optimize Now" button to show detailed recommendations

**Trigger Conditions:**
- Salary > £100,000 AND <= £125,140
- Automatically calculated on each tax calculation

### 2. **TaxTrapOptimizer Component**
📍 Location: `src/components/organisms/TaxTrapOptimizer.tsx`

**Purpose:** Interactive optimizer with detailed recommendations

**Features:**
- **Optimal Contribution Card**
  - Shows exact pension amount to drop below £100k
  - Explains the target (reduce to £100,000)

- **Before/After Comparison**
  - Current position (no pension)
  - Optimized position (with pension)
  - Side-by-side take-home and tax rate display

- **Net Benefit Calculation**
  - Shows total annual tax savings
  - Visual highlight of the benefit

- **Educational Section**
  - Explains how the trap works
  - Details the personal allowance taper mechanism
  - Mentions 25% pension tax relief

- **Apply Button**
  - One-click application to main calculator
  - Updates pension contribution automatically
  - Recalculates results

### 3. **Pension Optimizer Logic**
📍 Location: `src/lib/pensionOptimizer.ts`

**Core Function:** `calculateOptimalPension(salary: number)`

**Returns:**
```typescript
{
  suggested: number;        // Optimal pension contribution
  allowanceLost: number;    // Current PA loss
  effectiveRate: number;    // Always 60% in trap
  savingsFromOptimizing: number; // Tax saved by optimizing
  shouldOptimize: boolean;  // Whether it's beneficial
}
```

**Algorithm:**
1. Check if salary is in £100k-£125k range
2. Calculate excess over £100k
3. Calculate personal allowance lost (excess ÷ 2)
4. Suggest pension = excess (rounded to nearest £1,000)
5. Calculate tax savings = suggested × 60%

## Integration

### In CalculatorContainer

The feature integrates seamlessly into the existing calculator flow:

```tsx
// 1. Detect trap on calculation
const taxTrapOptimization = useMemo(() => {
  if (!results) return null;
  return calculateOptimalPension(results.grossSalary.annually);
}, [results]);

// 2. Show warning if trap detected
{taxTrapOptimization && (
  <TaxTrapWarning
    salary={results.grossSalary.annually}
    allowanceLost={taxTrapOptimization.allowanceLost}
    effectiveRate={taxTrapOptimization.effectiveRate}
    onOptimizeClick={handleOptimizeClick}
  />
)}

// 3. Show optimizer when user clicks optimize
{showOptimizer && taxTrapOptimization && (
  <TaxTrapOptimizer
    optimization={taxTrapOptimization}
    currentSalary={results.grossSalary.annually}
    currentTakeHome={results.netPay.annually}
    onApplyOptimization={handleApplyOptimization}
  />
)}
```

### User Flow

1. User enters salary (e.g., £110,000)
2. Clicks "Calculate"
3. **Warning banner appears** at top of results
4. User clicks "Optimize Now"
5. **Optimizer card slides in** with recommendations
6. User reviews comparison and clicks "Apply £10,000 Pension"
7. Calculator updates with new pension contribution
8. Results recalculate automatically
9. Toast notification confirms application

## Tax Code Compatibility

The optimizer works with ALL UK tax codes:

### Standard Codes
- ✅ **1257L** - Standard allowance
- ✅ **S1257L** - Scottish tax code
- ✅ **1257M** - Marriage allowance received
- ✅ **1257N** - Marriage allowance given

### Special Codes
- ✅ **BR** - Basic rate (no allowance)
- ✅ **D0** - Higher rate only
- ✅ **0T** - No tax-free amount
- ✅ **NT** - No tax due
- ✅ **K500** - Negative allowance

### Emergency Codes
- ✅ **1257L W1/M1** - Week 1 / Month 1 basis

**Note:** The personal allowance taper applies to **gross income** regardless of tax code.

## Regional Compatibility

### England, Wales, Northern Ireland
- Uses UK-wide personal allowance rules
- Taper threshold: £100,000
- Full taper: £125,140

### Scotland
- **Same personal allowance rules apply**
- Different income tax rates don't affect PA taper
- Trap mechanism is identical
- 60% effective rate still applies

## Testing

### Unit Tests
📍 `src/components/molecules/__tests__/TaxTrapWarning.test.tsx`
📍 `src/components/organisms/__tests__/TaxTrapOptimizer.test.tsx`

### Integration Tests
📍 `src/components/organisms/__tests__/TaxTrapOptimizer.integration.test.tsx`

**Coverage includes:**
- ✅ All salary edge cases (£100k, £125k, £99,999, £100,001)
- ✅ Scottish vs English tax scenarios
- ✅ All tax code variations
- ✅ Pension contribution calculations
- ✅ Rounding logic
- ✅ Boundary testing
- ✅ Educational content accuracy

### Test Command
```bash
npm test -- --testPattern="TaxTrap"
```

## Edge Cases Handled

### Salary Thresholds
| Salary | Behavior |
|--------|----------|
| £99,999 | No warning (below trap) |
| £100,000 | No warning (exactly at threshold) |
| £100,001 | Warning shown, £1k pension suggested |
| £110,000 | Warning shown, £10k pension suggested |
| £125,140 | Warning shown, £26k pension suggested |
| £125,141 | No warning (beyond trap zone) |
| £150,000 | No warning (beyond trap zone) |

### Rounding Logic
- Pension suggestions rounded to nearest £1,000
- Makes recommendations more practical
- Examples:
  - £100,100 → suggest £1,000
  - £110,500 → suggest £11,000
  - £124,999 → suggest £25,000

## Accessibility

- ✅ Proper ARIA roles (`role="alert"`)
- ✅ Semantic HTML (`<h5>` for titles)
- ✅ Keyboard accessible buttons
- ✅ Screen reader friendly content
- ✅ High contrast color scheme (warning amber)
- ✅ Responsive text sizing

## Performance

- ✅ Memoized calculations (React.useMemo)
- ✅ Conditional rendering (only when trap detected)
- ✅ Animated with Framer Motion (GPU accelerated)
- ✅ Toast notifications (non-blocking)
- ✅ Smooth scroll to optimizer

## Future Enhancements

### Potential Additions
1. **Interactive Slider**
   - Adjust pension amount dynamically
   - See real-time tax impact

2. **Comparison Chart**
   - Visual graph of effective tax rate by salary
   - Highlight trap zone

3. **Multi-Year Projection**
   - Show long-term pension growth
   - Include compound interest calculations

4. **Email Reminder**
   - "Review this before year-end" notification

5. **Export Recommendations**
   - PDF report for tax advisor
   - Include full calculations

## Key Files Summary

| File | Purpose |
|------|---------|
| `src/lib/pensionOptimizer.ts` | Core calculation logic |
| `src/components/molecules/TaxTrapWarning.tsx` | Alert banner component |
| `src/components/organisms/TaxTrapOptimizer.tsx` | Full optimizer interface |
| `src/components/organisms/CalculatorContainer.tsx` | Integration point |
| `src/components/ui/alert.tsx` | Base alert component |
| Tests: `__tests__/*.test.tsx` | Comprehensive test coverage |

## References

- [HMRC: Personal Allowance](https://www.gov.uk/income-tax-rates/income-over-100000)
- [HMRC: Adjusted Net Income](https://www.gov.uk/guidance/adjusted-net-income)
- [Pension Tax Relief](https://www.gov.uk/tax-on-your-private-pension/pension-tax-relief)
