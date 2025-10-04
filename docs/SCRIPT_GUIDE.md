# 📜 PayeTax Scripts Guide

This document explains all the npm scripts available in PayeTax and when to use them.

**Last Updated**: October 4, 2025
**Version**: v2.2.0 - Optimized Scripts

---

## 🚀 Quick Reference

| Need | Command | Auto-Opens Report |
|------|---------|-------------------|
| **Start Development** | `npm run dev` | ❌ |
| **Run Tests** | `npm test` | ✅ Coverage HTML |
| **Quick E2E Test** | `npm run test:dev` | ✅ E2E HTML |
| **Full Testing** | `npm run test:all` | ✅ Both Reports |
| **Production Build** | `npm run release` | ❌ |
| **Deploy Ready** | `npm run deploy` | ❌ |

---

## 🏃 Development Scripts

### `npm run dev`
**Purpose**: Start development server with hot reloading  
**When to use**: Daily development work  
**What it does**:
- Starts Next.js development server on port 3000
- Enables hot reloading for instant feedback
- Provides detailed error messages and debugging info
- Loads in development mode with unoptimized assets

### `npm run dev:turbo`
**Purpose**: Start development server with Turbopack  
**When to use**: Faster development builds (experimental)  
**What it does**:
- Uses Next.js Turbopack for faster builds
- Experimental faster bundling
- Same hot reloading as regular dev mode

---

## 🏗️ Build Scripts

### `npm run build`
**Purpose**: Create production build  
**When to use**: Testing production builds locally  
**What it does**:
- Compiles TypeScript to JavaScript
- Optimizes and minifies all assets
- Generates static files for pages
- Creates `.next` directory with production files

### `npm run build:analyze`
**Purpose**: Build with bundle size analysis  
**When to use**: Investigating bundle size or optimizing performance  
**What it does**:
- Runs production build with webpack analyzer
- Opens interactive bundle analysis in browser
- Shows detailed breakdown of bundle composition
- Identifies large dependencies and optimization opportunities

### `npm run start`
**Purpose**: Start production server  
**When to use**: Testing production builds locally  
**What it does**:
- Serves the built `.next` directory
- Runs in production mode
- Requires `npm run build` to be run first

---

## ✅ Testing Scripts (Auto-Report Generation)

### `npm test`
**Purpose**: Run unit tests with coverage  
**When to use**: After writing code, before commits  
**Auto-Opens**: Coverage HTML report  
**What it does**:
- Runs all 131 unit tests with Jest
- Generates coverage report (25.35% current coverage)
- Opens interactive HTML coverage report in browser
- Shows line-by-line coverage with red/green highlighting

### `npm run test:watch`
**Purpose**: Run tests in watch mode  
**When to use**: During test-driven development  
**Auto-Opens**: No  
**What it does**:
- Runs tests continuously
- Re-runs tests when files change
- Interactive mode for focusing on specific tests
- Great for TDD workflow

### `npm run test:e2e`
**Purpose**: Run full E2E test suite  
**When to use**: Before releases, comprehensive testing  
**Auto-Opens**: E2E HTML report  
**What it does**:
- Runs 157 E2E tests across ALL browsers:
  - Chrome Desktop
  - Firefox Desktop  
  - Safari Desktop
  - Mobile Chrome
  - Mobile Safari
- Tests real user interactions and workflows
- Opens comprehensive HTML report with videos/screenshots

### `npm run test:dev`
**Purpose**: Quick E2E testing (Chrome only)  
**When to use**: Fast feedback during development  
**Auto-Opens**: E2E HTML report  
**What it does**:
- Runs E2E tests in Chrome only (fastest)
- Perfect for rapid iteration
- Opens HTML report with test results
- Much faster than full cross-browser testing

### `npm run test:all`
**Purpose**: Complete test suite  
**When to use**: Before major releases, comprehensive validation  
**Auto-Opens**: Both HTML reports  
**What it does**:
- Runs unit tests + coverage (opens coverage report)
- Runs full E2E tests all browsers (opens E2E report)
- Most comprehensive testing option
- Takes longest but most thorough

---

## 🔧 Code Quality Scripts

### `npm run fix-all`
**Purpose**: Fix all code quality issues
**When to use**: Before commits, after major changes
**What it does**:
- Formats code with Biome (`npm run format`)
- Fixes linting issues with Biome (`biome check --write .`)
- Runs TypeScript type checking (`npm run typecheck`)
- Ensures zero errors across all quality checks

