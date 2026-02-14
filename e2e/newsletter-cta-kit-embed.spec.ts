import { expect, type Page, test } from '@playwright/test';

async function mockKitEmbed(page: Page): Promise<void> {
  await page.route(/https:\/\/payetax\.kit\.com\/.+\/index\.js(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        (() => {
          const mount = document.currentScript?.parentElement;
          if (!mount) return;

          mount.innerHTML = \`
            <form class="seva-form formkit-form" data-testid="kit-form">
              <div class="formkit-fields seva-fields">
                <div class="formkit-field" style="border: 1px solid rgb(71, 85, 105);">
                  <input
                    class="formkit-input"
                    type="email"
                    name="email_address"
                    placeholder="Enter your email"
                  />
                </div>
                <button class="formkit-submit" type="submit">
                  <span style="box-shadow: inset 0 0 0 1px rgb(34, 211, 238);">Subscribe</span>
                </button>
              </div>
            </form>
            <p class="formkit-powered-by-convertkit-container" style="opacity: 0.2; color: rgb(20, 28, 43);">
              Built with <a class="formkit-powered-by-convertkit" href="https://kit.com">Kit</a>
            </p>
          \`;
        })();
      `,
    });
  });
}

test.describe('Newsletter CTA Kit embed styles', () => {
  test('keeps desktop layout inline and removes double-layer button styling', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await mockKitEmbed(page);
    await page.goto('/');

    const newsletter = page.locator('section[aria-label="Newsletter signup"]');
    await expect(newsletter).toBeVisible();
    await expect(newsletter.locator('.formkit-form')).toBeVisible();

    const fields = newsletter.locator('.formkit-fields');
    await expect(fields).toHaveCSS('display', 'flex');
    await expect(fields).toHaveCSS('flex-direction', 'row');

    const submit = newsletter.locator('.formkit-submit');
    await expect(submit).toHaveCSS('box-shadow', 'none');

    const submitBeforeContent = await submit.evaluate(
      (el) => getComputedStyle(el, '::before').content,
    );
    expect(submitBeforeContent).toBe('none');
  });

  test('keeps powered-by text readable and stacks on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await mockKitEmbed(page);
    await page.goto('/');

    const newsletter = page.locator('section[aria-label="Newsletter signup"]');
    await expect(newsletter).toBeVisible();

    const fields = newsletter.locator('.formkit-fields');
    await expect(fields).toHaveCSS('flex-direction', 'column');

    const poweredBy = newsletter.locator('.formkit-powered-by-convertkit-container');
    await expect(poweredBy).toBeVisible();
    await expect(poweredBy).toHaveCSS('opacity', '1');
    const poweredByColor = await poweredBy.evaluate((el) => getComputedStyle(el).color);
    expect(poweredByColor).not.toBe('rgb(20, 28, 43)');

    const poweredByLink = newsletter.locator('.formkit-powered-by-convertkit');
    const poweredByLinkColor = await poweredByLink.evaluate((el) => getComputedStyle(el).color);
    expect(poweredByLinkColor).not.toBe('rgb(20, 28, 43)');
  });
});
