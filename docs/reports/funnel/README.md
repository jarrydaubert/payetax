# Funnel Reviews

Purpose: lightweight monthly review of `sessions -> calculator_start -> calculator_completed -> monetization click`.

## Workflow

1. Create current month report:
   - `bun run funnel:report:init`
2. Fill metrics + one decision + one action:
   - `docs/reports/funnel/YYYY-MM.md`
3. Check report exists:
   - `bun run funnel:report:status`

## Notes

- Keep values aggregated and privacy-safe.
- Focus on one decision and one action per month to keep cadence sustainable.
