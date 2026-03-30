#!/usr/bin/env node
// scripts/linear.js - Linear API Helper for PayeTax Project Management

const { LinearClient } = require('@linear/sdk');
const readline = require('node:readline');
const fs = require('node:fs/promises');
const path = require('node:path');

// Configuration
const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const TEAM_KEY = process.env.LINEAR_TEAM_KEY || 'PAYTAX'; // Team identifier
const BACKLOG_PATH = path.resolve(process.cwd(), 'docs/BACKLOG.md');

if (!LINEAR_API_KEY) {
  console.error('❌ Error: LINEAR_API_KEY environment variable not set');
  console.error('');
  console.error('To get your API key:');
  console.error('1. Visit https://linear.app/settings/api');
  console.error('2. Click "Create key"');
  console.error('3. Copy the key');
  console.error('4. Add to your shell profile:');
  console.error('   export LINEAR_API_KEY="lin_api_xxxxxxxxxxxxxxxx"');
  console.error('');
  console.error('Or create a .env file in the project root:');
  console.error('   LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxx');
  process.exit(1);
}

// Initialize Linear client
const linear = new LinearClient({ apiKey: LINEAR_API_KEY });

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

// Helper functions
function log(message, color = 'reset') {
  const colorCode = colors[color] || colors.reset;
  console.log(`${colorCode}${message}${colors.reset}`);
}

function formatDate(dateString) {
  if (!dateString) return 'No date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatPriority(priority) {
  const priorities = {
    0: '🔴 Urgent',
    1: '🟠 High',
    2: '🟡 Medium',
    3: '🟢 Low',
    4: '⚪ None',
  };
  return priorities[priority] || '⚪ None';
}

function extractBacklogIds(text) {
  return [...new Set((text.match(/\bP\d+-\d+\b/g) || []).map((id) => id.trim()))];
}

