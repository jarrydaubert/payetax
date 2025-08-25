# Enhanced Manual Test Suite for ToolHubX UK Tax Calculator

**Version:** 1.0  
**Last Updated:** August 24, 2025  
**Purpose:** This document provides a structured manual testing checklist for the ToolHubX UK Tax Calculator. It organizes test cases into clear sections with unique IDs, descriptions, steps, expected results, and status tracking. This format improves traceability, allows for easier updates, and supports adding actual results during testing.

- **Test Case Structure:**
  - **ID:** Unique identifier (e.g., CORE-001).
  - **Description:** Brief overview of what is being tested.
  - **Preconditions:** Setup required before testing.
  - **Steps:** Detailed actions to perform.
  - **Expected Result:** What should happen.
  - **Status:** Pass/Fail/Not Tested (with space for notes).
  - **Priority:** High/Medium/Low (based on criticality).

- **Execution Notes:**
  - Test in the order of priority (High → Medium → Low).
  - Use realistic data where possible.
  - Document bugs with screenshots, steps to reproduce, and severity.
  - Run tests across specified browsers and devices.

Use the following Markdown table format for each section to make it scannable. Checkboxes can still be used for quick status updates, but tables provide better organization.

---

## 🎯 CORE CALCULATOR TESTING

### Input Validation & Edge Cases

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| CORE-001 | Negative salary values      | Calculator form loaded | 1. Enter negative salary (e.g., -1000). <br>2. Attempt calculation. | Error message displayed; submission prevented. | [ ] | High |
| CORE-002 | Zero salary (£0)            | Calculator form loaded | 1. Enter £0 salary. <br>2. Calculate. | Correct calculation (zero tax/NI/etc.); no errors. | [ ] | High |
| CORE-003 | Maximum realistic salary (£1,000,000+) | Calculator form loaded | 1. Enter £1,000,000+. <br>2. Calculate. | Handles gracefully; accurate high-rate tax applied. | [ ] | Medium |
| CORE-004 | Decimal salary values (£45,500.50) | Calculator form loaded | 1. Enter £45,500.50. <br>2. Calculate. | Formats correctly; accurate results. | [ ] | Medium |
| CORE-005 | Invalid characters in salary (letters/symbols) | Calculator form loaded | 1. Enter invalid input (e.g., "abc"). <br>2. Attempt calculation. | Input prevented or error shown; no crash. | [ ] | High |
| CORE-006 | Very large salary (£999,999,999) | Calculator form loaded | 1. Enter £999,999,999. <br>2. Calculate. | No breakage; results displayed (even if capped). | [ ] | Low |

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| CORE-007 | Tax year 2023-24 calculations | Calculator form loaded | 1. Select 2023-24. <br>2. Enter salary and calculate. | Uses correct thresholds/rates for year. | [ ] | High |
| CORE-008 | Tax year 2024-25 calculations | Calculator form loaded | 1. Select 2024-25. <br>2. Enter salary and calculate. | Uses correct thresholds/rates for year. | [ ] | High |
| CORE-009 | Tax year 2025-26 calculations | Calculator form loaded | 1. Select 2025-26. <br>2. Enter salary and calculate. | Uses correct thresholds/rates for year. | [ ] | High |
| CORE-010 | Different tax thresholds per year | Multiple tax years available | 1. Switch years and recalculate with same salary. | Thresholds update; results differ accordingly. | [ ] | Medium |
| CORE-011 | Scottish vs English rates toggle | Calculator form loaded | 1. Toggle Scottish rates. <br>2. Calculate. | Applies Scottish/English rates correctly. | [ ] | High |

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| CORE-012 | Scottish rates enabled with brackets | Scottish toggle available | 1. Enable Scottish. <br>2. Enter salary crossing brackets. <br>3. Calculate. | Different brackets applied accurately. | [ ] | High |
| CORE-013 | Scottish rates disabled (default English) | Scottish toggle available | 1. Disable Scottish. <br>2. Calculate. | Default English/Welsh/NI rates used. | [ ] | High |
| CORE-014 | Rate differences applied correctly | Scottish toggle available | 1. Toggle and compare results. | Differences in tax due reflected. | [ ] | Medium |
| CORE-015 | Rate descriptions update | Scottish toggle available | 1. Toggle Scottish. | UI descriptions update to match rates. | [ ] | Low |

