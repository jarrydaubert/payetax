# PAYE fixture source index

Find the scenario by ID and read this index alongside its JSON description and inputs.
The tables link to published rules and figures. The fixture outputs are derived unless an
official example is identified explicitly. The scenario's `input.taxYear` controls the year.
Here, rUK denotes the unprefixed PAYE regime used by these fixtures.

## Shared derivations

- **PAYE.** [HMRC PAYE routines v24.0](https://assets.publishing.service.gov.uk/media/698c9824bd090be481c2879a/PAYErout-v24-0.odt),
  §§4.3–4.5 and 8 for numeric codes, §§9–10 for flat codes, and Appendix B for annual constants.
  [Tables A](https://assets.publishing.service.gov.uk/media/5c7fde8be5274a3f90f75580/Tables_A_Pay_adjustment.pdf)
  gives Month 1 free or additional pay. For code numbers above 500, split into £416.67 blocks
  and a residual code of 1–500. For example, 1257 uses two blocks plus the code 257 row
  (£214.92), giving £1,048.26. For progressive PAYE, definitions 9–11.2 give the accrued
  thresholds and threshold tax (truncated to four decimal places) and the selection
  boundaries (rounded up to whole pounds). Section 4.4 selects the formula using unrounded
  taxable pay, then calculates with taxable pay rounded down to whole pounds and the
  accrued figures. Truncate the resulting tax to pennies. Flat codes apply the code rate to
  the whole-pound payment, with no free pay.
- **Annual projection.** The default fixture basis is 12 equal months using Month 1 PAYE
  arithmetic. Annual salary is divided by 12 and monthly deductions are multiplied by 12,
  except where the index specifies a different basis. Subtract annual deductions and any
  pension cash cost from annual gross to derive take-home. Monthly take-home can retain a
  fractional penny when it is presented as annual take-home divided by 12. This is a
  steady-pay estimate. Real cumulative payroll uses actual payments and tax to date.
- **NI.** [HMRC 2026–27 employer tables](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027#class-1-national-insurance-thresholds)
  give the monthly Category A primary threshold of £1,048 and upper earnings limit of £4,189.
  Apply [the Category A rates](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027#class-1-national-insurance-rates)
  of 8% between the thresholds and 2% on the excess, then
  [round the contribution to the nearest penny](https://www.gov.uk/hmrc-internal-manuals/national-insurance-manual/nim11002)
  before annualising. The same monthly thresholds and rates apply in
  [2024–25](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2024-to-2025#class-1-national-insurance-thresholds)
  and [2025–26](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026#class-1-national-insurance-thresholds).
  For example, £2,500 monthly gives (£2,500 − £1,048) × 8% = £116.16 or £1,393.92 annually.
- **Loan.** [HMRC 2026–27 loan constants and calculation method](https://www.gov.uk/government/publications/payroll-technical-specifications-student-loans/collection-of-student-loans-from-6-april-2026)
  give annual thresholds and recovery rates. Round the threshold for the relevant period
  down to pennies before calculating the excess, then round the deduction down to pounds.
  [HMRC's employer guidance](https://www.gov.uk/guidance/special-rules-for-student-loans#plan-and-loan-types-and-thresholds)
  gives Plan 2 thresholds of £2,448.75 monthly and £565.09 weekly at 9%, Plan 5 at £2,083.33
  monthly at 9%, and Postgraduate Loan at £1,750 monthly at 6%. Annual figures in the
  fixtures project payroll deductions over the stated periods.

## UK baseline and Scottish flat-rate codes

These scenarios use 2026–27 and the monthly projection. Use the [HMRC regional rates and bands](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027#tax-thresholds-rates-and-codes)
for the rUK £37,700 basic-rate band and [the Scottish Rate Resolution](https://www.parliament.scot/chamber-and-committees/votes-and-motions/S6M-20844)
for Scottish taxable-income limits. [HMRC code letters](https://www.gov.uk/employee-tax-codes/letters)
identify the flat rates, and [HMRC's code-number guidance](https://www.gov.uk/tax-codes/what-your-tax-code-means)
explains the displayed allowance. The HMRC year table gives the standard allowance, and
[Income Tax Act 2007 §35](https://www.legislation.gov.uk/ukpga/2007/3/section/35) gives the
Personal Allowance taper for the blank-code cases.

| Scenario ID | Sources and working |
| --- | --- |
| `uk-40k-1257L`, `uk-60k-1257L` | PAYE and NI shared derivations. Apply 20% up to the accrued rUK basic-rate limit and 40% above it. |
| `uk-12856-1257L-exact-460-penny` | PAYE §4.4, formula 1. £23 × 20% is exactly £4.60 before penny rounding. |
| `uk-110k-757T-coded-amount` | HMRC code-number guidance and PAYE. Two distinct figures are the £7,570 coded amount and £631.59 Month 1 free pay (£416.67 + £214.92). NI gives £350.83 monthly. |
| `uk-110k-blank-code-policy-taper` | Personal Allowance rules give £12,570 − (£110,000 − £100,000) / 2 = £7,570. PayeTax projects the corresponding numeric code basis, so the PAYE and NI working matches the 757T case. |
| `uk-125140-blank-code-policy-taper-zero` | Personal Allowance rules give zero. PAYE formula 2 applies at £10,428 whole-pound taxable pay, with 20% up to £37,700 / 12 and 40% above. NI gives £376.07 monthly. |
| `scot-30k-S1257L` | Scottish Resolution and PAYE formula 3. The accrued limit is £16,956 / 12 = £1,413. The accrued tax at that limit is (£3,967 × 19% + £12,989 × 20%) / 12. Use the shared £2,500/month NI calculation. |
| `uk-30k-1000T-tables-a` | Tables A code 500 row and one additional 500 block. Apply PAYE formula 1 and the shared £2,500/month NI calculation. |
| `scot-sbr-30k`, `scot-sd0-30k`, `scot-sd1-30k`, `scot-sd2-30k`, `scot-sd3-30k` | HMRC code letters and Scottish Resolution. Apply 20%, 21%, 42%, 45% and 48% respectively to £2,500/month, with the shared NI calculation. |
| `ruk-br-30k`, `ruk-d0-30k`, `ruk-d1-30k` | HMRC code letters and rUK rate table. Apply 20%, 40% and 45% respectively to £2,500/month. |

## Scottish top-rate history

All cases are Scottish monthly projections. The historical rate and code come from the
specific year's table. The progressive fixtures apply the v24.0 calculation method to
the cited year's constants.

| Scenario ID | Sources and working |
| --- | --- |
| `sd2-30k-2023-24` | [2023–24 HMRC Tax Tables B–D, D4](https://assets.publishing.service.gov.uk/media/641ad9af8fa8f547c00131bd/Taxable_Pay_Tables_2023_to_2024.pdf) maps SD2 to the 47% top rate. [2023–24 primary NI](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2023-to-2024#employee-primary-contribution-rates-from-6-april-2023-to-5-january-2024) gives 9 months at 12% and 3 at 10% of £2,500 − £1,048, for £2,003.76. |
| `sd3-30k-2024-25` | [2024–25 HMRC Tax Tables B–D, D5](https://assets.publishing.service.gov.uk/media/65cb8afa73806a000cec779e/Tax_Tables_B-D_2024.pdf) maps SD3 to 48%. Use the 2024–25 NI table above. |
| `progressive-150k-2024-25` | [2024–25 Scottish Rate Resolution](https://www.parliament.scot/chamber-and-committees/votes-and-motions/S6M-12252) gives cumulative taxable limits £2,306, £13,991, £31,092, £62,430 and £125,140 at 19%, 20%, 21%, 42% and 45%. Sum each band width times its rate and divide by 12 for £3,978.9841 accrued tax. S0T has zero free pay, so apply 48% to the excess of £12,500 over £125,140 / 12 using formula 6. NI at £12,500/month is £417.50. |
| `sd3-30k-2025-26` | [2025–26 HMRC Tax Tables B–D, D5](https://assets.publishing.service.gov.uk/media/6865408de6557c544c74db53/Tax_Tables_B_D_2025_to_2026.pdf) maps SD3 to 48%. Use the 2025–26 NI table above. |
| `sd3-30k-2026-27` | Same sources and working as `scot-sd3-30k`. |
| `progressive-120k-2026-27-no-top-rate`, `progressive-scvalue-selection-boundary-2026-27` | [2026–27 Scottish Resolution](https://www.parliament.scot/chamber-and-committees/votes-and-motions/S6M-20844) gives the £62,430 and £125,140 taxable limits. Tax to the first of these is (£3,967 × 19% + £12,989 × 20% + £14,136 × 21% + £31,338 × 42%) / 12 = £1,623.5041 at four decimals. Formula 5 starts above the rounded selection value £5,203, then uses the exact £5,202.50 limit. For £120,000, Tables A code 257 gives £214.92 free pay and monthly NI on £10,000 is £367.50. |

## Historical Scottish Month 1 band boundaries

Use [HMRC v21.0](https://webarchive.nationalarchives.gov.uk/ukgwa/20230304080113mp_/https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1130691/PAYErout-v21-0.odt) for 2023–24,
[HMRC v22.0](https://webarchive.nationalarchives.gov.uk/ukgwa/20240111190136mp_/https://assets.publishing.service.gov.uk/media/659bf68dd7737c000df33528/PAYErout-v22-0.odt) for 2024–25 and
[HMRC v23.0](https://webarchive.nationalarchives.gov.uk/ukgwa/20250120182838mp_/https://assets.publishing.service.gov.uk/media/678e18a9ea48a571517acf3a/PAYErout-v23-0.odt) for 2025–26.
In each, §1.5 gives the monthly divisor of 12, definitions 9.1, 10.1 and 11.1 give the
accrued threshold, rounded-up selection cutoff (SCvalue) and accrued tax, and §§4.4.3–4.4.4
give the selection and rounding order. Section 8.3 applies the first-period calculation
on a Month 1 basis. Appendix B gives the Scottish annual figures.
[S0T](https://www.gov.uk/hmrc-internal-manuals/paye-manual/paye11025) gives zero free pay, so monthly gross equals
unrounded taxable pay. The top- and advanced-rate pairs keep whole-pound taxable pay fixed
to test formula selection. At the higher-rate cutoff, £31,092 / 12 is exactly £2,591.
Pay of £2,590.99 uses formula 3(S) on £2,590, and £2,592 uses formula 4(S) with £1 taxed at 42%.
Truncate the formula result to four decimal places, then round down to pennies and multiply
the monthly deduction by 12 for the steady-pay projection.

- [2023–24 Scottish Rate Resolution](https://www.parliament.scot/chamber-and-committees/votes-and-motions/S6M-07853).
  Tax through £13,118 is £2,162 × 19% + £10,956 × 20% = £2,601.98. The accrued threshold
  and tax are £1,093.1666 and £216.8316. Adding £17,974 × 21% gives £6,376.52 through £31,092.
  Adding £94,048 × 42% gives £45,876.68 through £125,140. Dividing these limits and taxes by
  12 and truncating to four decimal places gives £2,591.0000 and £531.3766 at the previous
  limit, and £10,428.3333 and £3,823.0566 at the top-rate cutoff (SCvalue £10,429).
- [2024–25 Scottish Rate Resolution](https://www.parliament.scot/chamber-and-committees/votes-and-motions/S6M-12252).
  Tax through £31,092 is £2,306 × 19% + £11,685 × 20% + £17,101 × 21% = £6,366.35.
  Adding £31,338 × 42% gives £19,528.31 through £62,430. The accrued figures are
  £2,591.0000 and £530.5291 at the previous limit, and £5,202.5000 and £1,627.3591
  at the advanced-rate cutoff (SCvalue £5,203).
- [2025–26 Scottish Rate Resolution](https://www.parliament.scot/chamber-and-committees/votes-and-motions/S6M-16531).
  Tax through £14,921 is £2,827 × 19% + £12,094 × 20% = £2,955.93. The accrued threshold
  and tax are £1,243.4166 and £246.3275. Adding £16,171 × 21% gives £6,351.84 through £31,092,
  or £529.3200 in Month 1.

| Scenario ID | Monthly taxable pay | Month 1 working | Monthly PAYE | 12-month projection |
| --- | ---: | --- | ---: | ---: |
| `s0t-2023-24-at-top-scvalue` | £10,429.00 | £531.3766 + (£10,429 − £2,591) × 42% = £3,823.3366 | £3,823.33 | £45,879.96 |
| `s0t-2023-24-above-top-scvalue` | £10,429.01 | £3,823.0566 + (£10,429 − £10,428.3333) × 47% → £3,823.3699 | £3,823.36 | £45,880.32 |
| `s0t-2024-25-at-advanced-scvalue` | £5,203.00 | £530.5291 + (£5,203 − £2,591) × 42% = £1,627.5691 | £1,627.56 | £19,530.72 |
| `s0t-2024-25-above-advanced-scvalue` | £5,203.01 | £1,627.3591 + (£5,203 − £5,202.50) × 45% = £1,627.5841 | £1,627.58 | £19,530.96 |
| `s0t-2023-24-below-higher-scvalue` | £2,590.99 | £216.8316 + (£2,590 − £1,093.1666) × 21% → £531.1666 | £531.16 | £6,373.92 |
| `s0t-2023-24-first-higher-pound` | £2,592.00 | £531.3766 + (£2,592 − £2,591) × 42% = £531.7966 | £531.79 | £6,381.48 |
| `s0t-2025-26-below-higher-scvalue` | £2,590.99 | £246.3275 + (£2,590 − £1,243.4166) × 21% → £529.1100 | £529.11 | £6,349.32 |
| `s0t-2025-26-first-higher-pound` | £2,592.00 | £529.3200 + (£2,592 − £2,591) × 42% = £529.7400 | £529.74 | £6,356.88 |

## K codes and State Pension age

These are 2026–27 rUK monthly projections. [HMRC's K-code example](https://www.gov.uk/employee-tax-codes/letters#tax-codes-with-the-letter-k)
publishes the nominal £4,750 adjustment for K475 on £27,000. For payroll use Tables A
additional pay and PAYE §§4.3–4.5 and 8. The [PAYE Regulations, regulation 2](https://www.legislation.gov.uk/uksi/2003/2682/regulation/2)
defines the 50% overriding limit, which the PAYE routines round down to pennies.
The capped figures measure deductions under the Month 1 projection. PAYE §§4.5.2 and 8.3
explain how actual cumulative and Month 1 payroll treat amounts left undeducted.

| Scenario ID | Sources and working |
| --- | --- |
| `k475-27k-tables-a-month-1` | The HMRC example gives £31,750 nominal taxable income. The derived PAYE basis is £2,646 × 12 = £31,752 after Tables A and whole-pound rounding. NI is (£2,250 − £1,048) × 8% = £96.16 monthly. |
| `k2500-10k-cap-binds`, `k4000-12k-cap-binds` | Tables A uses code 500 (£417.42) plus four or seven £416.67 blocks respectively. Add this to monthly gross and floor to £2,917 or £4,334. Uncapped PAYE is £583.40 or £1,105.26. Half of gross, rounded down to pennies, gives £416.66 or £500.00. Both payments are below the NI primary threshold. |
| `k600-30k-cap-not-binding` | Tables A gives £416.67 + £84.09 for code 600, leaving whole-pound taxable pay of £3,000. At 20%, the £600 monthly deduction is below the limit. Use the shared £2,500/month NI calculation. |
| `k2500-150k-survives-pa-taper-range` | [HMRC PAYE11095](https://www.gov.uk/hmrc-internal-manuals/paye-manual/paye11095) explains the K-code adjustment. The supplied K2500 represents a nominal negative allowance of £25,000. The overriding-limit invariant bounds the deduction at £6,250 per month (half of £12,500 gross). |
| `spa-20k-age67`, `spa-20k-age78`, `spa-36k-age67` | [State Pension age timetable, table 4](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable#table-4-increase-in-state-pension-age-from-66-to-67-men-and-women) and [HMRC category C guidance](https://www.gov.uk/employee-reaches-state-pension-age) support zero employee NI and continuing employer NI. [Finance Act 2015 §5](https://www.legislation.gov.uk/ukpga/2015/11/section/5) removed age-related allowances. With 1257L, use £1,048.26 free pay and 20% on £618 or £1,951 whole-pound taxable pay. |
| `spa-20k-under-spa-baseline`, `age65-25k-under-spa` | Same PAYE and allowance sources as the over-age cases. The £25,000 case gives £1,035 whole-pound taxable pay. Category A NI applies on monthly pay above £1,048. The no-age case assumes standard Category A treatment. |

## Pension methods and student loans

These cases are 2026–27. For pension methods, use the shared PAYE and NI derivations
and [HMRC PTM044230, Net pay arrangements](https://www.gov.uk/hmrc-internal-manuals/pensions-tax-manual/ptm044230)
for the income-tax basis, [NIM02365](https://www.gov.uk/hmrc-internal-manuals/national-insurance-manual/nim02365)
for employee pension contributions remaining in NI earnings, and
[HMRC salary sacrifice guidance](https://www.gov.uk/guidance/salary-sacrifice-and-the-effects-on-paye)
for an effective sacrifice into a registered pension.

| Scenario ID | Sources and working |
| --- | --- |
| `net-pay-monthly-plan5`, `salary-sacrifice-monthly-plan5` | England, monthly. Use the relevant pension method above and HMRC Loan guidance on secondary Class 1 earnings. Net pay leaves the £4,500 NI and loan base intact, and sacrifice reduces both to £4,050. Use the published £2,083.33 threshold for the whole-pound calculation. |
| `net-pay-scotland-annual` | Scottish Resolution, PAYE formula 4 and the net pay sources. £60,000 and £6,000 are converted to £5,000 gross and £500 pension per month. |
| `net-pay-personal-allowance-taper` | England, annual input projected monthly. [HMRC adjusted net income](https://www.gov.uk/guidance/adjusted-net-income) and Income Tax Act 2007 §35 give £102,000 adjusted income and £11,570 allowance. PayeTax projects numeric code 1157, whose Month 1 free pay is 2 × £416.67 + £131.59 = £964.93. |
| `net-pay-weekly-below-income-tax-threshold`, `net-pay-subpenny-monthly-shortfall` | England. PayeTax projects weekly inputs onto a monthly PAYE and NI basis by multiplying gross and pension by 52 / 12. On that basis, subtract 12 × £89.53 NI from £26,005.20 gross less £24,930.88 pension to get the subpenny case's −£0.04 annually, before any display rounding. |
| `net-pay-zero-at-ni-threshold`, `net-pay-fixed-contribution-capped-to-primary-pay`, `net-pay-contribution-leaves-insufficient-cash-for-ni`, `net-pay-primary-shortfall-with-rental-income` | England, monthly. Apply the published free pay and NI thresholds to the pay bases in the descriptions. The fixed-amount cap and primary-employment shortfall flag are PayeTax behaviours. In the rental case, £923.84 is the combined cash estimate, while the primary employment is short £76.16. [HMRC property income guidance](https://www.gov.uk/renting-out-a-property/paying-tax) covers the separate tax reporting basis. |
| `plan2-50k-monthly-whole-pound`, `plan2-50k-monthly-with-5-percent-salary-sacrifice` | rUK, monthly projection. Loan constants and method above. For the sacrifice case, apply HMRC's effective sacrifice rule and use the secondary Class 1 earnings basis. |
| `plan2-692-31-weekly-whole-pound`, `plan2-2769-24-four-weekly`, `plan2-200-daily-uses-full-weekly-threshold`, `plan2-30-hourly-converts-wage-to-weekly-earnings` | rUK. Use [SL3, pay periods other than weekly or monthly](https://www.gov.uk/government/publications/sl3-student-loan-deduction-tables/2026-to-2027-student-and-postgraduate-loan-deduction-tables#pay-periods-other-than-weekly-or-monthly) for the sub-week and four-week cases. The four-week fixture uses the table method permitted by [regulation 44(4)–(5)](https://www.legislation.gov.uk/uksi/2009/470/regulation/44). Round the weekly deduction first and multiply by four (£11 × 4), then by 13 for the annual figure. Applying the generic formula directly to the four-week period would give £45 per payment. The hourly case assumes 40 hours per week and 52 weekly deductions. |
| `plan2-separate-20k-employments-each-use-own-threshold` | rUK, monthly projection. [HMRC separate employment rule](https://www.gov.uk/guidance/special-rules-for-student-loans#employee-has-more-than-one-job). Each £20,000 / 12 is below £2,448.75. |
| `multiple-undergrad-lowest-threshold-plus-postgrad` | rUK, monthly projection. [HMRC multiple-plan guidance](https://www.gov.uk/new-employee/student-loans) explains using the lowest threshold when the plan in repayment is unknown and taking a postgraduate deduction alongside it. £50,000 / 12 gives floor((gross − £2,083.33) × 9%) = £187 and floor((gross − £1,750) × 6%) = £145. |

## Salary-guide payroll and annual illustrations

These cases use 2026–27 and the shared monthly projection. Scotland applies only to the
explicitly Scottish £70,000 case. Where the articles publish whole pounds, round the final
derived amount for publication.

| Scenario ID | Sources and working |
| --- | --- |
| `salary-guide-40k-base`, `salary-guide-60k-base`, `salary-guide-70k-base`, `salary-guide-100k-base` | PAYE with 1257L and Category A NI. The 40k and 60k working also appears in the UK baseline. At £100,000, floor(£100,000 / 12 − £1,048.26) = £7,285 before formula 2, and monthly NI is £334.17. |
| `salary-guide-40k-plan2`, `salary-guide-60k-plan2`, `salary-guide-70k-plan2`, `salary-guide-100k-plan2` | Loan constants and method above. Subtract the annualised loan from the corresponding base case's take-home. |
| `salary-guide-40k-sacrifice`, `salary-guide-60k-sacrifice`, `salary-guide-70k-sacrifice`, `salary-guide-100k-sacrifice` | HMRC effective salary sacrifice guidance and shared PAYE and NI calculations on 95% of gross. In ascending salary order, the whole-pound monthly taxable amounts are £2,118, £3,701, £4,493 and £6,868. Compute net from reduced cash pay with no further deduction for the sacrificed pension. |
| `salary-guide-70k-scottish` | 2026–27 Scottish Resolution and PAYE formula 4 using S1257L, with NI as in the £70,000 rUK base case. |

The annual illustrations in `salary-guide-40k-base`, `salary-guide-60k-base` and
`salary-guide-100k-base` use the 2026–27 HMRC employer tables for annual Income Tax bands
and allowance and the [annual NI thresholds](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027#class-1-national-insurance-thresholds)
of £12,570 and £50,270 as a separate annual-threshold illustration. For the £100,000
guide's taper rows, deduct £1 of allowance per £2 above £100,000, down to zero. Tax the
first £37,700 of taxable income at 20%, the balance up to £125,140 at 40% and the excess
at 45%. Apply 8% NI between the annual NI thresholds and 2% above, then subtract both
deductions from gross. For example, £110,000 gives £7,570 allowance, £33,432 tax,
£4,210.60 NI and £72,357.40 take-home on this basis.
