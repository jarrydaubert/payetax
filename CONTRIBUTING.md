# Contributing to PayeTax

> Best practices and guidelines for maintaining high-quality code

**Last Updated:** 20 October 2025

---

## 🚀 START HERE (Every New Session)

**For Factory.ai Droid / Claude Code:**

When the user says **"Go read CONTRIBUTING.md"** at the start of a session, do this:

1. **Check the actual date** (run `date` command - we're in UK, BST/GMT)
2. **Read this entire CONTRIBUTING.md file** (yes, all of it!)
3. **Check Linear for assigned issues:**
   ```bash
   npm run linear:me
   ```
4. **Review recent commits for context:**
   ```bash
   git log --oneline -10
   ```
5. **Check git status:**
   ```bash
   git status
   ```
6. **Report back:** 
   - Current date
   - Summary of any Linear issues assigned
   - Brief overview of recent work from commits
   - Any uncommitted changes
   - Ask: "What would you like to work on?"

**That's it!** This ensures you have full context before starting any work.

---

## 📌 Project Context

**What is PayeTax?**
- UK PAYE (Pay As You Earn) tax calculator
- Helps users calculate income tax, National Insurance, take-home pay
- Covers England, Scotland, Wales tax systems
- Built with: Next.js, React, TypeScript, Tailwind CSS
- See `package.json` for current dependency versions

**📖 Required Reading:**
- **`docs/guides/ARCHITECTURE.md`** - Complete architecture guide
  - **Read Section 0** (`ls -la` Principle) before building ANY component
  - Prevents duplication, ensures proper component usage
  - Shows how to discover existing components/schemas/constants

**Key Concepts:**
- PAYE: UK's tax withholding system
- Tax codes (e.g., "1257L") determine personal allowance
- National Insurance (NI): Social security contributions
- Tax bands: Basic rate (20%), Higher rate (40%), Additional rate (45%)
- £100k-£125k "tax trap": Effective 60% rate due to allowance taper

**Current version:** Run `grep '"version"' package.json` to check

---

## 📋 Quick Workflow Reminder

**Every commit should:**
- [ ] Run `npm run fix-all` before committing
- [ ] Ensure tests pass (`npm run test`)
- [ ] Have descriptive commit message with Linear issue ID
- [ ] Include co-authorship footer
- [ ] **Push directly to main** (no feature branches unless discussed)
- [ ] **Tag with version number** using semantic versioning
- [ ] Push with: `git push origin main --follow-tags`

---

## 🏆 Code Quality Standards

### TypeScript Strict Mode

**Always use strict TypeScript:**
```typescript
// ✅ Good - Explicit types
interface CalculationResult {
  grossSalary: number;
  taxableIncome: number;
  totalTax: number;
}

function calculateTax(salary: number): CalculationResult {
  // ...
}

// ❌ Bad - Any types
function calculateTax(salary: any): any {
  // ...
}
```

**Rules:**
- No `any` types unless absolutely necessary (document why)
- All function parameters typed
- All return types explicit
- Use proper interfaces/types, not inline object types

---

### Code Comments & Documentation

**Every function needs JSDoc comments:**
```typescript
/**
 * Calculates PAYE tax for UK taxpayer based on 2025/26 rates
 * 
 * @param grossSalary - Annual gross salary in GBP
 * @param taxCode - HMRC tax code (e.g., "1257L")
 * @param region - UK region for tax calculation ('england' | 'scotland' | 'wales')
 * @returns Detailed tax breakdown including NI, student loans, take-home
 * 
 * @example
 * ```typescript
 * const result = calculatePAYE(45000, '1257L', 'england');
 * console.log(result.takeHomePay); // £34,123
 * ```
 */
export function calculatePAYE(
  grossSalary: number,
  taxCode: string,
  region: Region
): TaxCalculation {
  // Implementation
}
```

**Comment complex logic:**
```typescript
// Calculate marginal rate in the £100k-£125k trap zone
// Personal allowance tapers by £1 for every £2 earned over £100k
// This creates an effective 60% tax rate in this band
if (grossSalary > 100000 && grossSalary <= 125140) {
  const taperedAllowance = Math.max(0, personalAllowance - ((grossSalary - 100000) / 2));
  // ...
}
```

**Rules:**
- JSDoc for all exported functions
- Inline comments for complex business logic
- Explain **WHY**, not just WHAT
- Keep comments up-to-date when code changes

---

### Code Formatting & Linting

**Always run before committing:**
```bash
npm run fix-all
```

This runs:
1. `npm run format` - Biome code formatting
2. `biome check --write .` - Linting with auto-fix
3. `npm run typecheck` - TypeScript type checking

**Rules:**
- Never commit without running `fix-all`
- Fix all linting warnings (zero tolerance)
- Fix all TypeScript errors
- Use Biome's formatting (don't fight it)

