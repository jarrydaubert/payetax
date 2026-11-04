# PayeTax

Your salary is only part of the picture. PayeTax is a free UK take-home pay calculator that helps you see what is left after Income Tax, National Insurance and other deductions.

**[Try PayeTax](https://payetax.co.uk/#tax-calculator)** · [Explore the tools](https://payetax.co.uk/tools) · [Read TaxInsights](https://payetax.co.uk/blog)

## Understand your pay

Enter your salary, choose a tax year and region, and adjust the details that matter to you. You can:

- See your take-home pay and deductions across yearly, monthly, weekly and other pay periods.
- Explore how a pension contribution, student loan or tax code changes your estimate.
- Use Scottish income tax rates where they apply.
- Compare pay scenarios, then email a copy of your results.
- Explore director salary and dividend scenarios with Director Intelligence.
- Find focused tax tools and plain-English guides to help make sense of your payslip.

PayeTax gives estimates, not financial or tax advice. Your payslip can differ because of payroll timing, benefits or employer-specific deductions. Enter your pension contribution even for net pay or relief at source; the main calculator estimates all contributions as salary sacrifice, which may overstate take-home. The calculator's pension disclosure and supporting content explain the assumptions where you need them.

## Built with care

PayeTax is independently built and maintained, with public source code. Calculations use explicit tax policies and deterministic rules. Tests include hand-derived PAYE fixtures, checks for input and result behaviour, and browser journeys. Each layer provides different evidence; none is a promise that every payslip will match.

If you are curious about the working, start with the [testing guide](docs/guides/TESTING.md). Contributions should follow [AGENTS.md](AGENTS.md), including independent review and proportionate verification.

## Engineering decisions and open questions

- **Two oracles, not one.** Hand-anchored expectations decide whether an answer is correct. The browser golden master is generated from the engine itself, so it catches UI and regression drift but cannot catch an engine that is wrong yet self-consistent. See [HMRC verification](docs/guides/TESTING.md#hmrc-verification).
- **Independence comes from the source, not the author.** The Class 1 category B rate was once recorded as 5% in both the rate table and its hand-anchored test, so the suite passed. Re-verifying against HMRC's published employer tables corrected it to 1.85% (noted in [`taxRates.ts`](src/constants/taxRates.ts)). An expectation written from the same misreading is not independent.
- **Some errors are invisible to the obvious assertion.** Annual thresholds are applied through monthly payroll, so a small drift in a band threshold can leave income tax unchanged. Boundary pairs, such as marriage allowance at £50,270 and £50,271, guard thresholds directly. See the [rounding and threshold policy](docs/guides/TESTING.md#rounding-and-threshold-policy).
- **Open question:** how to record per-scenario provenance for independent fixtures, so that a misreading shared by policy data and expectations is detectable rather than discovered later. Tracked as [JGF-72](https://linear.app/jgf-projects/issue/JGF-72); the [fixture standard](docs/guides/TESTING.md#calculation-verification-model) remains publicly readable.

## Run it locally

PayeTax uses Next.js, React and TypeScript, with Bun for dependencies and scripts. Use the Bun version declared in `package.json`.

```bash
bun install --frozen-lockfile
bun run dev
```

Open [localhost:3000](http://localhost:3000). See the [operations guide](docs/guides/OPERATIONS.md) for environment setup, email and other service configuration, and release procedures. Keep real credentials in ignored local environment files or deployment settings.

Useful checks:

```bash
bun run check:repo
bun run test:no-coverage
bun run build:ci
```

Jest covers calculation and component behaviour; Playwright covers browser journeys. The [testing guide](docs/guides/TESTING.md) explains which checks to run for your change. Production-facing changes follow the [version and tagging policy](docs/guides/OPERATIONS.md#version-policy-and-tagging).

## Find your way around

- [PayeTax in Linear](https://linear.app/jgf-projects/project/payetax-ecec16170865) — planned work, priorities, dependencies and progress (workspace access required).
- [Work management](docs/guides/WORK_MANAGEMENT.md) — shared Ready/Done, independent review and public PR evidence.
- [System overview](docs/guides/SYSTEM_OVERVIEW.md) — architecture, calculation owners and preserved contracts.
- [Product direction](docs/business/PRODUCT_DIRECTION.md) — what PayeTax aims to help people do.
- [Documentation map](docs/README.md) — where guidance lives and how it stays useful.
- [Editorial voice](docs/blog/VOICE_AND_STYLE.md) — clear, helpful writing without losing important qualifications.
- [API and abuse controls](docs/guides/API_AND_ABUSE_CONTROLS.md) — results-email routes and operational safeguards.
