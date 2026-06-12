# State Of Play

PayeTax is now a public R&D project.

## Current Direction

- Keep the calculator useful and accurate.
- Keep the blog.
- Keep transactional email for results.
- Keep Vercel Web Analytics, Vercel Speed Insights, GA4, calculator-focused Sentry, and Upstash where they support quality and debugging.
- Avoid growth plumbing that does not serve the R&D goal.

## Current Watchpoints

- Brevo API, Upstash, Sentry, GA4, Vercel Web Analytics, and Vercel Speed Insights are wired for the current Vercel project.
- Post-release validation should still include a real PAYE email send, a Director email send, and the rate-limit health endpoint when env values change.
- Vercel Speed Insights data is available through the Vercel dashboard; CLI metric queries require an Observability Plus plan.
