---
description: Security-focused review with OWASP Web checklist
argument-hint: [scope]
---

# /security - Security Review

**CRITICAL INSTRUCTIONS:**
- Do NOT use planning/spec modes or persist artifacts to disk
- Output ALL findings directly in this conversation as markdown
- Do NOT write or modify code (small illustrative snippets for fixes are OK)
- **No PASS/FAIL without referencing concrete files/snippets**
- Every finding must include **evidence** and **reproduction path**
- Tax Pack pre-live guardrail: Tax Pack is planned (not live); unless explicitly requested, review shipped surfaces only and list Tax Pack items as deferred readiness work.

## Evidence Standard

- **No "PASS"** unless you've found and inspected the actual implementation
- Every finding must include: file location, code snippet or pattern found, impact
- If implementation cannot be verified, mark as **UNVERIFIED**

## Usage
```
/security [scope]
```

**Scopes:**
- `/security` - Full security sweep
- `/security api` - Focus on API routes
- `/security input` - Focus on input validation
- `/security headers` - Focus on security headers
- `/security pii` - Focus on PII leakage
- `/security [file]` - Specific file review

---

## Step 0: Route Enumeration (Do This First)

**Before any checklist, enumerate the attack surface:**

```bash
# List all API routes
rg -l "export.*GET|export.*POST|export.*PUT|export.*DELETE" src/app/api/

# List server actions
rg -l "use server" src/

# Find middleware
ls src/middleware.ts 2>/dev/null || echo "No middleware"

# Check rewrites/redirects in config
rg "rewrites|redirects" next.config.ts
```

**For each route, document:**
| Route | Methods | Runtime | Accepts Untrusted Input? | Sends Email? | Calls External API? |
|-------|---------|---------|--------------------------|--------------|---------------------|

---

## Step 1: Abuse Controls

### Rate Limiting
- [ ] Per-route rate limits configured (not just global)
- [ ] Correct IP extraction behind proxy (`x-forwarded-for` parsing)
- [ ] **No "unknown" global bucket** (hash UA or fail closed)
- [ ] Secondary keys for abuse-prone endpoints (e.g., per-email for newsletter)
- [ ] Documented limits per route

**Search:**
```bash
rg "rateLimit|rateLimiter" src/app/api/
rg "x-forwarded-for|x-real-ip" src/
```

### Payload Limits
- [ ] Max JSON body size enforced per route
- [ ] Max array lengths in schemas
- [ ] Max string lengths in schemas
- [ ] Early reject on `content-length` if too large
- [ ] Timeouts on external calls (fetch with AbortController)

**Search:**
```bash
rg "request.json|request.text" src/app/api/
rg "AbortController|timeout" src/app/api/
```

### CSRF Protection
- [ ] POST/PUT/DELETE routes check `Origin` or `Referer` header
- [ ] Same-site cookie attribute where relevant
- [ ] No state-changing operations on GET

**Search:**
```bash
rg "origin|referer" src/app/api/ -i
rg "SameSite" src/
```

### Idempotency / Email Enumeration
- [ ] Email endpoints don't reveal if address exists
- [ ] Consistent response time regardless of existence
- [ ] Rate limit by email, not just IP

---

## Step 2: Input Validation

### Zod Schemas
- [ ] All user inputs validated with Zod schemas
- [ ] Schemas use `.strict()` to reject extra properties
- [ ] Numeric fields bounded (min/max, not just `z.number()`)
- [ ] String fields have max length
- [ ] Arrays have max length
- [ ] Deny dangerous keys: `__proto__`, `constructor`, `prototype`

**Search:**
```bash
rg "z\.(object|string|number|array)" src/lib/validation/
rg "\.strict\(\)" src/lib/validation/
```

### Tax Code Validation
- [ ] Tax code format validated (regex pattern)
- [ ] Salary inputs bounded to reasonable ranges (e.g., 0-10M)
- [ ] No raw user input passed to calculations without validation

---

## Step 3: Output Handling

### Error Responses
- [ ] No stack traces in production responses
- [ ] No vendor-specific error details leaked
- [ ] Consistent error envelope format
- [ ] Generic "invalid request" for validation failures (no field hints for attackers)

