# Calculator UX Optimization Plan 🎯

**Date:** October 18, 2025  
**Goal:** Create a bulletproof, intuitive calculator experience with everything visible (or clearly indicated) in one view

---

## 🎯 Core Principles

1. **One View Philosophy** - All critical info visible without scrolling on desktop
2. **Progressive Disclosure** - Show basics first, reveal complexity on demand
3. **Clear Navigation** - Animated scroll indicators when content extends
4. **Guided Input** - HMRC-style tooltips on hover for every input
5. **Responsive Hierarchy** - Adapt layout smartly across devices

---

## 📐 Current Layout Analysis

### Desktop (≥1024px) - Grid Layout
```
┌─────────────────────────────────────────────────────┐
│                   Header                             │
├──────────────┬──────────────────────────────────────┤
│   INPUTS     │         RESULTS                      │
│   (Left)     │         (Right)                      │
│              │                                       │
│  - Basic     │  - Summary Cards                     │
│  - Pension   │  - Results Table                     │
│  - What If   │  - Export Buttons                    │
│              │                                       │
│ [Calculate]  │ (Tax Trap Warning - if applicable)   │
│ [Reset]      │ (Tax Trap Optimizer - if clicked)    │
│ [What If]    │                                       │
│              │                                       │
│              │                                       │
│              │                                       │
│              │                                       │
└──────────────┴──────────────────────────────────────┘
```

### Issues:
- ❌ What If inputs can push Calculate button below fold
- ❌ Tax Trap Optimizer appears BELOW results table (requires scroll)
- ❌ No tooltips on inputs
- ❌ Unclear when content extends below fold

---

## ✅ Proposed Optimizations

### 1. **Desktop Layout - Sticky Inputs**

```
┌─────────────────────────────────────────────────────┐
│                   Header                             │
├──────────────┬──────────────────────────────────────┤
│   INPUTS     │  ▼ SCROLL INDICATOR ▼                │
│   (STICKY)   │                                       │
│              │  - Summary Cards (visible)           │
│  - Basic     │  - Tax Trap Warning (if applicable)  │
│  - Pension   │  - Results Table (visible top)       │
│  - What If   │  ────────────────────────────────    │
│              │  - Table continues (scrollable)      │
│ [Calculate]  │  - Tax Trap Optimizer (if active)    │
│ [Reset]      │  - Export Buttons                    │
│ [What If]    │                                       │
│              │  ▲ SCROLL TO TOP ▲                   │
│ (ALWAYS      │                                       │
│  VISIBLE)    │                                       │
└──────────────┴──────────────────────────────────────┘
```

**Changes:**
- ✅ Make left inputs column sticky (always visible)
- ✅ Add scroll indicator at top of results when content extends
- ✅ Add "scroll to top" button when user scrolls down
- ✅ Max-height on inputs column to prevent overflow

---

### 2. **Input Tooltips - HMRC Style**

Every input gets a tooltip on hover with clear, official wording:

#### Example Tooltips:

**Gross Salary:**
```
💰 Your total earnings before tax and deductions
HMRC: Include salary, bonuses, and commission
```

**Tax Code:**
```
🔢 Your HMRC tax code (e.g., 1257L)
Found on payslip or P45. Affects your tax-free allowance.
```

**Pension Contribution:**
```
🏦 Voluntary pension contributions
Reduces taxable income (salary sacrifice).
Enter as % of salary or fixed £ amount.
```

**Student Loan Plan:**
```
🎓 Your student loan repayment plan
Plan 1: Before Sept 2012 (England/Wales)
Plan 2: After Sept 2012 (England/Wales)
Plan 4: Scotland
Postgraduate: Master's/PhD loan
```

**National Insurance Category:**
```
📋 Your NI contribution category
Category A: Standard (most employees)
Category B: Married women (reduced rate)
Category C: Over state pension age
```

**What If - Type:**
```
🔮 How to model your salary change
Percentage: E.g., +10% raise
Amount: E.g., +£5,000 bonus
Total: E.g., new job at £50,000
```

---

### 3. **Scroll Indicators**

#### Top Scroll Indicator (when results extend below):
```tsx
{showScrollIndicator && (
  <div className="sticky top-0 z-10 animate-bounce">
    <div className="bg-gradient-to-b from-primary/10 to-transparent py-2 text-center">
      <ChevronDown className="mx-auto size-6 text-primary" />
      <span className="text-xs text-muted-foreground">
        More results below
      </span>
    </div>
  </div>
)}
```

