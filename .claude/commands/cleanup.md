---
description: Deep project housekeeping - find duplicates, orphans, and junk
argument-hint: [scope]
---

# /cleanup - Deep Housekeeping

**CRITICAL INSTRUCTIONS - READ FIRST:**
- Do NOT delete anything automatically
- Do NOT trust knip/tooling blindly - VERIFY each finding
- SCAN directories BEFORE making any claims
- LIST findings for human review
- Output ALL findings directly in this conversation as markdown

Run a comprehensive housekeeping scan of the project.

**Rules:**
- DO NOT delete files or dependencies
- DO scan every relevant directory
- DO cross-reference imports before flagging orphans
- DO check dynamic imports, config files, and test files
- DO remember past false positives (e.g., blog system)
- LEAVE deletion decisions to the human

## Usage
```
/cleanup              # Full project scan
/cleanup components   # Focus on src/components
/cleanup deps         # Focus on dependencies
/cleanup tests        # Focus on test files
```

---

## Phase 1: Directory Scan

**BEFORE making any claims, scan these directories:**

```bash
# List all directories to understand structure
find src -type d | head -50

# Or use LS tool on each major directory
```

### Directories to Scan
- `src/components/atoms/`
- `src/components/molecules/`
- `src/components/organisms/`
- `src/components/templates/`
- `src/lib/`
- `src/hooks/`
- `src/store/`
- `src/constants/`
- `src/types/`
- `src/app/`
- `public/`
- `scripts/`

**For each directory:**
1. List all files
2. Note any suspicious patterns (duplicates, old versions)
3. Check if directory should exist based on current architecture

---

## Phase 2: Duplicate Detection

### File Name Duplicates
Look for similar names in different locations:
```
CookieBanner.tsx in atoms/ AND organisms/  ← DUPLICATE SYSTEM
ErrorBoundary.tsx in atoms/ AND organisms/ ← DUPLICATE SYSTEM
TableOfContents.tsx in molecules/ AND organisms/ ← DUPLICATE SYSTEM
```

### Pattern Detection
- `ComponentName.tsx` and `ComponentNameNew.tsx`
- `utils.ts` and `utils2.ts`
- `old/` or `backup/` directories
- `.bak`, `.old`, `.copy` suffixes
- `_archived` or `_deprecated` prefixes

### Implementation Duplicates
- Two functions doing the same thing
- Parallel state management (context AND store)
- Multiple ways to fetch same data

**Output format:**
| Duplicate | Location A | Location B | Action |
|-----------|------------|------------|--------|
| CookieBanner | atoms/ | organisms/ | Verify which is active |

---

## Phase 3: Orphan Detection

### Component Orphans
For EACH component file, verify it's imported somewhere:

```bash
# Search for imports of ComponentName
grep -r "from.*ComponentName" src/
grep -r "import.*ComponentName" src/
```

**Check these import patterns:**
- Direct imports: `import { X } from './X'`
- Dynamic imports: `dynamic(() => import('./X'))`
- Barrel exports: `export * from './X'`
- Test imports: `import { X } from '../X'`

### File Orphans
Files that might be orphaned:
- Components with no imports
- Hooks not used anywhere
- Utils not called
- Types not referenced
- Constants not imported

**CRITICAL: Before flagging as orphan:**
1. Check ALL import variations
2. Check dynamic imports in next.config.ts
3. Check if used in tests only
4. Check if exported via barrel file
5. Check if used in MDX/content files

### Test File Orphans
- `__tests__/ComponentName.test.tsx` where `ComponentName.tsx` was deleted
- Test files for renamed components
- Snapshot files for deleted tests

---

## Phase 4: Dependency Audit

### Run Knip (But Verify!)
```bash
bunx knip
```

**For EACH knip suggestion, verify:**

| Dependency | Knip Says | Actual Check | Verdict |
|------------|-----------|--------------|---------|
| `package-x` | Unused | Check imports, config, scripts | Keep/Remove |

### Verification Checklist

**Before marking dependency as unused:**
- [ ] Searched all `.ts`, `.tsx`, `.js`, `.mjs` files
- [ ] Checked `next.config.ts` 
- [ ] Checked `tailwind.config.ts`
- [ ] Checked `jest.config.js`
- [ ] Checked `playwright.config.ts`
- [ ] Checked `biome.json`
- [ ] Checked `package.json` scripts
- [ ] Checked if it's a peer dependency
- [ ] Checked if it's used at runtime only
- [ ] Checked if it's a type-only dependency

### Known False Positives (PayeTax)
Track dependencies that LOOK unused but ARE used:
- MDX-related packages (used by content system)
- Sentry packages (used in config files)
- Testing utilities (used in test setup)

---

## Phase 5: Dead Code Detection

### Commented Code
```bash
# Find commented code blocks
grep -rn "// TODO" src/
grep -rn "// FIXME" src/
grep -rn "// HACK" src/
```

### Unused Exports
Functions/components exported but never imported elsewhere.

### Unreachable Code
- Code after return statements
- Conditions that are always true/false
- Unused function parameters

### Stale Feature Flags
- Feature flags that are always on/off
- Conditional code that's no longer conditional

---

## Phase 6: Asset Audit

### Public Directory
- Images not referenced anywhere
- Fonts not used
- Old favicons/icons
- Unused JSON/data files

### Verify Each Asset
```bash
# For each file in public/, search for references
grep -r "filename.png" src/
grep -r "filename.png" content/
```

---

## Output Format

### Summary
```markdown
## Cleanup Report

### Critical (Definite Issues)
| Issue | Location | Evidence | Recommendation |
|-------|----------|----------|----------------|

### Suspicious (Needs Verification)
| Issue | Location | Why Flagged | Verification Needed |
|-------|----------|-------------|---------------------|

### Safe to Remove (Verified)
| Item | Location | Verification Done |
|------|----------|-------------------|

### Keep (False Positives)
| Item | Location | Why It's Actually Used |
|------|----------|------------------------|
```

### Per-Directory Report
For each directory scanned:
```markdown
### src/components/atoms/
- Files: 12
- Potentially orphaned: 2
- Duplicates found: 1
- Issues: [list]
```

---

## Known PayeTax Patterns

### Recent Moves (Check These)
Based on git status, these were recently moved:
- CookieBanner: atoms → organisms
- ErrorBoundary: atoms → organisms  
- TableOfContents: molecules → organisms

**Verify:**
- Old locations are deleted
- New locations are imported correctly
- Tests were moved too

### Systems That Look Unused But Aren't
- Blog/MDX system (dynamic content)
- Sentry instrumentation (config-based)
- Analytics (loaded dynamically)

---

## Pre-Deletion Checklist

Before recommending ANY deletion:

- [ ] Scanned the directory first
- [ ] Searched for all import patterns
- [ ] Checked dynamic imports
- [ ] Checked config files
- [ ] Checked test files
- [ ] Checked if it's a recent addition
- [ ] Checked git history for context
- [ ] Verified with human if uncertain

**When in doubt, FLAG for review, don't recommend deletion.**

---

## Related Commands

- `/audit` - Code quality and architecture review
- `/security` - Security-focused review
- `/test` - Test coverage analysis
