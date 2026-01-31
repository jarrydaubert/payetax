# Director Tax Pack — Production Spec v3.1

> **Status:** Unanimously Approved (Grok, Gemini, ChatGPT)
> **Build Estimate:** 9-10 days
> **Price:** £19 one-off (raise to £29 after validation)

---

## What We're Building

**Product:** Director Tax Pack 2025/26
**Target:** Existing PayeTax users who complete Director Pay Dashboard (~1k/month)
**USP:** "Turn your PayeTax results into an accountant-ready documentation pack in one click."

---

## The Artifacts

| Artifact | Format | Purpose |
|----------|--------|---------|
| Tax Report | PDF (4 pages) | Executive summary + comparison |
| Breakdown | CSV | Full calculation detail |
| Dividend Voucher | PDF + DOCX | Legal documentation (editable) |
| Board Minutes | PDF + DOCX | Legal documentation (editable) |
| **Bundle** | ZIP | All above in one download |

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER COMPLETES DIRECTOR PAY DASHBOARD (FREE)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. RESULTS PAGE SHOWS CTA: "Get Director Tax Pack (£19)"        │
│    • Summary: "PDF report + CSV + editable templates"           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. MODAL COLLECTS:                                              │
│    • Email (required) — "for receipt + recovery"                │
│    • Company name (recommended)                                 │
│    • Director name (recommended)                                │
│    • Accounting period end (recommended)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. ON "BUY" CLICK:                                              │
│    • POST to /api/create-pack                                   │
│    • Server generates packId + recoveryToken                    │
│    • Server stores payload in KV (24h TTL), status = pending    │
│    • Server creates Stripe Checkout Session                     │
│    • Server returns { checkoutUrl }                             │
│    • Client redirects to Stripe                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. USER PAYS ON STRIPE                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. STRIPE REDIRECTS TO /success?session_id=cs_xxx               │
│    (No PII in URL — only Stripe session ID)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. SUCCESS PAGE:                                                │
│    • POST to /api/pack with { session_id }                      │
│    • Server verifies payment via Stripe API                     │
│    • Server fetches payload from KV                             │
│    • Server marks status = paid                                 │
│    • Server returns payload + recoveryUrl                       │
│    • Client generates pack (PDF + CSV + DOCX)                   │
│    • Client bundles into ZIP                                    │
│    • Shows "Download Your Tax Pack" button                      │
│    • Shows recovery link (valid 24h)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. RECOVERY (WITHIN 24H):                                       │
│    • User visits /recover?packId=xxx&token=xxx                  │
│    • Server verifies token + expiry + status = paid             │
│    • Returns payload → regenerates pack                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Architecture

```
┌─────────────┐     ┌──────────────────────┐     ┌─────────────┐
│   Modal     │────▶│  /api/create-pack    │────▶│   Stripe    │
│  (client)   │     │  • generate packId   │     │  Checkout   │
│             │     │  • store in KV       │     │             │
│             │     │  • create session    │     │             │
│             │◀────│  • return URL        │     │             │
└─────────────┘     └──────────────────────┘     └──────┬──────┘
      │                                                  │
      │ redirect                                         │ redirect
      ▼                                                  ▼
┌─────────────┐                               ┌─────────────────┐
│   Stripe    │──────────────────────────────▶│  /success       │
│   Payment   │   ?session_id=cs_xxx          │  (client)       │
└─────────────┘                               └────────┬────────┘
                                                       │
                                              POST session_id
                                                       ▼
                                              ┌─────────────────┐
                                              │  /api/pack      │
                                              │  • verify paid  │
                                              │  • check amount │
                                              │  • fetch KV     │
                                              │  • return data  │
                                              └─────────────────┘
```

---

## API Endpoints

### 1. `POST /api/create-pack`

**Request:**
```json
{
  "input": {
    "region": "ruk",
    "revenue": 100000,
    "includesVat": false,
    "expenses": 20000,
    "lossesBroughtForward": 0,
    "otherIncome": 0,
    "employmentAllowance": true,
    "studentLoanPlans": ["plan2"],
    "pensionContribution": 3000,
    "companyCarBIK": 0,
    "minimumSalaryRequirement": 0,
    "hasOtherPAYEEmployment": false
  },
  "results": {
    "grossProfit": 80000,
    "strategies": {
      "allSalary": { "salary": 67500, "dividends": 0, "takeHome": 49000, ... },
      "optimalMix": { "salary": 12570, "dividends": 48857, "takeHome": 57584, ... },
      "allDividends": { "salary": 0, "dividends": 60000, "takeHome": 53500, ... }
    },
    "recommended": "optimalMix",
    "savingsVsAllSalary": 8584
  },
  "user": {
    "email": "user@example.com",
    "companyName": "Acme Ltd",
    "directorName": "John Doe",
    "yearEnd": "2026-03-31"
  }
}
```

