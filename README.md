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
