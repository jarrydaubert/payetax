# "What If" Scenario Redesign Plan

**Created:** January 17, 2025  
**Status:** Planning  
**Priority:** HIGH

---

## 🎯 Goals

1. **Simplify UX** - One button to toggle "What If" mode
2. **Side-by-side comparison** - Show current vs "what if" results in same table
3. **Streamlined inputs** - Add "What If" inputs to existing input section (like pension inputs)
4. **Add thousand separators** - Format all number inputs as user types
5. **Visual distinction** - Special button color/icon to make it feel premium

---

## 🎨 Design Concept

### Current Flow
```
[Calculate] [Reset] buttons
↓
Single results table
↓  
[Salary Comparison] collapsible section (complex, separate)
```

### New Flow
```
[Calculate] [Reset] [✨ What If] buttons  
                     ↑ Purple/gradient button with wand icon
↓
Input section includes:
- Basic inputs (salary, tax code, etc.)
- Pension inputs (existing)
- 🆕 What If inputs (salary change dropdown + amount)
  
↓
Results table shows:
- Current results (left columns)
- What If results (right columns) - IF What If is active
- Only selected display periods (max 5)
```

---

## 📐 Component Structure

### 1. What If Button (in CalculatorContainer)

**Location:** Next to Calculate/Reset buttons

**Design:**
```tsx
<Button
  variant="outline"
  onClick={toggleWhatIf}
  className="
    border-purple-500/30 
    bg-gradient-to-r from-purple-500/10 to-pink-500/10
    hover:from-purple-500/20 hover:to-pink-500/20
    text-purple-600 dark:text-purple-400
  "
>
  <Wand2 className="mr-2 size-4" />
  What If
</Button>
```

**States:**
- **Inactive:** Outline button, subtle purple
- **Active:** Filled gradient, glowing effect
- **Icon:** `Wand2` or `WandSparkles` from lucide-react

---

### 2. What If Inputs (in CalculatorInputsSection)

**Location:** After pension inputs, before Calculate button

**Visibility:** Always visible OR show when "What If" button clicked

**Design:**
```tsx
<div className="border-t border-purple-500/20 pt-6 mt-6">
  <h3 className="flex items-center gap-2 mb-4">
    <Wand2 className="size-5 text-purple-500" />
    <span>What If Scenario</span>
  </h3>
  
  <div className="grid gap-4 md:grid-cols-2">
    {/* Dropdown: Change Type */}
    <div>
      <label>Change Type</label>
      <Select value={whatIfType} onChange={setWhatIfType}>
        <option value="percentage">% Increase/Decrease</option>
        <option value="amount">£ Amount Change</option>
        <option value="total">New Total Salary</option>
      </Select>
    </div>
    
    {/* Input: Amount */}
    <div>
      <label>
        {whatIfType === 'percentage' ? 'Percentage (%)' : 
         whatIfType === 'amount' ? 'Amount (£)' : 
         'New Salary (£)'}
      </label>
      <NumberInput
        value={whatIfValue}
        onChange={setWhatIfValue}
        prefix={whatIfType !== 'percentage' ? '£' : undefined}
        suffix={whatIfType === 'percentage' ? '%' : undefined}
      />
    </div>
  </div>
</div>
```

**State Management:**
```typescript
// In calculatorStore.ts
interface CalculatorState {
  // ... existing state
  whatIf: {
    enabled: boolean;
    type: 'percentage' | 'amount' | 'total';
    value: number;
  };
  whatIfResults: TaxCalculationResults | null;
}
```

---

### 3. Side-by-Side Results Table

**Current Table Structure:**
```
Category          | Yearly | Monthly | Weekly | etc.
------------------+--------+---------+--------+-----
Gross Salary      | £40,000| £3,333  | £769   | ...
Tax               | £5,486 | £457    | £105   | ...
```

