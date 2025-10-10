# 🚀 PayeTax v1.2.0 Planning Document

**Created**: October 9, 2025
**Target Release**: October 16-20, 2025 (1-2 weeks)
**Release Type**: Minor (Feature Addition)
**Status**: 📋 Planning Phase

---

## 🎯 Release Goals

**Theme**: **User Engagement & Content Quality**

**Primary Objectives:**
1. ✅ **Sentry Error Monitoring** - Completed in v1.1.0!
2. 🤖 **Sage AI Explainer** - Interactive tax education widget (2-3 days)
3. 📝 **Blog Optimization** - Grammarly integration + editorial workflow (3-4 hours)
4. 🔍 **Linear API Audit** - Verify free tier status and optimize workflow (30 mins)

**Secondary Objectives:**
5. ✅ **Sentry Config Migration** - Completed in v1.1.3! (instrumentation-client.ts)
6. 📊 **GA4 Verification** - Ensure analytics working correctly (10 mins)
7. ✅ **Code Quality** - All lint warnings fixed in v1.1.3!

---

## 📊 v1.1.0 Baseline (What We Have)

### Current Stats
- **Version**: 1.1.0 (deployed October 9, 2025)
- **Tests**: 1,104 tests, 42.47% coverage
- **Bundle Size**: 504 kB (stable with Sentry)
- **Error Monitoring**: ✅ Sentry fully integrated
- **Console Errors**: ✅ Zero critical errors
- **Docs**: 10 files (consolidated)
- **Components**: 58 (atomic design)

### What's Working Well
- ✅ Sentry monitoring with session replay
- ✅ Production error tracking with source maps
- ✅ 100% UI test coverage
- ✅ Clean console (no critical errors)
- ✅ All environment variables configured

### Known Issues (Low Priority)
- ⚠️ Sentry deprecation warning (file naming) - 2 min fix
- ⚠️ Test lint warnings (forEach, static IDs in tests) - non-blocking
- ⚠️ Preload warnings in console - browser optimization, harmless

---

## 🚀 v1.2.0 Feature Breakdown

### **PRIORITY 1: Sage AI Explainer Widget** 🤖
**Time Estimate**: 2-3 days (10-12 hours)
**Impact**: HIGH - User engagement, differentiation
**Cost**: $0 (Ollama local dev + Groq free tier production)

#### What It Is
An always-available floating chat widget that explains UK tax concepts in plain language. Think "tax explainer in your pocket" - education only, no advice.

#### Why This Matters
- **Engagement**: +20-30% time on site (fintech benchmarks)
- **Differentiation**: No UK tax calculator has local AI explainer
- **Trust**: Read-only + HMRC citations = YMYL-safe
- **Zero Cost**: Ollama (dev) + Groq (prod) = free

#### Technical Approach
**Reuse Existing Components:**
- Modal pattern from `SustainabilityBadge.tsx`
- shadcn Dialog, Button, ScrollArea
- Glassmorphism from `Footer.tsx`
- Session state management pattern

**Implementation Plan:**

**Day 1: Local Prototype (2-3 hours)**
```bash
# Install Ollama
brew install ollama
ollama pull llama3.1

# Create component
src/components/organisms/SageWidget.tsx
```

Files to create:
- `src/components/organisms/SageWidget.tsx` - Main widget component
- `src/lib/sageExplainer.ts` - Prompt orchestration logic
- `src/lib/tax_sources.json` - Curated HMRC data for citations
- `src/hooks/useSageExplainer.ts` - Custom hook for LLM interaction

**Day 2: Safety & Context (3-4 hours)**
- Build `tax_sources.json` with HMRC citations
- Add regex validation for unsafe advice detection
- Implement page-aware context (calculator results tie-in)
- Test prompt safety and deflection templates

**Day 3: Polish & Deploy (2-3 hours)**
- Add streaming text effect with React state
- Implement offline fallback with service worker
- Mobile responsive testing
- Deploy to Vercel with Groq edge function

#### Safety Measures (YMYL Compliant)
```typescript
// Strict prompt template
const SYSTEM_PROMPT = `You are Sage, a UK tax education assistant.

