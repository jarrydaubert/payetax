# Low-Value Module Test Strategy

Scope date: 16 April 2026

Purpose:
- record which thin wrappers keep targeted tests,
- avoid implicit "we'll test it later" debt,
- keep higher-level coverage decisions explicit.

## Scoped Modules

| Module | Decision | Evidence path | Why |
|---|---|---|---|
| `src/lib/safeStorage.ts` | Keep targeted unit tests | `src/lib/__tests__/safeStorage.test.ts` | This is a browser-boundary wrapper whose whole value is failing closed when storage is blocked. Direct unit tests are cheap and catch the exact `SecurityError` class of bug. |
| `src/hooks/useMotionPreference.ts` | Keep targeted unit tests | `src/hooks/__tests__/useMotionPreference.test.ts` | The hook is a thin `matchMedia` adapter with accessibility impact. Direct tests are the clearest bug oracle. |
| `src/hooks/useMediaQuery.ts` | Keep targeted unit tests | `src/hooks/__tests__/useMediaQuery.test.ts` | This is a reusable responsive/query wrapper used by UI code. Direct tests catch incorrect query initialization and listener cleanup. |
| `src/hooks/useHorizontalScrollIndicator.ts` | Keep targeted unit tests | `src/hooks/__tests__/useHorizontalScrollIndicator.test.ts` | The hook owns its own measurement and event wiring logic, so direct hook tests are worthwhile and small. |
| `src/hooks/useMouseDragScroll.ts` | Keep targeted unit tests | `src/hooks/__tests__/useMouseDragScroll.test.tsx` | Pointer-event drag logic is easy to regress and easier to verify directly than through a full table flow. |
| `src/lib/security/botGuard.ts` | Keep targeted unit tests | `src/lib/security/__tests__/botGuard.test.ts` | This helper intentionally makes compact block/allow decisions and benefits from exact request/body test vectors. |

## Out Of Scope

- `src/lib/analytics.ts`
- `src/lib/sentry.ts`

Reason:
- They are not thin wrappers anymore; they contain substantive orchestration, vendor integration, and app-specific branching.
- They should continue to be tested through the feature and route flows that exercise them, not treated as low-value wrapper modules.

## Rule Going Forward

- Thin wrappers that mainly adapt browser APIs, request metadata, or event listeners should default to direct unit tests.
- If a thin wrapper is intentionally left without direct tests, the owning change must name the higher-level evidence path and why that layer is the better bug oracle.
