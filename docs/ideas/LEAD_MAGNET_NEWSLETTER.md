# Lead Magnet for Newsletter Signup

## The Problem

Currently, PayeTax's newsletter signup just asks for an email with minimal value proposition:
- Footer: "Get tax updates" placeholder
- Card variant: "New tax rates, deadlines, and tips delivered to your inbox"

This violates the **Reciprocity Principle**: users are asked to give (email) without receiving something tangible first.

---

## The Solution: UK Tax Planning Checklist

Create a downloadable PDF that users get immediately when they subscribe. This transforms the newsletter signup from "give me your email" to "get this valuable resource."

### Lead Magnet Options

| Option | Effort | Value | Recommendation |
|--------|--------|-------|----------------|
| **UK Tax Planning Checklist 2025/26** | Low | High | Recommended |
| Annual Tax Calendar PDF | Low | Medium | Good alternative |
| "What's New in Tax 2025/26" Guide | Medium | High | Second choice |
| Salary Negotiation Guide | Medium | High | Future expansion |

### Recommended: UK Tax Planning Checklist 2025/26

**Contents (1-2 page PDF):**
1. Key tax deadlines (Self-Assessment, P60, etc.)
2. Personal allowance reminder (£12,570)
3. Tax band quick reference
4. Pension contribution checklist (maximize relief)
5. Marriage allowance eligibility check
6. Student loan threshold reminder
7. "Check your tax code" reminder with steps

**Why this works:**
- Evergreen content (update annually)
- Actionable checklist format
- Covers topics PayeTax calculator handles
- Drives users back to the calculator

---

## Implementation Plan

### Phase 1: Create the Lead Magnet

**File**: Create checklist content (Markdown or design file)
**Location**: `/public/downloads/uk-tax-planning-checklist-2025-26.pdf`

### Phase 2: Update Newsletter Signup Component

**File**: `src/components/molecules/NewsletterSignup.tsx`

**Changes:**
1. Add new `leadMagnet` variant alongside existing card/inline/minimal
2. Update copy to mention the checklist
3. Show download link on success

**New copy:**
```
Heading: "Free Tax Planning Checklist"
Subhead: "Get our 2025/26 UK tax checklist plus monthly updates"
CTA: "Get Free Checklist"
Success: "Check your email for the download link!"
```

### Phase 3: Update Newsletter API

**File**: `src/app/api/newsletter/subscribe/route.ts`

**Changes:**
1. Accept optional `leadMagnet` parameter
2. Send different email template with PDF attachment or download link
3. Track lead magnet vs regular signups for analytics

### Phase 4: Deploy Lead Magnet Signup

**Locations to add:**
1. Homepage hero area (high visibility)
2. After calculator results (peak engagement)
3. Blog post sidebars (existing card variant)
4. Dedicated landing page `/free-tax-checklist`

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/molecules/NewsletterSignup.tsx` | Add leadMagnet variant with new copy |
| `src/app/api/newsletter/subscribe/route.ts` | Handle lead magnet email template |
| `src/components/pages/HomePageContent.tsx` | Add lead magnet CTA above fold |
| `src/components/organisms/CalculatorResults/` | Add post-results lead magnet offer |
| `/public/downloads/` | Add PDF file |

---

## Verification

1. Subscribe with test email
2. Verify email received with download link
3. Confirm PDF downloads correctly
4. Check analytics tracking distinguishes lead magnet signups

---

## Copywriting Options

### Hero Placement
```
Get Your Free Tax Planning Checklist
Everything you need to know about UK taxes in 2025/26.
Key deadlines, allowances, and money-saving tips.
[Get Free Checklist] - just enter your email
```

### Post-Calculator Placement
```
Save your calculation + get our tax checklist
We'll email your results plus our free UK tax planning guide.
[Email with Checklist]
```

### Blog Sidebar
```
Free: UK Tax Checklist 2025/26
Deadlines, allowances, and tips in one PDF.
[Download Free]
```

---

## Psychology Principles Applied

| Principle | How It's Used |
|-----------|---------------|
| **Reciprocity** | Give checklist first, then user gives email |
| **Loss Aversion** | "Don't miss deadlines" framing |
| **Authority** | HMRC-accurate rates and deadlines |
| **Specificity** | Exact figures (£12,570 allowance, 31 Jan deadline) |
| **Activation Energy** | Low friction - just email for instant value |
