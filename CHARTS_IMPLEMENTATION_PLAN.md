# Tax Calculator Charts Implementation Plan

## Overview
Add interactive data visualization charts to the calculator results page using shadcn/ui charts (built on Recharts).

## Screenshots Analysis
From the user's screenshot showing desktop view with What If scenario and multiple income sources:
- **Issue 1**: Large empty gap to the right of the What If section
- **Issue 2**: Results table too cramped when showing many periods
- **Opportunity**: Use empty space for data visualization

## Visual Layout Design

### Layout A: What If Expanded (Has Comparison Data)
```
┌─────────────────────────────────────────────────────────────────┐
│                     Calculator Inputs                            │
└─────────────────────────────────────────────────────────────────┘
┌────────────────────────────┬────────────────────────────────────┐
│                            │  ┌──────────────────────────────┐  │
│                            │  │   Income Breakdown Chart     │  │
│       What If Section      │  │      (Pie/Donut)             │  │
│      (Expanded Panel)      │  └──────────────────────────────┘  │
│                            │  ┌──────────────────────────────┐  │
│                            │  │   Tax Liability Chart        │  │
│                            │  │    (Stacked Bar)             │  │
│                            │  └──────────────────────────────┘  │
│                            │  ┌──────────────────────────────┐  │
│                            │  │   Effective Tax Rate         │  │
│                            │  │      (Line/Area)             │  │
└────────────────────────────┴──┴──────────────────────────────┘  │
                                                                   │
┌─────────────────────────────────────────────────────────────────┐
│              Results Table (Scrollable Horizontally)             │
└─────────────────────────────────────────────────────────────────┘
```

### Layout B: What If Collapsed (No Comparison or Collapsed)
```
┌─────────────────────────────────────────────────────────────────┐
│                     Calculator Inputs                            │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│              Results Table (Scrollable Horizontally)             │
└─────────────────────────────────────────────────────────────────┘
┌───────────────────┬──────────────────┬──────────────────────────┐
│  Income Breakdown │  Tax Liability   │    Effective Tax Rate    │
│   Chart (Wider)   │  Chart (Wider)   │     Chart (Wider)        │
│   (Pie/Donut)     │  (Stacked Bar)   │      (Line/Area)         │
└───────────────────┴──────────────────┴──────────────────────────┘
```

## Charts to Implement

### 1. Income Breakdown Chart (Pie/Donut)
**Purpose**: Show proportion of income from different sources
**Chart Type**: Donut Chart (cleaner than pie)
**Data Source**: `results.incomeBreakdown`

```typescript
// Data shape
{
  employment: number;      // Employment income (subject to NI)
  selfEmployment: number;  // Self-employment income
  dividends: number;       // Dividend income
  other: number;          // Other non-NI income
}
```

**Visual Features**:
- Color-coded segments (consistent with app theme)
- Hover tooltips showing percentage + amount
- Center text showing total gross income
- Legend with icons matching income types

**When to show**:
- Always show if multiple income sources exist
- Hide if only one income source (employment only)

### 2. Tax Liability Breakdown Chart (Stacked Bar)
**Purpose**: Show breakdown of deductions (Tax, NI, Student Loan, Pension)
**Chart Type**: Horizontal Stacked Bar Chart
**Data Source**: `results.incomeTax`, `results.nationalInsurance`, etc.

```typescript
// Data shape
[
  { category: "Income Tax", amount: number, color: "red" },
  { category: "National Insurance", amount: number, color: "amber" },
  { category: "Student Loan", amount: number, color: "orange" },
  { category: "Pension", amount: number, color: "purple" },
  { category: "Net Pay", amount: number, color: "green" }
]
```

**Visual Features**:
- Use same colors as results table for consistency
- Show both absolute values and percentages
- Include "Net Pay" segment in contrasting color
- Hover shows exact amount + percentage

**What If Mode**:
- Show TWO bars stacked vertically:
  - Top bar: "Current" (blue tinted background)
  - Bottom bar: "What If" (purple tinted background)
- Quick visual comparison of tax burden

### 3. Effective Tax Rate Chart (Line/Area)
**Purpose**: Show effective tax rate across different salary levels
**Chart Type**: Area Chart with gradient fill
**Data Source**: Calculate ETR for salary range around current value

```typescript
// Data shape - calculate for ±30% salary range
[
  { salary: 20000, effectiveTaxRate: 15.2, marginalTaxRate: 20 },
  { salary: 25000, effectiveTaxRate: 16.8, marginalTaxRate: 20 },
  // ... current salary highlighted
  { salary: 35000, effectiveTaxRate: 18.5, marginalTaxRate: 20 },
]
```

