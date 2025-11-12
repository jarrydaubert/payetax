# Linear Workflow Guide for AI Agents

**Last Updated:** 2025-11-12  
**Purpose:** Practical step-by-step Linear workflow for AI agents working on PayeTax

---

## 📖 Overview

This guide provides the **practical workflow** you should follow when working with Linear tickets. It covers the common mistakes and provides clear examples based on real usage patterns.

**Quick Links:**
- Full Linear Guide: `docs/setup/LINEAR.md`
- CONTRIBUTING.md: Main contribution guidelines

---

## 1️⃣ Getting Your Issue List

### View Your Assigned Issues

```bash
# View issues assigned to you (use this daily!)
npm run linear:me
```

**What you'll see:**
```
✅ PAYTAX-113: Typography Token Migration - Done
🔄 PAYTAX-114: Spacing Token Migration - In Progress  
📋 PAYTAX-115: Color Token Migration - Todo
```

### View All Issues

```bash
# View all issues in PayeTax project
npm run linear:list

# View specific audit sub-issues (PAYTAX-108+)
npm run linear:list | grep "PAYTAX-1[0-9][0-9]"
```

---

## 2️⃣ Starting Work on an Issue

### Update Status to "In Progress"

```bash
# ALWAYS do this when you start work!
npm run linear update-status PAYTAX-114 "In Progress"
```

**Why this matters:**
- ✅ Others know you're working on it (prevents duplication)
- ✅ Shows active progress in Linear
- ✅ Good team communication

❌ **Common Mistake:** Starting work without updating status - issue stays in "Todo" even though you're actively working on it!

---

## 3️⃣ Adding Progress Updates

### Update Description with Progress

```bash
# Add progress update to description
npm run linear update-description PAYTAX-114 "
## Progress Update

**Completed:**
- ✅ Fixed 200/338 violations (59%)
- ✅ All user-facing components migrated

**In Progress:**
- 🔄 Working on organisms and molecules

**Next:**
- ⏳ Utility components and atoms
"
```

**When to update:**
- ✅ After making significant progress (e.g., 50% done)
- ✅ When you find important findings or blockers
- ✅ Before taking a break (so others know the status)

**Pro Tip:** Use markdown formatting for clarity:
- `**Bold**` for emphasis
- `- ✅` for completed items
- `- 🔄` for in-progress items
- `- ⏳` for pending items

---

## 4️⃣ Marking Issue as Done

### The Correct Order (IMPORTANT!)

```bash
# Step 1: Mark status as Done FIRST
npm run linear update-status PAYTAX-114 Done

# Step 2: THEN add completion summary
npm run linear update-description PAYTAX-114 "
✅ COMPLETE - 96% achievement (326/338 violations fixed)

**What Was Completed:**
- ALL user-facing pages migrated
- ALL core components migrated
- ALL shadcn/ui components migrated
- Pattern established codebase-wide

**Remaining:**
- 12 violations (4%) - intentional design choices
- These require additional design tokens (MB_1, PY_1, GAP_1)

**Quality Metrics:**
- 107/107 test suites passing
- Zero TypeScript errors  
- Zero build warnings
- Production build verified

**Documentation:**
- PAYTAX-114-COMPLETION-NOTES.md (comprehensive report)
- Updated PAYTAX-114-SPACING-AUDIT.md
- Updated ARCHITECTURE.md with token adoption rates

**Commits:** 37 pushed to main
"
```

### Why This Order Matters

✅ **Correct Order:**
1. Status → Done (closes the ticket)
2. Description → Completion summary (adds context)

❌ **Wrong Order:**
1. Description → Details (ticket still shows "In Progress")
2. Forget to update status (ticket never marked complete!)

---

## 5️⃣ Common Mistakes to Avoid

### ❌ Mistake #1: Wrong Command Syntax

```bash
# ❌ WRONG - These commands don't exist:
npm run linear:done PAYTAX-114
npm run linear:complete PAYTAX-114

# ✅ CORRECT:
npm run linear update-status PAYTAX-114 Done
```

### ❌ Mistake #2: Forgetting to Update Status

```bash
# ❌ WRONG - Starting work without status update:
# (Just starts coding, never updates Linear)

# ✅ CORRECT - Update immediately when starting:
npm run linear update-status PAYTAX-114 "In Progress"
# THEN start coding
```

### ❌ Mistake #3: Marking Done Without Context

```bash
# ❌ WRONG - No information about what was accomplished:
npm run linear update-status PAYTAX-114 Done
# (Issue is closed but nobody knows what was done!)

# ✅ CORRECT - Add completion summary:
npm run linear update-status PAYTAX-114 Done
npm run linear update-description PAYTAX-114 "
✅ COMPLETE - Fixed 326/338 violations
All tests passing, docs updated
See PAYTAX-114-COMPLETION-NOTES.md for details
"
```

### ❌ Mistake #4: Leaving Issues in Wrong Status

```bash
# ❌ WRONG - Issue shows "In Progress" for days after completion
# (Forgot to mark as Done)

# ✅ CORRECT - Update status when you finish:
npm run linear update-status PAYTAX-114 Done
```

---

## 6️⃣ Quick Reference Commands

### Most Used (90% of the time)