### Advanced Input Options

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| CORE-016 | Percentage-based pension (5%, 10%, 15%) | Pension fields available | 1. Enter percentage. <br>2. Calculate. | Correct deduction and relief applied. | [ ] | High |
| CORE-017 | Fixed amount pension (£100, £500, £1000) | Pension fields available | 1. Enter fixed amount. <br>2. Calculate. | Correct deduction and relief applied. | [ ] | High |
| CORE-018 | Maximum pension allowance (£60,000 limit) | Pension fields available | 1. Enter amount near/exceeding limit. <br>2. Calculate. | Handles limit; no excess relief. | [ ] | Medium |
| CORE-019 | Tax relief on pension applied | Pension fields available | 1. Enter contribution. <br>2. Check results. | Relief reduces tax correctly. | [ ] | High |
| CORE-020 | Employer pension matching scenarios | Employer matching option | 1. Enable matching. <br>2. Calculate. | Matching added to total pension. | [ ] | Medium |

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| CORE-021 | Student Loan Plan 1 (pre-2012) | Student loan options | 1. Select Plan 1. <br>2. Enter salary above £22,015. <br>3. Calculate. | 9% deduction above threshold. | [ ] | High |
| CORE-022 | Student Loan Plan 2 (2012+) | Student loan options | 1. Select Plan 2. <br>2. Enter salary above £27,295. <br>3. Calculate. | 9% deduction above threshold. | [ ] | High |
| CORE-023 | Student Loan Plan 4 (Scotland) | Student loan options | 1. Select Plan 4. <br>2. Enter salary above £31,395. <br>3. Calculate. | 9% deduction above threshold. | [ ] | High |
| CORE-024 | Student Loan Plan 5 (2023+) | Student loan options | 1. Select Plan 5. <br>2. Enter salary above £25,000. <br>3. Calculate. | 9% deduction above threshold. | [ ] | High |
| CORE-025 | Postgraduate loan | Student loan options | 1. Select Postgraduate. <br>2. Enter salary above £21,000. <br>3. Calculate. | 6% deduction above threshold. | [ ] | Medium |
| CORE-026 | Multiple student loan plans | Student loan options | 1. Select multiple plans. <br>2. Calculate. | Combined deductions accurate. | [ ] | Medium |
| CORE-027 | No student loan selected | Student loan options | 1. Deselect all. <br>2. Calculate. | No deductions for loans. | [ ] | Low |

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| CORE-028 | NI Category A (Standard)    | NI categories available | 1. Select Category A. <br>2. Calculate. | Standard employee rates applied. | [ ] | High |
| CORE-029 | NI Category B (Married women reduced) | NI categories available | 1. Select Category B. <br>2. Calculate. | Reduced rates applied. | [ ] | Medium |
| CORE-030 | NI Category C (Over pension age) | NI categories available | 1. Select Category C. <br>2. Calculate. | No NI if over age. | [ ] | Medium |
| CORE-031 | NI Category H (Apprentices under 25) | NI categories available | 1. Select Category H. <br>2. Calculate. | Reduced rates for apprentices. | [ ] | Medium |
| CORE-032 | NI rate differences applied | NI categories available | 1. Switch categories and compare. | Rates update correctly. | [ ] | High |

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| CORE-033 | Personal allowance adjustments | Allowances options | 1. Adjust personal allowance. <br>2. Calculate. | Tax-free amount updated. | [ ] | High |
| CORE-034 | Marriage allowance transfers | Allowances options | 1. Enable marriage allowance. <br>2. Calculate. | Transfer applied correctly. | [ ] | Medium |
| CORE-035 | Blind person's allowance    | Allowances options | 1. Enable blind allowance. <br>2. Calculate. | Additional allowance added. | [ ] | Medium |
| CORE-036 | Combined multiple allowances | Allowances options | 1. Enable multiple. <br>2. Calculate. | All combined accurately. | [ ] | High |

