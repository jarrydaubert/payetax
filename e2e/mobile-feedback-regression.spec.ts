import { expect, test } from '@playwright/test';

const EXCEPTION_LIKE_CONSOLE_PATTERNS = [
  /uncaught/i,
  /typeerror/i,
  /referenceerror/i,
  /syntaxerror/i,
] as const;

test('mobile feedback dialog opens from nav and accepts input without runtime errors', async ({
  page,
}) => {
  const runtimeErrors: string[] = [];

  page.on('pageerror', (error) => {
    runtimeErrors.push(error.message);
  });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      const text = message.text();
      const looksLikeRuntimeException = EXCEPTION_LIKE_CONSOLE_PATTERNS.some((pattern) =>
        pattern.test(text),
      );
      if (looksLikeRuntimeException) {
        runtimeErrors.push(text);
      }
    }
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });

  const acceptCookies = page.getByTestId('cookie-accept-all');
  if (await acceptCookies.isVisible().catch(() => false)) {
    await acceptCookies.click();
  }

  await page
    .getByRole('button', { name: /open menu|close menu/i })
    .first()
    .click();

  const feedbackTrigger = page
    .locator(
      'button[aria-haspopup="dialog"]:has-text("Feedback"):visible, button:has-text("Feedback"):visible',
    )
    .first();
  await expect(feedbackTrigger).toBeVisible();
  await page.waitForTimeout(250);
  await feedbackTrigger.click({ force: true });

  await expect(page.getByRole('heading', { name: 'Share Your Feedback' })).toBeVisible();

  const emailInput = page.getByLabel(/Email \(optional\)/i);
  const messageInput = page.getByLabel(/^Message/i);

  await expect(emailInput).toBeEditable();
  await expect(messageInput).toBeEditable();

  await emailInput.fill('qa@example.com');
  await messageInput.fill('Mobile feedback dialog regression check message.');

  await expect(emailInput).toHaveValue('qa@example.com');
  await expect(messageInput).toHaveValue('Mobile feedback dialog regression check message.');

  expect(runtimeErrors, `Unexpected runtime errors:\n${runtimeErrors.join('\n')}`).toEqual([]);
});
