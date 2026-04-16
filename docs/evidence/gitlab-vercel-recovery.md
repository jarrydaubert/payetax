# GitLab To Vercel Recovery Evidence

Date: 16 April 2026

Purpose:
- prove the supported recovery path when GitLab receives a push but Vercel does not create an automatic deployment or status callback,
- record the concrete production deployment and GitLab status outcome used to close backlog item `P1-32`.

## Verified Production Outcome

- Verified Vercel deployment: `dpl_3nAzHvioZtH49PWYXaa853zs7C2e`
- Verified deployment URL: `https://payetax-oicelm04r-jgf-project-javelin.vercel.app`
- Verified production aliases:
  - `https://payetax.co.uk`
  - `https://www.payetax.co.uk`
- Deployment status at verification time: `Ready`
- GitLab commit reconciled: `0f82c6435772e4c86ea67cd21712bca6d5d648f0` (`chore: release v5.1.1`)

## Commands Run

Detection:

```bash
vercel ls payetax
vercel inspect payetax.co.uk
bun run gitlab:deploy:status 0f82c6435772e4c86ea67cd21712bca6d5d648f0
```

Observed before reconciliation:

- GitLab commit status: `none`
- GitLab pipeline linked to the commit: `none found`
- External statuses: `none`

Recovery:

```bash
bun run gitlab:deploy:reconcile success https://payetax.co.uk 0f82c6435772e4c86ea67cd21712bca6d5d648f0 main
```

Verification after reconciliation:

```bash
bun run gitlab:deploy:status
```

Observed after reconciliation:

- GitLab commit status: `success`
- GitLab pipeline: `#2457236298 [success | external]`
- External status:
  - `vercel-production-manual [success]`
  - target: `https://payetax.co.uk`

## Failure-Path Coverage

The recovery helper has automated unit coverage for both supported manual states:

- `success`
- `failed`

See:
- `src/lib/__tests__/gitlabDeployRecovery.test.ts`

Rationale:
- posting a fake failed status to the healthy production commit would create misleading operational history,
- the helper-level tests cover the failure payload and validation path, while the live verification above proves the end-to-end success reconciliation flow.
