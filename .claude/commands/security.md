---
description: Security-focused review with OWASP Web checklist
argument-hint: [scope]
---

# /security - Security Review

**CRITICAL INSTRUCTIONS - READ FIRST:**
- Do NOT use the EnterPlanMode tool
- Do NOT save anything to ~/.claude/plans/
- Do NOT create any files
- Output ALL findings directly in this conversation as markdown

Run a security-focused review of the codebase or specific area.

**Rules:**
- DO NOT write or modify code
- OUTPUT directly in the chat response
- DO identify vulnerabilities and risks
- DO recommend fixes with specific guidance
- DO reference file locations and line numbers
- LEAVE implementation to the builder session

## Usage
```
/security [scope]
```

**Examples:**
- `/security` - Full security sweep
- `/security input` - Focus on input validation
- `/security api` - Focus on API routes
- `/security headers` - Focus on security headers

## Security Checklist

### Input Validation & Sanitization
- [ ] All user inputs validated with Zod schemas
- [ ] Salary inputs bounded to reasonable ranges
- [ ] Tax code format validated (regex pattern)
- [ ] No raw user input in calculations without validation

### API Security
- [ ] Rate limiting on API routes
- [ ] Request validation with Zod
- [ ] Response validation
- [ ] Error messages don't leak internal details
- [ ] Timeouts prevent hanging requests

### Secrets & Key Management
- [ ] API keys only in server-side code (`src/app/api/`, server actions)
- [ ] No secrets in client components (check for `process.env` without `NEXT_PUBLIC_`)
- [ ] No hardcoded keys/tokens in source (grep for API keys, tokens)
- [ ] Sensitive env vars not logged (check console.log/error statements)
- [ ] `.env` files in `.gitignore`

### Server-Side Enforcement
- [ ] Sensitive calculations happen server-side (not client-manipulable)
- [ ] Premium/gated features enforced server-side (not just hidden in UI)
- [ ] Payment/credit logic never trusts client input

### Security Headers (next.config.ts)
- [ ] Content-Security-Policy configured
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Strict-Transport-Security (HSTS)
- [ ] Permissions-Policy restricts APIs

### Client-Side Security
- [ ] No sensitive data in localStorage/sessionStorage
- [ ] XSS prevention (React escapes by default, verify dangerouslySetInnerHTML)
- [ ] No eval() or Function() with user input
- [ ] Dependencies audited for vulnerabilities (bun audit)

### Data Protection
- [ ] No PII in logs or analytics
- [ ] No PII in Sentry error reports
- [ ] HTTPS enforced (Vercel default)
- [ ] No sensitive data in URL parameters

### Third-Party Integrations
- [ ] Sentry configured to filter PII
- [ ] Analytics don't track sensitive inputs
- [ ] External scripts loaded with integrity checks (SRI)

### Supply Chain Security
- [ ] Run `bun audit` for known vulnerabilities
- [ ] Check for typosquatting in package.json
- [ ] Verify lockfile integrity (bun.lock)
- [ ] SRI hashes on CDN scripts
- [ ] Pin dependency versions (no `^` or `~` for critical packages)
- [ ] Review new dependencies before adding

### Modern Attack Vectors
- [ ] Prototype pollution protection
- [ ] CSP bypass prevention (no `unsafe-inline` without nonce)
- [ ] DOM clobbering prevention
- [ ] Clickjacking protection (X-Frame-Options)
- [ ] Open redirect prevention
- [ ] Subdomain takeover checks

## OWASP Web Top 10 (2021)

1. **A01 Broken Access Control** - N/A (no auth required)
2. **A02 Cryptographic Failures** - Check for exposed sensitive data
3. **A03 Injection** - Validate all inputs, especially in calculations
4. **A04 Insecure Design** - Review architecture patterns
5. **A05 Security Misconfiguration** - Check headers, configs
6. **A06 Vulnerable Components** - Run `bun audit`
7. **A07 Auth Failures** - N/A (no auth)
8. **A08 Data Integrity Failures** - Verify calculation logic
9. **A09 Logging Failures** - Check Sentry config
10. **A10 SSRF** - Check external API calls

## Output Format

```markdown
## Security Findings

### Critical
- [Issue]: [Location] - [Impact] - [Fix]

### High
...

### Medium
...

### Recommendations
...

### Passed Checks
...
```

## Key Files to Review

- `next.config.ts` - Security headers
- `src/lib/validation/` - Input schemas
- `src/app/api/` - API routes (check rate limiting, key usage)
- `src/app/actions/` - Server actions
- `src/lib/env.ts` - Environment variable validation
- `sentry.*.config.ts` - Error tracking
- `instrumentation-client.ts` - Client instrumentation
- `.gitignore` - Verify `.env*` excluded
- `.env.example` - No real secrets, only placeholders
