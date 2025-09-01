# 📜 Package.json Scripts Guide

This document explains all the npm scripts available in the project and when to use them.

## 🏃 Development Scripts

### `npm run dev`
**Purpose**: Start the development server with hot reloading  
**When to use**: Daily development work  
**What it does**:
- Starts Next.js development server on port 3000
- Enables hot reloading for instant feedback
- Provides detailed error messages and debugging info
- Loads in development mode with unoptimized assets

### `npm run quick-start`
**Purpose**: Clean build artifacts and start development server  
**When to use**: When dev server is acting up or after switching branches  
**What it does**:
- Runs `npm run clean` to remove build artifacts
- Starts development server fresh
- Faster alternative to full reset

### `npm run dev-setup`
**Purpose**: Complete fresh development environment setup  
**When to use**: First time setup or after major changes  
**What it does**:
- Runs `npm run clean:all` (removes node_modules and reinstalls)
- Runs `npm run fix-all` (formatting, linting, type checking)
- Starts development server
- Takes longer but ensures clean environment

---

## 🏗️ Build Scripts

### `npm run build`
**Purpose**: Create production build  
**When to use**: Before deployment or testing production builds  
**What it does**:
- Compiles TypeScript to JavaScript
- Optimizes and minifies all assets
- Generates static files for pages
- Creates `.next` directory with production files

### `npm run build:analyze`
**Purpose**: Build with bundle size analysis  
**When to use**: Investigating bundle size or optimizing performance  
**What it does**:
- Runs production build
- Generates bundle analysis report
- Opens webpack-bundle-analyzer in browser
- Shows detailed breakdown of what's in your bundles

### `npm run debug-build`
**Purpose**: Isolate and debug build issues  
**When to use**: When builds are failing  
**What it does**:
- Runs clean to remove old artifacts
- Runs type checking to catch TypeScript errors
- Runs build to identify specific build problems
- Helps isolate whether issues are caching or code-related

---

## ✅ Testing Scripts

### `npm run test`
**Purpose**: Run unit tests with Jest  
**When to use**: After writing code, before commits  
**What it does**:
- Executes all `.test.ts` and `.test.tsx` files
- Shows test results and coverage summary
- Fails if any tests fail

### `npm run test:watch`
**Purpose**: Run tests in watch mode  
**When to use**: During test-driven development  
**What it does**:
- Runs tests continuously
- Re-runs tests when files change
- Interactive mode for focusing on specific tests

### `npm run test:coverage`
**Purpose**: Generate detailed code coverage report  
**When to use**: Checking test coverage quality  
**What it does**:
- Runs all tests
- Generates coverage report in `coverage/` directory
- Shows which lines/branches are not tested

### `npm run test:e2e`
**Purpose**: Run end-to-end tests with Playwright  
**When to use**: Before releases, testing user workflows  
**What it does**:
- Starts development server automatically
- Runs tests in multiple browsers (Chrome, Firefox, Safari)
- Tests real user interactions and workflows

### `npm run test:e2e:ui`
**Purpose**: Run E2E tests with interactive UI  
**When to use**: Debugging failing E2E tests  
**What it does**:
- Opens Playwright test runner UI
- Allows step-by-step debugging
- Visual test execution and inspection

### Browser-Specific Testing

#### `npm run test:chrome`
**Purpose**: Run tests only in Chrome  
**What it does**: Fast E2E testing in single browser

#### `npm run test:firefox`
**Purpose**: Run tests only in Firefox  
**What it does**: Test Firefox-specific compatibility

#### `npm run test:safari`
**Purpose**: Run tests only in WebKit/Safari  
**What it does**: Test Safari-specific compatibility

#### `npm run test:browsers`
**Purpose**: Run tests across all desktop browsers  
**What it does**: Tests Chrome, Firefox, and Safari together

#### `npm run test:mobile`
**Purpose**: Run tests on mobile browsers  
**What it does**: Tests Mobile Chrome and Mobile Safari

#### `npm run test:compatibility`
**Purpose**: Run comprehensive browser compatibility tests  
**What it does**: Executes the dedicated browser compatibility test suite

---

## 🔧 Code Quality Scripts

