# 🏗️ PayeTax Project Structure & Architecture

This document provides comprehensive documentation of the project's file organization, architecture patterns, and development statistics.

## 📊 Project Overview

| Metric | Value | Details |
|--------|--------|---------|
| **Total Files** | 147 files | Processed by Biome (TS/TSX/JS/JSX/JSON/MDX) |
| **Components** | 58 files | Atomic design with UI library |
| **Tests** | 21 test files | 16 unit tests + 5 E2E test suites |
| **Code Quality** | Zero violations | All Biome linting issues resolved |
| **TypeScript** | Strict mode | Zero errors across entire codebase |
| **Architecture** | Next.js 15.5 App Router | Server/client component separation |

---

## 🗂️ Directory Structure

```
toolhubx/
├── 📁 docs/                           # Streamlined documentation (NEW)
│   ├── STRUCTURE.md                   # This file - architecture overview
│   ├── DEPLOYMENT.md                  # Production deployment guide
│   ├── DEVELOPMENT_PLAN.md            # Roadmap & lessons learned
│   ├── TESTING.md                     # Test coverage & procedures
│   └── USER_GUIDE.md                  # End-user documentation
│
├── 📁 src/
│   ├── 📁 app/                        # Next.js 15 App Router
│   ├── 📁 components/                 # Atomic design architecture
│   ├── 📁 lib/                        # Business logic & utilities
│   ├── 📁 store/                      # State management
│   ├── 📁 types/                      # TypeScript definitions
│   └── 📁 constants/                  # Application constants
│
├── 📁 content/                        # MDX blog content
├── 📁 public/                         # Static assets
├── 📁 e2e/                           # End-to-end tests
└── 🔧 Config files                    # Build & development tools
```

---

## 🧪 Testing Architecture

### Test File Organization

```
📊 Test Coverage Overview
├── Unit Tests (21 files)
│   ├── src/app/blog/__tests__/
│   │   └── page.test.tsx              # Blog page tests
│   │
│   ├── src/components/atoms/__tests__/
│   │   ├── NumberInput.test.tsx       # Numeric input validation
│   │   ├── StudentLoanSelector.test.tsx # Loan selector tests
│   │   └── TaxYearSelect.test.tsx     # Tax year dropdown tests
│   │
│   ├── src/components/ui/__tests__/
│   │   └── Button.test.tsx            # Button component tests
│   │
│   ├── src/lib/__tests__/
│   │   ├── allowanceCalculator.test.ts # Allowance calculations
│   │   ├── analytics.test.ts          # Analytics utilities
│   │   ├── blog.test.ts               # Blog management
│   │   ├── cookieUtils.test.ts        # Cookie utilities
│   │   ├── debounce.test.ts           # Debounce utilities
│   │   ├── exportUtils.test.ts        # Export functionality
│   │   ├── metadata.test.ts           # SEO metadata
│   │   ├── pdfExport.test.ts          # PDF generation
│   │   ├── taxCalculator.test.ts      # Main tax engine
│   │   ├── taxCalculator-simple.test.ts # Basic tax calculations
│   │   ├── taxRateDescriptions.test.ts # Tax band descriptions
│   │   └── utils.test.ts              # General utilities
│   │
│   ├── src/store/__tests__/
│   │   └── calculatorStore.test.ts    # Zustand store tests
│   │
│   └── src/types/__tests__/
│       ├── gtag.test.ts               # Google Analytics types
│       ├── navigation.test.ts         # Navigation types
│       └── routes.test.ts             # Route types
│
└── E2E Tests (5 files)
    ├── calculator.spec.ts             # Core calculator functionality
    ├── layout-integrity.spec.ts       # Layout & responsiveness
    ├── react19-calculator.spec.ts     # React 19 specific features
    ├── seo-blog.spec.ts              # SEO & blog functionality
    └── helpers/tax-test-helpers.ts    # Test utilities
```

