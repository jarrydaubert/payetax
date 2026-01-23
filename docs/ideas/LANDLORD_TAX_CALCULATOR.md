# Landlord Tax Calculator

## Opportunity

**Target:** "Accidental landlords" - people who inherited property, rent a spare room, Airbnb a basement, or house-hack to cover the mortgage. They didn't plan to be landlords and have no system for taxes.

**Keywords:**
| Keyword | Volume | Competition | Growth |
|---------|--------|-------------|--------|
| landlord tax | 3.6K | LOW | - |
| making tax digital for landlords | 2.4K | LOW | +3329% |
| landlord rental income tax | 880 | LOW | - |
| landlord national insurance | 720 | LOW | - |

**Why now:** UK's Making Tax Digital (MTD) initiative is expanding to landlords. HMRC is pushing digital record-keeping. Landlords with income over £50K must comply from April 2026, £30K from April 2027.

## UK Landlord Tax Rules (Current)

### Income Tax on Rental Profits
- Rental income added to other income (employment, etc.)
- Taxed at marginal rate (20%/40%/45%)
- Personal allowance applies to total income

### Allowable Expenses
- Letting agent fees
- Legal fees for leases under 1 year
- Accountant fees
- Buildings/contents insurance
- Maintenance and repairs (not improvements)
- Utility bills (if landlord pays)
- Council tax (if landlord pays)
- Ground rent and service charges
- Advertising for tenants

### Mortgage Interest Relief (Section 24)
- **No longer deductible from rental income**
- Instead: 20% tax credit on mortgage interest
- Effectively means higher-rate taxpayers pay more
- This catches many accidental landlords off guard

### Rent-a-Room Scheme
- £7,500 tax-free for renting furnished room in main home
- No expenses can be claimed if using this
- Good for spare room / lodger situations

### Wear and Tear
- Replacement of domestic items relief
- Can deduct cost of replacing furnishings (not initial purchase)

## Calculator Features

### MVP (Free Tool)
1. **Rental Income Calculator**
   - Gross rental income (annual)
   - Allowable expenses checklist with totals
   - Mortgage interest input
   - Calculate: Taxable rental profit

2. **Tax Liability Estimator**
   - Input: Employment income (or link from main calculator)
   - Shows: Combined income, tax band, rental tax due
   - Highlights: Section 24 mortgage interest impact
   - Comparison: "If mortgage interest was still deductible, you'd save £X"

3. **Rent-a-Room Checker**
   - Quick calculator: "Should I use Rent-a-Room scheme?"
   - Compare £7,500 allowance vs actual expenses method

### SEO Pages
- `/tools/landlord-tax-calculator` - Main calculator
- `/tools/rent-a-room-calculator` - Rent-a-Room scheme
- `/guides/landlord-tax-guide` - Comprehensive guide (content marketing)
- `/guides/section-24-explained` - Mortgage interest relief changes

## User Journey

1. **Discovery:** Google "landlord tax calculator UK" or "how much tax on rental income"
2. **Free tool:** Calculate rental tax liability, see impact on overall tax
3. **Cross-sell:** "Calculate your full take-home pay including rental income" → main calculator
4. **Email capture:** "Get your results + tax deadline reminders"
5. **Content:** Guide them to understanding Section 24, MTD requirements

## Competitive Landscape

- **Which?** - Has a basic rental yield calculator
- **GoSimpleTax** - Full tax return software (paid)
- **Hammock** - Landlord accounting app (paid, £12/mo)
- **Landlord Vision** - Property management + tax (paid)

**Gap:** No free, simple, UK-specific calculator that shows rental tax impact on overall income and highlights Section 24 pain.

## Implementation Notes

- Reuse existing tax calculation engine
- Add rental income as "additional income source" (already have `incomeSources` in calculator)
- Section 24 tax credit calculation is straightforward: `mortgageInterest * 0.20`
- Rent-a-Room is binary choice: £7,500 allowance OR expenses method

## Success Metrics

- Organic traffic to landlord pages
- Calculator completions
- Cross-navigation to main PAYE calculator
- Email signups from landlord users