RULES:
- Explain concepts only, never give advice
- Always cite sources from tax_sources.json
- Deflect personal questions with: "I focus on overviews - consult a professional"
- Forbidden words: "should", "recommend", "file", "claim", "you must"
- No calculations or personal data

Example:
User: "Explain marriage allowance"
Sage: "Marriage allowance transfers £1,260 of your personal allowance to a spouse.
Like sharing your tax-free pie slice. Saves up to £252/year.
[Source: gov.uk/marriage-allowance]"
`;
```

#### Success Metrics
- Prototype working locally: 2-3 hours ✅
- Production-ready: 2-3 days ✅
- Engagement lift: +20-30% time on site (target)
- Support deflection: -25% "what is X?" questions

#### Files to Create/Modify
```
NEW FILES (5):
+ src/components/organisms/SageWidget.tsx
+ src/lib/sageExplainer.ts
+ src/lib/tax_sources.json
+ src/hooks/useSageExplainer.ts
+ src/app/api/sage/route.ts (Groq API endpoint)

MODIFIED FILES (2):
~ src/app/layout.tsx (add SageWidget)
~ .env.template (add GROQ_API_KEY)
```

#### Testing Plan
- Unit tests for prompt sanitization
- E2E tests for widget open/close
- Manual testing for YMYL compliance
- Mobile responsive testing (iOS Safari, Android Chrome)

---

### **PRIORITY 2: Blog Optimization & Grammarly** 📝
**Time Estimate**: 3-4 hours initial setup
**Impact**: MEDIUM - Content quality and SEO
**Cost**: £0-10/month (Grammarly free → premium optional)

#### Current State
- ✅ BLOG_GUIDE.md exists (18K comprehensive guide)
- ✅ 7 blog posts published
- ✅ Monday + Thursday schedule defined
- ✅ Contentlayer2 integration working
- ✅ 800x400 WebP image specs set

#### What's Missing
1. **Editorial Calendar** - Pre-plan topics 2 weeks ahead
2. **Quality Workflow** - Grammarly integration for tone/clarity
3. **Content Pipeline** - Batch writing sessions
4. **SEO Checklist** - Per-post quality gates

#### Implementation Plan

**Phase 1: Setup (1 hour)**
```bash
# Install Grammarly
1. Install Grammarly browser extension (Chrome/Safari)
2. Create Grammarly account (free tier to start)
3. Test on existing blog post draft
```

**Phase 2: Workflow Documentation (1 hour)**
Update `docs/BLOG_GUIDE.md` with:
- Grammarly quality checklist
- Editorial calendar template
- Topic planning framework
- AI detection prevention tips

**Phase 3: Content Planning (1-2 hours)**
Create next 10 blog topics in Linear:
- Tag: `content`
- Label: Blog post priority (high/medium/low)
- Due dates: Monday 8am GMT or Thursday 2pm GMT
- Include: Keywords, target audience, internal links

**Phase 4: Quality Checklist (30 mins)**
Add to BLOG_GUIDE.md:
```markdown
## Quality Checklist (Before Publish)

### Content Quality
- [ ] Grammarly score >70
- [ ] Reading time 3-6 minutes
- [ ] 2+ internal links to calculator/other posts
- [ ] At least 1 external HMRC citation
- [ ] No Claude-obvious patterns (vary sentence structure)

### SEO Requirements
- [ ] Target keyword in H1, first paragraph, URL
- [ ] Meta description 150-160 characters
- [ ] Schema markup included (Article type)
- [ ] Image alt text descriptive
- [ ] Mobile preview checked

### Technical
- [ ] Build passes locally
- [ ] Links work (internal + external)
- [ ] Images load properly (WebP format)
- [ ] No console errors
```

#### Timing Strategy Refinement
- **Monday 8am GMT**: Week-start "how-to" content (high engagement)
- **Thursday 2pm GMT**: Analysis/opinion pieces (pre-weekend reads)
- **Avoid**: Friday evenings, weekends (20% less traffic)

#### Topic Planning Framework
- **Evergreen** (80%): Tax code explainers, allowance guides
- **Timely** (20%): Budget reactions, HMRC updates
- **Seasonal**:
  - January: New Year tax resolutions
  - March: Tax year end preparation
  - April: New tax rate announcements

