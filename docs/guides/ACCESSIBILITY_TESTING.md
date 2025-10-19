# Accessibility Testing with jest-axe

**Added:** January 17, 2025  
**Tool:** [jest-axe](https://github.com/nickcolley/jest-axe) v10.0.0  
**Status:** ✅ Configured & Ready

---

## Overview

We use **jest-axe** for automated accessibility testing. It integrates the industry-standard [axe-core](https://github.com/dequelabs/axe-core) engine into our Jest tests to catch WCAG violations early.

### Why jest-axe?

- ✅ **100% FREE** - No API keys, no registration, no limits
- ✅ **Industry Standard** - Uses Deque's axe-core engine (trusted by Mozilla, Google, Microsoft)
- ✅ **Easy Integration** - Works seamlessly with existing Jest tests
- ✅ **Comprehensive** - Checks 50+ WCAG 2.1 rules (Level A & AA)
- ✅ **Fast** - Runs in milliseconds

---

## What It Checks

jest-axe automatically validates:

### WCAG 2.1 Level A & AA Rules
- **Color contrast** - Text must be readable (4.5:1 ratio)
- **Keyboard navigation** - All interactive elements are keyboard accessible
- **ARIA attributes** - Proper use of roles, labels, states
- **Form labels** - All inputs have associated labels
- **Alt text** - Images have descriptive alternatives
- **Semantic HTML** - Proper heading hierarchy, landmarks
- **Focus management** - Visible focus indicators
- **Screen reader compatibility** - Proper announcements

---

## Quick Start

### Running Accessibility Tests

```bash
# Run all accessibility tests
npm run audit:a11y

# Run specific component's a11y test
npx jest button.axe.test.tsx --no-coverage

# Watch mode for development
npx jest --watch --testPathPattern=\.axe\.test\.
```

---

## Writing Accessibility Tests

### Example 1: Basic Component Test

```typescript
import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from '../button';

describe('Button - Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Example 2: Testing Multiple Variants

```typescript
it('should have no violations for all variants', async () => {
  const variants = ['default', 'destructive', 'outline', 'secondary'];
  
  for (const variant of variants) {
    const { container } = render(<Button variant={variant}>Text</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }
});
```

### Example 3: Testing Forms

```typescript
it('should have no violations in form context', async () => {
  const { container } = render(
    <form>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" />
      <Button type="submit">Submit</Button>
    </form>
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## File Naming Convention

**Pattern:** `*.axe.test.tsx` or `*.axe.test.ts`

This convention:
- ✅ Makes accessibility tests easy to identify
- ✅ Allows running all a11y tests with `npm run audit:a11y`
- ✅ Keeps them separate from functional tests (optional to run)

**Examples:**
```
src/components/ui/__tests__/button.axe.test.tsx
src/components/organisms/__tests__/CalculatorContainer.axe.test.tsx
```

---

## Configuration

### jest.setup.js

The `toHaveNoViolations` matcher is configured globally:

```javascript
import { toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers with accessibility assertions
expect.extend(toHaveNoViolations);
```

---

## Interpreting Results

### ✅ Passing Test

```
✓ should have no accessibility violations (47 ms)
```

All WCAG checks passed!

### ❌ Failing Test

```
Expected the HTML found at $('button') to have no violations:

<button>Click</button>

Received:

1 violation found:
  - "Buttons must have discernible text" (serious)
    Impact: serious
    Target: button
    Help: https://dequeuniversity.com/rules/axe/4.10/button-name
```

**Fix:** Add text or `aria-label` to the button

---

## Common Violations & Fixes

### 1. Missing Form Labels

**Violation:**
```
Form elements must have labels
```

**Fix:**
```tsx
// ❌ Bad
<input type="text" />

// ✅ Good
<label htmlFor="name">Name</label>
<input id="name" type="text" />

// ✅ Also good (aria-label)
<input type="text" aria-label="Search" />
```

### 2. Low Color Contrast

**Violation:**
```
Elements must have sufficient color contrast
```

**Fix:**
- Use our theme colors (already WCAG compliant)
- Check contrast at https://webaim.org/resources/contrastchecker/

### 3. Missing Alt Text

**Violation:**
```
Images must have alternate text
```

**Fix:**
```tsx
// ❌ Bad
<img src="chart.png" />

// ✅ Good
<img src="chart.png" alt="Tax breakdown chart showing 20% basic rate" />

// ✅ Good (decorative images)
<img src="decoration.png" alt="" role="presentation" />
```

### 4. Invalid ARIA Usage

**Violation:**
```
ARIA attributes must be valid
```

**Fix:**
```tsx
// ❌ Bad
<div role="button" aria-labeledby="invalid">Click</div>

// ✅ Good
<button aria-label="Submit form">Click</button>
```

---

## Best Practices

### 1. Test Components in Context

Test components as they'll be used in the app:

```tsx
// ✅ Good - tests in realistic context
it('should be accessible in calculator form', async () => {
  const { container } = render(
    <CalculatorContainer>
      <Input label="Salary" />
      <Button>Calculate</Button>
    </CalculatorContainer>
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 2. Test All Variants

```tsx
// Test all props combinations that affect accessibility
['default', 'outline', 'ghost'].forEach(variant => {
  it(`should be accessible with variant="${variant}"`, async () => {
    const { container } = render(<Button variant={variant}>Text</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

### 3. Test Interactive States

```tsx
it('should be accessible when disabled', async () => {
  const { container } = render(<Button disabled>Submit</Button>);
  expect(await axe(container)).toHaveNoViolations();
});
```

---

## Limitations

### What axe-core CANNOT Check

- **Keyboard navigation logic** - Test with `@testing-library/user-event`
- **Focus order** - Test manually or with E2E tests
- **Screen reader announcements** - Test manually with NVDA/JAWS/VoiceOver
- **Touch target sizes** - Check CSS manually
- **Motion preferences** - Test manually with `prefers-reduced-motion`

### Complement With

1. **Manual testing** - Use screen readers (NVDA, JAWS, VoiceOver)
2. **E2E tests** - Test keyboard navigation with Playwright
3. **Browser DevTools** - Chrome Lighthouse, Firefox Accessibility Inspector

---

## CI/CD Integration

### GitLab CI (Future)

Add to `.gitlab-ci.yml`:

```yaml
accessibility_audit:
  stage: test
  script:
    - npm install
    - npm run audit:a11y
  allow_failure: false  # Block merge if violations found
```

---

## Resources

### Documentation
- [jest-axe GitHub](https://github.com/nickcolley/jest-axe)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools
- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/) - Manual testing
- [WAVE Extension](https://wave.webaim.org/extension/) - Visual feedback
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Automated audits

### Testing
- [NVDA Screen Reader](https://www.nvaccess.org/) - Free for Windows
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) - Built into macOS/iOS
- [Keyboard Testing Guide](https://webaim.org/articles/keyboard/)

---

## Example Test File

See `src/components/ui/__tests__/button.axe.test.tsx` for a complete example.

---

**Questions?** Check the [jest-axe docs](https://github.com/nickcolley/jest-axe#readme) or ask the team!