**New Structure (When What If Active):**
```
Category          | Current        | What If        |
                  | Yearly Monthly | Yearly Monthly |
------------------+----------------+----------------+
Gross Salary      | £40k  £3.3k   | £45k  £3.8k   |
Tax               | £5.5k £457    | £6.5k £542    |
Net Pay           | £28k  £2.3k   | £31k  £2.6k   |
                  | Diff: +£3k/yr (+£250/mo)       |
```

**Key Changes:**
1. **Duplicate columns** for selected display periods only
2. **Current vs What If** headers
3. **Difference row** at bottom (green if positive, red if negative)
4. **Max 5 periods** to prevent overflow
5. **No duplicate** category toggles, period selector, etc.

---

### 4. Thousand Separator Formatting

**Problem:** NumberInput used to show commas, now doesn't

**Current `formatNumber` function:**
```typescript
// lib/utils.ts
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
```

**Issue:** Only formats on blur, not while typing

**Solution:** Format as user types (with cursor position preservation)

```typescript
const handleChange = (e) => {
  const input = e.target.value;
  const cursorPos = e.target.selectionStart;
  
  // Remove all commas
  const rawValue = input.replace(/,/g, '');
  
  // Parse to number
  const numValue = parseFloat(rawValue) || 0;
  
  // Format with commas
  const formatted = formatNumber(numValue, 0);
  
  // Update display
  setDisplayValue(formatted);
  
  // Restore cursor (account for added commas)
  requestAnimationFrame(() => {
    const commasBefore = (formatted.substring(0, cursorPos).match(/,/g) || []).length;
    e.target.setSelectionRange(cursorPos + commasBefore, cursorPos + commasBefore);
  });
};
```

---

## 🔄 User Flow

### Scenario: User wants to see impact of £5k raise

1. **User enters current salary:** £40,000 (with commas!)
2. **User clicks Calculate:** See baseline results
3. **User clicks "✨ What If" button:** 
   - Button turns purple/glows
   - What If inputs appear (or highlight if always visible)
4. **User selects "£ Amount Change"** from dropdown
5. **User enters £5,000** in amount field
6. **Results table automatically updates** to show side-by-side:
   - Left: Current (£40k)
   - Right: What If (£45k)
   - Bottom: Difference (+£3k net/year)
7. **User tweaks amount:** See live updates
8. **User clicks "What If" again:** Toggle off, back to single results

---

## 🎨 Visual Design

### Color Palette
- **Primary:** Purple/Pink gradient (magical/AI feel)
- **Active state:** Glowing purple border
- **Diff positive:** Green text
- **Diff negative:** Red/amber text

### Button States
```css
/* Inactive */
.what-if-button {
  border: 1px solid rgb(168 85 247 / 0.3);
  background: linear-gradient(to right, rgb(168 85 247 / 0.1), rgb(236 72 153 / 0.1));
}

/* Active */
.what-if-button-active {
  border: 1px solid rgb(168 85 247);
  background: linear-gradient(to right, rgb(168 85 247), rgb(236 72 153));
  box-shadow: 0 0 20px rgb(168 85 247 / 0.5);
  color: white;
}

/* Hover */
.what-if-button:hover {
  background: linear-gradient(to right, rgb(168 85 247 / 0.2), rgb(236 72 153 / 0.2));
}
```

---

## 📊 Results Table Changes

### Current Implementation
- `ResultsTable.tsx` - Single results display
- `ResultTableRow.tsx` - Individual row component

### New Implementation

**Option A: Modify Existing Components**
```tsx
// ResultsTable.tsx
<table>
  <thead>
    <tr>
      <th>Category</th>
      {displayPeriods.map(period => (
        <>
          <th>Current {period}</th>
          {whatIfEnabled && <th>What If {period}</th>}
        </>
      ))}
    </tr>
  </thead>
  <tbody>
    {categories.map(cat => (
      <ResultTableRow
        category={cat}
        currentResults={results}
        whatIfResults={whatIfEnabled ? whatIfResults : null}
        periods={displayPeriods}
      />
    ))}
    
    {whatIfEnabled && (
      <tr className="border-t-2 font-bold">
        <td>Difference</td>
        {displayPeriods.map(period => (
          <td colSpan={2} className="text-center">
            <DiffCell 
              current={results[cat][period]}
              whatIf={whatIfResults[cat][period]}
            />
          </td>
        ))}
      </tr>
    )}
  </tbody>
</table>
```

