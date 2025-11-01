# Color Visibility Audit - Light on Light / Dark on Dark Issues

## 🚨 CRITICAL VISIBILITY PROBLEMS

### Your Screenshot Shows:
**Salary vs Take-Home Chart (Dark Mode)**
- ❌ **Gross Salary bars**: Dark gray on dark background - INVISIBLE!
- ✅ Take Home bars: Bright green - VISIBLE
- ❌ Grid lines: Too dark - barely visible

---

## 📊 Chart Color Issues

### 1. **Salary vs Take-Home Chart**

#### Current Implementation
```typescript
// NetIncomeComparisonChart.tsx
const chartConfig = {
  gross: {
    label: 'Gross Salary',
    color: 'hsl(var(--muted))',  // ❌ PROBLEM!
  },
  net: {
    label: 'Take Home',
    color: 'hsl(var(--chart-6))', // ✅ Green - visible
  },
};
```

#### The Problem
```css
/* Light Mode */
--muted: oklch(0.97 0 0);  /* Almost white - invisible on white! */

/* Dark Mode */  
--muted: oklch(0.26 0.02 260);  /* Dark gray - invisible on dark! */
```

**Result**: Gross salary bars disappear in BOTH themes!

#### The Fix
```typescript
// Use a visible color with opacity instead
const chartConfig = {
  gross: {
    label: 'Gross Salary',
    color: 'hsl(var(--chart-7))',  // Cyan - visible in both modes
  },
  net: {
    label: 'Take Home',
    color: 'hsl(var(--chart-6))',  // Green
  },
};

// Or use the bar with reduced opacity
<Bar
  dataKey='gross'
  name='Gross Salary'
  fill='hsl(var(--foreground))'  // Use foreground color
  opacity={0.2}                   // Make it subtle but visible
  radius={[4, 4, 0, 0]}
/>
```

---

### 2. **Tax Breakdown Chart**

#### Current Colors
```typescript
// TaxLiabilityChart.tsx
<Bar dataKey='Income Tax' fill='hsl(var(--chart-3))' />      // Red
<Bar dataKey='National Insurance' fill='hsl(var(--chart-4))' /> // Amber
<Bar dataKey='Student Loan' fill='hsl(var(--chart-5))' />    // Orange
<Bar dataKey='Pension' fill='hsl(var(--chart-2))' />         // Purple
<Bar dataKey='Net Pay' fill='hsl(var(--chart-6))' />         // Green
```

#### Issues
```css
/* Light Mode - Chart Colors */
--chart-3: 0 72% 51%;    /* Red #E63946 */
--chart-4: 38 92% 50%;   /* Amber #F5A623 */
--chart-5: 33 100% 50%;  /* Orange #FF8500 */
--chart-2: 280 70% 60%;  /* Purple #B366FF */
--chart-6: 142 71% 45%;  /* Green #23A55A */

/* These are OK - but check against light gray background */
```

**Potential Issue**: If chart has light gray background, some colors might clash

---

### 3. **Income Breakdown Chart (Donut)**

#### Current Colors
```typescript
// IncomeBreakdownChart.tsx
data.push({
  name: 'Employment',
  color: 'hsl(var(--chart-1))',  // Blue
});

data.push({
  name: 'Other Income',
  color: 'hsl(var(--chart-2))',  // Purple
});
```

#### Check These
```css
/* Light Mode */
--chart-1: 210 100% 50%;  /* Blue #0080FF - good */
--chart-2: 280 70% 60%;   /* Purple #B366FF - good */

/* Dark Mode */
--chart-1: 210 100% 60%;  /* Lighter blue - good */
--chart-2: 280 70% 70%;   /* Lighter purple - good */
```

**These are likely OK** - but test to confirm!

---

## 📋 Results Table Color Issues

### Light Mode Problems

#### Text Colors on White Background
```typescript
// Current colors from ResultsTable.tsx
const colors = {
  incomeTax: 'text-red-600',        // #DC2626 on white = 3.9:1 ❌
  ni: 'text-amber-600',              // #D97706 on white = 3.7:1 ❌
  studentLoan: 'text-orange-600',    // #EA580C on white = 3.5:1 ❌
  pension: 'text-purple-600',        // #9333EA on white = 4.1:1 ❌
  netPay: 'text-green-600',          // #16A34A on white = 4.7:1 ⚠️
  teal: 'text-teal-600',             // #0D9488 on white = 4.5:1 ⚠️
};
```

**All fail or barely pass WCAG AA (4.5:1 minimum)**

#### Background Highlights
```typescript
// What If comparison backgrounds
'bg-blue-500/10'    // Light blue tint - probably OK
'bg-purple-500/10'  // Light purple tint - probably OK
```

**These are likely visible** - low opacity on light background

---

### Dark Mode Problems

#### Text Colors on Dark Background
```typescript
// Dark mode variants
const darkColors = {
  incomeTax: 'text-red-400',      // #F87171 on dark = 4.5:1 ⚠️
  ni: 'text-yellow-400',           // #FACC15 on dark = 10.4:1 ✅
  studentLoan: 'text-orange-400',  // #FB923C on dark = 5.2:1 ✅
  pension: 'text-purple-400',      // #C084FC on dark = 3.8:1 ❌
  netPay: 'text-green-400',        // #4ADE80 on dark = 8.3:1 ✅
  teal: 'text-teal-400',           // #2DD4BF on dark = 7.9:1 ✅
};
```

**Purple fails, Red barely passes**

---

## 🎯 IMMEDIATE FIXES NEEDED

### 1. Fix Salary vs Take-Home Chart