### Calculation Accuracy

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| CORE-037 | £25,000 salary (basic rate) | Calculator loaded | 1. Enter £25,000. <br>2. Calculate. | Matches expected basic rate tax. | [ ] | High |
| CORE-038 | £55,000 salary (higher threshold) | Calculator loaded | 1. Enter £55,000. <br>2. Calculate. | Higher rate applied correctly. | [ ] | High |
| CORE-039 | £125,000 salary (additional rate + taper) | Calculator loaded | 1. Enter £125,000. <br>2. Calculate. | Additional rate and taper accurate. | [ ] | High |
| CORE-040 | £200,000 salary (maximum rates) | Calculator loaded | 1. Enter £200,000. <br>2. Calculate. | Max rates applied. | [ ] | Medium |
| CORE-041 | Cross-reference with HMRC calculator | HMRC tool available | 1. Run same inputs on HMRC. <br>2. Compare. | Results match within reasonable tolerance. | [ ] | High |

---

## 📊 RESULTS DISPLAY TESTING

### Table Presentation

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| RESULTS-001 | Column alignment            | Results table displayed | 1. View table on desktop/mobile. | Headers align with columns; no misalignment. | [ ] | High |
| RESULTS-002 | No text wrapping in cells   | Results table displayed | 1. Enter long values. <br>2. View table. | No wrapping; content fits or truncates. | [ ] | Medium |
| RESULTS-003 | Consistent spacing/padding  | Results table displayed | 1. Inspect table. | Uniform padding/spacing. | [ ] | Low |
| RESULTS-004 | Icons display next to categories | Results table displayed | 1. View categories. | Icons visible and correct. | [ ] | Medium |
| RESULTS-005 | Numbers right-aligned       | Results table displayed | 1. View numeric columns. | All numbers right-aligned. | [ ] | High |

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| RESULTS-006 | Annual view shows yearly amounts | Period selector available | 1. Select Annual. <br>2. View results. | Yearly totals displayed. | [ ] | High |
| RESULTS-007 | Monthly view divides by 12  | Period selector available | 1. Select Monthly. <br>2. View results. | Accurate monthly breakdown. | [ ] | High |
| RESULTS-008 | Weekly view divides by 52   | Period selector available | 1. Select Weekly. <br>2. View results. | Accurate weekly breakdown. | [ ] | High |
| RESULTS-009 | Daily view divides by 365   | Period selector available | 1. Select Daily. <br>2. View results. | Accurate daily breakdown. | [ ] | Medium |
| RESULTS-010 | Switching periods maintains accuracy | Period selector available | 1. Switch periods multiple times. | Data accurate; no discrepancies. | [ ] | High |

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| RESULTS-011 | Income Tax (red) display    | Results calculated | 1. View Income Tax row. | Correct amount in red (text-red-400). | [ ] | High |
| RESULTS-012 | National Insurance (yellow) | Results calculated | 1. View NI row. | Correct amount in yellow (text-yellow-400). | [ ] | High |
| RESULTS-013 | Student Loans (blue)        | Student loans selected | 1. View loans row. | Accurate in blue (text-blue-400). | [ ] | Medium |
| RESULTS-014 | Pension (purple)            | Pension entered | 1. View pension row. | Relief shown in purple (text-purple-400). | [ ] | Medium |
| RESULTS-015 | Net Pay (green)             | Results calculated | 1. View net pay. | Final amount in green (text-green-400). | [ ] | High |
| RESULTS-016 | Employer NI (gray)          | Results calculated | 1. View employer NI. | Contributions in gray. | [ ] | Medium |

### Visual Consistency

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| RESULTS-017 | Color coding consistency    | Results displayed | 1. View all categories. | Colors match specified (red/yellow/etc.). | [ ] | High |
| RESULTS-018 | Typography & spacing        | Results displayed | 1. Inspect text. | Consistent sizes (xs/sm); proper spacing. | [ ] | Medium |
| RESULTS-019 | Bold headers, regular data  | Results displayed | 1. View table. | Headers bold; data regular. | [ ] | Low |
| RESULTS-020 | Readable contrast ratios    | Results displayed | 1. Use contrast checker tool. | All text meets WCAG AA standards. | [ ] | High |

---

## 📄 EXPORT FUNCTIONALITY TESTING

