# Calculator Charts

**Tax visualization components using Recharts 3.3.0**

Data visualization components that transform tax calculation results into interactive, accessible charts for better financial understanding.

---

## 📊 Available Charts

### 1. NetIncomeComparisonChart

**Purpose:** Compare gross salary vs net take-home across different salary bands

**Visualization:** Vertical bar chart with dual bars (gross + net)

**Use Case:** Shows the impact of progressive taxation at different income levels

```typescript
import { NetIncomeComparisonChart } from '@/components/organisms/CalculatorCharts';

<NetIncomeComparisonChart 
  results={calculationResults} 
  className="w-full"
/>
```

**Features:**
- 7 salary bands: £20k, £30k, £40k, £50k, £75k, £100k, £150k
- Gross salary shown as light background bar
- Net take-home overlaid as darker bar
- Effective tax rate labels on top of each bar
- Current salary position highlighted in summary text

**Accessibility:** 
- `role="img"` with descriptive `aria-label`
- Screen reader announces salary comparison data

---

### 2. IncomeBreakdownChart

**Purpose:** Show proportion of income from different sources

**Visualization:** Donut (pie) chart with percentage labels

**Use Case:** Differentiates employment income (subject to NI) from other income sources

```typescript
import { IncomeBreakdownChart } from '@/components/organisms/CalculatorCharts';

<IncomeBreakdownChart 
  results={calculationResults}
  className="w-full"
/>
```

**Features:**
- Only renders if multiple income sources exist
- Employment income (blue) - subject to National Insurance
- Other income (purple) - dividends, rental, etc. (no NI)
- Percentage labels positioned inside segments
- Total gross income displayed below chart
- Optimized animations (300ms vs default 400ms)

**Accessibility:**
- `role="img"` with descriptive `aria-label`
- Color-coded segments with legend for clarity

**Performance:**
- React.memo to prevent unnecessary re-renders
- Conditional rendering (returns null if < 2 sources)

---

### 3. TaxLiabilityChart

**Purpose:** Breakdown of where gross income goes

**Visualization:** Horizontal stacked bar chart

**Use Case:** Shows tax, NI, student loans, pension, and net pay proportions

```typescript
import { TaxLiabilityChart } from '@/components/organisms/CalculatorCharts';

// Single scenario
<TaxLiabilityChart 
  results={calculationResults}
  className="w-full"
/>

// Comparison mode (current vs what-if)
<TaxLiabilityChart 
  results={currentResults}
  whatIfResults={whatIfResults}
  className="w-full"
/>
```

**Features:**
- Stacked segments: Income Tax → NI → Student Loan → Pension → Net Pay
- Color-coded by category (red=tax, amber=NI, orange=student loan, purple=pension, green=net)
- Optional "Current vs What If" comparison with two bars
- Summary stats below chart (total deductions + take-home)
- Student loan segment conditionally rendered if applicable

**Accessibility:**
- Dynamic `aria-label` changes based on comparison mode
- Clear color contrast for all segments

---

### 4. EffectiveTaxRateChart

**Purpose:** Visualize tax rate progression across salary range

**Visualization:** Area chart with reference line

**Use Case:** Understand how effective and marginal rates change with income

```typescript
import { EffectiveTaxRateChart } from '@/components/organisms/CalculatorCharts';

<EffectiveTaxRateChart 
  results={calculationResults}
  isScottish={false}
  className="w-full"
/>
```

**Features:**
- Salary range: ±30% from current salary
- Effective tax rate (filled area) - total deductions / gross
- Marginal tax rate (dashed line) - rate on next £1 earned
- Current salary marked with vertical reference line
- Gradient fills for visual appeal
- Scottish vs Rest-of-UK tax band support

**Data Points:**
- 20 salary steps across the range
- Uses actual calculated rate for current salary
- Estimates rates for other points (simplified model)

**Accessibility:**
- `role="img"` with descriptive `aria-label`
- Current position clearly marked for screen readers

**Performance:**
- React.useMemo for gradient IDs (prevents SSR conflicts)
- React.useMemo for current effective rate calculation

---

## 🎨 Chart Styling

All charts use:
- **Theme-aware colors** via CSS variables (`hsl(var(--chart-1))`)
- **Responsive containers** with fixed heights (200px-250px)
- **Card wrappers** with title and description
- **Dark mode support** through theme integration

### Color Palette

```typescript
--chart-1: Employment income (blue)
--chart-2: Other income / Pension (purple)
--chart-3: Income tax / Effective rate (red)
--chart-4: National Insurance / Marginal rate (amber)
--chart-5: Student loan (orange)
--chart-6: Net pay (green)
--chart-7: Gross salary (light gray)
```

---

## 🔧 Data Transformation

Charts use utility functions from `@/lib/chartUtils.ts`:

```typescript
// Get income breakdown data (returns null if < 2 sources)
const data = getIncomeBreakdownData(results);

// Get tax liability data (current + optional what-if)
const { current, whatIf } = getTaxLiabilityData(results, whatIfResults);

// Get effective tax rate progression data
const data = getEffectiveTaxRateData(currentSalary, results, isScottish);

// Get chart color configuration
const config = getChartConfig('income' | 'liability' | 'rate');
```

**Type Safety:**
- `IncomeBreakdownData` - Pie chart data points
- `TaxLiabilityData` - Stacked bar segments
- `EffectiveTaxRateData` - Rate progression points

---

## ♿ Accessibility

All chart components follow **WCAG 2.1 Level AA** standards:

