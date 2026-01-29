# Linear Guide

> **Complete guide to Linear for PayeTax - from zero to expert**

**Time to read:** 5 min quickstart, 20 min full guide

---

## 📋 Table of Contents

**Getting Started (5 minutes):**
1. [Quick Setup](#-quick-setup-30-seconds)
2. [5 Essential Commands](#-5-essential-commands)
3. [Your First Issue](#-creating-your-first-issue)

**Daily Workflow (10 minutes):**
4. [Title Prefixes](#️-title-prefixes)
5. [Priority Levels](#-priority-levels)
6. [Workflow States](#-workflow-states)
7. [Common Patterns](#-common-patterns)

**Advanced (5 minutes):**
8. [All Commands](#-all-commands-reference)
9. [Templates](#-issue-templates)
10. [Pro Tips](#-pro-tips)

---

## 📌 Important: Project vs Team View

**✅ Always use the Project view:** https://linear.app/payetax/project/payetax-3073e7b6c11d/issues

**❌ Don't use the Team view:** https://linear.app/payetax/team/PAYTAX/active

**Why?** All issues belong to the "PayeTax" project. The team view shows ALL issues across all projects (if we had multiple), making it harder to find what you need.

**All CLI commands default to the PayeTax project** - you don't need to specify `--project PayeTax` manually!

---

## 🚀 Creating Sub-Issues (Bulk Operations)

**For audit work like PAYTAX-108 with many sub-issues:**

### Best Approach: Bash Script

Create a script like `scripts/create-audit-subissues.sh`:

```bash
#!/bin/bash
PARENT="PAYTAX-108"
PROJECT="PayeTax"

# Create issue
node scripts/linear.js create "System: Task Description"

# Link as sub-issue
node scripts/linear.js set-parent PAYTAX-XXX $PARENT

# Assign to project
node scripts/linear.js assign-to-project $PROJECT PAYTAX-XXX
```

**Run it:**
```bash
chmod +x scripts/create-audit-subissues.sh
bash scripts/create-audit-subissues.sh
```

### Commands for Sub-Issues

```bash
# Create sub-issue (method 1: after creation)
node scripts/linear.js create "Title here"
node scripts/linear.js set-parent PAYTAX-XXX PAYTAX-108

# View sub-issues
npm run linear list --project PayeTax | grep "PAYTAX-10[8-9]\|PAYTAX-1[1-9][0-9]"
```

**Pro Tip:** The `--parent` flag doesn't work reliably due to API caching. Use `set-parent` after creation instead.

---

## ⚡ Quick Setup (30 seconds)

### 1. Get Your API Key

```bash
# Visit: https://linear.app/settings/api
# Click "Create key" 
# Copy the key (starts with lin_api_...)
```

### 2. Add to Environment

```bash
# Add to ~/.zshrc or ~/.bashrc:
export LINEAR_API_KEY="lin_api_xxxxxxxxxxxxxxxx"

# Reload shell:
source ~/.zshrc
```

### 3. Test It

```bash
cd /path/to/payetax
npm run linear:me
```

✅ **You're ready!**

---

## 🎯 5 Essential Commands

**These 5 commands cover 95% of daily use:**

```bash
# 1. See YOUR issues (use this every morning!)
npm run linear:me

# 2. Create new issue (interactive - easiest way)
npm run linear:create

# 3. Update status when you start/finish work
npm run linear update-status PAYTAX-123 "In Progress"
npm run linear update-status PAYTAX-123 Done

# 4. List all issues (for overview)
npm run linear:list

# 5. Update description (add details later)
npm run linear update-description PAYTAX-123 "Added new info"
```

**That's it!** Master these 5, you're productive.

---

## 📝 Creating Your First Issue

### Interactive Mode (Recommended)

```bash
npm run linear:create
```

**You'll be prompted:**

1. **Title:** `feat: Add user profile page`
   - Use prefixes: `feat:`, `bug:`, `docs:` (see below)
   
2. **Description:** Brief explanation (can add more later)

3. **Priority:** `2` (Medium is default for most work)

4. **Assign to me?** `y` (if it's your task)

5. **Labels:** `Frontend, Feature` (optional, can skip)

**Example:**
```
Title: feat: Add dark mode toggle
Description: Users want dark mode for better readability at night
Priority: 2 (Medium)
Assign to me: y
Labels: Frontend, Feature
```

**Output:** Linear creates issue and gives you URL like:
```
✅ Created PAYTAX-91: feat: Add dark mode toggle
🔗 https://linear.app/payetax/issue/PAYTAX-91
```

### Quick Mode (No Interaction)

```bash
# Just create with title, add details later
node scripts/linear.js create "feat: Add dark mode toggle"
```

---

## 🏷️ Title Prefixes

**Always start titles with a prefix for clarity:**

| Prefix | Use For | Priority Default | Example |
|--------|---------|------------------|---------|
| `feat:` | New features | Medium | `feat: Add user dashboard` |
| `bug:` | Something broken | High | `bug: Calculator crashes on £0` |
| `docs:` | Documentation | Low | `docs: Update API guide` |
| `test:` | Add/fix tests | Medium | `test: Add calculator tests` |
| `refactor:` | Code improvements | Low | `refactor: Split large component` |
| `content:` | Blog posts, articles | Medium | `content: PAYE tax guide 2025` |
| `marketing:` | Social media | Medium | `marketing: X post about feature` |
| `seo:` | SEO optimization | Medium | `seo: Fix meta descriptions` |
| `devops:` | Infrastructure | High | `devops: Add CI/CD pipeline` |

**Good Examples:**
- ✅ `feat: Add dark mode toggle to settings`
- ✅ `bug: Calculator shows £0 for £50k salary`
- ✅ `docs: Update Linear guide with examples`
- ✅ `content: Blog post about Scottish tax rates`

**Bad Examples:**
- ❌ `New feature` (no prefix, vague)
- ❌ `Fix bug` (no context)
- ❌ `Update stuff` (what stuff?)
- ❌ `Todo` (not actionable)

---

## 📊 Priority Levels

| Priority | Symbol | When to Use | SLA | Example |
|----------|--------|-------------|-----|---------|
| **0 - Urgent** | 🔴 | Production broken, users affected | Fix in 24h | Site is down |
| **1 - High** | 🟠 | Important, do within week | 3-5 days | Major feature, critical bug |
| **2 - Medium** | 🟡 | Standard work **(DEFAULT)** | 1-2 weeks | Most features, minor bugs |
| **3 - Low** | 🟢 | Nice-to-have, no rush | No deadline | Small improvements |

**Rule of thumb:** If unsure, pick **2 (Medium)**. You can always change it later.

---

## 🔄 Workflow States

**Update status as you work to keep everyone informed:**

| State | Meaning | When to Use |
|-------|---------|-------------|
| **Backlog** | Future work | Ideas, not scheduled |
| **Todo** | Ready to start | Prioritized, all info available |
| **In Progress** | Actively working | You're coding it RIGHT NOW |
| **In Review** | Awaiting review | PR submitted, needs approval |
| **Done** | Complete ✅ | Merged, deployed, verified |
| **Canceled** | Won't do | Deprioritized or obsolete |

**How to update:**
```bash
# Starting work on issue
npm run linear update-status PAYTAX-123 "In Progress"

# Submitted PR for review
npm run linear update-status PAYTAX-123 "In Review"

# Merged and deployed
npm run linear update-status PAYTAX-123 Done
```

**⚠️ Common mistake:** Leaving issues in "In Progress" after you're done. Always update to "Done"!

---

## 🎯 Common Patterns

### Daily Morning Routine

```bash
# 1. Check your issues
npm run linear:me

# 2. Pick one, update status
npm run linear update-status PAYTAX-123 "In Progress"

# 3. Start coding!
```

### When Creating Features

```bash
# 1. Create issue
npm run linear:create
# Title: feat: Add export to PDF button
# Priority: 2 (Medium)

# 2. Start work, update status
npm run linear update-status PAYTAX-124 "In Progress"

# 3. Make commits, reference issue
git commit -m "feat: Add PDF export - PAYTAX-124"

# 4. Submit PR, update status
npm run linear update-status PAYTAX-124 "In Review"

# 5. After merge, mark done
npm run linear update-status PAYTAX-124 Done
```

### When Fixing Bugs

```bash
# 1. Create issue immediately
npm run linear:create
# Title: bug: Calculator shows wrong NI for £100k
# Priority: 1 (High)

# 2. Start work
npm run linear update-status PAYTAX-125 "In Progress"

# 3. Commit fix
git commit -m "fix: Correct NI calculation - Fixes PAYTAX-125"

# 4. Mark done
npm run linear update-status PAYTAX-125 Done
```

### Adding Details Later

```bash
# Create issue quickly
node scripts/linear.js create "feat: Add charts to dashboard"

# Later, add comprehensive description
npm run linear update-description PAYTAX-126 "
**Context:**
Users want visual representation of tax breakdown

**Requirements:**
- Pie chart for tax/NI/take-home split
- Bar chart for monthly breakdown
- Interactive tooltips

**Acceptance Criteria:**
- [ ] Charts render on dashboard
- [ ] Responsive on mobile
- [ ] Tests pass
"
```

---

## 📚 All Commands Reference

### Viewing Issues

```bash
# See issues assigned to you (in PayeTax project)
npm run linear:me

# See all issues (in PayeTax project)
npm run linear:list

# View all projects
npm run linear:projects

# View cycles/sprints
npm run linear:cycles

# View workspace info
npm run linear:info
```

**Note:** All list commands automatically filter to the PayeTax project. This is the recommended approach!

### Creating Issues

```bash
# Interactive (recommended for first time)
npm run linear:create

# Quick create with title only
node scripts/linear.js create "feat: Add feature"

# Create as sub-issue
node scripts/linear.js create "Sub-task title" --parent PAYTAX-50
```

### Updating Issues

```bash
# Update status
npm run linear update-status PAYTAX-123 Done
npm run linear update-status PAYTAX-123 "In Progress"

# Update description (simple)
npm run linear update-description PAYTAX-123 "New info here"

# Update description (multiline with markdown)
node -e "
const { LinearClient } = require('@linear/sdk');
const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });
(async () => {
  const issue = await linear.issue('PAYTAX-123');
  await issue.update({
    description: \`**Context:**
Full multiline description here

**Requirements:**
- Item 1
- Item 2
\`
  });
  console.log('✅ Updated');
})();
"

# Update priority
npm run linear update-priority PAYTAX-123 0  # Urgent
npm run linear update-priority PAYTAX-123 1  # High
npm run linear update-priority PAYTAX-123 2  # Medium
npm run linear update-priority PAYTAX-123 3  # Low

# Set parent (make sub-issue)
npm run linear set-parent PAYTAX-123 PAYTAX-50
```

### Deleting Issues

```bash
# Delete single issue
npm run linear delete PAYTAX-123

# Delete multiple issues
npm run linear delete PAYTAX-123 PAYTAX-124 PAYTAX-125
```

### Assigning to Project

```bash
# Assign issue(s) to project
npm run linear assign-to-project PayeTax PAYTAX-123
npm run linear assign-to-project PayeTax PAYTAX-123 PAYTAX-124 PAYTAX-125
```

---

## 📋 Issue Templates

### Feature Template

```markdown
Title: feat: [Feature Name]

**Context:**
Why we need this feature and what problem it solves

**Requirements:**
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

**Acceptance Criteria:**
- [ ] Feature works as described
- [ ] Unit tests pass (>80% coverage)
- [ ] E2E tests pass
- [ ] No accessibility regressions
- [ ] Documentation updated
- [ ] Merged to main

**Design:**
- Figma: [link]
- User flow: [link]

**Related Issues:**
- Depends on: PAYTAX-X
- Blocks: PAYTAX-Y
```

### Bug Template

```markdown
Title: bug: [Clear description of the bug]

**Bug Description:**
Clear description of what's broken

**Steps to Reproduce:**
1. Go to calculator page
2. Enter £50,000 salary
3. Click "Calculate"
4. See error

**Expected Behavior:**
Should display correct tax calculation

**Actual Behavior:**
Shows £0 for all values

**Environment:**
- Browser: Chrome 120
- OS: macOS 14
- Device: MacBook Pro
- URL: payetax.co.uk/calculator

**Screenshots:**
[Attach screenshot]

**Error Messages:**
```
TypeError: Cannot read property 'salary' of undefined
```

**Acceptance Criteria:**
- [ ] Bug no longer reproduces
- [ ] Regression tests added
- [ ] No new bugs introduced
```

### Blog Post Template

```markdown
Title: content: [Blog Post Title]

**Context:**
Writing a blog post about [topic] to [target audience benefit]

**Article Details:**
- **Topic:** [Main subject]
- **Target Audience:** [Who this is for]
- **Keywords:** [Primary SEO keywords]
- **Word Count:** 1000-1500 words
- **Tone:** Professional/Friendly

**Requirements:**
- [ ] Research topic and gather data
- [ ] Write first draft
- [ ] Add relevant examples/screenshots
- [ ] SEO optimization (meta, headings, keywords)
- [ ] Internal linking to related content
- [ ] Proofread and edit
- [ ] Create featured image
- [ ] Publish to website

**Distribution:**
- [ ] Create X/Twitter thread
- [ ] Post on LinkedIn
- [ ] Send in newsletter (if applicable)

**Resources:**
- Content calendar: [link]
- SEO guidelines: CONTRIBUTING.md
```

---

## 💡 Pro Tips

### 1. Link Issues in Commits

```bash
# Linear auto-links commits to issues
git commit -m "feat: Add feature - PAYTAX-123"
git commit -m "fix: Bug fix - Fixes PAYTAX-124"
git commit -m "docs: Update guide - Closes PAYTAX-125"
```

### 2. Cross-Reference Issues

```markdown
# In issue descriptions, reference other issues
Related to PAYTAX-50
Depends on PAYTAX-51
Blocks PAYTAX-52
```

### 3. Use Projects for Grouping

```bash
# Group related issues under a project
npm run linear assign-to-project "Blog Content Q4 2025" PAYTAX-100 PAYTAX-101
```

### 4. Batch Status Updates

```bash
# Update multiple issues at once with a script
for issue in PAYTAX-100 PAYTAX-101 PAYTAX-102; do
  npm run linear update-status $issue Done
done
```

### 5. Check Status Before Meetings

```bash
# Quick overview before standup
npm run linear:me
```

### 6. Add Labels for Organization

When creating issues, use labels:
- **Type:** Feature, Bug, Content, Docs
- **Area:** Frontend, Backend, Calculator, Blog
- **Platform:** Twitter/X, LinkedIn, Newsletter

### 7. Set Due Dates for Time-Sensitive Work

For urgent issues or deadlines, set due dates in Linear web UI.

---

## ⚠️ Common Mistakes to Avoid

| Mistake | Why It's Bad | Do This Instead |
|---------|--------------|-----------------|
| Vague titles: "Fix bug" | No one knows what it's about | `bug: Calculator crashes with £0 input` |
| No status updates | Issue stuck in "Todo" for weeks | Update when starting and finishing |
| No assignee | Nobody knows who's responsible | Assign to yourself or team member |
| No description | Just a title, no context | Add why, what, how |
| Forgetting to close | Clutter in "In Progress" | Mark Done when finished |
| Not linking commits | Can't track what code fixed what | Use `PAYTAX-X` in commit messages |
| Creating duplicates | Multiple issues for same work | Search first, link related |
| Wrong priority | Everything is "Urgent" | Be realistic, use Medium as default |

---

## 🆘 Troubleshooting

### API Key Issues

```bash
# Check if API key is set
echo $LINEAR_API_KEY

# Should output: lin_api_xxxxxxxxx
# If empty, go back to Quick Setup section
```

### Command Not Found

```bash
# Make sure you're in the project directory
cd /path/to/payetax

# Check npm scripts exist
npm run | grep linear
```

### Permission Errors

```bash
# Check you have access to PayeTax team in Linear
npm run linear:info

# Should show team details
# If error, verify your Linear account has access
```

### Issue Not Found

```bash
# Verify issue exists and you have access
npm run linear:list | grep PAYTAX-123
```

---

## 🎓 What's Next?

**You now know everything about Linear!**

**For deeper project context:**
- 📖 [CONTRIBUTING.md](../../CONTRIBUTING.md) - Development workflow
- 🏗️ [ARCHITECTURE.md](../guides/ARCHITECTURE.md) - Codebase structure
- 🧪 [QUALITY_GATES.md](./QUALITY_GATES.md) - Testing standards

**Questions?** Create an issue:
```bash
npm run linear:create
# Title: docs: [Your question about Linear]
```

---

**Quick Reference Card:**

```bash
# Your 5 daily commands:
npm run linear:me                           # See my issues
npm run linear:create                       # Create issue
npm run linear update-status PAYTAX-X Done  # Update status  
npm run linear:list                         # List all
npm run linear update-description PAYTAX-X  # Add details

# That's 95% of what you need! 🚀
```
