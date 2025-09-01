# 🧪 ToolHubX Testing & Quality Assurance Guide

This document provides comprehensive testing strategies, manual test suites, automated testing information, and troubleshooting guides for maintaining quality in the ToolHubX UK Tax Calculator.

---

## 📋 Testing Overview

### Current Testing Status

| Testing Type | Status | Coverage | Tools |
|--------------|--------|----------|-------|
| **Unit Tests** | ✅ Active | 89% | Jest + React Testing Library |
| **E2E Tests** | ✅ Active | 5 Test Suites | Playwright |
| **Linting** | ✅ Active | 110 Files | Biome |
| **Type Checking** | ✅ Active | Zero Errors | TypeScript 5.9 |
| **Performance** | ✅ Active | Lighthouse CI | Automated |

### Quality Metrics

- **Test Coverage**: 89% (Target: 90%)
- **Biome Violations**: 0 across 110 files
- **TypeScript Errors**: 0
- **E2E Pass Rate**: 100% on critical user journeys
- **Performance Score**: 97/100 (Lighthouse)

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

**Running Tests**:
```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage

# Update snapshots
npm run test:update-snapshots
```

**Key Test Categories**:
- **Calculator Logic**: Tax, NI, student loan calculations
- **Component Behavior**: Form inputs, result displays
- **Error Boundaries**: Graceful failure handling
- **Accessibility**: ARIA attributes, keyboard navigation

### End-to-End Testing (Playwright)

**Test Suites**:
1. **Basic Calculator Flow**: Salary input → calculation → results
2. **Advanced Options**: Scottish rates, student loans, pensions
3. **Export Functionality**: Excel export and print preview
4. **Responsive Design**: Mobile/tablet/desktop layouts
5. **Error Handling**: Invalid inputs and edge cases

**Running E2E Tests**:
```bash
# Run all E2E tests
npm run test:e2e

# Run specific suite
npx playwright test calculator-basic

# Debug mode with browser
npx playwright test --debug

# Generate test report
npx playwright show-report
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

**Last Updated**: August 27, 2025  
**Test Suite Version**: v2.0.0  
**Status**: ✅ Comprehensive testing strategy active with 89% coverage