### `npm run lint`
**Purpose**: Check and fix code style issues  
**When to use**: Before commits, daily development  
**What it does**:
- Runs Biome linter on all source files
- Automatically fixes auto-fixable issues
- Reports remaining issues that need manual attention

### `npm run format`
**Purpose**: Format code according to project standards  
**When to use**: Before commits, after messy coding sessions  
**What it does**:
- Runs Biome formatter on all source files
- Ensures consistent indentation, spacing, and style
- Modifies files in place

### `npm run typecheck`
**Purpose**: Check TypeScript types without building  
**When to use**: Quick type checking, before commits  
**What it does**:
- Runs TypeScript compiler in check mode
- Reports type errors without generating files
- Faster than full build for type checking

---

## 🚀 Combined Workflow Scripts

### `npm run fix-all`
**Purpose**: Complete code quality check and fix  
**When to use**: Before every commit, daily cleanup  
**What it does**:
1. Formats all code (`npm run format`)
2. Runs linter with fixes (`npm run lint`)
3. Checks all TypeScript types (`npm run typecheck`)
**Success means**: Code is properly formatted, linted, and type-safe

### `npm run check-all`
**Purpose**: Comprehensive validation without changes  
**When to use**: CI checks, pre-push validation  
**What it does**:
1. Type checking (`npm run typecheck`)
2. Linting validation (`npm run lint`)
3. Security audit (`npm run audit:deps`)
**Success means**: Code quality and security are acceptable

### `npm run test-quick`
**Purpose**: Fast test suite for quick feedback  
**When to use**: During development, before commits  
**What it does**:
- Runs unit tests (allows no tests to pass)
- Runs Chrome E2E tests only
- Optimized for speed over comprehensiveness

### `npm run test-full`
**Purpose**: Comprehensive testing across all environments  
**When to use**: Before releases, important milestones  
**What it does**:
1. Runs tests with coverage report
2. Tests all browsers (Chrome, Firefox, Safari)
3. Runs compatibility tests
**Takes longer but ensures quality**

### `npm run test-all`
**Purpose**: Standard test suite (unit + E2E)  
**When to use**: Regular testing, CI pipelines  
**What it does**:
- Runs unit tests
- Runs E2E tests in all configured browsers
- Good balance of speed and coverage

---

## 🧹 Cleanup Scripts

### `npm run clean`
**Purpose**: Remove build artifacts and temporary files  
**When to use**: When builds are acting weird, switching branches  
**What it does**:
- Removes `.next` directory
- Removes `coverage` directory
- Removes `playwright-report` and `test-results`
- Removes TypeScript build info files

### `npm run clean:all`
**Purpose**: Nuclear option - complete project reset  
**When to use**: When everything is broken, dependency conflicts  
**What it does**:
1. Runs `npm run clean`
2. Removes `node_modules` directory
3. Runs fresh `npm install`
**Warning**: Takes several minutes but fixes most issues

### `npm run full-reset`
**Purpose**: Complete reset and setup  
**When to use**: After major package updates, corruption  
**What it does**:
1. Complete cleanup (`npm run clean:all`)
2. Full development setup (`npm run dev-setup`)
**Nuclear option with immediate usability**

---

## 📊 Monitoring & Analysis Scripts

### `npm run lighthouse`
**Purpose**: Run Lighthouse performance audit  
**When to use**: Checking performance metrics  
**What it does**:
- Audits localhost:3000 for performance
- Generates HTML report
- Opens report in browser automatically

### `npm run lighthouse:ci`
**Purpose**: Automated Lighthouse testing  
**When to use**: CI/CD pipelines, automated testing  
**What it does**:
- Builds and starts server automatically
- Runs multiple Lighthouse audits
- Suitable for automation

### `npm run monitor:performance`
**Purpose**: Comprehensive performance monitoring  
**When to use**: Regular performance checkups  
**What it does**:
- Runs detailed performance analysis
- Tracks performance trends over time
- Generates recommendations for improvements

### `npm run bundle:analyze`
**Purpose**: Analyze bundle size without building  
**When to use**: Quick bundle size check  
**What it does**:
- Analyzes existing build for bundle sizes
- Shows size trends over time
- Requires existing build

### `npm run bundle:monitor`
**Purpose**: Full bundle analysis with fresh build  
**When to use**: Comprehensive bundle investigation  
**What it does**:
1. Fresh production build
2. Complete bundle size analysis
3. Historical comparison and trends

