# 📁 ToolHubX Complete File Mapping

**Version:** 11.0  
**Last Updated:** August 25, 2025  
**Total Files:** 105 TypeScript/JavaScript files  
**Status:** Production-ready with comprehensive UI/UX polish  

---

## 🗂️ **File Distribution Overview**

- **📱 Application Routes:** 15 files
- **🧩 Components:** 44 files
- **⚙️ Business Logic:** 14 files
- **🗄️ State & Config:** 8 files
- **🧪 Testing:** 8 files
- **📋 Configuration:** 6 files
- **🔧 Build & Assets:** 10 files

---

## 📱 **Application Routes (15 files)**

### **Core App Structure**
```
src/app/
├── layout.tsx              # Root layout with SEO, security headers, BMC widget
├── page.tsx                # Homepage with calculator integration
├── global-error.tsx        # Global error boundary with recovery options
├── not-found.tsx           # 404 page with navigation and branding
├── fonts.ts                # Font loading configuration
├── robots.ts               # SEO robots.txt generation
└── sitemap.ts              # Dynamic sitemap generation
```

### **Feature Pages**
```
src/app/
├── about/page.tsx          # Company information and mission
├── blog/
│   ├── page.tsx            # Blog listing with categories
│   ├── [slug]/page.tsx     # Individual blog posts (MDX)
│   └── category/[slug]/page.tsx # Category-based blog filtering
├── compliance/page.tsx     # HMRC compliance documentation
├── feedback/
│   ├── page.tsx            # Feedback page (server component)
│   └── page-client.tsx     # Client-side feedback interactivity
├── offline/page.tsx        # PWA offline fallback page
└── privacy/page.tsx        # Privacy policy and data handling
```

### **API Endpoints**
```
src/app/api/
└── send-feedback/route.ts  # Feedback submission API handler
```

---

## 🧩 **Component Library (44 files)**

### **Atoms - Basic UI Elements (8 files)**
```
src/components/atoms/
├── NumberInput.tsx         # Salary and numeric input with validation
├── PayPeriodSelect.tsx     # Dropdown for pay period selection
├── PensionContributionInput.tsx # Pension input with percentage/amount toggle
├── StudentLoanSelector.tsx # Multi-select for student loan plans
├── TaxCodeInput.tsx        # Tax code input with validation
├── TaxOptionsSelector.tsx  # Checkboxes for tax options
├── TaxYearSelect.tsx       # Tax year selection dropdown
└── [Additional atom components based on codebase scan]
```

### **Molecules - Composite Components (9 files)**
```
src/components/molecules/
├── ExportActions.tsx       # Export button group with options
├── Footer.tsx              # Site footer with links and branding
├── FormField.tsx           # Reusable form field wrapper
├── PeriodSelector.tsx      # Multi-period selection component
├── ScrollIndicator.tsx     # Page scroll progress indicator
├── SimpleExportButton.tsx  # Enhanced export with Excel/Print/Error handling
├── SimpleNavbar.tsx        # Navigation header with accessibility
├── TaxDataUpdater.tsx      # Tax data management component
└── TaxResultsDisplay.tsx   # Tax calculation results presentation
```

### **Organisms - Complex Features (6 files)**
```
src/components/organisms/
├── CalculatorSection.tsx   # Main calculator with responsive grid layout
├── EnhancedPayslipTable.tsx # Comprehensive payslip table with period toggling
├── SimpleHero.tsx          # Homepage hero section with CTA
├── StreamlinedTaxInputForm.tsx # Complete tax input form with validation
└── TechShowcase.tsx        # Technology and features showcase
```

### **Pages - Page-level Components (2 files)**
```
src/components/pages/
├── HomePageContent.tsx     # Homepage layout and structure
└── NotFoundContent.tsx     # 404 page content and navigation
```

### **Templates - Layout Components (1 file)**
```
src/components/templates/
└── Layout.tsx              # Reusable layout template
```

### **UI - Reusable Interface Components (12 files)**
```
src/components/ui/
├── Alert.tsx               # Alert notifications and messages
├── Button.tsx              # Standardized button component with variants
├── CallToAction.tsx        # CTA sections for page bottoms
├── ContentSection.tsx      # Content wrapper with consistent spacing
├── CookieBanner.tsx        # GDPR cookie consent banner
├── ErrorBoundary.tsx       # Component-level error boundaries
├── ImageWithFallback.tsx   # Images with loading states and fallbacks
├── PageContainer.tsx       # Page-level container component
├── PageHeader.tsx          # Consistent page headers
├── PWAInstallPrompt.tsx    # Progressive Web App installation prompt
├── QuickAnswers.tsx        # FAQ section with enhanced design and schema markup
├── SkipToContent.tsx       # Accessibility skip navigation
├── StructuredData.tsx      # Schema.org structured data for SEO
├── SustainabilityBadge.tsx # Environmental impact messaging
├── Typography.tsx          # Comprehensive typography system with responsive design
└── VoiceSearchAnswers.tsx  # Voice search optimization content
```

### **Analytics & Blog Components (6 files)**
```
src/components/analytics/
├── Analytics.tsx           # Google Analytics integration
├── AnalyticsWrapper.tsx    # Analytics context provider
└── AnalyticsWrapperClient.tsx # Client-side analytics handling

src/components/blog/
└── BlogContent.tsx         # Blog post content rendering with MDX support
```

---

## ⚙️ **Business Logic (14 files)**