**Search:**
```bash
rg "catch|error" src/app/api/ -A 3
rg "stack|stackTrace" src/
```

### Response Shaping
- [ ] User input not reflected in responses without sanitization
- [ ] No HTML injection in JSON responses
- [ ] Escape user content in email templates

**Search:**
```bash
rg "escapeHtml|sanitize" src/
rg "dangerouslySetInnerHTML" src/
```

### Caching
- [ ] No PII in cacheable responses
- [ ] `Cache-Control: no-store` on sensitive endpoints
- [ ] `Vary: Cookie` where session-dependent
- [ ] CDN cache headers (`s-maxage`) only on truly static content

---

## Step 4: Security Headers

### App-Wide Headers (next.config.ts or middleware)

**Required:**
- [ ] `Strict-Transport-Security` (HSTS) - `max-age=31536000; includeSubDomains`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin` (or stricter)
- [ ] `Permissions-Policy` restricting unused APIs

**CSP Strategy:**
- [ ] CSP configured (even if report-only initially)
- [ ] No `unsafe-inline` without nonces
- [ ] No `unsafe-eval`
- [ ] `script-src` allowlist for third-party scripts
- [ ] Report-uri or report-to configured

**Search:**
```bash
rg "Content-Security-Policy|X-Frame-Options|Strict-Transport" next.config.ts src/middleware.ts
```

### Per-Route Headers
- [ ] Sensitive endpoints (unsubscribe, tokens, og) have restrictive headers
- [ ] API routes set `X-Content-Type-Options: nosniff`

---

## Step 5: PII Leakage Audit (PayeTax-Specific)

**This is the #1 real-world risk for a tax calculator.**

### Where PII Can Leak

| Location | What to Check | Search Pattern |
|----------|---------------|----------------|
| Server logs | Request bodies logged? | `console.log|console.error` in API routes |
| Sentry | User input in breadcrumbs/events? | `Sentry.captureException|setContext|setExtra` |
| Analytics | Salary/email in event params? | `gtag|track|analytics` with user data |
| URL params | Email tokens, salaries? | Routes accepting sensitive query params |
| Referrer | Leaking tokens to third parties? | `Referrer-Policy` header |
| Email content | User data in email subject/body? | Email template files |

**Search:**
```bash
# Logging in API routes
rg "console\.(log|error|warn)" src/app/api/

# Sentry breadcrumbs
rg "addBreadcrumb|setContext|setExtra|setUser" src/

# Analytics events
rg "gtag\(|track\(|analytics\." src/ -A 2
```

### Must Verify
- [ ] Calculator inputs (salary, tax code) NOT logged server-side
- [ ] Sentry configured to scrub sensitive fields
- [ ] Analytics events don't include salary/tax values
- [ ] Email addresses not in URL query params (use signed tokens)
- [ ] Referrer-Policy prevents token leakage

---

## Step 6: Next.js-Specific Surfaces

### Middleware
- [ ] `src/middleware.ts` reviewed for auth/security logic
- [ ] Middleware matcher patterns correct
- [ ] No bypasses via unusual paths

### Rewrites & Redirects
- [ ] No open redirects via user-controlled params
- [ ] Allowlist for redirect targets (internal paths only)

**Search:**
```bash
rg "redirect\(|NextResponse.redirect" src/
rg "rewrites|redirects" next.config.ts -A 10
```

### Image Optimizer
- [ ] Remote patterns allowlisted in `next.config.ts`
- [ ] No SSRF via user-supplied image URLs

### Edge vs Node Runtime
- [ ] Sensitive operations on Node runtime (not edge limitations)
- [ ] Environment variables available in chosen runtime

---

## Step 7: Third-Party Telemetry

### Sentry Configuration
- [ ] `denyUrls` configured to exclude third-party errors
- [ ] `beforeSend` hook filters PII
- [ ] Source maps not publicly accessible (or auth-gated)

### Analytics
- [ ] No sensitive data in event parameters
- [ ] No PII in page paths tracked
- [ ] Consent respected before loading

### Script Loading
- [ ] Third-party scripts loaded via CSP nonce (preferred) or strict allowlist
- [ ] No GTM unless hardened (or avoid entirely)
- [ ] Review all `next/script` usage

**Search:**
```bash
rg "Script.*src=|gtag|posthog|analytics" src/app/
```

---

## Step 8: Supply Chain

### Dependency Audit
```bash
bun audit
# Also cross-check: npm audit, GitHub advisory DB
```

**Note:** Audit tools have false negatives. Treat as indicators, not proof.

### Package.json Scripts
- [ ] Review `postinstall`, `prepare`, `preinstall` hooks
- [ ] No arbitrary code execution in scripts
- [ ] Pin high-risk dependencies (no `^` for security-critical packages)

### Lockfile
- [ ] `bun.lock` committed and used in CI
- [ ] Integrity hashes present

---

## Step 9: SSRF & Open Redirect

### SSRF
- [ ] Allowlist outbound hosts for any user-influenced fetches
- [ ] Reject private IP ranges (10.x, 172.16.x, 192.168.x, 127.x, ::1)
- [ ] DNS rebinding protection (resolve once, use IP)
- [ ] Timeouts on all external fetches

**High-risk patterns:**
```bash
rg "fetch\(" src/app/api/ -A 3
# Check if URL comes from user input
```

### Open Redirect
- [ ] All redirects use allowlist of internal paths
- [ ] No user-controlled redirect targets

**Search:**
```bash
rg "redirect\(|NextResponse.redirect|return.*redirect" src/
```

---

## Step 10: Secrets Management

### Server-Only Secrets
- [ ] `process.env.*` (non-NEXT_PUBLIC) only in server code
- [ ] No secrets in client components or shared modules imported by client
- [ ] No hardcoded keys/tokens in source

**Search:**
```bash
# Non-public env vars in client files
rg "process\.env\." src/components/ src/app/**/page.tsx | grep -v NEXT_PUBLIC

