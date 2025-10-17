# SEMrush SEO Improvements Checklist

**Started:** _______________  
**Completed:** _______________

---

## 🔴 Critical Issues (Do First)

### Technical Fixes
- [ ] **Fix multiple H1 tags in Marriage Allowance post**
  - File: Find and fix marriage allowance blog post
  - Expected time: 10 minutes
  - Impact: High (SEO penalty fix)

- [ ] **Verify production build minification**
  - Run: `npm run build` and check .next/static/
  - Fix if needed in `next.config.ts`
  - Expected time: 30 minutes
  - Impact: High (Core Web Vitals)

- [ ] **Audit and fix title tags >60 characters**
  - Run: `grep -r "title:" src/app/*/page.tsx`
  - Shorten 74 pages to 50-60 chars
  - Expected time: 2-3 hours
  - Impact: High (CTR in search results)

---

## 🟡 Important Improvements

### Homepage Content
- [ ] **Add UK Tax System overview section**
  - File: `/src/components/pages/HomePageContent.tsx`
  - Include semantic keywords
  - Expected time: 1 hour
  - Impact: Medium-High (keyword coverage)

- [ ] **Add tax rates quick facts cards**
  - Visual display of Personal Allowance, Basic/Higher rates
  - Expected time: 30 minutes
  - Impact: Medium (engagement)

- [ ] **Create and add Tax Rates Comparison Table**
  - New component: `/src/components/organisms/TaxRatesTable.tsx`
  - Expected time: 1 hour
  - Impact: Medium (value add, SEO)

- [ ] **Improve homepage readability**
  - Break up paragraphs
  - Add more headings
  - Simplify language
  - Expected time: 2 hours
  - Impact: Medium (engagement, bounce rate)

### Category Pages
- [ ] **Create category content definitions**
  - New file: `/src/lib/categoryContent.ts`
  - Expected time: 1 hour
  - Impact: High (300-500 words per page)

- [ ] **Update category page template**
  - File: `/src/app/blog/category/[slug]/page.tsx`
  - Add description, keywords badge
  - Expected time: 30 minutes
  - Impact: High (9 pages improved)

- [ ] **Test all 9 category pages**
  - Verify content displays correctly
  - Check readability
  - Expected time: 30 minutes

---

## 🟢 Performance & Technical

### Optimization
- [ ] **Install bundle analyzer**
  - Run: `npm install --save-dev @next/bundle-analyzer`
  - Configure in `next.config.ts`
  - Expected time: 15 minutes
  - Impact: Medium (identify issues)

- [ ] **Analyze bundle sizes**
  - Run: `ANALYZE=true npm run build`
  - Document large bundles
  - Expected time: 30 minutes
  - Impact: Medium (understanding)

- [ ] **Reduce HTML-to-text ratio**
  - Simplify component structure
  - Remove unnecessary wrappers
  - Add more text content
  - Expected time: 3-4 hours
  - Impact: Medium (96 pages affected)

- [ ] **Optimize component structure**
  - Review CalculatorContainer.tsx
  - Review HomePageContent.tsx
  - Remove redundant divs
  - Expected time: 2 hours
  - Impact: Medium

### Core Web Vitals
- [ ] **Install Vercel Speed Insights**
  - Run: `npm install @vercel/speed-insights`
  - Add to layout
  - Expected time: 15 minutes
  - Impact: Low (monitoring)

- [ ] **Optimize images**
  - Ensure all use Next.js Image component
  - Check for oversized images
  - Expected time: 1 hour
  - Impact: Medium

- [ ] **Implement lazy loading**
  - Calculator components
  - Below-fold content
  - Expected time: 2 hours
  - Impact: Medium

---

## 📝 Content Creation

### New Blog Posts (1 per week)
- [ ] **"Understanding the UK Tax System: Complete Guide"**
  - Target keywords: tax system, income tax rates, HMRC
  - Word count: 1500-2000
  - Expected time: 4 hours

- [ ] **"Effective Tax Rates Explained for UK Taxpayers"**
  - Target keywords: effective tax rates, tax planning
  - Word count: 1200-1500
  - Expected time: 3 hours

- [ ] **"Higher Rate Taxpayer Guide: What You Need to Know"**
  - Target keywords: higher rate taxpayers, 40% tax
  - Word count: 1500-2000
  - Expected time: 4 hours

- [ ] **"How to File Your Tax Return with HMRC Online"**
  - Target keywords: tax return, self assessment, HMRC
  - Word count: 2000-2500
  - Expected time: 5 hours

- [ ] **"Capital Gains Tax Calculator & Guide UK 2025"**
  - Target keywords: capital gains tax, CGT calculator
  - Word count: 1800-2200
  - Expected time: 4 hours

### Internal Linking
- [ ] **Add "Related Articles" component**
  - Create new component
  - Add to blog post template
  - Expected time: 2 hours
  - Impact: Medium (crawl depth)

- [ ] **Improve homepage internal links**
  - Already good, but review
  - Add links to new content
  - Expected time: 30 minutes
  - Impact: Low-Medium

- [ ] **Add breadcrumbs (visual)**
  - Already have schema, add visual
  - Expected time: 1 hour
  - Impact: Low (UX)

---

## 🔗 Backlink Strategy

### Content for Outreach
- [ ] **Create downloadable Tax Planning Guide PDF**
  - Comprehensive resource
  - Link-worthy content
  - Expected time: 8 hours
  - Impact: High (backlinks)

- [ ] **Create tax rate infographics**
  - Visual, shareable
  - For Pinterest, Twitter, outreach
  - Expected time: 4 hours
  - Impact: Medium

