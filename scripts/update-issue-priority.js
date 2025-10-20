#!/usr/bin/env node
// Update a Linear issue priority

const { LinearClient } = require('@linear/sdk');

const LINEAR_API_KEY =
  process.env.LINEAR_API_KEY || 'lin_api_krnJCAJduWg4yzkWQDnV81XAh51i1DN4DmnXAJhL';
const TEAM_KEY = 'PAYTAX';

const linear = new LinearClient({ apiKey: LINEAR_API_KEY });

const [issueId, priorityStr] = process.argv.slice(2);

if (!issueId || priorityStr === undefined) {
  console.log('Usage: node update-issue-priority.js PAYTAX-XX <priority>');
  console.log('Priority: 0=Urgent, 1=High, 2=Medium, 3=Low, 4=None');
  process.exit(1);
}

async function updatePriority() {
  try {
    const issues = await linear.issues({
      filter: {
        team: { key: { eq: TEAM_KEY } },
      },
    });

    const issue = issues.nodes.find((i) => i.identifier === issueId);

    if (!issue) {
      console.log(`❌ Issue ${issueId} not found`);
      return;
    }

    const priority = parseInt(priorityStr, 10);

    await issue.update({
      priority: priority,
    });

    const priorityMap = { 0: '🔴 Urgent', 1: '🟠 High', 2: '🟡 Medium', 3: '🟢 Low', 4: '⚪ None' };
    console.log(`✅ Updated ${issueId} priority to ${priorityMap[priority]}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updatePriority();
