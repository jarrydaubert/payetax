# Marriage Allowance Toggle

**Status:** Not Started  
**Priority:** NOW  
**Effort:** Low

---

## Problem

Married couples/civil partners can transfer £1,260 of Personal Allowance. Calculator doesn't account for this.

## Solution

Add toggle for Marriage Allowance transfer.

## How It Works

- Lower earner transfers £1,260 to higher earner
- Higher earner's PA increases to £13,830
- Tax saving: £252/year (£1,260 × 20%)

## Eligibility

- Married or civil partnership
- Lower earner income < £12,570
- Higher earner is basic rate taxpayer (not higher/additional)

## UI

- Checkbox: "Claiming Marriage Allowance?"
- Or dropdown: "Transferring" / "Receiving" / "Neither"
- Show £252 saving when applicable

## Edge Cases

- Higher earner must be basic rate only
- Scottish basic rate = different calculation
- Can backdate 4 years

## Effort

Low - just adjust Personal Allowance in calculation.
