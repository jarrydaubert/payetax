---
description: Evidence-led review of privacy, consent, results email and public claims
argument-hint: [scope]
---

# /compliance - Privacy And Claims Review

Read `AGENTS.md` first. Review shipped flows only unless another scope is requested. Keep the review read-only by default, report findings in chat, and preserve relied-upon evidence according to the root contract.

## Evidence Standard

- Enumerate the routes, scripts, storage and providers actually involved. Do not assume there is a newsletter, audience list, account system or deferred feature.
- Verify implementation before declaring a check passed. Include file locations and exact UI wording or sanitised snippets; mark vendor settings and runtime behaviour unverified unless inspected.
- For legal conclusions, consult current primary guidance from the [ICO](https://ico.org.uk/for-organisations/), [ASA/CAP](https://www.asa.org.uk/codes-and-rulings/advertising-codes.html) or [FCA](https://www.fca.org.uk/firms/financial-promotions), as relevant. Do not infer an exemption or regulatory status merely because the product is free.

## Privacy And Consent

1. Trace calculator inputs through browser storage, optional results email, APIs, logs and telemetry. Do not assume inputs never leave the browser or are never stored. Check `docs/guides/SENTRY_LOGGING.md` and `docs/guides/API_AND_ABUSE_CONTROLS.md` against the implementation.
2. Inspect `src/components/organisms/CookieBanner.tsx`, `src/components/organisms/Analytics.tsx`, `src/app/layout.tsx` and their imported helpers. Exercise consent, rejection, withdrawal, persistence, keyboard access and focus behaviour when runtime access is available.
3. Assess consent and any claimed exemptions per integration. Distinguish consent-based GA4, Vercel Web Analytics, Vercel Speed Insights and Sentry; do not impose one assumed data or consent model on them all.
4. Check the privacy page against observed data categories, purposes, lawful bases, processors, retention, transfers and user-rights processes. Treat deployment locations, processor terms and dashboard settings as facts to verify, not defaults to invent.
5. Confirm tax inputs, recipient details and tokens are excluded from analytics and error payloads as required by the implementation's privacy contracts. Use synthetic inputs and sanitised evidence; do not expose secrets or personal data.

## Results Email

- Trace `src/app/api/send-results/route.ts` and `src/app/api/send-director-results/route.ts` through `src/lib/email/` and the Brevo delivery implementation.
- Check explicit user initiation, submitted-result validity, sender identity, privacy link, escaping, minimised payloads and logging, and any tracking or promotional content.
- Verify provider retention and deletion processes separately. Do not prescribe mailing-list unsubscribe or suppression workflows for transactional-only results email.

## Public Claims And Readability

- Verify accuracy, savings, privacy, security and provider claims against evidence. Keep year, region, period, pension method and material exclusions close to the claim they qualify.
- Distinguish information and illustrative comparisons from personalised advice; identify the precise wording and practical risk rather than banning useful terms in isolation.
- Check disclaimers are accurate, proportionate and placed where they affect understanding. Do not require a repeated stock disclaimer on every section or replace unsupported claims with generic caveats.
- For blog work, follow `docs/blog/README.md` and its linked accuracy and editorial guidance. Keep this command as a privacy/claims lens, not another blog writing standard or mandatory reviewer loop.

## Report

State scope and evidence, then findings with location, observed behaviour, risk, applicable official source and focused recommendation. Give separate privacy/consent, email and public-claims verdicts, distinguishing verified, partially verified and unverified items. Record commands and runtime checks actually run, vendor-setting gaps and any remaining uncertainty. A checklist pass is not legal certification.