---

### Testing Requirements

**Minimum coverage for new code:**
- **Unit tests:** 80%+ coverage for new functions
- **Integration tests:** All critical user flows
- **E2E tests:** Major features only

**Test structure:**
```typescript
describe('calculatePAYE', () => {
  describe('for England taxpayers', () => {
    it('should calculate correct tax for £45k salary', () => {
      const result = calculatePAYE(45000, '1257L', 'england');
      
      expect(result.incomeTax).toBeCloseTo(6486, 2);
      expect(result.nationalInsurance).toBeCloseTo(4212, 2);
      expect(result.takeHomePay).toBeCloseTo(34302, 2);
    });

    it('should handle £100k tax trap correctly', () => {
      // Test the 60% marginal rate zone
      const result = calculatePAYE(110000, '1257L', 'england');
      expect(result.marginalTaxRate).toBeCloseTo(0.60, 2);
    });
  });

  describe('edge cases', () => {
    it('should handle £0 salary', () => {
      const result = calculatePAYE(0, '1257L', 'england');
      expect(result.takeHomePay).toBe(0);
    });

    it('should handle very high salary (£1M)', () => {
      const result = calculatePAYE(1000000, '1257L', 'england');
      expect(result.incomeTax).toBeGreaterThan(0);
    });
  });
});
```

**Rules:**
- Test happy path AND edge cases
- Test boundary conditions
- Use descriptive test names
- Group related tests with `describe()`
- No skipped tests (`it.skip`) without explanation

**Test assertions - Best practices:**
- ✅ Test **behavior**, not implementation (avoid testing class names, internal state)
- ✅ Use semantic queries: `getByRole`, `getByLabelText`, `getByTestId` (stable)
- ✅ Use `container.textContent` for text split across elements
- ✅ Test what users see and interact with
- ❌ Don't test markup details (specific HTML structure, CSS classes)
- ❌ Avoid brittle selectors like `.className` unless testing visual behavior

**Run tests before committing:**
```bash
npm run test              # Unit tests with coverage (~10s)
npm run test:no-coverage  # Faster: Skip coverage (~6s)
npm run test:changed      # Fastest: Only changed files
npm run test:watch        # Watch mode for development
npm run test:e2e          # E2E tests
npm run test:all          # Everything
```

**Performance tips:**
- Use `test:no-coverage` during development (40% faster)
- Use `test:changed` when working on specific files
- Full `test` with coverage before committing

---

### File Organization

**Component structure:**
```
src/components/
├── atoms/          # Smallest reusable pieces (Button, Input)
├── molecules/      # Combinations of atoms (SearchBar, Card)
├── organisms/      # Complex components (Header, Calculator)
└── templates/      # Page layouts
```

**Naming conventions:**
- Components: PascalCase (`TaxCalculator.tsx`)
- Utilities: camelCase (`formatCurrency.ts`)
- Types/Interfaces: PascalCase (`TaxCalculation`)
- Constants: UPPER_SNAKE_CASE (`MAX_SALARY`)

**File naming:**
```
TaxCalculator/
├── index.tsx                    # Component
├── TaxCalculator.test.tsx       # Tests
├── TaxCalculator.stories.tsx    # Storybook (future)
└── types.ts                     # Component-specific types
```

---

## 🔧 Development Workflow

### Starting New Work

1. **Check Linear for your issue**
   ```bash
   # View your assigned issues
   npm run linear:me
   ```

2. **Work directly on main branch**
   - We push directly to main for most changes
   - Feature branches only for complex multi-day work (rare)
   - This keeps workflow simple and fast