#### Files to Update
```
MODIFIED FILES (1):
~ docs/BLOG_GUIDE.md (add Grammarly workflow + quality checklist)

NEW TASKS IN LINEAR (10):
+ 10 blog post topics with dates, keywords, outlines
```

#### Success Metrics
- ✅ Editorial calendar 2 weeks ahead
- ✅ Grammarly score >70 on all posts
- ✅ Consistent Monday/Thursday publish schedule
- ✅ 10+ blog posts by end of October

---

### **PRIORITY 3: Linear API Audit** 🔍
**Time Estimate**: 30 minutes
**Impact**: LOW - Verification and documentation
**Cost**: $0 (already on free tier)

#### Current State
- ✅ LINEAR_SETUP.md exists (15K guide)
- ✅ @linear/sdk v60.0.0 installed
- ✅ 7 npm scripts for Linear integration
- ✅ API key configured

#### Audit Checklist
```bash
# 1. Login to Linear (5 mins)
open https://linear.app/settings/api

# 2. Check current plan
- Verify: Free vs Paid tier
- Review: API rate limits (free = 1,500 req/hour)
- Document: What features we're using

# 3. Usage review (10 mins)
npm run linear:list     # Check active issues
npm run linear:cycles   # Review cycles
npm run linear:projects # Check projects

# 4. Document findings (15 mins)
Update docs/LINEAR_SETUP.md with:
- Current plan details
- Rate limit status
- Feature usage (issues, projects, cycles)
- Optimization recommendations
```

#### Free Tier Includes
- Unlimited viewers
- 250 issues
- API access (1,500 req/hour)
- GitHub integration
- Basic automations

#### Success Criteria
- ✅ Confirmed free tier status
- ✅ Documented current usage
- ✅ No rate limit concerns
- ✅ Updated LINEAR_SETUP.md with findings

---

### **PRIORITY 4: Quick Fixes & Maintenance** 🧹
**Time Estimate**: 1-2 hours total
**Impact**: LOW - Code quality improvements
**Cost**: $0

#### 4.1: Rename Sentry Config (2 mins)
**Issue**: Deprecation warning in build
```bash
# Warning:
[@sentry/nextjs] DEPRECATION WARNING: It is recommended renaming your
`sentry.client.config.ts` file to `instrumentation-client.ts`
```

**Fix**:
```bash
mv sentry.client.config.ts instrumentation-client.ts
# Update imports if needed
```

#### 4.2: Fix Test Lint Warnings (30 mins)
**Issue**: 11 non-blocking lint warnings in tests

**Categories**:
1. `useUniqueElementIds` - Static IDs in tests (7 warnings)
2. `noForEach` - Prefer for...of (3 warnings)
3. `noUnusedVariables` - Unused container (1 warning)

**Solution**: Add `// biome-ignore` comments for test-only violations
```typescript
// Test files only - static IDs are OK for testing
// biome-ignore lint/correctness/useUniqueElementIds: test file
<Input id="test-input" />
```

#### 4.3: GA4 Verification (10 mins)
**Task**: Verify analytics tracking correctly

```bash
# 1. Check GA4 property exists
open https://analytics.google.com/

# 2. Test real-time tracking
- Visit https://payetax.co.uk
- Check GA4 Real-Time dashboard for event

# 3. Verify custom events firing
- Calculator usage
- Export clicks
- Blog post views
```

#### Files to Modify
```
RENAMED FILES (1):
sentry.client.config.ts → instrumentation-client.ts

MODIFIED FILES (11):
~ src/components/atoms/__tests__/*.test.tsx (add biome-ignore)
~ src/components/ui/__tests__/*.test.tsx (add biome-ignore)
```

---

## 📊 Version Comparison: v1.1.0 → v1.2.0

