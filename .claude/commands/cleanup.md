---
description: Deep project housekeeping - find duplicates, orphans, and junk
argument-hint: [scope]
---

# /cleanup - Deep Housekeeping

**CRITICAL INSTRUCTIONS:**
- Do NOT delete anything automatically
- Do NOT trust knip/tooling blindly - VERIFY each finding
- If filesystem access unavailable, only analyze provided file lists; mark everything else UNVERIFIED
- Output ALL findings directly in this conversation as markdown
- Max 30 findings per run; prioritize by impact

**Capability Contract:**
- If you can read the filesystem (Glob/LS/Grep tools), do full scan
- If you can't, only analyze the file lists provided; do NOT invent file structures

## Evidence Standard

Every finding MUST include:
- **Evidence**: Exact search method used (e.g., "rg search found 0 imports", "convention entrypoint")
- **Confidence**: High (verified all patterns) / Medium (most patterns) / Low (limited check)

"Verified" means: searched all code + config + dynamic import patterns + conventions + content/MDX + build-time usage.

## Usage
```
/cleanup              # Full project scan (max 30 findings)
/cleanup components   # Focus on src/components only
/cleanup deps         # Focus on dependencies only
/cleanup tests        # Focus on test files only
```

**In scoped mode**, scan only within scope + shared config roots.
**In full mode**, scan all directories but cap findings at 30, prioritized by impact.

---

## NEVER Flag as Orphan (Convention Entrypoints)

These files are executed by Next.js convention, NOT imported:

```
src/app/**/page.tsx
src/app/**/layout.tsx
src/app/**/loading.tsx
src/app/**/error.tsx
src/app/**/not-found.tsx
src/app/**/route.ts
src/app/**/opengraph-image.tsx
src/middleware.ts
src/app/sitemap.ts
src/app/robots.ts
instrumentation.ts
instrumentation-client.ts
sentry.*.config.ts
public/* (referenced by metadata/icons/manifest)
```

**If a file matches these patterns, mark as "Convention Entrypoint" - do NOT flag as orphan.**

---

## Two-Pass Workflow

### Pass 1: Inventory & Suspicious Candidates
1. List directories and files
2. Identify suspicious patterns (duplicates, old versions, no imports found)
3. Do NOT recommend removal yet - just flag as "Suspicious"

### Pass 2: Verification (Top 10-20 candidates only)
1. For each suspicious item, run full verification
2. Only after verification, classify as "High confidence removable" or "Keep"

---

## Phase 1: Directory Scan

**Use Glob/LS tools** (not `find` command):

### Directories to Scan
- `src/components/` (atoms, molecules, organisms, templates)
- `src/lib/`
- `src/hooks/`
- `src/store/`
- `src/constants/`
- `src/types/`
- `src/app/`
- `public/`
- `scripts/`
- `emails/`

Always ignore generated/cache directories during housekeeping:
- `.next/`
- `.swc/`
- `node_modules/`
- `audit-outputs/`

**For each directory:**
1. List all files (use LS tool)
2. Note suspicious patterns
3. Do NOT claim orphans yet - just inventory

---

## Phase 2: Duplicate Detection

### File Name Duplicates
Look for similar names in different locations.

### Semantic Duplicates
- Same component behavior under different names
- Shadow duplicates via `index.ts` barrels exporting two variants
- Check `git blame` / last-modified to pick canonical version

### Pattern Detection
- `ComponentName.tsx` and `ComponentNameNew.tsx`
- `utils.ts` and `utils2.ts`
- `old/`, `backup/`, `_archived`, `_deprecated`
- `.bak`, `.old`, `.copy` suffixes

**Output:**
| Duplicate | Location A | Location B | Evidence | Action |
|-----------|------------|------------|----------|--------|

---

## Phase 3: Orphan Detection

### Import Patterns to Check (ALL of these)

Use ripgrep (`rg`) or Grep tool:

```bash
# Direct imports
rg "from ['\"].*ComponentName" src/
rg "import.*ComponentName" src/

# Path alias imports
rg "from ['\"]@/.*ComponentName" src/

# Barrel exports
rg "export.*from.*ComponentName" src/
rg "export \{ .*ComponentName" src/

# Dynamic imports
rg "dynamic\(\(\) => import\(['\"].*ComponentName" src/
rg "import\(['\"].*ComponentName" src/

# MDX/content references
rg "ComponentName" content/
```

### Before Flagging as Orphan, Verify:
- [ ] All import variations checked (direct, alias, barrel, dynamic)
- [ ] Config files checked (next.config, tailwind.config, etc.)
- [ ] Test files checked
- [ ] MDX/content files checked
- [ ] NOT a convention entrypoint (see list above)
- [ ] NOT a type-only export

