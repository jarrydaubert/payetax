# PAYTAX-82: Security Hardening - Low Hanging Fruit Only

**Date:** November 8, 2025  
**Scope:** Quick wins for static site with no user data  
**Time:** 2-3 hours total

---

## 🎯 Why Low Hanging Fruit Makes Sense

**Your Context:**
- Static site (Next.js SSG/ISR)
- No user authentication
- No user data storage
- No backend/database
- No sensitive data handling
- Calculator runs client-side only

**Result:** Most security risks don't apply! Focus on:
1. Looking professional (security headers)
2. Protecting brand (XSS prevention)
3. Best practices (HTTPS, dependencies)

---

## ✅ Low Hanging Fruit (2-3 hours)

### 1. Security Headers via Vercel Config (30 minutes)

**Why:** Free security improvement, zero code changes, looks professional

**File:** `vercel.json` (UPDATE)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

**Tasks:**
- [ ] Add headers to `vercel.json`
- [ ] Deploy to preview
- [ ] Test: `curl -I https://preview-url.vercel.app`
- [ ] Verify headers present

**Impact:** ⭐⭐⭐⭐⭐ (High score on security scanners)

---

### 2. npm Audit Fix (15 minutes)

**Why:** Free fixes for known vulnerabilities

**Commands:**
```bash
# Check current vulnerabilities
npm audit

# Auto-fix what's safe
npm audit fix

# If that doesn't work, try
npm audit fix --force  # (only if safe - review first)

# Check again
npm audit
```

**Tasks:**
- [ ] Run `npm audit`
- [ ] Run `npm audit fix`
- [ ] Review results
- [ ] Document any remaining issues

**Impact:** ⭐⭐⭐⭐ (Zero critical/high vulns)

---

### 3. Environment Variable Check (15 minutes)

**Why:** Ensure no secrets leaked to git

**Tasks:**
```bash
# Check git history for secrets
git log --all --full-history --source -- .env.local
git log --all --full-history --source -- .env

# Search for potential secrets in code
grep -r "sk_" src/  # Stripe keys
grep -r "pk_" src/  # Public keys  
grep -r "AIza" src/ # Google API keys
grep -r "ghp_" src/ # GitHub tokens
```

- [ ] Verify no `.env.local` in git history
- [ ] Verify no hardcoded API keys in code
- [ ] Ensure all secrets in Vercel dashboard
- [ ] Update `.env.template` with all required vars

**Impact:** ⭐⭐⭐ (Prevent accidental leaks)

---

### 4. Basic CSP Header (30 minutes)

**Why:** Prevent XSS attacks, looks professional

**File:** `vercel.json` (UPDATE - add to headers array)

```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'none';"
}
```

**Tasks:**
- [ ] Add CSP header to `vercel.json`
- [ ] Deploy to preview
- [ ] Test site works (analytics, animations, etc.)
- [ ] Adjust CSP if anything breaks
- [ ] Verify with: https://csp-evaluator.withgoogle.com/

**Impact:** ⭐⭐⭐⭐⭐ (Major XSS protection)

**Note:** `unsafe-inline` and `unsafe-eval` are needed for:
- Framer Motion animations
- Google Analytics
- Tailwind CSS (if using CDN)

This is acceptable for a static site with no user input.

---

### 5. HTTPS Enforcement Check (15 minutes)

**Why:** Ensure all traffic is secure

**Vercel does this automatically**, but verify:

**Tasks:**
```bash
# Test HTTP redirect
curl -I http://payetax.co.uk
# Should see: 301 Moved Permanently → https://

# Test HTTPS works
curl -I https://payetax.co.uk  
# Should see: 200 OK with HSTS header
```

- [ ] Verify HTTP redirects to HTTPS
- [ ] Verify HSTS header present
- [ ] Check SSL rating: https://www.ssllabs.com/ssltest/analyze.html?d=payetax.co.uk

**Impact:** ⭐⭐⭐⭐ (Required for SEO and trust)

---

### 6. Security Testing (30 minutes)

**Why:** Validate everything works, get report card

**Tasks:**

**A. Automated Scanners (free!):**
```bash
# 1. Mozilla Observatory
# Visit: https://observatory.mozilla.org/
# Enter: payetax.co.uk
# Goal: B+ or higher

# 2. SecurityHeaders.com  
# Visit: https://securityheaders.com/
# Enter: payetax.co.uk
# Goal: A rating

# 3. SSL Labs
# Visit: https://www.ssllabs.com/ssltest/
# Enter: payetax.co.uk
# Goal: A or A+ rating
```

**B. Quick Manual Tests:**
```bash
# Test calculator with script injection
# Go to: https://payetax.co.uk
# Enter in salary field: <script>alert('XSS')</script>50000
# Expected: Should NOT execute, should sanitize or reject
```

- [ ] Run Mozilla Observatory scan
- [ ] Run SecurityHeaders.com scan
- [ ] Run SSL Labs scan
- [ ] Test XSS in calculator manually
- [ ] Document any issues found

