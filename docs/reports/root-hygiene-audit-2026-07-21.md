# Root Repository Hygiene Audit — 2026-07-21

Dated evidence report. Snapshot of `origin/main` at `1b4ea8e3` (after PRs #92/#93).

Method: every top-level repository entry (38 tracked, 11 ignored/untracked outputs) was
classified from actual references (package scripts, config files, workflow files, grep of
importers), not from naming convention. This slice verifies the Foundation burn-down row
**Root repository hygiene and generated-artifact ownership** only. No application behaviour,
rates, or content changed; no framework files were relocated.

Classes: **A** required conventional framework/tooling config · **B** active project-owned
source/script/docs · **C** generated, justifiably tracked · **D** generated/disposable, ignored ·
**E** obsolete or duplicated · **F** uncertain, follow-up.

## Tracked root items

| Item | Class | Purpose/owner | Referenced by | Action | Evidence |
|---|---|---|---|---|---|
| `package.json` | A | Package manifest + all automation entry points | CI, all tooling | Retain | `.github/workflows/ci.yml:51-60` runs `check:repo`/`test:ci`/`build:ci` |
| `bun.lock` | C | Dependency lockfile (generated, deliberately tracked) | `bun install`, CI | Retain | lockfile convention; `packageManager: bun@1.3.13` |
| `bunfig.toml` | A | Bun install/registry config | `bun install` | Retain | Bun convention (root only) |
| `next.config.ts` | A | Next.js + Sentry build config | `next build` | Retain | Next convention |
| `tsconfig.json` | A | App TypeScript config | `tsc`, Next | Retain | `typecheck` script |
| `tsconfig.jest.json` / `tsconfig.e2e.json` | A | Test-scope TS configs | `typecheck:tests` | Retain | `package.json:28` |
| `jest.config.js` | A | Jest config | `test*` scripts | Retain | Jest convention |
| `jest.setup.js` / `jest.setup.fetch.js` | A | Jest setup files | `jest.config.js` | Retain | `jest.config.js:28-30` |
| `playwright.config.ts` | A | Playwright config; reports to `audit-outputs/` | `test:e2e*` scripts | Retain | Playwright convention |
| `biome.json` | A | Lint/format config (`vcs.useIgnoreFile: true`) | `lint`, `format` scripts | Retain | Biome convention |
| `knip.json` | A | Unused-code audit config | `audit:unused*` scripts | Retain | `package.json:57-58` |
| `postcss.config.mjs` / `tailwind.config.ts` | A | CSS toolchain config | Next build | Retain | framework convention |
| `components.json` | A | shadcn/ui generator config | `shadcn` CLI | Retain | `src/components/ui/*` generated from it |
| `.editorconfig` | A | Editor whitespace convention | editors | Retain | convention |
| `.gitignore` | A | Ignore rules | git | **Fixed** (see Actions) | duplicate + stale entries below |
| `vercel.json` | A | Deployment config | Vercel | Retain | deploy platform |
| `.sentryclirc` | A | Sentry CLI org/project defaults — **empty token, no secret** | `sentry-cli` | Retain | file content: `token=` blank |
| `sentry.server.config.ts` / `sentry.edge.config.ts` | A | Sentry runtime init | `@sentry/nextjs` | Retain | Sentry Next convention |
| `instrumentation.ts` / `instrumentation-client.ts` | A | Next instrumentation hooks | Next runtime | Retain | Next convention (root or `src/`) |
| `.env.template` | B | Canonical env-var contract | env-contract gate | Retain | `scripts/check-analytics-env-sync.ts:138`, `docs/guides/OPERATIONS.md:42` |
| `src/` `public/` `e2e/` `content/` | B | App source, static assets, E2E suite, blog MDX | build/tests; `src/lib/blog.ts`, `src/lib/mdx.ts` read `content/` | Retain | importers cited |
| `scripts/` | B | 21 automation scripts | package scripts, `knip.json` | Retain | every script mapped to a `package.json` entry or knip ignoreBinaries |
| `docs/` | B | Backlog, guides, dated reports | AGENTS.md contract | Retain | `AGENTS.md` source-of-truth section |
| `.github/` | B | CI + CodeQL workflows only | GitHub Actions | Retain | `ci.yml`, `codeql.yml` |
| `.claude/commands/` | B | Tracked project agent skills (7 files) | Claude Code | Retain | deliberate; local settings now repo-ignored |
| `AGENTS.md` / `CLAUDE.md` / `README.md` / `LICENSE` | B | Repo contract, agent pointer, readme, proprietary licence | contributors | Retain | `LICENSE` (proprietary) consistent with `"license": "UNLICENSED"`; `docs/README.md` is a distinct docs index, not a duplicate |
| `.biomeignore` | E | Intended Biome ignore (`scripts/*.js`) — **Biome has no `.biomeignore` mechanism**; it uses `vcs.useIgnoreFile` + `files.includes` | nothing (repo-wide grep: zero references) | **Deleted** | `biome check .` byte-identical before/after deletion: 560 files checked, clean, both runs |

## Ignored / untracked root outputs

| Item | Class | Purpose/owner | Ignore rule | Action | Evidence |
|---|---|---|---|---|---|
| `node_modules/`, `.next/`, `.swc/`, `tsconfig.tsbuildinfo` | D | Dependency/build/type caches | `.gitignore` (`/node_modules`, `/.next/`, `/.swc`, `*.tsbuildinfo`) | Retain ignored | `git check-ignore -v` |
| `next-env.d.ts` | D | Next-generated type shim | `next-env.d.ts` | Retain ignored | Next ≥15 convention |
| `.vercel/` | D | Vercel link metadata | `.vercel` | Retain ignored | Vercel convention |
| `audit-outputs/` | D | Consolidated coverage/Playwright/test reports | `/audit-outputs` | Retain ignored | `package.json:17-23` writes here |
| `playwright/.auth/` | D | E2E storage state | `playwright/.auth/` | Retain ignored | `e2e/global-setup.ts:51`, `playwright.config.ts:49` |
| `bundle-history.json` | D | Bundle-size history, regenerated by analyzer | `/bundle-history.json` | Retain ignored | `scripts/bundle-analyzer.js:6` |
| `.env.local`, `.env.sentry-build-plugin` | D | Local secrets (Sentry auth token lives in the latter) | `.env*` + explicit rules | Retain ignored | never tracked |
| `.claude/settings.local.json` | D | Claude Code local settings | previously only user-global git ignore | **Now repo-ignored** | added to `.gitignore` |

## Actions taken

1. **Deleted `.biomeignore`** — obsolete (class E). Biome 2.4.16 does not read a `.biomeignore`
   file; ignoring is via `biome.json` `vcs.useIgnoreFile`/`files.includes`. Proof of no behaviour
   change: `biome check .` output identical before and after (560 files checked, no diagnostics).
2. **`.gitignore` fixes** (rule accuracy only; `git status --ignored` set identical before/after):
   - removed duplicate `/test-results` (already present at line 18);
   - removed stale `!.env.local.example` — the file does not exist anywhere; `.env.template` is
     the tracked template and keeps its own negation;
   - corrected the misleading "NOW CLEANED UP" comment: `bundle-history.json` is still actively
     generated at root by `scripts/bundle-analyzer.js`;
   - added `.claude/settings.local.json` so other clones do not depend on a user-global ignore.
3. **No relocations, no restructuring, no behaviour change.** All conventional framework files
   remain in their conventional locations.

## Outcome

Every root item is classified with a current purpose and owner; generated and disposable outputs
are all ignored; deliberately tracked artefacts (`bun.lock`, `.env.template`, `.sentryclirc`,
`.claude/commands/`) are justified; the only obsolete item (`.biomeignore`) and stale ignore
entries were removed with evidence. **No class-F (uncertain) items remain.** The Foundation row
*Root repository hygiene and generated-artifact ownership* is verified and resolved; its backlog
row is removed in this slice per the burn-down rule.
