#!/usr/bin/env node
// Batch create all Linear issues for PayeTax project

const { LinearClient } = require('@linear/sdk');

const LINEAR_API_KEY = process.env.LINEAR_API_KEY || 'lin_api_krnJCAJduWg4yzkWQDnV81XAh51i1DN4DmnXAJhL';
const TEAM_KEY = 'PAYTAX';

const linear = new LinearClient({ apiKey: LINEAR_API_KEY });

// All issues to create
const issues = [
  // 🔴 URGENT - SEO & Growth (12 issues)
  {
    title: '📝 Blog Content Pipeline - November 2025 (RECURRING)',
    description: `## Purpose
Continuous blog content creation for SEO and audience growth. **This issue stays open all month.**

## November Target
- 2-4 blog posts minimum
- Focus on high-volume keywords from SEMrush

## Content Ideas Queue
- [ ] "How to Maximize PAYE Deductions 2025" (PAYTAX-7 already created ✅)
- [ ] Scottish tax guide for regional targeting
- [ ] £100k tax trap deep dive (expand on warning feature)
- [ ] IR35 contractor guide
- [ ] Student loan repayment calculator guide
- [ ] Marriage allowance optimization

## Published This Month
_Update as posts go live:_
- 

## Performance Tracking
- Monitor rankings in Search Console weekly
- Track traffic in GA4
- Update this issue with wins/learnings

## Reference
- Writing guide: docs/guides/BLOG_GUIDE.md
- SEO strategy: docs/SEO_MASTER_PLAN.md
- Quality checklist in CONTRIBUTING.md

## At Month End
- Archive this issue
- Create "Blog Content Pipeline - December 2025"`,
    priority: 0, // Urgent
  },
  {
    title: '🐦 X.com Daily Publishing - November 2025 (RECURRING)',
    description: `## Purpose
Build audience, drive traffic, establish authority through daily valuable content. **This issue stays open all month.**

## November Target
- 1-2 tweets per day (30-60 total for month)
- Mix: tax tips, blog promotion, calculator highlights

## Week 1 (Oct 21-27)
- [ ] Mon: PAYE deduction tip
- [ ] Tue: £100k tax trap awareness
- [ ] Wed: Blog post promotion
- [ ] Thu: Calculator feature highlight  
- [ ] Fri: Weekend tax planning tip

## Recent Wins
_Track best performing tweets:_
- 

## Content Bank Ideas
- Quick tax calculation tips
- HMRC deadline reminders  
- Tax code explanations
- Common mistakes to avoid
- Calculator use cases
- Blog post hooks

## Reference
- X.com best practices: docs/LINEAR_REFERENCES.md
- Social media guide in CONTRIBUTING.md

## At Month End
- Archive this issue
- Create "X.com Daily Publishing - December 2025"
- Review analytics and adjust strategy`,
    priority: 0, // Urgent
  },
  {
    title: '🔗 SEMrush Backlink Strategy Execution',
    description: `## Goal
Execute backlink opportunities from SEMrush analysis. **Backlinks = #1 ranking factor for Page 1!**

## High-Priority Actions
- [ ] Follow up AccountingWeb email (SME Director Tools proposal)
- [ ] Submit to ICAEW partnerships team (email sent, awaiting response)
- [ ] Submit to tax.org.uk directory
- [ ] Submit to ICAS directory
- [ ] Join MoneySavingExpert forums
- [ ] Make 5-10 helpful posts on MSE (build credibility)
- [ ] Reach out to 3 UK tax bloggers for guest post opportunities

## Expected Impact
5-10 quality backlinks within 30 days

## Reference
- Full analysis: docs/planning/SEMRUSH_ANALYSIS_2025-10-17.md
- Backlink targets spreadsheet in analysis doc

## Success Metrics
- DA 40+ backlinks acquired
- Track in Search Console > Links report
- Monitor ranking improvements weekly`,
    priority: 0, // Urgent
  },
  {
    title: '⚡ Fix Low Text/HTML Ratio - ALL 79 Pages',
    description: `## Issue
CSV audit shows ALL 79 pages have low text-to-HTML ratio. This hurts SEO and rankings.

## Impact
🔴 **Critical for Page 1** - Search engines prefer content-rich pages

## Pages Affected
- All blog posts (13 pages)
- All calculator pages (66 pages) 
- Main pages (about, privacy, etc)

## Solution
1. Add more helpful content to calculator pages
2. Add explanatory text to category pages  
3. Reduce HTML bloat / optimize component structure
4. Add FAQ sections where relevant

## Reference
- Audit file: Desktop/payetax.co.uk_mega_export_20251020.csv (Column 55)
- SEO guidelines: docs/SEO_MASTER_PLAN.md

## Acceptance Criteria
- [ ] Text-to-HTML ratio >25% on all pages
- [ ] Re-run audit shows improvement
- [ ] No negative impact on page speed`,
    priority: 0, // Urgent
  },
  {
    title: '⚙️ Minify JavaScript & CSS - ALL 79 Pages',
    description: `## Issue  
CSV audit shows ALL 79 pages serve unminified JS/CSS. Hurts page speed = hurts rankings.

## Impact
🔴 **Critical for Core Web Vitals** - Page speed is a ranking factor

## Current State
- Next.js should minify automatically in production
- Verify build configuration
- Check if dev mode accidentally deployed

## Solution
1. Verify next.config.ts has minification enabled
2. Check Vercel build settings
3. Test production build locally
4. Re-deploy if needed

## Reference
- Audit file: Desktop/payetax.co.uk_mega_export_20251020.csv (Column 76)
- Performance audit: docs/audits/PERFORMANCE_AUDIT.md

## Acceptance Criteria
- [ ] All JS/CSS minified in production
- [ ] Lighthouse performance score maintained
- [ ] Bundle size reduced`,
    priority: 0, // Urgent  
  },
  {
    title: '📄 Add Meta Descriptions - Category Pages',
    description: `## Issue
4 category pages missing meta descriptions (from CSV audit Column 60)

## Pages Affected
- /blog/category/company-tax
- /blog/category/personal-finance
- /blog/category/self-assessment
- /blog/category/tax-changes

## Solution
Write compelling 150-160 char meta descriptions for each category

## Reference
- SEO guidelines: docs/guides/BLOG_GUIDE.md
- Existing meta descriptions for reference

## Acceptance Criteria
- [ ] All 4 category pages have unique meta descriptions
- [ ] 150-160 characters each
- [ ] Include target keywords
- [ ] Re-run audit shows fixed`,
    priority: 0, // Urgent
  },
  {
    title: '🔗 Fix Blog Pagination Internal Links',
    description: `## Issue
/blog?page=1 has only one internal link (from CSV audit Column 92)

## Impact
Poor for SEO - pages need 3+ internal links minimum

## Solution
Add links to:
- Category pages
- Popular posts
- Related content
- Search functionality

## Reference
- Internal linking strategy: docs/SEO_MASTER_PLAN.md

## Acceptance Criteria
- [ ] Pagination pages have 5+ internal links
- [ ] Links are contextually relevant
- [ ] Re-run audit shows fixed`,
    priority: 0, // Urgent
  },
  {
    title: '🔧 Fix Broken External Link in Blog Post',
    description: `## Issue
/blog/higher-rate-taxpayer-guide-uk-2025 has broken external link (likely HMRC URL)

## Impact
🔴 **Critical** - Broken links hurt SEO credibility and user trust

## Solution
1. Find broken link in blog post
2. Update to correct HMRC URL
3. Test link works

## Files
- content/blog/higher-rate-taxpayer-guide-uk-2025.mdx

## Acceptance Criteria
- [ ] All external links working
- [ ] HMRC URLs current
- [ ] Re-run audit shows fixed

**Time estimate:** 10 minutes`,
    priority: 0, // Urgent
  },
  {
    title: '📋 Submit to 3 UK Tax Directories',
    description: `## Goal
Get listed in authoritative UK tax directories for backlinks and credibility

## Directories to Submit
1. **ICAEW** - Email to partnerships team (DONE, awaiting response)
2. **tax.org.uk** - Find submission process
3. **ICAS** (Institute of Chartered Accountants Scotland) - Submit listing

## Additional Targets
- UK tax professional associations
- Financial planning directories
- Small business resource lists

## Reference
- Full list: docs/planning/SEMRUSH_ANALYSIS_2025-10-17.md

## Success Criteria
- [ ] 3+ directory submissions completed
- [ ] Follow up on responses
- [ ] Track backlinks acquired

**Time estimate:** 1-2 hours`,
    priority: 0, // Urgent
  },
  {
    title: '🤝 Follow Up AccountingWeb Partnership',
    description: `## Context
Sent SME Director Tools proposal to AccountingWeb. Need to follow up.

## Action
- [ ] Check email for response
- [ ] Send polite follow-up if no response after 1 week
- [ ] Offer to jump on call to discuss
- [ ] Prepare demo/examples if needed

## Potential Value
- DA 41 backlink
- Exposure to accountant audience
- Potential ongoing partnership

## Reference
- Original proposal email
- SME Director Tools: docs/proposals/SME_DIRECTOR_TOOLS_PROPOSAL.md

**Time estimate:** 30 minutes`,
    priority: 0, // Urgent
  },
  {
    title: '🔗 Internal Linking Strategy Review',
    description: `## Goal
Improve internal linking across blog posts and calculator pages for better SEO

## Tasks
- [ ] Audit current internal linking structure
- [ ] Identify orphaned pages (pages with <3 internal links)
- [ ] Create content linking matrix
- [ ] Add contextual links between related posts
- [ ] Link calculator pages to relevant blog content

## High-Level Strategy
Reference docs/SEO_MASTER_PLAN.md for full internal linking guidelines

## Success Criteria
- [ ] All pages have minimum 3 internal links
- [ ] Related content properly connected
- [ ] Link anchor text optimized
- [ ] Orphaned pages fixed

**Time estimate:** 2-3 hours`,
    priority: 0, // Urgent
  },
  {
    title: '📊 Meta Descriptions Optimization Audit',
    description: `## Goal
Review and optimize all meta descriptions site-wide

## Current Issues
- Some pages missing meta descriptions
- Some descriptions too short/long
- Some not optimized for target keywords

## High-Level Tasks
Review docs/SEO_MASTER_PLAN.md for complete meta description requirements

## Success Criteria
- [ ] All pages have meta descriptions
- [ ] 150-160 characters each
- [ ] Include target keywords
- [ ] Compelling click-through copy
- [ ] Re-run audit confirms fixes

**Time estimate:** 2-3 hours`,
    priority: 0, // Urgent
  },

  // 🟠 HIGH - SEO-Supporting + Quick Wins (8 issues)
  {
    title: '💰 Display Marginal Tax Rate Card',
    description: `## Goal
Show users their marginal tax rate and what their next raise costs in tax

## Why High Priority
Better UX = Lower bounce rate = Better SEO rankings

## What to Build
New summary card showing:
- "Your Marginal Rate: X%"
- "Your next £1,000 raise will cost you £X in tax"
- Highlight if >= 60% (tax trap zone)

## Technical Notes
- Already calculated: results.marginalTaxRate exists
- Just need to display it

## Files
- src/components/organisms/CalculatorResults/ResultsSummaryCards.tsx

## Acceptance Criteria
- [ ] Marginal rate displayed prominently
- [ ] Clear explanation of what it means
- [ ] Warning if in trap zone (60%+)
- [ ] Mobile responsive

**Time estimate:** 1-2 hours`,
    priority: 1, // High
  },
  {
    title: '🔒 Set Secret Detection to Blocking',
    description: `## Issue
GitLab CI secret detection allows failures - won't block commits with secrets

## Solution
Update .gitlab-ci.yml line 30:
\`\`\`yaml
secret_detection:
  allow_failure: false  # Change from true
\`\`\`

## Files
- .gitlab-ci.yml

## Acceptance Criteria
- [ ] Secret detection blocks pipeline if secrets found
- [ ] Test with dummy secret
- [ ] Remove test secret

**Time estimate:** 5 minutes`,
    priority: 1, // High
  },
  {
    title: '🪝 Add Pre-Push Git Hook',
    description: `## Goal
Run tests before pushing to catch failures early

## Solution
Create .husky/pre-push:
\`\`\`bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🧪 Running tests before push..."
npm run test:quick || {
  echo "❌ Tests failed. Fix before pushing."
  exit 1
}
\`\`\`

## Files
- Create .husky/pre-push

## Acceptance Criteria
- [ ] Hook runs on git push
- [ ] Blocks push if tests fail
- [ ] Can be bypassed with --no-verify if needed

**Time estimate:** 5 minutes`,
    priority: 1, // High
  },
  {
    title: '👆 Increase Touch Targets to 44px (Accessibility)',
    description: `## Issue
Touch targets are 36-42px, below WCAG 2.5.5 standard (44px minimum)

## Impact
Better accessibility = Better SEO (Google rewards accessible sites)

## Solution
Update all buttons/links to minimum 44x44px touch targets

## Files
- All button/link components throughout app

## Acceptance Criteria
- [ ] All interactive elements >= 44x44px
- [ ] Mobile testing confirms comfortable tapping
- [ ] No visual regressions

**Time estimate:** 2 hours`,
    priority: 1, // High
  },
  {
    title: '📝 Add Autocomplete Attributes to Forms (Accessibility)',
    description: `## Issue
Form inputs missing autocomplete attributes (WCAG 1.3.5)

## Solution
Add autocomplete attributes:
\`\`\`tsx
<Input
  type="email"
  autocomplete="email"
/>
\`\`\`

## Files
- src/components/molecules/FeedbackDialog.tsx
- Any forms with email/name inputs

## Acceptance Criteria
- [ ] All email inputs have autocomplete="email"
- [ ] All name inputs have autocomplete="name"
- [ ] Test browser autofill works

**Time estimate:** 1 hour`,
    priority: 1, // High
  },
  {
    title: '🎨 Add Icons to Color-Only Indicators (Accessibility)',
    description: `## Issue
Error/success states rely on color alone (WCAG 1.4.1)

## Solution
\`\`\`tsx
import { AlertCircle, CheckCircle } from 'lucide-react';

<span className="text-red-600">
  <AlertCircle className="inline h-4 w-4" /> Error message
</span>
\`\`\`

## Files
- src/components/molecules/ResultTableRow.tsx
- All error/success messages

## Acceptance Criteria
- [ ] All color indicators have icons
- [ ] Works for colorblind users
- [ ] Maintains visual appeal

**Time estimate:** 2 hours`,
    priority: 1, // High
  },
  {
    title: '🔊 Screen Reader Error Announcements (Accessibility)',
    description: `## Issue
Form errors not announced to screen readers (WCAG 3.3.1)

## Solution
\`\`\`tsx
<div role="alert" aria-live="polite" aria-atomic="true">
  {error && <p>{error}</p>}
</div>
\`\`\`

## Files
- src/components/molecules/FeedbackDialog.tsx
- Form components with validation

## Acceptance Criteria
- [ ] Errors announced to screen readers
- [ ] Test with VoiceOver/NVDA
- [ ] No duplicate announcements

**Time estimate:** 1 hour`,
    priority: 1, // High
  },
  {
    title: '⚡ Optimize Bundle Size (Core Web Vitals)',
    description: `## Issue
281KB unused JavaScript (71% waste), TBT 590ms

## Impact
🟠 **High for SEO** - Page speed affects rankings (Core Web Vitals)

## Solution
1. Code splitting with dynamic imports
2. Tree-shake unused exports
3. Defer third-party scripts (GA4/Sentry)
4. Remove unused dependencies

## Target
Reduce TBT from 590ms → <300ms

## Reference
- docs/audits/PERFORMANCE_AUDIT.md

## Acceptance Criteria
- [ ] TBT < 300ms
- [ ] Bundle size reduced 20%+
- [ ] Lighthouse score maintained/improved

**Time estimate:** 3-4 hours`,
    priority: 1, // High
  },

  // 🟡 MEDIUM - Technical Quality (12 issues)
  {
    title: '🔒 Add Rate Limiting to API Routes',
    description: `## Issue
No rate limiting on /api/feedback and /api/error-log - vulnerable to abuse

## Solution
Use LRU cache for simple rate limiting:
\`\`\`typescript
import { LRUCache } from 'lru-cache';

const rateLimit = new LRUCache({
  max: 500,
  ttl: 60000, // 1 minute
});

export function checkRateLimit(ip: string): boolean {
  const requests = rateLimit.get(ip) || 0;
  if (requests >= 10) return false;
  rateLimit.set(ip, requests + 1);
  return true;
}
\`\`\`

## Files
- Create src/lib/rateLimit.ts
- src/app/api/feedback/route.ts
- src/app/api/error-log/route.ts

## Acceptance Criteria
- [ ] 10 requests/min limit implemented
- [ ] Returns 429 when exceeded
- [ ] Test with rapid requests

**Time estimate:** 2-3 hours`,
    priority: 2, // Medium
  },
  {
    title: '✅ Fix Failing API Tests (2 tests)',
    description: `## Issue
2 API route tests failing due to environment variable handling

## Files
- src/app/api/feedback/__tests__/route.test.ts:226
- src/app/api/error-log/__tests__/route.test.ts:131

## Solution
\`\`\`typescript
beforeEach(() => {
  delete process.env.RESEND_API_KEY;
  jest.resetModules();
});
\`\`\`

## Acceptance Criteria
- [ ] Both tests passing
- [ ] CI pipeline green
- [ ] No regressions

**Time estimate:** 30 minutes`,
    priority: 2, // Medium
  },
  {
    title: '🧪 Fix Remaining 22 Test Failures',
    description: `## Breakdown
- 6 tests: CalculatorContainer (export button labels, grid layout)
- 6 tests: What If store (calculation precision issues)
- 4 tests: ResultsTable (layout, color verification)
- 3 tests: InputTooltip (duplicate tooltip in DOM)
- 2 tests: API routes (Resend env var - skip, test env issue)
- 1 test: SimpleNavbar (backdrop-blur - mostly fixed)

## Note
API tests and HMRC precision are pre-existing, non-blocking issues

## Reference
- docs/TODO.md for details

## Acceptance Criteria
- [ ] 20+ tests fixed
- [ ] CI pipeline green
- [ ] Coverage maintained

**Time estimate:** 2-3 hours`,
    priority: 2, // Medium
  },
  {
    title: '🛡️ Add CSRF Protection to API Routes',
    description: `## Issue
No CSRF tokens on API routes

## Solution
\`\`\`bash
npm install csrf
\`\`\`

Add CSRF middleware to API routes

## Files
- src/app/api/feedback/route.ts
- src/app/api/error-log/route.ts

## Reference
- docs/audits/SECURITY_AUDIT.md

## Acceptance Criteria
- [ ] CSRF tokens required
- [ ] Invalid tokens rejected
- [ ] Tests pass

**Time estimate:** 2-3 hours`,
    priority: 2, // Medium
  },
  {
    title: '📚 Add Blog System Tests',
    description: `## Issue
Blog system under-tested (0-28% coverage)

## Files to Test
- src/lib/blog.ts (28.87% → 80%+)
- src/app/blog/BlogPageClient.tsx (0% → 70%+)

## Tests Needed
- Related posts algorithm
- Search functionality
- Pagination logic
- Category filtering
- Client-side state management

## Acceptance Criteria
- [ ] Blog.ts > 80% coverage
- [ ] BlogPageClient > 70% coverage
- [ ] All critical paths tested

**Time estimate:** 4-6 hours`,
    priority: 2, // Medium
  },
  {
    title: '🔧 Improve Store Function Coverage',
    description: `## Issue
calculatorStore.ts has 31% function coverage (18 uncovered functions)

## Solution
Add integration tests for:
- Store actions
- Persistence logic
- State updates

## Files
- src/store/__tests__/calculatorStore.test.ts

## Acceptance Criteria
- [ ] Function coverage > 75%
- [ ] All critical actions tested
- [ ] Persistence logic verified

**Time estimate:** 2-3 hours`,
    priority: 2, // Medium
  },
  {
    title: '🔒 Harden CSP (Content Security Policy)',
    description: `## Issue
CSP allows 'unsafe-inline' and 'unsafe-eval'

## Solution
Remove unsafe directives, use nonces/hashes instead

## Files
- next.config.ts (CSP headers)

## Reference
- docs/audits/SECURITY_AUDIT.md

## Acceptance Criteria
- [ ] No 'unsafe-*' directives
- [ ] Nonces implemented
- [ ] App still works

**Time estimate:** 1-2 hours`,
    priority: 2, // Medium
  },
  {
    title: '✅ Add Input Validation with Zod',
    description: `## Issue
Limited input validation on calculator fields

## Solution
\`\`\`typescript
const salarySchema = z.number().min(0).max(10_000_000);
const taxCodeSchema = z.string().regex(/^[0-9]{3,4}[LMPKTY]$/);
\`\`\`

## Files
- src/store/calculatorStore.ts

## Acceptance Criteria
- [ ] All inputs validated
- [ ] Clear error messages
- [ ] Edge cases handled

**Time estimate:** 1-2 hours`,
    priority: 2, // Medium
  },
  {
    title: '🤖 TaxInsight Sage - AI Explainer Widget (DECISION POINT)',
    description: `## Concept
Floating chat widget that explains UK tax concepts using Ollama/Groq

## Potential Impact
- 20-30% longer session times
- Unique differentiator
- Zero cost (using free tiers)

## Implementation
See full details: docs/planning/SAGE_IMPLEMENTATION_PLAN.md

## Phases
1. Install Ollama locally (30-45 min)
2. Build SageWidget component (2-3 hours)
3. Add safety validation (3-4 hours)
4. Deploy with Groq fallback (2-3 hours)

## Decision Required
⚠️ **Need approval before starting** - 9-13 hours investment

**Time estimate:** 9-13 hours (if approved)`,
    priority: 2, // Medium
  },
  {
    title: '📏 Update CI Coverage Thresholds',
    description: `## Issue
Coverage thresholds too low (90% coverage vs 80% threshold)

## Solution
Update jest.config.js:
\`\`\`javascript
coverageThreshold: {
  global: {
    statements: 85,
    branches: 80,
    functions: 75,
    lines: 85,
  }
}
\`\`\`

## Acceptance Criteria
- [ ] Thresholds updated
- [ ] Tests still pass
- [ ] CI enforces new thresholds

**Time estimate:** 5 minutes`,
    priority: 2, // Medium
  },
  {
    title: '🧪 Add Automated A11y Testing',
    description: `## Solution
\`\`\`bash
npm install --save-dev jest-axe

# Add to component tests
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('no a11y violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
\`\`\`

## Acceptance Criteria
- [ ] Axe integrated
- [ ] Tests added for key components
- [ ] CI enforces a11y checks

**Time estimate:** 2 hours`,
    priority: 2, // Medium
  },
  {
    title: '⌨️ Add Keyboard Shortcuts Documentation',
    description: `## Goal
Document Tab navigation and add help modal with shortcuts

## Tasks
- [ ] Document current keyboard shortcuts
- [ ] Add help modal (? key to open)
- [ ] List all shortcuts
- [ ] Ensure all features keyboard accessible

## Acceptance Criteria
- [ ] Help modal implemented
- [ ] All shortcuts documented
- [ ] Accessible to screen readers

**Time estimate:** 1 hour`,
    priority: 2, // Medium
  },

  // 🟢 LOW - Nice to Have (5 issues)
  {
    title: '🏴 Scottish Tax Page Creation',
    description: `## Goal
Dedicated blog post for regional targeting (20% of UK searches)

## Content
- Scottish tax bands (19%, 20%, 21%, 42%, 47%)
- Comparison with England/Wales/NI
- Embedded calculator (Scotland pre-selected)
- Scottish-specific FAQ

## Reference
- docs/TODO.md

**Time estimate:** 30 minutes`,
    priority: 3, // Low
  },
  {
    title: '📋 Table of Contents Component for Blog',
    description: `## Goal
Add TOC to blog posts with anchor links

## Benefits
- Better navigation
- SEO boost
- Improved accessibility

## Reference
- Examples: freeCodeCamp, MDN

**Time estimate:** 1-2 hours`,
    priority: 3, // Low
  },
  {
    title: '📱 Mobile Experience - Real Device Audit',
    description: `## Goal
Test on real iOS/Android devices (not just Playwright)

## Scope
- iPhone (iOS Safari)
- Android (Chrome)
- iPad
- Touch interactions
- Gestures

**Time estimate:** 4-6 hours`,
    priority: 3, // Low
  },
  {
    title: '🌐 Browser Compatibility - Real Browser Audit',
    description: `## Goal
Test on real browsers (not just Playwright)

## Browsers
- Safari on macOS/iOS
- Chrome on Android
- Edge on Windows
- Firefox

**Time estimate:** 3-4 hours`,
    priority: 3, // Low
  },
  {
    title: '⚡ Load Testing & Capacity Planning',
    description: `## Goal
Test concurrent user capacity and performance under load

## Scope
- Concurrent user testing
- Serverless cold starts
- Database connections (if any)
- API rate limits

**Time estimate:** 3-4 hours`,
    priority: 3, // Low
  },

  // BONUS: Recurring Maintenance Issues
  {
    title: '🔧 Monthly Maintenance & Quality (RECURRING)',
    description: `## Purpose
Regular codebase health checks and dependency updates. **Review monthly.**

## November 2025 Checklist
- [ ] Run \`npm audit\` and fix high/critical vulnerabilities
- [ ] Run \`npm outdated\` and update dependencies
- [ ] Review test coverage reports
- [ ] Check for deprecated packages
- [ ] Review Sentry error logs
- [ ] Check analytics for issues
- [ ] Review and archive completed Linear issues
- [ ] Clean up old branches in git

## Code Quality Checks
- [ ] Run \`npm run lint:fix\` on recent changes
- [ ] Check for console.log statements
- [ ] Review TODO comments in code
- [ ] Update documentation if needed

## Testing & Coverage
- [ ] Current coverage: ___% (target: 90%+)
- [ ] Failing tests: ___ (target: 0)
- [ ] E2E test status: ___

## Reference
- Maintenance checklist: CONTRIBUTING.md
- Audit docs: docs/audits/

## At Month End
- Archive this issue
- Create "Monthly Maintenance - December 2025"
- Document any critical findings`,
    priority: 2, // Medium
  },
  {
    title: '📦 Package Updates & Dependency Management (RECURRING)',
    description: `## Purpose
Keep dependencies current and secure. **Review every 2 weeks.**

## Next Review: November 1, 2025

## Checklist
- [ ] Run \`npm outdated\`
- [ ] Identify major version updates (breaking changes)
- [ ] Test updates in feature branch
- [ ] Update package.json
- [ ] Run full test suite
- [ ] Check for deprecation warnings
- [ ] Update lockfile
- [ ] Deploy and monitor

## High Priority Updates
- Security patches (do immediately)
- Next.js updates (stay current)
- React updates (test thoroughly)
- TypeScript updates (check for breaking changes)

## Low Priority Updates
- Dev dependencies
- Minor version bumps
- Patch updates

## Reference
- Update policy: CONTRIBUTING.md
- Breaking changes guide: Check package CHANGELOGs

## Notes
Always test updates in development first. Never update multiple major packages at once.`,
    priority: 2, // Medium
  },
];