**Option B: New Component**
- `ComparisonResultsTable.tsx` - Dedicated component for What If mode
- Simpler, cleaner separation
- Can optimize rendering separately

**Recommendation:** Option B (cleaner, easier to maintain)

---

## 🧮 Calculation Logic

### Store Updates

```typescript
// calculatorStore.ts
interface CalculatorState {
  // ... existing
  whatIf: {
    enabled: boolean;
    type: 'percentage' | 'amount' | 'total';
    value: number;
  };
  whatIfResults: TaxCalculationResults | null;
}

const useCalculatorStore = create<CalculatorState>((set, get) => ({
  // ... existing
  whatIf: {
    enabled: false,
    type: 'percentage',
    value: 10,
  },
  whatIfResults: null,

  toggleWhatIf: () => {
    const { whatIf } = get();
    set({ 
      whatIf: { ...whatIf, enabled: !whatIf.enabled } 
    });
    
    // Recalculate if enabling
    if (!whatIf.enabled) {
      get().calculateWhatIf();
    } else {
      set({ whatIfResults: null });
    }
  },

  setWhatIfType: (type: 'percentage' | 'amount' | 'total') => {
    set(state => ({
      whatIf: { ...state.whatIf, type }
    }));
    get().calculateWhatIf();
  },

  setWhatIfValue: (value: number) => {
    set(state => ({
      whatIf: { ...state.whatIf, value }
    }));
    get().calculateWhatIf();
  },

  calculateWhatIf: () => {
    const { input, whatIf } = get();
    if (!whatIf.enabled) return;

    const currentSalary = input.salary;
    let newSalary: number;

    switch (whatIf.type) {
      case 'percentage':
        newSalary = currentSalary * (1 + whatIf.value / 100);
        break;
      case 'amount':
        newSalary = currentSalary + whatIf.value;
        break;
      case 'total':
        newSalary = whatIf.value;
        break;
    }

    // Calculate with new salary
    const whatIfInput = { ...input, salary: newSalary };
    const whatIfResults = calculateTax(whatIfInput);
    
    set({ whatIfResults });
  },
}));
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// __tests__/whatIf.test.ts
describe('What If Feature', () => {
  it('should calculate percentage change correctly', () => {
    const store = useCalculatorStore.getState();
    store.setSalary(40000);
    store.setWhatIfType('percentage');
    store.setWhatIfValue(10);
    store.calculateWhatIf();
    
    expect(store.whatIfResults?.grossSalary.annually).toBe(44000);
  });

  it('should calculate amount change correctly', () => {
    const store = useCalculatorStore.getState();
    store.setSalary(40000);
    store.setWhatIfType('amount');
    store.setWhatIfValue(5000);
    store.calculateWhatIf();
    
    expect(store.whatIfResults?.grossSalary.annually).toBe(45000);
  });

  it('should calculate new total correctly', () => {
    const store = useCalculatorStore.getState();
    store.setSalary(40000);
    store.setWhatIfType('total');
    store.setWhatIfValue(50000);
    store.calculateWhatIf();
    
    expect(store.whatIfResults?.grossSalary.annually).toBe(50000);
  });

  it('should toggle What If mode', () => {
    const store = useCalculatorStore.getState();
    expect(store.whatIf.enabled).toBe(false);
    
    store.toggleWhatIf();
    expect(store.whatIf.enabled).toBe(true);
    
    store.toggleWhatIf();
    expect(store.whatIf.enabled).toBe(false);
    expect(store.whatIfResults).toBeNull();
  });
});
```

