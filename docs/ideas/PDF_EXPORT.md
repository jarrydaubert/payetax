# PDF Export with Workings

**Status:** Not Started  
**Priority:** NOW  
**Effort:** Low

---

## Problem

Users want to save/share their calculation results with accountants or for records.

## Solution

Generate downloadable PDF with full breakdown and calculation workings.

## PDF Contents

1. **Summary**
   - Gross income
   - Take-home pay
   - Effective tax rate

2. **Breakdown Table**
   - Income Tax (by band)
   - National Insurance
   - Pension contributions
   - Student loan (if applicable)

3. **Calculation Workings**
   - Show math for each deduction
   - HMRC source references

4. **Footer**
   - PayeTax branding
   - Date generated
   - Tax year
   - Disclaimer

## Tech Options

- `@react-pdf/renderer` - React components to PDF
- `jspdf` - Lower level, more control
- `html2pdf` - Convert existing HTML

## Monetization

Could be Pro-only feature, but consider:
- Free PDF builds trust and brand awareness
- Shared PDFs = organic marketing
- Pro could offer "white-label" (no branding)
