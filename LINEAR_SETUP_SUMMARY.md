# Linear Integration & SOP Setup Summary

**Date:** January 2025
**Status:** ✅ Complete

---

## 🎉 What We Accomplished

### 1. ✅ Fixed Linear API Integration

**Problem:** `.env.local` had incorrect environment variable name
- Had: `LINEAR_TEAM_KEY=lin_api_...` (wrong!)
- Fixed: `LINEAR_API_KEY=lin_api_...` (correct!)

**Result:** Full read/write access to Linear workspace verified

### 2. 🛠️ Enhanced Linear CLI Script

**Location:** `scripts/linear.js`

**Added Features:**
- ✅ Delete functionality for single issues
- ✅ Batch delete for multiple issues
- ✅ Fixed log function (was empty, now shows colored output)
- ✅ Export new functions for programmatic use

**New Commands:**
```bash
# Delete single issue
npm run linear:delete PAYTAX-123

# Delete multiple issues
node scripts/linear.js delete PAYTAX-1 PAYTAX-2 PAYTAX-3
```

### 3. 📚 Created Comprehensive Documentation

#### A. **LINEAR_SOP.md** (~30KB) - Complete Best Practices Guide

**Sections:**
- ✅ Overview & Core Principles
- ✅ Issue Management Structure
- ✅ Issue Types & Priority Levels
- ✅ Best Practices (titles, descriptions, labels)
- ✅ Detailed Templates:
  - Blog Post Issue Template
  - Social Media Post Template
  - Feature Development Template
  - Bug Fix Template
- ✅ Workflows (Content Creation, Feature Development)
- ✅ Labels & Organization System
- ✅ CLI Tools Documentation
- ✅ Automation Ideas
- ✅ Metrics & Analytics
- ✅ Common Scenarios with Examples

#### B. **LINEAR_QUICK_REFERENCE.md** (~3KB) - Fast Reference

**Contents:**
- ✅ Quick commands cheat sheet
- ✅ Issue title prefixes table
- ✅ Priority guide
- ✅ Common issue templates (quick create)
- ✅ Must-haves checklist
- ✅ Labels reference
- ✅ Workflow states

### 4. 🧹 Cleaned Up Linear Workspace

**Deleted:**
- PAYTAX-1: Get familiar with Linear (onboarding)
- PAYTAX-2: Set up your teams (onboarding)
- PAYTAX-3: Connect your tools (onboarding)
- PAYTAX-4: Import your data (onboarding)
- PAYTAX-5: Test (test issue)
- PAYTAX-6: Test issue from Factory AI (test issue)

**Result:** Clean slate with proper issue structure

### 5. ✨ Created Two New Properly-Structured Issues

#### **PAYTAX-7: Blog Post**
```
Title: content: How to Maximize Your PAYE Tax Deductions in 2025
Priority: Medium
Assignee: jarryd@payetax.co.uk
Labels: Content, Blog, SEO (recommended)

Includes:
- Full context and article details
- Research requirements
- SEO checklist
- Distribution plan
- Acceptance criteria
```

**URL:** https://linear.app/payetax/issue/PAYTAX-7

#### **PAYTAX-8: Social Media Promotion**
```
Title: marketing: Create X.com thread about PAYE tax deductions blog post
Priority: Medium
Assignee: jarryd@payetax.co.uk
Labels: Marketing, Twitter/X (recommended)
Parent: PAYTAX-7

Includes:
- Complete draft thread (5 tweets)
- UTM tracking parameters
- Hashtag strategy
- Visual guidelines
- Distribution checklist
- Analytics tracking plan
```

**URL:** https://linear.app/payetax/issue/PAYTAX-8

### 6. 📦 Updated Package Configuration

**File:** `package.json`

**Added Script:**
```json
"linear:delete": "node scripts/linear.js delete"
```

### 7. 📖 Updated Documentation Index

**File:** `docs/README.md`

**Added:**
- Link to LINEAR_SOP.md (starred as important)
- Link to LINEAR_QUICK_REFERENCE.md
- Updated quick links table
- Updated setup section with new docs

---

## 🚀 How to Use the New System

### Creating a Blog Post Issue

