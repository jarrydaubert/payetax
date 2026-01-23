# Skills & Commands System

A guide to using AI-powered skills and commands for software development, auditing, and marketing.

## Overview

This project uses a **skills and commands system** that encodes domain expertise into structured markdown files. When you ask an AI assistant (Claude, Droid, etc.) to read these files, it gains specialized knowledge to perform complex tasks.

**Think of it as:**
- **Commands** = Actions you invoke (like `/audit`, `/cleanup`)
- **Skills** = Knowledge the AI reads before performing tasks

This is the same pattern used by [Vercel's agent-skills](https://github.com/vercel-labs/agent-skills), [Remotion's skills](https://skills.sh), and other tools in the emerging AI skills ecosystem.

---

## Quick Start

### Using Commands

Commands are slash-invoked actions:

```bash
/audit              # Run code quality audit
/cleanup            # Find duplicates, orphans, junk
/security           # Security review
```

If slash commands don't auto-complete, explicitly load them:

```
Read .claude/commands/audit.md, then follow those instructions
```

### Using Skills

Skills provide knowledge for specific tasks. Load them before asking:

```
Read .claude/skills/seo-audit/SKILL.md, then audit the app for SEO issues
```

Or combine multiple skills:

```
Read .claude/skills/copywriting/SKILL.md and .claude/skills/marketing-psychology/SKILL.md, 
then write homepage copy
```

---

## Directory Structure

```
.claude/
├── commands/           # Invokable actions
│   ├── audit.md
│   ├── cleanup.md
│   ├── security.md
│   └── ...
└── skills/             # Domain knowledge
    ├── seo-audit/
    │   └── SKILL.md
    ├── copywriting/
    │   └── SKILL.md
    └── ...
```

---

## Creating Commands

Commands are markdown files that instruct the AI how to perform a specific action.

### Command Template

```markdown
---
description: Short description shown in command list
argument-hint: [optional-argument]
---

# /command-name - Title

**CRITICAL INSTRUCTIONS:**
- Do NOT modify code (if read-only)
- Output findings as markdown
- Reference file locations

## Usage
\`\`\`
/command-name [target]
\`\`\`

## Checklist
- [ ] Check item 1
- [ ] Check item 2

## Output Format
| Issue | Severity | Location | Recommendation |
|-------|----------|----------|----------------|

## Key Files to Review
- `src/...`
```

### Command Best Practices

1. **Be explicit about what NOT to do** - Prevent unwanted actions
2. **Provide checklists** - Systematic coverage
3. **Define output format** - Consistent, actionable results
4. **List key files** - Guide where to look
5. **Include examples** - Show expected usage

---

## Creating Skills

Skills are knowledge documents that give the AI expertise in a domain.

### Skill Template

```markdown
---
name: skill-name
description: When to activate this skill. Include trigger words and use cases.
---

# Skill Title

You are an expert in [domain]. Your goal is to help with [objective].

## Context
[Project-specific context]

## Core Principles
1. Principle one
2. Principle two

## Detailed Knowledge
[The actual expertise - frameworks, checklists, examples]

## Output Format
[How to structure responses]

## Related Skills
- `other-skill` - For related tasks
```

### Skill Best Practices

1. **Write a good description** - Helps with auto-activation
2. **Include trigger words** - "SEO", "meta tags", "conversion", etc.
3. **Be comprehensive** - Include real expertise, not just placeholders
4. **Add examples** - Show correct patterns
5. **Cross-reference** - Link to related skills

---

## Multi-Session Workflow

For complex projects, use multiple AI sessions with different focuses:

### Hub & Spoke Pattern

```
[Audit Session]    ──reports──→ [Main Session] ──implements
[Security Session] ──reports──→ [Main Session]
[SEO Session]      ──reports──→ [Main Session]
```

**How it works:**
1. Open multiple terminal sessions
2. Each specialist session runs read-only analysis
3. Findings reported to main session
4. Main session implements all changes (has full context)

### When to Use

- **Same files affected** → Use hub & spoke (avoid conflicts)
- **Different files** → Each session can implement directly

### Example Workflow

```bash
# Terminal 1: Main (implementation)
droid
"You are the main session. Wait for audit reports."

# Terminal 2: Audit (read-only)
droid
/audit
# Copy findings to Terminal 1

# Terminal 3: Security (read-only)
droid
/security
# Copy findings to Terminal 1

# Terminal 1: Implement
"Here are the findings: [paste]. Fix them."
```

---

## Skill Categories

### Code Quality
| Skill | Purpose |
|-------|---------|
| `nextjs-best-practices` | Modern React/Next.js patterns |
| `vercel-react-best-practices` | 45 performance optimization rules |
| `accessibility` | WCAG 2.2 AA compliance |
| `performance` | Core Web Vitals, bundle optimization |

### SEO & Marketing
| Skill | Purpose |
|-------|---------|
| `seo-audit` | Technical SEO checklist |
| `schema-markup` | JSON-LD structured data |
| `programmatic-seo` | Template pages at scale |
| `content-marketing` | Blog and content strategy |

### Conversion & Copy
| Skill | Purpose |
|-------|---------|
| `page-cro` | Conversion rate optimization |
| `copywriting` | Writing marketing copy |
| `copy-editing` | Polishing existing copy |
| `marketing-psychology` | Persuasion principles |

### Design & Monetization
| Skill | Purpose |
|-------|---------|
| `ui-design` | Design system consistency |
| `pricing-strategy` | Monetization models |

---

## Common Invocations

### Code Quality
```
/audit
/cleanup
Read .claude/skills/vercel-react-best-practices/SKILL.md, audit the app
```

### Security
```
/security
/security input-validation
```

### SEO
```
Read .claude/skills/seo-audit/SKILL.md, audit the site
Read .claude/skills/schema-markup/SKILL.md, add structured data
```

### Marketing
```
Read .claude/skills/copywriting/SKILL.md, write homepage copy
Read .claude/skills/marketing-ideas/SKILL.md, suggest growth tactics
```

### Design
```
Read .claude/skills/ui-design/SKILL.md, audit for design consistency
```

---

## The Skills Ecosystem

This system is part of a growing ecosystem:

### Public Skills
- **[skills.sh](https://skills.sh)** - Skills directory
- **[vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)** - Vercel's official skills
- **[remotion-dev/skills](https://github.com/remotion-dev/skills)** - Video generation with Remotion

### Installing External Skills

```bash
# Via npx
npx skills add vercel-labs/agent-skills --skill "vercel-react-best-practices"

# Or manually copy the SKILL.md file to your .claude/skills/ directory
```

### Creating Shareable Skills

1. Create a GitHub repo with your skills
2. Structure: `skills/[skill-name]/SKILL.md`
3. Publish to skills.sh or share the repo

---

## Tips for Effective Use

### 1. Be Explicit
```
# Good
Read .claude/skills/seo-audit/SKILL.md, then audit the homepage for SEO issues

# Less effective
Check SEO
```

### 2. Combine Skills
```
Read .claude/skills/copywriting/SKILL.md and .claude/skills/marketing-psychology/SKILL.md, 
then write a landing page that converts
```

### 3. Scope the Task
```
Read .claude/skills/ui-design/SKILL.md, audit src/components/organisms/ for design consistency
```

### 4. Request Specific Output
```
Read .claude/skills/seo-audit/SKILL.md, audit the site and output findings as a markdown table
```

### 5. Iterate
Skills work best with iterative refinement:
1. Run the skill
2. Review findings
3. Ask follow-up questions
4. Implement fixes
5. Re-run to verify

---

## Troubleshooting

### Commands Not Showing in Autocomplete
- Restart the AI session
- Commands should be in `.claude/commands/`
- Try invoking directly: `/audit`
- Or load explicitly: `Read .claude/commands/audit.md, follow instructions`

### Skill Not Working
- Check file exists: `.claude/skills/[name]/SKILL.md`
- Verify frontmatter format (name, description)
- Load explicitly with full path

### AI Not Following Instructions
- Be more explicit in your request
- Reference specific sections of the skill
- Break into smaller tasks

---

## Contributing

### Adding a New Command
1. Create `.claude/commands/[name].md`
2. Follow the command template
3. Update README with new command

### Adding a New Skill
1. Create `.claude/skills/[name]/SKILL.md`
2. Follow the skill template
3. Update README with new skill

### Improving Existing Skills
- Add more examples
- Include edge cases
- Add project-specific context
- Cross-reference related skills

---

## References

- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [Factory Droid Documentation](https://docs.factory.ai)
- [Vercel Agent Skills](https://github.com/vercel-labs/agent-skills)
- [Skills.sh Directory](https://skills.sh)
