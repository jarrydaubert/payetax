---
name: accessibility
version: 1.1.0
description: When discussing accessibility, WCAG compliance, screen readers, keyboard navigation, a11y audits, or inclusive design. PayeTax targets WCAG 2.2 AA compliance.
---

# Accessibility for PayeTax

You are an accessibility expert. Your goal is to ensure PayeTax is usable by everyone, regardless of ability, meeting WCAG 2.2 AA standards.

## PayeTax Context

**Target Standard:** WCAG 2.2 AA
**Key Challenge:** Calculator with multiple inputs and dynamic results
**Testing:** axe-core in E2E tests (`e2e/accessibility-wcag22.spec.ts`)

## WCAG 2.2 AA Checklist

### 1. Perceivable

#### 1.1 Text Alternatives
- [ ] All images have meaningful `alt` text
- [ ] Decorative images use `alt=""` or `aria-hidden="true"`
- [ ] Icons have accessible labels
- [ ] Charts have text alternatives

#### 1.3 Adaptable
- [ ] Semantic HTML: `<header>`, `<main>`, `<nav>`, `<section>`
- [ ] Headings in logical order (h1 → h2 → h3)
- [ ] Form inputs have associated labels
- [ ] Tables have headers and captions

#### 1.4 Distinguishable
- [ ] Color contrast ≥4.5:1 for normal text
- [ ] Color contrast ≥3:1 for large text (18pt+)
- [ ] Color contrast ≥3:1 for UI components
- [ ] Information not conveyed by color alone
- [ ] Text resizable to 200% without loss
- [ ] No horizontal scroll at 320px width

### 2. Operable

#### 2.1 Keyboard Accessible
- [ ] All functionality via keyboard
- [ ] No keyboard traps
- [ ] Logical tab order
- [ ] Skip link to main content
- [ ] Visible focus indicators
- [ ] Custom components keyboard operable

#### 2.4 Navigable
- [ ] Descriptive page `<title>`
- [ ] Descriptive link text (not "click here")
- [ ] Headings describe content
- [ ] Focus indicator visible (2px+ outline)

#### 2.5 Input Modalities
- [ ] Touch targets ≥44x44px
- [ ] Motion activation can be disabled

### 3. Understandable

#### 3.1 Readable
- [ ] Page language specified (`<html lang="en-GB">`)

#### 3.2 Predictable
- [ ] Consistent navigation
- [ ] No unexpected context changes

#### 3.3 Input Assistance
- [ ] Errors clearly identified
- [ ] Error messages descriptive
- [ ] Labels for all inputs
- [ ] Error prevention for important actions

### 4. Robust

#### 4.1 Compatible
- [ ] Valid HTML
- [ ] ARIA used correctly
- [ ] Custom components have proper roles
- [ ] Status messages use `aria-live`

## Calculator-Specific A11y

### Input Accessibility
```html
<!-- Salary input -->
<label for="salary">Annual salary</label>
<input
  id="salary"
  type="text"
  inputmode="numeric"
  aria-describedby="salary-hint salary-error"
/>
<span id="salary-hint">Enter amount in pounds, e.g. 50000</span>
<span id="salary-error" role="alert" aria-live="polite">
  <!-- Error message when invalid -->
</span>
```

### Results Announcement
```html
<!-- Announce results to screen readers -->
<div
  aria-live="polite"
  aria-atomic="true"
  role="status"
>
  Your take-home pay is £32,320 per year
</div>
```

### Period Toggle
```html
<div role="group" aria-label="View results by period">
  <button aria-pressed="true">Yearly</button>
  <button aria-pressed="false">Monthly</button>
  <button aria-pressed="false">Weekly</button>
</div>
```

### Results Table
```html
<table aria-label="Tax breakdown for £50,000 salary">
  <caption class="sr-only">
    Detailed breakdown of tax, NI, and deductions
  </caption>
  <thead>
    <tr>
      <th scope="col">Deduction</th>
      <th scope="col">Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Income Tax</th>
      <td>£7,486</td>
    </tr>
  </tbody>
</table>
```

## ARIA Patterns

### Landmarks
```html
<header role="banner">
<nav role="navigation" aria-label="Main">
<main role="main">
<footer role="contentinfo">
```

### Expandable Sections
```html
<button
  aria-expanded="false"
  aria-controls="advanced-options"
>
  Advanced options
</button>
<div id="advanced-options" hidden>
  <!-- Options content -->
</div>
```

### Error States
```html
<input
  aria-invalid="true"
  aria-errormessage="error-msg"
/>
<span id="error-msg" role="alert">
  Please enter a valid salary
</span>
```

### Loading States
```html
<div aria-busy="true" aria-live="polite">
  Calculating your results...
</div>
```

## Testing Approaches

### Automated (axe-core)
```typescript
// e2e/accessibility-wcag22.spec.ts
import AxeBuilder from '@axe-core/playwright';

test('calculator is accessible', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

### Manual Testing Checklist
1. **Keyboard only:** Tab through entire page
2. **Screen reader:** Test with VoiceOver (Mac) or NVDA (Windows)
3. **Zoom:** Test at 200% and 400% zoom
4. **High contrast:** Windows high contrast mode
5. **Reduced motion:** `prefers-reduced-motion: reduce`
6. **Mobile:** Touch target sizes

### Screen Reader Testing Script
```
1. Navigate to homepage
2. Verify page title announced
3. Tab to salary input
4. Enter value, verify hint read
5. Tab to calculate/results
6. Verify results announced
7. Navigate results table
8. Verify all values accessible
```

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Missing form labels | Add `<label>` with `for` attribute |
| Low contrast | Use OKLCH with sufficient lightness difference |
| No focus indicator | Add `:focus-visible` outline style |
| Results not announced | Add `aria-live="polite"` region |
| Table not navigable | Add `scope` to header cells |
| Touch target too small | Minimum 44x44px clickable area |

## CSS Considerations

### Focus Styles
```css
:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Reader Only
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
```

### High Contrast Support
```css
@media (prefers-contrast: more) {
  :root {
    --border-color: CanvasText;
    --focus-ring: Highlight;
  }
}
```

## Key Files

- `src/app/layout.tsx` - Language, skip link
- `src/components/templates/Layout.tsx` - Landmarks
- `src/components/organisms/SimpleNavbar.tsx` - Navigation a11y
- `src/components/organisms/CalculatorContainer.tsx` - Form a11y
- `src/components/organisms/CalculatorResults/` - Results a11y
- `e2e/accessibility-wcag22.spec.ts` - A11y tests
- `src/app/globals.css` - Focus styles, sr-only

### Accessibility Guardrails
- Prioritize shipped flows first (homepage calculator, salary pages, Director Intelligence).
- Keep decorative icons hidden from screen readers with `aria-hidden="true"`.
- Any new interactive control must be keyboard operable and have visible focus styles.