### Semantic Structure
```typescript
<ChartContainer 
  role="img" 
  aria-label="Descriptive label of chart content"
>
  {/* Recharts components */}
</ChartContainer>
```

### Screen Reader Support
- `role="img"` identifies charts as images
- `aria-label` describes chart purpose and data
- Text summaries below charts provide key insights
- Color is not the only means of conveying information

### Keyboard Navigation
- Recharts 3.x provides built-in keyboard support
- Tooltips are keyboard-accessible
- Focus states visible on interactive elements

---

## 📦 Component Structure

```
CalculatorCharts/
├── ChartsContainer.tsx        # Grid layout wrapper for all charts
├── NetIncomeComparisonChart.tsx
├── IncomeBreakdownChart.tsx
├── TaxLiabilityChart.tsx
├── EffectiveTaxRateChart.tsx
├── index.tsx                  # Barrel exports
└── README.md                  # This file
```

### ChartsContainer

Layout wrapper component that arranges charts in a responsive grid:

```typescript
import { ChartsContainer } from '@/components/organisms/CalculatorCharts';

<ChartsContainer 
  results={calculationResults}
  whatIfResults={whatIfResults}  // Optional
  isScottish={false}
/>
```

**Layout:**
- Single column on mobile
- 2-column grid on tablet/desktop
- Equal height cards
- Proper spacing and gaps

---

## 🚀 Performance Optimizations

### React.memo
```typescript
export const IncomeBreakdownChart = memo(function IncomeBreakdownChart({ ... }) {
  // Only re-renders when results change
});
```

### React.useMemo
```typescript
const salaryBands = React.useMemo(() => {
  return bands.map(salary => calculateDeductions(salary));
}, [currentSalary]); // Only recalculates when salary changes
```

### Conditional Rendering
```typescript
if (!data || data.length < 2) {
  return null; // Don't render chart if not needed
}
```

### Optimized Animations
```typescript
<Pie animationDuration={300} /> 
// Reduced from Recharts default 400ms
```

---

## 🧪 Testing

Charts should be tested for:

### 1. Data Transformation
```typescript
describe('getIncomeBreakdownData', () => {
  it('returns null for single income source', () => {
    const result = getIncomeBreakdownData(singleSourceResults);
    expect(result).toBeNull();
  });

  it('calculates percentages correctly', () => {
    const result = getIncomeBreakdownData(multiSourceResults);
    expect(result[0].percentage).toBeCloseTo(60, 1);
  });
});
```

### 2. Component Rendering
```typescript
describe('NetIncomeComparisonChart', () => {
  it('renders without crashing', () => {
    render(<NetIncomeComparisonChart results={mockResults} />);
    expect(screen.getByText('Salary vs Take-Home')).toBeInTheDocument();
  });
});
```

### 3. Accessibility
```typescript
describe('Chart Accessibility', () => {
  it('has role="img" and aria-label', () => {
    render(<IncomeBreakdownChart results={mockResults} />);
    const chart = screen.getByRole('img');
    expect(chart).toHaveAttribute('aria-label');
  });

  it('passes axe accessibility tests', async () => {
    const { container } = render(<TaxLiabilityChart results={mockResults} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## 🎓 Adding a New Chart

1. **Create component file** in `CalculatorCharts/`
2. **Define data transformation** in `chartUtils.ts`
3. **Add chart config** to `getChartConfig()`
4. **Implement component** with:
   - Card wrapper (title + description)
   - ChartContainer with `role="img"` and `aria-label`
   - ResponsiveContainer for responsive sizing
   - Recharts chart type (Bar, Pie, Area, Line, etc.)
   - Custom tooltip and legend
   - Summary stats below chart
5. **Export** from `index.tsx`
6. **Add to ChartsContainer** layout
7. **Write tests** (snapshot + accessibility)
8. **Update this README** with usage example

### Example Template

```typescript
'use client';

import { memo } from 'react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { TYPOGRAPHY } from '@/constants/designTokens';
import type { TaxCalculationResults } from '@/lib/taxCalculator';

interface MyChartProps {
  results: TaxCalculationResults;
  className?: string;
}

export const MyChart = memo(function MyChart({ results, className }: MyChartProps) {
  const data = transformData(results);
  const chartConfig = getChartConfig('myChart');

  return (
    <Card className={className}>
      <CardHeader className='pb-3'>
        <CardTitle className={TYPOGRAPHY.TEXT_LG}>My Chart Title</CardTitle>
        <CardDescription className={TYPOGRAPHY.TEXT_SM}>Chart description</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className='h-[250px] w-full'
          role='img'
          aria-label='Descriptive label for screen readers'
        >
          <ResponsiveContainer width='100%' height={250}>
            <BarChart data={data}>
              {/* Chart components */}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
});
```

---

## 📚 Resources

- **Recharts Documentation:** https://recharts.org/
- **Recharts 3.x Release Notes:** https://github.com/recharts/recharts/releases
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Accessible Data Visualization:** https://accessibility.digital.gov/visual-design/data-visualizations/

---

## 🤝 Contributing

When modifying charts:

1. ✅ Run `npm run fix-all` before committing
2. ✅ Ensure all tests pass (`npm test`)
3. ✅ Test accessibility with screen reader
4. ✅ Verify dark mode appearance
5. ✅ Test responsive behavior (mobile → desktop)
6. ✅ Update this README if adding/changing functionality

---

**Questions?** See main project [CONTRIBUTING.md](../../../../CONTRIBUTING.md)
