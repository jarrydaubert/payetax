# Linear Quick Reference Guide

> Fast reference for common Linear operations

## Quick Commands

```bash
# List all issues
npm run linear:list

# List your issues only
npm run linear:me

# Create new issue (interactive)
npm run linear:create

# Update issue status
npm run linear update-status PAYTAX-24 Done
node scripts/linear.js update-status PAYTAX-34 "In Progress"

# Update issue description
npm run linear update-description PAYTAX-84 "New description here"
node scripts/linear.js update-description PAYTAX-84 "**Markdown** supported"

# Update issue description with Linear SDK (for complex/multiline)
node -e "
const { LinearClient } = require('@linear/sdk');
const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });
(async () => {
  const issue = await linear.issue('PAYTAX-84');
  await issue.update({
    description: \`**Your multiline description**
    
    With proper formatting
    - Bullet points
    - Code blocks
    \`
  });
  console.log('✅ Updated');
})();
"

# Delete issue(s)
npm run linear:delete PAYTAX-123
node scripts/linear.js delete PAYTAX-1 PAYTAX-2 PAYTAX-3

# View projects
npm run linear:projects

# View cycles
npm run linear:cycles

# Workspace info
npm run linear:info
```

## Issue Title Prefixes

| Prefix | Use Case | Priority Default |
|--------|----------|------------------|
| `feat:` | New feature | Medium |
| `bug:` | Something broken | High |
| `content:` | Blog/docs | Medium |
| `marketing:` | Social media | Medium |
| `docs:` | Documentation | Low |
| `refactor:` | Code improvement | Low |
| `test:` | Testing | Medium |
| `devops:` | Infrastructure | High |
| `seo:` | SEO optimization | Medium |

## Priority Guide

- 🔴 **Urgent** - Blocking production, fix within 24h
- 🟠 **High** - Important work, 3-5 days
- 🟡 **Medium** - Standard work, 1-2 weeks
- 🟢 **Low** - Nice-to-have, no deadline
- ⚪ **None** - Backlog/ideas

## Common Issue Templates

### Blog Post (Quick)

```bash
npm run linear:create
# Then fill:
# Title: content: [Your Blog Title]
# Description: Blog post about [topic] targeting [audience]
# Priority: 2 (Medium)
# Assign to me: y
# Labels: Content, Blog, SEO
```

### Social Media Post (Quick)

```bash
npm run linear:create
# Then fill:
# Title: marketing: X post about [topic]
# Description: Promoting [content] on X.com, targeting [audience]
# Priority: 2 (Medium)
# Assign to me: y
# Labels: Marketing, Twitter
```

### Bug Report (Quick)

```bash
npm run linear:create
# Then fill:
# Title: bug: [Clear description]
# Description: Steps to reproduce + expected/actual behavior
# Priority: 1 (High)
# Assign to me: y
# Labels: Bug
```

## Must-Have in Every Issue

- ✅ Clear, actionable title
- ✅ Context (why it exists)
- ✅ Requirements/acceptance criteria
- ✅ Proper labels
- ✅ Priority set
- ✅ Assignee

## Labels You Should Use

**Type:** `Feature`, `Bug`, `Content`, `Marketing`, `Docs`
**Area:** `Frontend`, `Backend`, `Calculator`, `Blog`, `Analytics`
**Platform:** `Twitter/X`, `LinkedIn`, `Newsletter`

## Workflow States

| State | When to Use |
|-------|-------------|
| Backlog | Future work, not scheduled |
| Todo | Ready to start |
| In Progress | Actively working |
| In Review | PR submitted, awaiting review |
| Done | Completed and deployed |
| Canceled | Won't do |

## Quick Tips

1. **Link Related Issues** - Use issue numbers (PAYTAX-X) in descriptions
2. **Use Projects** - Group issues by initiative
3. **Use Cycles** - Plan sprints/2-week batches
4. **Update Status** - Move issues as you work
5. **Close When Done** - Don't let completed issues linger

## Full Documentation

📚 **Comprehensive Guide:** `docs/LINEAR_SOP.md`

---

**Need Help?**

Create an issue:
```bash
npm run linear:create
# Title: docs: [Your question about Linear]
```