### Excel Export

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| EXPORT-001 | File generation             | Results calculated | 1. Click Export to Excel. | .xlsx file downloads correctly. | [ ] | High |
| EXPORT-002 | File opens without errors   | Excel/LibreOffice installed | 1. Open downloaded file. | Opens cleanly; no errors. | [ ] | High |
| EXPORT-003 | All data included           | Results calculated | 1. Check exported file. | All calculations/inputs present. | [ ] | Medium |
| EXPORT-004 | Proper headers/formatting   | Exported file open | 1. Inspect sheet. | Headers/formatting match display. | [ ] | Medium |

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| EXPORT-005 | Input parameters captured   | Exported file open | 1. Check inputs section. | All parameters accurate. | [ ] | High |
| EXPORT-006 | Results match display       | Exported file open | 1. Compare to UI. | Exact match. | [ ] | High |
| EXPORT-007 | Formulas preserved (if applicable) | Exported file open | 1. Check cells. | Formulas intact where used. | [ ] | Low |
| EXPORT-008 | Multiple period views included | Exported file open | 1. Check sheets/sections. | All selected periods present. | [ ] | Medium |

### Print Functionality

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| EXPORT-009 | Print preview layout        | Results displayed | 1. Trigger print preview. | Single-page; colors preserved. | [ ] | High |
| EXPORT-010 | Table fits margins          | Print preview open | 1. Check layout. | No cutoff/wrapping. | [ ] | Medium |
| EXPORT-011 | Print output appearance     | Printer available | 1. Print page. | Professional; all data readable. | [ ] | High |
| EXPORT-012 | Branding/headers/footer present | Printed page | 1. Inspect output. | Company branding and footer included. | [ ] | Low |

---

## 🧪 FORM TESTING & VALIDATION

### Feedback Form

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| FORM-001 | Name field required         | Feedback form loaded | 1. Submit without name. | Validation error; submission prevented. | [ ] | High |
| FORM-002 | Email format validation     | Feedback form loaded | 1. Enter invalid email. <br>2. Submit. | Error for invalid format. | [ ] | High |
| FORM-003 | Message field required/limits | Feedback form loaded | 1. Submit empty/long message. | Required error; character limit enforced. | [ ] | Medium |
| FORM-004 | Submission success/error states | Feedback form loaded | 1. Submit valid/invalid form. | Success confirmation or error displayed. | [ ] | High |

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| FORM-005 | Clear error messages        | Feedback form loaded | 1. Trigger errors. | Messages clear and visible. | [ ] | Medium |
| FORM-006 | Form reset functionality    | Feedback form loaded | 1. Fill and reset. | Fields cleared. | [ ] | Low |
| FORM-007 | Loading states during submission | Feedback form loaded | 1. Submit form. | Loading indicator shown. | [ ] | Medium |
| FORM-008 | Success confirmation        | Feedback form loaded | 1. Submit valid. | Confirmation displayed. | [ ] | High |

### Calculator Input Form

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| FORM-009 | Real-time validation for salary | Calculator form loaded | 1. Enter invalid salary. | Prevented or error shown immediately. | [ ] | High |
| FORM-010 | Dropdown selections work    | Calculator form loaded | 1. Select options (e.g., tax year). | Selections update UI. | [ ] | Medium |
| FORM-011 | Checkbox states toggle      | Calculator form loaded | 1. Toggle checkboxes (e.g., Scottish). | States change correctly. | [ ] | Medium |
| FORM-012 | Input focus and tab order   | Calculator form loaded | 1. Tab through fields. | Logical order; focus visible. | [ ] | High |

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| FORM-013 | Clear error messages for inputs | Calculator form loaded | 1. Trigger errors. | Messages appear and disappear on correction. | [ ] | High |
| FORM-014 | Prevent submission with errors | Calculator form loaded | 1. Submit with errors. | Submission blocked. | [ ] | High |
| FORM-015 | No JavaScript console errors | Dev tools open | 1. Interact with form. | Console clean; no errors. | [ ] | High |

---

## 🌐 NAVIGATION & PAGE TESTING