### E2E Tests

```typescript
// e2e/what-if.spec.ts
test('What If scenario flow', async ({ page }) => {
  await page.goto('/');
  
  // Enter salary
  await page.fill('[data-testid="salary-input"]', '40000');
  await page.click('[data-testid="calculate-button"]');
  
  // Click What If button
  await page.click('[data-testid="what-if-button"]');
  expect(await page.getAttribute('[data-testid="what-if-button"]', 'data-active')).toBe('true');
  
  // Select amount change
  await page.selectOption('[data-testid="what-if-type"]', 'amount');
  
  // Enter amount
  await page.fill('[data-testid="what-if-value"]', '5000');
  
  // Verify side-by-side results
  const currentNetPay = await page.textContent('[data-testid="current-net-pay-yearly"]');
  const whatIfNetPay = await page.textContent('[data-testid="what-if-net-pay-yearly"]');
  expect(whatIfNetPay).not.toBe(currentNetPay);
  
  // Verify difference shown
  await expect(page.locator('[data-testid="net-pay-difference"]')).toBeVisible();
});
```

---

## 📋 Implementation Checklist

### Phase 1: Thousand Separators (1-2 hours)
- [ ] Update `NumberInput` to format while typing
- [ ] Preserve cursor position on format
- [ ] Test on all input fields
- [ ] Verify no performance issues

### Phase 2: What If Store (1 hour)
- [ ] Add `whatIf` state to calculatorStore
- [ ] Add `whatIfResults` state
- [ ] Implement `toggleWhatIf()`
- [ ] Implement `setWhatIfType()`
- [ ] Implement `setWhatIfValue()`
- [ ] Implement `calculateWhatIf()`
- [ ] Write unit tests

### Phase 3: What If UI (2-3 hours)
- [ ] Add "What If" button to CalculatorContainer
- [ ] Style button (purple gradient, wand icon)
- [ ] Add What If inputs section
- [ ] Wire up to store
- [ ] Test toggle behavior

### Phase 4: Side-by-Side Table (3-4 hours)
- [ ] Create `ComparisonResultsTable.tsx`
- [ ] Implement dual-column layout
- [ ] Add difference row
- [ ] Limit to 5 display periods
- [ ] Style current vs what-if columns
- [ ] Add green/red diff coloring
- [ ] Test responsive layout

### Phase 5: Integration (1 hour)
- [ ] Remove old SalaryComparison components
- [ ] Clean up unused code
- [ ] Update documentation
- [ ] Test full flow

### Phase 6: Testing (2 hours)
- [ ] Unit tests for calculations
- [ ] Component tests for UI
- [ ] E2E tests for flow
- [ ] Mobile testing
- [ ] Accessibility audit

**Total Time:** 10-13 hours

---

## 🎯 Success Criteria

- [ ] Thousand separators show while typing (all inputs)
- [ ] "What If" button is visually distinct and appealing
- [ ] Side-by-side results are clear and easy to read
- [ ] Performance is smooth (no lag on calculation)
- [ ] Mobile responsive (columns stack appropriately)
- [ ] Accessible (keyboard nav, screen readers)
- [ ] All tests passing

---

## 📊 Comparison: Old vs New

### Old Salary Comparison
- ❌ Separate collapsible section
- ❌ Complex 3-input modes UI
- ❌ Full duplicate results table
- ❌ Hidden until expanded
- ❌ Feels like separate feature

### New What If
- ✅ Integrated into main flow
- ✅ Single dropdown + input
- ✅ Side-by-side in same table
- ✅ Always accessible (button visible)
- ✅ Feels like core feature

---

## 📱 Mobile-First Strategy

### Problem: Side-by-side tables don't work on mobile

**Challenge:** 
- Current table already scrolls horizontally on mobile
- Adding "What If" columns would make it unreadable
- Can't fit 2 sets of results side-by-side on 375px width