> **Note:** `input` is verbatim `StrategyInput` from store. `results` is verbatim `StrategyComparison` output.
> PDF generator reads directly from `results.strategies.*` - no recalculation needed.

**Server Logic:**
1. Generate `packId` (uuid)
2. Generate `recoveryToken` (random string)
3. Store in KV with 24h TTL (see KV Schema below)
4. Create Stripe Checkout Session with `client_reference_id = packId`
5. Return `{ checkoutUrl }`

**Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_xxx"
}
```

---

### 2. `POST /api/pack`

**Success Mode:**
```json
{ "session_id": "cs_xxx" }
```

**Server Logic:**
1. Call Stripe: `stripe.checkout.sessions.retrieve(session_id)`
2. Verify ALL of:
   - `payment_status === 'paid'`
   - `amount_total === 1900` (or current price in pence)
   - `currency === 'gbp'`
   - `mode === 'payment'`
3. Get `packId` from `session.client_reference_id`
4. Fetch record from KV
5. If already `paid`, return payload (idempotent)
6. If `pending`, update status to `paid`, set `fulfilledAt`
7. Return payload + recoveryUrl

**Recovery Mode:**
```json
{ "packId": "xxx", "recoveryToken": "xxx" }
```

**Server Logic:**
1. Fetch record from KV
2. Verify token matches
3. Verify not expired (`Date.now() < expiresAt`)
4. Verify status === `paid`
5. Return payload + recoveryUrl

**Response (both modes):**
```json
{
  "input": { /* full StrategyInput */ },
  "results": { /* full StrategyComparison with all 3 strategies */ },
  "user": {
    "email": "user@example.com",
    "companyName": "Acme Ltd",
    "directorName": "John Doe",
    "yearEnd": "2026-03-31"
  },
  "recoveryUrl": "https://payetax.co.uk/recover?packId=xxx&token=xxx"
}
```

> Client reads `results.strategies.allSalary`, `results.strategies.optimalMix`, `results.strategies.allDividends` directly for PDF/CSV generation.

---

## KV Schema

**Key:** `pack:{packId}`

**Value:**
```json
{
  "packId": "uuid",
  "createdAt": "2026-01-30T12:00:00Z",
  "expiresAt": "2026-01-31T12:00:00Z",
  "input": {
    "region": "ruk",
    "revenue": 100000,
    "includesVat": false,
    "expenses": 20000,
    "lossesBroughtForward": 0,
    "otherIncome": 0,
    "employmentAllowance": true,
    "studentLoanPlans": ["plan2"],
    "pensionContribution": 3000,
    "companyCarBIK": 0,
    "minimumSalaryRequirement": 0,
    "hasOtherPAYEEmployment": false
  },
  "results": {
    "grossProfit": 80000,
    "strategies": {
      "allSalary": {
        "name": "All Salary",
        "salary": 67500,
        "dividends": 0,
        "employerNI": 6750,
        "employeeNI": 4500,
        "incomeTax": 12500,
        "corporationTax": 0,
        "dividendTax": 0,
        "studentLoan": 1500,
        "totalPersonalTax": 18500,
        "companyCost": 74250,
        "takeHome": 49000,
        "effectiveRate": 38.75
      },
      "optimalMix": {
        "name": "Recommended",
        "salary": 12570,
        "dividends": 48857,
        "employerNI": 0,
        "employeeNI": 0,
        "incomeTax": 0,
        "corporationTax": 7143,
        "dividendTax": 2843,
        "studentLoan": 800,
        "totalPersonalTax": 3643,
        "companyCost": 19713,
        "takeHome": 57584,
        "effectiveRate": 28.02
      },
      "allDividends": {
        "name": "All Dividends",
        "salary": 0,
        "dividends": 60000,
        "employerNI": 0,
        "employeeNI": 0,
        "incomeTax": 0,
        "corporationTax": 20000,
        "dividendTax": 6000,
        "studentLoan": 500,
        "totalPersonalTax": 6500,
        "companyCost": 20000,
        "takeHome": 53500,
        "effectiveRate": 33.13
      }
    },
    "recommended": "optimalMix",
    "savingsVsAllSalary": 8584
  },
  "user": {
    "email": "user@example.com",
    "companyName": "Acme Ltd",
    "directorName": "John Doe",
    "yearEnd": "2026-03-31"
  },
  "recoveryToken": "random-string",
  "status": "pending | paid",
  "fulfilledAt": null
}
```

**TTL:** 24 hours (auto-delete)

> **Key benefit:** PDF generator reads directly from `results.strategies.*` — no recalculation needed on recovery.

---

## Data Isolation

| Data | In URL? | In KV? | In Client? |
|------|---------|--------|------------|
| session_id | ✅ Success only | ❌ | ❌ |
| packId | ✅ Recovery only | ✅ | ❌ |
| recoveryToken | ✅ Recovery only | ✅ | ❌ |
| salary, dividends, profit | ❌ Never | ✅ | ✅ After verified |
| email, company, director | ❌ Never | ✅ | ✅ After verified |

**PII never in URL. Ever.**

---

## PDF Structure (4 Pages Max)

### Page 1 — Cover
- "Director Tax Pack 2025/26"
- Pack ID (short form)
- Generated timestamp
- Disclaimer: "Illustrative only, not financial advice. Review with accountant."

### Page 2 — Summary
- Recommended strategy (salary + dividends)
- Take-home amount
- Effective tax rate
- Key dates (if year-end provided)
- "Key dates are estimated based on the accounting period end date you entered and standard deadlines; verify with your accountant and HMRC."

### Page 3 — Comparison & Breakdown
- Strategy comparison table (All Salary / Optimal / All Dividends)
- Warnings triggered
- **"What we didn't check" section:**
  - Dividend legality not validated
  - Director loan account not computed
  - VAT not computed
  - Payroll RTI not handled
  - Pension annual allowance not validated

### Page 4 — Templates Overview
- Dividend voucher preview
- Board minute preview
- "Full editable templates included as DOCX files"

---

## ZIP Contents

```
Director-Tax-Pack-2025-26/
├── Tax-Report.pdf
├── Breakdown.csv
├── Dividend-Voucher.pdf
├── Dividend-Voucher.docx
├── Board-Minutes.pdf
└── Board-Minutes.docx
```

---

## CSV Schema

```csv
schema_version,2
generated_at,2026-01-30T12:05:00Z
pack_id,abc123