3. **Read the issue description carefully**
   - Understand acceptance criteria
   - Review any linked docs
   - Ask questions if unclear

### During Development

1. **Make small, focused commits**
   ```bash
   git commit -m "feat: Add blog search tests (PAYTAX-34)
   
   - Test search functionality
   - Test pagination
   - Test category filtering
   
   Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"
   ```

2. **Run quality checks frequently**
   ```bash
   npm run fix-all    # Format, lint, typecheck
   npm run test       # Run tests
   ```

3. **Keep Linear issue updated**
   - Add comments on progress
   - Update checkboxes as you complete tasks
   - Flag blockers immediately

### Before Committing

**The Pre-Commit Checklist:**
```bash
# 1. Format and fix
npm run fix-all

# 2. Run tests
npm run test

# 3. Check for console.logs
grep -r "console.log" src/

# 4. Review your changes
git diff

# 5. Commit with descriptive message
git commit -m "feat: Add feature (PAYTAX-XX)"
```

**Pre-commit hook (already configured):**
- Runs `fix-all` automatically
- Blocks commit if linting fails
- Can bypass with `--no-verify` (use sparingly!)

### Before Pushing

**Pre-push hook (✅ NOW CONFIGURED - PAYTAX-24):**
```bash
# Runs automatically before every push
npm run test:no-coverage  # Full test suite (fast, no coverage report)
npm run build             # Verify production build works
```

**What it prevents:**
- ❌ Pushing code with failing tests
- ❌ Pushing code that doesn't build
- ❌ Breaking production deployments

**Can bypass with:** `git push --no-verify` (use sparingly! Only for docs/emergency fixes)

**Manual pre-push checklist (if bypassing hook):**
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No linting warnings
- [ ] Updated Linear issue
- [ ] Reviewed all changes

### Always Push to Main & Tag Versions

**IMPORTANT:** For Factory.ai sessions, always:

1. **Push directly to main** (no feature branches unless complex multi-day work)
2. **Tag every significant change** with semantic versioning

**Version numbering (Semantic Versioning):**
- **Major (vX.0.0)** - Breaking changes, major features
- **Minor (vX.Y.0)** - New features, non-breaking changes
- **Patch (vX.Y.Z)** - Bug fixes, small improvements

**Example workflow:**
```bash
# After making changes
git add -A
git commit -m "feat: Description

Details...

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"

# Tag the version (increment appropriately from current version)
git tag -a vX.Y.Z -m "vX.Y.Z - Brief summary"

# Push both commit and tag at once
git push origin main --follow-tags
```

**When to increment versions:**
- **Every session that makes changes** should get a version bump
- Check current version: `grep '"version"' package.json`
- Increment appropriately based on change type
- Document what's new in the tag message

---

## 🎨 Icon Usage Guidelines

### Lucide React Icons

**Current Version:** `lucide-react@^0.552.0`

**Package:** Lucide React provides 1000+ open-source icons with excellent tree-shaking support.

**Status:** ✅ Optimized for Turbopack (Nov 2025) - see `docs/audits/PAYTAX-78-LUCIDE-AUDIT.md`

---

### ✅ Best Practices

#### 1. Import Pattern (Turbopack-Compatible)

**For components with FEW icons (1-7):**
```typescript
// ✅ GOOD - Named imports for small icon usage
import { Calculator, PoundSterling, TrendingUp } from 'lucide-react';

export function ResultCard() {
  return (
    <div>
      <Calculator className={ICON_SIZES.SIZE_4} />
      <PoundSterling className={ICON_SIZES.SIZE_4} />
    </div>
  );
}
```

**For components with MANY icons (8+):**
```typescript
// ✅ BEST - Direct ESM imports (Turbopack-optimized, faster builds)
import Calculator from 'lucide-react/dist/esm/icons/calculator.js';
import PoundSterling from 'lucide-react/dist/esm/icons/pound-sterling.js';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up.js';
// ... 5+ more icons

export function HeavyComponent() {
  return (
    <div>
      <Calculator className={ICON_SIZES.SIZE_4} />
      <PoundSterling className={ICON_SIZES.SIZE_4} />
    </div>
  );
}
```