- [ ] **Create 2025 Tax Deadline Calendar**
  - Useful resource
  - Easy to share
  - Expected time: 2 hours
  - Impact: Medium

### Outreach
- [ ] **Identify outreach targets**
  - Focus on recommended domains
  - Find contact info
  - Expected time: 3 hours

- [ ] **Write outreach templates**
  - Guest post pitch
  - Resource addition request
  - Expected time: 1 hour

- [ ] **Send 10 outreach emails per week**
  - Track responses
  - Follow up
  - Ongoing effort

---

## 📊 Monitoring & Analytics

### Setup
- [ ] **Verify Google Search Console**
  - Check for coverage issues
  - Review performance
  - Expected time: 30 minutes

- [ ] **Set up goal tracking in GA4**
  - Calculator usage
  - Blog engagement
  - Expected time: 1 hour

- [ ] **Create SEO dashboard**
  - Track KPIs
  - Monitor progress
  - Expected time: 2 hours

### Regular Checks (Weekly)
- [ ] **Check Search Console for errors**
- [ ] **Review top performing pages**
- [ ] **Monitor keyword rankings**
- [ ] **Check page speed scores**
- [ ] **Review bounce rates**

### Regular Checks (Monthly)
- [ ] **Full site crawl with Screaming Frog**
- [ ] **Audit title tags and meta descriptions**
- [ ] **Review internal linking**
- [ ] **Check for broken links**
- [ ] **Update content with new tax info**

---

## ✅ Testing Checklist

### Before Deploy
- [ ] **Test calculator functionality**
  - All inputs work
  - Calculations accurate
  - Results display correctly

- [ ] **Test on mobile devices**
  - iPhone Safari
  - Android Chrome
  - Responsive layout

- [ ] **Test on different browsers**
  - Chrome
  - Firefox
  - Safari
  - Edge

- [ ] **Check page load times**
  - Homepage <2s
  - Calculator <3s
  - Blog posts <2s

- [ ] **Verify structured data**
  - Use Rich Results Test
  - No errors
  - All schemas valid

- [ ] **Check accessibility**
  - Lighthouse accessibility score >90
  - Keyboard navigation works
  - Screen reader compatible

### After Deploy
- [ ] **Verify production build**
  - No console errors
  - All pages load
  - Assets minified

- [ ] **Check analytics tracking**
  - Events firing correctly
  - Page views recorded

- [ ] **Monitor for errors**
  - Check Sentry (if installed)
  - Review server logs

- [ ] **Test from different locations**
  - UK
  - US
  - Mobile networks

---

## 🎯 Success Metrics

### Week 1 Targets
- [ ] 3 critical issues fixed
- [ ] Homepage improvements deployed
- [ ] Category pages updated

### Month 1 Targets
- [ ] All technical issues resolved
- [ ] 2 new blog posts published
- [ ] Bundle size reduced by 20%
- [ ] Time on page increased by 15%

### Month 3 Targets
- [ ] 8-10 new blog posts published
- [ ] Organic traffic up 20%
- [ ] Bounce rate down 15%
- [ ] 5+ quality backlinks acquired
- [ ] All pages Core Web Vitals "Good"

### Month 6 Targets
- [ ] 15-20 total new posts
- [ ] Organic traffic up 30-40%
- [ ] Top 3 for "UK tax calculator"
- [ ] Top 10 for "PAYE calculator"
- [ ] 10+ quality backlinks

---

## 📋 Quick Reference

### Key Files to Modify
```
/src/app/page.tsx                          - Homepage metadata
/src/components/pages/HomePageContent.tsx  - Homepage content
/src/components/organisms/CalculatorContent.tsx - Calculator text
/src/app/blog/category/[slug]/page.tsx    - Category pages
/src/lib/categoryContent.ts               - NEW: Category descriptions
/src/components/organisms/TaxRatesTable.tsx - NEW: Rates table
next.config.ts                             - Build config
```

### Useful Commands
```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Analyze bundle
ANALYZE=true npm run build

# Find long titles
grep -r "title:" src/app/*/page.tsx | grep -E ".{60,}"

# Find multiple H1s
grep -r "<h1" src/app/ | cut -d: -f1 | uniq -d

# Check for errors
npm run lint
npm run type-check
```

### Testing URLs
```
Homepage: http://localhost:3000
Calculator: http://localhost:3000/#tax-calculator
Blog: http://localhost:3000/blog
Category example: http://localhost:3000/blog/category/tax-basics
```

---

## 💡 Tips

1. **Work in feature branches**
   ```bash
   git checkout -b seo-improvements
   ```

2. **Commit frequently**
   ```bash
   git add -A
   git commit -m "feat: add tax system overview section"
   ```

3. **Test before merging**
   - Build locally
   - Check all pages
   - No console errors

4. **Deploy gradually**
   - Use preview deployments
   - Monitor analytics
   - Be ready to rollback

5. **Document changes**
   - Keep this checklist updated
   - Note any issues found
   - Track time spent

---

## 📞 Resources

- **Main analysis:** `SEMRUSH_ANALYSIS_RECOMMENDATIONS.md`
- **Quick actions:** `SEMRUSH_QUICK_ACTIONS.md`
- **SEMrush data:** `/Users/jarrydaubert/Desktop/Semrush/`
- **Next.js docs:** https://nextjs.org/docs
- **HMRC rates:** https://www.gov.uk/income-tax-rates

---

**Progress Tracking:**

Week 1: _____ / 10 tasks completed  
Week 2: _____ / 10 tasks completed  
Week 3: _____ / 10 tasks completed  
Week 4: _____ / 10 tasks completed  

**Overall Progress:** _____ %

**Notes:**
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________
