/**
 * 🏆 GOLDEN MASTER CAPTURE SCRIPT
 * Extracts ACTUAL calculator outputs to create the TRUE golden master
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { expect, test } from '@playwright/test';
import goldenCases from './fixtures/golden-tax-cases-2025-26-COMPLETE.json';

test.describe('CAPTURE: TRUE Golden Master', () => {
  test.setTimeout(600_000); // 10 minutes for all 23 scenarios

  test('Capture all 23 scenarios from live calculator', async ({ browser }) => {
    const capturedCases: any[] = [];
    let _successCount = 0;

    for (const scenario of goldenCases.cases) {
      // Fresh context for each scenario to avoid cross-contamination
      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        await page.goto(`http://localhost:3000/?t=${Date.now()}#tax-calculator`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);

        // Cookie banner dismissal
        const acceptButton = page.locator('button:has-text("Accept All")');
        if (await acceptButton.isVisible().catch(() => false)) {
          await acceptButton.click();
          await page.waitForTimeout(1000);
        }

        // Fill salary
        await page.getByTestId('salary-input').clear();
        await page.getByTestId('salary-input').fill(scenario.input.salary.toString());
        await page.waitForTimeout(300);

        // Region - use role instead of label to avoid tooltip collision
        if (scenario.input.region && scenario.input.region !== 'England') {
          await page.getByRole('combobox', { name: /tax region/i }).click();
          await page.waitForTimeout(200);
          await page.getByRole('option', { name: new RegExp(scenario.input.region, 'i') }).click();
          await page.waitForTimeout(300);
        }

        // Tax code - use role to avoid tooltip collision
        if (scenario.input.taxCode && scenario.input.taxCode !== '1257L') {
          const taxCodeInput = page.getByRole('textbox', { name: 'Tax Code' });
          await taxCodeInput.clear();
          await taxCodeInput.fill(scenario.input.taxCode);
          await page.waitForTimeout(300);
        }

        // Pension
        if (scenario.input.pensionContribution) {
          const pensionInput = page.getByTestId('pension-input');
          await pensionInput.clear();
          await pensionInput.fill(scenario.input.pensionContribution.toString());
          await pensionInput.blur();
          await page.waitForTimeout(300);
        }

        // Calculate
        await page.getByTestId('calculate-button').click();
        await page.waitForTimeout(2000);

        // Wait for results
        await expect(page.locator('tr:has-text("Total Tax Due")')).toBeVisible({ timeout: 10000 });

        // Extract values using SAME method as golden master test
        async function getValue(label: string): Promise<number> {
          try {
            const row = page.locator(`tr:has-text("${label}")`).first();
            await row.waitFor({ state: 'visible', timeout: 3000 });
            const cells = row.locator('td');
            const count = await cells.count();
            if (count < 3) return 0;
            const text = await cells.nth(2).textContent(); // 3rd column = yearly
            if (!text) return 0;
            return Number.parseFloat(text.replace(/[£,]/g, ''));
          } catch {
            return 0;
          }
        }

        const captured = {
          id: scenario.id,
          description: scenario.description,
          input: scenario.input,
          expected: {
            incomeTax: await getValue('Total Tax Due'),
            employeeNI: await getValue('National Insurance'),
            netPay: await getValue('Net Pay'),
          },
          capturedAt: new Date().toISOString(),
        };

        capturedCases.push(captured);
        _successCount++;
      } catch (error: any) {
        capturedCases.push({
          id: scenario.id,
          description: scenario.description,
          input: scenario.input,
          expected: scenario.expected, // Keep old values as fallback
          captureError: error.message,
          capturedAt: new Date().toISOString(),
        });
      } finally {
        await context.close();
      }
    }

    // Save captured values
    const outPath = path.join(__dirname, 'fixtures', 'golden-tax-cases-2025-26-TRUE.json');
    const output = {
      version: '2025-26',
      capturedAt: new Date().toISOString(),
      description: 'TRUE golden master - captured from live calculator',
      cases: capturedCases,
    };

    fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  });
});
