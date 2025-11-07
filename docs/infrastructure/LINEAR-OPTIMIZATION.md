# Linear API Optimization for Free Tier

**Date:** 2025-11-07  
**Issue:** Be mindful of Linear free tier API limits  
**Solution:** Streamline to essential commands only

---

## 📊 Linear Free Tier Limits

### API Rate Limits
- **Rate limit:** 2,000 requests per hour
- **Burst limit:** 50 requests per second
- **Typical CLI usage:** 2-5 requests per command

### Free Tier Features (Unlimited Users)
- ✅ Unlimited issues
- ✅ Unlimited projects
- ✅ Full API access
- ✅ Unlimited teams

**Bottom line:** Free tier is generous for CLI usage. We're unlikely to hit limits with normal use.

---

## 🎯 Optimization Strategy

### Current Commands (8 shortcuts)
```json
"linear:list":     "list --project PayeTax",
"linear:me":       "list --me --project PayeTax",
"linear:create":   "create",
"linear:delete":   "delete",
"linear:assign":   "assign-to-project",
"linear:cycles":   "cycles",
"linear:projects": "projects",
"linear:info":     "info"
```

### Optimized Commands (4 essential)

**Keep:**
1. ✅ `linear:me` - View your assigned issues (daily use)
2. ✅ `linear:create` - Create new issues/sub-issues
3. ✅ `linear update-status` - Mark as Done (frequent)
4. ✅ `linear update-description` - Edit issue details

**Remove from shortcuts:**
- ❌ `linear:list` - Use `:me` instead (more focused)
- ❌ `linear:delete` - Rarely needed, use full command
- ❌ `linear:assign` - Rarely needed, use full command
- ❌ `linear:cycles` - Rarely needed
- ❌ `linear:projects` - Rarely needed
- ❌ `linear:info` - One-time setup

---

## 📝 Simplified Workflow

### Daily Use (< 10 API requests/day)

**Morning:**
```bash
npm run linear:me
# Shows your assigned issues (2-3 API requests)
```

**During work:**
```bash
# Mark issue as done
npm run linear done PAYTAX-80
# Or: npm run linear update-status PAYTAX-80 Done
# (1 API request)
```

**When needed:**
```bash
# Create new issue
npm run linear:create
# Interactive prompts (1-2 API requests)

# Create sub-issue
npm run linear create "Sub-task title" --parent PAYTAX-80
# (2 API requests)
```

### Monthly Estimate
- Daily `:me` checks: **30 days × 3 requests = 90 requests**
- Status updates: **20 updates × 1 request = 20 requests**
- Creating issues: **10 issues × 2 requests = 20 requests**
- **Total: ~130 requests/month** ✅

**2,000/hour limit = 48,000/day = 1.4M/month**  
**We'll use 0.01% of the limit!** 🎉

---

## 🔧 Optimized package.json

### New Scripts Section
```json
"scripts": {
  "linear": "node scripts/linear.js",
  "linear:me": "node scripts/linear.js list --me --project PayeTax",
  "linear:create": "node scripts/linear.js create",
  "linear:done": "node scripts/linear.js update-status"
}
```

### Full Commands (when needed)
```bash
# View all issues
npm run linear list --project PayeTax

# Delete issue
npm run linear delete PAYTAX-123

# Assign to project
npm run linear assign-to-project PayeTax PAYTAX-123

# Update description
npm run linear update-description PAYTAX-123 "New description"

# Create sub-issue
npm run linear create "Title" --parent PAYTAX-123

# Set priority
npm run linear update-priority PAYTAX-123 1

# View projects
npm run linear projects

# View cycles
npm run linear cycles

# View workspace info
npm run linear info
```

---

## 📖 Updated CONTRIBUTING.md Section

### Linear Quick Reference (30 seconds)

**Daily commands:**
```bash
# View your issues
npm run linear:me

# Mark issue done
npm run linear done PAYTAX-123 Done

# Create new issue
npm run linear:create
```

**All commands available:**
```bash
npm run linear
# Shows full help
```

**That's it!** Keep it simple.

---

## 🎯 Benefits

| Aspect | Before | After | Impact |
|--------|--------|-------|--------|
| **Shortcuts** | 8 commands | 3 commands | Clearer, less overwhelming |
| **Docs** | Complex guide | 3-line quickstart | Easier onboarding |
| **API usage** | Same | Same | No change (already efficient) |
| **Functionality** | Full | Full | Nothing lost (full commands available) |

---

## 🔄 Migration

### Update package.json
```bash
# Remove unnecessary shortcuts
- "linear:list"
- "linear:delete"
- "linear:assign"
- "linear:cycles"
- "linear:projects"
- "linear:info"

# Keep essentials
✅ "linear:me"
✅ "linear:create"

# Add new shortcut
+ "linear:done" (for update-status)
```

### Update CONTRIBUTING.md
- Replace verbose Linear section with 3-command quickstart
- Move full docs to scripts/linear.js help (already there)
- Add "npm run linear" to show all options

---

## 📊 API Request Breakdown

### Per Command Costs

| Command | API Requests | Frequency | Monthly Cost |
|---------|--------------|-----------|--------------|
| `linear:me` | 2-3 | 1x/day | 60-90 |
| `update-status` | 1 | 20x/month | 20 |
| `create` | 1-2 | 10x/month | 10-20 |
| **Total** | | | **90-130** |

**% of limit:** 90-130 / 1,440,000 (monthly) = **0.006-0.009%** ✅

---

## ✅ Conclusion

**Linear API limits are not a concern for our usage.**

**Real optimization:** Simplify UX, not API calls.

**Actions:**
1. ✅ Remove 5 shortcut commands
2. ✅ Keep 3 essential shortcuts
3. ✅ Simplify CONTRIBUTING.md docs
4. ✅ Full functionality still available via `npm run linear`

**Result:** Cleaner, simpler, easier to use. Same functionality, same API usage.

---

**Status:** ✅ Ready to implement  
**Risk:** Zero (no functionality removed)  
**Time:** 15 minutes
