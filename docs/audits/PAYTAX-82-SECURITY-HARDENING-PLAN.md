# PAYTAX-82: Security Hardening Plan

**Date:** November 8, 2025  
**Status:** 📋 Planning  
**Priority:** 🔴 High

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Scope](#scope)
3. [Current Security Posture](#current-security-posture)
4. [Action Plan](#action-plan)
5. [Implementation Checklist](#implementation-checklist)
6. [Success Criteria](#success-criteria)

---

## Executive Summary

**Objective:** Harden PayeTax security posture to production-grade standards

**Key Focus Areas:**
1. Content Security Policy (CSP)
2. XSS Prevention
3. API Input Sanitization (Zod)
4. Dependency Vulnerabilities
5. Environment Variable Security
6. HTTPS Enforcement

**Expected Outcome:** Zero high/critical vulnerabilities, comprehensive security headers, validated inputs

---

## Scope

### In Scope ✅
- CSP header configuration
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- XSS prevention validation
- Zod validation for all API inputs
- npm audit and vulnerability remediation
- Environment variable security audit
- HTTPS enforcement in production
- Security testing automation

### Out of Scope ❌
- Backend API security (no backend)
- Database security (no database)
- Authentication/Authorization (no auth system yet)
- DDoS protection (handled by Vercel)
- WAF configuration (handled by Vercel)

---

## Current Security Posture

### ✅ What We Have

1. **Existing Security Script:**
   - `scripts/security-audit.js` - npm audit runner with history tracking
   - Threshold enforcement (0 critical, 0 high, 2 moderate, 10 low)

2. **Next.js Security:**
   - `poweredByHeader: false` in next.config.ts
   - React Strict Mode enabled
   - Source maps enabled for debugging

3. **Environment Variables:**
   - `.env.template` for documentation
   - `.env.local.example` for local setup
   - `.gitignore` excludes sensitive files

### ⚠️ What's Missing

1. **No CSP Headers** - Content Security Policy not configured
2. **No Security Headers Middleware** - Missing X-Frame-Options, X-Content-Type-Options, etc.
3. **No XSS Validation** - No systematic sanitization
4. **Incomplete Zod Validation** - Not all inputs validated (PAYTAX-84-89 partially done)
5. **No HTTPS Enforcement** - No redirect logic (relies on Vercel)
6. **No Security Testing** - No automated security tests in CI/CD

---

## Action Plan

### Phase 1: Security Headers (1-2 hours)

#### 1.1 Create Security Middleware

**File:** `src/middleware.ts` (NEW)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Content Security Policy (CSP)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://www.googletagmanager.com https://www.google-analytics.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  
  // Additional security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HTTPS enforcement
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') !== 'https'
  ) {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.nextUrl.pathname}`,
      301
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**Tasks:**
- [ ] Create `src/middleware.ts` with CSP and security headers
- [ ] Test CSP doesn't break Google Analytics
- [ ] Test CSP doesn't break Framer Motion animations
- [ ] Verify HTTPS redirect in production
- [ ] Test security headers with SecurityHeaders.com

---

#### 1.2 Vercel Headers Configuration

**File:** `vercel.json` (UPDATE)

Add security headers as fallback:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "X-DNS-Prefetch-Control",
          "value": "on"
        }
      ]
    }
  ]
}
```

**Tasks:**
- [ ] Update `vercel.json` with HSTS and DNS prefetch headers
- [ ] Deploy to preview environment
- [ ] Verify headers with `curl -I https://preview.payetax.co.uk`

---

### Phase 2: XSS Prevention (1 hour)

#### 2.1 Input Sanitization Utility

**File:** `src/lib/security.ts` (NEW)

```typescript
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML to prevent XSS attacks
 * Uses DOMPurify for comprehensive sanitization
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
  });
}

/**
 * Sanitize user input for safe display
 * Escapes HTML entities
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate URL to prevent javascript: and data: XSS
 */
export function isSafeUrl(url: string): boolean {
  const urlPattern = /^(https?:\/\/|\/)/;
  return urlPattern.test(url) && !url.startsWith('javascript:') && !url.startsWith('data:');
}
```

**Tasks:**
- [ ] Install `isomorphic-dompurify`: `npm install isomorphic-dompurify`
- [ ] Create `src/lib/security.ts` with sanitization utilities
- [ ] Add tests for XSS prevention
- [ ] Audit all user inputs (feedback form, calculator inputs, etc.)
- [ ] Apply sanitization where needed

---

### Phase 3: API Input Validation with Zod (2-3 hours)

#### 3.1 Complete Existing Validation Gaps

**Reference Issues:**
- PAYTAX-84: Analytics validation (already done?)
- PAYTAX-85: MDX components validation
- PAYTAX-86: HomePage validation
- PAYTAX-87: SalaryPage validation
- PAYTAX-89: Config files validation

**Tasks:**
- [ ] Review PAYTAX-84 through PAYTAX-89 completion status
- [ ] Identify any remaining unvalidated inputs
- [ ] Add Zod schemas for all API routes (if any)
- [ ] Validate all form submissions (feedback, calculator)
- [ ] Add validation error handling UI

#### 3.2 Create Validation Test Suite

**File:** `src/lib/__tests__/validation.security.test.ts` (NEW)

Test all Zod schemas with malicious inputs:
- SQL injection attempts
- Script injection
- Overflow values
- Special characters
- Null/undefined handling

**Tasks:**
- [ ] Create validation security test suite
- [ ] Test all Zod schemas with malicious inputs
- [ ] Ensure proper error messages (no stack trace leakage)

---

### Phase 4: Dependency Security (1 hour)

#### 4.1 Run Comprehensive Security Audit

**Tasks:**
- [ ] Run `npm audit --audit-level=info`
- [ ] Document all vulnerabilities in `audit-outputs/`
- [ ] Categorize by severity
- [ ] Create remediation plan for each

#### 4.2 Fix Vulnerabilities

**Priority Order:**
1. **Critical** - Fix immediately (same day)
2. **High** - Fix within 48 hours
3. **Moderate** - Fix within 1 week
4. **Low** - Fix when convenient

**Remediation Strategies:**
- Update to patched version
- Replace package with secure alternative
- Remove package if not essential
- Wait for fix (only for dev dependencies, low severity)

**Tasks:**
- [ ] Fix all critical vulnerabilities (target: 0)
- [ ] Fix all high vulnerabilities (target: 0)
- [ ] Fix moderate vulnerabilities (target: ≤2)
- [ ] Document any remaining low vulnerabilities

#### 4.3 Automate Security Audits

**File:** `.github/workflows/security.yml` (NEW if using GitHub)  
**OR:** Update `.gitlab-ci.yml`

```yaml
security-audit:
  stage: test
  script:
    - npm run security:audit
  rules:
    - if: '$CI_PIPELINE_SOURCE == "schedule"'  # Daily
    - if: '$CI_COMMIT_BRANCH == "main"'        # On merge
```

**Tasks:**
- [ ] Add security audit to CI/CD pipeline
- [ ] Configure to run daily
- [ ] Set up failure notifications
- [ ] Create security audit dashboard (optional)

---

### Phase 5: Environment Variable Security (30 min)

#### 5.1 Audit Current Environment Variables

**Check:**
- `.env.local` - local development (git-ignored ✅)
- `.env.template` - documentation template
- Vercel environment variables - production secrets

**Tasks:**
- [ ] List all environment variables
- [ ] Verify all secrets are in Vercel dashboard (not in code)
- [ ] Ensure no secrets committed to git (search git history)
- [ ] Document required variables in `.env.template`

#### 5.2 Environment Variable Validation

**File:** `src/config/env.ts` (UPDATE or CREATE)

```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  LINEAR_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

**Tasks:**
- [ ] Create/update environment variable schema
- [ ] Validate all env vars at build time
- [ ] Add helpful error messages for missing vars

---

### Phase 6: HTTPS Enforcement (15 min)

**Already covered in Phase 1 (middleware), but additional checks:**

**Tasks:**
- [ ] Verify middleware redirects HTTP → HTTPS in production
- [ ] Test with `curl -I http://payetax.co.uk` (should 301 to https)
- [ ] Verify HSTS header is present
- [ ] Check SSL Labs rating: https://www.ssllabs.com/ssltest/

---

### Phase 7: Security Testing (1-2 hours)

#### 7.1 Create Security Test Suite

**File:** `e2e/security.spec.ts` (NEW)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Security Headers', () => {
  test('should have CSP header', async ({ page }) => {
    const response = await page.goto('/');
    const csp = response?.headers()['content-security-policy'];
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
  });

  test('should have X-Frame-Options', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.headers()['x-frame-options']).toBe('DENY');
  });

  test('should have X-Content-Type-Options', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.headers()['x-content-type-options']).toBe('nosniff');
  });

  test('should have HSTS in production', async ({ page }) => {
    // Only test in production environment
    if (process.env.NODE_ENV === 'production') {
      const response = await page.goto('/');
      const hsts = response?.headers()['strict-transport-security'];
      expect(hsts).toBeDefined();
      expect(hsts).toContain('max-age=');
    }
  });
});

