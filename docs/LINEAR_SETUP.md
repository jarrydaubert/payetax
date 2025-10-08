# Linear + GitLab Integration Setup Guide

This guide provides complete instructions for setting up Linear task tracking with GitLab integration for the PayeTax project.

## Prerequisites

- ✅ Linear workspace account ([linear.app](https://linear.app))
- ✅ GitLab account with access to PayeTax repository
- ✅ GitLab version 15.6 or later (publicly accessible)
- ✅ Reporter role or higher in GitLab project

## Option 1: Linear-GitLab Native Integration (Recommended)

### Step 1: Create GitLab Access Token

1. Navigate to **GitLab > User Settings > Personal Access Tokens**
2. Click **"Add new token"**
3. Configure the token:
   - **Name**: `Linear Integration`
   - **Expiration**: Set appropriate date (recommend 1 year)
   - **Scopes**:
     - ✅ `api` (full API access - required for linkbacks)
     - OR ✅ `read_api` (read-only - no linkbacks to GitLab MRs)
4. Click **"Create personal access token"**
5. **IMPORTANT**: Copy the token immediately (it won't be shown again)

**Alternative: Project Access Token**
- GitLab > Project Settings > Access Tokens
- Requires "Reporter" role or higher
- Same scope requirements as above

### Step 2: Enable Linear Integration

1. Open Linear workspace
2. Navigate to **Settings > Features > Integrations > GitLab**
3. Click **"Enable"**
4. In the setup popup:
   - **GitLab Access Token**: Paste the token from Step 1
   - **GitLab URL**: `https://gitlab.com` (or your self-hosted URL)
5. Click **"Connect"**
6. Linear will generate a **Webhook URL** - copy this for Step 3

### Step 3: Configure GitLab Webhooks

#### For All Projects (GitLab Premium/Ultimate Only)
1. Navigate to **GitLab > Group Settings > Webhooks**
2. Add new webhook:
   - **URL**: Paste Linear's webhook URL from Step 2
   - **Secret Token**: (leave empty unless specified by Linear)
   - **Trigger events**:
     - ✅ Push events
     - ✅ Comments
     - ✅ Merge request events
     - ✅ Pipeline events
   - ✅ **Enable SSL verification**
3. Click **"Add webhook"**

#### For Single Project
1. Navigate to **GitLab > Project Settings > Webhooks**
2. Follow same steps as above

### Step 4: Test the Integration

1. Create a test Linear issue (e.g., `ENG-1 Test Integration`)
2. In GitLab, create a new branch: `git checkout -b eng-1-test-integration`
3. Make a small change and commit
4. Create a Merge Request with title: `Fixes ENG-1: Test integration`
5. Verify:
   - ✅ Linear issue shows linked GitLab MR
   - ✅ GitLab MR shows Linear issue reference

## Option 2: Linear CLI Setup

### Installation

The Linear CLI has been installed globally via npm:

```bash
# Use via npx
npx @linear/cli --help

# Or use the shorthand alias
npx lin --help
```

### Available Commands

```bash
# Create new issue
npx lin new

# Checkout branch for issue
npx lin checkout <issue-id>
```

### Authentication

The CLI requires authentication on first use:

1. Run any command (e.g., `npx lin new`)
2. You'll be prompted to authenticate via browser
3. Complete OAuth flow in browser
4. Return to terminal to continue

## Linking GitLab Merge Requests to Linear Issues

### Method 1: Branch Name
Include the Linear issue ID in your branch name:
```bash
git checkout -b eng-123-implement-feature
```

### Method 2: MR Title
Include the issue ID in the MR title:
```
ENG-123: Implement new feature
```

### Method 3: Magic Words in MR Description
Use these keywords in your MR description:
```markdown
Fixes ENG-123
Closes ENG-456
Resolves ENG-789
```

### Multiple Issues
Link multiple issues in one MR:
```markdown
Fixes ENG-123, ENG-456
Closes ENG-789
```

## Automation Workflows

### Automatic Issue Status Updates

Configure Linear to automatically update issue status based on GitLab events:

1. **Draft MR Created** → Issue moves to "In Progress"
2. **MR Ready for Review** → Issue moves to "In Review"
3. **MR Merged** → Issue moves to "Done"
4. **Pipeline Failed** → Issue adds comment with failure details

### Setup Automation

1. In Linear: **Settings > Teams > [Your Team] > Workflows**
2. Configure Git triggers:
   - **Branch created** → Status: In Progress
   - **PR created** → Status: In Review
   - **PR merged** → Status: Done

## Best Practices

### Issue Naming
- Use team prefix (e.g., `ENG`, `PAYETAX`, `TAX`)
- Keep titles concise and descriptive
- Add labels for categorization (bug, feature, refactor)

### Branch Naming Convention
```bash
# Format: <issue-id>-<brief-description>
git checkout -b eng-123-fix-student-loan-calc
git checkout -b payetax-456-update-scottish-rates
```

### Merge Request Template
Create `.gitlab/merge_request_templates/Default.md`:

```markdown
## Description
<!-- Briefly describe what this MR does -->

## Related Issues
<!-- Use magic words to link Linear issues -->
Fixes

## Changes
-
-

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Documentation updated
- [ ] No linting errors
- [ ] All tests pass
```

## Troubleshooting

### Webhook Not Working
1. Verify webhook URL is correct in GitLab
2. Check SSL verification is enabled
3. Test webhook in GitLab > Settings > Webhooks > Test
4. Review webhook delivery logs for errors

### Issues Not Linking
1. Ensure issue ID is in correct format (e.g., `ENG-123`)
2. Verify issue exists in Linear
3. Check that branch name or MR title contains issue ID
4. Confirm webhook events are enabled in GitLab

### Authentication Errors
1. Verify access token has correct scopes (`api` or `read_api`)
2. Check token hasn't expired
3. Confirm user/bot has Reporter role or higher
4. Regenerate token if needed

## Linear API Keys (Alternative)

If you need programmatic access to Linear:

1. **Linear > Settings > API**
2. Click **"Create API Key"**
3. Name: `PayeTax CLI`
4. Copy key and store securely
5. Use in API requests:
```bash
curl -X POST https://api.linear.app/graphql \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

## Additional Resources

- [Linear GitLab Integration Docs](https://linear.app/docs/gitlab)
- [GitLab Linear Integration Docs](https://docs.gitlab.com/user/project/integrations/linear/)
- [Linear API Documentation](https://linear.app/developers)
- [Linear GraphQL Explorer](https://studio.apollographql.com/public/Linear-API/explorer)

## Option 3: Linear SDK + Helper Script (For Claude & Automation)

We've created a comprehensive helper script that allows both the user and Claude to interact with Linear programmatically.

### Installation Complete

- ✅ `@linear/sdk` installed as dev dependency
- ✅ Helper script created at `scripts/linear.js`
- ✅ NPM commands configured
- ⏳ Requires LINEAR_API_KEY environment variable

### Get Your API Key

1. Visit [Linear Settings > API](https://linear.app/settings/api)
2. Click **"Create key"**
3. Give it a name: `PayeTax Development`
4. Copy the key (starts with `lin_api_...`)
5. Add to your environment:

**Option A: Shell Profile (Persistent)**
```bash
# Add to ~/.zshrc or ~/.bashrc
export LINEAR_API_KEY="lin_api_xxxxxxxxxxxxxxxx"
export LINEAR_TEAM_KEY="PAYETAX"  # Optional: Your team identifier

# Reload shell
source ~/.zshrc
```

**Option B: Project .env File (Local)**
```bash
# Create .env in project root (already gitignored)
echo "LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxx" >> .env
echo "LINEAR_TEAM_KEY=PAYETAX" >> .env

# Load in terminal session
export $(cat .env | xargs)
```

### Available Commands

```bash
# View all commands
npm run linear

# List all issues/tasks
npm run linear:list

# List issues assigned to you
npm run linear:me

# Create new issue (interactive)
npm run linear:create

# Create issue with title
npm run linear create "Fix student loan calculation"

# View cycles (sprints)
npm run linear:cycles

# View projects
npm run linear:projects

# Show workspace info
npm run linear:info
```

### Interactive Workflow Examples

#### Example 1: User Creates Task, Claude Reads It
```bash
# User: Create task in Linear UI or via command
npm run linear:create
# Title: Update 2025-2026 tax rates
# Description: HMRC published new rates
# Priority: High

# Claude: Can query this task
npm run linear:list
# 📋 Found 1 issue:
# PAYETAX-123
#   Update 2025-2026 tax rates
#   Status: Todo
#   Assignee: User
#   Priority: 🟠 High
```

#### Example 2: Claude Creates Tasks from Conversation
When we discuss features or bugs, I can create tasks directly:

```bash
# From our conversation:
# User: "We need to add pension relief at source calculation"
# Claude runs:
npm run linear create "Add pension relief at source calculation" "Implement HMRC pension relief calculation for net pay arrangements"
```

#### Example 3: Sprint Planning Together
```bash
# View current sprint
npm run linear:cycles
# 📅 Cycles for PayeTax:
# ▶️ Cycle 23
#     02 Oct 2025 - 15 Oct 2025
#     Issues: 8 (3 completed, 37%)

# See what's in this cycle
npm run linear:list

# Create tasks for next cycle
npm run linear:create
```

### Claude's Task Management Workflow

#### Reading Tasks You Create
When you ask me "what's on the todo list?" or "show me current tasks", I can run:

```bash
npm run linear:list
# Or specifically yours:
npm run linear:me
```

I'll see all the details:
- Task title and description
- Current status (Todo, In Progress, Done)
- Assignee
- Priority level
- Associated cycle/sprint
- Due dates
- Linear URL for more details

#### Creating Tasks From Our Conversations
During our work, when we identify:
- **Bugs**: I can create a task immediately
- **Features**: Add to backlog with full context
- **Technical debt**: Track it properly
- **Optimizations**: Don't forget them

Example:
```bash
# User: "The Scottish tax calculation seems off"
# Claude creates:
npm run linear create "Fix Scottish tax calculation accuracy" \
  "Investigation needed: User reported incorrect calculations for £45k income"
```

#### Sprint/Cycle Management
I can help plan sprints:

```bash
# Check current cycle status
npm run linear:cycles

# See what's left this cycle
npm run linear:list

# Help prioritize next cycle:
# "Claude, what should we focus on next cycle?"
# I review: linear:list, linear:projects
# I suggest priorities based on:
# - Technical dependencies
# - Bug severity
# - Feature completion
```

#### Project Tracking
For larger initiatives:

```bash
# View all projects
npm run linear:projects
# 🎯 Projects for PayeTax:
#
# 2025-2026 Tax Year Update
#   Update all tax calculations for new year
#   Status: in_progress
#   Progress: 60% (6/10 issues)
#   Target: 31 Mar 2025
```

### Automation Possibilities

#### Git Commit Integration
When I help you with code changes, I can link commits to Linear:

```bash
git commit -m "PAYETAX-123: Fix Scottish tax bands

- Corrected Higher rate from 42% to 41%
- Updated Top rate from 47% to 46%

Fixes PAYETAX-123"
```

#### Auto-Create Tasks from Test Failures
```bash
# If tests fail, I can create issues:
npm run test || npm run linear create "Test failure: Student loan calculation" "Tests failing in taxCalculator.test.ts line 456"
```

#### Daily Standup Helper
```bash
# What did I work on yesterday?
npm run linear:me
# Filter by status: Completed

# What am I working on today?
npm run linear:me
# Filter by status: In Progress

# Any blockers?
# Check issue comments/status
```

## Team Collaboration Workflow

### Sprint Planning Process

1. **Week Before Cycle Starts**
   - User/Claude review `linear:projects` to see strategic goals
   - Run `linear:list` to see backlog
   - Prioritize items for next cycle in Linear UI
   - Assign estimates/points

2. **During Cycle**
   - Daily: Check `linear:cycles` for progress
   - Create tasks as needed: `linear:create`
   - Update status as work progresses
   - GitLab MRs auto-link via issue IDs

3. **End of Cycle**
   - Review `linear:cycles` completion rate
   - Unfinished work auto-rolls to next cycle
   - Retrospective: What went well? What to improve?

### Communication Flow

```
User: "Let's work on the pension calculator"
  ↓
Claude: [Runs linear:list]
Claude: "I see PAYETAX-45 in the current cycle. Let me check the requirements"
  ↓
[Work together on implementation]
  ↓
Claude: [Creates git branch: payetax-45-pension-calculator]
Claude: [Makes code changes]
  ↓
User: Reviews code
  ↓
[Create MR with "Fixes PAYETAX-45" in description]
  ↓
Linear automatically:
  - Links MR to issue
  - Updates issue status
  - Notifies team
```

## Advanced Features

### Custom Labels for Organization
Create labels in Linear for categorization:
- `bug` - Issues that need fixing
- `feature` - New functionality
- `tech-debt` - Refactoring/optimization
- `documentation` - Docs updates
- `testing` - Test coverage improvements

I can filter by these:
```bash
# In script, add filtering by label
# (Future enhancement)
```

### Project Milestones
Track large initiatives:
- **2025-2026 Tax Year Update** (Target: 31 Mar 2025)
- **Performance Optimization** (Target: 15 Nov 2025)
- **Blog SEO Enhancement** (Target: 30 Nov 2025)

### Estimate vs Actual Tracking
Linear supports:
- Story points
- Time estimates
- Actual time tracking

Use for sprint planning and velocity calculation.

## Current Status

- ✅ Linear SDK installed (`@linear/sdk@60.0.0`)
- ✅ Helper script created and configured
- ✅ NPM commands available
- ⏳ Requires LINEAR_API_KEY from user
- ⏳ GitLab webhook configuration (Optional 1)
- ⏳ Team/workspace setup in Linear

## Next Steps

### Immediate Setup (Required)

1. **Get API Key** (5 minutes)
   ```bash
   # Visit https://linear.app/settings/api
   # Create key → Copy → Add to environment
   export LINEAR_API_KEY="lin_api_xxx..."
   ```

2. **Test Connection** (1 minute)
   ```bash
   npm run linear:info
   # Should show your user and teams
   ```

3. **Create First Task** (2 minutes)
   ```bash
   npm run linear:create
   # Or in Linear UI
   ```

4. **Verify Claude Can Read** (1 minute)
   ```bash
   npm run linear:list
   # Should show your task
   ```

### Optional: GitLab Integration (15 minutes)

Follow **Option 1** above to set up:
- Personal access token
- Linear integration
- GitLab webhooks
- Automatic MR → Issue linking

### Team Onboarding (30 minutes)

1. Share this guide with team
2. Everyone gets API key
3. Configure team cycles in Linear
4. Set up first sprint
5. Start tracking work!

## Benefits Summary

### For You (User)
- ✅ Visual project management in Linear
- ✅ Track tasks, sprints, projects
- ✅ GitLab integration (optional)
- ✅ Mobile app for on-the-go updates
- ✅ Beautiful, fast UI

### For Claude
- ✅ Can read your tasks/priorities
- ✅ Can create tasks from conversations
- ✅ Can check sprint status
- ✅ Can suggest priorities
- ✅ Context-aware assistance

### For Both
- ✅ Single source of truth
- ✅ Async communication
- ✅ Historical tracking
- ✅ Progress visibility
- ✅ Reduced "what's next?" questions

---

**Last Updated**: 2025-10-07
**Maintained By**: PayeTax Development Team
**Linear SDK Version**: 60.0.0
**Helper Script**: scripts/linear.js