```bash
# Check your issues (daily)
npm run linear:me

# Start work
npm run linear update-status PAYTAX-X "In Progress"

# Add progress
npm run linear update-description PAYTAX-X "Progress details..."

# Mark done
npm run linear update-status PAYTAX-X Done
npm run linear update-description PAYTAX-X "✅ Complete - details..."
```

### Less Common (but useful)

```bash
# Create new issue
npm run linear:create

# View all issues
npm run linear:list

# Change priority
npm run linear update-priority PAYTAX-X 1  # High priority

# Show all commands
npm run linear
```

---

## 7️⃣ Complete Workflow Example

Here's a real workflow from PAYTAX-114 (Spacing Token Migration):

```bash
# ========================================
# MORNING: Check your issues
# ========================================
npm run linear:me
# Output: PAYTAX-114: Spacing Token Migration - Todo

# ========================================
# START WORK: Update status immediately
# ========================================
npm run linear update-status PAYTAX-114 "In Progress"

# ========================================
# WORK ON CODE (make commits, run tests)
# ========================================
# ... coding, testing, committing ...

# ========================================
# MID-DAY: Add progress update
# ========================================
npm run linear update-description PAYTAX-114 "
## Progress Update

**Completed:**
- ✅ Fixed 200/338 violations (59%)
- ✅ All user-facing pages migrated
- ✅ All shadcn/ui components migrated

**In Progress:**
- 🔄 Working on organisms (charts, forms)

**Next:**
- ⏳ Utility components and atoms
- ⏳ Final verification and docs
"

# ========================================
# CONTINUE WORKING
# ========================================
# ... more coding, more commits ...

# ========================================
# COMPLETION: Mark as Done (correct order!)
# ========================================

# Step 1: Mark status as Done
npm run linear update-status PAYTAX-114 Done

# Step 2: Add completion summary
npm run linear update-description PAYTAX-114 "
✅ COMPLETE - Outstanding 96% Achievement (326/338 violations fixed)

**What Was Completed:**
- ALL user-facing pages (Home, Calculator, Salary, etc.)
- ALL core calculator components  
- ALL shadcn/ui components (card, select, chart, dialog)
- ALL molecules & organisms
- Pattern established codebase-wide

**Remaining 12 violations (4%):**
- 7 utility components (no design tokens exist: mb-1, py-1, gap-1, etc.)
- 5 responsive wrappers (intentional design choices)

**Tokens Added:**
- MB_10, MB_12 (extra large margins)
- P_0, P_1, PX_3 (padding variants)

**Quality Metrics:**
- ✅ 107/107 test suites passing (2,463 tests)
- ✅ Zero TypeScript errors
- ✅ Zero build warnings
- ✅ Production build verified

**Documentation:**
- PAYTAX-114-COMPLETION-NOTES.md (comprehensive report)
- Updated PAYTAX-114-SPACING-AUDIT.md with completion status
- Updated ARCHITECTURE.md with token adoption rates

**Commits:** 37 pushed to main

**Recommendation:** Outstanding success - 96% completion with all critical paths migrated. Remaining 4% are intentional design choices or require additional tokens (MB_1, PY_1, GAP_1, etc.).
"

# ========================================
# DONE! ✅
# ========================================
# Issue is now marked Done with full context
```

---

## 8️⃣ Tips for AI Agents

### Always Update Status When Starting

```bash
# ✅ Do this FIRST when you start work:
npm run linear update-status PAYTAX-X "In Progress"
```

This prevents confusion and shows active work.

### Add Context in Descriptions

Use this template for completion summaries:

```markdown
✅ COMPLETE - [Brief achievement summary]

**What Was Completed:**
- [List major items]

**Remaining (if any):**
- [List what's left and why]

**Quality Metrics:**
- [Test results]
- [Error counts]
- [Build status]

**Documentation:**
- [Files created/updated]

**Commits:** [Number] pushed to main
```

### Use Markdown for Readability

- **Bold** for emphasis
- ✅ Check marks for completed
- 🔄 Progress indicators for in-progress
- ⏳ Hourglass for pending
- ❌ X mark for issues/blockers
- `code` blocks for commands

---

## 9️⃣ Troubleshooting

### "Command not found: linear"

```bash
# Check if API key is set:
echo $LINEAR_API_KEY

# If empty, set it:
export LINEAR_API_KEY="lin_api_xxx"  # Get from linear.app/settings/api
```

### "Issue not found"

```bash
# Verify issue exists:
npm run linear:list | grep PAYTAX-114

# Check if you have access to PayeTax team
npm run linear:me
```

### "Status update failed"

```bash
# Valid status values:
- "Backlog"
- "Todo"
- "In Progress"
- "In Review"
- "Done"
- "Canceled"

# Make sure to use exact casing!
npm run linear update-status PAYTAX-114 Done  # ✅ Correct
npm run linear update-status PAYTAX-114 done  # ❌ Wrong casing
```

---

## 📚 Additional Resources

- **Full Linear Guide:** `docs/setup/LINEAR.md` (comprehensive 20-minute guide)
- **CONTRIBUTING.md:** Main contribution guidelines
- **Linear Web UI:** https://linear.app/payetax/project/payetax-3073e7b6c11d/issues

---

**Questions?** Check the full Linear guide at `docs/setup/LINEAR.md` or create an issue:
```bash
npm run linear:create
# Title: docs: [Your question about Linear workflow]
```