### Test Configuration

| File | Purpose |
|------|---------|
| `jest.config.js` | Jest unit testing configuration |
| `jest.setup.js` | Test environment setup |
| `playwright.config.ts` | E2E testing configuration |
| `src/setupTests.ts` | Global test utilities |

---

## 🎨 Component Architecture

### Atomic Design Structure

```
src/components/
├── 🔬 atoms/                          # Basic building blocks (9 files)
│   ├── NumberInput.tsx                # Numeric input with validation
│   ├── PayPeriodSelect.tsx           # Pay period dropdown
│   ├── PensionContributionInput.tsx  # Pension input component
│   ├── PeriodCheckbox.tsx            # Period selection checkbox (NEW)
│   ├── ScrollIndicator.tsx           # Scroll indicator with gradient (NEW)
│   ├── StudentLoanSelector.tsx       # Student loan type selector
│   ├── TaxCodeInput.tsx              # Tax code input with validation
│   ├── TaxOptionsSelector.tsx        # Additional tax options
│   ├── TaxYearSelect.tsx             # Tax year dropdown
│   └── __tests__/                    # (Directory exists, tests pending)
│
├── 🧬 molecules/                      # Simple combinations (7 files)
│   ├── CurrencyInput.tsx             # Currency input with formatting
│   ├── Footer.tsx                    # Site footer
│   ├── FormField.tsx                 # Form field wrapper
│   ├── PeriodSelectorCard.tsx        # Period selection card (NEW)
│   ├── ResultCard.tsx                # Result display card
│   ├── ResultTableRow.tsx            # Table row for results (NEW)
│   └── SimpleNavbar.tsx              # Site navigation
│
├── 🧩 organisms/                      # Complex components (10 files)
│   ├── CalculatorContainer.tsx       # Main calculator orchestrator
│   ├── SimpleHero.tsx                # Homepage hero section
│   ├── TechShowcase.tsx              # Technology showcase
│   │
│   ├── CalculatorInputs/             # Input form components
│   │   ├── BasicInputs.tsx           # Salary, pay period, tax year inputs
│   │   ├── CalculatorInputsSection.tsx # Input section wrapper
│   │   ├── DeductionsInputs.tsx      # Pension & student loan inputs
│   │   └── TaxSettings.tsx           # Tax code & region settings
│   │
│   ├── CalculatorResults/            # Results display components
│   │   ├── CalculatorResultsSection.tsx # Results section wrapper
│   │   ├── ResultsSummaryCards.tsx   # Summary cards display
│   │   └── ResultsTable.tsx          # Detailed results table (refactored)
│   │
│   └── __tests__/                    # Component tests
│       └── (tests pending)
│
├── 📄 pages/                          # Page-level components
│   ├── HomePageContent.tsx           # Homepage client component
│   └── NotFoundContent.tsx           # 404 page content
│
├── 🏗️ templates/                     # Layout templates
│   └── Layout.tsx                    # Global layout wrapper
│
└── 🎨 ui/                            # Design system components
    ├── Alert.tsx                     # Alert notifications
    ├── Button.tsx                    # Button component
    ├── CallToAction.tsx              # CTA sections
    ├── ContentSection.tsx            # Content wrapper
    ├── CookieBanner.tsx              # Cookie consent
    ├── ErrorBoundary.tsx             # Error handling
    ├── ImageWithFallback.tsx         # Image component
    ├── PWAInstallPrompt.tsx          # PWA installation
    ├── PageContainer.tsx             # Page wrapper
    ├── PageHeader.tsx                # Page headers
    ├── QuickAnswers.tsx              # FAQ component
    ├── SkipToContent.tsx             # Accessibility
    ├── StructuredData.tsx            # SEO structured data
    ├── SustainabilityBadge.tsx       # Environmental badge
    ├── Typography.tsx                # Typography system
    ├── VoiceSearchAnswers.tsx        # Voice search optimization
    └── __tests__/
        └── Button.test.tsx
```

