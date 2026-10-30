# Operations Guide

PayeTax deploys from GitHub to the current Vercel project for `payetax.co.uk`.

Use this guide for deployment, environment, Vercel-link, and release-validation decisions. Put dated command output and manual evidence in pull requests or `docs/reports/*`, not in this evergreen guide.

## Normal Change Flow

1. Branch from `main`.
2. Make a focused change and apply the version policy below.
3. Run local validation:

```bash
bun install --frozen-lockfile
bun run check:repo
bun run build:ci
```

4. Run the smallest relevant Jest or Playwright check while developing.
5. Open a GitHub pull request.
6. Obtain independent review and explicit maintainer approval before merging.
7. Production deployment requires separate explicit maintainer approval. Account for Vercel's connected-branch deployment before approving a merge.

Use `bun run build:release` only for release validation that needs Sentry source maps. Vercel production should keep using `bun run build`; production source-map behaviour is controlled by env and `next.config.ts`.

## Version Policy And Tagging

`package.json` is the source of truth for the app version. The existing footer and Compliance
page consume it through `APP_VERSION`. It identifies the app version in that build, not a unique
commit, the live deployment or the freshness of an installed/offline session.

Every production-facing PR must include one version bump relative to its current target branch:

| Change | Bump | Example from 5.2.0 |
| --- | --- | --- |
| Fixes, dependency updates, maintenance or production copy corrections | Patch | 5.2.1 |
| New capabilities or tax-year support, retaining compatibility | Minor | 5.3.0 |
| Breaking supported behaviour, API contracts or stored-data compatibility | Major | 6.0.0 |

Use the highest category represented in the PR. Stable `MAJOR.MINOR.PATCH` versions only;
minor/major bumps reset the lower components to zero. Do not skip increments. The `5.2.0`
catch-up groups accumulated app changes after `5.1.4` under a minor release; it is not evidence
that every intervening change shipped under its own version or that `5.2.0` is deployed.

Documentation, tests, agent guidance and CI-only PRs can leave the version unchanged. The guard
exempts `docs/`, `.github/`, `.claude/`, `e2e/`, `src/test/`, test/mock directories and test files,
plus the named guidance/lint/test configuration files in `scripts/check-version.ts`. Other paths
require a bump, including public blog content, runtime sources/assets, dependencies, build scripts
and deployment configuration. Reviewers decide the semantic category; the check enforces a valid
next increment, not whether a code change is breaking.

```bash
git fetch origin main
bun run check-version --base origin/main
```

The base-aware check includes tracked staged/unstaged changes locally; stage new files before
running it. CI's existing required `CI` job fetches history and compares the PR merge tree with
the event's exact base SHA. Missing history or an invalid base fails the check. If another PR bumps
`main` first, update your branch and version, then rerun. `bun run check:repo` includes the plain
`check-version` command, which validates version format only; it does not replace the PR check.
No new workflow, label override or secret is needed. Branch protection must keep `CI` required
and require branches to be up to date before merging, so a previously green check cannot reuse
a stale base. This change does not modify repository settings or prevent an administrator bypass.

PWA cache names are independent schema/invalidation identifiers. Keep the existing
`payetax-v5.1.4-pwa1`, `payetax-static-v5.1.4-pwa1` and derived runtime cache names across app
version bumps. Change them only for an explicit compatibility/invalidation need with PWA tests.
Do not couple them to SemVer, tags or build SHAs. Worker `GET_VERSION` reports its cache namespace,
not the app release. Preserve waiting-worker activation, open calculations and offline behaviour.

After an approved merge and separately approved production deployment:

1. Record the exact production deployment URL/id, source commit SHA, app version, UTC check time
   and verifier in a dated report under `docs/reports/`. Confirm the production alias points to
   that deployment in Vercel; a green local build or Git tag does not prove deployment.
2. In a fresh online browser session without a service worker, verify the footer version against
   `package.json` at that exact SHA and run the Production Validation checks below. Separately
   check a previously installed PWA: open drafts survive an update and offline relaunch works.
   Record results, evidence and any blocked/deferred checks. Do not call unverified checks passed.
3. Only after production verification passes, and with explicit maintainer approval, create an
   annotated `v<package-version>` tag on the verified source SHA, for example
   `git tag -a v5.2.0 <verified-source-sha> -m "PayeTax v5.2.0; production evidence: <report-path>"`.
   Check that the tag does not already exist; never move a published tag. Publish a tag/release
   only when separately authorised, linking the production evidence and describing actual changes.

SemVer, build identity and production verification are separate. A full build-identity/freshness
feature remains backlog work. Existing `release:*` helpers are legacy optional tooling, not proof
of production readiness; their cleanup is separate work. Use this guide for the current process.

## Vercel Project Shape

- Source control: GitHub repo `jarrydaubert/payetax`.
- CI: GitHub Actions `CI` plus CodeQL.
- Production host: `https://payetax.co.uk`.
- Deployment: Vercel project connected to this GitHub repo.
- Domains: `payetax.co.uk` and `www.payetax.co.uk` should resolve through the current Vercel project only.
- Framework preset: Next.js.
- Install command: `bun install --frozen-lockfile`.
- Build command: `bun run build`.
- Output handling: Vercel default for Next.js.
- Vercel Web Analytics enabled in the current `payetax` project.
- Vercel Speed Insights enabled in the current `payetax` project.

## Environment Contract

Use `.env.template` as the source of required names. Set production and preview values in Vercel Project Settings.