**Why?** Turbopack's tree-shaking struggles with large barrel imports during code-splitting. Direct ESM imports fix navigation failures and reduce bundle size. See `docs/TURBOPACK-LUCIDE-FIX.md`.

**❌ NEVER DO:**
```typescript
// ❌ BAD - Wildcard imports (breaks tree-shaking)
import * as LucideIcons from 'lucide-react';

// ❌ BAD - Default import (imports entire library)
import Lucide from 'lucide-react';
```

---

#### 2. Icon Sizing - ALWAYS Use Design Tokens

**Always use centralized sizing from `@/constants/designTokens`:**

```typescript
import { ICON_SIZES } from '@/constants/designTokens';

// ✅ GOOD - Using design tokens
<Icon className={ICON_SIZES.SIZE_4} />        // 1rem / 16px (standard)
<Icon className={ICON_SIZES.SIZE_5} />        // 1.25rem / 20px (large)
<Icon className={ICON_SIZES.SIZE_6} />        // 1.5rem / 24px (desktop)

// ✅ GOOD - Responsive sizing
<Icon className={cn(ICON_SIZES.SIZE_5, 'md:size-6')} />

// ❌ BAD - Hardcoded sizes
<Icon className="h-4 w-4" />
<Icon className="size-4" />
```

**Available sizes:**
```typescript
export const ICON_SIZES = {
  SIZE_3: 'size-3',  // 0.75rem / 12px - Inline indicators, external links
  SIZE_4: 'size-4',  // 1rem / 16px - Standard UI icons (MOST COMMON)
  SIZE_5: 'size-5',  // 1.25rem / 20px - Mobile menu, scroll indicators
  SIZE_6: 'size-6',  // 1.5rem / 24px - Desktop enhancements, headings
  SIZE_8: 'size-8',  // 2rem / 32px - Feature highlights, error pages
} as const;
```

**Why design tokens?**
- ✅ Centralized consistency
- ✅ Easy to update globally
- ✅ Type-safe
- ✅ Self-documenting

---

#### 3. Accessibility - ARIA Labels Required

**Rule: Every icon must have ARIA consideration.**

##### Decorative Icons (next to visible text)

```typescript
// ✅ GOOD - Decorative icon hidden from screen readers
<Button>
  <Calculator className={ICON_SIZES.SIZE_4} aria-hidden="true" />
  Calculate Tax
</Button>

// ✅ GOOD - Hash icon for heading anchors
<h2 id="section">
  <Hash className={ICON_SIZES.SIZE_6} aria-hidden="true" />
  Section Title
</h2>

// ❌ BAD - Missing aria-hidden (screen reader announces icon unnecessarily)
<Button>
  <Calculator className={ICON_SIZES.SIZE_4} />
  Calculate Tax
</Button>
```

##### Interactive Icons (icon-only buttons/links)

```typescript
// ✅ GOOD - Icon-only button with aria-label
<Button aria-label="Close menu">
  <X className={ICON_SIZES.SIZE_4} />
</Button>

// ✅ GOOD - Icon with screen-reader-only text
<Button>
  <Trash2 className={ICON_SIZES.SIZE_4} />
  <span className="sr-only">Delete income source</span>
</Button>

// ❌ BAD - Icon-only button without label
<Button>
  <X className={ICON_SIZES.SIZE_4} />
</Button>
```

##### Icons with State Changes

```typescript
// ✅ GOOD - Dynamic aria-label and aria-pressed
<Button
  aria-label={`Switch to ${label} mode`}
  aria-pressed={theme === value}
>
  {theme === 'dark' ? <Moon /> : <Sun />}
  <span className="sr-only">{label} mode</span>
</Button>
```

**Quick checklist:**
- [ ] Decorative icons have `aria-hidden="true"`
- [ ] Interactive icons have `aria-label` or `<span className="sr-only">`
- [ ] Icon-only buttons describe the action, not the icon ("Close menu", not "X icon")
- [ ] State changes update ARIA attributes dynamically

---

#### 4. Color & Theming

**Always use semantic color tokens from Tailwind theme:**

