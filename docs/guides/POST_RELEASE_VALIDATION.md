# Post Release Validation

After a production deploy:

- [ ] Homepage loads.
- [ ] Main calculator returns expected values for a known salary.
- [ ] Director Intelligence loads and calculates.
- [ ] Tools hub links work.
- [ ] Blog index and a blog post load.
- [ ] PAYE results email sends through the Brevo API.
- [ ] Director results email sends through the Brevo API.
- [ ] Sentry reports no new release-blocking PAYE or Director calculator errors.
- [ ] Vercel Web Analytics receives traffic if analytics changed.
- [ ] GA4 receives a page view after accepting analytics cookies if GA4 changed.
- [ ] Rate-limit health check passes when using the configured secret.