# Hardcoded secrets
rg "sk_live|sk_test|api_key|apikey|password|secret|token" src/ --iglob '*.ts' --iglob '*.tsx'
```

### Environment Files
- [ ] `.env*` in `.gitignore`
- [ ] `.env.example` has placeholders only, no real values
- [ ] Required env vars validated at startup (fail fast)

---

## OWASP Top 10 (2021) Mapping

| OWASP | PayeTax Relevance | What to Check |
|-------|-------------------|---------------|
| A01 Broken Access Control | Medium - no auth, but has admin-ish endpoints | Webhooks, IndexNow, email endpoints |
| A02 Cryptographic Failures | Low - no stored secrets | Token generation (unsubscribe) |
| A03 Injection | Medium | Zod validation, no raw SQL/shell |
| A04 Insecure Design | Medium | Trust boundaries in API routes |
| A05 Security Misconfiguration | High | Headers, CSP, error exposure |
| A06 Vulnerable Components | Medium | bun audit, dependency review |
| A07 Auth Failures | N/A | No user authentication |
| A08 Data Integrity Failures | Medium | Calculation logic, signed tokens |
| A09 Logging Failures | Medium | PII in logs, Sentry config |
| A10 SSRF | Medium | IndexNow, any URL submission |

---

## Output Format

```markdown
## Security Findings

**Scope:** [files examined]
**Evidence basis:** [filesystem access / provided files only]

### Critical
| Issue | Location | Evidence | Impact | Fix |
|-------|----------|----------|--------|-----|

### High
| Issue | Location | Evidence | Impact | Fix |
|-------|----------|----------|--------|-----|

### Medium
| Issue | Location | Evidence | Impact | Fix |
|-------|----------|----------|--------|-----|

### Low
| Issue | Location | Evidence | Impact | Fix |
|-------|----------|----------|--------|-----|

### Passed Checks
| Check | Location | Evidence |
|-------|----------|----------|

### Unverified (Couldn't Check)
| Check | What's Needed |
|-------|---------------|
```

---

## Key Files to Review

- `next.config.ts` - Headers, rewrites, redirects, remote patterns
- `src/middleware.ts` - Request filtering (if exists)
- `src/app/api/**/*.ts` - All API routes
- `src/lib/validation/` - Zod schemas
- `src/lib/rateLimit.ts` - Rate limiting implementation
- `sentry.*.config.ts` - Error tracking config
- `emails/*.tsx` - Email templates for escaping
- `.env.example` - Secret placeholders
