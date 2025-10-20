# Security Policy

## Supported Versions

We currently support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :x:                |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of PayeTax seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub/GitLab issues.**

Instead, please report them via email to:

- **Email:** security@payetax.co.uk
- **Subject:** [SECURITY] Brief description of issue

### What to Include

Please include the following information in your report:

- Type of issue (e.g., XSS, CSRF, SQL injection, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

- **Initial Response:** Within 48 hours
- **Confirmation:** Within 5 business days
- **Fix Timeline:** Depends on severity
  - Critical: 1-3 days
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: Best effort

### Our Commitment

- We will acknowledge receipt of your vulnerability report
- We will provide an estimated timeline for a fix
- We will notify you when the vulnerability is fixed
- We will publicly acknowledge your responsible disclosure (unless you prefer to remain anonymous)

## Security Measures

### Current Security Implementations

1. **Content Security Policy (CSP)**
   - Strict CSP headers configured
   - Prevents XSS attacks
   - Restricts resource loading

2. **HTTPS/HSTS**
   - Enforced HTTPS
   - HSTS headers enabled
   - Secure cookie settings

3. **Input Validation**
   - All user inputs validated
   - Zod schema validation
   - XSS protection with HTML escaping

4. **Error Monitoring**
   - Sentry integration
   - PII scrubbing
   - Error tracking and alerting

5. **Dependency Security**
   - Regular dependency audits (`npm audit`)
   - Automated security scanning (GitLab CI)
   - Lock file committed (package-lock.json)

6. **Environment Variables**
   - Secrets not committed to git
   - `.env.local` in `.gitignore`
   - Vercel environment variables for production

7. **API Security**
   - Rate limiting implemented
   - CORS properly configured
   - API route protection

### Security Best Practices

**For Contributors:**

1. **Never commit secrets**
   - Use `.env.local` for local secrets
   - Check `.gitignore` before committing

2. **Validate all inputs**
   - Use Zod schemas for validation
   - Sanitize user-provided data
   - Escape HTML output

3. **Follow secure coding practices**
   - Avoid `dangerouslySetInnerHTML`
   - Use parameterized queries
   - Implement CSRF protection

4. **Keep dependencies updated**
   - Run `npm audit` regularly
   - Fix vulnerabilities promptly
   - Review dependency changes

5. **Test security**
   - Run security audits before PR
   - Test authentication/authorization
   - Verify CSP headers

## Security Contacts

- **Security Email:** security@payetax.co.uk
- **General Contact:** Via [feedback form](https://payetax.co.uk/feedback)

## Security Advisories

Security advisories will be published:
- In this repository (SECURITY.md updates)
- On our website (payetax.co.uk)
- Via email to registered users (if applicable)

## Attribution

We believe in giving credit where credit is due. Security researchers who responsibly disclose vulnerabilities will be:

- Acknowledged in our security advisories (unless anonymous preferred)
- Listed in our contributors section
- Thanked publicly (with permission)

## Scope

### In Scope

- Web application (payetax.co.uk)
- API endpoints (/api/*)
- Authentication/Authorization mechanisms
- Data handling and storage
- Third-party integrations

### Out of Scope

- Denial of service attacks
- Social engineering attacks on staff
- Physical attacks
- Issues in third-party dependencies (report to them directly)
- Already known/fixed vulnerabilities

## Legal

We will not take legal action against security researchers who:
- Act in good faith
- Report vulnerabilities responsibly
- Do not access data beyond what is necessary
- Do not degrade service performance
- Do not modify or destroy data
- Do not publicly disclose until we've had time to fix

## Questions?

If you have questions about this security policy, please contact:
- Email: security@payetax.co.uk
- Subject: [SECURITY POLICY] Your question

---

**Last Updated:** October 20, 2025  
**Version:** 1.0
