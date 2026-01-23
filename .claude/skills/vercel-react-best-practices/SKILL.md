---
name: vercel-react-best-practices
description: React and Next.js performance optimization guidelines from Vercel Engineering. This skill should be used when writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements.
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
---

# Vercel React Best Practices

Comprehensive performance optimization guide for React and Next.js applications, maintained by Vercel. Contains 45 rules across 8 categories, prioritized by impact to guide automated refactoring and code generation.

## When to Apply

Reference these guidelines when:
- Writing new React components or Next.js pages
- Implementing data fetching (client or server-side)
- Reviewing code for performance issues
- Refactoring existing React/Next.js code
- Optimizing bundle size or load times

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Eliminating Waterfalls | CRITICAL | `async-` |
| 2 | Bundle Size Optimization | CRITICAL | `bundle-` |
| 3 | Server-Side Performance | HIGH | `server-` |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH | `client-` |
| 5 | Re-render Optimization | MEDIUM | `rerender-` |
| 6 | Rendering Performance | MEDIUM | `rendering-` |
| 7 | JavaScript Performance | LOW-MEDIUM | `js-` |
| 8 | Advanced Patterns | LOW | `advanced-` |

## Quick Reference

### 1. Eliminating Waterfalls (CRITICAL)

- `async-defer-await` - Move await into branches where actually used
- `async-parallel` - Use Promise.all() for independent operations
- `async-dependencies` - Use better-all for partial dependencies
- `async-api-routes` - Start promises early, await late in API routes
- `async-suspense-boundaries` - Use Suspense to stream content

### 2. Bundle Size Optimization (CRITICAL)

- `bundle-barrel-imports` - Import directly, avoid barrel files
- `bundle-dynamic-imports` - Use next/dynamic for heavy components
- `bundle-defer-third-party` - Load analytics/logging after hydration
- `bundle-conditional` - Load modules only when feature is activated
- `bundle-preload` - Preload on hover/focus for perceived speed

### 3. Server-Side Performance (HIGH)

- `server-cache-react` - Use React.cache() for per-request deduplication
- `server-cache-lru` - Use LRU cache for cross-request caching
- `server-serialization` - Minimize data passed to client components
- `server-parallel-fetching` - Restructure components to parallelize fetches
- `server-after-nonblocking` - Use after() for non-blocking operations
- `server-auth-actions` - Authenticate Server Actions like API routes

### 4. Client-Side Data Fetching (MEDIUM-HIGH)

- `client-swr-dedup` - Use SWR for automatic request deduplication
- `client-event-listeners` - Deduplicate global event listeners
- `client-passive-listeners` - Use passive event listeners for scroll
- `client-localstorage` - Version and minimize localStorage data

### 5. Re-render Optimization (MEDIUM)

- `rerender-defer-reads` - Don't subscribe to state only used in callbacks
- `rerender-memo` - Extract expensive work into memoized components
- `rerender-dependencies` - Use primitive dependencies in effects
- `rerender-derived-state` - Subscribe to derived booleans, not raw values
- `rerender-functional-setstate` - Use functional setState for stable callbacks
- `rerender-lazy-state-init` - Pass function to useState for expensive values
- `rerender-transitions` - Use startTransition for non-urgent updates

### 6. Rendering Performance (MEDIUM)

- `rendering-animate-svg-wrapper` - Animate div wrapper, not SVG element
- `rendering-content-visibility` - Use content-visibility for long lists
- `rendering-hoist-jsx` - Extract static JSX outside components
- `rendering-svg-precision` - Reduce SVG coordinate precision
- `rendering-hydration-no-flicker` - Use inline script for client-only data
- `rendering-activity` - Use Activity component for show/hide
- `rendering-conditional-render` - Use ternary, not && for conditionals

### 7. JavaScript Performance (LOW-MEDIUM)

- `js-batch-dom-css` - Group CSS changes via classes or cssText
- `js-index-maps` - Build Map for repeated lookups
- `js-cache-property-access` - Cache object properties in loops
- `js-cache-function-results` - Cache function results in module-level Map
- `js-cache-storage` - Cache localStorage/sessionStorage reads
- `js-combine-iterations` - Combine multiple filter/map into one loop
- `js-length-check-first` - Check array length before expensive comparison
- `js-early-exit` - Return early from functions
- `js-hoist-regexp` - Hoist RegExp creation outside loops
- `js-min-max-loop` - Use loop for min/max instead of sort
- `js-set-map-lookups` - Use Set/Map for O(1) lookups
- `js-tosorted-immutable` - Use toSorted() for immutability

