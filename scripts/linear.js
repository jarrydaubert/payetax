#!/usr/bin/env node
// scripts/linear.js - Linear API Helper for PayeTax Project Management

const { LinearClient } = require('@linear/sdk');
const readline = require('node:readline');

// Configuration
const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const TEAM_KEY = process.env.LINEAR_TEAM_KEY || 'PAYETAX'; // Team identifier

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

// Commands

/**
 * List all issues for the team
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

    // Fetch issues with filters
    const filters = {
      team: { key: { eq: TEAM_KEY } },
    };

    if (options.assignedToMe) {
      filters.assignee = { id: { eq: me.id } };
    }

    if (options.state) {
      filters.state = { name: { eq: options.state } };
    }

    const issues = await linear.issues(filters);

    log(`\n✨ Found ${issues.nodes.length} issues in ${team.name}:\n`, 'green');

    if (issues.nodes.length === 0) {
      log('  No issues found. Create one with: npm run linear:create', 'dim');
      return;
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
            (l) => l.name.toLowerCase() === labelName.toLowerCase()
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
        'dim'
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
        'cyan'
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
      rl.question(`${colors.cyan}${query}${colors.reset}`, (answer) => resolve(answer))
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
      'Priority (0=Urgent, 1=High, 2=Medium, 3=Low, 4=None) [2]: '
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
      case 'ls':
        await listIssues({ assignedToMe: args.includes('--me') });
        break;

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
          log('Example: npm run linear delete PAYTAX-1', 'dim');
          log('Example: npm run linear delete PAYTAX-1 PAYTAX-2 PAYTAX-3', 'dim');
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
          log('Example: npm run linear update-priority PAYTAX-1 0', 'dim');
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
          log('Example: npm run linear set-parent PAYTAX-1 PAYTAX-50', 'dim');
        } else {
          await updateIssueParent(args[1], args[2]);
        }
        break;

      default:
        log('\n📊 Linear Helper for PayeTax\n', 'bright');
        log('Usage: npm run linear:<command> [options]\n', 'cyan');
        log('Commands:', 'bright');
        log('  list, ls          List all issues', 'dim');
        log('  list --me         List issues assigned to you', 'dim');
        log('  create, new       Create new issue (interactive)', 'dim');
        log('  create "title"    Create issue with title', 'dim');
        log('    --parent ID     Create as sub-issue (e.g., --parent PAYTAX-123)', 'dim');
        log('  delete, rm        Delete issue(s) by identifier', 'dim');
        log('  cycles            List cycles/sprints', 'dim');
        log('  projects          List projects', 'dim');
        log('  info              Show workspace info', 'dim');
        log('  help              Show this help', 'dim');
        log('\nExamples:', 'bright');
        log('  npm run linear:list', 'cyan');
        log('  npm run linear:create', 'cyan');
        log('  npm run linear:cycles', 'cyan');
        log('\nEnvironment:', 'bright');
        log('  LINEAR_API_KEY     Your Linear API key (required)', 'dim');
        log('  LINEAR_TEAM_KEY    Team identifier [default: PAYETAX]', 'dim');
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
};
