# Director Tools - Build Spec

> **Purpose:** How to build the education-first director guide.
> **For tax calculations:** See `DIRECTOR_TOOLS_MATH.md`
> **For product strategy:** See `DIRECTOR_TOOLS.md`

---

## What We're Building

**"First-Time Director's Guide to Paying Yourself"**

An educational guide with an embedded calculator. Not an optimizer.

| Old Approach | New Approach |
|--------------|--------------|
| Calculator-first | Education-first |
| "Optimal tax extraction" | "Simple & safe approach" |
| "Save £1,654" | "What to set aside for tax" |
| Comparison tables | Set-aside pots |
| For experts | For confused beginners |

---

## Route

`/tools/director-guide`

(Not `/tools/director-optimizer`)

---

## Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  FIRST-TIME DIRECTOR'S GUIDE TO PAYING YOURSELF                │
│  No jargon. No stress. Just clear answers.                      │
│  [Free] [2025-26 Tax Year]                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: ENTRY CHOICE                                           │
│                                                                 │
│  How much do you know about paying yourself as a director?      │
│                                                                 │
│  [I'm new to this — explain everything]                         │
│                                                                 │
│  [I know the basics — just calculate]                           │
└─────────────────────────────────────────────────────────────────┘

↓ "I'm new" path shows all sections
↓ "I know basics" jumps to calculator (Section 4)

┌─────────────────────────────────────────────────────────────────┐
│  SECTION 2: YOUR THREE OPTIONS                                  │
│  (Education - only shown to "I'm new" path)                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SECTION 3: THE SIMPLE SAFE APPROACH                            │
│  (Education - only shown to "I'm new" path)                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SECTION 4: YOUR SITUATION                                      │
│  (Calculator inputs)                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SECTION 5: YOUR RESULTS                                        │
│  (Set-aside pots, safe monthly draw)                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SECTION 6: KEY DATES                                           │
│  (Deadlines + calendar download)                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SECTION 7: FAQ                                                 │
│  (Common questions)                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Section Details

### Section 2: Your Three Options

```
How directors pay themselves:

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   SALARY    │  │  DIVIDENDS  │  │  DIRECTOR'S │
│             │  │             │  │    LOAN     │
│ Like a job  │  │ Share of    │  │ Borrowing   │
│ Tax + NI    │  │ profits     │  │ from company│
│ deducted    │  │ Lower tax   │  │ ⚠️ Careful! │
└─────────────┘  └─────────────┘  └─────────────┘

[ⓘ] Every term has a tooltip explaining it in plain English
```

**Key educational points:**
- Salary = like a normal job, taxed through PAYE
- Dividends = from profits only, lower tax rates
- Director's Loan = NOT a payment method, it's borrowing you must repay

### Section 3: The Simple Safe Approach

```
Most accountants recommend this for small company directors:

1. Pay yourself £12,570 salary (uses your tax-free allowance)
2. Take the rest as dividends (taxed at lower rates)
3. Set aside ~25% of profit for Corporation Tax
4. Set aside money for your personal tax bill (January)

This isn't perfectly optimal, but it's:
✓ Simple to understand
✓ Easy to run payroll
✓ Low risk of mistakes
✓ What most small company directors do
```

**Payroll warning card:**
```
⚠️ SALARY MEANS PAYROLL

If you pay yourself salary, you (or payroll software) must:
• Register as an employer with HMRC
• Submit RTI returns each payday
• Pay PAYE/NI monthly (or quarterly if small)

[How to set up payroll →]  [Talk to an accountant →]
```

### Section 4: Your Situation (Calculator Inputs)

**Input 1: Year-End Date**
```
When does your company's financial year end?
○ 31 March (most common)
○ 31 December
○ Other: [date picker]
○ I don't know → [How to find this]
```

**Input 2: Profit**
```
What's your company's estimated profit this year?
£ [________]

This is income minus expenses, before Corporation Tax and your pay.
[ⓘ Where do I find this?]
```

**Input 3: Already Taken Money? (DLA Trigger)**
```
Have you already taken money from the company this year?
○ No, not yet
○ Yes, as salary through payroll
○ Yes, but not through payroll ← Triggers DLA warning
```

**DLA Warning:**
```
⚠️ THIS MAY BE A DIRECTOR'S LOAN

If you transferred money to yourself without declaring it as 
salary or dividends, it's a Director's Loan. You'll need to either:

• Pay it back
• Declare it as salary/dividend (with back taxes)
• Pay S455 tax (33.75%) if it stays as a loan

This is common and fixable — but talk to an accountant.
```

**Input 4: Employment Allowance**
```
Does your company claim Employment Allowance?
○ Yes  ○ No  ○ Not sure
[ⓘ What is this?]
```

**Input 5: Other Income (Optional)**
```
▼ I have other personal income
£ [________]
(Salary from another job, rental income, etc.)
```

### Section 5: Your Results

**Primary Output: Set-Aside Pots**

```
┌─────────────────────────────────────────────────────────────────┐
│  Based on £100,000 profit:                                      │
│                                                                 │
│  💰 SAFE MONTHLY DRAW (estimate)                                │
│     £5,545 /month                                               │
│     Check you have this in the business account first.          │
│                                                                 │
│  🏦 SET ASIDE: BUSINESS TAX POT                                 │
│     £19,118 for Corporation Tax                                 │
│     Keep this in the business account. Don't touch.             │
│     Label transfers: "TAX SAVE"                                 │
│                                                                 │
│  💳 SET ASIDE: PERSONAL TAX POT                                 │
│     £13,203 for Self Assessment                                 │
│     Transfer to a personal savings account now.                 │
│     Due: 31 January 2027                                        │
│                                                                 │
│  ✅ STATUS: You're on track                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Bank Transfer References:**
```
When you transfer money, label it clearly:

Salary Transfer:   "SALARY [Month]"
Dividend Transfer: "DIVIDEND"
Tax Pot Transfer:  "TAX SAVE"
```

**Survival Mode (Profit ≤ 0):**
```
⚠️ NO PROFIT YET

You have no profit to extract as dividends. Your options:

• Salary (if registered for PAYE) — but this adds to your loss
• Director's Loan — must be repaid or face 33.75% S455 tax
• If you put money IN previously, you can repay that loan to yourself

Safest: Don't extract beyond expenses until profitable.

[Talk to an accountant →]
```

**Comparison (Collapsed by Default):**
```
[▼ Show detailed breakdown]

| | All Dividend | Simple & Safe |
|---|---|---|
| Salary | £0 | £12,570 |
| Dividends | £77,250 | £67,176 |
| Total Tax | £35,111 | £32,321 |
| Take-Home | £64,889 | £66,543 |

Potential extra with Simple & Safe: +£1,654
```

### Section 6: Key Dates

```
📅 YOUR TAX CALENDAR

Based on year end: 31 March 2026

┌────────────────────────────────────────────────────────────────┐
│  Corporation Tax Payment                                        │
│  Due: 1 January 2027 (9 months after year end)                 │
│  Amount: ~£19,118                                               │
│  [Add to Calendar]                                              │
├────────────────────────────────────────────────────────────────┤
│  Company Tax Return                                             │
│  Due: 31 March 2027 (12 months after year end)                 │
│  [Add to Calendar]                                              │
├────────────────────────────────────────────────────────────────┤
│  Self Assessment Payment                                        │
│  Due: 31 January 2027                                           │
│  Amount: ~£13,203                                               │
│  [Add to Calendar]                                              │
└────────────────────────────────────────────────────────────────┘

⚠️ PAYMENTS ON ACCOUNT (YEAR 2 SURPRISE)

If your personal tax is above threshold, HMRC may require 
payments on account (January + July). This can make your 
second-year cash needs higher than expected.
```

**Calendar Download:** Simple .ics file generation (no OAuth).

### Section 7: FAQ

```
❓ Can I pay dividends if I haven't made a profit yet?
No. Dividends must come from "distributable reserves" — 
accumulated profit after Corporation Tax. If you've made a 
loss, you can only take salary.

❓ I already took money from the company. Is that bad?
It depends. If you didn't declare it as salary or dividend, 
it's a Director's Loan. You'll need to either pay it back, 
declare it properly, or pay S455 tax. Talk to an accountant.

❓ Do I need to run payroll?
Yes, if you're paying yourself salary. You need to register 
as an employer with HMRC and file RTI returns.

❓ What if I'm employed somewhere else?
If you have another job, your Personal Allowance is probably 
used there. This changes the optimal salary from your company. 
Use the "Other income" field, or talk to an accountant.

❓ Should I get an accountant?
For simple situations, you can probably manage year one yourself. 
But an accountant is worth it for most directors — they'll 
save you more than they cost.
```

---

## File Structure

```
src/
├── app/tools/
│   ├── page.tsx                        # Tools landing page
│   └── director-guide/
│       ├── page.tsx                    # Server (metadata, schema)
│       └── DirectorGuideClient.tsx     # Client (UI + state)
├── components/
│   ├── molecules/
│   │   ├── SetAsidePot.tsx             # Single pot display
│   │   ├── PayrollWarning.tsx          # RTI/PAYE warning
│   │   ├── DLAWarning.tsx              # Director's Loan warning
│   │   └── SurvivalMode.tsx            # Zero profit state
│   └── organisms/DirectorGuide/
│       ├── EntryChoice.tsx             # "I'm new" vs "I know basics"
│       ├── ThreeOptions.tsx            # Education: Salary/Div/DLA
│       ├── SimpleSafeApproach.tsx      # Education: The recommendation
│       ├── YourSituation.tsx           # Calculator inputs
│       ├── YourResults.tsx             # Set-aside pots output
│       ├── KeyDates.tsx                # Deadlines + calendar
│       └── FAQ.tsx                     # Common questions
├── lib/
│   ├── directorCalculator.ts           # Core math (see MATH doc)
│   ├── calendarGenerator.ts            # .ics file generation
│   └── __tests__/
│       └── directorCalculator.test.ts
└── constants/
    └── taxRates.ts                     # Tax rates (see MATH doc)
```

---

## Legal Disclaimer

Display on every page:

> **Important:** This guide provides **estimates** based on current HMRC tax rates. It is for illustrative purposes only and does not constitute financial, tax, or legal advice. Your actual tax position may differ. **Always consult a qualified accountant before making financial decisions.**

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `guide_viewed` | Page load |
| `guide_path_selected` | "I'm new" or "I know basics" clicked |
| `guide_section_viewed` | Each section reached |
| `guide_year_end_entered` | Year-end date selected |
| `guide_profit_entered` | Profit input completed |
| `guide_dla_warning_shown` | DLA warning triggered |
| `guide_results_shown` | Results calculated |
| `guide_calendar_downloaded` | .ics downloaded |
| `guide_copy_clicked` | Results copied |
| `guide_accountant_cta_clicked` | "Talk to accountant" clicked |

---

## Build Order

### Step 1: Foundation
- [ ] Add tax rates to `taxRates.ts`
- [ ] Create `directorCalculator.ts` with tests
- [ ] Verify golden example passes

### Step 2: Components
- [ ] EntryChoice.tsx
- [ ] ThreeOptions.tsx (education)
- [ ] SimpleSafeApproach.tsx (education)
- [ ] YourSituation.tsx (inputs)
- [ ] SetAsidePot.tsx
- [ ] YourResults.tsx
- [ ] KeyDates.tsx + calendarGenerator.ts
- [ ] FAQ.tsx

### Step 3: Warnings
- [ ] PayrollWarning.tsx
- [ ] DLAWarning.tsx
- [ ] SurvivalMode.tsx

### Step 4: Page Assembly
- [ ] DirectorGuideClient.tsx
- [ ] page.tsx with metadata

### Step 5: Polish
- [ ] Mobile responsive
- [ ] Accessibility (WCAG 2.2 AA)
- [ ] Analytics events
- [ ] E2E tests

---

## Copy Reference

### Page Title
"First-Time Director's Guide to Paying Yourself"

### Subtitle
"No jargon. No stress. Just clear answers."

### Primary Output Label
"Safe Monthly Draw (estimate)" — NOT "Spendable now"

### Set-Aside Labels
- "Business Tax Pot" (Corporation Tax)
- "Personal Tax Pot" (Self Assessment)

### Status Labels
- ✅ "You're on track"
- ⚠️ "Check this"
- 🔴 "Talk to an accountant"

---

## What's NOT In This Build

| Feature | Status |
|---------|--------|
| Scotland support | Phase 2 |
| PDF export | Phase 2 (Pro) |
| Save scenarios | Phase 2 (Pro) |
| Email reminders | Phase 2 (Pro) |
| Pension contributions | Phase 2 |
| Student loan | Phase 2 |
| Multiple directors | Phase 2 |

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Guide completion rate | > 50% |
| Time on page | > 2 min |
| "This helped" feedback | Positive |
| Zero "calculation is wrong" complaints | ✅ |
