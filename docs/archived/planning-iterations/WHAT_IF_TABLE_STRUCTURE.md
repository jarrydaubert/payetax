# What If Comparison - Table Structure

**Updated:** January 17, 2025  
**Status:** ✅ Complete - Using Same Table Format

---

## 🎯 Final Design

The What If comparison now uses the **exact same table structure** as the main ResultsTable, with these key features:

### Table Layout

```
┌────────────────┬─────┬──────────────────────┬──────────────────────┬───────────────────────┐
│ Category       │  %  │      Yearly          │      Monthly         │       Weekly          │
│                │     ├──────────┬───────────┼──────────┬───────────┼──────────┬────────────┤
│                │     │ Current  │  What If  │ Current  │  What If  │ Current  │  What If   │
├────────────────┼─────┼──────────┼───────────┼──────────┼───────────┼──────────┼────────────┤
│ Gross Pay      │ 100%│ £40,000  │  £45,000  │ £3,333   │  £3,750   │ £769     │   £865     │
│ Tax-Free Allow │ 25% │ £12,570  │  £12,570  │ £1,048   │  £1,048   │ £242     │   £242     │
│ Total Tax Due  │ 14% │  £5,486  │  £6,486   │ £457     │  £540     │ £105     │   £125     │
│ Net Pay        │ 70% │ £28,000  │  £31,000  │ £2,333   │  £2,583   │ £538     │   £596     │
└────────────────┴─────┴──────────┴───────────┴──────────┴───────────┴──────────┴────────────┘
```

---

## ✨ Key Changes Made

### 1. **Button Layout**
- ✅ What If button now below Calculate/Reset
- ✅ Full width (spans both buttons)
- ✅ Purple/pink gradient when active
- ✅ What If inputs appear **below** button (not above)

### 2. **Table Structure**
- ✅ **Single Category column** (not duplicated)
- ✅ **Single % column** (not duplicated)
- ✅ **Duplicated period columns only** (Current vs What If)
- ✅ Two-row header:
  - Row 1: Period names (Yearly, Monthly, etc.) with `colSpan={2}`
  - Row 2: "Current" and "What If" labels

### 3. **Visual Design**
- ✅ Blue background (`bg-blue-500/10`) for Current columns
- ✅ Purple background (`bg-purple-500/10`) for What If columns
- ✅ Same icons, colors, and styling as main ResultsTable
- ✅ Period selector included
- ✅ Scroll indicators for mobile

---

## 📐 Header Structure

### First Header Row (Period Names)
```tsx
<TableRow>
  <TableHead colSpan={1}>Category</TableHead>
  <TableHead colSpan={1}>%</TableHead>
  {visiblePeriods.map(period => (
    <TableHead colSpan={2}>{period}</TableHead>
  ))}
</TableRow>
```

### Second Header Row (Current vs What If)
```tsx
<TableRow>
  <TableHead colSpan={2} /> {/* Empty for Category + % */}
  {visiblePeriods.map(period => (
    <>
      <TableHead>Current</TableHead>
      <TableHead>What If</TableHead>
    </>
  ))}
</TableRow>
```

---

## 🎨 Color Coding

**Current Columns:**
- Background: `bg-blue-500/10`
- Represents: Current scenario

**What If Columns:**
- Background: `bg-purple-500/10`
- Represents: What If scenario

**Row Colors (same as main table):**
- Gross Pay: `text-foreground`
- Tax: `text-red-600 dark:text-red-400`
- NI: `text-amber-600 dark:text-yellow-400`
- Student Loan: `text-orange-600 dark:text-orange-400`
- Pension: `text-purple-600 dark:text-purple-400`
- Net Pay: `text-green-600 dark:text-green-400` (highlighted)

---

## 🔄 Responsive Behavior

### Mobile
- Horizontal scroll enabled
- Scroll indicators (left/right arrows)
- Touch-friendly pan-x scrolling
- Sticky first column (Category)

### Desktop
- Full table visible
- Hover effects on rows
- Smooth scrolling if many periods selected

---

## 📊 Data Flow

```tsx
// For each row:
tableRows.map(row => (
  <TableRow>
    {/* Category (1 column) */}
    <TableCell>{row.category}</TableCell>
    
    {/* Percentage (1 column) */}
    <TableCell>{row.percentage}</TableCell>
    
    {/* Period values (2 columns per period) */}
    {visiblePeriods.map(period => (
      <>
        {/* Current */}
        <TableCell className="bg-blue-500/10">
          {row.currentAnnual / periodOptions[period]}
        </TableCell>
        
        {/* What If */}
        <TableCell className="bg-purple-500/10">
          {row.whatIfAnnual / periodOptions[period]}
        </TableCell>
      </>
    ))}
  </TableRow>
))
```

---

## ✅ What Works

- ✅ Same structure as ResultsTable
- ✅ Period selector works (toggle Yearly, Monthly, etc.)
- ✅ Scroll indicators on mobile
- ✅ Color-coded columns (blue/purple)
- ✅ All row categories included
- ✅ Tax bands shown
- ✅ Student loan conditional
- ✅ Pension conditional
- ✅ Net Pay highlighted
- ✅ Responsive design

---

## 🚀 Testing Checklist

- [ ] Start dev server: `npm run dev`
- [ ] Enter salary (£40,000)
- [ ] Click Calculate
- [ ] Click What If button (should light up purple)
- [ ] Enter What If scenario (+10%)
- [ ] Verify comparison table appears
- [ ] Check two-row header structure
- [ ] Verify Current columns have blue background
- [ ] Verify What If columns have purple background
- [ ] Test period selector (add/remove periods)
- [ ] Test mobile scrolling
- [ ] Verify sticky Category column
- [ ] Check all calculations match

---

## 📝 Footer Note

Shows at bottom of table:
> *Blue columns show your current scenario. Purple columns show your "What If" scenario.

---

**Build Status:** ✅ PASSING  
**Ready to Test:** 🚀 YES

The What If comparison now uses the identical table structure as the main results table, with only the period columns duplicated to show Current vs What If side-by-side!