**Option 1: Interactive (Recommended for First Time)**
```bash
npm run linear:create

# Fill in:
Title: content: [Your Blog Title]
Description: [Paste template from LINEAR_SOP.md]
Priority: 2 (Medium)
Assign to me: y
Labels: Content, Blog, SEO
```

**Option 2: Quick Create**
```bash
node scripts/linear.js create "content: Your Blog Title" "Quick description" --me
```

### Creating Social Media Promotion

```bash
npm run linear:create

# Fill in:
Title: marketing: X post about [blog topic]
Description: [Use Social Media Post Template]
Priority: 2
Assign to me: y
Labels: Marketing, Twitter/X
```

### Managing Issues

```bash
# List all issues
npm run linear:list

# List your issues
npm run linear:me

# View projects
npm run linear:projects

# Delete old/obsolete issues
npm run linear:delete PAYTAX-123
```

---

## 📋 Best Practices Summary

### Every Issue Should Have:

1. ✅ **Clear Title** with type prefix (`feat:`, `bug:`, `content:`, `marketing:`)
2. ✅ **Detailed Description** with context, requirements, acceptance criteria
3. ✅ **Proper Labels** (Type + Area + Platform)
4. ✅ **Priority Set** (Urgent/High/Medium/Low/None)
5. ✅ **Assignee** (who's responsible)
6. ✅ **Resources** (links to related issues, docs, designs)
7. ✅ **Due Date** (if time-sensitive)

### Recommended Labels to Set Up

**Type Labels:**
- Feature, Bug, Content, Marketing, Docs, Refactor, Test, DevOps, SEO, Analytics

**Area Labels:**
- Frontend, Backend, Calculator, Blog, Infrastructure

**Platform Labels:**
- Twitter/X, LinkedIn, Blog, Newsletter

---

## 📊 Current State

### Linear Workspace: PayeTax

- **Team:** PAYTAX
- **Active Issues:** 2
  - PAYTAX-7: Blog post about PAYE deductions
  - PAYTAX-8: X.com promotion of blog post
- **Projects:** 1 (PayeTax - backlog)
- **Cycles:** Not configured yet (optional)

### Files Changed

```
Modified:
✅ .env.local (fixed LINEAR_API_KEY)
✅ scripts/linear.js (added delete, fixed logging)
✅ package.json (added linear:delete script)
✅ docs/README.md (added Linear SOP references)

Created:
✨ docs/LINEAR_SOP.md (comprehensive guide)
✨ docs/LINEAR_QUICK_REFERENCE.md (quick reference)
✨ LINEAR_SETUP_SUMMARY.md (this file)
```

---

## 🎯 Next Steps

1. **Review the SOP** - Read `docs/LINEAR_SOP.md` in full
2. **Set Up Labels** - Create recommended labels in Linear UI
3. **Configure Cycles** (Optional) - Set up 2-week sprints if desired
4. **Create Templates** - Save issue templates in Linear for quick use
5. **Start Using** - Follow the workflows for new content/features

---

## 🔗 Quick Links

- **Linear Workspace:** https://linear.app/payetax
- **Comprehensive SOP:** `docs/LINEAR_SOP.md`
- **Quick Reference:** `docs/LINEAR_QUICK_REFERENCE.md`
- **CLI Script:** `scripts/linear.js`
- **Current Issues:** 
  - Blog Post: https://linear.app/payetax/issue/PAYTAX-7
  - X Post: https://linear.app/payetax/issue/PAYTAX-8

---

## 💡 Pro Tips

1. **Use Templates** - Copy/paste templates from LINEAR_SOP.md to ensure consistency
2. **Link Everything** - Connect blog posts to their social promotion issues
3. **Track Analytics** - Document results in the issue before closing
4. **Batch Similar Work** - Create all social posts for a blog at once
5. **Review Weekly** - Check backlog, update priorities, close completed issues
6. **Automate Recurring** - Script monthly/weekly recurring tasks

---

## ✅ Verification Checklist

- [x] Linear API connection working
- [x] Can read issues from Linear
- [x] Can create issues in Linear
- [x] Can delete issues from Linear
- [x] CLI commands functional
- [x] Comprehensive SOP documented
- [x] Quick reference created
- [x] Issue templates ready to use
- [x] Example issues created
- [x] Documentation updated
- [x] Package scripts added

---

**Status:** All systems operational! 🚀

**Ready to maximize Linear for the PayeTax project!**