### Solution: Adaptive Layout Strategy

#### Desktop (≥768px): Side-by-Side Columns
```
┌─────────────────────────────────────────────┐
│ Category      │ Current    │ What If       │
│               │ Year Month │ Year Month    │
├───────────────┼────────────┼───────────────┤
│ Gross Salary  │ £40k £3.3k │ £45k £3.8k   │
│ Tax           │ £5.5k £457 │ £6.5k £542   │
│ Net Pay       │ £28k £2.3k │ £31k £2.6k   │
│ Difference    │            │ +£3k +£250   │
└─────────────────────────────────────────────┘
```

#### Mobile (<768px): Stacked Cards
```
┌──────────────────────────┐
│ 📊 Current Salary        │
│ £40,000                  │
├──────────────────────────┤
│ Yearly:   £28,000 net    │
│ Monthly:  £2,333 net     │
│ Weekly:   £538 net       │
└──────────────────────────┘

┌──────────────────────────┐
│ ✨ What If Scenario      │
│ £45,000 (+£5k)          │
├──────────────────────────┤
│ Yearly:   £31,000 net    │
│ Monthly:  £2,583 net     │
│ Weekly:   £596 net       │
└──────────────────────────┘

┌──────────────────────────┐
│ 💰 Difference            │
│ You'd gain:              │
├──────────────────────────┤
│ +£3,000 per year         │
│ +£250 per month          │
│ +£58 per week            │
│                          │
│ Marginal Rate: 40%       │
└──────────────────────────┘
```

---

## 🎨 Mobile Implementation Details

### Option 1: Card Stack (Recommended)

**Component Structure:**
```tsx
<div className="space-y-4">
  {/* Current Results Card */}
  <Card className="border-blue-500/30 bg-blue-500/5">
    <CardHeader>
      <h3>Current Salary</h3>
      <p className="text-3xl font-bold">£40,000</p>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {selectedPeriods.map(period => (
          <div key={period} className="flex justify-between">
            <span>{period}:</span>
            <span className="font-semibold">{formatCurrency(currentResults[period])}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>

  {/* What If Results Card */}
  <Card className="border-purple-500/30 bg-purple-500/5">
    <CardHeader>
      <h3 className="flex items-center gap-2">
        <Wand2 className="size-5 text-purple-500" />
        What If Scenario
      </h3>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold">£45,000</p>
        <p className="text-sm text-green-600">+£5,000</p>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {selectedPeriods.map(period => (
          <div key={period} className="flex justify-between">
            <span>{period}:</span>
            <span className="font-semibold">{formatCurrency(whatIfResults[period])}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>

  {/* Difference Summary Card */}
  <Card className="border-green-500/30 bg-green-500/5">
    <CardHeader>
      <h3 className="flex items-center gap-2">
        <TrendingUp className="size-5 text-green-600" />
        You'd Gain
      </h3>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {selectedPeriods.map(period => (
          <div key={period} className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">{period}:</span>
            <span className="text-lg font-bold text-green-600">
              +{formatCurrency(diff[period])}
            </span>
          </div>
        ))}
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between text-sm">
            <span>Marginal Rate:</span>
            <span className="font-semibold">You keep {marginalRate}%</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</div>
```

**Pros:**
- ✅ Clear separation of current vs what-if
- ✅ Easy to scan on mobile
- ✅ Can show more detail per scenario
- ✅ Feels like a proper comparison
- ✅ Room for visual indicators (icons, colors)

**Cons:**
- ⚠️ More scrolling required
- ⚠️ Can't see both at once without scrolling

---

### Option 2: Toggle Between Views

