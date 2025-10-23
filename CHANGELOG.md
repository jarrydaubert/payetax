# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.7.3] - 2025-10-23

### Added
- Enhanced print export to mirror results table exactly with What If scenario support
- User-selected visible periods from period selector now respected in print output
- Percentage column and all table rows in print (tax bands, student loans, NI, pension, allowances, employer NI, year change)
- Color-coded headers for Current vs What If columns in print layout
- Professional print layout: landscape A4, centered, max-width 1200px

### Changed
- Calculate button scroll behavior now mobile-only, preserves desktop view
- Print function signature updated to object-based parameters for better flexibility
- Results section now has scroll-mt-6 for proper spacing when scrolling into view

### Fixed
- Desktop view no longer disrupted when clicking Calculate button
- Print output now includes complete table data matching user's view
- All tests updated to match new print function signature (1872 tests passing)

## [3.6.0] - 2025-10-21

### Added
- Interactive tooltips on all 5 summary cards explaining tax metrics
- Live character counter (10/5000) in feedback form with color-coded warnings
- Marriage Allowance eligibility alert with centered heart icon
- Clear explanations for annual/monthly take-home, tax totals, effective rate, and marginal rate

### Changed
- Replaced X icon with RotateCcw icon in What If Clear button for consistency
- Reduced What If Clear button size from 'lg' to 'default' for better layout
- Improved feedback form with dynamic hints and real-time validation
- Enhanced accessibility with aria-invalid, aria-describedby, and role='alert' attributes

### Fixed
- Better error handling for malformed API responses in feedback system
- Maximum length enforcement on textarea to prevent client-side over-submission

## [3.5.1] - 2025-10-21

### Fixed
- Resolved 5 accessibility linting errors in UI components
- Replaced div role='group' with semantic fieldset elements
- Replaced div role='button' with semantic button element
- Fixed array index key usage with stable identifiers in FieldError component
- Updated ResultsSummaryCards tests to reflect 5-card layout

## [3.5.0] - 2025-10-20

### Added
- Marriage Allowance eligibility alert shown when user qualifies
- What If scenario Clear button for better UX
- Auto-scroll to results when Calculate or Compare buttons are clicked

### Changed
- Fixed What If dropdown background styling to use default Select appearance
- Improved What If scenario UX with clearer visual feedback
- Updated tooltips and input group components

### Fixed
- Test coverage improvements for atoms folder
- Optimized test configurations for better performance

## [3.4.1] - 2025-10-20

### Changed
- Added CONTRIBUTING.md compliance checklist
- Moved audit documentation to docs/audits per guidelines
- Improved documentation organization and clarity

## [3.4.0] - 2025-10-20

### Added
- Complete homepage optimization with hero section improvements
- Enhanced tooltip system across the application
- shadcn UI components (Spinner, Empty, CategoryFilter)
- Field and Input Group components from shadcn

### Changed
- Optimized Linear integration with issue update commands
- Added support for sub-issues with --parent flag
- Cleaned up duplicate/unused npm scripts

### Fixed
- CICD documentation organization
- Various UX improvements based on user feedback

## [Unreleased]

## [2.0.4] - 2025-10-20

### Added
- Ahrefs Web Analytics integration for privacy-first traffic tracking
- Analytics script with Next.js Script component for optimal performance
- Privacy-compliant analytics without cookies or personal data collection

### Technical Details
- Script loads with `afterInteractive` strategy for optimal Core Web Vitals
- Integrated alongside existing Vercel Analytics and Google Analytics
- Zero build errors, zero linting errors, clean codebase maintained

## [2.0.3] - 2025-10-20

### Added
- Comprehensive component documentation (COMPONENTS.md)
- System architecture guide (ARCHITECTURE.md)
- Contribution guidelines (CONTRIBUTING.md)
- Documentation index (DOCUMENTATION_INDEX.md)
- Root folder audit report

### Changed
- Updated README.md with v2.0.3 status and A+ component grade
- Updated TECH_STACK.md with current statistics
- Improved component organization and testing coverage (81.8%)

### Fixed
- Achieved zero linting errors across 216 files
- Achieved zero TypeScript errors with strict mode
- Achieved zero build/test warnings
- Clean compilation and test runs

## [2.0.2] - 2025-10-19

### Added
- Zero warning achievement across all quality gates
- Clean codebase with no linting/build/test warnings

### Fixed
- All Biome linting warnings resolved
- All TypeScript compilation warnings resolved
- All test warnings eliminated

## [2.0.1] - 2025-10-17

### Added
- SEO improvements and optimizations
- IndexNow integration for instant search engine indexing

### Changed
- Enhanced SEO metadata and structured data
- Improved sitemap generation

## [2.0.0] - 2025-10-06

### Added
- What-if comparison feature
- Tax trap detection and pension optimization
- Previous year comparison
- Salary comparison tools

### Changed
- Major UI/UX improvements
- Enhanced calculator results display
- Improved responsive design

## [1.1.0] - 2025-10-09

### Added
- Sentry error monitoring with session replay
- Complete error tracking infrastructure
- Test coverage expansion (+100 tests, 42.47% coverage)

### Changed
- Enhanced PWA implementation
- Improved code quality and documentation

### Fixed
- Production CSP issues
- Build warnings and errors

## [1.0.0] - 2025-10-03

### Added
- First production release
- HMRC-compliant tax calculator
- Blog system (TaxInsights)
- Theme system (Light/Dark/System)
- AEO optimization
- WCAG 2.2 AA accessibility compliance
- Responsive design (320px to 4K+)

### Features
- Income tax calculation
- National Insurance calculation
- Student loan repayments (all plans)
- Pension contributions
- Marriage allowance
- Scottish tax rates
- Multiple pay periods
- Export to CSV/Excel/PDF
- Professional print layout

---

## Release Notes Guidelines

### Types of Changes

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for security improvements

### Version Numbers

- **Major (X.0.0)** - Breaking changes
- **Minor (0.X.0)** - New features, backwards compatible
- **Patch (0.0.X)** - Bug fixes, backwards compatible

---

[Unreleased]: https://gitlab.com/ukpayetax/payetax/compare/v2.0.3...HEAD
[2.0.3]: https://gitlab.com/ukpayetax/payetax/compare/v2.0.2...v2.0.3
[2.0.2]: https://gitlab.com/ukpayetax/payetax/compare/v2.0.1...v2.0.2
[2.0.1]: https://gitlab.com/ukpayetax/payetax/compare/v2.0.0...v2.0.1
[2.0.0]: https://gitlab.com/ukpayetax/payetax/compare/v1.1.0...v2.0.0
[1.1.0]: https://gitlab.com/ukpayetax/payetax/compare/v1.0.0...v1.1.0
[1.0.0]: https://gitlab.com/ukpayetax/payetax/releases/tag/v1.0.0
