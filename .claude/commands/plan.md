---
description: Architecture planning and design session
argument-hint: [feature or problem]
---

# /plan - Architecture Planning

**CRITICAL INSTRUCTIONS - READ FIRST:**
- Do NOT use the EnterPlanMode tool
- Do NOT save anything to ~/.claude/plans/
- Do NOT create any files
- Output ALL plans directly in this conversation as markdown

Start a planning session for feature design or architectural decisions.

**Rules:**
- DO NOT write or modify code
- OUTPUT directly in the chat response
- DO explore the codebase to understand context
- DO design solutions with trade-offs
- DO specify files, patterns, and approaches
- LEAVE implementation to the builder session

## Usage
```
/plan add pension calculator
/plan improve mobile performance
/plan refactor state management
```

## Planning Mindset

When planning, consider:

### 1. Requirements Gathering
- What problem are we solving?
- Who is affected?
- What are the constraints?
- What's out of scope?

### 2. Technical Analysis
- What existing code/patterns apply?
- What components are involved?
- What are the dependencies?
- What could go wrong?
- Does this affect tax calculations?

### 3. Design Options
Present 2-3 approaches with trade-offs:

| Option | Pros | Cons |
|--------|------|------|
| A: ... | ... | ... |
| B: ... | ... | ... |

### 4. Recommendation
- Which option and why
- Implementation phases
- Risk mitigation

### 5. Deliverables
- Files to modify
- New components needed
- Tests to write
- Docs to update

## Output Format

```markdown
## Planning: [Feature Name]

### Problem
[What we're solving]

### Constraints
- [Constraint 1]
- [Constraint 2]

### Options Considered

1. **Option A**: [Description]
   - Pros: ...
   - Cons: ...

2. **Option B**: [Description]
   - Pros: ...
   - Cons: ...

### Recommendation
[Option X] because [reasoning]

### Implementation Plan
1. [ ] Step 1
2. [ ] Step 2
3. [ ] Step 3

### Files Affected
- `src/components/...`
- `src/lib/...`

### Testing Strategy
- Unit tests for: [...]
- E2E tests for: [...]

### HMRC Considerations
[If tax-related, note compliance requirements]
```

## PayeTax-Specific Considerations

### Tax Calculation Changes
- Always update `src/constants/taxRates.ts` only
- Never hardcode tax values elsewhere
- Consider all tax years (2023/24, 2024/25, 2025/26)
- Test Scottish rates separately

### Component Architecture
- Follow Atomic Design (atoms → molecules → organisms)
- Keep atoms pure (no business logic)
- Use Zustand for shared state
- Validate all inputs with Zod

### Performance
- Keep bundle under 3MB
- Use dynamic imports for heavy components
- Optimize above-fold content for LCP

## When to Use This

- Before starting a new feature
- When refactoring complex code
- When multiple approaches exist
- When changes affect tax calculations
- When changes affect multiple components