**If ANY check fails or is unavailable, mark as UNVERIFIED.**

---

## Phase 4: Dependency Audit

### Run Knip (Verify Each Finding!)
```bash
bun run audit:unused       # focused cleanup signal (files/deps/binaries/unlisted)
bun run audit:unused:full  # full export/type report when needed
```

### Verification Checklist

**Before marking dependency as unused:**
- [ ] Searched all `.ts`, `.tsx`, `.js`, `.mjs` files
- [ ] Checked `next.config.ts`
- [ ] Checked `tailwind.config.ts`
- [ ] Checked `postcss.config.mjs`
- [ ] Checked `jest.config.js`
- [ ] Checked `playwright.config.ts`
- [ ] Checked `biome.json` / `eslint.config.*`
- [ ] Checked `tsconfig.json` (paths, types)
- [ ] Checked `package.json` scripts
- [ ] Checked `.github/` CI configs
- [ ] Checked if peer dependency
- [ ] Checked if runtime-only (instrumentation, polyfills)
- [ ] Checked if type-only dependency (`@types/*`)

### Side-Effect Dependencies Warning

**These deps are used via side effects, NOT imports:**
- Polyfills (global scope modification)
- CSS frameworks (loaded via import statement with no variable)
- Instrumentation (Sentry, analytics - loaded by config)
- Build plugins

**Do NOT flag as unused based solely on import search.**

### False Positive Registry (PayeTax-specific)

Always exempt unless PROVEN unused:
- MDX-related packages (`@mdx-js/*`, `remark-*`, `rehype-*`)
- Sentry packages (`@sentry/*`)
- Analytics packages
- Testing utilities (`@testing-library/*`, `jest-*`)
- Content processing (`gray-matter`, `reading-time`)
- Service worker files (`public/register-sw.js`, `public/sw.js`)
- Kit embed styling source (`docs/guides/KIT_EMBED_CSS.css`)
- Search-engine verification files in `public/*.txt` (verify external ownership usage before flagging)

---

## Phase 5: Code Hygiene (Separate from Dead Code)

### Hygiene Items (not dead code)
```bash
rg "// TODO" src/ e2e/
rg "// FIXME" src/ e2e/
rg "// HACK" src/ e2e/
```

### Actual Dead Code (requires reachability analysis)
- Unreachable code after return statements
- Conditions that are always true/false
- Unused function parameters
- Exported but never imported functions

**Note:** Dead code detection requires ts-prune/knip/tsserver analysis. Mark as UNVERIFIED if tooling not available.

---

## Phase 6: Asset Audit

### Asset Reference Patterns to Check

```bash
# Direct string references
rg "filename\.png" src/ content/

# CSS url() references
rg "url\(['\"]?.*filename" src/

# Next/Image imports
rg "from ['\"].*public/" src/
rg "src=['\"]/" src/

# Metadata references
rg "icon.*filename" src/app/

# Manifest references
rg "filename" public/manifest.json
```

### Also Check:
- OG images referenced in metadata
- Favicons in layout.tsx head
- PWA icons in manifest.json

---

## Output Format

### Summary
```markdown
## Cleanup Report

**Scope:** [what was scanned]
**Files Examined:** [count]
**Method:** [filesystem access / provided files only]

### Stop-Ship Issues (if any)
| Issue | Location | Evidence | Confidence |
|-------|----------|----------|------------|

### High Confidence Removable
| Item | Location | Evidence | Confidence | Verification Done |
|------|----------|----------|------------|-------------------|

### Suspicious (Needs Human Verification)
| Item | Location | Why Flagged | What to Check |
|------|----------|-------------|---------------|

### Keep (Confirmed Used)
| Item | Location | How It's Used |
|------|----------|---------------|

### Unverified (Couldn't Check)
| Item | Location | What Blocked Verification |
|------|----------|---------------------------|
```

---

## Pre-Recommendation Checklist

Before recommending ANY removal:

- [ ] Scanned the directory first
- [ ] Searched ALL import patterns (direct, alias, barrel, dynamic)
- [ ] Checked config files
- [ ] Checked test files
- [ ] Checked content/MDX files
- [ ] Verified NOT a convention entrypoint
- [ ] Checked git history for context
- [ ] Evidence documented in finding

**When in doubt, mark as "Suspicious" not "Removable".**

---

## Related Commands

- `/audit` - Code quality and architecture review
- `/security` - Security-focused review
- `/test` - Test coverage analysis
