# PayeTax v5.2.1 — final financial-guidance review

Date: 30 October 2026. Status: **independently APPROVED by Claude, with no blockers**, as reported by the maintainer in this chat. The maintainer has authorised committing, pushing this branch and opening a PR against `main`. This records a local independent review, not a formal GitHub review submission.

## Review target and correction

- Branch: `fix/calculator-copy-v5.2.1`.
- Base: `87a18e74fef67454bb97f2125f16e6a7b672377f` (`origin/main` when the branch was created; [PR #155](https://github.com/jarrydaubert/payetax/pull/155)).
- Worktree: `C:/Users/JGF Desktop/Desktop/payetax-v5.2.1`.
- Version: patch `5.2.0` → `5.2.1`.
- The reviewed implementation is the source diff from the recorded base; its patch hash is recorded below. [Artifact hashes](SHA256SUMS.txt) cover the selected final evidence.

The maintainer reported that Claude accepted the touch-accessibility correction but rejected the financial-entry restriction. The previous “Only enter salary-sacrifice contributions” wording was wrong and has been withdrawn. This revision restores the intended instruction to enter contributions even for net pay or relief at source, while explaining the existing salary-sacrifice approximation and possible overstatement of take-home.

That instruction restores the base implementation's guidance. At the recorded base, `BasicInputs.tsx` said: “Enter your pension contribution even if your scheme uses net pay or relief at source.” It then described salary-sacrifice modelling and the possible overstatement. The previous touch revision's contrary restriction was a copy regression, not an intentional product behaviour change.

Superseded draft reports, patches and screenshots remain local and are excluded from the PR evidence. Use this report and its linked final artifacts for the reviewed implementation. Earlier mobile-sized tooltip images used programmatic keyboard focus; they did not prove mobile tap usability.

## Consistent guidance

| Surface | Final message |
| --- | --- |
| Visible, input-associated description | Enter contributions including net pay or relief at source; all contributions are estimated as salary sacrifice, so take-home may be too high. £ pay-period and unit-reset instructions remain visible. |
| Native disclosure | The approximation reduces pay used for Income Tax, employee NI and student loan repayments. Net pay/relief at source are not calculated separately; take-home may be too high. Employer NI remains based on gross employment pay and excludes savings. |
| Optional tooltip | Enter contributions even for net pay or relief at source; use % of gross salary or £ per pay period. It repeats the approximation/risk and points to the disclosure. |
| Conditional result note | All pension contributions are estimated as salary sacrifice; net pay/relief at source may give overstated take-home. Employer NI savings remain excluded. |
| Existing FAQ and shared FAQ JSON-LD | Enter the contribution for those schemes too; PayeTax estimates it as salary sacrifice and may overstate take-home. |
| Root README | The same enter-contribution instruction, approximation and warning, with the existing product-first structure retained. |

The native `details/summary` disclosure, its touch target, closed default, click/tap/keyboard behaviour and keyboard navigation are unchanged from the accepted touch correction. No lengthy input paragraph was restored. The existing tooltip component remains unchanged and optional; mobile access to essential assumptions does not depend on it.

Relevant Jest and browser assertions now protect the inclusive instruction and approximation/risk rather than prohibiting non-salary-sacrifice entries. Existing financial expectations, input-integrity checks and the native-disclosure focus-order regression remain intact.

## Calculation boundary

`git diff --name-only origin/main -- src/lib src/store src/constants` is empty. There are no changes to calculation algorithms, rates, stored data, validation, input handlers, pension units or expected financial values. The calculation still uses the existing pension pay-basis deduction for every entered contribution; scheme-specific pension calculations remain separate future work.

Source checked: `src/lib/tax/payePayBasis.ts` deducts the entered contribution for PAYE, employee NI and student loans, while `src/lib/taxCalculator.ts` calculates employer NI on gross employment pay. The copy describes those implemented choices.

[GOV.UK's pension-arrangements explanation](https://www.gov.uk/workplace-pensions/managing-your-pension), rechecked on 30 October 2026, confirms that net pay and relief at source work differently. It supports disclosing the approximation; it is not evidence that this calculator calculates those methods separately. The enter-contribution instruction follows the maintainer's explicit direction and the existing base guidance.

Conditional `gh` guidance in AGENTS.md, version `5.2.1`, and the rest of the initial focused copy/README work are retained. No unrelated feature, dependency, workflow, secret, remote setting or deployment change was introduced. The original checkout and earlier unrelated evidence remain untouched.

## Current verification

| Check | Result for this revision |
| --- | --- |
| `bun run lint` and `bun run typecheck` before browser inspection | Pass |
| `bun run test:changed --maxWorkers=2` | 23 suites / 306 tests passed |
| `bun run check:repo` | Pass, including app/test typechecks and repository guards |
| `bun run check-version --base origin/main` | Pass: next patch `5.2.1` accepted |
| Dev route inspection and interaction script | Pass at desktop and touch-enabled mobile sizes; no console warnings/errors recorded |
| `bun run build:ci` through Playwright's production web server | Pass; production server started |
| Production Chromium smoke slice, one worker, zero retries | 58/58 passed in 4.3 minutes |
| Focused native-disclosure test in Mobile Chrome and Mobile Safari projects | 2/2 passed in 27.1 seconds, zero retries |
| Direct production copy/disclosure/fixture QA | Pass at desktop and touch-enabled mobile sizes |
| `git diff --check` | Pass |

Full smoke command, using the same five specs as `test:e2e:smoke`:

```powershell
$env:CI='1'
bunx playwright test e2e/smoke.spec.ts e2e/homepage-portal-stability.spec.ts e2e/calculator-critical.spec.ts e2e/director-guide-critical.spec.ts e2e/payslip-regression.spec.ts --project=chromium --workers=1 --retries=0 --reporter=line
```

Focused touch regression:

```powershell
bunx playwright test e2e/calculator-critical.spec.ts --grep 'pension assumptions open by touch and keyboard' --project='Mobile Chrome' --project='Mobile Safari' --workers=1 --retries=0 --reporter=line
```

### Browser evidence and limits

Browser plugin not available; regular repository Playwright was used. Environment: Windows PowerShell, Bun `1.4.3`, Node `v24.18.0`, Playwright `1.61.1`, Chromium `149.0.7827.55`. Existing installed dependencies were reused; no fresh dependency install was needed. Dev URL: `http://localhost:3000`; production URL: `http://localhost:3100`.

- Desktop: 1440 × 1000, no touch emulation. Disclosure click/close and Enter/Space toggles; optional tooltip keyboard focus/Escape.
- Mobile: 390 × 844, `hasTouch: true`, `isMobile: true`. Actual taps open/close the native disclosure; no mobile-tooltip interaction is used as proof.
- At both sizes: correct title and meaningful content; inclusive description, approximation and warning; readable expanded mechanics; no page-wide overflow; unchanged calculation and edit invalidation; FAQ navigation and matching JSON-LD.
- Financial values are typed, blurred and calculated by keyboard. The direct script does not certify mobile Calculate pointer repeatability. No physical-device or native iPhone Safari claim is made; the Mobile Safari project uses Playwright WebKit emulation.
- Screenshots disable finite animations for legibility. Console observations are preserved, with localhost provider-resource errors distinguished from application exceptions.

The successful production direct run recorded four provider-resource errors per viewport: Vercel Web Analytics and Speed Insights scripts are absent on localhost and return 404/MIME errors. No other console warning/error or page exception was recorded. The successful dev run recorded no console warnings/errors. These statements apply to the saved runs, not physical devices or general pointer repeatability.

### Calculation anchors

Both cases use annual £40,000, year `2026-2027`, England/rUK, code `1257L`, category A, no student loan, other income or allowances, under State Pension Age.

| Independent fixture | Annual take-home checked at both sizes |
| --- | ---: |
| `uk-baseline-2026-27.json`, `uk-40k-1257L`, no pension | £32,322.04 |
| `salary-guides-payroll-2026-27.json`, `salary-guide-40k-sacrifice`, 5% contribution | £30,882.92 |

These hand-derived fixtures verify that the existing salary-sacrifice calculation is unchanged. The second number is the calculator's approximation when that contribution is entered; it is not asserted to be the actual take-home for a net-pay or relief-at-source scheme. No pension still produces no method note, and editing pension after Calculate still clears results until Calculate is used again.

## Final artifacts and reproduction

- Mobile: [collapsed](final-mobile-touch-collapsed.png) / [expanded](final-mobile-touch-expanded.png).
- Desktop: [collapsed](final-desktop-collapsed.png) / [expanded](final-desktop-expanded.png).
- [Final observations](final-observations.json) retain actual input/disclosure/tooltip/result/FAQ text, context options and console messages; mobile tooltip text is deliberately absent.
- [Current QA script](browser-qa.cjs.txt): copy to `audit-outputs/pension-final-qa.cjs`, start the built app, set `COPY_QA_URL` to its local URL and run `node audit-outputs/pension-final-qa.cjs final`. It replaces the final screenshots/observations. Dev inspection is recorded in the verification output; its screenshots remain local.
- [Final verification output](final-verification.txt) and [hash manifest](SHA256SUMS.txt). The committed verification wrapper uses LF line endings; the per-log hashes identify the original local raw logs. Generated patch copies and superseded local captures are excluded.

The maintainer reported Claude's independent approval of the final implementation with no blockers on 30 October 2026. The reviewed implementation patch has SHA-256 `db9a13910bf8ed1f9c6a8a4d55d5b0b9062f3741e04b90aba3264b634f4e633a`; its reverse-apply check confirms it matches the working implementation. Only evidence status and packaging were reconciled after approval; application code and tests were not changed.

For this commit, the reviewed source patch can be reconstructed with `git diff --binary 87a18e74fef67454bb97f2125f16e6a7b672377f HEAD -- AGENTS.md README.md package.json e2e/calculator-critical.spec.ts src`.

Merge, deployment and release tagging remain unauthorised. Hosted CI results are left to the maintainer; no CI polling or monitoring is performed for this handoff.