**Impact:** ⭐⭐⭐ (Validation and peace of mind)

---

## ❌ Skip These (Not Worth It for Static Site)

### **CSP Middleware** 
- **Why skip:** Vercel headers are simpler
- **Effort saved:** 1-2 hours

### **DOMPurify / Input Sanitization**
- **Why skip:** No user-generated content, no comments, no forms storing data
- **Note:** Calculator input is numbers only (already validated)
- **Effort saved:** 1-2 hours

### **Complete Zod Validation (PAYTAX-84-89)**
- **Why skip:** Low risk without user accounts/backend
- **Do later:** When adding user features
- **Effort saved:** 3-4 hours

### **Environment Variable Zod Validation**
- **Why skip:** Only 2-3 env vars, all public (GA_ID, Sentry DSN)
- **Effort saved:** 30 minutes

### **Comprehensive Security Test Suite**
- **Why skip:** Overkill for static site
- **Do instead:** Quick manual scans (covered above)
- **Effort saved:** 2-3 hours

---

## 📋 Implementation Checklist (2-3 hours total)

### Session 1: Headers & Audit (1 hour)
- [ ] Add security headers to `vercel.json` (30 min)
- [ ] Run `npm audit fix` (15 min)
- [ ] Check environment variables (15 min)

### Session 2: CSP & Testing (1 hour)
- [ ] Add CSP header to `vercel.json` (30 min)
- [ ] Deploy and test (15 min)
- [ ] Run security scanners (30 min)

### Session 3: Verification (30 min)
- [ ] Verify HTTPS enforcement (15 min)
- [ ] Manual XSS testing (15 min)
- [ ] Document findings (included in session)

**Total Time:** ~2.5 hours

---

## 📊 Expected Results

### Before:
- Security Headers: ❌ None
- npm Vulnerabilities: ❓ Unknown
- HTTPS: ✅ (Vercel default)
- CSP: ❌ None
- Security Score: D or F

### After (2-3 hours):
- Security Headers: ✅ All major headers
- npm Vulnerabilities: ✅ 0 critical/high
- HTTPS: ✅ Enforced with HSTS
- CSP: ✅ Basic policy
- Security Score: **A- to B+**

---

## 🎯 Success Criteria (Minimal)

**Must Have:**
- [x] Security headers present (X-Frame-Options, X-Content-Type-Options, HSTS)
- [x] CSP header configured
- [x] 0 critical npm vulnerabilities
- [x] 0 high npm vulnerabilities
- [x] HTTPS enforced
- [x] No secrets in git

**Nice to Have:**
- [ ] Mozilla Observatory: B+ rating
- [ ] SecurityHeaders.com: A rating
- [ ] SSL Labs: A rating

---

## 🚀 Quick Start

**Ready to go? Here's the order:**

```bash
# 1. Update vercel.json (copy from above)
# 2. Run npm audit
npm audit
npm audit fix

# 3. Check for secrets
git log --all -- .env.local  # Should be empty

# 4. Deploy
git add vercel.json package-lock.json
git commit -m "security: Add security headers and fix npm vulnerabilities (PAYTAX-82)"
git push

# 5. Test (wait for deployment)
curl -I https://payetax.co.uk

# 6. Run scanners
# Visit: https://observatory.mozilla.org/
# Visit: https://securityheaders.com/
# Visit: https://www.ssllabs.com/ssltest/

# Done! 🎉
```

---

## 📝 Documentation After Completion

Create a simple summary:

**File:** `docs/audits/PAYTAX-82-SECURITY-SUMMARY.md`

```markdown
# Security Hardening Summary (PAYTAX-82)

**Completed:** [Date]  
**Scope:** Low-hanging fruit for static site

## ✅ Implemented
1. Security headers (X-Frame-Options, CSP, HSTS, etc.)
2. npm vulnerabilities fixed
3. Environment variables audited
4. HTTPS enforcement verified

## 📊 Results
- Mozilla Observatory: [Score]
- SecurityHeaders.com: [Score]
- SSL Labs: [Score]
- npm audit: 0 critical, 0 high

## ⚠️ Known Limitations
- CSP uses 'unsafe-inline' for Framer Motion
- No input sanitization (not needed for calculator-only site)
- No backend/database security (no backend)

## 🔮 Future Improvements (When Adding User Features)
- DOMPurify for user-generated content
- Complete Zod validation (PAYTAX-84-89)
- Authentication/authorization security
- Rate limiting
```

---

## 💡 Key Insight

**You're a static JAMstack site with no user data:**
- Most OWASP Top 10 don't apply ✅
- Biggest risks: Brand reputation, SEO penalties
- Biggest wins: Professional headers, clean npm audit
- Best ROI: 2-3 hours gets you 80% of security value

**Bottom line:** Headers + npm audit + CSP = 90% of what you need! 🎉

---

**Ready to start? Want to begin with the vercel.json update?** 🚀