---

## 🏭 Business Logic & Data Layer

### Core Libraries

```
src/lib/
├── 💰 Tax Engine
│   ├── taxCalculator.ts              # HMRC-compliant calculation engine
│   ├── allowanceCalculator.ts        # Tax allowance calculations
│   ├── periodCalculator.ts           # Multi-period calculations
│   └── taxRateDescriptions.ts        # Tax band descriptions
│
├── 📊 Export & PDF
│   ├── exportService.ts              # Export orchestration
│   ├── exportUtils.ts                # Excel/CSV export utilities
│   └── pdfExport.ts                  # PDF generation service
│
├── 📝 Content Management
│   ├── blog.ts                       # Blog content management
│   ├── metadata.ts                   # SEO metadata generation
│   └── iconMapping.ts                # Icon mapping system
│
├── 🔧 Utilities
│   ├── utils.ts                      # General utilities
│   ├── debounce.ts                   # Debouncing utilities
│   ├── cookieUtils.ts                # Cookie management
│   └── analytics.ts                  # Analytics utilities
│
└── __tests__/                        # Business logic tests
    ├── exportUtils.test.ts
    ├── taxCalculator.test.ts
    ├── taxCalculator-simple.test.ts
    └── utils.test.ts
```

### State Management

```
src/store/
├── calculatorStore.ts                # Zustand tax calculator state
└── __tests__/
    └── calculatorStore.test.ts       # State management tests
```

### Type Definitions

```
src/types/
├── blog.ts                          # Blog-related types
├── chartTypes.ts                    # Chart component types
├── gtag.ts                          # Google Analytics types
├── navigation.ts                    # Navigation types
└── routes.ts                        # Routing types
```

### Constants & Configuration

```
src/constants/
├── taxRates.ts                      # HMRC tax rates & thresholds
src/config/
└── blog.config.ts                   # Blog configuration
```

---

## 🌐 Pages & Routing Structure

### App Router Pages

```
src/app/
├── 🏠 Core Pages
│   ├── layout.tsx                   # Root layout with analytics
│   ├── page.tsx                     # Homepage with calculator
│   ├── not-found.tsx               # Custom 404 page
│   ├── global-error.tsx            # Global error boundary
│   └── offline/page.tsx            # PWA offline page
│
├── ℹ️ Information Pages
│   ├── about/
│   │   ├── page.tsx                # About page
│   │   └── experts/                # Expert information
│   ├── privacy/page.tsx            # Privacy policy
│   └── compliance/page.tsx         # Compliance information
│
├── 📝 Blog System
│   ├── blog/
│   │   ├── page.tsx                # Blog index
│   │   ├── [slug]/page.tsx         # Individual blog posts
│   │   ├── category/[slug]/page.tsx # Category pages
│   │   └── __tests__/page.test.tsx  # Blog tests
│
├── 💬 User Interaction
│   ├── feedback/
│   │   ├── page.tsx                # Server component wrapper
│   │   └── page-client.tsx         # Client-side form
│
├── 🔧 Utilities & Meta
│   ├── fonts.ts                    # Font definitions
│   ├── globals.css                 # Global styles
│   ├── robots.ts                   # SEO robots.txt
│   └── sitemap.ts                  # Dynamic sitemap
│
└── 📡 API Routes
    └── api/send-feedback/route.ts   # Feedback submission endpoint
```

---

## 📦 Build & Configuration Files

### Core Configuration

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `tsconfig.json` | TypeScript configuration |
| `package.json` | Dependencies and scripts |
| `biome.json` | Code formatting and linting |

### Build Tools

| File | Purpose |
|------|---------|
| `postcss.config.mjs` | PostCSS configuration |
| `next-env.d.ts` | Next.js type definitions |
| `tsconfig.tsbuildinfo` | TypeScript build cache |

