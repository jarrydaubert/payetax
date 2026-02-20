# Email Auth Monitoring (SPF/DKIM/DMARC)

Owner: releasing engineer (primary), growth/content owner (secondary reviewer)  
Cadence: monthly, during the first business week  
Scope: sender domains used by Kit (newsletter) and Resend (transactional)

---

## Why This Exists

Email authentication drift (missing SPF/DKIM/DMARC records, weak DMARC policy, stale provider selectors) silently degrades deliverability and trust.

This guide defines one repeatable monthly check and one reporting format so issues are caught early.

---

## Monthly Checklist

Run these checks for `payetax.co.uk` and any sending subdomains used by Kit/Resend.

### 1) DNS Authentication Records

- [ ] SPF record exists on root domain and is valid syntax (`v=spf1 ...`).
- [ ] DMARC record exists at `_dmarc.<domain>`.
- [ ] DKIM selector records expected by Resend exist.
- [ ] DKIM selector records expected by Kit exist (if Kit is sending from your domain).

Suggested DNS checks:

```bash
nslookup -type=TXT payetax.co.uk
nslookup -type=TXT _dmarc.payetax.co.uk
nslookup -type=TXT resend._domainkey.payetax.co.uk
```

For Kit and additional DKIM selectors, use the exact selector names shown in provider domain-auth settings.

### 2) Provider Dashboard Status

- [ ] Resend domain auth status is verified (SPF/DKIM active).
- [ ] Kit sending-domain auth status is verified (if using custom from-domain).
- [ ] No provider warnings about DNS alignment/auth failures.

### 3) Policy Strength + Deliverability Risk

- [ ] DMARC policy and pct reviewed (`p=none/quarantine/reject`).
- [ ] Any auth gaps have explicit remediation owner and ETA.
- [ ] High-risk issues (missing DKIM, SPF invalid, DMARC missing) escalate same day.

---

## Owner Process

1. Run DNS checks and capture raw output.
2. Confirm auth status in Resend and Kit dashboards.
3. Record result in a new monthly report under `docs/reports/email-auth/`.
4. If any item is `FAIL`, create/update a blocker issue with:
   - exact failing record/provider
   - expected value/source
   - owner
   - ETA
5. Link the report in release notes when relevant.

---

## Report Template

Create `docs/reports/email-auth/YYYY-MM.md` with:

- Date/time and checker
- DNS results (`PASS` / `FAIL` / `N/A`)
- Provider dashboard results (`PASS` / `FAIL` / `N/A`)
- Risk summary
- Remediation actions (owner + ETA)

Use `docs/reports/email-auth/2026-02.md` as the example baseline.
