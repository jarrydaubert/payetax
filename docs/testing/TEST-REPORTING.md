# Test Reporting & Monitoring Guide

## 📊 Test Report Locations

All test artifacts are consolidated in the `audit-outputs/` directory for easy access and cleanup.

### Directory Structure

```
audit-outputs/
├── playwright-report/     # HTML test reports from Playwright
├── test-results/          # Test artifacts (screenshots, videos, traces)
├── coverage/              # Jest code coverage reports
│   └── lcov-report/      # HTML coverage viewer
├── lighthouse-report.html # Performance audit reports
└── *.png                  # Visual regression baselines
```

---

## 🧪 Test Commands

### Running Tests

```bash
# Jest (Unit Tests)
npm run test                 # Run with coverage + open report
npm run test:no-coverage     # Fast run without coverage
npm run test:watch           # Watch mode for development
npm run test:changed         # Only test changed files

# Playwright (E2E Tests)
npm run test:e2e            # Full E2E suite + open report
npm run test:dev            # Chromium only + open report
npm run test:ci             # CI-optimized run

# Combined
npm run test:all            # Run all tests (Jest + Playwright)
npm run test:quick          # Jest + Chromium E2E
```

### Cleaning Reports

```bash
npm run clean:reports       # Remove all test reports & artifacts
npm run clean               # Full clean (reports + .next + cache)
npm run clean:all           # Nuclear option (+ node_modules)
```

---

## 📁 Report Workflows

### Best Practice: Clean Between Test Runs

**Always clean reports before important test runs:**

```bash
# ✅ CORRECT: Clean before running
npm run clean:reports && npm run test:e2e

# ❌ WRONG: Reports accumulate, causing confusion
npm run test:e2e  # Multiple times = mixed results
```

### Viewing Reports

```bash
# Playwright HTML Report
npm run test:e2e              # Auto-opens report after tests
npx playwright show-report    # View last report manually
open audit-outputs/playwright-report/index.html

# Jest Coverage Report
npm run test                  # Auto-opens coverage after tests
open audit-outputs/coverage/lcov-report/index.html

# Lighthouse Performance Report
npm run lighthouse            # Auto-opens after audit
open audit-outputs/lighthouse-report.html
```

---

## 🎯 Playwright Configuration

### Report Generation

From `playwright.config.ts`:

```typescript
reporter: process.env.CI
  ? [
      ['html', { outputFolder: 'audit-outputs/playwright-report' }],
      ['github']
    ]
  : [['html', { outputFolder: 'audit-outputs/playwright-report' }]],
```

### Artifact Collection

- **Screenshots:** Captured on test failure only
- **Videos:** Retained on failure only
- **Traces:** Retained on failure (for debugging)
- **Output Directory:** `audit-outputs/test-results/`

### Finding Test Artifacts

```bash
# List all screenshots from failed tests
find audit-outputs/test-results -name "*.png"

# List all videos from failed tests
find audit-outputs/test-results -name "*.webm"

# List all trace files
find audit-outputs/test-results -name "trace.zip"
```

---

## 🔍 Monitoring Test Health

### Check Test Results

```bash
# Run tests and check exit code
npm run test:no-coverage
echo $?  # 0 = pass, 1 = fail

# Run E2E and capture results
npm run test:dev 2>&1 | tee test-output.log

# Count passed/failed tests
npm run test:no-coverage 2>&1 | grep -E "Tests:|Test Suites:"
```

### Verify Report Generation

```bash
# After running tests, verify reports exist
ls -lh audit-outputs/playwright-report/
ls -lh audit-outputs/test-results/
ls -lh audit-outputs/coverage/

# Check report sizes (should not be 0 bytes)
du -sh audit-outputs/*
```

---

## 🚨 Common Issues & Solutions

### Issue: No HTML Report Generated

**Symptom:** Tests pass but no `playwright-report/` directory

**Cause:** Running with custom `--reporter` flag overrides config

```bash
# ❌ WRONG: Overrides config, saves to ./playwright-report
npx playwright test --reporter=html

# ✅ CORRECT: Uses config location
npx playwright test  # No reporter flag
npm run test:dev     # Uses package.json scripts
```

**Solution:** Use `npm run` scripts which respect config:

```bash
npm run test:e2e     # Full suite
npm run test:dev     # Chromium only
```

### Issue: Reports from Previous Runs

**Symptom:** Confusing mix of old and new test results

**Solution:** Clean before each important run:

```bash
npm run clean:reports && npm run test:e2e
```

### Issue: Test Results Directory Growing Large

**Symptom:** `audit-outputs/test-results/` is many GB

**Cause:** Videos and screenshots accumulate over time

**Solution:** Regular cleanup:

```bash
# Clean old test artifacts
npm run clean:reports

# Or manually target just artifacts
rm -rf audit-outputs/test-results/*
```

---

## 📈 Coverage Thresholds

From `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 75,
    lines: 80,
    statements: 80,
  },
  './src/lib/taxCalculator.ts': {
    branches: 95,
    functions: 95,
    lines: 95,
    statements: 95,
  },
}
```

**View Coverage:**
- Open `audit-outputs/coverage/lcov-report/index.html`
- Check console output during test run
- Review per-file coverage in report

---

## 🎬 CI/CD Integration

### GitHub Actions / GitLab CI

```yaml
# .gitlab-ci.yml example
test:
  script:
    - npm run clean:reports          # Clean old reports
    - npm run test:ci                # Jest with coverage
    - npm run test:e2e:ci            # Playwright for CI
  artifacts:
    when: always
    paths:
      - audit-outputs/playwright-report/
      - audit-outputs/coverage/
      - audit-outputs/test-results/
    expire_in: 7 days
```

### Pre-commit Hooks

```bash
# .husky/pre-commit
npm run test:changed  # Only test changed files (fast)
npm run typecheck     # TypeScript validation
npm run fix-all       # Lint + format
```

---

## 🏆 Best Practices

### ✅ DO

- Clean reports before important test runs
- Check `audit-outputs/` directory for artifacts
- Use `npm run` scripts (respect config)
- Review HTML reports after failures
- Monitor test-results directory size

### ❌ DON'T

- Run tests without cleaning (confusing reports)
- Use custom `--reporter` flags (breaks paths)
- Ignore failed test artifacts (they help debug!)
- Commit `audit-outputs/` to git (already gitignored)
- Let test-results grow unbounded

---

## 📚 Quick Reference

| Task | Command |
|------|---------|
| Clean all reports | `npm run clean:reports` |
| Run Jest tests | `npm run test:no-coverage` |
| Run E2E tests | `npm run test:dev` |
| View last report | `npx playwright show-report` |
| Open coverage | `open audit-outputs/coverage/lcov-report/index.html` |
| Find screenshots | `find audit-outputs/test-results -name "*.png"` |
| Check disk usage | `du -sh audit-outputs/*` |

---

## 🎯 Example Workflow

```bash
# 1. Clean before new test run
npm run clean:reports

# 2. Run tests
npm run test:e2e

# 3. Check results
ls -lh audit-outputs/playwright-report/   # Verify report exists
find audit-outputs/test-results -name "*.png"  # Check screenshots

# 4. View report
npx playwright show-report  # Opens in browser

# 5. If tests failed, check artifacts
ls -R audit-outputs/test-results/  # Inspect failure artifacts
```

---

**Last Updated:** 2025-11-18  
**Version:** 4.6.0  
**Status:** Production - Validated with 2,566 passing tests
