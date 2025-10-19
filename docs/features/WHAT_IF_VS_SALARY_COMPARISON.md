# What If vs Salary Comparison - Feature Comparison

**Created:** January 17, 2025

---

## 🎯 Two Different Features

### 1. **What If Scenario** (New - Phase 4 Complete)
**Location:** Integrated into main calculator flow  
**Purpose:** Quick "what if" analysis while using the calculator  
**Trigger:** Purple "What If" button in calculator inputs

**How it works:**
1. User enters their current salary and calculates
2. User clicks "What If" button to enable scenario mode
3. User selects change type (%, £ amount, or new total)
4. Results show **side-by-side comparison** of current vs what-if
5. Responsive: Card stack on mobile, table on desktop

**Use Case:**
> "I currently earn £40k. What if I got a £5k raise?"

**Key Features:**
- Uses same settings as current calculation (tax code, deductions, etc.)
- Shows both scenarios simultaneously
- Marginal rate calculation (% of increase kept)
- Fully responsive design
- Integrated into main calculator flow

**Components:**
- `WhatIfComparisonDisplay.tsx` - Main responsive display
- `WhatIfInputs.tsx` - Input controls in calculator section
- State managed via `calculatorStore.ts`

---

### 2. **Salary Comparison** (Existing - Part of v2.0.0)
**Location:** Collapsible section below main results  
**Purpose:** Compare two completely different salary scenarios  
**Trigger:** "Compare Salary Scenarios" accordion button

**How it works:**
1. User expands the comparison section
2. User enters comparison parameters separately
3. Results show **detailed breakdown table** with all metrics
4. Includes marginal rate insight card

**Use Case:**
> "I want to compare my current job (£40k, no student loan) with a new offer (£50k, different pension)"

**Key Features:**
- Independent comparison parameters
- Can change more settings (not just salary)
- Detailed marginal rate analysis
- Collapsible to save space
- Full breakdown table

**Components:**
- `SalaryComparisonSection.tsx` - Main section
- `ComparisonInputs.tsx` - Input form
- `ComparisonResultsTable.tsx` - Results table
- `MarginalRateInsight.tsx` - Analysis card

---

## 🤔 When to Use Each

### Use **What If** when:
- ✅ You want a quick salary change preview
- ✅ You're staying at the same job (same settings)
- ✅ You want to see both scenarios side-by-side
- ✅ You're on mobile and want a streamlined view

### Use **Salary Comparison** when:
- ✅ Comparing two completely different jobs
- ✅ Settings differ between scenarios (student loan, pension, etc.)
- ✅ You want detailed marginal rate analysis
- ✅ You need full metric breakdowns

---

## 🔧 Technical Differences

| Feature | What If | Salary Comparison |
|---------|---------|-------------------|
| **State** | Zustand store | Component state |
| **Visibility** | Shows when What If enabled | Always available (collapsible) |
| **Layout** | Responsive (cards/table) | Table only |
| **Inputs** | Single dropdown + value | Full comparison form |
| **Scope** | Salary change only | Full scenario comparison |
| **Integration** | Main calculator flow | Separate section |

---

## 🎨 Design Philosophy

**What If:**
- **Fast & Integrated** - Part of natural calculator flow
- **Purple/Pink theme** - Premium, AI-like feel
- **Mobile-first** - Optimized for all devices
- **Minimal inputs** - Quick adjustments

**Salary Comparison:**
- **Detailed & Analytical** - Deep dive into scenarios
- **Standard theme** - Consistent with rest of app
- **Desktop-focused** - Tables work best on larger screens
- **Full control** - Complete parameter customization

---

## ✅ Keep Both Features?

**YES** - They serve different purposes:

1. **What If** = Quick preview during current calculation
2. **Salary Comparison** = Detailed analysis of different scenarios

**Analogy:**
- What If = "Quick Look" preview
- Salary Comparison = "Deep Dive" analysis

---

## 📝 Future Considerations

### Potential Improvements:

**What If:**
- [ ] Add history/comparison of multiple what-if scenarios
- [ ] Save what-if scenarios for later
- [ ] Export what-if comparison to PDF/CSV

**Salary Comparison:**
- [ ] Allow saving comparison presets
- [ ] Add more comparison metrics (e.g., retirement impact)
- [ ] Visual charts/graphs for comparison

**Integration:**
- [ ] Could What If scenarios become Salary Comparison scenarios?
- [ ] "Upgrade to detailed comparison" button in What If?
- [ ] Shared components between the two?

---

**Conclusion:** Both features complement each other and should be kept! 🎉
