import { expect, type Page } from '@playwright/test';

/** Exercise each mounted help control with real touch and keyboard events. */
export async function checkVisibleInputHelp(page: Page): Promise<string[]> {
  const controls = page.locator('button[data-testid^="tooltip-trigger-"]:visible');
  const tested: string[] = [];
  for (const trigger of await controls.all()) {
    const testId = await trigger.getAttribute('data-testid');
    if (!testId) throw new Error('Help trigger is missing its identifier');
    const content = page.getByTestId(testId.replace('tooltip-trigger-', 'tooltip-content-'));
    await expect(trigger).toHaveAccessibleName(/^Help for .+/);
    await trigger.evaluate((element) =>
      element.scrollIntoView({ block: 'center', behavior: 'instant' }),
    );
    await trigger.tap();
    await expect(content).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAccessibleDescription(/\S/);
    const contentId = await content.getAttribute('id');
    if (!contentId) throw new Error('Help content has no ID');
    await expect(trigger).toHaveAttribute('aria-controls', contentId);
    await trigger.tap();
    await expect(content).toHaveCount(0);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.tap();
    await expect(content).toBeVisible();
    // This viewport edge is outside the bounded help panel and contains no form control.
    await page.touchscreen.tap(2, 300);
    await expect(content).toHaveCount(0);
    await trigger.focus();
    await trigger.press('Enter');
    await expect(content).toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.press('Enter');
    await expect(content).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.press('Space');
    await expect(content).toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.press('Space');
    await expect(content).toHaveCount(0);
    await trigger.press('Enter');
    await trigger.press('Escape');
    await expect(content).toHaveCount(0);
    await expect(trigger).toBeFocused();
    tested.push(testId);
  }
  return tested;
}