**Visual Features**:
- X-axis: Salary (±30% range from current)
- Y-axis: Tax rate percentage
- Show both effective and marginal rates as two lines
- Highlight current salary position with vertical line/marker
- Show tax band boundaries with subtle vertical lines

## Technical Implementation

### Step 1: Install Dependencies
```bash
npx shadcn@latest add chart
```

This installs:
- `recharts` (chart library)
- shadcn chart components (wrappers around Recharts)

### Step 2: Create Chart Components

#### File Structure
```
src/components/organisms/CalculatorCharts/
├── index.tsx                    # Main export
├── IncomeBreakdownChart.tsx     # Donut chart
├── TaxLiabilityChart.tsx        # Stacked bar chart
├── EffectiveTaxRateChart.tsx    # Area/line chart
└── ChartsContainer.tsx          # Layout wrapper
```

### Step 3: Data Transformation Utilities

Create `src/lib/chartUtils.ts`:
```typescript
import type { TaxCalculationResults } from './taxCalculator';

export function getIncomeBreakdownData(results: TaxCalculationResults) {
  if (!results.incomeBreakdown) return null;
  
  return [
    {
      name: 'Employment',
      value: results.incomeBreakdown.employment,
      color: 'hsl(var(--chart-1))',
    },
    {
      name: 'Other Income',
      value: results.incomeBreakdown.nonEmployment,
      color: 'hsl(var(--chart-2))',
    },
  ].filter(item => item.value > 0);
}

export function getTaxLiabilityData(results: TaxCalculationResults) {
  return [
    {
      category: 'Income Tax',
      amount: results.incomeTax.annually,
      color: 'hsl(var(--destructive))',
    },
    {
      category: 'National Insurance',
      amount: results.nationalInsurance.annually,
      color: 'hsl(var(--warning))',
    },
    {
      category: 'Student Loan',
      amount: results.studentLoan.annually,
      color: 'hsl(var(--orange))',
    },
    {
      category: 'Pension',
      amount: results.pensionContribution.annually,
      color: 'hsl(var(--purple))',
    },
    {
      category: 'Net Pay',
      amount: results.netPay.annually,
      color: 'hsl(var(--success))',
    },
  ];
}

export function getEffectiveTaxRateData(
  currentSalary: number,
  results: TaxCalculationResults
) {
  const range = currentSalary * 0.3; // ±30%
  const dataPoints: Array<{
    salary: number;
    effectiveTaxRate: number;
    marginalTaxRate: number;
  }> = [];
  
  // Calculate for 20 data points across range
  for (let i = 0; i <= 20; i++) {
    const salary = currentSalary - range + (range * 2 * i) / 20;
    // Calculate tax for this salary
    // ... (reuse calculateTax function)
    dataPoints.push({
      salary,
      effectiveTaxRate: /* calculate */,
      marginalTaxRate: /* calculate */,
    });
  }
  
  return dataPoints;
}
```

### Step 4: Responsive Layout Logic

Create `src/components/organisms/CalculatorCharts/ChartsContainer.tsx`:
```typescript
'use client';

interface ChartsContainerProps {
  results: TaxCalculationResults;
  whatIfResults?: TaxCalculationResults | null;
  whatIfExpanded: boolean;
}

export function ChartsContainer({
  results,
  whatIfResults,
  whatIfExpanded,
}: ChartsContainerProps) {
  // Layout A: What If expanded - vertical stack on right side
  if (whatIfExpanded) {
    return (
      <div className="space-y-4">
        <IncomeBreakdownChart results={results} />
        <TaxLiabilityChart results={results} whatIfResults={whatIfResults} />
        <EffectiveTaxRateChart results={results} />
      </div>
    );
  }

  // Layout B: What If collapsed - horizontal row below table
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
      <IncomeBreakdownChart results={results} />
      <TaxLiabilityChart results={results} whatIfResults={whatIfResults} />
      <EffectiveTaxRateChart results={results} />
    </div>
  );
}
```

### Step 5: Integration into CalculatorContainer