### Core Pages

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| NAV-001  | Homepage calculator loads   | Site loaded | 1. Visit homepage. | Calculator functions correctly. | [ ] | High |
| NAV-002  | Hero section displays       | Site loaded | 1. View hero. | Proper display; no issues. | [ ] | Medium |
| NAV-003  | Call-to-action buttons work | Site loaded | 1. Click CTAs. | Navigate or trigger actions correctly. | [ ] | High |
| NAV-004  | Page contact information    | Site loaded | 1. Scroll to contact. | Info visible and accurate. | [ ] | Low |

### Error Pages

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| NAV-005  | 404 Not Found page          | Invalid URL | 1. Navigate to invalid page. | Custom 404 displays with navigation. | [ ] | High |
| NAV-006  | Animated background on 404  | 404 page loaded | 1. View page. | Animation works. | [ ] | Low |
| NAV-007  | Search/suggestions on 404   | 404 page loaded | 1. Use search. | Suggestions or search available. | [ ] | Medium |
| NAV-008  | Global error handling       | Error triggered (e.g., JS error) | 1. Trigger error. | Boundary catches; recovery options shown. | [ ] | High |

---

## 📱 RESPONSIVE DESIGN TESTING

### Mobile Devices (320px - 768px)

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| RESP-001 | Calculator usability        | Mobile viewport | 1. Use form/table. | Inputs sized; table scrolls if needed. | [ ] | High |
| RESP-002 | Buttons large for touch     | Mobile viewport | 1. Tap buttons. | Easy to tap; no misses. | [ ] | High |
| RESP-003 | Text readable               | Mobile viewport | 1. View content. | No zooming required. | [ ] | Medium |
| RESP-004 | Navigation menu functions   | Mobile viewport | 1. Open menu. | Works; touch targets appropriate. | [ ] | High |
| RESP-005 | No horizontal overflow      | Mobile viewport | 1. Scroll horizontally. | Content fits screen. | [ ] | High |

### Tablet Devices (768px - 1024px)

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| RESP-006 | Layout adaptation           | Tablet viewport | 1. View pages. | Content scales; table readable. | [ ] | High |
| RESP-007 | Sidebar/navigation adapts   | Tablet viewport | 1. Navigate. | Adapts correctly. | [ ] | Medium |
| RESP-008 | Touch interactions smooth   | Tablet viewport | 1. Interact. | No issues. | [ ] | High |

### Desktop (1024px+)

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| RESP-009 | Content doesn't stretch     | Desktop viewport | 1. Maximize window. | Max width respected. | [ ] | Medium |
| RESP-010 | Multi-column layouts        | Desktop viewport | 1. View layouts. | Columns work correctly. | [ ] | High |
| RESP-011 | Table utilizes space        | Desktop viewport | 1. View table. | Fits well; no waste. | [ ] | Low |

---

## 🔧 CROSS-BROWSER TESTING

### Modern Browsers

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| BROWSER-001 | Chrome (Latest)             | Chrome open | 1. Run all core tests. | All work; no errors/warnings. | [ ] | High |
| BROWSER-002 | Firefox (Latest)            | Firefox open | 1. Run all core tests. | Feature parity; layouts correct. | [ ] | High |
| BROWSER-003 | Safari (Latest)             | Safari open | 1. Run all core tests. | Compatibility; no performance issues. | [ ] | High |
| BROWSER-004 | Edge (Latest)               | Edge open | 1. Run all core tests. | Consistency; no legacy issues. | [ ] | High |

### Mobile Browsers

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| BROWSER-005 | iOS Safari                  | iOS device | 1. Run responsive tests. | Touch smooth; viewport correct. | [ ] | High |
| BROWSER-006 | Chrome Mobile               | Android device | 1. Run responsive tests. | Compatibility; performance acceptable. | [ ] | High |

---

## ⚡ PERFORMANCE TESTING

### Page Load Metrics

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| PERF-001 | Core Web Vitals             | Dev tools open | 1. Measure FCP/LCP/CLS/FID. | FCP <2.5s; LCP <2.5s; CLS <0.1; FID <100ms. | [ ] | High |
| PERF-002 | Loading experience          | Site loaded | 1. Time initial render. | Quick render; no blocking resources. | [ ] | Medium |

