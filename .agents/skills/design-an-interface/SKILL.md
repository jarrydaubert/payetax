---
name: design-an-interface
description: "When the user wants to design or compare API/module interfaces before implementation. Also use when discussing refactors, module boundaries, or asking for multiple design options."
metadata:
  version: 1.0.0
  source: mattpocock/skills@8e51ff7 (adapted for PayeTax)
---

# Design An Interface (PayeTax)

Design 2-4 meaningfully different interface options before implementation.

## Workflow

### 1) Gather requirements

Define:
- Problem and caller(s)
- Required operations
- Constraints (performance, compatibility, migration)
- What must stay private vs public

### 2) Produce distinct designs

Each design should include:
- Interface signature
- Example usage from caller perspective
- Internal complexity hidden behind the interface
- Trade-offs

Avoid minor variations of the same shape.

### 3) Compare designs

Evaluate by:
- Simplicity and clarity
- Correctness guarantees
- Ease of correct use vs misuse
- Extensibility without breaking callers
- Testability through public behavior

### 4) Recommend one design

Provide:
- Chosen interface and why
- What was rejected and why
- Migration approach (if replacing existing API)
- Testing strategy for the new boundary

## PayeTax Context

### High-value targets for this skill

- `src/lib/tax/` modules (director calculations)
- `src/lib/taxCalculator.ts` external-facing calculation contracts
- Validation contracts in `src/lib/validation/`
- Data/props boundaries for complex page generators (salary pages, vs pages, scenario pages)

### Constraints to enforce

- Keep tax constants in `src/constants/taxRates.ts`.
- Avoid API shapes that encourage duplicated tax logic in UI layers.
- Prefer pure, deterministic calculation interfaces for easier regression testing.
- Preserve accessibility and performance constraints for UI-facing interfaces.

### Output expectation

When used, return:
1. Candidate interfaces
2. Recommended choice
3. Files likely impacted
4. Tests to add/update with explicit bug coverage
