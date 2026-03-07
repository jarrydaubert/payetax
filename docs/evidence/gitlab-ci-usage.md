# GitLab CI Usage Budget Audit

Date: 2026-03-07T07:37:08.491Z
API: https://gitlab.com/api/v4
Project: ukpayetax/payetax
Window: last 30 days

Status: PASS
- Pipelines fetched: 57
- Pipelines with measured runtime: 0
- Pipelines without measurable runtime: 57
- Total measured runtime: 0.00m
- Average runtime (where measurable): 0.00m
- Pipeline refs:
  - feature-tax-ai-mvp: 2
  - main: 55

- Measurement notes:
  - Prefer pipeline.duration when GitLab provides it.
  - Fallback to summing job durations (or started_at/finished_at deltas) for non-external pipelines.
  - External pipelines (for example Vercel-managed runs) are counted but not treated as GitLab CI minutes.
  - Unmeasured pipelines:
    - #2369597160 ref=main source=external status=success jobs=0
    - #2369583156 ref=main source=external status=success jobs=0
    - #2359580924 ref=main source=external status=success jobs=0
    - #2359571322 ref=main source=external status=success jobs=0
    - #2346079593 ref=main source=external status=success jobs=0
    - #2346055205 ref=main source=external status=success jobs=0
    - #2345979002 ref=main source=external status=success jobs=0
    - #2345878405 ref=main source=external status=success jobs=0
    - #2344854123 ref=main source=external status=success jobs=0
    - #2344837758 ref=main source=external status=success jobs=0
    - ... 47 more

- Budgets:
  - monthly total <= 100.00m

- PASS: Monthly runtime budget (0.00m <= 100.00m)
- PASS: Pipelines observed in window (count=57)
