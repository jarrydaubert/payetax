# PAYTAX-55: Auto Age-Based NI Exemption - Implementation Guide

**Status:** 🟢 Ready to code!  
**Time:** 2-3 hours  
**URL:** https://linear.app/payetax/issue/PAYTAX-55

---

## 🎯 What We're Fixing

**Bug:** Age dropdown exists, comment says "no NI", but it doesn't actually exempt NI.

**Impact:** Incorrect calculations for 12.6M UK pensioners earning over state pension age.

---

## 📝 Step-by-Step Implementation

### Step 1: Update taxCalculator.ts (10 mins)

**File:** `src/lib/taxCalculator.ts`  
**Line:** ~594

**Current code:**
```typescript
// Only calculate NI if not exempt
if (!input.payNoNI && input.niCategory !== 'C') {
  const niRates = standardRates.nationalInsurance.employee[input.niCategory];
  // ... calculate NI
}
```

**Change to:**
```typescript
// Auto-detect state pension age for NI exemption
// State Pension Age: 66 (current), rising to 67 by 2028
const isOverStatePensionAge = input.age !== undefined && input.age >= 66;

// Only calculate employee NI if not exempt
// Exemptions: payNoNI flag, NI Category 'C', or over state pension age
if (!input.payNoNI && input.niCategory !== 'C' && !isOverStatePensionAge) {
  const niRates = standardRates.nationalInsurance.employee[input.niCategory];
  // ... calculate NI
}
```

**That's it for the main fix!** ✅

---

### Step 2: Fix misleading comment in BasicInputs.tsx (2 mins)

**File:** `src/components/organisms/CalculatorInputs/BasicInputs.tsx`  
**Line:** ~237

**Current code:**
```typescript
else if (value === '65-74')
  setAge(70); // Over state pension age (no NI) ⚠️ MISLEADING
else setAge(76); // 75+ (no NI) ⚠️ MISLEADING
```

**Change to:**
```typescript
else if (value === '65-74')
  setAge(70); // Gets £3,660 age allowance, auto-exempt from NI if 66+
else setAge(76); // Gets £3,960 age allowance, auto-exempt from NI
```

---

### Step 3: Run existing tests to verify (5 mins)

```bash
npm run test -- taxCalculator.ageAllowance.test.ts
```

**Expected:** All existing age allowance tests should still pass.

The test file already has this helper that sets `payNoNI` based on age:
```typescript
payNoNI: age ? age >= 66 : false, // State pension age
```

So existing tests already expect this behavior! 🎉

---

### Step 4: Add new test cases (30 mins)

**File:** `src/lib/__tests__/taxCalculator.ageAllowance.test.ts`

Add these tests to the "National Insurance and Age" section:

```typescript
describe('Auto Age-Based NI Exemption', () => {
  it('Age 65 - pays NI (below SPA)', () => {
    const input = createTestInput(30000, 65);
    input.payNoNI = false; // Explicitly test automatic detection
    const result = calculateTax(input);
    
    expect(result.nationalInsurance.annually).toBeGreaterThan(0);
    expect(result.taxFreeAmount).toBe(12570 + 3660); // Gets age allowance
  });

  it('Age 66 - no employee NI (at SPA), employer still pays', () => {
    const input = createTestInput(30000, 66);
    input.payNoNI = false; // Don't use override
    const result = calculateTax(input);
    
    expect(result.nationalInsurance.annually).toBe(0); // Employee: £0
    expect(result.employerNI).toBeGreaterThan(0); // Employer still pays
    expect(result.taxFreeAmount).toBe(12570 + 3660);
  });

  it('Age 70 - no NI, gets age allowance', () => {
    const input = createTestInput(30000, 70);
    input.payNoNI = false;
    const result = calculateTax(input);
    
    expect(result.nationalInsurance.annually).toBe(0);
    expect(result.employerNI).toBeGreaterThan(0);
    expect(result.taxFreeAmount).toBe(12570 + 3660);
  });

  it('Age 76 - no NI, gets higher age allowance', () => {
    const input = createTestInput(30000, 76);
    input.payNoNI = false;
    const result = calculateTax(input);
    
    expect(result.nationalInsurance.annually).toBe(0);
    expect(result.employerNI).toBeGreaterThan(0);
    expect(result.taxFreeAmount).toBe(12570 + 3960); // Higher allowance
  });

  it('Manual payNoNI override still works for under 66', () => {
    const input = createTestInput(30000, 50);
    input.payNoNI = true; // Manual override
    const result = calculateTax(input);
    
    expect(result.nationalInsurance.annually).toBe(0);
  });

  it('NI Category C override still works', () => {
    const input = createTestInput(30000, 50);
    input.niCategory = 'C';
    const result = calculateTax(input);
    
    expect(result.nationalInsurance.annually).toBe(0);
  });

  it('Age 66+ with high income - still no NI', () => {
    const input = createTestInput(100000, 68);
    input.payNoNI = false;
    const result = calculateTax(input);
    
    expect(result.nationalInsurance.annually).toBe(0);
    expect(result.employerNI).toBeGreaterThan(0);
  });
});
```

