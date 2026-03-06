# CLAUDE.md - PayeTax

UK PAYE tax calculator focused on accuracy, privacy, and clear user outcomes.

## Working Style

Prioritize:
- **Accuracy-first**: calculations must match HMRC rules.
- **Single source of truth**: tax rates live in `src/constants/taxRates.ts`.
- **Test behavior**: cover user-visible outcomes, not implementation details.
- **Accessibility + performance**: ship fast and inclusive UI.

Before suggesting code changes:
- Check for existing patterns in the codebase.
- Verify calculations against `src/constants/taxRates.ts`.
- Consider accessibility impacts.

After making changes:
- `bun run fix-all`
- `bun run test:no-coverage`

Security checks (when relevant):
- Scan for hardcoded secrets in `src/`.
- Ensure user input is validated.
- Avoid leaking server env vars into client components.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Zod
- Zustand
- Jest + Playwright
- Biome
- Bun

## Quick Commands

```bash
bun run dev                 # Start dev server
bun run fix-all             # Format, lint, typecheck
bun run check:repo          # Read-only repo verification gate
bun run harness:local       # Repo gate + quick tests + build
bun run test:no-coverage    # Fast tests
bun run test                # Full tests with coverage
bun run test:e2e            # Playwright E2E
bun run bundle:analyze      # Bundle analysis
bun run check:env-contract # Verify critical env/template/schema sync
bun run release:verify      # Fix, test, and build release gate
bun run linear:me           # View Linear issues
bun run gitlab:status       # GitLab project + MR + pipeline + release summary
bun run gitlab:mr:status    # Open MR for the current branch
bun run audit:gitlab:governance # Basic GitLab policy + CI usage audits
```

## Vercel CLI

```bash
vercel whoami
vercel logout && vercel login
vercel env pull .env.local
vercel link
```

## Source of Truth

- Tax rates: `src/constants/taxRates.ts`
- Calculator logic: `src/lib/taxCalculator.ts`
- Director Intelligence logic: `src/lib/tax/`

## More Docs

See `docs/guides/` for detail:
- `TESTING.md`
- `SYSTEM_OVERVIEW.md`
- `LINEAR.md`
- `OPS_RUNBOOK.md`
