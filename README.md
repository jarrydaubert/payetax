# PayeTax

PayeTax is a UK PAYE take-home pay calculator focused on accuracy, privacy, and clear user outcomes.

Start here:

- Canonical project docs: [`docs/README.md`](docs/README.md)
- Product direction: [`docs/business/PRODUCT_DIRECTION.md`](docs/business/PRODUCT_DIRECTION.md)
- Agent contract: [`AGENTS.md`](AGENTS.md)
- Testing standard: [`docs/guides/TESTING.md`](docs/guides/TESTING.md)
- Ops runbook: [`docs/guides/OPS_RUNBOOK.md`](docs/guides/OPS_RUNBOOK.md)

Protected sources of truth:

- Tax rates: [`src/constants/taxRates.ts`](src/constants/taxRates.ts)
- PAYE calculator engine: [`src/lib/taxCalculator.ts`](src/lib/taxCalculator.ts)
- Director Intelligence tax logic: [`src/lib/tax/`](src/lib/tax/)

Common commands:

```bash
bun run dev                 # Start local dev server with webpack
bun run check:repo          # Read-only lint/type/version/env/event/test-skip checks
bun run fix-all             # Mutating format/lint pass plus repo checks
bun run test:no-coverage    # Fast Jest suite
bun run build               # Production build
```

Use `bun run dev:turbo` only when explicitly checking the Turbopack dev path.

## Repo quality

PayeTax allows AI-assisted changes, but unverified AI-assisted code is not acceptable. Public GitHub pull requests are protected by:

- `CI`: install from `bun.lock`, repo checks, and production build.
- `CodeQL`: JavaScript and TypeScript code scanning.
- Dependabot dependency monitoring through `.github/dependabot.yml`.
- Secret scanning and push protection in GitHub repository settings.

Local environment values should be copied from `.env.template` when needed. Do not commit real `.env` files.
