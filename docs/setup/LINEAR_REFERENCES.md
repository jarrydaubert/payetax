# Linear References - Quick Links

> Quick reference to documentation for Linear issues

**Last Updated:** October 20, 2025

---

## 📚 Core Documentation

| Reference | Location | Use For |
|-----------|----------|---------|
| **Contributing Guide** | [CONTRIBUTING.md](../CONTRIBUTING.md) | Code standards, testing, workflow |
| **Linear SOP** | [LINEAR_SOP.md](./LINEAR_SOP.md) | Full Linear best practices |
| **Linear Quick Ref** | [LINEAR_QUICK_REFERENCE.md](./LINEAR_QUICK_REFERENCE.md) | Quick commands |

---

## 🔗 SEO & Marketing

| Topic | Reference Document | Issues |
|-------|-------------------|--------|
| **Backlink Strategy** | [SEMRUSH_ANALYSIS_2025-10-17.md](./archived/SEMRUSH_ANALYSIS_2025-10-17.md) | PAYTAX-12, PAYTAX-18, PAYTAX-19 |
| **SEO Master Plan** | [SEO_MASTER_PLAN.md](./archived/SEO_MASTER_PLAN.md) ⚠️ ARCHIVED | PAYTAX-13, PAYTAX-14, PAYTAX-15, PAYTAX-20, PAYTAX-21 |
| **Blog Writing Guide** | [BLOG_GUIDE.md](./guides/BLOG_GUIDE.md) | PAYTAX-7, PAYTAX-10 (recurring) |
| **CSV Audit Results** | Desktop/payetax.co.uk_mega_export_20251020.csv | PAYTAX-13, PAYTAX-14, PAYTAX-15, PAYTAX-16 |

---

## 🧪 Testing & Quality

| Topic | Reference Document | Issues |
|-------|-------------------|--------|
| **Testing Guide** | [TESTING.md](./guides/TESTING.md) | PAYTAX-31, PAYTAX-32, PAYTAX-34, PAYTAX-35 |
| **Test Coverage Audit** | [TEST_COVERAGE_AUDIT.md](./audits/TEST_COVERAGE_AUDIT.md) | PAYTAX-34, PAYTAX-35, PAYTAX-39 |
| **Accessibility Testing** | [ACCESSIBILITY_TESTING.md](./guides/ACCESSIBILITY_TESTING.md) | PAYTAX-25, PAYTAX-26, PAYTAX-27, PAYTAX-28, PAYTAX-40 |

---

## 🔒 Security

| Topic | Reference Document | Issues |
|-------|-------------------|--------|
| **Security Audit** | [SECURITY_AUDIT.md](./audits/SECURITY_AUDIT.md) | PAYTAX-30, PAYTAX-33, PAYTAX-36 |
| **Quality Gates** | [QUALITY_GATES.md](./setup/QUALITY_GATES.md) | PAYTAX-23, PAYTAX-24, PAYTAX-39 |

---

## ⚡ Performance

| Topic | Reference Document | Issues |
|-------|-------------------|--------|
| **Performance Audit** | [PERFORMANCE_AUDIT.md](./audits/PERFORMANCE_AUDIT.md) | PAYTAX-29 |
| **Bundle Analysis** | Run `npm run bundle:analyze` | PAYTAX-29 |

---

## 🏗️ Architecture

| Topic | Reference Document | Issues |
|-------|-------------------|--------|
| **Tech Stack** | [TECH_STACK.md](./guides/TECH_STACK.md) | General reference |
| **Architecture Guide** | [ARCHITECTURE.md](./guides/ARCHITECTURE.md) | General reference |
| **Components Guide** | [COMPONENTS.md](./guides/COMPONENTS.md) | Component development |

---

## 🤖 AI Features

| Topic | Reference Document | Issues |
|-------|-------------------|--------|
| **Sage Implementation Plan** | [SAGE_IMPLEMENTATION_PLAN.md](./planning/SAGE_IMPLEMENTATION_PLAN.md) | PAYTAX-38 (decision point) |
| **SME Director Tools** | [SME_DIRECTOR_TOOLS_PROPOSAL.md](./proposals/SME_DIRECTOR_TOOLS_PROPOSAL.md) | Future feature |

---

## 📋 Task Lists (Deleted - Now in Linear)

