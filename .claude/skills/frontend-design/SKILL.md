---
name: frontend-design
description: When the user wants to design or redesign a page, component, landing page, dashboard, or visual system and the quality of the UI direction matters. Also use when the user mentions "frontend design," "make this look better," "UI polish," "visual redesign," "landing page design," "dashboard design," "marketing page," "avoid generic AI design," "make this feel premium," or "give this a stronger visual identity." Use this whenever the task needs intentional, non-generic interface design plus implementation guidance.
metadata:
  version: 1.0.0
  source: anthropics/skills frontend-design (adapted for PayeTax)
---

# Frontend Design (PayeTax)

Design and implement UI that feels deliberate, distinct, and production-ready.

## Workflow

### 1) Read the room before designing

Check:
- is this an existing shipped surface or a net-new surface?
- is there an established visual language to preserve?
- what user task matters most on this screen?
- what accessibility or performance constraints are non-negotiable?

If the repo already has a clear pattern, evolve it instead of replacing it with an unrelated art direction.

### 2) Choose a strong direction

Avoid safe, generic layouts.

Make explicit choices for:
- typography
- spacing rhythm
- color system
- hierarchy
- imagery/illustration treatment if relevant
- motion strategy

Prefer one coherent direction over a pile of small decorative effects.

### 3) Design in code

When implementing:
- use the repo's existing component and token patterns first
- define reusable CSS variables or tokens when adding a new visual direction
- keep layouts responsive from the start
- make hover/focus/pressed states intentional
- use animation sparingly and only where it improves comprehension or perceived quality

### 4) Preserve usability

Do not trade clarity for style.

Always protect:
- readable contrast
- obvious interactive affordances
- keyboard navigation
- sensible reduced-motion behavior
- mobile usability
- fast initial render on important routes

### 5) Explain the design choices

When presenting work, state:
- the visual direction chosen
- why it fits the screen's job
- what was changed structurally vs cosmetically
- any accessibility or performance tradeoffs

## Design Heuristics

### Typography

- Prefer expressive type choices over default system-looking UI.
- Use size, weight, and spacing to create hierarchy before adding decoration.
- Keep dense calculator and results views highly legible.

### Color and Surfaces

- Start with a deliberate palette rather than arbitrary utility classes.
- Use contrast to guide attention to the primary action and critical outputs.
- Build depth with gradients, borders, texture, or layered surfaces where appropriate.

### Layout

- Use composition to create momentum: asymmetry, framing, and grouped content can all help.
- Do not let every page collapse into the same hero-card-grid pattern.
- Give key content enough space to feel intentional.

### Motion

- Favor a few meaningful transitions over constant animation.
- Use motion to reveal hierarchy, soften state changes, or help orientation.
- Respect `prefers-reduced-motion`.

## PayeTax Context

### What applies here

- Marketing pages can be more visually assertive than the calculator core.
- Calculator, results, and Director Intelligence surfaces should prioritize trust, scannability, and numerical clarity.
- The current stack already supports modern UI work: Next.js, React, Tailwind CSS 4, `framer-motion`, `next/font`, and shared animation/design tokens.

### Existing repo patterns to respect

- Fonts are configured in `src/app/fonts.google.ts` and `src/app/fonts.ts`.
- Global styling lives in `src/app/globals.css`.
- Shared motion primitives live in `src/constants/animationTokens.ts`.
- Shared design tokens live in `src/constants/designTokens.ts`.
- Reuse existing Radix/shadcn-style component patterns before inventing new primitives.

### Constraints to enforce

- Preserve the existing PayeTax visual language unless the task explicitly calls for a redesign.
- Do not hardcode tax figures, product claims, or rollout status into UI copy.
- Maintain WCAG 2.2 AA expectations and use the `accessibility` skill when the task includes audits or remediation.
- Keep calculator-critical paths light enough to avoid obvious regressions in Core Web Vitals.
- Prefer server-first rendering where possible; do not add client-side complexity just for presentation.

### Good fit examples

- redesign the homepage hero with a stronger visual identity
- improve a calculator results section so it feels clearer and more premium
- create a more intentional landing page for a new tool or campaign
- refine mobile spacing, typography, and states on an existing flow

### When to use another skill as well

- use `accessibility` for WCAG audits or detailed remediation
- use `copywriting` when the main problem is messaging, not layout or visuals
- use `page-cro` when the primary goal is conversion diagnosis and experiment ideas
- use `engineering` when performance or framework tradeoffs dominate the task

## Output Expectation

When used, provide:
1. the chosen visual direction
2. the key structural/UI changes
3. the implementation approach in this repo
4. accessibility and performance checks that must not regress
