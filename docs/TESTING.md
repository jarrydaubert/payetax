# 🧪 PayeTax Testing & Quality Assurance Guide

This document provides comprehensive testing strategies, manual test suites, automated testing information, and troubleshooting guides for maintaining quality in the PayeTax UK Tax Calculator.

---

## 📋 Testing Overview

### Current Testing Status

| Testing Type | Status | Coverage | Tools |
|--------------|--------|----------|-------|
| **Unit Tests** | ✅ Active | 131 tests, 25.35% coverage | Jest + React Testing Library |
| **E2E Tests** | ✅ Active | 157 tests across all browsers | Playwright |
| **Linting** | ✅ Active | 116 files, 0 errors | Biome |
| **Type Checking** | ✅ Active | Zero errors | TypeScript 5.9 |
| **Performance** | ✅ Active | Lighthouse CI | Automated |

### Quality Metrics

- **Unit Tests**: 131 passing tests (room for coverage improvement)
- **E2E Tests**: 157 tests covering Chrome, Firefox, Safari + Mobile
- **Code Quality**: 0 linting errors, 0 TypeScript errors
- **Tax Accuracy**: HMRC-compliant with precise rounding fixes
- **Auto-Reports**: All tests auto-generate and open HTML reports

---

## 🎯 Automated Testing

### Unit Testing (Jest + RTL)

**Configuration**: `jest.config.ts`
```typescript
// 130+ unit tests covering:
// - Tax calculation logic
// - Component rendering
// - User interactions
// - Error handling
// - Form validation
```

**Running Tests** (All Auto-Open HTML Reports):
```bash
# Unit tests + coverage (auto-opens HTML coverage report)
npm test

# Watch mode for development
npm run test:watch

# E2E tests - all browsers + mobile (auto-opens HTML E2E report)  
npm run test:e2e

# Quick E2E - Chrome only (fast feedback, auto-opens report)
npm run test:dev

# Complete test suite (unit + E2E all browsers)
npm run test:all
```

**Key Test Categories**:
- **Calculator Logic**: Tax, NI, student loan calculations
- **Component Behavior**: Form inputs, result displays
- **Error Boundaries**: Graceful failure handling
- **Accessibility**: ARIA attributes, keyboard navigation

### End-to-End Testing (Playwright)

**157 E2E Tests** across 5 projects:
1. **Chrome Desktop**: Core functionality and performance
2. **Firefox Desktop**: Cross-browser compatibility  
3. **Safari Desktop**: WebKit engine compatibility
4. **Mobile Chrome**: Touch interactions and responsive design
5. **Mobile Safari**: iOS compatibility

**Test Categories**:
- **Basic Calculator Flow**: Salary input → calculation → results
- **Advanced Options**: Scottish rates, student loans, pensions  
- **Export Functionality**: Excel export and print preview
- **Browser Compatibility**: Modern CSS and JavaScript features
- **Performance**: Timing and interaction speed
- **Accessibility**: Screen reader and keyboard navigation
- **Responsive Design**: Mobile viewports and touch interactions
- **Error Handling**: Invalid inputs and edge cases

**Running E2E Tests** (All Auto-Open HTML Reports):
```bash
# All browsers + mobile (Chrome, Firefox, Safari + Mobile) - auto-opens report
npm run test:e2e

# Quick Chrome-only testing - auto-opens report  
npm run test:dev

# Interactive test runner UI
npm run test:e2e:ui

# Run specific test file
npx playwright test calculator-basic
```

### Performance Testing

**Lighthouse CI Integration**:
```bash
# Performance audit
npm run lighthouse-check

# Bundle analysis
npm run build:analyze

# Core Web Vitals monitoring
npm run performance:audit
```

**Performance Targets**:
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Bundle Size: < 350kB

---

## 📋 Manual Testing Suite

### Core Calculator Testing

#### Input Validation & Edge Cases

| Test ID | Description | Steps | Expected Result | Priority |
|---------|-------------|-------|-----------------|----------|
| **CORE-001** | Negative salary values | 1. Enter -1000<br>2. Click Calculate | Error message displayed | High |
| **CORE-002** | Zero salary (£0) | 1. Enter £0<br>2. Calculate | Zero tax/NI calculated | High |
| **CORE-003** | Maximum salary (£1M+) | 1. Enter £1,000,000<br>2. Calculate | Handles gracefully | Medium |
| **CORE-004** | Decimal values (£45,500.50) | 1. Enter £45,500.50<br>2. Calculate | Formats correctly | Medium |
| **CORE-005** | Invalid characters | 1. Enter "abc"<br>2. Attempt calculation | Input prevented or error | High |