# Strategy Comparison
Field,All Salary,Recommended,All Dividends
Gross Profit,80000,80000,80000
Salary,67500,12570,0
Dividends,0,48857,60000
Employer NI,6750,0,0
Employee NI,4500,0,0
Income Tax,12500,0,0
Corporation Tax,0,7143,20000
Dividend Tax,0,2843,6000
Student Loan,1500,800,500
Total Personal Tax,18500,3643,6500
Company Cost,74250,19713,20000
Take Home,49000,57584,53500
Effective Rate,38.75%,28.02%,33.13%

# Inputs Used
Input,Value
Region,ruk
Revenue,100000
Expenses,20000
Includes VAT,No
Employment Allowance,Yes
Student Loan Plans,plan2
Pension Contribution,3000
Other Income,0
```

> **Note:** CSV now includes all three strategies for comparison, plus inputs used.

---

## Disclaimers (Required)

### PDF Cover
> "This report is for informational purposes only and does not constitute financial or tax advice. Consult a qualified professional."

### Dividend Voucher
> "You are responsible for ensuring dividends are lawful and correctly documented. This template does not validate distributable reserves."

### Board Minute
> "Illustrative template—customize and verify compliance with a qualified professional."

### Key Dates
> "Estimated based on the accounting period end date you entered and standard deadlines; verify with your accountant and HMRC."

---

## Modal Fields

| Field | Required? | Label | Placeholder |
|-------|-----------|-------|-------------|
| Email | ✅ Yes | "Email (for receipt + recovery)" | "you@company.com" |
| Company name | Recommended | "Company name" | "e.g., Acme Ltd" |
| Director name | Recommended | "Director name" | "e.g., John Doe" |
| Year-end | Recommended | "Accounting period end (from Companies House)" | "e.g., 31 March 2026" |

**Validation:**
- Email: required, valid format
- Year-end: optional, valid date format, reject invalid

---

## Success Page UX

1. Page loads with `?session_id=cs_xxx`
2. POST to `/api/pack` with session_id
3. Show loading state: "Verifying payment..."
4. **If verified:**
   - Generate pack client-side (PDF + CSV + DOCX)
   - Bundle into ZIP
   - Show **"Download Your Tax Pack"** button (not auto-download)
   - Show recovery link: "Save this link to re-download within 24 hours: [copy]"
   - Show warning: "After 24 hours, you'll need to repurchase."
   - Optional feedback: "Did this save you time? [Yes/No]"
5. **If not verified:**
   - Show error: "Payment not verified. If you completed payment, please contact support with your receipt."
   - Show support email link with prefilled packId/session_id
6. **If generation fails:**
   - Show error: "Pack generation failed. Please contact support."
   - Distinguish from payment verification failure

---

## Error States

| State | Message | Action |
|-------|---------|--------|
| Payment not found | "Payment not verified. Contact support with your receipt." | Show support email |
| Payment found but generation fails | "Pack generation failed. Contact support." | Show support email |
| Recovery link expired | "This link has expired (24h limit). Please repurchase." | Link to calculator |
| Recovery token invalid | "Invalid recovery link. Contact support." | Show support email |

---

## Security Checklist

- [x] PII never in URL
- [x] Payload stored server-side (KV)
- [x] Payment verified via Stripe API before release
- [x] Verify amount + currency + mode (not just payment_status)
- [x] Recovery token prevents guessing
- [x] 24h TTL auto-expires records
- [x] Idempotent /api/pack (handles refreshes)
- [x] No user can generate pack without paying

---

## Infrastructure

| Component | Choice | Cost |
|-----------|--------|------|
| KV Store | Vercel KV or Upstash | Free tier (~$0) |
| Payments | Stripe Checkout Session | 1.4% + 20p per txn |
| PDF Generation | @react-pdf/renderer | Free |
| DOCX Generation | docxtemplater (simple templates) | Free |
| ZIP Bundling | JSZip | Free |

---

## Build Estimate

| Task | Time |
|------|------|
| KV setup (Vercel KV) | 1 hour |
| `/api/create-pack` endpoint | Half day |
| `/api/pack` endpoint | Half day |
| Stripe Checkout Session integration | Half day |
| Modal with fields + validation | Half day |
| Success page (verify + generate + error states) | 1 day |
| Recovery page | Half day |
| PDF template (4 pages, simple) | 2 days |
| CSV export with schema | Half day |
| Templates (voucher + minutes, PDF + DOCX) | 1 day |
| ZIP bundling (JSZip) | Half day |
| Testing + edge cases | 1 day |

**Total: 9-10 days**

---

## QA Checklist

Before launch, test:

1. [ ] User pays, refreshes `/success` 5 times quickly (idempotency)
2. [ ] User pays on mobile in-app browser, returns to success page
3. [ ] User pays, closes tab, uses recovery link 10 minutes later
4. [ ] User tries recovery link after 25 hours (should fail gracefully)
5. [ ] User tries `/api/pack` with unpaid session_id (should reject)
6. [ ] Year-end blank → key dates omitted gracefully
7. [ ] Very large numbers (profit £1m) → PDF still fits 4 pages
8. [ ] Long company/director names → DOCX/PDF don't break layout
9. [ ] Special characters in names → handled correctly
10. [ ] Mobile Safari ZIP download works

---

## Validation Target

- 1k users/month currently
- 1-2% conversion = 10-20 sales/month
- £190-380/month at £19
- **First sale = signal. 10+ sales = validated.**

---

## V1 vs V1.1

| Feature | V1 | V1.1 |
|---------|----|----|
| KV storage | ✅ | ✅ |
| Payment verification | ✅ | ✅ |
| 24h recovery | ✅ | ✅ |
| Email delivery | ❌ | ✅ |
| .ics calendar | ❌ | ✅ |
| Stripe webhooks | ❌ | ✅ (email recovery if user drops) |

---

## Approval

| Reviewer | Verdict | Date |
|----------|---------|------|
| Grok | ✅ Approved | 2026-01-30 |
| Gemini | ✅ Approved | 2026-01-30 |
| ChatGPT | ✅ Approved | 2026-01-30 |

**Status: UNANIMOUSLY APPROVED FOR BUILD**

---

*Spec version: 3.1 — Production Ready*
*Last updated: 2026-01-30*