### 8. Advanced Patterns (LOW)

- `advanced-event-handler-refs` - Store event handlers in refs
- `advanced-use-latest` - useLatest for stable callback refs

---

## Detailed Rules

### 1. Eliminating Waterfalls (CRITICAL)

#### 1.1 Defer Await Until Needed

Move `await` operations into the branches where they're actually used to avoid blocking code paths that don't need them.

```typescript
// Bad: blocks both branches
async function handleRequest(userId: string, skipProcessing: boolean) {
  const userData = await fetchUserData(userId)
  if (skipProcessing) {
    return { skipped: true }
  }
  return processUserData(userData)
}

// Good: only blocks when needed
async function handleRequest(userId: string, skipProcessing: boolean) {
  if (skipProcessing) {
    return { skipped: true }
  }
  const userData = await fetchUserData(userId)
  return processUserData(userData)
}
```

#### 1.2 Promise.all() for Independent Operations

When async operations have no interdependencies, execute them concurrently.

```typescript
// Bad: sequential, 3 round trips
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()

// Good: parallel, 1 round trip
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
])
```

#### 1.3 Start Promises Early in API Routes

```typescript
// Bad: config waits for auth
export async function GET(request: Request) {
  const session = await auth()
  const config = await fetchConfig()
  const data = await fetchData(session.user.id)
  return Response.json({ data, config })
}

// Good: auth and config start immediately
export async function GET(request: Request) {
  const sessionPromise = auth()
  const configPromise = fetchConfig()
  const session = await sessionPromise
  const [config, data] = await Promise.all([
    configPromise,
    fetchData(session.user.id)
  ])
  return Response.json({ data, config })
}
```

#### 1.4 Strategic Suspense Boundaries

```tsx
// Bad: wrapper blocked by data
async function Page() {
  const data = await fetchData()
  return (
    <div>
      <Sidebar />
      <DataDisplay data={data} />
    </div>
  )
}

// Good: wrapper shows immediately
function Page() {
  return (
    <div>
      <Sidebar />
      <Suspense fallback={<Skeleton />}>
        <DataDisplay />
      </Suspense>
    </div>
  )
}

async function DataDisplay() {
  const data = await fetchData()
  return <div>{data.content}</div>
}
```

---

### 2. Bundle Size Optimization (CRITICAL)

#### 2.1 Avoid Barrel File Imports

```tsx
// Bad: imports entire library (1,583 modules)
import { Check, X, Menu } from 'lucide-react'

// Good: imports only what you need
import Check from 'lucide-react/dist/esm/icons/check'
import X from 'lucide-react/dist/esm/icons/x'
import Menu from 'lucide-react/dist/esm/icons/menu'

// Alternative: use Next.js optimizePackageImports
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@mui/material']
  }
}
```

#### 2.2 Dynamic Imports for Heavy Components

```tsx
// Bad: Monaco bundles with main chunk (~300KB)
import { MonacoEditor } from './monaco-editor'

// Good: Monaco loads on demand
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(
  () => import('./monaco-editor').then(m => m.MonacoEditor),
  { ssr: false }
)
```

#### 2.3 Defer Non-Critical Third-Party Libraries

```tsx
// Bad: blocks initial bundle
import { Analytics } from '@vercel/analytics/react'

// Good: loads after hydration
import dynamic from 'next/dynamic'

const Analytics = dynamic(
  () => import('@vercel/analytics/react').then(m => m.Analytics),
  { ssr: false }
)
```

#### 2.4 Preload on User Intent

```tsx
function EditorButton({ onClick }: { onClick: () => void }) {
  const preload = () => {
    if (typeof window !== 'undefined') {
      void import('./monaco-editor')
    }
  }

  return (
    <button
      onMouseEnter={preload}
      onFocus={preload}
      onClick={onClick}
    >
      Open Editor
    </button>
  )
}
```

---

### 3. Server-Side Performance (HIGH)

#### 3.1 Authenticate Server Actions

Server Actions are public endpoints. Always verify auth inside each action.