```typescript
// ✅ GOOD - Semantic theme colors
<Icon className="text-primary" />               // Brand color
<Icon className="text-muted-foreground" />      // Secondary UI
<Icon className="text-foreground" />            // Standard text
<Icon className="text-destructive" />           // Errors, delete

// ✅ GOOD - Conditional theming
<Icon className={cn(
  isActive ? 'text-foreground' : 'text-muted-foreground'
)} />

// ✅ GOOD - Hover states
<Icon className="text-primary hover:text-primary/80 transition-colors" />

// ⚠️ ACCEPTABLE - Feature-specific colors (document why)
<Icon className="text-green-600 dark:text-green-400" /> // Success state

// ❌ BAD - Hardcoded colors without dark mode
<Icon className="text-blue-500" />
```

**Common color patterns:**
- `text-primary` - Interactive elements, links, CTAs
- `text-muted-foreground` - Secondary UI, labels, placeholders
- `text-foreground` - Standard text, active states
- `text-destructive` - Errors, warnings, delete actions
- `text-green-600 dark:text-green-400` - Success states (when semantic token doesn't exist)

---

#### 5. Performance - Tree-Shaking

**Our tree-shaking is optimal.** Only 53 icons imported vs. 1000+ available.

**To maintain this:**

1. **Use named imports** (Turbopack: only if <8 icons per file)
2. **Use direct ESM imports** (Turbopack: required if 8+ icons per file)
3. **Never import unused icons**
4. **Don't create icon wrappers** (adds abstraction without benefit)

**Check bundle impact when adding icons:**
```bash
# Build and check bundle size
npm run build

# Analyze bundle (if needed)
npm run bundle:analyze
```

---

#### 6. Component Patterns

##### Pattern 1: Direct Icon Usage (Most Common)

```typescript
import { Calculator } from 'lucide-react';
import { ICON_SIZES } from '@/constants/designTokens';

export function TaxCard() {
  return (
    <Card>
      <Calculator className={ICON_SIZES.SIZE_4} aria-hidden="true" />
      <h3>Calculate Tax</h3>
    </Card>
  );
}
```

##### Pattern 2: Icon as Component Prop (Type-Safe)

```typescript
import type { LucideIcon } from 'lucide-react';
import { ICON_SIZES } from '@/constants/designTokens';

interface ResultCardProps {
  icon?: LucideIcon;
  title: string;
}

export function ResultCard({ icon: Icon, title }: ResultCardProps) {
  return (
    <Card>
      {Icon && <Icon className={ICON_SIZES.SIZE_4} aria-hidden="true" />}
      <h3>{title}</h3>
    </Card>
  );
}

// Usage
<ResultCard icon={Calculator} title="Total Tax" />
```

##### Pattern 3: Conditional Icon Rendering

```typescript
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const getIcon = () => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      default: return Monitor;
    }
  };
  
  const Icon = getIcon();
  return <Icon className={ICON_SIZES.SIZE_4} />;
}
```

---

### 🔍 Icon Discovery & Selection

**Finding the right icon:**

1. **Browse Lucide icons:** https://lucide.dev/icons
2. **Search by keyword:** https://lucide.dev/icons?search=calculator
3. **Check existing usage:**
   ```bash
   # Find all icon imports in codebase
   grep -r "from 'lucide-react'" src/
   ```

**Current icon inventory (53 icons used):**
- Navigation: Menu, X, ChevronLeft/Right/Up/Down, ArrowLeft/Right, Home
- Actions: Plus, Trash2, Check, CheckCircle, Send, Printer, FileDown, RefreshCw
- UI: AlertCircle, AlertTriangle, HelpCircle, Clock, Calendar, Loader2Icon, Hash
- Financial: Calculator, Wallet, PoundSterling, TrendingUp/Down, Percent, PiggyBank
- Theme: Sun, Moon, Monitor, Cookie, User, MessageSquare
- Content: FileText, BookOpen, Twitter, Mail, Coffee, Leaf, Heart

See `docs/audits/PAYTAX-78-LUCIDE-AUDIT.md` for complete icon inventory.

---

### 📚 Reference

**Key files:**
- Icon sizes: `src/constants/designTokens.ts` (`ICON_SIZES`)
- Complete audit: `docs/audits/PAYTAX-78-LUCIDE-AUDIT.md`
- Turbopack fix: `docs/TURBOPACK-LUCIDE-FIX.md`

**Quick commands:**
```bash
# Find all icon usage
grep -r "from 'lucide-react'" src/

# Check bundle size
npm run build

# Verify tree-shaking
npm run bundle:analyze
```

**For new icons:**
1. ✅ Check if similar icon already exists
2. ✅ Use design tokens for sizing
3. ✅ Add ARIA labels (decorative or interactive)
4. ✅ Use semantic colors
5. ✅ Test with screen reader (VoiceOver/NVDA)
6. ✅ Choose correct import pattern (named vs. direct ESM)

---

## 📝 Git Commit Guidelines

### Commit Message Format

```
<type>: <subject> (<issue-id>)

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Formatting (no code change)
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

**Examples:**
```bash
# Good commits
git commit -m "feat: Add marginal tax rate display (PAYTAX-22)"
git commit -m "fix: Correct Scottish tax band calculation (PAYTAX-32)"
git commit -m "docs: Update CONTRIBUTING.md with testing guidelines"
git commit -m "test: Add blog search pagination tests (PAYTAX-34)"

# Bad commits
git commit -m "updates"
git commit -m "fix bug"
git commit -m "wip"
```

**Always include co-authorship:**
```bash
git commit -m "feat: Add feature

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"
```

---

## 🧪 Testing Guidelines

### What to Test

**Always test:**
- ✅ Business logic (tax calculations, formulas)
- ✅ User interactions (button clicks, form submissions)
- ✅ Edge cases (£0 salary, £1M salary, invalid input)
- ✅ Error handling (API failures, network errors)
- ✅ Accessibility (keyboard navigation, screen readers)

**Don't need to test:**
- ❌ Third-party libraries
- ❌ Simple getters/setters
- ❌ UI styling (unless accessibility-critical)

### Test Coverage Goals

**Targets:**
- Overall: 90%+
- Business Logic: 99%+
- Components: 80%+
- Utilities: 95%+

**View current coverage:**
```bash
npm run test        # Generates coverage report
# Opens: audit-outputs/coverage/lcov-report/index.html
```

**Coverage reports are saved to `audit-outputs/coverage/` after running tests.**

---

## 🎨 UI/UX Guidelines

### Accessibility First

**Every interactive element must:**
- Have ARIA labels where needed
- Support keyboard navigation
- Work with screen readers
- Have 44x44px touch targets (mobile)
- Pass color contrast checks (WCAG AA)

**Test accessibility:**
```bash
npm run audit:a11y
```

### Mobile-First Design

**Always test:**
1. Mobile (320px - 767px)
2. Tablet (768px - 1023px)
3. Desktop (1024px+)

**Responsive breakpoints:**
```typescript
// Tailwind breakpoints
sm: 640px   // Small tablets
md: 768px   // Tablets
lg: 1024px  // Laptops
xl: 1280px  // Desktops
```

---

## 📦 Dependencies

### Adding New Dependencies

**Before adding a package:**
1. Check if functionality already exists
2. Verify package is actively maintained
3. Check bundle size impact
4. Review security advisories

**Process:**
```bash
# 1. Install
npm install package-name

# 2. Check bundle impact
npm run bundle:analyze

# 3. Document why it's needed (in PR/commit)
```

### Updating Dependencies

**Monthly maintenance (see Linear recurring issue):**
```bash
# Check for updates
npm outdated

# Update (carefully!)
npm update

# Run full test suite
npm run test:all

# Check for breaking changes
git diff package-lock.json
```

**Security updates (immediate):**
```bash
npm audit
npm audit fix
```

---

## 🚀 SEO & Performance

### SEO Checklist for New Pages

- [ ] Meta title (50-60 chars)
- [ ] **Meta description (150-158 chars) - CRITICAL**
- [ ] H1 tag (one per page)
- [ ] Internal links (3+ per page)
- [ ] Alt text on images
- [ ] Semantic HTML
- [ ] Schema markup (where applicable)

**Meta Description Guidelines:**
```typescript
// ✅ GOOD - 155 characters, clear value, includes year
description: "Calculate UK take-home pay with our free PAYE calculator using official HMRC rates for 2025-26. Scottish rates, student loans included."

// ❌ BAD - 198 characters (too long, will be truncated)
description: "Calculate your exact UK take-home pay with our free PAYE calculator using official HMRC rates for 2025-2026. Includes Scottish tax rates, student loans, pension contributions and marriage allowance."

// ❌ BAD - 87 characters (too short, not compelling)
description: "All calculations use official HMRC tax rates and thresholds published"
```

**Formula:** `[What] + [Key Benefit] + [Credibility] + [Tax Year]`

**Must Include:**
- Primary keyword naturally
- Tax year (2025, 2025-26, etc.)
- Clear benefit/value proposition
- Call to action (implicit or explicit)

**Target:** 150-158 characters (Google's mobile + desktop sweet spot)

**Audit Tools:**
```bash
# Check all meta descriptions
node scripts/audit-meta-descriptions.js

# Look for: missing, too long (>160), too short (<120)
# Note: SEMrush only flags "missing" and "duplicate"
# Character length optimization is our own best practice
```

### Performance Checklist

- [ ] Images optimized (<100KB each)
- [ ] Lazy loading images
- [ ] Code splitting for large components
- [ ] Minimize bundle size
- [ ] No console.log in production

**Check performance:**
```bash
npm run lighthouse
```

**Target metrics:**
- **LCP** (Largest Contentful Paint): <2.5s
- **FID** (First Input Delay): <100ms
- **CLS** (Cumulative Layout Shift): <0.1

---

## 📚 Documentation

### ⚠️ EVERGREEN DOCUMENTATION POLICY

**CRITICAL: Only create evergreen documentation that stays relevant.**

**Rules:**
1. ❌ **NEVER create docs for one-off issues/incidents** (e.g., "January Worker Crisis")
2. ❌ **NEVER create temporary analysis documents in root folder**
3. ✅ **UPDATE existing docs** instead of creating new ones
4. ✅ **Create new docs ONLY for permanent features/guides**
5. ✅ **All permanent docs belong in `docs/` folder** (organized by category)

**Examples:**

**❌ BAD - Temporary, issue-specific docs:**
- `GITLAB_WORKER_CAPACITY_ANALYSIS.md` (one-off problem analysis)
- `CICD_OPTIMIZATION_SUMMARY.md` (specific incident summary)
- `LINEAR_SETUP_SUMMARY.md` (setup notes, should be in docs/)
- `DATABASE_MIGRATION_NOTES.md` (temporary notes)

**✅ GOOD - Evergreen docs:**
- `CONTRIBUTING.md` (always relevant, updated over time)
- `README.md` (project overview, always needed)
- `docs/infrastructure/CICD.md` (permanent CI/CD guide)
- `docs/guides/BLOG_GUIDE.md` (permanent feature guide)
- `CHANGELOG.md` (historical record, always updated)

**When you fix an issue:**
1. ✅ Update existing relevant docs (e.g., update CI/CD section in existing doc)
2. ✅ Add learnings to CONTRIBUTING.md if generally applicable
3. ✅ Document in Linear issue for historical context
4. ❌ Don't create `ISSUE_NAME_ANALYSIS.md` in root folder

**Root folder should only contain:**
- `README.md` - Project overview
- `CONTRIBUTING.md` - Development guidelines (this file)
- `CHANGELOG.md` - Version history
- `SECURITY.md` - Security policy
- `LICENSE` - License file
- Config files (package.json, tsconfig.json, etc.)

**Everything else goes in `docs/` organized by:**
- `docs/guides/` - Feature guides
- `docs/infrastructure/` - CI/CD, deployment, monitoring
- `docs/setup/` - Setup and installation
- `docs/reference/` - API references, schemas

---

### When to Update Docs

**Update docs when you:**
- Add new features
- Change APIs
- Add new dependencies
- Change build process
- Fix complex bugs (update relevant guide, don't create new doc!)

### Where to Document

| What | Where |
|------|-------|
| API changes | Code JSDoc comments |
| Features | README.md overview + docs/guides/ for details |
| Setup | docs/setup/ |
| Architecture | docs/guides/ARCHITECTURE.md |
| Best practices | This file (CONTRIBUTING.md) |
| CI/CD | docs/infrastructure/CICD.md |
| Deployment | docs/infrastructure/DEPLOYMENT.md |

---

## 🔍 Code Review Guidelines (For Humans)

### What to Look For

**Code quality:**
- [ ] Follows TypeScript strict mode
- [ ] Has JSDoc comments
- [ ] Tests included
- [ ] No console.log statements
- [ ] Passes linting

**Functionality:**
- [ ] Meets acceptance criteria
- [ ] Handles edge cases
- [ ] No regressions
- [ ] Accessible (keyboard, screen reader)
- [ ] Mobile responsive

**Performance:**
- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] No bundle bloat

---

## 🎯 Linear Integration

**Quick Start (30 seconds):**

```bash
# 1. Set up API key (one-time):
export LINEAR_API_KEY="lin_api_xxx"  # Get from linear.app/settings/api

# 2. View your assigned issues:
npm run linear:me

# 3. Mark issue done:
npm run linear:done PAYTAX-80 Done

# 4. Create new issue:
npm run linear:create
```

**That's it!** Everything else is available via `npm run linear` (shows full help).

### Daily Use

```bash
# Morning: See what's assigned to you
npm run linear:me

# During work: Mark as done
npm run linear:done PAYTAX-123 Done

# When needed: Create issue/sub-issue
npm run linear:create
```

### All Available Commands

```bash
npm run linear  # Shows full help with all commands

# Common commands:
npm run linear list --project PayeTax
npm run linear update-description PAYTAX-123 "Details"
npm run linear create "Title" --parent PAYTAX-123
npm run linear update-priority PAYTAX-123 1
npm run linear delete PAYTAX-123
```

**Pro tip:** Run `npm run linear` anytime to see all options.

---

## 🐛 Debugging Tips

### Common Issues

**TypeScript errors:**
```bash
# Clear build cache
npm run clean

# Rebuild
npm run dev
```

**Test failures:**
```bash
# Run specific test
npm test -- TaxCalculator.test.tsx

# Update snapshots (if needed)
npm test -- -u
```

**Build errors:**
```bash
# Clean everything
npm run clean:all

# Fresh install
npm install
```

---

## 📖 Key Reference Docs

| Doc | Purpose |
|-----|---------|
| [README.md](./README.md) | Project overview |
| [LINEAR.md](./docs/setup/LINEAR.md) | Complete Linear guide (5 min quickstart → full reference) |
| [BLOG_GUIDE.md](./docs/guides/BLOG_GUIDE.md) | Blog writing guidelines |
| [TECH_STACK.md](./docs/guides/TECH_STACK.md) | Technology overview |
| [ARCHITECTURE.md](./docs/guides/ARCHITECTURE.md) | Codebase structure & audit status |

---

## ⚡ Quick Commands Reference

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Production build
npm run fix-all            # Format, lint, typecheck

# Testing
npm run test               # Unit tests with coverage
npm run test:e2e           # E2E tests
npm run test:all           # All tests

# Linear (see docs/setup/LINEAR.md for full guide)
npm run linear:me          # Your issues (use daily!)
npm run linear:create      # Create issue (interactive)
npm run linear:list        # All issues
npm run linear update-status PAYTAX-X Done  # Update status

# Quality
npm run lint:fix           # Fix linting
npm run typecheck          # Type check
npm run audit:deps         # Security audit

# Performance
npm run lighthouse         # Performance audit
npm run bundle:analyze     # Bundle size

# Git
git commit --no-verify     # Bypass pre-commit (use sparingly!)
```

---

## 🤝 Getting Help

**Stuck? Try these in order:**

1. **Check the docs** - `docs/` folder
2. **Check Linear issue comments** - Others may have same question
3. **Review recent commits** - See how similar issues were solved
4. **Check test files** - Often show usage examples
5. **Ask in issue comments** - Tag relevant people

---

## 🎉 Remember

> "Code is read more than it's written. Make it clear, not clever."

**Priorities (in order):**
1. **Correctness** - Does it work?
2. **Clarity** - Can others understand it?
3. **Maintainability** - Can it be easily changed?
4. **Performance** - Is it fast enough?

**When in doubt:**
- Write tests
- Add comments
- Ask questions
- Keep it simple

---

**Questions about this guide?**
Create a Linear issue: `docs: [Your question about CONTRIBUTING.md]`