#### Scroll to Top Button (when scrolled):
```tsx
{showScrollTop && (
  <button 
    onClick={scrollToTop}
    className="fixed bottom-6 right-6 z-50 rounded-full bg-primary p-3 shadow-lg"
  >
    <ChevronUp className="size-6 text-primary-foreground" />
  </button>
)}
```

---

### 4. **Responsive Hierarchy**

#### Mobile (<640px)
```
┌─────────────────────┐
│      Header         │
├─────────────────────┤
│   Basic Inputs      │
│   [Calculate]       │
│   [Reset]           │
│   [What If ▼]       │
│   (What If inputs)  │
├─────────────────────┤
│   Summary Cards     │
│   Tax Trap Warning  │
├─────────────────────┤
│   Results Table     │
│   (horizontal scroll)│
├─────────────────────┤
│   Export Buttons    │
└─────────────────────┘
```

**Mobile Optimizations:**
- Stack all sections vertically
- Summary cards show 2-3 key metrics
- Results table scrolls horizontally
- Sticky Calculate button at bottom

#### Tablet (640px-1024px)
```
┌───────────────────────────────┐
│          Header               │
├───────────────────────────────┤
│   Inputs (full width)         │
│   [Calculate] [Reset] [WhatIf]│
├───────────────────────────────┤
│   Summary Cards (4 across)    │
├───────────────────────────────┤
│   Results Table (scrollable)  │
├───────────────────────────────┤
│   Export Buttons              │
└───────────────────────────────┘
```

---

### 5. **Progressive Disclosure**

#### Default State (Collapsed):
- Show only essential inputs (Salary, Tax Code, Region)
- "Advanced Options ▼" button reveals:
  - Pension
  - Student Loan
  - Marriage Allowance
  - Blind Person's Allowance

#### What If State:
- Collapsible section (already implemented ✓)
- Clear indicator when active

#### Tax Trap State:
- Warning badge inline with summary (not separate section)
- Optimizer opens as modal/drawer instead of inserting below

---

### 6. **Visual Clarity**

#### Color Coding:
- **Inputs:** Neutral (card background)
- **Summary:** Brand gradient
- **Warnings:** Amber/Red
- **What If:** Purple/Pink gradient
- **Success:** Green

#### Typography Hierarchy:
- **H1:** Page title (40px)
- **H2:** Section headers (24px)
- **H3:** Card titles (18px)
- **Body:** Input labels (14px)
- **Small:** Tooltips, hints (12px)

---

## 🛠️ Implementation Phases

### Phase 1: Tooltips (Priority: HIGH)
**Time:** 2-3 hours

- [ ] Create `InputTooltip` component wrapper
- [ ] Add HMRC-style content for each input
- [ ] Test on hover (desktop) and tap (mobile)
- [ ] Ensure accessibility (aria-describedby)

**Files:**
- Create: `src/components/atoms/InputTooltip.tsx`
- Modify: All input components in `CalculatorInputs/`

---

### Phase 2: Sticky Inputs Column (Priority: HIGH)
**Time:** 1-2 hours

- [ ] Add `sticky top-0` to inputs column
- [ ] Set `max-h-screen overflow-y-auto` to prevent overflow
- [ ] Test scroll behavior on different screen heights
- [ ] Add subtle shadow when sticky

**Files:**
- Modify: `CalculatorContainer.tsx`

---

### Phase 3: Scroll Indicators (Priority: MEDIUM)
**Time:** 2 hours

- [ ] Detect when results extend below viewport
- [ ] Add animated down arrow at results top
- [ ] Add scroll-to-top FAB when scrolled
- [ ] Smooth scroll animations

**Files:**
- Create: `src/components/atoms/ScrollToTop.tsx`
- Modify: `CalculatorContainer.tsx`

---

### Phase 4: Progressive Disclosure (Priority: MEDIUM)
**Time:** 3 hours

- [ ] Group advanced inputs
- [ ] Add "Advanced Options" collapsible
- [ ] Default to collapsed
- [ ] Remember user preference

**Files:**
- Create: `src/components/organisms/CalculatorInputs/AdvancedInputs.tsx`
- Modify: `CalculatorInputsSection.tsx`