#### Tax Year Calculations

| Test ID | Description | Steps | Expected Result | Priority |
|---------|-------------|-------|-----------------|----------|
| **CORE-007** | 2023-24 tax rates | 1. Select 2023-24<br>2. Calculate £50k | Correct thresholds applied | High |
| **CORE-008** | 2024-25 tax rates | 1. Select 2024-25<br>2. Calculate £50k | Updated rates applied | High |
| **CORE-009** | 2025-26 tax rates | 1. Select 2025-26<br>2. Calculate £50k | Latest rates applied | High |
| **CORE-011** | Scottish vs English rates | 1. Toggle Scottish<br>2. Compare results | Different rates applied | High |

#### Advanced Options

| Test ID | Description | Steps | Expected Result | Priority |
|---------|-------------|-------|-----------------|----------|
| **CORE-016** | Percentage pension (5%) | 1. Enter 5% pension<br>2. Calculate | Correct relief applied | High |
| **CORE-021** | Student Loan Plan 2 | 1. Select Plan 2<br>2. Enter £30k | 9% above £27,295 | High |
| **CORE-028** | NI Category A | 1. Select Category A<br>2. Calculate | Standard rates applied | High |

### Results Display Testing

#### Table Presentation

| Test ID | Description | Steps | Expected Result | Priority |
|---------|-------------|-------|-----------------|----------|
| **RESULTS-001** | Column alignment | View results table | Headers align with data | High |
| **RESULTS-006** | Annual period view | Select Annual | Yearly totals displayed | High |
| **RESULTS-007** | Monthly breakdown | Select Monthly | Accurate ÷12 calculation | High |
| **RESULTS-011** | Color coding | View all categories | Correct colors applied | High |

### Export Functionality

| Test ID | Description | Steps | Expected Result | Priority |
|---------|-------------|-------|-----------------|----------|
| **EXPORT-001** | Excel file generation | Click Export to Excel | .xlsx downloads correctly | High |
| **EXPORT-002** | File opens cleanly | Open downloaded file | No errors in Excel/LibreOffice | High |
| **EXPORT-009** | Print preview | Trigger print preview | Single page, proper layout | High |

---

## 🌐 Cross-Browser & Device Testing

### Browser Support Matrix

| Browser | Version | Status | Testing Priority |
|---------|---------|--------|------------------|
| **Chrome** | Latest | ✅ Fully Supported | High |
| **Firefox** | Latest | ✅ Fully Supported | High |
| **Safari** | Latest | ✅ Fully Supported | High |
| **Edge** | Latest | ✅ Fully Supported | High |
| **iOS Safari** | 15+ | ✅ Mobile Optimized | High |
| **Chrome Mobile** | Latest | ✅ Mobile Optimized | High |

### Device Testing Checklist

#### Mobile (320px - 768px)
- [ ] Calculator form inputs are touch-friendly
- [ ] Results table scrolls horizontally if needed
- [ ] No horizontal overflow
- [ ] Text readable without zooming
- [ ] Buttons large enough for touch targets

#### Tablet (768px - 1024px)
- [ ] Layout adapts appropriately
- [ ] Touch interactions smooth
- [ ] Content scales properly

#### Desktop (1024px+)
- [ ] Content doesn't over-stretch
- [ ] Multi-column layouts work
- [ ] Table utilizes space efficiently

---

## ♿ Accessibility Testing

### Automated Accessibility

**Tools Used**:
- **Lighthouse Accessibility Audit**: 100/100 score
- **axe-core**: Integrated in E2E tests
- **WAVE**: Manual accessibility evaluation

### Manual Accessibility Testing

#### Keyboard Navigation
- [ ] Tab order is logical throughout form
- [ ] Focus indicators clearly visible
- [ ] All interactive elements reachable
- [ ] Enter key submits forms appropriately

#### Screen Reader Compatibility
- [ ] Form labels properly announced
- [ ] Error messages read aloud
- [ ] Results table navigable with screen reader
- [ ] Semantic HTML structure (headings, lists, tables)