function parseBacklogItems(markdown) {
  const items = [];
  const lines = markdown.split('\n');
  let section = null;

  for (const line of lines) {
    const sectionMatch = line.match(/^##\s+(P\d+)\b/);
    if (sectionMatch) {
      section = sectionMatch[1];
      continue;
    }

    const rowMatch = line.match(/^\|\s*`(P\d+-\d+)`\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|$/);
    if (!rowMatch) {
      continue;
    }

    items.push({
      id: rowMatch[1],
      workItem: rowMatch[2],
      nextStep: rowMatch[3],
      doneWhen: rowMatch[4],
      section,
    });
  }

  return items;
}

async function readBacklogItems() {
  const content = await fs.readFile(BACKLOG_PATH, 'utf8');
  return parseBacklogItems(content);
}

function normalizeStateName(state) {
  return state?.name?.toLowerCase() || '';
}

function isDoneLikeState(state) {
  const name = normalizeStateName(state);
  return name.includes('done') || name.includes('complete') || name.includes('cancel');
}

async function getTeam() {
  const me = await linear.viewer;
  const teams = await me.teams();
  return teams.nodes.find((team) => team.key === TEAM_KEY);
}

async function fetchTeamIssues() {
  return linear.issues({
    filter: {
      team: { key: { eq: TEAM_KEY } },
    },
  });
}

async function collectIssueMeta(issues) {
  const metas = [];
  for (const issue of issues.nodes) {
    const state = await issue.state;
    const project = await issue.project;
    const labels = await issue.labels();
    const textToScan = [issue.title || '', issue.description || ''].join('\n');

    metas.push({
      id: issue.identifier,
      title: issue.title,
      description: issue.description || '',
      stateName: state?.name || 'Unknown',
      isDoneLike: isDoneLikeState(state),
      projectName: project?.name || null,
      priority: issue.priority,
      url: issue.url,
      backlogRefs: extractBacklogIds(textToScan),
      labels: (labels?.nodes || []).map((label) => label.name),
    });
  }
  return metas;
}

function sectionHasChecklist(description, sectionTitle) {
  if (!description) {
    return false;
  }

  const escapedTitle = sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sectionRegex = new RegExp(`##\\s+${escapedTitle}\\s*\\n([\\s\\S]*?)(\\n##\\s+|$)`, 'i');
  const match = description.match(sectionRegex);
  if (!match) {
    return false;
  }

  return /-\s*\[\s*[xX ]\s*\]/.test(match[1]);
}

/**
 * Validate Ready-state issues against Definition of Ready fields in issue content.
 */
async function enforceDoR(options = {}) {
  try {
    log('\n🛡️ Enforcing Definition of Ready checks...', 'cyan');

    const targetState = (options.stateName || 'Ready').toLowerCase();
    const issues = await fetchTeamIssues();
    const issueMeta = await collectIssueMeta(issues);

    const readyIssues = issueMeta.filter(
      (meta) => normalizeStateName({ name: meta.stateName }) === targetState,
    );

    if (readyIssues.length === 0) {
      log(`✅ No issues currently in "${options.stateName || 'Ready'}" state.`, 'green');
      return { ok: true, violations: [] };
    }

    const violations = [];

    for (const issue of readyIssues) {
      const missing = [];

      if (issue.backlogRefs.length === 0) {
        missing.push('Backlog ID reference (e.g. P0-5) in title/description');
      }

      if (!sectionHasChecklist(issue.description, 'Acceptance Criteria')) {
        missing.push('Acceptance Criteria checklist section');
      }

      if (!sectionHasChecklist(issue.description, 'Test Plan')) {
        missing.push('Test Plan checklist section');
      } else if (!/\bbug\b/i.test(issue.description)) {
        missing.push('explicit bug intent in Test Plan');
      }

      if (missing.length > 0) {
        violations.push({ issue, missing });
      }
    }

    if (violations.length === 0) {
      log(
        `✅ All ${readyIssues.length} "${options.stateName || 'Ready'}" issues satisfy DoR checks.`,
        'green',
      );
      return { ok: true, violations: [] };
    }

    log(`\n❌ DoR violations found (${violations.length} issue(s))`, 'red');
    for (const violation of violations) {
      log(`  - ${violation.issue.id}: ${violation.issue.title}`, 'bright');
      log(`    Missing: ${violation.missing.join(' | ')}`, 'yellow');
      log(`    URL: ${violation.issue.url}`, 'blue');
    }

    if (options.strict) {
      process.exitCode = 1;
    }

    return { ok: false, violations };
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    console.error(error);
    if (options.strict) {
      process.exitCode = 1;
    }
    return { ok: false, error };
  }
}

/**
 * Report done issues that still map to active backlog IDs (burn-down hygiene).
 */
async function burnDownCleanup(options = {}) {
  try {
    log('\n🧹 Running burn-down cleanup checks...', 'cyan');

    const backlogItems = await readBacklogItems();
    const activeBacklogIds = new Set(backlogItems.map((item) => item.id));
    const backlogById = new Map(backlogItems.map((item) => [item.id, item]));

    const issues = await fetchTeamIssues();
    const issueMeta = await collectIssueMeta(issues);

    const staleDoneIssues = [];
    const linkedByBacklogId = new Map();

    for (const issue of issueMeta) {
      for (const ref of issue.backlogRefs) {
        if (!linkedByBacklogId.has(ref)) {
          linkedByBacklogId.set(ref, []);
        }
        linkedByBacklogId.get(ref).push(issue);
      }

      if (!issue.isDoneLike) {
        continue;
      }

      const stillActiveRefs = issue.backlogRefs.filter((ref) => activeBacklogIds.has(ref));
      if (stillActiveRefs.length > 0) {
        staleDoneIssues.push({ issue, stillActiveRefs });
      }
    }

    const readyToRemove = [];
    for (const item of backlogItems) {
      const linkedIssues = linkedByBacklogId.get(item.id) || [];
      if (linkedIssues.length === 0) {
        continue;
      }

      const allDone = linkedIssues.every((issue) => issue.isDoneLike);
      if (allDone) {
        readyToRemove.push({ item, linkedIssues });
      }
    }

    if (staleDoneIssues.length === 0 && readyToRemove.length === 0) {
      log('✅ No burn-down cleanup issues detected.', 'green');
      return { ok: true, staleDoneIssues: [], readyToRemove: [] };
    }

    if (staleDoneIssues.length > 0) {
      log(
        `\n⚠️ Done issues still linked to active backlog IDs (${staleDoneIssues.length}):`,
        'yellow',
      );
      for (const entry of staleDoneIssues) {
        log(`  - ${entry.issue.id}: ${entry.issue.title}`, 'bright');
        log(`    Active backlog refs: ${entry.stillActiveRefs.join(', ')}`, 'dim');
        log(`    URL: ${entry.issue.url}`, 'blue');
      }
    }

    if (readyToRemove.length > 0) {
      log(
        `\n📌 Backlog items that appear completed and removable (${readyToRemove.length}):`,
        'cyan',
      );
      for (const entry of readyToRemove) {
        const issueIds = entry.linkedIssues.map((issue) => issue.id).join(', ');
        log(
          `  - ${entry.item.id}: ${backlogById.get(entry.item.id)?.workItem || 'Unknown item'}`,
          'bright',
        );
        log(`    Linked done issues: ${issueIds}`, 'dim');
      }
    }

    if ((staleDoneIssues.length > 0 || readyToRemove.length > 0) && options.strict) {
      process.exitCode = 1;
    }

    return { ok: false, staleDoneIssues, readyToRemove };
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    console.error(error);
    if (options.strict) {
      process.exitCode = 1;
    }
    return { ok: false, error };
  }
}

/**
 * Run all Kanban hygiene checks in one command.
 */
async function kanbanCheck(options = {}) {
  log('\n🧪 Running Kanban hygiene check suite...', 'cyan');
  const strict = Boolean(options.strict);
  const stateName = options.stateName || 'Ready';

  const syncResult = await syncBacklog({ strict: false });
  const blockersResult = await listReleaseBlockers({ strict: false });
  const dorResult = await enforceDoR({ strict: false, stateName });
  const cleanupResult = await burnDownCleanup({ strict: false });

  const hasProblems = [
    !syncResult?.ok,
    !blockersResult?.ok,
    !dorResult?.ok,
    !cleanupResult?.ok,
  ].some(Boolean);

  if (hasProblems) {
    log('\n❌ Kanban check suite found issues. Review sections above.', 'red');
    if (strict) {
      process.exitCode = 1;
    }
    return { ok: false, syncResult, blockersResult, dorResult, cleanupResult };
  }

  log('\n✅ Kanban check suite passed.', 'green');
  return { ok: true, syncResult, blockersResult, dorResult, cleanupResult };
}

/**
 * Validate docs/BACKLOG.md against Linear issues.
 * Matches backlog IDs referenced in issue title/description.
 */
async function syncBacklog(options = {}) {
  try {
    log('\n🧭 Syncing backlog IDs with Linear issues...', 'cyan');

    const backlogItems = await readBacklogItems();
    if (backlogItems.length === 0) {
      log(`❌ No backlog items parsed from ${BACKLOG_PATH}`, 'red');
      return { ok: false };
    }

    const team = await getTeam();
    if (!team) {
      log(`❌ Team with key "${TEAM_KEY}" not found`, 'red');
      return { ok: false };
    }

    const issues = await fetchTeamIssues();
    const issueMeta = await collectIssueMeta(issues);

    const backlogById = new Map(backlogItems.map((item) => [item.id, item]));
    const linkedIssueIdsByBacklogId = new Map();
    const unknownRefs = [];

    for (const meta of issueMeta) {
      for (const ref of meta.backlogRefs) {
        if (!backlogById.has(ref)) {
          unknownRefs.push({ issueId: meta.id, ref, title: meta.title });
          continue;
        }
        if (!linkedIssueIdsByBacklogId.has(ref)) {
          linkedIssueIdsByBacklogId.set(ref, []);
        }
        linkedIssueIdsByBacklogId.get(ref).push(meta);
      }
    }

    const missing = [];
    for (const item of backlogItems) {
      if (!linkedIssueIdsByBacklogId.has(item.id)) {
        missing.push(item);
      }
    }

    const duplicated = [];
    for (const [backlogId, linkedIssues] of linkedIssueIdsByBacklogId.entries()) {
      if (linkedIssues.length > 1) {
        duplicated.push({ backlogId, linkedIssues });
      }
    }

    log(
      `\n📊 Summary: ${backlogItems.length} backlog items, ${issueMeta.length} Linear issues scanned`,
      'bright',
    );
    log(`  Missing links: ${missing.length}`, missing.length > 0 ? 'red' : 'green');
    log(`  Duplicate links: ${duplicated.length}`, duplicated.length > 0 ? 'yellow' : 'green');
    log(`  Unknown refs: ${unknownRefs.length}`, unknownRefs.length > 0 ? 'yellow' : 'green');

    if (missing.length > 0) {
      log('\n❌ Backlog items with no matching Linear issue reference:', 'red');
      for (const item of missing) {
        log(`  - ${item.id} (${item.section || 'Unsectioned'}): ${item.workItem}`, 'dim');
      }
    }

    if (duplicated.length > 0) {
      log('\n⚠️ Backlog IDs referenced by multiple Linear issues:', 'yellow');
      for (const entry of duplicated) {
        const ids = entry.linkedIssues.map((issue) => issue.id).join(', ');
        log(`  - ${entry.backlogId}: ${ids}`, 'dim');
      }
    }

    if (unknownRefs.length > 0) {
      log('\n⚠️ Linear issues referencing backlog IDs not found in docs/BACKLOG.md:', 'yellow');
      for (const ref of unknownRefs) {
        log(`  - ${ref.issueId} references ${ref.ref} (${ref.title})`, 'dim');
      }
    }

    const ok = missing.length === 0 && unknownRefs.length === 0;
    if (ok) {
      log('\n✅ Backlog and Linear references are in sync.', 'green');
    }

    if (!ok && options.strict) {
      process.exitCode = 1;
    }

    return { ok, missing, duplicated, unknownRefs };
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    console.error(error);
    if (options.strict) {
      process.exitCode = 1;
    }
    return { ok: false, error };
  }
}

/**
 * Show open release blockers using P0 backlog IDs, urgent priority, or release-blocker label.
 */
async function listReleaseBlockers(options = {}) {
  try {
    log('\n🚨 Gathering release blockers...', 'cyan');

    const backlogItems = await readBacklogItems();
    const p0Items = backlogItems.filter((item) => item.section === 'P0');
    const p0Ids = new Set(p0Items.map((item) => item.id));
    const backlogById = new Map(backlogItems.map((item) => [item.id, item]));

    const team = await getTeam();
    if (!team) {
      log(`❌ Team with key "${TEAM_KEY}" not found`, 'red');
      return { ok: false };
    }

    const issues = await fetchTeamIssues();
    const issueMeta = await collectIssueMeta(issues);

    const blockers = [];
    const p0Coverage = new Map();

    for (const meta of issueMeta) {
      for (const ref of meta.backlogRefs) {
        if (p0Ids.has(ref)) {
          p0Coverage.set(ref, meta);
        }
      }

      const isReleaseLabel = meta.labels.some((label) => label.toLowerCase() === 'release-blocker');
      const hasP0Ref = meta.backlogRefs.some((ref) => p0Ids.has(ref));
      const isUrgent = meta.priority === 0;

      if (!meta.isDoneLike && (isReleaseLabel || hasP0Ref || isUrgent)) {
        const reasons = [];
        if (hasP0Ref) {
          reasons.push(`P0 refs: ${meta.backlogRefs.filter((ref) => p0Ids.has(ref)).join(', ')}`);
        }
        if (isReleaseLabel) {
          reasons.push('label: release-blocker');
        }
        if (isUrgent) {
          reasons.push('priority: urgent');
        }
        blockers.push({ ...meta, reasons });
      }
    }

    const missingP0Links = p0Items.filter((item) => !p0Coverage.has(item.id));

    if (blockers.length === 0 && missingP0Links.length === 0) {
      log('\n✅ No open release blockers found.', 'green');
      return { ok: true, blockers: [], missingP0Links: [] };
    }

    if (blockers.length > 0) {
      log(`\n❌ Open release blockers (${blockers.length}):`, 'red');
      for (const blocker of blockers) {
        log(`  - ${blocker.id}: ${blocker.title}`, 'bright');
        log(
          `    Status: ${blocker.stateName} | Priority: ${formatPriority(blocker.priority)}`,
          'dim',
        );
        log(`    Reason: ${blocker.reasons.join(' | ')}`, 'yellow');
        if (blocker.projectName) {
          log(`    Project: ${blocker.projectName}`, 'dim');
        }
        log(`    URL: ${blocker.url}`, 'blue');
      }
    }

    if (missingP0Links.length > 0) {
      log('\n⚠️ P0 backlog items with no linked Linear issue reference:', 'yellow');
      for (const item of missingP0Links) {
        log(`  - ${item.id}: ${backlogById.get(item.id)?.workItem || 'Unknown item'}`, 'dim');
      }
    }

    if (options.strict) {
      process.exitCode = 1;
    }

    return { ok: false, blockers, missingP0Links };
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    console.error(error);
    if (options.strict) {
      process.exitCode = 1;
    }
    return { ok: false, error };
  }
}

// Commands

/**
 * List all issues (project or team)
 */
async function listIssues(options = {}) {
  try {
    log('\n📋 Fetching issues from Linear...', 'cyan');

    const me = await linear.viewer;
    const teams = await me.teams();

    // Find team by key
    const team = teams.nodes.find((t) => t.key === TEAM_KEY);
    if (!team) {
      log(`❌ Team with key "${TEAM_KEY}" not found`, 'red');
      log('Available teams:', 'yellow');
      for (const t of teams.nodes) {
        log(`  - ${t.name} (${t.key})`, 'dim');
      }
      return;
    }

    let issues;

    // If projectName specified, fetch project issues only
    if (options.projectName) {
      const projects = await team.projects();
      const project = projects.nodes.find(
        (p) => p.name.toLowerCase() === options.projectName.toLowerCase(),
      );

      if (!project) {
        log(`❌ Project "${options.projectName}" not found`, 'red');
        return;
      }

      issues = await project.issues();
      log(`\n✨ Found ${issues.nodes.length} issues in project "${project.name}":\n`, 'green');
    } else {
      // Fetch all team issues with filters
      const filters = {
        team: { key: { eq: TEAM_KEY } },
      };

      if (options.assignedToMe) {
        filters.assignee = { id: { eq: me.id } };
      }

      if (options.state) {
        filters.state = { name: { eq: options.state } };
      }

      // Filter to only show issues WITHOUT a project (team-level issues)
      if (options.teamOnly) {
        filters.project = { null: true };
      }

      issues = await linear.issues(filters);

      // If team-only, manually filter out issues with projects (API filter doesn't work reliably)
      if (options.teamOnly) {
        const filteredIssues = [];
        for (const issue of issues.nodes) {
          const project = await issue.project;
          if (!project) {
            filteredIssues.push(issue);
          }
        }
        issues.nodes = filteredIssues;
        log(
          `\n✨ Found ${issues.nodes.length} team-level issues (no project assigned):\n`,
          'green',
        );
      } else {
        log(`\n✨ Found ${issues.nodes.length} issues in ${team.name}:\n`, 'green');
      }
    }

    if (issues.nodes.length === 0) {
      log('  No issues found. Create one with: bun run linear create', 'dim');
      return issues.nodes;
    }

    for (const issue of issues.nodes) {
      const assignee = await issue.assignee;
      const state = await issue.state;
      const cycle = await issue.cycle;
      const project = await issue.project;

      log(`${issue.identifier}`, 'bright');
      log(`  ${issue.title}`, 'cyan');
      log(`  Status: ${state?.name || 'None'}`, 'dim');
      log(`  Assignee: ${assignee?.name || 'Unassigned'}`, 'dim');
      log(`  Priority: ${formatPriority(issue.priority)}`, 'dim');
      if (cycle) log(`  Cycle: ${cycle.name}`, 'dim');
      if (project) log(`  Project: ${project.name}`, 'dim');
      if (issue.dueDate) log(`  Due: ${formatDate(issue.dueDate)}`, 'yellow');
      log(`  URL: ${issue.url}`, 'blue');
      log('');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    console.error(error);
  }
}

/**
 * Create a new issue
 */
async function createIssue(title, description, options = {}) {
  try {
    log('\n📝 Creating new issue...', 'cyan');

    const me = await linear.viewer;
    const teams = await me.teams();
    const team = teams.nodes.find((t) => t.key === TEAM_KEY);

    if (!team) {
      log(`❌ Team with key "${TEAM_KEY}" not found`, 'red');
      return;
    }

    // Get workflow states
    const states = await team.states();
    const todoState = states.nodes.find((s) => s.name.toLowerCase().includes('todo'));

    // Build issue input
    const issueInput = {
      teamId: team.id,
      title,
      description,
      stateId: todoState?.id,
    };

    // Add optional fields
    if (options.priority !== undefined) {
      issueInput.priority = options.priority;
    }

    if (options.assignToMe) {
      issueInput.assigneeId = me.id;
    }

    if (options.projectId) {
      issueInput.projectId = options.projectId;
    }

    if (options.parentId) {
      issueInput.parentId = options.parentId;
    }

    if (options.labels) {
      // Fetch labels
      const teamLabels = await team.labels();
      const labelIds = options.labels
        .map((labelName) => {
          const label = teamLabels.nodes.find(
            (l) => l.name.toLowerCase() === labelName.toLowerCase(),
          );
          return label?.id;
        })
        .filter(Boolean);
      if (labelIds.length > 0) {
        issueInput.labelIds = labelIds;
      }
    }

    const issuePayload = await linear.createIssue(issueInput);
    const issue = await issuePayload.issue;

    if (issue) {
      log('\n✅ Issue created successfully!', 'green');
      log(`  ${issue.identifier}: ${issue.title}`, 'bright');
      log(`  URL: ${issue.url}`, 'blue');
    } else {
      log('❌ Failed to create issue', 'red');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    console.error(error);
  }
}

/**
 * Update an issue's priority
 */
async function updateIssuePriority(identifier, priority) {
  try {
    log(`\n🔄 Updating priority for ${identifier}...`, 'cyan');

    const issues = await linear.issues({
      filter: {
        team: { key: { eq: TEAM_KEY } },
      },
    });

    const issue = issues.nodes.find((i) => i.identifier === identifier);

    if (!issue) {
      log(`❌ Issue ${identifier} not found`, 'red');
      return false;
    }

    await issue.update({
      priority: priority,
    });

    log(`✅ Updated ${identifier} priority to ${formatPriority(priority)}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Update an issue's parent (make it a sub-issue)
 */
async function updateIssueParent(identifier, parentIdentifier) {
  try {
    log(`\n🔄 Setting ${identifier} as sub-issue of ${parentIdentifier}...`, 'cyan');

    const issues = await linear.issues({
      filter: {
        team: { key: { eq: TEAM_KEY } },
      },
    });

    const issue = issues.nodes.find((i) => i.identifier === identifier);
    const parentIssue = issues.nodes.find((i) => i.identifier === parentIdentifier);

    if (!issue) {
      log(`❌ Issue ${identifier} not found`, 'red');
      return false;
    }

    if (!parentIssue) {
      log(`❌ Parent issue ${parentIdentifier} not found`, 'red');
      return false;
    }

    await issue.update({
      parentId: parentIssue.id,
    });

    log(`✅ ${identifier} is now a sub-issue of ${parentIdentifier}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Update an issue's status/workflow state
 */
async function updateIssueStatus(identifier, statusName) {
  try {
    log(`\n🔄 Updating status for ${identifier} to "${statusName}"...`, 'cyan');

    // Get team and workflow states
    const me = await linear.viewer;
    const teams = await me.teams();
    const team = teams.nodes.find((t) => t.key === TEAM_KEY);

    if (!team) {
      log(`❌ Team with key "${TEAM_KEY}" not found`, 'red');
      return false;
    }

    // Get all workflow states for the team
    const states = await team.states();
    const targetState = states.nodes.find((s) => s.name.toLowerCase() === statusName.toLowerCase());

    if (!targetState) {
      log(`❌ Status "${statusName}" not found`, 'red');
      log('Available statuses:', 'yellow');
      for (const state of states.nodes) {
        log(`  - ${state.name}`, 'dim');
      }
      return false;
    }

    // Get the issue
    const issues = await linear.issues({
      filter: {
        team: { key: { eq: TEAM_KEY } },
      },
    });

    const issue = issues.nodes.find((i) => i.identifier === identifier);

    if (!issue) {
      log(`❌ Issue ${identifier} not found`, 'red');
      return false;
    }

    // Update the issue status
    await issue.update({
      stateId: targetState.id,
    });

    log(`✅ Updated ${identifier} status to "${targetState.name}"`, 'green');
    return true;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Update an issue's description
 */
async function updateIssueDescription(identifier, description) {
  try {
    log(`\n🔄 Updating description for ${identifier}...`, 'cyan');

    // Get the issue
    const issues = await linear.issues({
      filter: {
        team: { key: { eq: TEAM_KEY } },
      },
    });

    const issue = issues.nodes.find((i) => i.identifier === identifier);

    if (!issue) {
      log(`❌ Issue ${identifier} not found`, 'red');
      return false;
    }

    // Update the issue description
    await issue.update({
      description: description,
    });

    log(`✅ Updated ${identifier} description`, 'green');
    return true;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Assign issue(s) to a project by name
 */
async function assignToProject(identifiers, projectName) {
  try {
    log(`\n📂 Assigning issue(s) to project "${projectName}"...`, 'cyan');

    // Get team and projects
    const me = await linear.viewer;
    const teams = await me.teams();
    const team = teams.nodes.find((t) => t.key === TEAM_KEY);

    if (!team) {
      log(`❌ Team with key "${TEAM_KEY}" not found`, 'red');
      return false;
    }

    const projects = await team.projects();
    const project = projects.nodes.find((p) => p.name.toLowerCase() === projectName.toLowerCase());

    if (!project) {
      log(`❌ Project "${projectName}" not found`, 'red');
      log('Available projects:', 'yellow');
      for (const p of projects.nodes) {
        log(`  - ${p.name}`, 'dim');
      }
      return false;
    }

    // Get issues
    const issues = await linear.issues({
      filter: {
        team: { key: { eq: TEAM_KEY } },
      },
    });

    let success = 0;
    let failed = 0;

    for (const identifier of identifiers) {
      const issue = issues.nodes.find((i) => i.identifier === identifier);

      if (!issue) {
        log(`  ❌ ${identifier} not found`, 'red');
        failed++;
        continue;
      }

      try {
        await issue.update({
          projectId: project.id,
        });
        log(`  ✅ ${identifier} assigned to ${project.name}`, 'green');
        success++;
      } catch (error) {
        log(`  ❌ ${identifier} failed: ${error.message}`, 'red');
        failed++;
      }
    }

    log(`\n✨ Summary: ${success} assigned, ${failed} failed`, success > 0 ? 'green' : 'red');
    return success > 0;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Delete an issue by identifier (e.g., PAYTAX-1)
 */
async function deleteIssue(identifier) {
  try {
    log(`\n🗑️  Deleting issue ${identifier}...`, 'yellow');

    const issues = await linear.issues({
      filter: {
        team: { key: { eq: TEAM_KEY } },
      },
    });

    const issue = issues.nodes.find((i) => i.identifier === identifier);

    if (!issue) {
      log(`❌ Issue ${identifier} not found`, 'red');
      return false;
    }

    const deletePayload = await issue.delete();
    if (deletePayload.success) {
      log(`✅ Issue ${identifier} deleted successfully`, 'green');
      return true;
    } else {
      log(`❌ Failed to delete issue ${identifier}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error deleting issue: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

/**
 * Delete multiple issues by identifiers
 */
async function deleteIssues(identifiers) {
  try {
    log(`\n🗑️  Deleting ${identifiers.length} issues...`, 'yellow');

    let deleted = 0;
    let failed = 0;

    for (const identifier of identifiers) {
      const success = await deleteIssue(identifier);
      if (success) {
        deleted++;
      } else {
        failed++;
      }
    }

    log(`\n✨ Summary: ${deleted} deleted, ${failed} failed`, deleted > 0 ? 'green' : 'red');
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    console.error(error);
  }
}

/**
 * List current and upcoming cycles
 */
async function listCycles() {
  try {
    log('\n🔄 Fetching cycles...', 'cyan');

    const me = await linear.viewer;
    const teams = await me.teams();
    const team = teams.nodes.find((t) => t.key === TEAM_KEY);

    if (!team) {
      log(`❌ Team with key "${TEAM_KEY}" not found`, 'red');
      return;
    }

    const cycles = await team.cycles();

    log(`\n📅 Cycles for ${team.name}:\n`, 'green');

    if (cycles.nodes.length === 0) {
      log('  No cycles configured. Enable in Linear: Settings > Teams > Cycles', 'dim');
      return;
    }

    for (const cycle of cycles.nodes) {
      const issues = await cycle.issues();
      const completedIssues = issues.nodes.filter((i) => i.completedAt);
      const progress =
        issues.nodes.length > 0
          ? Math.round((completedIssues.length / issues.nodes.length) * 100)
          : 0;

      const isCurrent =
        new Date() >= new Date(cycle.startsAt) && new Date() <= new Date(cycle.endsAt);

      log(`${isCurrent ? '▶️' : '  '} ${cycle.name}`, isCurrent ? 'bright' : 'dim');
      log(`    ${formatDate(cycle.startsAt)} - ${formatDate(cycle.endsAt)}`, 'dim');
      log(
        `    Issues: ${issues.nodes.length} (${completedIssues.length} completed, ${progress}%)`,
        'dim',
      );
      log('');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    console.error(error);
  }
}

/**
 * List all projects
 */
async function listProjects() {
  try {
    log('\n📂 Fetching projects...', 'cyan');

    const me = await linear.viewer;
    const teams = await me.teams();
    const team = teams.nodes.find((t) => t.key === TEAM_KEY);

    if (!team) {
      log(`❌ Team with key "${TEAM_KEY}" not found`, 'red');
      return;
    }

    const projects = await team.projects();

    log(`\n🎯 Projects for ${team.name}:\n`, 'green');

    if (projects.nodes.length === 0) {
      log('  No projects yet. Create one in Linear!', 'dim');
      return;
    }

    for (const project of projects.nodes) {
      const issues = await project.issues();
      const completedIssues = issues.nodes.filter((i) => i.completedAt);
      const progress =
        issues.nodes.length > 0
          ? Math.round((completedIssues.length / issues.nodes.length) * 100)
          : 0;

      log(`${project.name}`, 'bright');
      log(`  ${project.description || 'No description'}`, 'dim');
      log(`  Status: ${project.state}`, 'dim');
      log(
        `  Progress: ${progress}% (${completedIssues.length}/${issues.nodes.length} issues)`,
        'cyan',
      );
      if (project.targetDate) log(`  Target: ${formatDate(project.targetDate)}`, 'yellow');
      log(`  URL: ${project.url}`, 'blue');
      log('');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    console.error(error);
  }
}

/**
 * Show current user and team info
 */
async function showInfo() {
  try {
    log('\n👤 Fetching Linear workspace info...', 'cyan');

    const me = await linear.viewer;
    const organization = await linear.organization;
    const teams = await me.teams();

    log('\n✨ Linear Workspace Info:\n', 'green');
    log(`User: ${me.name}`, 'bright');
    log(`Email: ${me.email}`, 'dim');
    log(`Organization: ${organization.name}`, 'bright');
    log(`\nTeams:`, 'cyan');

    for (const team of teams.nodes) {
      const isCurrent = team.key === TEAM_KEY;
      log(`${isCurrent ? '▶️' : '  '} ${team.name} (${team.key})`, isCurrent ? 'bright' : 'dim');
    }

    log(`\nCurrent team: ${TEAM_KEY}`, 'yellow');
    log('(Set LINEAR_TEAM_KEY env var to change)', 'dim');
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    console.error(error);
  }
}

/**
 * Interactive issue creator
 */
async function interactiveCreate() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) =>
    new Promise((resolve) =>
      rl.question(`${colors.cyan}${query}${colors.reset}`, (answer) => resolve(answer)),
    );

  try {
    log('\n📝 Create New Linear Issue', 'bright');
    log('Press Ctrl+C to cancel\n', 'dim');

    const title = await question('Title: ');
    if (!title.trim()) {
      log('❌ Title is required', 'red');
      rl.close();
      return;
    }

    const description = await question('Description (optional): ');

    const priorityInput = await question(
      'Priority (0=Urgent, 1=High, 2=Medium, 3=Low, 4=None) [2]: ',
    );
    const priority = priorityInput ? parseInt(priorityInput, 10) : 2;

    const assignToMe = await question('Assign to yourself? (y/n) [n]: ');

    const labels = await question('Labels (comma-separated, optional): ');
    const labelArray = labels ? labels.split(',').map((l) => l.trim()) : [];

    rl.close();

    await createIssue(title, description || undefined, {
      priority,
      assignToMe: assignToMe.toLowerCase() === 'y',
      labels: labelArray.length > 0 ? labelArray : undefined,
    });
  } catch (error) {
    rl.close();
    if (error.message.includes('canceled')) {
      log('\n❌ Cancelled', 'yellow');
    } else {
      log(`❌ Error: ${error.message}`, 'red');
    }
  }
}

// CLI Command Handler
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'list':
      case 'ls': {
        const listOptions = {
          assignedToMe: args.includes('--me'),
          teamOnly: args.includes('--team-only'),
        };

        // Check for --project flag
        if (args.includes('--project')) {
          const projectIndex = args.indexOf('--project');
          const projectName = args[projectIndex + 1];
          if (projectName) {
            listOptions.projectName = projectName;
          }
        }

        await listIssues(listOptions);
        break;
      }

      case 'create':
      case 'new':
        if (args[1]) {
          const options = {
            priority: args.includes('--high') ? 1 : 2,
            assignToMe: args.includes('--me'),
          };

          // Handle parent ID for sub-issues
          if (args.includes('--parent')) {
            const parentIdentifier = args[args.indexOf('--parent') + 1];
            if (parentIdentifier) {
              // Fetch parent issue to get ID
              const issues = await linear.issues({
                filter: {
                  team: { key: { eq: TEAM_KEY } },
                },
              });
              const parentIssue = issues.nodes.find((i) => i.identifier === parentIdentifier);
              if (parentIssue) {
                options.parentId = parentIssue.id;
                log(`  Creating as sub-issue of ${parentIdentifier}`, 'dim');
              } else {
                log(`  ⚠️  Parent issue ${parentIdentifier} not found`, 'yellow');
              }
            }
          }

          await createIssue(args[1], args[2], options);
        } else {
          await interactiveCreate();
        }
        break;

      case 'cycles':
        await listCycles();
        break;

      case 'projects':
        await listProjects();
        break;

      case 'info':
        await showInfo();
        break;

      case 'delete':
      case 'rm':
        if (args.length < 2) {
          log('❌ Please specify issue identifier(s) to delete', 'red');
          log('Example: bun run linear delete PAYTAX-1', 'dim');
          log('Example: bun run linear delete PAYTAX-1 PAYTAX-2 PAYTAX-3', 'dim');
        } else {
          const identifiers = args.slice(1);
          if (identifiers.length === 1) {
            await deleteIssue(identifiers[0]);
          } else {
            await deleteIssues(identifiers);
          }
        }
        break;

      case 'update-priority':
        if (args.length < 3) {
          log('❌ Please specify issue and priority', 'red');
          log('Example: bun run linear update-priority PAYTAX-1 0', 'dim');
          log('Priority: 0=Urgent, 1=High, 2=Medium, 3=Low, 4=None', 'dim');
        } else {
          const identifier = args[1];
          const priority = parseInt(args[2], 10);
          await updateIssuePriority(identifier, priority);
        }
        break;

      case 'set-parent':
        if (args.length < 3) {
          log('❌ Please specify child issue and parent issue', 'red');
          log('Example: bun run linear set-parent PAYTAX-1 PAYTAX-50', 'dim');
        } else {
          await updateIssueParent(args[1], args[2]);
        }
        break;

      case 'update-status':
      case 'set-status':
        if (args.length < 3) {
          log('❌ Please specify issue and status name', 'red');
          log('Example: bun run linear update-status PAYTAX-1 Done', 'dim');
          log('Common statuses: Todo, In Progress, Done, Canceled', 'dim');
        } else {
          const identifier = args[1];
          const statusName = args.slice(2).join(' '); // Join in case status has spaces
          await updateIssueStatus(identifier, statusName);
        }
        break;

      case 'update-description':
      case 'set-description':
        if (args.length < 3) {
          log('❌ Please specify issue and description', 'red');
          log('Example: bun run linear update-description PAYTAX-1 "New description"', 'dim');
        } else {
          const identifier = args[1];
          const description = args.slice(2).join(' '); // Join description parts
          await updateIssueDescription(identifier, description);
        }
        break;

      case 'assign-to-project':
      case 'add-to-project':
        if (args.length < 3) {
          log('❌ Please specify project name and issue identifier(s)', 'red');
          log('Example: bun run linear assign-to-project PayeTax PAYTAX-1', 'dim');
          log(
            'Example: bun run linear assign-to-project PayeTax PAYTAX-1 PAYTAX-2 PAYTAX-3',
            'dim',
          );
        } else {
          const projectName = args[1];
          const identifiers = args.slice(2);
          await assignToProject(identifiers, projectName);
        }
        break;

      case 'sync-backlog': {
        const strict = args.includes('--strict');
        await syncBacklog({ strict });
        break;
      }

      case 'release-blockers':
      case 'list-release-blockers': {
        const strict = args.includes('--strict');
        await listReleaseBlockers({ strict });
        break;
      }

      case 'enforce-dor': {
        const strict = args.includes('--strict');
        const stateArgIndex = args.indexOf('--state');
        const stateName =
          stateArgIndex !== -1 && args[stateArgIndex + 1] ? args[stateArgIndex + 1] : 'Ready';
        await enforceDoR({ strict, stateName });
        break;
      }

      case 'burn-down-cleanup': {
        const strict = args.includes('--strict');
        await burnDownCleanup({ strict });
        break;
      }

      case 'kanban-check': {
        const strict = args.includes('--strict');
        const stateArgIndex = args.indexOf('--state');
        const stateName =
          stateArgIndex !== -1 && args[stateArgIndex + 1] ? args[stateArgIndex + 1] : 'Ready';
        await kanbanCheck({ strict, stateName });
        break;
      }

      default:
        log('\n📊 Linear Helper for PayeTax\n', 'bright');
        log('Usage: bun run linear <command> [options]\n', 'cyan');
        log('Commands:', 'bright');
        log('  list, ls                List all issues', 'dim');
        log('    --me                  List issues assigned to you', 'dim');
        log('    --project NAME        List issues in specific project', 'dim');
        log('    --team-only           List only team issues (no project)', 'dim');
        log('  create, new             Create new issue (interactive)', 'dim');
        log('  create "title"          Create issue with title', 'dim');
        log('    --parent ID           Create as sub-issue (e.g., --parent PAYTAX-123)', 'dim');
        log('  update-status ID STATUS Update issue workflow status', 'dim');
        log('  assign-to-project       Assign issue(s) to project', 'dim');
        log(
          '  sync-backlog            Validate docs/BACKLOG.md IDs against Linear references',
          'dim',
        );
        log('    --strict              Exit non-zero when drift is found', 'dim');
        log(
          '  release-blockers        List open release blockers (P0 refs / urgent / label)',
          'dim',
        );
        log('    --strict              Exit non-zero when blockers exist', 'dim');
        log('  enforce-dor             Validate Ready-state issues meet DoR content checks', 'dim');
        log('    --state NAME          State to validate [default: Ready]', 'dim');
        log('    --strict              Exit non-zero when DoR violations exist', 'dim');
        log(
          '  burn-down-cleanup       Detect done/backlog drift and removable backlog items',
          'dim',
        );
        log('    --strict              Exit non-zero when cleanup items are found', 'dim');
        log(
          '  kanban-check            Run sync-backlog + release-blockers + enforce-dor + burn-down-cleanup',
          'dim',
        );
        log('    --state NAME          State to validate for DoR [default: Ready]', 'dim');
        log('    --strict              Exit non-zero when any check reports issues', 'dim');
        log('  delete, rm              Delete issue(s) by identifier', 'dim');
        log('  cycles                  List cycles/sprints', 'dim');
        log('  projects                List projects', 'dim');
        log('  info                    Show workspace info', 'dim');
        log('  help                    Show this help', 'dim');
        log('\nExamples:', 'bright');
        log('  bun run linear list', 'cyan');
        log('  bun run linear list --project PayeTax', 'cyan');
        log('  bun run linear list --team-only', 'cyan');
        log('  bun run linear create', 'cyan');
        log('  bun run linear update-status PAYTAX-24 Done', 'cyan');
        log('  bun run linear assign-to-project PayeTax PAYTAX-55 PAYTAX-56', 'cyan');
        log('  bun run linear sync-backlog --strict', 'cyan');
        log('  bun run linear release-blockers', 'cyan');
        log('  bun run linear enforce-dor --strict', 'cyan');
        log('  bun run linear burn-down-cleanup', 'cyan');
        log('  bun run linear kanban-check --strict', 'cyan');
        log('\nEnvironment:', 'bright');
        log('  LINEAR_API_KEY     Your Linear API key (required)', 'dim');
        log('  LINEAR_TEAM_KEY    Team identifier [default: PAYTAX]', 'dim');
        log('');
        break;
    }
  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run CLI
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  listIssues,
  createIssue,
  deleteIssue,
  deleteIssues,
  listCycles,
  listProjects,
  showInfo,
  assignToProject,
  syncBacklog,
  listReleaseBlockers,
  enforceDoR,
  burnDownCleanup,
  kanbanCheck,
};