### `npm run format`
**Purpose**: Format code with Biome
**When to use**: Code formatting issues
**What it does**:
- Formats all TypeScript/JavaScript files
- Applies consistent code style
- Fixes indentation, spacing, semicolons
- Uses modern Biome formatter

### `npm run typecheck`
**Purpose**: Run TypeScript type checking  
**When to use**: Type errors, after major changes  
**What it does**:
- Runs `tsc --noEmit` to check types
- Reports TypeScript errors without building
- Validates type safety across codebase
- Currently maintains zero errors

---

## 🚀 Production & Deployment Scripts

### `npm run release`
**Purpose**: Complete production build process  
**When to use**: **Main production build command**  
**What it does**:
1. **🧹 Clean**: Remove build artifacts and cache
2. **🔧 Fix**: Format, lint, and typecheck code
3. **🧪 Test**: Run unit tests with coverage
4. **📊 Analyze**: Generate bundle analysis
5. **🛡️ Audit**: Check for security vulnerabilities

### `npm run deploy`
**Purpose**: Production deployment ready  
**When to use**: Final deployment preparation  
**What it does**:
- Runs complete `npm run release` process
- Adds deployment confirmation message
- Final validation before deployment

### `npm run debug`
**Purpose**: Debug build issues  
**When to use**: When builds are failing  
**What it does**:
- Runs clean to remove old artifacts
- Runs TypeScript checking to catch errors
- Runs build to identify specific problems
- Helps isolate caching vs code issues

---

## 🧹 Maintenance Scripts

### `npm run clean`
**Purpose**: Remove build artifacts  
**When to use**: Build issues, cache problems  
**What it does**:
- Removes `.next` directory
- Removes `coverage` directory
- Removes `playwright-report` directory
- Removes `test-results` directory
- Removes TypeScript build info files

### `npm run clean:dev`
**Purpose**: Clean and restart development  
**When to use**: Dev server issues  
**What it does**:
- Runs `npm run clean`
- Starts development server fresh
- Good for resolver cache issues

### `npm run clean:all`
**Purpose**: Complete environment reset  
**When to use**: Major dependency issues  
**What it does**:
- Runs `npm run clean`
- Removes `node_modules`
- Runs `npm install`
- Nuclear option for dependency issues

---

## 📊 Monitoring & Analysis Scripts

### `npm run bundle:analyze`
**Purpose**: Analyze bundle composition  
**When to use**: Performance optimization  
**What it does**:
- Runs production build
- Generates webpack bundle analysis
- Opens interactive visualization
- Shows what's contributing to bundle size

### `npm run audit:deps`
**Purpose**: Security audit for dependencies  
**When to use**: Security validation, regular maintenance  
**What it does**:
- Runs `npm audit --audit-level=high`
- Reports security vulnerabilities
- Shows only high-severity issues
- Part of release process

### `npm run check-all`
**Purpose**: Comprehensive code quality check
**When to use**: Pre-commit validation
**What it does**:
- Runs TypeScript checking (`npm run typecheck`)
- Runs Biome linting (`biome check --write .`)
- Runs dependency audit (`npm run audit:deps`)
- Comprehensive validation without building

---

## 🎯 Workflow Recommendations

### Daily Development
```bash
npm run dev          # Start development
npm test             # Quick unit test validation
npm run test:dev     # Quick E2E validation
```

### Before Committing
```bash
npm run fix-all      # Fix code quality issues
npm test             # Validate unit tests
```

### Before Release
```bash
npm run release      # Complete production build
npm run deploy       # Final deployment validation
```

### Debugging Issues
```bash
npm run clean        # Clear cache
npm run debug        # Debug build issues
npm run clean:all    # Nuclear option
```

---

## 🏆 Script Evolution

**Previous Version**: 15+ scripts with manual report management  
**Current Version**: 9 essential scripts with auto-report generation  

**Key Improvements**:
- ✅ Auto-opening HTML reports for all test commands
- ✅ Cross-browser E2E testing by default  
- ✅ Streamlined production build process
- ✅ Eliminated redundant/confusing scripts
- ✅ Clear workflow recommendations

---

**Last Updated**: October 4, 2025
**Script Version**: v2.2.0
**Status**: ✅ Production-ready optimized scripts