---

### Phase 5: Tax Trap as Modal (Priority: LOW)
**Time:** 2 hours

- [ ] Convert TaxTrapOptimizer to dialog/drawer
- [ ] Open from warning banner
- [ ] Overlay instead of inline

**Files:**
- Modify: `TaxTrapOptimizer.tsx`
- Create: `TaxTrapModal.tsx`

---

## 📊 Success Metrics

### Desktop
- ✅ All inputs visible without scroll
- ✅ Summary cards visible without scroll
- ✅ First 5-6 table rows visible without scroll
- ✅ Clear indicator when more content below
- ✅ Tooltips appear on all inputs

### Tablet
- ✅ One-column layout fits in viewport
- ✅ Inputs don't push content too far down
- ✅ Touch-friendly tooltips

### Mobile
- ✅ Vertical stack with logical order
- ✅ Sticky Calculate button
- ✅ Summary cards show key metrics
- ✅ Table scrolls horizontally smoothly

---

## 🎨 Component Hierarchy

```
CalculatorContainer
├── Header (motion.div)
├── Grid Container (lg:grid lg:grid-cols-[380px_1fr])
│   ├── Inputs Column (STICKY)
│   │   ├── BasicInputs
│   │   │   └── Each input wrapped in <InputTooltip>
│   │   ├── AdvancedInputs (collapsible)
│   │   │   ├── PensionInputs
│   │   │   ├── StudentLoanSelect
│   │   │   ├── MarriageAllowanceToggle
│   │   │   └── BlindAllowanceToggle
│   │   └── Actions
│   │       ├── [Calculate] [Reset]
│   │       └── [What If ▼]
│   │           └── WhatIfInputs (collapsible)
│   │
│   └── Results Column
│       ├── ScrollIndicator (top)
│       ├── TaxTrapWarning (inline banner)
│       ├── ResultsSummaryCards
│       ├── ResultsTable (What If integrated)
│       ├── TaxTrapModal (if optimizer opened)
│       └── ExportButtons
│
└── ScrollToTop FAB
```

---

## 🧪 Testing Checklist

### Desktop (1920x1080)
- [ ] Inputs stay visible when scrolling results
- [ ] All tooltips appear on hover
- [ ] Scroll indicator shows when needed
- [ ] Scroll-to-top button appears/hides correctly

### Laptop (1440x900)
- [ ] Inputs don't overflow vertically
- [ ] Summary cards fit in viewport
- [ ] Table visible with scroll indicator

### Tablet (768px)
- [ ] Stack layout works
- [ ] Tooltips work on touch
- [ ] No horizontal overflow

### Mobile (375px)
- [ ] Vertical stack is logical
- [ ] Touch targets adequate (44px+)
- [ ] Tooltips accessible
- [ ] Table scrolls horizontally

---

## 💡 Tooltip Content Library

Create a central config file:

```typescript
// src/config/inputTooltips.ts
export const INPUT_TOOLTIPS = {
  salary: {
    title: "Gross Salary",
    description: "Your total earnings before tax and deductions",
    hmrc: "Include salary, bonuses, and commission",
  },
  taxCode: {
    title: "Tax Code",
    description: "Your HMRC tax code (e.g., 1257L)",
    hmrc: "Found on payslip or P45. Determines tax-free allowance.",
  },
  // ... more tooltips
};
```

---

## 🚀 Quick Wins (Do First)

1. **Add tooltips** - Immediate UX improvement
2. **Make inputs sticky** - Keeps controls accessible
3. **Add scroll indicator** - Guides user navigation

---

## 📝 Notes

- Keep animations subtle (150-300ms)
- Use `prefers-reduced-motion` for accessibility
- Test on real devices, not just DevTools
- Consider viewport height variations (short laptops, tall monitors)
- Mobile tooltips: tap-to-show, tap-outside-to-hide

---

**Next Steps:**
1. Start with Phase 1 (Tooltips) - highest impact
2. Implement Phase 2 (Sticky inputs) - fixes scroll issues
3. Add Phase 3 (Scroll indicators) - polish
4. Phases 4-5 are optional enhancements

**Total Time Estimate:** 8-12 hours for Phases 1-3

Let's make the calculator experience bulletproof and beautiful! 🎯✨