**UI:**
```tsx
<div>
  <div className="flex gap-2 mb-4">
    <Button 
      variant={view === 'current' ? 'default' : 'outline'}
      onClick={() => setView('current')}
      className="flex-1"
    >
      Current
    </Button>
    <Button 
      variant={view === 'whatif' ? 'default' : 'outline'}
      onClick={() => setView('whatif')}
      className="flex-1"
    >
      <Wand2 className="mr-2" />
      What If
    </Button>
  </div>
  
  {/* Show only selected view's results table */}
  {view === 'current' ? <CurrentResultsTable /> : <WhatIfResultsTable />}
  
  {/* Always show difference summary */}
  <DifferenceSummary />
</div>
```

**Pros:**
- ✅ Less scrolling
- ✅ Familiar toggle pattern
- ✅ Can reuse existing ResultsTable component

**Cons:**
- ❌ Can't see both at once
- ❌ Requires tapping to compare
- ❌ Less intuitive than cards

---

### Option 3: Compact Comparison Table (Hybrid)

**Layout:**
```
Category        Current → What If
────────────────────────────────
Gross Salary    £40k → £45k
Tax             £5.5k → £6.5k
NI              £3.3k → £3.8k
Net Pay         £28k → £31k
                        +£3k ✓
```

**Implementation:**
```tsx
<div className="overflow-x-auto">
  <table className="w-full text-sm">
    <thead>
      <tr>
        <th>Category</th>
        <th>Current → What If</th>
      </tr>
    </thead>
    <tbody>
      {categories.map(cat => (
        <tr key={cat.key}>
          <td className="font-medium">{cat.label}</td>
          <td className="flex items-center gap-2">
            <span>{formatValue(current[cat.key])}</span>
            <ArrowRight className="size-3 text-muted-foreground" />
            <span className="font-semibold">{formatValue(whatIf[cat.key])}</span>
          </td>
        </tr>
      ))}
      <tr className="border-t-2 font-bold text-green-600">
        <td>Difference</td>
        <td>+{formatValue(diff)}</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Pros:**
- ✅ Compact, fits on screen
- ✅ Clear before/after flow
- ✅ Less scrolling than cards

**Cons:**
- ⚠️ Only shows one period at a time
- ⚠️ Need period selector
- ⚠️ Less detail than cards

---

## 📱 Recommended Approach: **Hybrid Strategy**

Use **different layouts based on screen size**:

### Mobile (<640px): Card Stack
- 3 cards stacked vertically
- Current, What If, Difference
- Show 2-3 most important periods only
- Large, touch-friendly tap targets

### Tablet (640px-1024px): Compact Table
- Arrow-based comparison (Current → What If)
- Period tabs at top
- Fits in viewport width

### Desktop (≥1024px): Side-by-Side Table
- Full dual-column layout
- Multiple periods visible
- Traditional table format

---

## 🎯 Smart Responsive Implementation

```tsx
// ComparisonResults.tsx
export function ComparisonResults({ current, whatIf, periods }) {
  const [isMobile] = useMediaQuery('(max-width: 640px)');
  const [isTablet] = useMediaQuery('(min-width: 640px) and (max-width: 1024px)');
  const [isDesktop] = useMediaQuery('(min-width: 1024px)');

  // Mobile: Limit to 2 periods, show as cards
  if (isMobile) {
    const mobilePeriods = periods.slice(0, 2); // Only Yearly + Monthly
    return <CardStackLayout 
      current={current} 
      whatIf={whatIf} 
      periods={mobilePeriods} 
    />;
  }

  // Tablet: Compact arrow table
  if (isTablet) {
    return <CompactArrowTable 
      current={current} 
      whatIf={whatIf} 
      periods={periods.slice(0, 3)} 
    />;
  }

  // Desktop: Full side-by-side
  return <SideBySideTable 
    current={current} 
    whatIf={whatIf} 
    periods={periods} 
  />;
}
```

---

## 📐 Mobile-Specific Features

### 1. Swipeable Cards
```tsx
// Allow swiping between Current/What If cards
<Swiper>
  <SwiperSlide>
    <CurrentCard />
  </SwiperSlide>
  <SwiperSlide>
    <WhatIfCard />
  </SwiperSlide>
  <SwiperSlide>
    <DifferenceCard />
  </SwiperSlide>
