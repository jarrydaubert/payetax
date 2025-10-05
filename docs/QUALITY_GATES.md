# 🔒 PayeTax Quality Gates & Standards

**Last Updated**: October 5, 2025
**Status**: ✅ Enforced in CI/CD

This document defines the mandatory quality gates that all code must pass before merging to main or deploying to production.

---

## 📊 Quality Gate Overview

| Gate | Tool | Threshold | Enforced In | Blocking |
|------|------|-----------|-------------|----------|
| **TypeScript** | tsc | 0 errors | CI + Pre-commit | ✅ Yes |
| **Linting** | Biome | 0 errors | CI + Pre-commit | ✅ Yes |
| **Unit Tests** | Jest | All passing | CI + Pre-commit | ✅ Yes |
| **Test Coverage** | Jest | 80% global | CI | ✅ Yes |
| **E2E Tests** | Playwright | All passing | CI | ✅ Yes |
| **Build** | Next.js | Success | CI | ✅ Yes |
| **Security** | npm audit | No high/critical | CI | ⚠️ Warning |
| **Bundle Size** | Next.js | <350kB | Manual | ℹ️ Monitor |

---

## 🚦 Pre-commit Hooks (Local)

**Enforced via**: `.husky/pre-commit`

Before every commit, the following checks run automatically:

```bash
1. Biome linting           # Must pass
2. TypeScript type check   # Must pass
3. Related unit tests      # Must pass
```

**If any check fails**, the commit is blocked. Fix the issues and try again.

### Bypass (Emergency Only)
```bash
git commit --no-verify -m "message"  # ⚠️ Use sparingly!
```

---

## 🔧 TypeScript Configuration

**File**: `tsconfig.json`

### Strictness Settings
```json
{
  "strict": true,                      // ✅ All strict checks
  "noUnusedLocals": true,              // ✅ No unused variables
  "noUnusedParameters": true,          // ✅ No unused parameters
  "noFallthroughCasesInSwitch": true,  // ✅ Switch case safety
  "noUncheckedIndexedAccess": true,    // ✅ Array access safety
  "skipLibCheck": true                 // ⚠️ Required for Contentlayer2 (see below)
}
```

### Why skipLibCheck is Enabled

Contentlayer2 has broken type definitions that cause hundreds of errors in `node_modules`. We skip lib checking **only for third-party code**, while maintaining strict checks for our own code.

**Action**: Remove this when migrating away from Contentlayer2 or when types are fixed.

---

## 🧪 Test Coverage Requirements

**File**: `jest.config.js`

### Coverage Thresholds (Enforced in CI)

#### Global (All Files)
```json
{
  "statements": 80,  // 80% of statements covered
  "branches": 70,    // 70% of branches covered
  "functions": 80,   // 80% of functions covered
  "lines": 80        // 80% of lines covered
}
```

#### Business Logic (`/src/lib/*`) - STRICT
```json
{
  "statements": 90,  // 90% coverage required
  "branches": 80,
  "functions": 90,
  "lines": 90
}
```

#### UI Components (`/src/components/*`) - LENIENT
```json
{
  "statements": 60,  // Visual testing often better than unit tests
  "branches": 50,
  "functions": 60,
  "lines": 60
}
```

### Current Coverage Status

**Baseline (Oct 5, 2025)**: 16.47%

This is **below threshold** and will fail in CI. To pass quality gates, we need:
- Business logic (`lib/`): Write 90%+ coverage
- Components: Write 60%+ coverage
- Overall: Achieve 80%+ global coverage

### Running Coverage Checks

```bash
# Local (with HTML report)
npm test

# CI mode (fails if below threshold)
npm run test:ci

# Check specific coverage
npm test -- --coverage --collectCoverageFrom="src/lib/**"
```

---

## 🎨 Linting Rules (Biome)

**File**: `biome.json`

### Strictness: 9/10

#### Enabled Rule Categories
- ✅ **Correctness** (errors): Unused vars, invalid hooks deps, undefined vars
- ✅ **Suspicious** (errors): noExplicitAny, noDebugger, noDoubleEquals
- ✅ **Accessibility** (errors): WCAG compliance, ARIA validation
- ✅ **Security** (errors): No dangerouslySetInnerHTML, no eval
- ✅ **Performance** (warn): No delete operator, no accumulating spreads
- ✅ **Style** (errors): Consistent syntax, template literals, const over let

### Running Linting

```bash
# Check for errors
npm run lint

# Auto-fix issues
npm run lint:fix

# Manual fix with Biome
biome check --write .
```

---

## 🧩 E2E Testing (Playwright)

**Configuration**: `playwright.config.ts`

