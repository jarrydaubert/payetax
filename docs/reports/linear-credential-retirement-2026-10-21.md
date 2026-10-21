# Historical Linear Credential Exposure And Integration Retirement

Date: 21 October 2026. Repository baseline: `e6312f072ffeb146e006620bb18670fcb95baa6e`.

## Confirmed Evidence

- One Linear API key was exposed in `scripts/update-issue-priority.js` and
  `scripts/create-all-issues.js`: line 6 in `bb23b52dfd91127a8b17318031d831003c594227`
  (20 October 2025), and line 7 in `63017f0145df0a453fd627d7b6d363096d4324cb`.
- Both scripts were deleted in `c8bdd448ce9b0410b0e44ef76ee7d18922b3ae41`
  (29 January 2026). The `@linear/sdk` dependency and Linear CLI commands were removed in
  `e318b9396cbc3fb1c292009e6c12a3b34b95593d` (3 June 2026).
- The earlier read-only audit found no credential candidates in current tracked source.
  Current source, configuration, dependencies and contributor instructions have no active Linear
  integration or obsolete setup instructions left to remove. CSS gradients and mathematical
  references to "linear" are unrelated and are retained. No source deletion was invented.
- [GitHub secret-scanning alert #1](https://github.com/jarrydaubert/payetax/security/secret-scanning/1)
  was open, publicly leaked and of unknown validity when audited on 21 October 2026.
  Secret scanning and push protection were enabled; generic detection and validity checks were
  disabled. These observations do not establish settings at the time of exposure.
- This is a high-priority credential exposure with unverified current exploitability.
  The historical scripts read and mutated Linear issues; the key's actual permissions, revocation
  status and any misuse were not verified. The key is not reproduced here or used as a baseline.

## Owner Actions Still Required

The owner identifies the original account as an old Outlook account. JGF Projects is a new,
separate workspace reserved for possible future use; it is not evidence that the old key was
revoked, and it must not be deleted or modified as part of this retirement.

1. Access the original Linear account/workspace through the provider's normal account-recovery
   process if necessary. Revoke the exposed key there, or obtain provider-side confirmation that
   it was already revoked. If access cannot be recovered, request assistance from Linear support.
   Review available key metadata and activity for unexpected access or issue changes. Do not test
   the exposed key to determine validity. No replacement is needed for the retired integration.
2. Record a non-secret confirmation of revocation, then have the repository owner resolve
   GitHub alert #1 as revoked. Alert closure is bookkeeping, not provider-side revocation.
3. Keep GitHub secret scanning and push protection enabled. Consider generic-secret detection
   where available. Never paste credential values into issues, pull requests, logs or this report.

These provider and GitHub actions are outstanding; this repository change does not perform them.
Neither Linear workspace, the original account, nor the alert is changed by this work.

## Repository Prevention

The CI environment-file guard now covers `.env*` paths at any depth, with only root
`.env.template` allowed. A checksum-pinned Gitleaks scan checks the staged tree with full
redaction and fails closed. It does not scan historical commits or suppress the old key.
See [Operations](../guides/OPERATIONS.md#secret-prevention-and-retired-integrations) for local use.

No historical credential was opened, printed, tested or reused during this cleanup. No Git
history rewrite is part of this change. Revocation is the first containment step;
[GitHub documents why history cleanup alone cannot revoke a secret](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

## Verification

- `bun run check:repo` and `bun run build:ci`: passed.
- `bun run check:tracked-env` and `bun run check:secrets`: passed on the staged tree.
- Focused Jest suite `secretPrevention.test.ts`: 33 tests passed. Independent review approved
  the patch after root ignore-file suppression and Windows filename-case handling were fixed.
- Six offline integration probes passed in an isolated temporary Git repository: a clean tree
  with the public cache value and an untracked local environment file passes; generated synthetic
  Linear/GitHub-shaped tokens are rejected (including beside the cache exception and with an
  inline suppression); a mixed-case scanner-ignore file, nested tracked environment file and
  missing scanner are rejected. Generated values never appeared in captured output and were
  never provider-issued credentials. No exposed credential was used for these checks.
- Full `bun run test:no-coverage --runInBand`: 4,059 passed, five failed. The five failures
  reproduce in an untouched worktree at the baseline commit: two development-console assertions
  in `analytics.test.ts`, one production-policy assertion in `rateLimit.test.ts`, one warning
  assertion in `InputTooltip.test.tsx`, and one production-host assertion in `security/origin.test.ts`.
  The failures are deferred test-harness work; their source and expectations are unchanged here.

The new checks run inside the existing required `CI` job, before dependency installation. No
branch-protection setting or provider secret is changed, and no new secret is required by CI.
