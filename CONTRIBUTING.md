# Contributing to PayeTax

Thank you for your interest in contributing to PayeTax! This document provides guidelines and information for contributors.

## 📜 License & Intellectual Property

**IMPORTANT:** PayeTax is proprietary software. By contributing to this project, you agree that:

1. **Copyright Assignment:** All contributions become the property of PayeTax
2. **Proprietary License:** Your contributions will be subject to PayeTax's proprietary license
3. **No License Grant:** You do not retain any license to use contributed code outside of PayeTax
4. **Confidentiality:** All code, discussions, and project information are confidential

If you cannot agree to these terms, please do not submit contributions.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Component Guidelines](#component-guidelines)
6. [Testing Requirements](#testing-requirements)
7. [Commit Guidelines](#commit-guidelines)
8. [Pull Request Process](#pull-request-process)
9. [Documentation](#documentation)

---

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Harassment, trolling, or discriminatory comments
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.0.0 or higher
- **npm** 10.0.0 or higher
- **Git** 2.x or higher

### Initial Setup

```bash
# 1. Fork the repository on GitLab
# 2. Clone your fork
git clone https://gitlab.com/YOUR_USERNAME/payetax.git
cd payetax

# 3. Add upstream remote
git remote add upstream https://gitlab.com/ukpayetax/payetax.git

# 4. Install dependencies
npm install

# 5. Create a feature branch
git checkout -b feature/your-feature-name

# 6. Start development server
npm run dev
```

### Verify Setup

```bash
# Run all quality checks
npm run fix-all

# Should see:
# ✅ TypeScript: 0 errors
# ✅ Linting: 0 errors
# ✅ Tests: All passing
```

---

## 🔄 Development Workflow

### 1. Pick an Issue

- Browse [open issues](https://gitlab.com/ukpayetax/payetax/-/issues)
- Comment on the issue to claim it
- Wait for maintainer confirmation
- If no suitable issue exists, create one first

### 2. Create a Branch

```bash
# Feature branch
git checkout -b feature/description

# Bug fix branch
git checkout -b fix/description

# Documentation branch
git checkout -b docs/description
```

**Branch naming:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/fixes
- `chore/` - Maintenance tasks

### 3. Make Changes

Follow our [Code Standards](#code-standards) and [Component Guidelines](#component-guidelines).

### 4. Test Your Changes

```bash
# Unit tests
npm test

# E2E tests (quick - Chrome only)
npm run test:dev

# Full E2E suite (all browsers)
npm run test:e2e

# All tests
npm run test:all
```

### 5. Run Quality Checks

```bash
# Fix all issues automatically
npm run fix-all

# Or run individually:
npm run lint          # Check linting
npm run format        # Format code
npm run typecheck     # Check types
```

### 6. Commit Changes

Follow our [Commit Guidelines](#commit-guidelines).

### 7. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitLab
```

---

## 📏 Code Standards

### TypeScript

**Strict Mode Required:**

```typescript
// ✅ Good - Proper typing
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// ❌ Bad - Using 'any'
function Button(props: any) {
  return <button>{props.children}</button>;
}
```

**Rules:**
- ✅ No `any` types (use `unknown` if necessary)
- ✅ Explicit return types for functions
- ✅ Proper interface definitions
- ✅ Use type guards for narrowing

### Linting (Biome)

**Configuration:** `biome.json` (10/10 strictness)

```bash
# Check linting
npm run lint

# Auto-fix issues
npm run lint:fix
```

**Key Rules:**
- Accessibility rules enforced (WCAG 2.2 AA)
- No console.log in production code (use proper logging)
- Consistent naming conventions
- No unused imports/variables

### File Naming

```
components/
├── atoms/
│   └── NumberInput.tsx         # PascalCase for components
├── molecules/
│   └── ResultCard.tsx
└── ui/
    └── button.tsx              # lowercase for shadcn/ui

lib/
├── taxCalculator.ts            # camelCase for utilities
└── utils.ts

types/
└── calculator.ts               # lowercase for type files
```

### Import Order

```typescript
// 1. React imports
import React, { useState, useCallback } from 'react';

// 2. Third-party libraries
import { motion } from 'framer-motion';
import { Calculator } from 'lucide-react';

// 3. Internal components
import { Button } from '@/components/ui/button';
import { ResultCard } from '@/components/molecules/ResultCard';

// 4. Utilities and hooks
import { cn, formatNumber } from '@/lib/utils';
import { useCalculatorStore } from '@/store/calculatorStore';

// 5. Types
import type { TaxCalculationResults } from '@/types/calculator';

// 6. Constants
import { TAX_RATES } from '@/constants/taxRates';
```

---

## 🧩 Component Guidelines

### Atomic Design Structure

Place components in the correct layer:

| Layer | Description | Examples |
|-------|-------------|----------|
| **Atoms** | Cannot be broken down | `Input`, `Button`, `Label` |
| **Molecules** | Combine atoms | `InputGroup`, `ResultCard` |
| **Organisms** | Complex sections | `Calculator`, `Navbar` |
| **Templates** | Page layouts | `Layout`, `BlogLayout` |
| **Pages** | Full pages | `HomePage`, `BlogPost` |

### Component Template

```typescript
/**
 * Brief component description
 *
 * Key features:
 * - Feature 1
 * - Feature 2
 *
 * @module components/[layer]/ComponentName
 */

import type React from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for the ComponentName component
 */
interface ComponentNameProps {
  /** Prop description */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Optional className for styling */
  className?: string;
  /** React ref */
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * ComponentName - Short description
 *
 * Detailed description of what this component does,
 * when to use it, and any important notes.
 *
 * @param props - Component props
 * @returns React component
 */
export function ComponentName({
  value,
  onChange,
  className,
  ref,
}: ComponentNameProps) {
  return (
    <div ref={ref} className={cn('base-classes', className)}>
      {/* Component content */}
    </div>
  );
}

// Set display name for React DevTools
ComponentName.displayName = 'ComponentName';
```

### Accessibility Requirements

**Every component must:**

```typescript
// 1. Use semantic HTML
<nav aria-label="Main navigation">
  <button aria-label="Close dialog">×</button>
</nav>

// 2. Support keyboard navigation
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  onClick={handleClick}
>
  Click me
</div>

// 3. Provide proper ARIA attributes
<input
  aria-label="Salary amount"
  aria-describedby="salary-help"
  aria-required="true"
  aria-invalid={hasError}
/>

// 4. Use unique IDs (useId hook)
import { useId } from 'react';

const inputId = useId();
<label htmlFor={inputId}>Label</label>
<input id={inputId} />
```

### Performance Optimization

```typescript
// 1. Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  // ...
});

// 2. useCallback for event handlers
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);

// 3. useMemo for expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// 4. Granular Zustand selectors
const results = useCalculatorResults(); // Only this slice
```

---

## 🧪 Testing Requirements

### Coverage Requirements

**Minimum Coverage:**
- New atoms/molecules: 80%
- New organisms: 60%
- Bug fixes: Must add regression test

**Target Coverage:**
- Overall: 85%+
- Business logic (`lib/`): 90%+

### Test Template

```typescript
// __tests__/ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  // Basic rendering
  it('renders correctly', () => {
    render(<ComponentName value="test" onChange={vi.fn()} />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  // User interactions
  it('calls onChange when value changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<ComponentName value="" onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'new value');
    
    expect(onChange).toHaveBeenCalledWith('new value');
  });

  // Accessibility
  it('has no accessibility violations', async () => {
    const { container } = render(<ComponentName value="test" onChange={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Edge cases
  it('handles empty value', () => {
    render(<ComponentName value="" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveValue('');
  });
});
```

### Running Tests

```bash
# Unit tests with coverage
npm test

# Watch mode (during development)
npm run test:watch

# E2E tests (quick - Chrome only)
npm run test:dev

# Full E2E suite (all browsers)
npm run test:e2e

# All tests
npm run test:all
```

### Test Best Practices

1. **Test behavior, not implementation**
2. **Use Testing Library queries properly:**
   - `getByRole` (preferred)
   - `getByLabelText` (forms)
   - `getByText` (content)
   - `getByTestId` (last resort)
3. **Always test accessibility** with jest-axe
4. **Test user interactions** with @testing-library/user-event
5. **Mock external dependencies** (API calls, timers, etc.)

---

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(calculator): add pension optimization feature"

# Bug fix
git commit -m "fix(input): prevent negative values in NumberInput"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactor
git commit -m "refactor(organisms): extract BasicInputs sub-components"

# Test
git commit -m "test(molecules): add tests for ResultCard variants"
```

### Commit Best Practices

- ✅ One logical change per commit
- ✅ Write clear, descriptive messages
- ✅ Reference issue numbers when applicable
- ✅ Keep commits focused and atomic
- ❌ Don't mix unrelated changes
- ❌ Don't commit broken code

---

## 🔀 Pull Request Process

### Before Creating PR

```bash
# 1. Sync with upstream
git fetch upstream
git rebase upstream/main

# 2. Run all quality checks
npm run fix-all

# 3. Ensure all tests pass
npm run test:all

# 4. Build successfully
npm run build
```

### PR Title Format

Follow commit message format:

```
feat(calculator): Add pension optimization feature
fix(input): Prevent negative values in NumberInput
docs(readme): Update installation instructions
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issue
Closes #123

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

## Screenshots (if applicable)
Before:
![Before](url)

After:
![After](url)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review performed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added and passing
- [ ] Build succeeds
```

### Review Process

1. **Automated Checks:**
   - GitLab CI/CD runs all tests
   - Linting and type checking
   - Build verification

2. **Code Review:**
   - At least one maintainer approval required
   - Address all review comments
   - Keep discussion constructive

3. **Merge:**
   - Squash and merge (preferred)
   - Rebase and merge (for feature branches)
   - Create merge commit (for releases)

---

## 📚 Documentation

### When to Update Documentation

Update documentation when:
- Adding new features
- Changing existing behavior
- Modifying configuration
- Adding new components
- Changing architecture

### Documentation Files

| File | Purpose | Update When |
|------|---------|-------------|
| `README.md` | Project overview | Major changes |
| `COMPONENTS.md` | Component audit | Adding components |
| `ARCHITECTURE.md` | Architecture guide | Structural changes |
| `TECH_STACK.md` | Technology details | Dependency updates |
| `USER_GUIDE.md` | User documentation | Feature changes |
| `CONTRIBUTING.md` | This file | Process changes |

### JSDoc Comments

```typescript
/**
 * Calculate UK PAYE tax for a given salary
 *
 * Uses official HMRC rates and thresholds for the specified tax year.
 * Supports Scottish tax rates and various allowances.
 *
 * @param salary - Annual gross salary in GBP
 * @param taxYear - Tax year (e.g., "2025-2026")
 * @param region - UK region for tax calculation
 * @returns Tax calculation results including breakdowns
 *
 * @example
 * ```typescript
 * const results = calculateTax(50000, "2025-2026", "England");
 * console.log(results.totalTax.annually); // 7,486
 * ```
 */
export function calculateTax(
  salary: number,
  taxYear: string,
  region: Region
): TaxCalculationResults {
  // Implementation
}
```

---

## 🙋 Getting Help

### Questions?

- **Documentation:** Check [docs/](./docs) folder first
- **Issues:** Search [existing issues](https://gitlab.com/ukpayetax/payetax/-/issues)
- **Email:** Use feedback form at [payetax.co.uk/feedback](https://payetax.co.uk/feedback)

### Reporting Bugs

Use this template:

```markdown
**Describe the bug**
Clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS 14]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 20.10.0]

**Additional context**
Any other context about the problem.
```

---

## 🏆 Recognition

Contributors will be recognized in:
- Release notes
- Project README
- Annual contributor list

Thank you for contributing to PayeTax! 🎉

---

**Last Updated:** October 20, 2025  
**Maintained By:** PayeTax Team