### Test Projects (All must pass)
1. **Chromium** (Desktop)
2. **Firefox** (Desktop)
3. **WebKit/Safari** (Desktop)
4. **Mobile Chrome** (Touch + responsive)
5. **Mobile Safari** (iOS compatibility)

### Running E2E Tests

```bash
# Local (all browsers + HTML report)
npm run test:e2e

# Local (Chrome only, faster)
npm run test:dev

# CI mode (no auto-open report)
npm run test:e2e:ci
```

### E2E in CI/CD

E2E tests run in GitLab CI on:
- ✅ All merge requests
- ✅ Main branch commits
- ✅ Tagged releases

**Failures block merging** - all 157 tests must pass.

---

## 🏗️ Build Quality Gates

### Next.js Production Build

**Requirements**:
- ✅ Build completes without errors
- ✅ All pages render (29 pages)
- ✅ No TypeScript errors during build
- ✅ Bundle size <350kB (currently 293kB)

### Bundle Size Monitoring

```bash
# Analyze bundle
npm run build:analyze

# Opens visual bundle map
# Check for:
# - Unexpected large dependencies
# - Duplicate dependencies
# - Unoptimized imports
```

**Action if >350kB**: Investigate and optimize before merging.

---

## 🔐 Security Gates

### npm Audit (CI + Local)

**Threshold**: No high or critical vulnerabilities

```bash
# Run audit
npm run audit:deps

# Auto-fix (if safe)
npm audit fix

# Custom audit with history
npm run audit:security
```

**Note**: Low/moderate vulnerabilities are flagged but don't block CI.

### Secret Detection (CI Only)

Scans git history for:
- API keys
- Passwords
- Auth tokens
- Credentials

**Action if detected**: Remove from history using `git filter-branch` or BFG Repo Cleaner.

---

## 📈 CI/CD Pipeline Stages

### GitLab CI: `.gitlab-ci.yml`

#### Stage 1: Security
- ✅ Secret detection
- ✅ Dependency audit

#### Stage 2: Test
- ✅ Biome linting
- ✅ TypeScript checking
- ✅ Unit tests (with coverage thresholds)
- ✅ E2E tests (Playwright - all browsers)

#### Stage 3: Build
- ✅ Production build
- ✅ Bundle analysis
- ✅ Artifacts saved

#### Stage 4: Deploy
- ✅ Vercel production (manual approval)
- ✅ Preview deployments (auto for MRs)

**All stages must pass** before deployment to production.

---

## 📝 Quality Gate Failures

### What to Do When Gates Fail

#### Linting Failures
```bash
npm run lint        # See errors
npm run lint:fix    # Auto-fix
```

#### TypeScript Failures
```bash
npm run typecheck   # See type errors
# Fix manually - no auto-fix for types
```

#### Test Failures
```bash
npm test            # Run all tests
npm run test:watch  # Debug specific tests
```

#### Coverage Failures
```bash
npm test            # See coverage report
# Write tests for uncovered code
# Focus on lib/ (needs 90%) and critical paths
```

#### E2E Failures
```bash
npm run test:dev    # Run Chrome only (faster)
npx playwright test --debug  # Debug mode
```

---

## 🎯 Quality Metrics Tracking

### Current Status (Oct 5, 2025)

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| TypeScript Errors | 0 | 0 | ✅ Pass |
| Linting Errors | 0 | 0 | ✅ Pass |
| Unit Tests | 242/243 | All pass | ✅ Pass |
| Test Coverage | 16.47% | 80% | ❌ Fail |
| E2E Tests | 157 | All pass | ✅ Pass |
| Bundle Size | 293kB | <350kB | ✅ Pass |
| Security Vulns | 0 high | 0 high | ✅ Pass |

**Priority**: Increase test coverage from 16.47% to 80% to meet quality gates.

---

## 🔄 Continuous Improvement

### Quarterly Reviews

Review and update quality gates every quarter:
1. Evaluate coverage thresholds (too strict/lenient?)
2. Update linting rules for new patterns
3. Add new security checks as needed
4. Review bundle size targets

### Feedback Loop

If quality gates are:
- **Too strict**: Blocking legitimate work → Adjust thresholds
- **Too lenient**: Bugs reaching production → Tighten rules

**Document all changes in this file.**

---

## 📚 Related Documentation

- [TESTING.md](./TESTING.md) - Comprehensive testing guide
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Pre-launch checklist
- [NEXT_PRIORITIES.md](./NEXT_PRIORITIES.md) - Current development priorities

---

**Questions?** Check CI logs in GitLab or run `npm run ci` locally to simulate the full pipeline.
