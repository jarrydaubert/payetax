# Director Guide Go-Live Reference

Purpose: define the go-live scope and non-goals. Implementation tasks belong in `docs/BACKLOG.md`.

## Go-Live Scope

- Director guide calculator + education panel
- Email results flow
- VAT warnings as education-only
- Survival-mode messaging for non-positive profit
- Region-specific income tax bands

## Release Plan (Phased)

**Phase 1 — P0 blockers**
Status: complete (email endpoints recompute server-side + tests, CI gates, required prod envs set).
- Email endpoints recompute server-side + tests
- CI gates for build + tests
- Required env vars in production

**Phase 2 — Product polish**
- OG images, tools nav, internal links
- Structured data tax-rates API
- Analytics events
- PWA install page + FAQ
- MDX cache + token cleanup
- Security docs + audit hygiene

**Phase 3 — QA & ship**
- Run: `bun run test:no-coverage`, `bun run build`, `bun run test:e2e:critical`
- Smoke: calculator, director guide, blog, OG previews
- Push feature branch, prep release notes

## Out of Scope

- Paid exports or tax packs
- Shareable links
- Multi-director or household optimization
- Accounting integrations

## References

- `docs/business/DIRECTOR_CALCULATOR_BUILD.md`
- `docs/business/DIRECTOR_TAX_MATH.md`
- `src/constants/taxRates.ts`