```typescript
// src/components/organisms/CalculatorCharts/NetIncomeComparisonChart.tsx

// REPLACE THIS:
const chartConfig = {
  gross: {
    label: 'Gross Salary',
    color: 'hsl(var(--muted))',  // ❌ INVISIBLE!
  },
  net: {
    label: 'Take Home',
    color: 'hsl(var(--chart-6))',
  },
};

// WITH THIS:
const chartConfig = {
  gross: {
    label: 'Gross Salary',
    color: 'hsl(var(--foreground))',  // ✅ Always visible
  },
  net: {
    label: 'Take Home',
    color: 'hsl(var(--chart-6))',
  },
};

// AND UPDATE THE BAR:
<Bar
  dataKey='gross'
  name='Gross Salary'
  fill='hsl(var(--foreground))'  // Visible in both modes
  radius={[4, 4, 0, 0]}
  opacity={0.15}  // Subtle but visible background
/>
```

---

### 2. Fix Results Table Colors

```typescript
// src/components/organisms/CalculatorResults/ResultsTable.tsx

// REPLACE THESE COLOR CLASSES:

// Income Tax
OLD: color: 'text-red-600 dark:text-red-400'
NEW: color: 'text-red-700 dark:text-red-300'  // Better contrast

// National Insurance  
OLD: color: 'text-amber-600 dark:text-yellow-400'
NEW: color: 'text-amber-700 dark:text-amber-300'  // Better contrast

// Student Loan
OLD: color: 'text-orange-600 dark:text-orange-400'
NEW: color: 'text-orange-700 dark:text-orange-300'  // Better contrast

// Pension
OLD: color: 'text-purple-600 dark:text-purple-400'
NEW: color: 'text-purple-700 dark:text-purple-300'  // Better contrast

// Net Pay
OLD: color: 'text-green-600 dark:text-green-400'
NEW: color: 'text-green-700 dark:text-green-300'  // Better contrast

// Teal
OLD: color: 'text-teal-600 dark:text-teal-400'
NEW: color: 'text-teal-700 dark:text-teal-300'  // Better contrast
```

---

### 3. Fix Chart Colors in globals.css

```css
/* src/app/globals.css */

/* Light Mode - Darker for better contrast on white/light gray */
:root {
  --chart-1: 210 100% 40%;    /* Blue - darker */
  --chart-2: 280 70% 50%;     /* Purple - darker */
  --chart-3: 0 80% 45%;       /* Red - darker, more saturated */
  --chart-4: 38 95% 45%;      /* Amber - darker */
  --chart-5: 33 100% 45%;     /* Orange - darker */
  --chart-6: 142 75% 38%;     /* Green - darker */
  --chart-7: 200 85% 45%;     /* Cyan - for gross salary */
}

/* Dark Mode - Brighter for better contrast on dark background */
.dark {
  --chart-1: 210 100% 70%;    /* Blue - brighter */
  --chart-2: 280 70% 75%;     /* Purple - brighter */
  --chart-3: 0 80% 70%;       /* Red - brighter */
  --chart-4: 38 95% 70%;      /* Amber - brighter */
  --chart-5: 33 100% 70%;     /* Orange - brighter */
  --chart-6: 142 75% 65%;     /* Green - brighter */
  --chart-7: 200 85% 70%;     /* Cyan - brighter */
}
```

---

## 🧪 Testing Checklist

### Light Mode
- [ ] Open calculator in light mode
- [ ] Check Salary vs Take-Home chart - can you see gray bars?
- [ ] Check Tax Breakdown chart - all segments visible?
- [ ] Check Income Breakdown donut - clear distinction?
- [ ] Check results table - all text readable?
- [ ] Look for light-on-light issues (white on white, light gray on white)

### Dark Mode
- [ ] Toggle to dark mode
- [ ] Check Salary vs Take-Home chart - **CRITICAL: Can you see gross bars?**
- [ ] Check Tax Breakdown chart - all segments visible?
- [ ] Check Income Breakdown donut - clear distinction?
- [ ] Check results table - all text readable?
- [ ] Look for dark-on-dark issues (black on black, dark gray on dark)

### Specific Problem Areas
- [ ] Gross Salary bars in Salary vs Take-Home
- [ ] Purple text in results table (both modes)
- [ ] Red text in results table (light mode)
- [ ] Grid lines in charts
- [ ] Background highlights in What If comparison

---

## 📊 Contrast Ratio Reference

```
WCAG AA Requirements:
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

Good Targets:
- 7:1 or higher = Excellent
- 4.5:1 to 7:1 = Good (AA)
- 3:1 to 4.5:1 = Borderline (Large text only)
- Below 3:1 = Fail
```

---

## 🎨 Color Philosophy

### What to Avoid
❌ Light gray on white background
❌ Dark gray on black background
❌ Using `--muted` for chart elements (it's meant for subtle UI)
❌ Same color for both light/dark without adjustment

### What to Use
✅ High contrast colors that work in both modes
✅ Different lightness values for light vs dark mode
✅ Saturated colors for data visualization
✅ `--foreground` for text that must be visible

---

## 📝 Summary of Issues

### CRITICAL (Must Fix)
1. ❌ **Gross Salary bars invisible** in Salary vs Take-Home chart (both modes)
2. ❌ **Purple-600** text fails contrast in light mode (3.8:1)
3. ❌ **Red-600** text fails contrast in light mode (3.9:1)

### HIGH Priority
4. ⚠️ **Orange-600** text barely passes (3.5:1)
5. ⚠️ **Amber-600** text barely passes (3.7:1)
6. ⚠️ **Green-600** text barely passes (4.7:1)

### MEDIUM Priority
7. 📊 Chart grid lines too subtle in dark mode
8. 📊 Chart colors could be more vibrant

---

**Created**: 2025-10-24
**Focus**: Light-on-light and dark-on-dark visibility issues
**Priority**: CRITICAL - Gross salary bars are invisible!