| Metric | v1.1.0 | v1.2.0 (Target) | Change |
|--------|--------|-----------------|--------|
| **Major Features** | Sentry monitoring | + Sage AI Explainer | +1 major feature |
| **Tests** | 1,104 | 1,150+ | +46 tests (+4%) |
| **Coverage** | 42.47% | 45%+ | +2.5pp (target) |
| **Blog Posts** | 7 | 10+ | +3 posts minimum |
| **Lint Warnings** | 11 (test-only) | 0 | -11 warnings |
| **Bundle Size** | 504 kB | ~520 kB | +16 kB (Sage AI) |
| **Docs** | 10 files | 11 files | +1 (v1.2.0 plan) |
| **Engagement** | Baseline | +20-30% | Sage AI impact |

---

## 🗓️ Implementation Timeline

### **Week 1: Core Features (Oct 9-13)**

**Day 1-2 (Oct 9-10): ✅ COMPLETED**
- [x] v1.1.0 deployed
- [x] Console errors fixed
- [x] Docs updated
- [x] Planning v1.2.0

**Day 3 (Oct 11): Sage AI Day 1**
- [ ] Install Ollama + Llama 3.1
- [ ] Create SageWidget component (reuse SustainabilityBadge pattern)
- [ ] Build chat UI with shadcn Dialog
- [ ] Test local API calls

**Day 4 (Oct 12): Sage AI Day 2**
- [ ] Create tax_sources.json with HMRC data
- [ ] Build useSageExplainer hook
- [ ] Add regex validation for unsafe advice
- [ ] Implement page-aware context

**Day 5 (Oct 13): Sage AI Day 3 + Quick Fixes**
- [ ] Add streaming text effect
- [ ] Mobile responsive testing
- [ ] Deploy Groq edge function
- [ ] Rename Sentry config (2 mins)
- [ ] Fix test lint warnings (30 mins)

### **Week 2: Polish & Launch (Oct 14-16)**

**Day 6 (Oct 14): Blog Optimization**
- [ ] Install Grammarly extension
- [ ] Update BLOG_GUIDE.md with workflow
- [ ] Create 10 blog topics in Linear
- [ ] Add quality checklist to docs

**Day 7 (Oct 15): Linear Audit + Testing**
- [ ] Linear API audit (30 mins)
- [ ] Sage AI comprehensive testing
- [ ] E2E tests for new widget
- [ ] GA4 verification

**Day 8 (Oct 16): Release Preparation**
- [ ] Final testing (all browsers)
- [ ] Update CHANGELOG.md
- [ ] Create VERSION_1.2.0_RELEASE.md
- [ ] Update README.md with new features
- [ ] Git tag v1.2.0 + push

---

## 🧪 Testing Strategy

### New Tests to Add
```
Sage AI Widget:
+ src/components/organisms/__tests__/SageWidget.test.tsx (8-10 tests)
+ src/lib/__tests__/sageExplainer.test.ts (5-7 tests)
+ src/hooks/__tests__/useSageExplainer.test.ts (4-5 tests)

E2E Tests:
+ e2e/sage-widget.spec.ts (widget open/close, message send, safety checks)

Manual Testing:
+ Mobile responsive (iOS Safari, Android Chrome)
+ YMYL compliance (unsafe prompts deflected)
+ Offline functionality (service worker caching)
+ Cross-browser (Chrome, Firefox, Safari, Edge)
```

### Target Coverage
- Sage AI components: 80%+
- Overall coverage: 45%+ (up from 42.47%)

---

## 📦 Deployment Checklist

### Pre-Deploy
- [ ] All tests passing (unit + E2E)
- [ ] Build successful (0 errors)
- [ ] TypeScript strict mode (0 errors)
- [ ] Biome lint (0 critical errors)
- [ ] Bundle size check (<550 kB target)

### Environment Variables
```bash
# Add to Vercel
GROQ_API_KEY=gsk_...  # For Sage AI production
```

### Post-Deploy Verification
- [ ] Sage AI widget loads on all pages
- [ ] Widget responds to test queries
- [ ] No console errors in production
- [ ] GA4 tracking events firing
- [ ] Sentry still capturing errors correctly

---

## 🚨 Risks & Mitigation

### Risk 1: Sage AI YMYL Compliance
**Risk**: AI gives unsafe tax advice
**Mitigation**:
- Strict prompt engineering
- Regex validation for forbidden phrases
- Auto-citations from trusted sources only
- Deflection templates for personal questions