---

## 🔒 Security Scripts

### `npm run audit:deps`
**Purpose**: Check for vulnerable dependencies  
**When to use**: Monthly security checkups, before releases  
**What it does**:
- Scans all dependencies for known vulnerabilities
- Reports high-severity issues only
- Fails build if critical vulnerabilities found

### `npm run audit:security`
**Purpose**: Comprehensive security audit with reporting  
**When to use**: Detailed security analysis  
**What it does**:
- Detailed vulnerability analysis
- Security trend tracking
- Recommendations for fixes
- Historical security posture tracking

### `npm run audit:security:fix`
**Purpose**: Attempt automatic security fixes  
**When to use**: After finding security issues  
**What it does**:
1. Runs `npm audit fix` to auto-fix issues
2. Re-runs security audit to verify fixes
3. Shows remaining manual issues

---

## 🚢 Deployment Workflow Scripts

### `npm run pre-commit`
**Purpose**: Validate code before committing  
**When to use**: Git pre-commit hooks, manual validation  
**What it does**:
1. Fix all code quality issues (`npm run fix-all`)
2. Run quick tests (`npm run test-quick`)
**Fast validation suitable for every commit**

### `npm run pre-push`
**Purpose**: Comprehensive validation before pushing  
**When to use**: Before pushing to main branch  
**What it does**:
1. Complete validation (`npm run check-all`)
2. Full test suite (`npm run test-all`)
3. Production build verification (`npm run build`)
**Ensures push won't break main branch**

### `npm run release-check`
**Purpose**: Complete pre-release validation  
**When to use**: Before creating releases or deploying  
**What it does**:
1. Code quality fixes (`npm run fix-all`)
2. Comprehensive testing (`npm run test-full`)
3. Production build (`npm run build`)
4. Performance audit (`npm run audit:perf:ci`)
**Most thorough validation available**

### `npm run deploy-prep`
**Purpose**: Prepare for deployment  
**When to use**: Before deploying to production  
**What it does**:
1. Clean environment (`npm run clean`)
2. Code quality fixes (`npm run fix-all`)
3. Full testing (`npm run test-full`)
4. Bundle analysis (`npm run build:analyze`)
**Ensures deployment readiness**

### `npm run post-deploy`
**Purpose**: Verify deployment health  
**When to use**: After successful deployment  
**What it does**:
1. Performance monitoring (`npm run monitor:performance`)
2. Health check (`npm run health-check`)
**Confirms deployment is working correctly**

---

## 🔍 Debug Scripts

### `npm run debug-tests`
**Purpose**: Investigate test failures  
**When to use**: When tests are failing unexpectedly  
**What it does**:
- Runs tests with coverage report
- Opens interactive E2E test UI
- Provides detailed failure information

### `npm run health-check`
**Purpose**: Overall project health assessment  
**When to use**: Weekly health checks, after major changes  
**What it does**:
1. Code quality validation (`npm run check-all`)
2. All monitoring checks (`npm run monitor-all`)
**Comprehensive project health report**

### `npm run monitor-all`
**Purpose**: Run all monitoring and analysis tools  
**When to use**: Comprehensive project analysis  
**What it does**:
1. Security audit (`npm run audit:security`)
2. Bundle analysis (`npm run bundle:analyze`)  
3. Performance monitoring (`npm run monitor:performance`)
**Takes time but provides complete project insights**

---

## 🎯 Quick Reference

### Daily Development
```bash
npm run quick-start      # Start fresh development
npm run pre-commit       # Before each commit
npm run test-quick       # Quick testing
```

### Weekly Maintenance
```bash
npm run health-check     # Overall project health
npm run test-full        # Comprehensive testing
npm run monitor-all      # Complete analysis
```

### Before Important Milestones
```bash
npm run pre-push         # Before pushing to main
npm run release-check    # Before releases
npm run deploy-prep      # Before deployment
```

### When Things Go Wrong
```bash
npm run debug-build      # Build issues
npm run debug-tests      # Test failures
npm run full-reset       # Nuclear option
```

---

**Last Updated**: August 28, 2025  
**Scripts Count**: 45 total scripts  
**Workflow Coverage**: Development, Testing, Building, Deployment, Monitoring, Debugging