async function createAllIssues() {
  try {
    console.log('🚀 Starting batch issue creation...\n');

    const me = await linear.viewer;
    const teams = await me.teams();
    const team = teams.nodes.find((t) => t.key === TEAM_KEY);

    if (!team) {
      console.error(`❌ Team ${TEAM_KEY} not found`);
      return;
    }

    // Get project
    const projects = await team.projects();
    const project = projects.nodes.find((p) => p.name === 'PayeTax');
    
    if (!project) {
      console.error('❌ PayeTax project not found');
      return;
    }

    console.log(`✅ Found project: ${project.name} (${project.id})\n`);

    // Get todo state
    const states = await team.states();
    const todoState = states.nodes.find((s) => s.name.toLowerCase().includes('todo'));

    let created = 0;
    let failed = 0;

    for (const issue of issues) {
      try {
        const issuePayload = await linear.createIssue({
          teamId: team.id,
          projectId: project.id,
          title: issue.title,
          description: issue.description,
          priority: issue.priority,
          stateId: todoState?.id,
        });

        const createdIssue = await issuePayload.issue;
        
        if (createdIssue) {
          console.log(`✅ ${createdIssue.identifier}: ${issue.title}`);
          created++;
        } else {
          console.log(`❌ Failed: ${issue.title}`);
          failed++;
        }
      } catch (error) {
        console.error(`❌ Error creating "${issue.title}":`, error.message);
        failed++;
      }
    }

    console.log(`\n🎉 Complete! Created ${created} issues, ${failed} failed`);
    console.log(`\n📊 View all issues: https://linear.app/payetax/project/payetax-3073e7b6c11d`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

createAllIssues();
