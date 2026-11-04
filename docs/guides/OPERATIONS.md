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

## Sentry Error Monitoring And Source Maps

Next.js discovers `src/instrumentation.ts` and `src/instrumentation-client.ts` alongside
`src/app`. The server hook loads the Node or Edge config and forwards only monitored request
paths to `captureRequestError`, retaining sanitisation and the SDK's serverless flush handling.
Automatic sessions are disabled: filter `BrowserSession` and Node's `ProcessSession`, and
replace Node's default `Http` integration with `httpIntegration` configured with
`sessions: false`, `spans: false` and `disableIncomingRequestSpans: true`.
Current Edge defaults have no session producer.
Tracing and replay remain disabled. The financial-data and monitored-route policies still apply.

`next.config.ts` inlines the non-secret `VERCEL_ENV` deployment label for all bundles, falling
back to `NODE_ENV` outside Vercel. This needs no new provider variable. Confirm Preview and
Production labels after deployment; if Vercel does not expose its system variables, correct that
provider setting only with separate approval. The SDK uses one shared build release identifier:
Vercel's commit SHA, or `payetax@<package version>` locally.

Production Vercel builds with an auth token enable source maps by default; the existing
`PAYETAX_ENABLE_SENTRY_SOURCEMAPS` override still takes precedence. Local/CI builds skip uploads.
The configured `useRunAfterProductionCompileHook` consolidates uploads
after compilation (supported since Next.js 15.4.1). The installed Sentry SDK uploads the server and
browser directories in that phase. Release creation, finalisation, commit association, deployment
notifications and build plugin telemetry are disabled. `release.deploy: false` is explicit because
the SDK otherwise infers deployment calls from Vercel even with release creation disabled.
Events retain release correlation; Sentry's explicit release
finalisation times and commit metadata are no longer populated by these builds.

Only recognised CLI source-map upload failures emit a safe warning and allow the build to
continue. Other integration/configuration errors fail the build. Browser maps are deleted
after the attempt, including failed uploads; a separate post-hook check rejects the build if
any public `.map` remains or cleanup cannot be verified. The SDK can swallow individual deletion
errors, so its successful return alone is insufficient. Failed cleanup output must not deploy.
Server maps remain outside public assets. This reduces duplicated work but still awaits the
uploader's network attempts and does not impose a
total timeout. During an outage, deployability takes priority over readable source-mapped stacks.
The upload-error classifier verifies the installed adapter's module path and supports its Node
and Bun stack-frame formats. Run both offline harnesses under both runtimes when changing it.
Do not assume legacy `sentry-cli` timeout variables control Sentry 11's newer `sentry` CLI adapter.
An emergency provider-side `PAYETAX_ENABLE_SENTRY_SOURCEMAPS=false` override requires separate
approval and sacrifices maps while preserving error capture.