```typescript
'use server'

import { verifySession } from '@/lib/auth'

export async function deleteUser(userId: string) {
  const session = await verifySession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  if (session.user.role !== 'admin' && session.user.id !== userId) {
    throw new Error('Forbidden')
  }
  await db.user.delete({ where: { id: userId } })
  return { success: true }
}
```

#### 3.2 Minimize Serialization at RSC Boundaries

```tsx
// Bad: serializes all 50 fields
async function Page() {
  const user = await fetchUser()
  return <Profile user={user} />
}

// Good: serializes only needed fields
async function Page() {
  const user = await fetchUser()
  return <Profile name={user.name} avatar={user.avatar} />
}
```

#### 3.3 Per-Request Deduplication with React.cache()

```typescript
import { cache } from 'react'

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  return await db.user.findUnique({
    where: { id: session.user.id }
  })
})
```

#### 3.4 Use after() for Non-Blocking Operations

```tsx
import { after } from 'next/server'

export async function POST(request: Request) {
  await updateDatabase(request)

  after(async () => {
    await logUserAction({ userAgent: request.headers.get('user-agent') })
  })

  return Response.json({ status: 'success' })
}
```

---

### 4. Re-render Optimization (MEDIUM)

#### 4.1 Use Transitions for Non-Urgent Updates

```tsx
'use client'
import { useTransition } from 'react'

function Calculator() {
  const [isPending, startTransition] = useTransition()
  const [results, setResults] = useState(null)

  function handleSalaryChange(salary) {
    startTransition(() => {
      setResults(calculateTax(salary))
    })
  }

  return (
    <>
      <input onChange={(e) => handleSalaryChange(e.target.value)} />
      {isPending ? <Skeleton /> : <Results data={results} />}
    </>
  )
}
```

#### 4.2 Use Functional setState

```tsx
// Bad: needs count in deps
const increment = useCallback(() => {
  setCount(count + 1)
}, [count])

// Good: stable reference
const increment = useCallback(() => {
  setCount(c => c + 1)
}, [])
```

#### 4.3 Lazy State Initialization

```tsx
// Bad: parseData runs every render
const [data, setData] = useState(parseData(rawData))

// Good: parseData runs once
const [data, setData] = useState(() => parseData(rawData))
```

---

### 5. JavaScript Performance (LOW-MEDIUM)

#### 5.1 Use Set/Map for O(1) Lookups

```typescript
// Bad: O(n) per check
const allowedIds = ['a', 'b', 'c']
items.filter(item => allowedIds.includes(item.id))

// Good: O(1) per check
const allowedIds = new Set(['a', 'b', 'c'])
items.filter(item => allowedIds.has(item.id))
```

#### 5.2 Use toSorted() for Immutability

```typescript
// Bad: mutates original array
const sorted = users.sort((a, b) => a.name.localeCompare(b.name))

// Good: creates new array
const sorted = users.toSorted((a, b) => a.name.localeCompare(b.name))
```

#### 5.3 Early Return from Functions

```typescript
// Bad: processes all even after error
function validateUsers(users: User[]) {
  let hasError = false
  for (const user of users) {
    if (!user.email) hasError = true
    if (!user.name) hasError = true
  }
  return !hasError
}

// Good: returns on first error
function validateUsers(users: User[]) {
  for (const user of users) {
    if (!user.email) return { valid: false, error: 'Email required' }
    if (!user.name) return { valid: false, error: 'Name required' }
  }
  return { valid: true }
}
```

#### 5.4 Cache Property Access in Loops

```typescript
// Bad: access length on each iteration
for (let i = 0; i < items.length; i++) { ... }

// Good: cache length
for (let i = 0, len = items.length; i < len; i++) { ... }
```

---

## PayeTax-Specific Applications

These rules are particularly relevant for PayeTax:

1. **Calculator Performance**: Use `startTransition` for tax calculations to keep input responsive
2. **Bundle Size**: Dynamic import chart components, defer analytics
3. **Server Components**: Keep tax rate fetching on server, minimize client serialization
4. **Validation**: Early return on invalid salary inputs
5. **State**: Use functional setState in calculator store updates

## References

- https://react.dev
- https://nextjs.org
- https://vercel.com/blog/how-we-optimized-package-imports-in-next-js
- https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast
