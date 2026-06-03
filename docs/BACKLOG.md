# PayeTax Backlog

Current backlog for the public R&D version of PayeTax.

## P1

| ID | Item | Acceptance |
| --- | --- | --- |
| P1-1 | Finish Brevo API cutover | PAYE results and director results use the shared outbound email boundary and pass tests. |
| P1-2 | Verify Vercel env and project link | Current Vercel project has Brevo, GA4, Sentry, and Upstash variables configured without stale local project links. |
| P1-3 | Recheck production rate limiting | Upstash-backed public mutation routes return expected health and limiter behaviour after env migration. |

## P2

| ID | Item | Acceptance |
| --- | --- | --- |
| P2-1 | Tighten public docs for R&D positioning | README, AGENTS, ops, testing, and env docs stay aligned with the public repo scope. |
| P2-2 | Add focused tests for email delivery boundary | Unit tests cover configured, unconfigured, and delivery-failed Brevo API outcomes without real network calls. |
