import { expect, test } from '@playwright/test';
import { editCalculatorInputs, showPeriodComparison } from './helpers/calculator-ui';

test('comparison columns retain at least one period and result selection survives edits', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#tax-calculator');
  await page.getByTestId('salary-input').fill('60000');
  await page.getByTestId('calculate-button').click();
  await page.getByRole('combobox', { name: 'View by', exact: true }).selectOption('weekly');
  await showPeriodComparison(page);
  await page.getByText('Choose comparison columns', { exact: true }).click();
  const periods = ['Yearly', 'Monthly', '4-Weekly', 'Fortnightly', 'Weekly', 'Daily', 'Hourly'];
  for (const period of periods.slice(0, -1)) {
    const checkbox = page.getByRole('checkbox', { name: period, exact: true });
    await expect(checkbox).toBeChecked();
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
  }
  await page.getByRole('checkbox', { name: 'Hourly', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Hourly', exact: true })).toBeChecked();
  await expect(
    page.getByTestId('results-table').getByRole('columnheader', { name: 'Hourly', exact: true }),
  ).toBeVisible();
  await editCalculatorInputs(page);
  await page.getByTestId('salary-input').fill('70000');
  await page.getByTestId('calculate-button').click();
  await expect(page.getByRole('combobox', { name: 'View by', exact: true })).toHaveValue('weekly');
});