After an approved deployment, complete the actual remaining [Sentry acceptance on JGF-5](https://linear.app/jgf-projects/issue/JGF-5). Public PR/release evidence must identify the exact deployed ref and observed delivery/symbolication results; see [external completion](WORK_MANAGEMENT.md#merge-and-external-completion). A merge or tag alone cannot close this gate.
Use synthetic, non-financial events without adding permanent error endpoints. Local checks do
not prove ingestion or production symbolication.

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

After an approved merge and separately approved production deployment, the **Release** workflow
automatically publishes an annotated `v<package.json version>` tag and GitHub Release for the
deployed source SHA once its matching `main`-push `CI` run succeeds. Routine publication needs
no dispatch, SHA/version entry, evidence link or Publish click.

Successful Vercel `deployment_status` and completed successful `CI` `workflow_run` events both
recheck the same SHA. If the other record is incomplete, the attempt exits without publishing;
the other completion rechecks both records and publishes. Jobs share a non-cancelling queue, so different
commits are serialized and pending completion events are retained (GitHub's queue limit is 100).
Failed/preview deployments and failed/PR/other-branch CI cannot publish.

Before writing, the script requires a full SHA on `main`'s first-parent history, a stable version
read from `package.json` at that SHA, a `Production` deployment created by `vercel[bot]` whose
latest status is success from `vercel[bot]`, and a completed successful `CI` run from `ci.yml`
for that exact `main` push. It uses the environment name, not Vercel's `production_environment`
boolean. Release notes link the recorded deployment and CI run and identify the source SHA,
followed by GitHub's generated notes since the nearest earlier `v*` tag. An older version does
not take Latest. These records establish successful deployment and CI, **not manual browser/PWA
verification** or the freshness of an installed session.

Manual post-deployment verification remains separate and follows publication:

1. Record the exact production deployment URL/id, source commit SHA, app version, UTC check time
   and verifier in a dated report under `docs/reports/`. Confirm the production alias points to
   that deployment in Vercel; a green local build or Git tag does not prove deployment.
2. In a fresh online browser session without a service worker, verify the footer version against
   `package.json` at that exact SHA and run the Production Validation checks below. Separately
   check a previously installed PWA: open drafts survive an update and offline relaunch works.
   Record results, evidence and any blocked/deferred checks. Do not call unverified checks passed.

Tags are never moved or force-pushed. If the tag was pushed but release creation failed, rerun
the failed job: an annotated tag at exactly that SHA is reused and only the release is created.
Repeated events are no-ops after publication. A later documentation/CI-only deployment with
the same version is also a no-op if the released tag is annotated, on its first-parent history,
and the version stayed unchanged between those commits. Conflicting/lightweight tags, draft,
prerelease or tagless releases, and versions published under another tag fail for manual review.
API errors fail the run; they are never treated as absent records.

For recovery, **Actions → Release → Run workflow** from `main` defaults to a dry run against
current `main`. An optional full `sha` retries an older production commit. Version and deployment/CI
evidence are derived automatically. Clear `dry_run` only to publish the recovery; routine
publishing never requires this step. A dry run validates the same guards and previews generated
notes without creating a tag or release.

The workflow uses only `GITHUB_TOKEN` (`contents: write`, `actions: read`, `deployments: read`);
no secret, environment, dependency or branch-protection change is needed. Existing CI, CodeQL,
non-blocking E2E and Vercel deployment behaviour are unchanged. Its guard tests run before every
publication attempt and on PRs touching the release files:
`node --test .github/scripts/release.test.js`. Manual checks in steps 1–2 are not automated.

Historical tag/release reconciliation is tracked in [JGF-112](https://linear.app/jgf-projects/issue/JGF-112).
`v5.20` names package version 5.2.0; the workflow refuses duplicate publication of that version.
Inspect current remote tags/releases and deployment evidence before proposing any historical repair;
do not infer missing records from an old release report. No tag may be moved or force-pushed.

SemVer, build identity and production verification are separate. A full build-identity/freshness
feature is tracked in [JGF-96](https://linear.app/jgf-projects/issue/JGF-96) and
[JGF-109](https://linear.app/jgf-projects/issue/JGF-109). Existing `release` / `release:*` helpers are legacy
optional tooling, not proof of production readiness; [JGF-95](https://linear.app/jgf-projects/issue/JGF-95)
owns their separate cleanup. Use this guide for the current process.

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

The old in-app Linear API integration is retired. No replacement in-app key is required.
The native Sentry → Linear integration is a separate provider-side workflow, with GitHub PR
linking through Linear's existing GitHub integration. Link the investigation issue in the PR;
do not create a duplicate GitHub issue or an app webhook. New production error groups should
create one Linear ticket; investigate existing linked groups rather than creating per-event
tickets. Verify native status/link propagation before claiming the workflow complete.
For the historical exposure and outstanding owner-side revocation/alert actions, see the
[21 October 2026 incident record](../reports/linear-credential-retirement-2026-10-21.md).
Removing code or closing a GitHub alert does not revoke a key at its provider.

## Vercel Link Recovery

If Vercel CLI reports that it cannot retrieve project settings, `.vercel/project.json` may point at a stale project id.

Recovery flow:

Run these commands only after explicit maintainer authorisation to relink the project, as
required by [AGENTS.md](../../AGENTS.md#environment). Confirm the intended account/project
and that `.vercel.stale` does not already exist before moving the local link metadata.

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