Update `src/components/organisms/CalculatorContainer.tsx`:
```typescript
import { ChartsContainer } from './CalculatorCharts/ChartsContainer';

export function CalculatorContainer() {
  // ... existing code ...

  return (
    <>
      {/* Calculator inputs */}
      <CalculatorInputs />

      {showResults && (
        <>
          {/* What If Section */}
          {whatIfResults && (
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
              <WhatIfSection />
              
              {/* Charts in side gap when What If expanded */}
              <ChartsContainer
                results={results}
                whatIfResults={whatIfResults}
                whatIfExpanded={true}
              />
            </div>
          )}

          {/* Results Table */}
          <ResultsTable {...props} />

          {/* Charts below table when What If not shown/collapsed */}
          {!whatIfResults && (
            <ChartsContainer
              results={results}
              whatIfExpanded={false}
            />
          )}
        </>
      )}
    </>
  );
}
```

## Color Palette (Consistent with Table)

```css
/* Add to globals.css */
:root {
  --chart-1: 210 100% 50%;    /* Blue - Employment */
  --chart-2: 280 70% 60%;     /* Purple - Other Income */
  --chart-3: 0 72% 51%;       /* Red - Income Tax */
  --chart-4: 38 92% 50%;      /* Amber - NI */
  --chart-5: 33 100% 50%;     /* Orange - Student Loan */
  --chart-6: 142 71% 45%;     /* Green - Net Pay */
}
```

## Accessibility Considerations

1. **Keyboard Navigation**: Ensure all chart interactions work with keyboard
2. **Screen Readers**: Add ARIA labels to charts
3. **Color Blind Safe**: Use patterns/textures in addition to colors
4. **High Contrast**: Ensure sufficient contrast in dark mode
5. **Focus Indicators**: Visible focus states on interactive elements

## Performance Optimization

1. **Lazy Loading**: Only render charts when results section is visible
2. **Memoization**: Use `React.memo()` for chart components
3. **Debounce**: Debounce calculations when user adjusts inputs
4. **SSR Considerations**: Charts should render on client only (use dynamic import)

## Testing Requirements

### Unit Tests
- [ ] Chart data transformation utilities
- [ ] Layout logic based on What If state
- [ ] Edge cases (zero income, high earners, etc.)

### Integration Tests
- [ ] Charts render with correct data
- [ ] Layout switches correctly
- [ ] What If comparison shows both datasets

### Accessibility Tests
- [ ] ARIA labels present and correct
- [ ] Keyboard navigation works
- [ ] Screen reader announcements
- [ ] Color contrast meets WCAG AA

## Rollout Plan

### Phase 1: Setup (30 mins)
- Install shadcn chart component
- Create file structure
- Add color variables to theme

### Phase 2: Data Layer (45 mins)
- Create chart data transformation utilities
- Add tests for data transformations
- Handle edge cases

### Phase 3: Components (2 hours)
- Build IncomeBreakdownChart
- Build TaxLiabilityChart  
- Build EffectiveTaxRateChart
- Add tooltips and interactivity

### Phase 4: Layout Integration (1 hour)
- Create ChartsContainer with responsive logic
- Integrate into CalculatorContainer
- Test layout switching

### Phase 5: Polish (1 hour)
- Add animations
- Improve tooltips
- Accessibility audit
- Dark mode testing
- Mobile responsive tweaks

### Phase 6: Testing (1 hour)
- Write component tests
- Integration tests
- Accessibility tests
- Cross-browser testing

**Total Estimated Time**: 6-7 hours

## Success Metrics

1. **User Engagement**: Time spent on results page increases
2. **Comprehension**: Users better understand their tax breakdown
3. **Performance**: Charts load in <500ms
4. **Accessibility**: Pass all WCAG AA criteria
5. **Responsive**: Works on mobile, tablet, desktop

## Future Enhancements

1. **Export Charts**: Download charts as PNG/SVG
2. **Interactive Tooltips**: Click to see detailed breakdowns
3. **Comparison Mode**: Compare multiple scenarios side-by-side
4. **Historical Data**: Show tax changes over tax years
5. **Salary Slider**: Interactive slider to see effect of salary changes
6. **Animation**: Smooth transitions when data changes

## Questions to Resolve

1. Should charts be visible by default or behind an "Advanced View" toggle?
2. Do we want chart data to be exportable (CSV/PDF)?
3. Should we show marginal vs effective tax rate in the ETR chart?
4. What's the minimum viewport width for side-by-side layout?

## Notes from Screenshot Analysis

- Empty gap is approximately 400-500px wide
- What If section height is approximately 600-700px
- Three charts can comfortably fit in this space
- When What If collapsed, full-width charts look better
- Table already has horizontal scroll working well
- Current table takes up significant height with many periods selected