**Previous task tracking docs (deleted):**
- ~~TODO.md~~ → All tasks in Linear (PAYTAX-10 through PAYTAX-48)
- ~~DOCUMENTATION_INDEX.md~~ → Use docs/README.md
- ~~DOCUMENTATION_COMPLETE_SUMMARY.md~~ → Completed, no longer needed

**Archived planning docs (moved to archived/):**
- [SEO_MASTER_PLAN.md](./archived/SEO_MASTER_PLAN.md) - Time-bound tasks now in Linear
- [SEMRUSH_ANALYSIS_2025-10-17.md](./archived/SEMRUSH_ANALYSIS_2025-10-17.md) - Snapshot from Oct 17

**Important:** ⚠️ Always check [Linear](https://linear.app/payetax/project/payetax-3073e7b6c11d) for current tasks!

---

## 🔗 External Resources

### Backlink Targets
- **AccountingWeb** - https://www.accountingweb.co.uk
- **ICAEW** - https://www.icaew.com
- **tax.org.uk** - https://www.tax.org.uk
- **ICAS** - https://www.icas.com
- **MoneySavingExpert** - https://forums.moneysavingexpert.com

### SEO Tools
- **Google Search Console** - https://search.google.com/search-console
- **Ahrefs** - Check SEMrush analysis doc for competitor insights
- **Lighthouse** - Run `npm run lighthouse`

### UK Tax Resources
- **HMRC** - https://www.gov.uk/government/organisations/hm-revenue-customs
- **Tax Rates 2025/26** - https://www.gov.uk/income-tax-rates

---

## 📝 Social Media Best Practices

### X.com (Twitter) Strategy

**Daily publishing tips (PAYTAX-11):**
- Post 1-2 times per day
- Best times: 9-11am GMT (weekdays)
- Use 2-3 hashtags max
- Include link with UTM tracking
- Mix content types:
  - Quick tax tips (Monday, Wednesday, Friday)
  - Blog post promotion (Tuesday, Thursday)
  - Calculator features (occasional)
  - HMRC deadline reminders (as needed)

**UTM Parameters Template:**
```
?utm_source=twitter&utm_medium=social&utm_campaign=[campaign_name]
```

**Hashtag Bank:**
- #UKTax
- #PAYE  
- #TaxTips
- #PersonalFinance
- #SmallBusiness
- #Freelancer
- #Contractor

---

## 🔧 Development Quick Ref

### Most Used Commands
```bash
# Linear
npm run linear:me          # Your issues
npm run linear:create      # Create new issue

# Development  
npm run dev                # Start dev server
npm run fix-all            # Format, lint, typecheck

# Testing
npm run test               # Unit tests
npm run test:e2e           # E2E tests

# Quality Checks
npm run lighthouse         # Performance
npm run audit:deps         # Security
npm run audit:a11y         # Accessibility
```

### File Locations
```
/docs/
├── guides/                 # How-to guides
├── audits/                 # Completed audits
├── planning/               # Strategy docs
├── setup/                  # Configuration guides
└── LINEAR_REFERENCES.md    # This file

/src/
├── components/             # React components
├── lib/                    # Utilities & logic
├── store/                  # State management
└── app/                    # Next.js pages
```

---

## 📊 Metrics & Goals

### SEO Goals (2025)
- **Primary:** Rank Page 1 for "UK PAYE calculator"
- **Backlinks:** 20+ DA 40+ sites
- **Content:** 2-4 blog posts/month
- **Social:** Daily X.com presence

### Quality Goals
- **Test Coverage:** 90%+ (currently 90.46% ✅)
- **Lighthouse Score:** 95+ (currently 99/100 ✅)
- **Accessibility:** WCAG AA compliance
- **Bundle Size:** <300KB initial load

---

## 🆘 Common Questions

**Q: Where do I find the current sprint tasks?**
A: Check Linear project: https://linear.app/payetax/project/payetax-3073e7b6c11d

**Q: How do I create a blog post issue?**
A: Use template in LINEAR_SOP.md or copy structure from PAYTAX-7

**Q: Where are the SEO audit findings?**
A: Desktop/payetax.co.uk_mega_export_20251020.csv and SEO_MASTER_PLAN.md

**Q: How often should I update dependencies?**
A: Check PAYTAX-48 (recurring) - every 2 weeks for security, monthly for others

**Q: What's the process for adding a new feature?**
A: See CONTRIBUTING.md → Development Workflow section

---

**Need to add a reference?**
Edit this file and commit with:
```bash
git commit -m "docs: Add [reference] to LINEAR_REFERENCES.md"
```