test.describe('XSS Prevention', () => {
  test('should sanitize calculator input', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('input[type="text"]').first();
    await input.fill('<script>alert("XSS")</script>');
    
    // Should not execute script
    page.on('dialog', () => {
      throw new Error('XSS vulnerability: Script executed');
    });
    
    await page.waitForTimeout(1000);
  });
});
```

**Tasks:**
- [ ] Create `e2e/security.spec.ts` with security tests
- [ ] Test all security headers
- [ ] Test XSS prevention on user inputs
- [ ] Test HTTPS redirect logic
- [ ] Add to CI/CD pipeline

#### 7.2 Manual Security Testing Checklist

**Tasks:**
- [ ] Test with OWASP ZAP scanner (optional but recommended)
- [ ] Run Mozilla Observatory: https://observatory.mozilla.org/
- [ ] Check SecurityHeaders.com: https://securityheaders.com/
- [ ] SSL Labs test: https://www.ssllabs.com/ssltest/
- [ ] Test XSS manually in feedback forms

---

## Implementation Checklist

### Week 1: Core Security

- [ ] **Phase 1: Security Headers** (1-2 hours)
  - [ ] Create `src/middleware.ts` with CSP
  - [ ] Update `vercel.json` with HSTS
  - [ ] Deploy and verify headers

- [ ] **Phase 2: XSS Prevention** (1 hour)
  - [ ] Install DOMPurify
  - [ ] Create `src/lib/security.ts`
  - [ ] Audit and sanitize user inputs
  - [ ] Add XSS tests

- [ ] **Phase 4: Dependency Security** (1 hour)
  - [ ] Run `npm audit`
  - [ ] Fix all critical/high vulnerabilities
  - [ ] Document remaining issues

### Week 2: Validation & Testing

- [ ] **Phase 3: Zod Validation** (2-3 hours)
  - [ ] Review PAYTAX-84-89 status
  - [ ] Complete remaining validation
  - [ ] Add validation security tests

- [ ] **Phase 5: Environment Security** (30 min)
  - [ ] Audit environment variables
  - [ ] Create env validation schema
  - [ ] Verify no secrets in git

- [ ] **Phase 7: Security Testing** (1-2 hours)
  - [ ] Create security test suite
  - [ ] Run manual security scans
  - [ ] Add tests to CI/CD

### Week 3: Automation & Documentation

- [ ] **Phase 4.3: Automate Security Audits**
  - [ ] Add security to CI/CD
  - [ ] Configure daily runs
  - [ ] Set up notifications

- [ ] **Documentation**
  - [ ] Update CONTRIBUTING.md with security practices
  - [ ] Document security architecture
  - [ ] Create security runbook

---

## Success Criteria

### ✅ Must Have (Blocking)

1. **Zero Critical/High Vulnerabilities**
   - `npm audit` shows 0 critical, 0 high

2. **Security Headers Present**
   - CSP configured and working
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - HSTS in production

3. **XSS Prevention**
   - All user inputs sanitized
   - No script execution from user input

4. **HTTPS Enforcement**
   - HTTP redirects to HTTPS in production
   - HSTS header present

5. **Security Tests Pass**
   - All security tests in `e2e/security.spec.ts` pass

### 🎯 Should Have (Important)

6. **Input Validation Complete**
   - All inputs validated with Zod
   - Proper error handling

7. **Environment Security**
   - No secrets in git
   - All env vars validated

8. **Automated Security Audits**
   - Daily npm audit runs
   - Failure notifications

### 💡 Nice to Have (Bonus)

9. **Security Scores**
   - Mozilla Observatory: A rating
   - SecurityHeaders.com: A rating
   - SSL Labs: A+ rating

10. **Documentation**
    - Security architecture documented
    - Security runbook created
    - Team training materials

---

## Timeline

**Estimated Total Time:** 8-12 hours

**Suggested Schedule:**
- **Day 1 (4 hours):** Phases 1, 2, 4 - Headers, XSS, Audit
- **Day 2 (3 hours):** Phase 3 - Zod Validation completion
- **Day 3 (2 hours):** Phases 5, 6, 7 - Env, HTTPS, Testing
- **Day 4 (2 hours):** Automation, documentation, final testing

---

## Resources

### Tools
- [SecurityHeaders.com](https://securityheaders.com/) - Header scanner
- [Mozilla Observatory](https://observatory.mozilla.org/) - Security audit
- [SSL Labs](https://www.ssllabs.com/ssltest/) - SSL/TLS test
- [OWASP ZAP](https://www.zaproxy.org/) - Security scanner
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Dependency audit

### Documentation
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CSP Guide](https://content-security-policy.com/)
- [Vercel Security](https://vercel.com/docs/concepts/security)

---

## Notes

- This plan focuses on frontend/static site security (no backend)
- Authentication/authorization will be separate future work
- Some security handled by Vercel (DDoS, WAF, edge security)
- CSP may need adjustment based on third-party scripts
- Regular security audits should continue after initial hardening

---

**Status:** ✅ Plan Ready - Ready to implement  
**Next Step:** Start Phase 1 (Security Headers)
