# Post Release Validation

After a production deploy:

- [ ] Homepage loads.
- [ ] Main calculator returns expected values for a known salary.
- [ ] Director Intelligence loads and calculates.
- [ ] Tools hub links work.
- [ ] Blog index and a blog post load.
- [ ] PAYE results email sends through the Brevo API.
- [ ] Director results email sends through the Brevo API.
- [ ] Sentry reports no new release-blocking errors.
- [ ] GA4 receives a page view if analytics changed.
- [ ] Rate-limit health check passes when using the configured secret.