#### Visual Accessibility
- [ ] Color contrast meets WCAG AA (4.5:1 ratio)
- [ ] Information not conveyed by color alone
- [ ] Text readable at 200% zoom
- [ ] Icons have text alternatives

---

## 🛠️ Troubleshooting Common Issues

### Test Failures

#### Unit Test Issues
```bash
# Jest watch mode issues
npm run test:watch -- --verbose

# Clear Jest cache
npm run test -- --clearCache

# Update snapshots if UI changed
npm run test:update-snapshots
```

#### E2E Test Issues
```bash
# Run with debug for investigation
npx playwright test --debug

# Clear browser state
npx playwright test --reset-state

# Run specific test file
npx playwright test calculator-basic.spec.ts
```

#### Performance Test Issues
```bash
# Detailed Lighthouse audit
npx lighthouse http://localhost:3000 --output=html

# Bundle analysis for size issues
npm run build:analyze
```

### Common Problems & Solutions

#### Problem: Tests failing after dependency updates
**Solution**:
1. Update test snapshots: `npm run test:update-snapshots`
2. Check for breaking changes in dependencies
3. Update test configurations if needed

#### Problem: E2E tests timing out
**Solution**:
1. Increase timeout in `playwright.config.ts`
2. Add explicit waits for dynamic content
3. Check for network request delays

#### Problem: Performance regression
**Solution**:
1. Run bundle analysis: `npm run build:analyze`
2. Check for large dependency additions
3. Review image optimization and lazy loading

---

## 🚀 Testing Best Practices

### Development Workflow

1. **Write Tests First**: TDD approach for new features
2. **Run Tests Locally**: Before committing changes
3. **Monitor Coverage**: Maintain 90%+ coverage
4. **Regular E2E Runs**: Weekly full regression tests

### Code Quality Gates

```bash
# Pre-commit hooks ensure:
npm run format     # Biome formatting
npm run check      # Linting and type checking
npm run test       # Unit test execution
```

### Continuous Integration

**GitHub Actions Pipeline**:
1. **Quality Stage**: Biome formatting and TypeScript checking
2. **Test Stage**: Unit tests with coverage reporting
3. **E2E Stage**: Playwright tests in multiple browsers
4. **Performance Stage**: Lighthouse CI auditing

---

## 📊 Testing Metrics & Reporting

### Coverage Requirements

- **Minimum Coverage**: 90% for critical paths
- **Branch Coverage**: 85% for business logic
- **Function Coverage**: 95% for public APIs

### Test Reporting

```bash
# Generate coverage report
npm run test:coverage

# Generate E2E report
npx playwright show-report

# Performance report
npm run lighthouse-check
```

### Quality Dashboard

**Key Metrics Tracked**:
- Test pass rate (target: 100%)
- Code coverage percentage (target: 90%+)
- Build success rate (target: 100%)
- Performance scores (target: 95+)
- Zero linting violations

---

## 📚 Testing Resources

### Documentation Links

- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright E2E Testing](https://playwright.dev/docs/intro)
- [Lighthouse Performance Testing](https://developers.google.com/web/tools/lighthouse)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Testing Tools

- **Unit Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright
- **Linting**: Biome
- **Type Checking**: TypeScript
- **Performance**: Lighthouse CI
- **Accessibility**: axe-core, WAVE

---

## 🚀 Production Build & Deployment

### Streamlined Build Scripts

```bash
# Complete production build process
npm run release       # Clean → Fix → Test → Analyze → Audit

# Production deployment ready  
npm run deploy        # Release + deployment confirmation

# Quick production build (no tests)
npm run build:analyze # Build with bundle analyzer
```

### Release Process Checklist

The `npm run release` command automatically:

1. **🧹 Clean**: Remove build artifacts and cache
2. **🔧 Fix**: Format, lint, and typecheck code  
3. **🧪 Test**: Run unit tests with coverage
4. **📊 Analyze**: Generate bundle analysis
5. **🛡️ Audit**: Check for security vulnerabilities

### Build Validation

Before deployment, verify:
- ✅ All 131 unit tests pass
- ✅ Code coverage meets standards
- ✅ Zero linting/TypeScript errors
- ✅ Bundle size is optimized
- ✅ No security vulnerabilities

---

**Last Updated**: September 3, 2025  
**Test Suite Version**: v2.1.0  
**Status**: ✅ 131 unit tests + 157 E2E tests, all auto-generate HTML reports