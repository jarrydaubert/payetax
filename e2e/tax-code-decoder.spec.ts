import { expect, test } from '@playwright/test';

test('editing a tax code clears its result until the next decode', async ({ page }) => {
  await page.goto('/tools/tax-code-decoder');
  const input = page.getByRole('textbox', { name: 'Tax code' });
  const submit = page.getByRole('button', { name: 'Decode', exact: true });
  const example = page.getByRole('button', { name: '1257L', exact: true });
  const allowance = page.getByText('£12,570', { exact: true });
  const basicRate = page.getByText('Basic rate on all income from this source', { exact: true });
  const invalidCode = page.getByText('Unrecognized or unsupported tax code', { exact: true });

  await example.click();
  await expect(input).toHaveValue('1257L');
  await expect(allowance).toBeVisible();

  await input.fill('BR');
  await expect(input).toHaveValue('BR');
  await expect(allowance).toHaveCount(0);
  await expect(basicRate).toHaveCount(0);
  await input.press('Enter');
  await expect(basicRate).toBeVisible();

  await input.fill('1257');
  await expect(basicRate).toHaveCount(0);
  await expect(invalidCode).toHaveCount(0);
  await submit.click();
  await expect(invalidCode).toBeVisible();
  await expect(allowance).toHaveCount(0);

  await input.clear();
  await expect(submit).toBeDisabled();
  await expect(invalidCode).toHaveCount(0);
  await input.fill('1257L');
  await expect(allowance).toHaveCount(0);
  await submit.click();
  await expect(allowance).toBeVisible();

  await input.fill('1257');
  await example.click();
  await expect(input).toHaveValue('1257L');
  await expect(allowance).toBeVisible();
  await expect(invalidCode).toHaveCount(0);
});
