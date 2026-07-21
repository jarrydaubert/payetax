---
name: verify-frontend-change
description: Verify any UI change end-to-end before declaring it done. Use after editing anything under src/ that renders in the browser (pages, components, calculator UI, dialogs, blog templates).
---

# Verifying frontend changes

Never report a UI change as complete based on a successful edit alone. A passing edit is the start of verification, not the end. Verify the way a human reviewer would:

1. **Run the smallest relevant deterministic checks first.** `bun run lint`, `bun run typecheck`, and `bun run test:changed`. Fix failures before touching a browser.

2. **Start the dev server and open the changed route.** `bun run dev`, then load every route the change affects. AGENTS.md requires inspecting the changed route locally — this step is not optional for shipped-surface changes (calculator, tools, Director Intelligence, blog, static pages).

3. **Interact with the change directly.** For a new or edited control (button, input, toggle, dialog): use it, confirm the expected state change, and capture before/after screenshots. For calculator changes, enter at least one known salary and confirm the output matches expected values — do not invent tax figures; compare against the hand-derived PAYE verification fixtures in `src/test/payeVerificationFixtures/` (expected values sourced from official HMRC / Scottish Government references), never against the engine's own output or generated golden-master fixtures.

4. **Check the browser console.** Zero new errors or warnings on load and during interaction.

5. **Run the matching test slice.**
   - Calculator or shared UI: `bun run test:e2e:smoke`
   - Calculation logic or expected tax outputs — both of:
     1. the independent PAYE verification tests (`src/lib/__tests__/taxCalculator.verification.test.ts`, driven by hand-derived HMRC fixtures in `src/test/payeVerificationFixtures/`) via `bun run test:no-coverage` — no smaller supported command exists. This is the correctness oracle.
     2. `bun run test:e2e:golden` for browser/result regression and presentation consistency. Golden-master expectations are generated from the production engine, so this slice alone cannot prove statutory correctness.
   - Director flow: include `e2e/director-guide-critical.spec.ts`

6. **Before commit:** `bun run check:repo` and `bun run build:ci`.

If any step fails, fix the issue and rerun from step 1 — do not hand back partially verified work. When reporting done, list the commands run and their pass/fail status per the PR expectations in AGENTS.md.