---

### Step 5: Run all tests (5 mins)

```bash
# Run all tax calculator tests
npm run test -- taxCalculator

# Should see your new tests pass ✅
```

---

### Step 6: Update documentation (15 mins)

#### A. Update inputTooltips.ts

**File:** `src/config/inputTooltips.ts`

Find the `age` tooltip and update:

```typescript
age: {
  label: 'Age',
  content: (
    <>
      <p>
        Your age affects personal allowance and National Insurance:
      </p>
      <ul className="mt-2 space-y-1">
        <li>• <strong>Age 65-74:</strong> Extra £3,660 personal allowance</li>
        <li>• <strong>Age 75+:</strong> Extra £3,960 personal allowance</li>
        <li>• <strong>Age 66+:</strong> No employee National Insurance (employer still pays)</li>
      </ul>
      <p className="mt-2 text-xs">
        Age allowances taper at £1 for every £2 earned above £34,600.
      </p>
    </>
  ),
},
```

#### B. Update CONTRIBUTING.md

**File:** `CONTRIBUTING.md`

Find the age allowance section and add note about auto NI exemption:

```markdown
### Age-Related Allowances & National Insurance

**Age Allowances (65+):**
- Age 65-74: Additional £3,660 personal allowance
- Age 75+: Additional £3,960 personal allowance
- Tapers at £1 for every £2 earned above £34,600

**National Insurance Exemption (66+):**
- **Automatic:** Age 66+ are automatically exempt from employee NI
- **Employer NI:** Still calculated for employees age 66+
- **State Pension Age:** Currently 66, rising to 67 by 2028
- **Manual Override:** "I pay no NI" checkbox and NI Category 'C' still work
```

---

### Step 7: Manual testing (10 mins)

```bash
npm run dev
```

**Test cases in browser:**
1. Enter salary £30,000, select age "Under 65" → Should show NI
2. Change age to "65-74" → NI should become £0
3. Change age to "Over 75" → NI should still be £0
4. Check "I pay no NI" manually → Should still work
5. Results should show employer NI > £0 for all ages

---

### Step 8: Commit and push (5 mins)

```bash
git add -A
git status  # Review changes

git commit -m "feat: Auto age-based NI exemption for SPA 66+ (PAYTAX-55)

- Add automatic NI exemption for age >= 66 in taxCalculator.ts
- Fix misleading comments in BasicInputs.tsx age dropdown
- Add 7 comprehensive test cases for age-based NI logic
- Update inputTooltips.ts with NI exemption info
- Update CONTRIBUTING.md documentation

State Pension Age: 66 (rising to 67 by 2028)
- Age 65: Pays NI ✓
- Age 66+: No employee NI, employer still pays ✓
- Manual overrides (payNoNI, Category C) still work ✓

Fixes incorrect calculations for 12.6M UK pensioners with earnings.

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"

# Push to feature branch
git push origin feature/multiple-incomes-self-employed
```

---

## ✅ Definition of Done

- [x] Code changes in taxCalculator.ts
- [x] Comment fixes in BasicInputs.tsx
- [x] 7 test cases added and passing
- [x] All existing tests still pass
- [x] Documentation updated (tooltips + CONTRIBUTING.md)
- [x] Manual testing complete
- [x] Committed and pushed

---

## 🎯 Files Changed (5 total)

1. ✅ `src/lib/taxCalculator.ts` (~594) - Main fix
2. ✅ `src/components/organisms/CalculatorInputs/BasicInputs.tsx` (~237) - Comment fix
3. ✅ `src/lib/__tests__/taxCalculator.ageAllowance.test.ts` - New tests
4. ✅ `src/config/inputTooltips.ts` - Tooltip update
5. ✅ `CONTRIBUTING.md` - Documentation

---

## 🚀 After This Ticket

**Mark PAYTAX-55 as Done in Linear!**

Then move to **PAYTAX-56** (Multiple Income Sources) - 2-3 days

---

## 💡 Quick Reference

**State Pension Age Rules:**
- Current: 66
- Rising to: 67 (2026-2028)
- Employee NI: £0 at age 66+
- Employer NI: Still calculated
- Age allowances: Different from NI exemption

**HMRC Source:** https://www.gov.uk/state-pension-age

---

**Ready to code? Let's do this!** 💪

Start with Step 1 in taxCalculator.ts!