### Deployment

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel deployment configuration |
| `public/manifest.json` | PWA manifest |
| `public/sw.js` | Service worker |
| `public/register-sw.js` | Service worker registration |

---

## 🎯 Content & Assets

### Blog Content

```
content/blog/                         # MDX blog posts
├── beginners-guide-to-uk-taxation.mdx
├── how-much-tax-will-i-pay-uk-2025.mdx
├── scottish-vs-english-tax-rates-2025-comparison.mdx
├── student-loan-repayment-changes-2025-26.mdx
├── uk-tax-calculator-2025-complete-guide.mdx
├── uk-tax-changes-2025-complete-guide.mdx
└── understanding-uk-tax-codes.mdx
```

### Static Assets

```
public/
├── 🖼️ Images
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── apple-touch-icon.png
│   ├── favicon.ico
│   └── images/blog/                 # Blog images
│       ├── placeholder.jpg
│       ├── tax-codes-guide.jpg
│       ├── uk-tax-beginners.jpg
│       └── uk-tax-calculator-2025.jpg
│
└── 📄 Meta Files
    ├── manifest.json               # PWA manifest
    ├── sw.js                       # Service worker
    ├── register-sw.js             # SW registration
    └── ads.txt                     # Advertising verification
```

---

## 🏗️ Architecture Patterns

### Design Principles

1. **Atomic Design** - Components organized by complexity and reusability
2. **Single Responsibility** - Each component has one clear purpose
3. **Composition over Inheritance** - Flexible component combinations
4. **Server-First** - Leverage Next.js server components where possible
5. **Type Safety** - Comprehensive TypeScript coverage with strict mode

### Key Patterns

#### Glass-Morphism Design System
```css
.glass-card {
  @apply bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl;
}
```

#### State Management Pattern
- **Zustand Store** for calculator state
- **Server Components** for static content
- **Client Components** for interactivity

#### Error Handling Strategy
- **Error Boundaries** at component level
- **Global Error Handler** for app-wide errors
- **Graceful Degradation** for failed features

---

## 📈 Development Statistics

### Code Quality Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|---------|
| TypeScript Errors | 0 | 0 | ✅ |
| Biome Violations | 0 | 0 | ✅ |
| Test Coverage | TBD | 80% | ⚪ |
| Bundle Size | ~280kB | <300kB | ✅ |
| Lighthouse Performance | TBD | 95+ | ⚪ |

### File Distribution

| Category | Count | Notes |
|----------|--------|-------|
| Components | 58 | Atomic design (atoms, molecules, organisms, ui) |
| Tests | 26 | 21 unit tests + 5 E2E test suites |
| Pages | 12 | Next.js 15.5 App Router pages |
| Utilities | 17 | Business logic & helper functions |
| Configuration | 10 | Build, lint, test configs |
| Assets | 15+ | Images, icons, manifest files |

---

## 🎯 Architecture Benefits

### Performance Optimizations

1. **Server Components** - Reduced client-side JavaScript
2. **Code Splitting** - Automatic route-based splitting
3. **Image Optimization** - Next.js automatic WebP conversion
4. **Bundle Analysis** - Regular size monitoring
5. **Caching Strategy** - Effective static and dynamic caching

### Developer Experience

1. **Type Safety** - Comprehensive TypeScript coverage
2. **Hot Reload** - Fast development iterations
3. **Consistent Formatting** - Automated with Biome
4. **Comprehensive Testing** - Unit and E2E coverage
5. **Clear Documentation** - Well-documented architecture

### Maintainability

1. **Modular Structure** - Easy to locate and modify code
2. **Atomic Components** - Reusable and testable units
3. **Separation of Concerns** - Clear boundaries between layers
4. **Version Control** - Clean Git history with meaningful commits
5. **Continuous Integration** - Automated quality checks

---

*This document is automatically updated to reflect the current project structure and should be referenced for architectural decisions and onboarding new developers.*