| Flow | Variables or setting |
| --- | --- |
| Public site URL and metadata | `NEXT_PUBLIC_SITE_URL` |
| Consent-based GA4 analytics | `NEXT_PUBLIC_GA_ID` |
| Vercel Web Analytics | Enable Web Analytics in the current Vercel `payetax` project. |
| Vercel Speed Insights | Enable Speed Insights in the current Vercel `payetax` project and keep `@vercel/speed-insights` rendered in the root layout. |
| PAYE and Director results email | `BREVO_API_KEY`, `BREVO_FROM_EMAIL` |
| Distributed API rate limiting | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RATE_LIMIT_HEALTH_SECRET` |
| Sentry runtime monitoring | `NEXT_PUBLIC_SENTRY_DSN` |
| Sentry production source maps | `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`; optional `PAYETAX_ENABLE_SENTRY_SOURCEMAPS=true` for non-Vercel release builds |

Inbound support mail for `support@payetax.co.uk` should be routed in Cloudflare Email Routing. That is DNS/routing infrastructure, not a Vercel env var.

Brevo's API-key IP blocking must remain disabled while PayeTax uses Vercel's default dynamic
outbound IP pool. Brevo can automatically enable blocking after its learning period; when that
happens, a new Vercel egress IP is rejected with `401 unauthorized` and result emails are not
accepted for delivery. Authorizing one blocked address is temporary because the egress address can
change. Only enable Brevo IP blocking after configuring [Vercel Static
IPs](https://vercel.com/kb/guide/how-to-allowlist-deployment-ip-address) and authorizing every
assigned address in [Brevo](https://help.brevo.com/hc/en-us/articles/5740111683858-Authorize-and-block-IP-addresses-for-API-and-SMTP-security).

PayeTax uses the Upstash REST URL/token pair, not the Redis TCP URL/password. A Redis CLI `PING` proves the database exists, but the deployed app still needs the REST env vars in Vercel.

Run this after the intended Vercel project is linked or production env values change:

```bash
bun run check:production-env-contract
```

Local development should use `.env.local`. Never commit real credentials, and rotate any credential that was pasted into chat, committed, or pushed.

## Secret Prevention And Retired Integrations

`bun run check:tracked-env` rejects tracked `.env*` paths at any depth, with only the root
`.env.template` allowed. It checks names without opening environment files.

Stage the intended files, then run `bun run check:secrets` with Gitleaks 8.30.1 on `PATH`
(or set `GITLEAKS_BIN` to its executable). CI downloads the pinned, SHA-256-verified release.
The check exports the Git index to a temporary directory and scans that snapshot, including
the template. Unstaged edits, untracked files, local environment files and Git history are not
scanned. Stage changes before running it locally. Scanner failure is blocking; findings are
fully redacted and only their count is printed. No baseline, inline suppression or repository
ignore file exempts secrets. Project false-positive exceptions match only the public
`payetax-api-v<version>` cache namespace value in `public/sw.js`, for the generic API-key rule;
the pinned `e2e/fixtures/pwa-v5.1.4/sw.js.txt` has a separate exception for exactly its v5.1.4
namespace under the same rule. Other values, rules and paths remain scanned, including other
findings in these files. Temporary exports and redacted reports are
removed after the check.

The old Linear integration is retired. No replacement key or workspace is required for PayeTax.
For the historical exposure and outstanding owner-side revocation/alert actions, see the
[21 October 2026 incident record](../reports/linear-credential-retirement-2026-10-21.md).
Removing code or closing a GitHub alert does not revoke a key at its provider.

## Vercel Link Recovery

If Vercel CLI reports that it cannot retrieve project settings, `.vercel/project.json` may point at a stale project id.

Recovery flow:

```bash
vercel login
mv .vercel .vercel.stale
vercel link --project payetax
vercel project ls
```

Choose the current Vercel account used for Jarryd's public projects.

## Preview Checks

Before merging a risky deployment change:

1. Confirm GitHub `CI` and CodeQL are green.
2. Check the Vercel preview URL for:
   - `/`
   - `/tools`
   - `/tools/director-guide`
   - `/privacy`
   - `/robots.txt`
   - `/sitemap.xml`
3. Check Vercel logs for build, runtime, and env errors.
4. Test API routes only with safe synthetic payloads.

## Production Validation

After production deployment:

- Homepage loads.
- Main calculator returns expected values for a known salary.
- Director Intelligence loads and calculates.
- Tools hub links work.
- Blog index and a blog post load.
- PAYE results email sends through the Brevo API.
- Director results email sends through the Brevo API.
- Sentry reports no new release-blocking PAYE, tool, blog, email, or Director errors.
- Vercel Web Analytics receives traffic if analytics changed.
- Vercel Speed Insights receives real-user performance data after production traffic.
- GA4 receives a page view after accepting analytics cookies if GA4 changed.
- `/api/ops/rate-limit-health` passes with the configured secret when rate limiting changed.
- `robots.txt`, `sitemap.xml`, canonicals, and structured data are spot-checked when SEO or metadata changed.

Confirm host normalisation when deployment or domain settings changed:

```bash
curl -sS -I https://www.payetax.co.uk/
curl -sS -I https://www.payetax.co.uk/tools/director-guide
```

Pass criteria:

- `www` redirects directly to the matching apex URL.
- Canonicals use `https://payetax.co.uk`.
- There is no unexpected extra redirect hop.

## Retired Project Hygiene

Any previous Vercel project or account should stay disconnected, deleted, archived, renamed, or otherwise impossible to confuse with the live target.

Do not add docs, scripts, env names, or local folders that point back to old infrastructure.