### Runtime Performance

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| PERF-003 | Calculator response time    | Form filled | 1. Calculate. | Completes <500ms; UI immediate. | [ ] | High |
| PERF-004 | Navigation performance      | Multiple pages | 1. Navigate. | Smooth; no re-renders. | [ ] | Medium |
| PERF-005 | Memory usage                | Dev tools open | 1. Monitor during use. | Reasonable; no leaks. | [ ] | Low |

---

## 🔐 ACCESSIBILITY TESTING

### Keyboard Navigation

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| A11Y-001 | Tab order logical           | Keyboard only | 1. Tab through form. | Sequence logical; all reachable. | [ ] | High |
| A11Y-002 | Skip links (if applicable)  | Keyboard only | 1. Use skip links. | Available and functional. | [ ] | Medium |
| A11Y-003 | Focus indicators visible    | Keyboard only | 1. Tab to elements. | Clear focus outlines. | [ ] | High |
| A11Y-004 | Keyboard shortcuts          | Keyboard only | 1. Use Enter/Esc/Arrows/Space. | Forms submit; modals close; etc. | [ ] | Medium |

### Screen Reader Compatibility

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| A11Y-005 | ARIA labels on inputs/buttons | Screen reader (e.g., NVDA) | 1. Navigate form. | Proper labels announced. | [ ] | High |
| A11Y-006 | Complex UI has ARIA attributes | Screen reader | 1. Read complex components. | Attributes read correctly. | [ ] | Medium |
| A11Y-007 | Error messages announced    | Screen reader | 1. Trigger errors. | Errors read aloud. | [ ] | High |
| A11Y-008 | Semantic HTML (headings/lists/tables) | Screen reader | 1. Navigate structure. | Proper hierarchy; markup used. | [ ] | High |

### Visual Accessibility

| ID       | Description                  | Preconditions | Steps | Expected Result | Status (Pass/Fail/Notes) | Priority |
|----------|------------------------------|---------------|-------|-----------------|--------------------------|----------|
| A11Y-009 | Color contrast meets WCAG AA | Contrast checker tool | 1. Check text/elements. | 4.5:1 ratio minimum. | [ ] | High |
| A11Y-010 | Interactive elements visible | High contrast mode | 1. View in high contrast. | Clearly visible. | [ ] | Medium |
| A11Y-011 | Info not by color alone     | Color blind simulator | 1. Simulate color blindness. | Distinguishable without color. | [ ] | High |
| A11Y-012 | Icons have text alternatives | Screen reader | 1. Read icons. | Alt text or labels announced. | [ ] | Medium |

---

## 📋 TEST EXECUTION CHECKLIST

### Pre-Testing Setup
- [ ] Clear browser cache and cookies
- [ ] Test with JavaScript enabled/disabled
- [ ] Test with ad blockers enabled
- [ ] Use incognito/private browsing mode

### During Testing
- [ ] Record all bugs with steps to reproduce
- [ ] Take screenshots of visual issues
- [ ] Note performance observations
- [ ] Test with realistic data scenarios

### Post-Testing
- [ ] Compile comprehensive bug report
- [ ] Prioritize issues by severity
- [ ] Verify all test cases completed
- [ ] Document any test environment issues

---

## 🏆 ACCEPTANCE CRITERIA

### Must Pass (P0)
- [ ] All core calculator functions work correctly
- [ ] No JavaScript errors in console
- [ ] Responsive design functions on all devices
- [ ] Basic accessibility requirements met

### Should Pass (P1)
- [ ] Performance meets target metrics
- [ ] All export functions work correctly
- [ ] Advanced accessibility features work
- [ ] Cross-browser compatibility confirmed

### Nice to Have (P2)
- [ ] Progressive enhancement works
- [ ] PWA features function (if enabled)
- [ ] Advanced keyboard shortcuts work
- [ ] Offline functionality (if applicable)

---

**Testing Notes:**
- Execute tests in order of priority (P0 → P1 → P2).
- Document any deviations or additional findings.
- Update this checklist as new features are added.
- Coordinate with development team for bug fixes.

This tabular format makes the test suite easier to read, update, and track. You can copy this into your MANUAL_TEST_SUITE.md file. If you need it in a different format (e.g., Google Sheets exportable), let me know!