</Swiper>
```

### 2. Collapsible Details
```tsx
// Show summary by default, expand for full breakdown
<Collapsible>
  <CollapsibleTrigger>
    <div className="flex justify-between">
      <span>Net Pay (Yearly)</span>
      <span>£31,000</span>
    </div>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <div className="pl-4 space-y-2">
      <div>Gross: £45,000</div>
      <div>Tax: -£6,500</div>
      <div>NI: -£3,800</div>
      <div>Student Loan: -£2,200</div>
      <div>Pension: -£1,500</div>
    </div>
  </CollapsibleContent>
</Collapsible>
```

### 3. Sticky Summary Bar
```tsx
// Fixed bar at bottom showing key difference
<div className="fixed bottom-0 left-0 right-0 bg-green-500 text-white p-4 shadow-lg">
  <div className="flex justify-between items-center">
    <span>You'd gain:</span>
    <span className="text-2xl font-bold">+£3,000/year</span>
  </div>
</div>
```

---

## 🎨 Mobile UI Polish

### Visual Hierarchy
```tsx
// Use size/weight to guide attention
<div>
  <h3 className="text-sm text-muted-foreground">Current Salary</h3>
  <p className="text-4xl font-bold">£40,000</p>
  
  <div className="mt-4 space-y-2">
    <div className="flex justify-between">
      <span className="text-base">Yearly Net</span>
      <span className="text-xl font-semibold">£28,000</span>
    </div>
    <div className="flex justify-between text-sm text-muted-foreground">
      <span>Monthly Net</span>
      <span>£2,333</span>
    </div>
  </div>
</div>
```

### Touch Targets
```tsx
// Minimum 44px height for tappable elements
<button className="min-h-[44px] px-4 flex items-center justify-between w-full">
  <span>View Breakdown</span>
  <ChevronDown />
</button>
```

### Loading States
```tsx
// Show skeleton while calculating What If
{isCalculating ? (
  <Card className="animate-pulse">
    <div className="h-32 bg-muted/20 rounded" />
  </Card>
) : (
  <WhatIfCard results={whatIfResults} />
)}
```

---

## 🧪 Mobile Testing Checklist

- [ ] Test on iPhone SE (375px) - smallest modern screen
- [ ] Test on iPhone 14 Pro (393px)
- [ ] Test on Android small (360px)
- [ ] Test on tablet (768px)
- [ ] Test landscape orientation
- [ ] Test with long numbers (£999,999)
- [ ] Test with What If disabled/enabled
- [ ] Test scrolling behavior
- [ ] Test touch/tap targets (min 44px)
- [ ] Test with system font scaling (accessibility)

---

## 🤔 Open Questions

1. **Should What If inputs always be visible** or only when button is active?
   - **Recommendation:** Always visible but dimmed/disabled until button clicked
   - Or show/hide with smooth animation

2. **What happens to Tax Trap Optimizer** when What If is active?
   - **Recommendation:** Show for both current AND what-if salaries if both in trap zone
   - Or only show for what-if scenario

3. **Should we limit display periods to 5 max** or allow user to choose?
   - **Mobile:** Auto-limit to 2 (Yearly + Monthly)
   - **Tablet:** 3 periods (Yearly, Monthly, Weekly)
   - **Desktop:** 5 periods max

4. **Should we debounce the What If calculation** as user types?
   - **Recommendation:** Yes, 300ms debounce to prevent excessive recalculations

5. **Mobile: Cards, Toggle, or Compact Table?**
   - **Recommendation:** Card Stack - most intuitive and spacious
   - **Alternative:** Add swipe gestures for power users

---

**Mobile-first approach approved?** This ensures great UX on all devices! 📱💻🖥️