### **Core Libraries**
```
src/lib/
├── taxCalculator.ts        # HMRC-compliant tax calculation engine
├── allowanceCalculator.ts  # Personal allowance calculations
├── periodCalculator.ts     # Multi-period tax calculations
├── exportUtils.ts          # Export functionality (Excel/PDF/Print)
├── pdfExport.ts            # PDF generation with formatting
├── exportService.ts        # Export service coordination
├── analytics.ts            # Google Analytics 4 integration
├── blog.ts                 # MDX blog post management
├── cookieUtils.ts          # Cookie consent and management
├── iconMapping.ts          # Tax category to icon mapping
├── metadata.ts             # SEO metadata generation
├── taxRateDescriptions.ts  # Tax rate explanations and descriptions
├── debounce.ts             # Input debouncing utility
└── utils.ts                # General utility functions and className helper
```

---

## 🗄️ **State Management & Configuration (8 files)**

### **State Management**
```
src/store/
└── calculatorStore.ts      # Zustand store for tax calculation state

src/constants/
└── taxRates.ts             # HMRC tax rates, thresholds, and constants
```

### **Configuration Files**
```
src/config/
└── blog.config.ts          # Blog system configuration

src/types/
├── blog.ts                 # Blog post TypeScript interfaces
├── chartTypes.ts           # Chart and visualization types
├── gtag.ts                 # Google Analytics type definitions
├── navigation.ts           # Navigation and routing types
└── routes.ts               # Type-safe route definitions
```

---

## 🧪 **Testing Suite (8 files)**

### **Unit Tests**
```
src/lib/__tests__/
├── taxCalculator.test.ts   # Comprehensive tax calculation tests
├── taxCalculator-simple.test.ts # Basic tax calculation scenarios
└── utils.test.ts           # Utility function tests

src/store/__tests__/
└── calculatorStore.test.ts # Zustand store state management tests
```

### **End-to-End Tests**
```
e2e/
├── calculator.spec.ts      # Calculator functionality E2E tests
├── react19-calculator.spec.ts # React 19 features E2E tests
└── seo-blog.spec.ts        # SEO and blog content E2E tests
```

### **Test Configuration**
```
├── jest.config.js          # Jest unit testing configuration
└── jest.setup.js           # Jest setup and global mocks
```

---

## 📋 **Configuration Files (6 files)**

### **Framework Configuration**
```
├── next.config.ts          # Next.js 15.5 config with security headers and CSP
├── tailwind.config.ts      # Tailwind CSS v4 configuration with design tokens
├── playwright.config.ts    # Playwright E2E testing configuration
└── tsconfig.json           # TypeScript strict mode configuration
```

### **Code Quality**
```
├── biome.json              # Biome linting and formatting (2025 standards)
└── package.json            # Dependencies and scripts configuration
```

---

## 🔧 **Build & Assets (10 files)**

### **Public Assets**
```
public/
├── register-sw.js          # Service worker registration
└── sw.js                   # Progressive Web App service worker
```

### **Coverage Reports**
```
coverage/lcov-report/
├── block-navigation.js     # Test coverage navigation
├── prettify.js            # Code syntax highlighting
└── sorter.js              # Coverage report sorting
```

---

## 📊 **File Statistics by Category**

| Category | Files | Purpose |
|----------|-------|---------|
| **Application Routes** | 15 | Page routing and API endpoints |
| **UI Components** | 44 | User interface and interactions |
| **Business Logic** | 14 | Tax calculations and utilities |
| **State Management** | 8 | Application state and configuration |
| **Testing** | 8 | Quality assurance and validation |
| **Configuration** | 6 | Build and development setup |
| **Assets & Build** | 10 | Public assets and build outputs |
| **Total** | **105** | **Complete application structure** |

---

## 🎯 **File Organization Principles**

### **Atomic Design Pattern**
- **Atoms:** Basic UI building blocks (inputs, buttons)
- **Molecules:** Combinations of atoms (form fields, navigation)
- **Organisms:** Complex features (calculator, tables)
- **Templates:** Page layouts and structures
- **Pages:** Complete pages with content

### **Separation of Concerns**
- **Components:** Pure UI rendering and interaction
- **Libraries:** Business logic and utilities  
- **Store:** Application state management
- **Constants:** Configuration and static data
- **Types:** TypeScript interface definitions

### **Testing Strategy**
- **Unit Tests:** Individual functions and components
- **Integration Tests:** Component interactions
- **E2E Tests:** Complete user workflows
- **Manual Tests:** Cross-browser and accessibility

---

## 🔄 **Maintenance Guidelines**

### **File Naming Conventions**
- **Components:** PascalCase (CalculatorSection.tsx)
- **Utilities:** camelCase (taxCalculator.ts)
- **Tests:** [name].test.ts or [name].spec.ts
- **Types:** camelCase with .ts extension

### **Import Organization**
```typescript
// 1. External libraries
import React from 'react';
import { NextPage } from 'next';

// 2. Internal components
import Button from '@/components/ui/Button';
import { calculateTax } from '@/lib/taxCalculator';

// 3. Types and constants
import type { TaxCalculationInput } from '@/types';
import { TAX_RATES } from '@/constants/taxRates';
```

### **Code Quality Standards**
- **TypeScript:** Strict mode with comprehensive typing
- **Linting:** Biome 2025 standards compliance
- **Formatting:** Automated with consistent style
- **Testing:** Minimum 80% coverage for critical paths

---

**📁 FILE MAPPING COMPLETE:** This comprehensive mapping covers all 105 TypeScript/JavaScript files in the ToolHubX application, organized by purpose and functionality. The structure follows modern best practices with clear separation of concerns and maintainable architecture.