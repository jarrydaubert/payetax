#!/usr/bin/env node
const { LinearClient } = require('@linear/sdk');

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
if (!LINEAR_API_KEY) {
  console.error('❌ LINEAR_API_KEY not set');
  process.exit(1);
}

const linear = new LinearClient({ apiKey: LINEAR_API_KEY });

async function updateTickets() {
  try {
    console.log('📝 Updating ticket descriptions...\n');
    
    const issues = await linear.issues({
      filter: { team: { key: { eq: 'PAYETAX' } } }
    });

    const ticket55 = issues.nodes.find(i => i.identifier === 'PAYTAX-55');
    const ticket56 = issues.nodes.find(i => i.identifier === 'PAYTAX-56');
    const ticket57 = issues.nodes.find(i => i.identifier === 'PAYTAX-57');

    // Update PAYTAX-55
    if (ticket55) {
      await ticket55.update({
        description: `## Quick Win - 2-3 hours ⚡

**Problem:** Age dropdown exists but doesn't automatically exempt users from NI. Comment says "no NI" but it's not implemented.

**Impact:** Incorrect calculations for 12.6M UK pensioners

## Solution
Add \`isOverStatePensionAge\` check in taxCalculator.ts line ~594

\`\`\`typescript
const isOverStatePensionAge = input.age !== undefined && input.age >= 66;
if (!input.payNoNI && input.niCategory !== 'C' && !isOverStatePensionAge) {
  // Calculate NI...
}
\`\`\`

## Files to Change
- \`src/lib/taxCalculator.ts\` (line ~594)
- \`src/components/organisms/CalculatorInputs/BasicInputs.tsx\` (line ~237)
- \`src/lib/__tests__/taxCalculator.ageAllowance.test.ts\`
- \`src/config/inputTooltips.ts\`
- \`CONTRIBUTING.md\`

## Acceptance Criteria
- [ ] Age < 66 → Calculate NI normally
- [ ] Age 66+ → Employee NI = £0, employer still pays
- [ ] Fix misleading comment in BasicInputs.tsx
- [ ] 7 test cases added and passing
- [ ] Documentation updated

**See PAYTAX-55_GUIDE.md for step-by-step implementation**

Time: 2-3 hours | Labels: bug, compliance, quick-win`,
      });
      console.log('✅ Updated PAYTAX-55 description');
    }

    // Update PAYTAX-56
    if (ticket56) {
      await ticket56.update({
        description: `## 2-3 days - User Requested Feature

**Problem:** Calculator only accepts one salary input. Real taxpayers have multiple income sources.

**User Feedback:** "it would help if there was a way to have more than one source of income eg earnings, pension, state pension, rental income etc"

## Solution
Add collapsible "Additional Income Sources" section with shadcn Collapsible (already installed!)

## HMRC Income Types (SA100)
1. **Employment** - Subject to NI if under SPA
2. **Private Pension** - Taxable, no NI
3. **State Pension** - Taxable, no NI  
4. **Rental Income** - Taxable, no NI
5. **Investment** - Taxable, no NI
6. **Other** - Taxable, no NI

## Components Needed
- ✅ Collapsible (installed)
- ✅ Select (installed)
- ✅ Button, Badge (installed)
- ✅ NumberInput (custom, exists)

## Acceptance Criteria
- [ ] Add/update/remove income sources
- [ ] All 6 income types supported
- [ ] NI calculated only on employment income
- [ ] Tax calculated on total income
- [ ] Collapsible UI collapsed by default
- [ ] 8 test cases written and passing
- [ ] Documentation updated

**Depends on:** PAYTAX-55 (age-based NI must be correct first)
**Full spec:** docs/planning/LINEAR_TICKETS_READY.md`,
      });
      console.log('✅ Updated PAYTAX-56 description');
    }

    // Update PAYTAX-57
    if (ticket57) {
      await ticket57.update({
        description: `## 2-3 days - Doubles Market (5M Self-Employed)

**Problem:** User expected self-employed support: "I had in my mind it did self-employed too but couldn't find that option"

**Market Impact:** 5M self-employed in UK

## Solution
Add Employment Type tabs with shadcn Tabs
- **Tab 1:** Employed (existing calculator)
- **Tab 2:** Self-Employed (new calculator)

## Self-Employed Tax Rules (2025-26)
- **Class 2 NI:** £3.45/week (£179.40/year) if profit > £6,725
- **Class 4 NI:** 6% on £12,571-£50,270, 2% above
- **Income Tax:** Same bands as employed
- **Payments on Account:** 2 installments if tax+NI > £1,000

## Components Needed
- ⚠️ **Tabs** (needs install: \`npx shadcn@latest add tabs\`)
- ✅ NumberInput, Select, Button, Alert (all ready)

## Acceptance Criteria
- [ ] Install shadcn Tabs component
- [ ] Tabs switch between Employed/Self-Employed
- [ ] Class 2 & 4 NI calculated correctly
- [ ] Payments on Account logic works
- [ ] Scottish rates supported
- [ ] 6 test cases written and passing
- [ ] Documentation updated

**Reference:** Old ToolHubX calculator reviewed
**Full spec:** docs/planning/LINEAR_TICKETS_READY.md`,
      });
      console.log('✅ Updated PAYTAX-57 description');
    }

    // Set dependency
    if (ticket56 && ticket55) {
      await linear.createIssueRelation({
        issueId: ticket56.id,
        relatedIssueId: ticket55.id,
        type: 'blocks',
      });
      console.log('✅ Set PAYTAX-56 to depend on PAYTAX-55');
    }

    console.log('\n🎉 All tickets ready to work on!');
    console.log('\n📋 View tickets:');
    console.log('   https://linear.app/payetax/issue/PAYTAX-55');
    console.log('   https://linear.app/payetax/issue/PAYTAX-56');
    console.log('   https://linear.app/payetax/issue/PAYTAX-57');
    console.log('\n🚀 Start with PAYTAX-55 (2-3 hour quick win!)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
  }
}

updateTickets();