### Risk 2: Groq API Rate Limits
**Risk**: Free tier limits exceeded
**Mitigation**:
- Start with Groq free tier (limited requests)
- Monitor usage in first week
- Fallback to Ollama local if needed
- Add rate limiting on client side

### Risk 3: Bundle Size Increase
**Risk**: Sage AI adds too much to bundle
**Mitigation**:
- Code-split Sage widget (dynamic import)
- Tree-shake LLM client library
- Monitor bundle analyzer
- Target: <550 kB total

### Risk 4: Blog Workload
**Risk**: Can't maintain Monday/Thursday schedule
**Mitigation**:
- Batch write 2-3 posts at once
- Pre-plan topics 2 weeks ahead
- Quality > quantity (skip if needed)
- Use Grammarly to speed up editing

---

## 💰 Cost Analysis

### Current Costs (v1.1.0)
- Sentry: $0/month (free tier - 5K events)
- Linear: $0/month (free tier - 250 issues)
- Vercel: $0/month (hobby tier)
- Resend: $0/month (free tier - 100 emails)
- **Total: $0/month** ✅

### v1.2.0 New Costs
- Groq API: $0/month (free tier - limited requests)
- Grammarly: £0-10/month (free tier, premium optional)
- Ollama: $0 (local, free forever)
- **Total: £0-10/month** ✅

### Cost Ceiling
- **Target**: Stay under £20/month total
- **Reality**: Currently £0-10/month
- **Margin**: £10-20/month buffer ✅

---

## 📝 Documentation Updates

### Files to Create
- [x] `docs/VERSION_1.2.0_PLAN.md` - This document
- [ ] `docs/SAGE_AI_GUIDE.md` - Sage widget user guide
- [ ] `docs/VERSION_1.2.0_RELEASE.md` - Release notes (after completion)

### Files to Update
- [ ] `CHANGELOG.md` - Add v1.2.0 entry
- [ ] `README.md` - Add Sage AI to features
- [ ] `docs/BLOG_GUIDE.md` - Add Grammarly workflow
- [ ] `docs/LINEAR_SETUP.md` - Add audit findings
- [ ] `docs/NEXT_PRIORITIES.md` - Mark Sage AI as completed

---

## 🎯 Success Criteria

### Must Have (v1.2.0 Minimum)
- [x] v1.1.0 deployed successfully
- [ ] Sage AI widget working in production
- [ ] Grammarly workflow documented
- [ ] Linear API audit completed
- [ ] All tests passing
- [ ] Zero console errors
- [ ] Documentation updated

### Nice to Have (v1.2.0 Stretch)
- [ ] 10+ blog posts published
- [ ] +20% engagement from Sage AI
- [ ] Test coverage >45%
- [ ] Bundle size <520 kB
- [ ] Grammarly premium trial started

### Blocker Criteria (Don't Ship If)
- ❌ Sage AI gives unsafe advice in testing
- ❌ Bundle size exceeds 600 kB
- ❌ Critical Sentry errors in production
- ❌ TypeScript/build errors

---

## 🔄 Post-Release Plan (v1.3.0 Ideas)

**Potential Features:**
1. **Scottish Tax Page** - Dedicated page for Scottish taxpayers
2. **Table of Contents** - Blog post navigation
3. **AEO Monitoring** - Track AI bot citations
4. **Accessibility Audit** - WCAG 2.2 AA full compliance
5. **Performance Optimization** - React 19.2 useEffectEvent

**Timeline**: November 2025 (1 month after v1.2.0)

---

## ✅ Next Steps

1. **Get User Approval** - Review this plan with stakeholder
2. **Start Day 1 (Sage AI)** - Install Ollama, create widget
3. **Track Progress** - Use Linear for task management
4. **Daily Standups** - Brief progress updates in Linear
5. **Launch v1.2.0** - Target: October 16-20, 2025

---

**Planning Status**: ✅ **Ready for Implementation**

**Recommended Start**: October 11, 2025 (Sage AI Day 1)

**Target Launch**: October 16-20, 2025 (1-2 weeks)

---

**Planned by**: PayeTax Development Team
**Date**: October 9, 2025
**Next Review**: After Sage AI prototype (Oct 11)
