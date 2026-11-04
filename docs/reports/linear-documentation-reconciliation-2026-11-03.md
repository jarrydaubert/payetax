# Linear documentation reconciliation — 3 November 2026

Frozen provenance for this documentation transition, not a delivery queue.
Base: main `5bcbfb168976f102ba92c0c9eebd6a92765d0c3e` (v5.2.7).
Original [BACKLOG.md](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md) and
[PROJECT_STATE.md](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/PROJECT_STATE.md) remain publicly inspectable at that commit.
The full [migration ledger](https://linear.app/jgf-projects/document/payetax-migration-ledger-source-to-issue-reconciliation-8289b3970cd8)
remains in Linear; private workspace access is not needed to inspect the original public requirements,
engineering standards or this PR's acceptance/evidence.

## Claude review disposition

The maintainer supplied a read-only Claude REQUEST CHANGES review against origin/main.
It did not inspect Linear. Subsequent independent migration spot-checks were supplied separately.
This PR addresses the repository findings; it does not claim a new exhaustive implementation
audit or recreate the migrated issues.

| Finding | Disposition |
| --- | --- |
| Durable standards would be lost | Move them to the existing authoritative guides before replacing legacy prose; inventory below. |
| Fresh-agent onboarding uses an obsolete queue | AGENTS names workspace/team/project and access fallback; CLAUDE keeps its native `@AGENTS.md` import. README/docs/blog/product/operations references now use authoritative owners. |
| Merge could close external gates | Document relation, non-closing and closing distinctions; require read-back and retain the unverified team-configuration limitation. No setting changed. |
| Public provenance would depend on private Linear | This frozen compact index links original public source lines to keys; PR template requires a public acceptance/evidence snapshot. The full 117-description ledger is not copied into Git. |
| Draft weakens mandatory other-model review | Restore the category-wide requirement in AGENTS and its correctness-critical workflow in WORK_MANAGEMENT. An issue cannot waive it by omission. |

Claude's suggested automatic severity promotion of the dependency item is not needed here:
[JGF-9](https://linear.app/jgf-projects/issue/JGF-9) preserves source P2/Medium with its real
**7 November 2026** review deadline. Its exception expiry remains **14 November inclusive UTC**;
the audit fails from **15 November UTC**. No priority, exception or due date is changed.

## Durable-rule inventory

| Legacy concern | Authoritative home / disposition |
| --- | --- |
| Backlog Working Rules; Foundation principles | AGENTS.md § Scope Guardrails (including tokens, raw inputs and analytics payloads in fixtures/logs/evidence); SYSTEM_OVERVIEW.md § Tax-domain architecture; TESTING.md § Calculation verification model (including both tax-import and tax-fact shrink-only baselines) |
| Architecture north star, flows and ownership table | SYSTEM_OVERVIEW.md § Tax-domain architecture |
| Tax-code instruction/blank-code/Table A and Month 1 rounding contracts | SYSTEM_OVERVIEW.md § Tax-code contract and PAYE projection contract |
| Main calculator desktop/default periods, explicit Calculate, MC-09, Director interim email and privacy regression contracts | SYSTEM_OVERVIEW.md § Preserved interaction and privacy contracts; existing dated acceptance reports stay unchanged |
| Three-layer verification; independent provenance, loader constraint and shrink-only baselines | TESTING.md § Calculation verification model; existing HMRC verification and test-layer anchors retained |
| Mandatory other-model review and correctness-critical reconciliation | AGENTS.md § Pull Request Expectations; WORK_MANAGEMENT.md § Correctness-critical review |
| Protect/do-not-disturb and source-backed search constraints | PRODUCT_DIRECTION.md § Protected product and search contracts |
| Current priorities, burn-down, active/parked scope and status | Existing Linear owners below; no parallel repository queue |
| Dated metrics, deployment/review reports and superseded implementation decisions | Unchanged reports and pinned source snapshots; no new production claims |
| All old BACKLOG/PROJECT_STATE section anchors | Compatibility headings retained at both existing paths; active entry points repointed |

This is an atomic replacement: the compatibility pages retain all original section headings,
while canonical guides contain the durable standards. No historical report, statutory fixture,
application code, provider setting, workflow, lockfile or production configuration is changed.

## Source-to-issue index

At migration, all **99 active checkbox entries** were accounted for: 94 new primary issues plus
existing JGF-5, with four grouped pairs absorbing four duplicate owners. Four bounded residual
slices, four Foundation issues, twelve original parked candidates and three other reconciled
follow-ups bring the created total to 117. Thirteen of those are parked (including GitHub #154).
The project had 120 issues; the workspace had 124/250. These are frozen migration counts,
not assertions about today's queue. No further issues are created by this documentation PR.

Each number below is a line in the pinned original BACKLOG, followed by its migrated owner(s).
Use the linked original scope for historical interpretation and Linear for current acceptance/status.

| Source area | Original line → Linear owner |
| --- | --- |
| Future policy | [24](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L24) → [JGF-8](https://linear.app/jgf-projects/issue/JGF-8) |
| Security and dependencies | [51](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L51) → [JGF-9](https://linear.app/jgf-projects/issue/JGF-9); [53](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L53) → [JGF-10](https://linear.app/jgf-projects/issue/JGF-10); [54](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L54) → [JGF-11](https://linear.app/jgf-projects/issue/JGF-11); [56](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L56) → [JGF-12](https://linear.app/jgf-projects/issue/JGF-12); [57](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L57) → [JGF-13](https://linear.app/jgf-projects/issue/JGF-13) |
| Main calculator input integrity | [112](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L112) → [JGF-14](https://linear.app/jgf-projects/issue/JGF-14) |
| Main calculator experience | [118](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L118) → [JGF-15](https://linear.app/jgf-projects/issue/JGF-15)/[JGF-106](https://linear.app/jgf-projects/issue/JGF-106); [128](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L128) → [JGF-16](https://linear.app/jgf-projects/issue/JGF-16); [137](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L137) → [JGF-17](https://linear.app/jgf-projects/issue/JGF-17); [141](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L141) → [JGF-18](https://linear.app/jgf-projects/issue/JGF-18) |
| Tax correctness and product semantics | [147](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L147) → [JGF-19](https://linear.app/jgf-projects/issue/JGF-19); [148](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L148) → [JGF-20](https://linear.app/jgf-projects/issue/JGF-20); [149](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L149) → [JGF-21](https://linear.app/jgf-projects/issue/JGF-21); [150](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L150) → [JGF-22](https://linear.app/jgf-projects/issue/JGF-22); [151](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L151) → [JGF-23](https://linear.app/jgf-projects/issue/JGF-23); [152](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L152) → [JGF-24](https://linear.app/jgf-projects/issue/JGF-24); [153](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L153) → [JGF-25](https://linear.app/jgf-projects/issue/JGF-25); [154](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L154) → [JGF-26](https://linear.app/jgf-projects/issue/JGF-26) |
| Tax-domain architecture | [158](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L158) → [JGF-27](https://linear.app/jgf-projects/issue/JGF-27); [159](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L159) → [JGF-28](https://linear.app/jgf-projects/issue/JGF-28); [160](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L160) → [JGF-24](https://linear.app/jgf-projects/issue/JGF-24); [161](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L161) → [JGF-29](https://linear.app/jgf-projects/issue/JGF-29); [162](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L162) → [JGF-30](https://linear.app/jgf-projects/issue/JGF-30); [163](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L163) → [JGF-31](https://linear.app/jgf-projects/issue/JGF-31); [164](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L164) → [JGF-32](https://linear.app/jgf-projects/issue/JGF-32); [165](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L165) → [JGF-33](https://linear.app/jgf-projects/issue/JGF-33); [166](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L166) → [JGF-34](https://linear.app/jgf-projects/issue/JGF-34); [167](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L167) → [JGF-35](https://linear.app/jgf-projects/issue/JGF-35) |
| Director Intelligence audit follow-up | [233](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L233) → [JGF-36](https://linear.app/jgf-projects/issue/JGF-36); [237](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L237) → [JGF-37](https://linear.app/jgf-projects/issue/JGF-37); [241](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L241) → [JGF-38](https://linear.app/jgf-projects/issue/JGF-38)/[JGF-107](https://linear.app/jgf-projects/issue/JGF-107); [249](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L249) → [JGF-39](https://linear.app/jgf-projects/issue/JGF-39); [255](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L255) → [JGF-40](https://linear.app/jgf-projects/issue/JGF-40); [259](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L259) → [JGF-41](https://linear.app/jgf-projects/issue/JGF-41); [267](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L267) → [JGF-42](https://linear.app/jgf-projects/issue/JGF-42); [271](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L271) → [JGF-43](https://linear.app/jgf-projects/issue/JGF-43); [275](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L275) → [JGF-44](https://linear.app/jgf-projects/issue/JGF-44); [279](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L279) → [JGF-45](https://linear.app/jgf-projects/issue/JGF-45); [283](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L283) → [JGF-46](https://linear.app/jgf-projects/issue/JGF-46); [287](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L287) → [JGF-42](https://linear.app/jgf-projects/issue/JGF-42); [291](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L291) → [JGF-47](https://linear.app/jgf-projects/issue/JGF-47); [295](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L295) → [JGF-48](https://linear.app/jgf-projects/issue/JGF-48); [303](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L303) → [JGF-49](https://linear.app/jgf-projects/issue/JGF-49); [309](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L309) → [JGF-50](https://linear.app/jgf-projects/issue/JGF-50); [313](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L313) → [JGF-51](https://linear.app/jgf-projects/issue/JGF-51)/[JGF-108](https://linear.app/jgf-projects/issue/JGF-108); [319](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L319) → [JGF-52](https://linear.app/jgf-projects/issue/JGF-52); [323](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L323) → [JGF-53](https://linear.app/jgf-projects/issue/JGF-53); [327](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L327) → [JGF-54](https://linear.app/jgf-projects/issue/JGF-54); [331](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L331) → [JGF-55](https://linear.app/jgf-projects/issue/JGF-55); [337](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L337) → [JGF-56](https://linear.app/jgf-projects/issue/JGF-56) |
| Privacy follow-ups | [346](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L346) → [JGF-57](https://linear.app/jgf-projects/issue/JGF-57); [347](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L347) → [JGF-58](https://linear.app/jgf-projects/issue/JGF-58); [348](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L348) → [JGF-59](https://linear.app/jgf-projects/issue/JGF-59); [349](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L349) → [JGF-60](https://linear.app/jgf-projects/issue/JGF-60); [350](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L350) → [JGF-61](https://linear.app/jgf-projects/issue/JGF-61); [351](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L351) → [JGF-62](https://linear.app/jgf-projects/issue/JGF-62); [352](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L352) → [JGF-63](https://linear.app/jgf-projects/issue/JGF-63); [353](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L353) → [JGF-64](https://linear.app/jgf-projects/issue/JGF-64) |
| Verification | [359](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L359) → [JGF-5](https://linear.app/jgf-projects/issue/JGF-5); [361](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L361) → [JGF-65](https://linear.app/jgf-projects/issue/JGF-65); [365](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L365) → [JGF-66](https://linear.app/jgf-projects/issue/JGF-66); [372](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L372) → [JGF-67](https://linear.app/jgf-projects/issue/JGF-67); [374](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L374) → [JGF-68](https://linear.app/jgf-projects/issue/JGF-68); [378](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L378) → [JGF-69](https://linear.app/jgf-projects/issue/JGF-69); [379](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L379) → [JGF-69](https://linear.app/jgf-projects/issue/JGF-69); [380](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L380) → [JGF-70](https://linear.app/jgf-projects/issue/JGF-70); [381](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L381) → [JGF-71](https://linear.app/jgf-projects/issue/JGF-71); [382](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L382) → [JGF-72](https://linear.app/jgf-projects/issue/JGF-72); [383](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L383) → [JGF-73](https://linear.app/jgf-projects/issue/JGF-73); [384](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L384) → [JGF-73](https://linear.app/jgf-projects/issue/JGF-73); [385](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L385) → [JGF-74](https://linear.app/jgf-projects/issue/JGF-74); [386](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L386) → [JGF-75](https://linear.app/jgf-projects/issue/JGF-75); [387](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L387) → [JGF-76](https://linear.app/jgf-projects/issue/JGF-76); [388](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L388) → [JGF-77](https://linear.app/jgf-projects/issue/JGF-77); [394](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L394) → [JGF-78](https://linear.app/jgf-projects/issue/JGF-78); [396](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L396) → [JGF-79](https://linear.app/jgf-projects/issue/JGF-79) |
| Trust and sourcing | [402](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L402) → [JGF-80](https://linear.app/jgf-projects/issue/JGF-80); [403](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L403) → [JGF-81](https://linear.app/jgf-projects/issue/JGF-81); [404](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L404) → [JGF-82](https://linear.app/jgf-projects/issue/JGF-82); [405](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L405) → [JGF-83](https://linear.app/jgf-projects/issue/JGF-83); [406](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L406) → [JGF-84](https://linear.app/jgf-projects/issue/JGF-84); [407](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L407) → [JGF-85](https://linear.app/jgf-projects/issue/JGF-85); [408](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L408) → [JGF-86](https://linear.app/jgf-projects/issue/JGF-86) |
| Content accuracy | [412](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L412) → [JGF-87](https://linear.app/jgf-projects/issue/JGF-87); [419](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L419) → [JGF-88](https://linear.app/jgf-projects/issue/JGF-88); [420](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L420) → [JGF-89](https://linear.app/jgf-projects/issue/JGF-89); [421](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L421) → [JGF-90](https://linear.app/jgf-projects/issue/JGF-90); [422](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L422) → [JGF-91](https://linear.app/jgf-projects/issue/JGF-91); [423](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L423) → [JGF-92](https://linear.app/jgf-projects/issue/JGF-92); [443](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L443) → [JGF-93](https://linear.app/jgf-projects/issue/JGF-93); [444](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L444) → [JGF-94](https://linear.app/jgf-projects/issue/JGF-94) |
| Production and public evidence | [450](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L450) → [JGF-95](https://linear.app/jgf-projects/issue/JGF-95); [452](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L452) → [JGF-96](https://linear.app/jgf-projects/issue/JGF-96)/[JGF-109](https://linear.app/jgf-projects/issue/JGF-109); [462](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L462) → [JGF-97](https://linear.app/jgf-projects/issue/JGF-97); [463](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L463) → [JGF-98](https://linear.app/jgf-projects/issue/JGF-98) |
| Search and discoverability | [467](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L467) → [JGF-99](https://linear.app/jgf-projects/issue/JGF-99); [489](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L489) → [JGF-100](https://linear.app/jgf-projects/issue/JGF-100); [497](https://github.com/jarrydaubert/payetax/blob/5bcbfb168976f102ba92c0c9eebd6a92765d0c3e/docs/BACKLOG.md#L497) → [JGF-101](https://linear.app/jgf-projects/issue/JGF-101) |

Non-checkbox Foundation outcomes:
net pay [JGF-102](https://linear.app/jgf-projects/issue/JGF-102), relief-at-source decision [JGF-103](https://linear.app/jgf-projects/issue/JGF-103),
transparent results [JGF-104](https://linear.app/jgf-projects/issue/JGF-104), portfolio/reconciliation [JGF-105](https://linear.app/jgf-projects/issue/JGF-105).
The original five burn-down rows also use the independent fixture/provenance owners
[JGF-69](https://linear.app/jgf-projects/issue/JGF-69)/[JGF-72](https://linear.app/jgf-projects/issue/JGF-72) and DI-19's first minimal Director fixture set [JGF-43](https://linear.app/jgf-projects/issue/JGF-43).

Original parked bullets L503–511 map in order to
[JGF-113](https://linear.app/jgf-projects/issue/JGF-113), [JGF-114](https://linear.app/jgf-projects/issue/JGF-114), [JGF-115](https://linear.app/jgf-projects/issue/JGF-115), [JGF-116](https://linear.app/jgf-projects/issue/JGF-116), [JGF-117](https://linear.app/jgf-projects/issue/JGF-117), [JGF-118](https://linear.app/jgf-projects/issue/JGF-118), [JGF-119](https://linear.app/jgf-projects/issue/JGF-119), [JGF-120](https://linear.app/jgf-projects/issue/JGF-120), [JGF-121](https://linear.app/jgf-projects/issue/JGF-121).
The L512 umbrella is grouped into DI-15/17/18, [JGF-122](https://linear.app/jgf-projects/issue/JGF-122)/[JGF-123](https://linear.app/jgf-projects/issue/JGF-123)/[JGF-124](https://linear.app/jgf-projects/issue/JGF-124);
it is not an additional implementation ticket. Supporting-page proposals remain grouped.
Other reconciled owners are GitHub #154 residual planning [JGF-110](https://linear.app/jgf-projects/issue/JGF-110),
the JGF-6 matched-GSC evidence gap [JGF-111](https://linear.app/jgf-projects/issue/JGF-111) and historical releases [JGF-112](https://linear.app/jgf-projects/issue/JGF-112).

## Legacy IDs

These mappings resolve IDs used by unchanged historical reports. They are not a fresh priority
list or a declaration that historical defects are still present.

| Old ID | Migrated owner |
| --- | --- |
| DI-02 | [JGF-36](https://linear.app/jgf-projects/issue/JGF-36) |
| DI-03 | [JGF-37](https://linear.app/jgf-projects/issue/JGF-37) |
| DI-04 | [JGF-38](https://linear.app/jgf-projects/issue/JGF-38) |
| DI-05 | [JGF-39](https://linear.app/jgf-projects/issue/JGF-39) |
| DI-06 | [JGF-40](https://linear.app/jgf-projects/issue/JGF-40) |
| DI-07 | [JGF-41](https://linear.app/jgf-projects/issue/JGF-41) |
| DI-08 + DI-24 | [JGF-42](https://linear.app/jgf-projects/issue/JGF-42) |
| DI-19 | [JGF-43](https://linear.app/jgf-projects/issue/JGF-43) |
| DI-20 | [JGF-44](https://linear.app/jgf-projects/issue/JGF-44) |
| DI-21 | [JGF-45](https://linear.app/jgf-projects/issue/JGF-45) |
| DI-23 | [JGF-46](https://linear.app/jgf-projects/issue/JGF-46) |
| DI-25 | [JGF-47](https://linear.app/jgf-projects/issue/JGF-47) |
| DI-27 | [JGF-48](https://linear.app/jgf-projects/issue/JGF-48) |
| DI-09 | [JGF-49](https://linear.app/jgf-projects/issue/JGF-49) |
| DI-10 | [JGF-50](https://linear.app/jgf-projects/issue/JGF-50) |
| DI-11 | [JGF-51](https://linear.app/jgf-projects/issue/JGF-51) |
| DI-12 | [JGF-52](https://linear.app/jgf-projects/issue/JGF-52) |
| DI-13 | [JGF-53](https://linear.app/jgf-projects/issue/JGF-53) |
| DI-14 | [JGF-54](https://linear.app/jgf-projects/issue/JGF-54) |
| DI-16 | [JGF-55](https://linear.app/jgf-projects/issue/JGF-55) |
| DI-22 | [JGF-56](https://linear.app/jgf-projects/issue/JGF-56) |
| DI-04 follow-up | [JGF-107](https://linear.app/jgf-projects/issue/JGF-107) |
| DI-11 urgent slice | [JGF-108](https://linear.app/jgf-projects/issue/JGF-108) |
| DI-15 / DI-17 / DI-18 | [JGF-122](https://linear.app/jgf-projects/issue/JGF-122) / [JGF-123](https://linear.app/jgf-projects/issue/JGF-123) / [JGF-124](https://linear.app/jgf-projects/issue/JGF-124) (parked) |
| DI-01 | Delivered in [#124](https://github.com/jarrydaubert/payetax/pull/124); remaining DI-02 is a separate owner. |
| DI-26 | Delivered in [#152](https://github.com/jarrydaubert/payetax/pull/152). |
| MC-01 / MC-02 / MC-03 integrity | Delivered in [#127](https://github.com/jarrydaubert/payetax/pull/127); MC-03 state presentation in [#142](https://github.com/jarrydaubert/payetax/pull/142). Residual pointer/input failures are [JGF-77](https://linear.app/jgf-projects/issue/JGF-77). |
| MC-04 | Delivered in [#143](https://github.com/jarrydaubert/payetax/pull/143). |
| MC-05 | [JGF-15](https://linear.app/jgf-projects/issue/JGF-15); separate mobile focus [JGF-106](https://linear.app/jgf-projects/issue/JGF-106). |
| MC-06 / MC-07 / MC-08 | [JGF-17](https://linear.app/jgf-projects/issue/JGF-17) / [JGF-18](https://linear.app/jgf-projects/issue/JGF-18) / [JGF-68](https://linear.app/jgf-projects/issue/JGF-68). |
| MC-09 | Delivered in [#134](https://github.com/jarrydaubert/payetax/pull/134); retain its exact-penny/parser/storage tests. |

DI-08/DI-24 share one issue/PR; the two taxRateDescriptions entries share [JGF-24](https://linear.app/jgf-projects/issue/JGF-24).
DI-04's year-end residual is [JGF-107](https://linear.app/jgf-projects/issue/JGF-107) and urgent DI-11 email rates is
[JGF-108](https://linear.app/jgf-projects/issue/JGF-108). DI-07 [JGF-41](https://linear.app/jgf-projects/issue/JGF-41) retains the arithmetic-first/email-qualification
split; the search gate [JGF-100](https://linear.app/jgf-projects/issue/JGF-100) retains separate pre-deployment and post-recrawl completion.
PWA build identity [JGF-96](https://linear.app/jgf-projects/issue/JGF-96) and live freshness [JGF-109](https://linear.app/jgf-projects/issue/JGF-109) are distinct scopes.

Completed work is not reimported: #127/#134/#135/#136/#137/#139/#142/#143,
#151/#156/#157/#158/#159, #153, #144/#145, #161/#162, #163, #167/JGF-6,
#164 and #77/#96 retain their PR evidence. #128 is closed unmerged and superseded,
not an outstanding rebase or a completed mobile redesign.

## Workflow configuration still unresolved

The JGF team's PR/commit status automations and branch overrides are not exposed by the
available connector and were not independently inspected or changed. An authorised maintainer
must verify and record them before relying on automatic closure. The guide names the actual
relationship keywords and requires checking the resulting relationship/status; this PR cannot
certify team configuration or production validation.

## Validation and independent re-review

Commands and final results are recorded in this PR's public verification section. The source
inventory and compatibility-anchor checks can be rerun against the pinned base. Check the
current head rather than treating the original Claude verdict or this report as approval.

Review focus: no durable rule lost; mandatory other-model review preserved; old anchors and
current entry points resolve; every original source line and legacy ID has a disposition;
PR criteria/evidence remain publicly understandable; merge is not external Done.

### Validation and review corrections (3–4 November)

Local Windows, Node 24.18.0 and Bun 1.4.3; the repository/hosted CI declares Bun 1.3.13.

| Check | Result |
| --- | --- |
| Frozen-lockfile install | Pass; no dependency or lockfile delta. |
| `bun --no-env-file run check:repo` | Pass, including lint, both typechecks and all repository guards. |
| Current-blog-guidance and release-version Jest suites | 2 suites / 54 tests pass. |
| Affected calculator-critical Playwright file, Chromium `--list` | 42 tests collect; browser execution not rerun for a comment-only change. |
| `bun --no-env-file run build:ci` | Pass; no deployment performed. |
| Base-aware version guard | Pass; docs/test-comment-only changes require no app version bump. |
| Documentation audit | 99/99 source entries mapped; 37/37 old anchors retained; changed local links and historical links to both old paths resolve. |
| Staged-tree secret check | Pass with Gitleaks 8.30.1 downloaded locally and verified against its official release checksum; no global install. |

The fresh read-only Claude review of staged tree `33aa5069bbda22b0f8e6b0bfde82cf622b658064`
returned REQUEST CHANGES: explicitly retain the tax-fact shrink-only baseline and restore the
full data-hygiene rule for tokens, raw inputs and analytics payloads in fixtures/logs/evidence.
Both are corrected. Partial-PR branch/link safety, mandatory routine-work review, the current
salary-sacrifice-only limitation, anti-flake constraints and the minor template/comment/list
findings are also addressed. Final bounded re-review results are recorded in the public PR.

The initial hidden-path Jest discovery failure and checkout CRLF formatting failures were
environment issues. Only this task's clone was moved to a normal path and its checkout matched
to Git's LF bytes; no check, configuration or tracked source was weakened to pass. No unrelated
unstaged changes are part of the reviewed/staged patch.
