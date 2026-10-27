import { writeFile } from 'node:fs/promises';
import { expect, type Locator, type Page, test } from '@playwright/test';
import { dismissCookieBannerIfPresent } from './helpers/calculator-ui';

const VIEWPORTS = [
  { name: 'small-mobile', width: 320, height: 568 },
  { name: 'mobile-portrait', width: 390, height: 844 },
  { name: 'small-mobile-landscape', width: 667, height: 375 },
  { name: 'mobile-landscape', width: 844, height: 390 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'xl-boundary-below', width: 1279, height: 800 },
  { name: 'xl-boundary', width: 1280, height: 800 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'rail-boundary-below', width: 1799, height: 1000 },
  { name: 'rail-boundary', width: 1800, height: 1000 },
  { name: 'large-desktop', width: 1920, height: 1080 },
  { name: 'wide-desktop', width: 2560, height: 1440 },
] as const;

const ALL_PERIODS = [
  'Yearly',
  'Monthly',
  '4-Weekly',
  'Fortnightly',
  'Weekly',
  'Daily',
  'Hourly',
] as const;

async function openWithoutStoredConsent(
  page: Page,
  reducedMotion: 'reduce' | 'no-preference' = 'reduce',
): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.removeItem('cookie-consent');
    window.localStorage.removeItem('cookie-consent-timestamp');
  });
  await page.emulateMedia({ reducedMotion });
  await page.goto('/#tax-calculator', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
}

async function expectNavbarGeometry(page: Page, shortLandscape: boolean): Promise<void> {
  const geometry = await page.evaluate(() => {
    const nav = document.querySelector<HTMLElement>('nav[aria-label="Main navigation"]');
    const spacer = document.querySelector<HTMLElement>('[data-testid="navbar-spacer"]');
    if (!(nav && spacer)) throw new Error('Navbar geometry elements were not rendered');
    return {
      navHeight: nav.getBoundingClientRect().height,
      spacerHeight: spacer.getBoundingClientRect().height,
      targetHeights: [...nav.querySelectorAll<HTMLElement>('a, button')]
        .map((target) => target.getBoundingClientRect().height)
        .filter((height) => height > 0),
    };
  });

  expect(Math.abs(geometry.navHeight - geometry.spacerHeight)).toBeLessThanOrEqual(1);
  expect(Math.min(...geometry.targetHeights)).toBeGreaterThanOrEqual(43.5);
  if (shortLandscape) expect(geometry.navHeight).toBeLessThanOrEqual(56.5);
}

async function expectContentBelowNavbar(target: Locator): Promise<void> {
  await target.evaluate((element) =>
    element.scrollIntoView({ behavior: 'instant', block: 'start' }),
  );
  await expect
    .poll(() => {
      return target.evaluate((targetElement) => {
        const nav = document.querySelector<HTMLElement>('nav[aria-label="Main navigation"]');
        if (!nav) throw new Error('Navbar was not rendered');
        return targetElement.getBoundingClientRect().top - nav.getBoundingClientRect().bottom;
      });
    })
    .toBeGreaterThanOrEqual(15);
}

async function expectNoCellIntersections(table: Locator): Promise<void> {
  const offenders = await table.evaluate((tableElement) => {
    const rows = [...tableElement.querySelectorAll('tr')];
    const textRects = (cell: Element) => {
      const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
      const rects: DOMRect[] = [];
      let node = walker.nextNode();
      while (node) {
        const parent = node.parentElement;
        if (node.textContent?.trim() && !parent?.closest('.sr-only')) {
          const range = document.createRange();
          range.selectNodeContents(node);
          rects.push(...range.getClientRects());
        }
        node = walker.nextNode();
      }
      return rects;
    };

    const failures: string[] = [];
    rows.forEach((row, rowIndex) => {
      const cells = [...row.querySelectorAll(':scope > th, :scope > td')];
      const ranges = cells.map(textRects);
      cells.forEach((cell, cellIndex) => {
        const cellRect = cell.getBoundingClientRect();
        for (const textRect of ranges[cellIndex] ?? []) {
          if (textRect.left < cellRect.left - 0.5 || textRect.right > cellRect.right + 0.5) {
            failures.push(`row ${rowIndex} cell ${cellIndex} text escapes its cell`);
          }
        }

        const nextRanges = ranges[cellIndex + 1];
        if (!nextRanges) return;
        for (const current of ranges[cellIndex] ?? []) {
          for (const next of nextRanges) {
            const sharesVerticalSpace = current.bottom > next.top && next.bottom > current.top;
            if (sharesVerticalSpace && current.right > next.left + 0.5) {
              failures.push(`row ${rowIndex} cells ${cellIndex}/${cellIndex + 1} intersect`);
            }
          }
        }
      });
    });
    return failures;
  });

  expect(offenders).toEqual([]);
}

async function expectTableGeometry(page: Page): Promise<{
  safeTableWidth: number;
  clientWidth: number;
}> {
  const table = page.getByTestId('results-table');
  const container = page.getByTestId('results-table-container');
  await expect(table).toBeVisible();
  await expectNoCellIntersections(table);

  const geometry = await container.evaluate((element) => {
    const tableElement = element.querySelector<HTMLElement>('[data-testid="results-table"]');
    if (!tableElement) throw new Error('Results table was not rendered');
    return {
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      safeTableWidth: Number.parseFloat(getComputedStyle(tableElement).minWidth),
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    };
  });

  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  const needsOverflow = geometry.safeTableWidth > geometry.clientWidth;
  expect(geometry.scrollWidth > geometry.clientWidth + 2).toBe(needsOverflow);
  return geometry;
}

async function enableAllPeriods(page: Page): Promise<void> {
  for (const period of ALL_PERIODS) {
    const checkbox = page.getByRole('checkbox', { name: period, exact: true });
    if (!(await checkbox.isChecked())) await checkbox.check();
  }
}

async function expectStickyLabelReadable(page: Page): Promise<void> {
  const stickyGeometry = await page.evaluate(() => {
    const containerElement = document.querySelector<HTMLElement>(
      '[data-testid="results-table-container"]',
    );
    const stickyLabel = document.querySelector<HTMLElement>(
      '[data-testid="results-table"] tbody th',
    );
    const left = document.querySelector<HTMLElement>('[data-testid="scroll-indicator-left"]');
    if (!(containerElement && stickyLabel && left))
      throw new Error('Scrollable table was incomplete');
    const containerRect = containerElement.getBoundingClientRect();
    const labelRect = stickyLabel.getBoundingClientRect();
    const indicatorRect = left.getBoundingClientRect();
    return {
      stickyPosition: getComputedStyle(stickyLabel).position,
      stickyDelta: Math.abs(labelRect.left - containerRect.left),
      indicatorOverlap: labelRect.right - indicatorRect.left,
      indicatorVisible: getComputedStyle(left).opacity !== '0',
      labelWidth: labelRect.width,
    };
  });

  expect(stickyGeometry.stickyPosition).toBe('sticky');
  expect(stickyGeometry.stickyDelta).toBeLessThanOrEqual(1);
  if (stickyGeometry.indicatorVisible) {
    expect(stickyGeometry.indicatorOverlap).toBeLessThanOrEqual(1);
  }
  expect(stickyGeometry.labelWidth).toBeGreaterThanOrEqual(168);
}

async function expectScrollableInteraction(page: Page): Promise<void> {
  const container = page.getByTestId('results-table-container');
  const leftIndicator = page.getByTestId('scroll-indicator-left');
  const rightIndicator = page.getByTestId('scroll-indicator-right');

  await container.evaluate((element) => {
    element.style.scrollBehavior = 'smooth';
    element.scrollLeft = 0;
  });
  await expect(rightIndicator).toHaveCSS('opacity', '1');
  await expect(leftIndicator).toHaveCSS('opacity', '0');

  const reducedMotionScroll = await container.evaluate((element) => {
    const requestedScrollLeft = Math.max(80, element.clientWidth * 0.25);
    const expectedScrollLeft = Math.min(
      element.scrollWidth - element.clientWidth,
      requestedScrollLeft,
    );
    element.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
    );
    return { expectedScrollLeft, immediateScrollLeft: element.scrollLeft };
  });
  expect(
    Math.abs(reducedMotionScroll.immediateScrollLeft - reducedMotionScroll.expectedScrollLeft),
  ).toBeLessThanOrEqual(1);

  await container.evaluate((element) => {
    element.scrollLeft = 0;
  });
  await container.focus();
  await expect(container).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => container.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);

  await container.evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
  });
  await expect(leftIndicator).toHaveCSS('opacity', '1');
  await expect(rightIndicator).toHaveCSS('opacity', '0');

  await expectStickyLabelReadable(page);
}

async function expectNonScrollableInteraction(page: Page): Promise<void> {
  const container = page.getByTestId('results-table-container');
  const leftIndicator = page.getByTestId('scroll-indicator-left');
  const rightIndicator = page.getByTestId('scroll-indicator-right');
  const geometry = await container.evaluate((element) => {
    element.scrollLeft = 0;
    return { clientWidth: element.clientWidth, scrollWidth: element.scrollWidth };
  });

  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 2);
  await expect(leftIndicator).toHaveCSS('opacity', '0');
  await expect(rightIndicator).toHaveCSS('opacity', '0');
  await expectStickyLabelReadable(page);

  await container.focus();
  await page.keyboard.press('ArrowRight');
  expect(await container.evaluate((element) => element.scrollLeft)).toBe(0);
}

async function expectXlBoundaryLayout(page: Page, width: number): Promise<void> {
  if (width !== 1279 && width !== 1280) return;
  const display = await page
    .getByTestId('calculator-section')
    .evaluate((element) => getComputedStyle(element).display);
  expect(display).toBe(width === 1279 ? 'flex' : 'grid');
}

test.describe('Responsive calculator geometry', () => {
  test.describe('Desktop keyboard navigation', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    for (const [width, height] of [
      [1440, 900],
      [1920, 1080],
    ]) {
      for (const key of ['Enter', 'Space']) {
        test(`${width}px Calculate keyboard focus with ${key} stays visible`, async ({
          page,
        }, testInfo) => {
          const pageErrors: string[] = [];
          const consoleMessages: string[] = [];
          page.on('pageerror', (error) => pageErrors.push(error.message));
          page.on('console', (message) => {
            if (message.type() === 'warning' || message.type() === 'error') {
              consoleMessages.push(message.text());
            }
          });
          await page.setViewportSize({ width, height });
          await openWithoutStoredConsent(page, key === 'Enter' ? 'no-preference' : 'reduce');
          await page.getByTestId('cookie-accept-all').click();
          await expect(page.getByTestId('cookie-accept-all')).toBeHidden();
          await page.getByRole('combobox', { name: 'Pay period', exact: true }).click();
          await page.getByRole('option', { name: 'Annually', exact: true }).click();
          await expect(
            page.getByRole('combobox', { name: 'Pay period', exact: true }),
          ).toBeFocused();
          await page.getByTestId('salary-input').fill('60000');
          await page.getByTestId('tax-code-input').fill('1257L');

          const calculate = page.getByTestId('calculate-button');
          await calculate.focus();
          await expect(calculate).toBeFocused();
          await page.keyboard.press(key);
          const destination = page.getByRole('region', {
            name: 'Tax calculation results summary',
            exact: true,
          });
          await expect(destination).toBeVisible();
          await testInfo.attach('after-calculate-focus', {
            body: Buffer.from(
              JSON.stringify(
                await page.evaluate(() => {
                  const focused = document.activeElement;
                  const rect = focused?.getBoundingClientRect();
                  return {
                    focused: focused?.getAttribute('aria-label') ?? focused?.textContent,
                    top: rect?.top,
                    bottom: rect?.bottom,
                    headerBottom: document
                      .querySelector('nav[aria-label="Main navigation"]')
                      ?.getBoundingClientRect().bottom,
                  };
                }),
              ),
            ),
            contentType: 'application/json',
          });
          await expect(destination).toBeFocused();
          await expect(destination).toHaveAttribute('tabindex', '-1');
          await expect(destination).toHaveCSS('outline-style', 'solid');
          expect(
            await destination.evaluate((el) =>
              Number.parseFloat(getComputedStyle(el).outlineWidth),
            ),
          ).toBeGreaterThanOrEqual(2);

          const focusGeometry: unknown[] = [];
          const visibleFocus = async (target: Locator) => {
            await expect(target).toBeFocused();
            await expect
              .poll(() =>
                target.evaluate((el) => {
                  const rect = el.getBoundingClientRect();
                  const nav = document.querySelector('nav[aria-label="Main navigation"]');
                  let node: Element | null = el;
                  while (node) {
                    const style = getComputedStyle(node);
                    if (Number(style.opacity) < 0.99 || style.visibility === 'hidden') return false;
                    node = node.parentElement;
                  }
                  const visible =
                    rect.top >= (nav?.getBoundingClientRect().bottom ?? 0) + 4 &&
                    rect.bottom <= innerHeight - 4 &&
                    rect.left >= 4 &&
                    rect.right <= document.documentElement.clientWidth - 4 &&
                    el.matches(':focus-visible');
                  return visible
                    ? 'visible'
                    : JSON.stringify({
                        label: el.getAttribute('aria-label') || el.id || el.textContent,
                        tag: el.tagName,
                        active:
                          document.activeElement?.getAttribute('aria-label') ||
                          document.activeElement?.id ||
                          document.activeElement?.tagName,
                        top: rect.top,
                        bottom: rect.bottom,
                        headerBottom: nav?.getBoundingClientRect().bottom,
                        focusVisible: el.matches(':focus-visible'),
                      });
                }),
              )
              .toBe('visible');
            focusGeometry.push(
              await target.evaluate((el) => ({
                label: el.getAttribute('aria-label') || el.id || el.textContent,
                role: el.getAttribute('role'),
                top: el.getBoundingClientRect().top,
                bottom: el.getBoundingClientRect().bottom,
                headerBottom: document
                  .querySelector('nav[aria-label="Main navigation"]')
                  ?.getBoundingClientRect().bottom,
                scrollY,
              })),
            );
          };
          await visibleFocus(destination);
          await testInfo.attach(`focus-destination-${width}-${key}`, {
            body: await page.screenshot({ path: testInfo.outputPath('focus-destination.png') }),
            contentType: 'image/png',
          });
          const scrollY = await page.evaluate(() => window.scrollY);
          const cards = page
            .getByRole('region', { name: 'Tax calculation summary results', exact: true })
            .getByRole('button');
          await expect(cards).toHaveCount(5);
          // Normal-motion cards include Framer's focusable gesture wrapper as well as the button.
          const focusStops = page
            .getByRole('region', { name: 'Tax calculation summary results', exact: true })
            .locator('button, [tabindex="0"]');
          await expect.poll(() => focusStops.count()).toBe(key === 'Enter' ? 10 : 5);
          for (let index = 0; index < (await focusStops.count()); index++) {
            await page.keyboard.press('Tab');
            await visibleFocus(focusStops.nth(index));
            expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(scrollY, 0);
          }

          const section = page.getByTestId('calculator-section');
          const inputs = section.locator(':scope > div').filter({
            has: page.getByTestId('salary-input'),
          });
          const tabbable = (region: Locator) =>
            region.locator(
              'button:not([disabled]):visible, input:not([type="hidden"]):not([tabindex="-1"]):not([disabled]):visible, a[href]:visible, [tabindex="0"]:visible',
            );
          const inputStops = tabbable(inputs);
          const resultStops = tabbable(page.getByTestId('tax-results'));
          const orderedRegions =
            width < 1800
              ? [inputStops, focusStops, resultStops]
              : [focusStops, inputStops, resultStops];
          const journey: Locator[] = [];
          for (const region of orderedRegions) {
            for (let index = 0; index < (await region.count()); index++) {
              journey.push(region.nth(index));
            }
          }
          const afterSummary =
            (width < 1800 ? await inputStops.count() : 0) + (await focusStops.count());
          for (let index = afterSummary; index < journey.length; index++) {
            await page.keyboard.press('Tab');
            await visibleFocus(journey[index]);
            if (index === afterSummary) {
              await testInfo.attach('tab-beyond-summary', {
                body: await page.screenshot({ path: testInfo.outputPath('after-summary.png') }),
                contentType: 'image/png',
              });
            }
          }
          // Leave the calculator, then reverse the entire journey, including both section boundaries.
          await page.keyboard.press('Tab');
          expect(await section.evaluate((el) => el.contains(document.activeElement))).toBe(false);
          for (let index = journey.length - 1; index >= 0; index--) {
            await page.keyboard.press('Shift+Tab');
            await visibleFocus(journey[index]);
            if (
              index ===
              (width < 1800 ? (await inputStops.count()) - 1 : (await focusStops.count()) - 1)
            ) {
              await testInfo.attach('reverse-summary-boundary', {
                body: await page.screenshot({
                  path: testInfo.outputPath('reverse-summary-boundary.png'),
                }),
                contentType: 'image/png',
              });
            }
          }
          const geometryPath = testInfo.outputPath('focus-geometry.json');
          await writeFile(
            geometryPath,
            JSON.stringify({ focusGeometry, pageErrors, consoleMessages }, null, 2),
          );
          await testInfo.attach('complete-focus-geometry', {
            path: geometryPath,
            contentType: 'application/json',
          });
          expect(pageErrors).toEqual([]);
          await expect(page.getByTestId('results-table')).toContainText('£45,365.28');
          await testInfo.attach(`keyboard-focus-${width}-${key}`, {
            body: await page.screenshot({ path: testInfo.outputPath('keyboard-tab.png') }),
            contentType: 'image/png',
          });
        });
      }
    }
  });

  for (const [width, height] of [
    [1280, 800],
    [1440, 900],
    [1920, 1080],
    [2560, 1440],
  ]) {
    test(`${width}px desktop shows all seven periods and five cards without scrolling`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height });
      await openWithoutStoredConsent(page);
      await dismissCookieBannerIfPresent(page);
      // An opened Radix select also confirms the calculator is hydrated before amount entry.
      await page.getByRole('combobox', { name: 'Pay period', exact: true }).click();
      await page.getByRole('option', { name: 'Annually', exact: true }).click();
      await expect(page.getByRole('combobox', { name: 'Pay period', exact: true })).toBeFocused();
      await page.getByTestId('salary-input').fill('60000');
      await page.getByTestId('tax-code-input').fill('1257L');
      await page.getByTestId('calculate-button').press('Enter');
      const table = page.getByTestId('results-table');
      await expect(table).toBeVisible();
      await enableAllPeriods(page);
      // WebKit may scroll to a checkbox while enabling optional periods (also on main).
      // Measure the overview after Calculate with that selection, as the test promises.
      await page.getByTestId('calculate-button').press('Enter');
      await expect(table.locator('thead tr').first().locator('th')).toHaveText([
        'Breakdown',
        '%',
        ...ALL_PERIODS,
      ]);
      const summary = page.getByRole('region', {
        name: 'Tax calculation summary results',
        exact: true,
      });
      await expect(summary.getByRole('button')).toHaveCount(5);
      await expect(summary).toContainText('£45,365.28');

      await expect
        .poll(() =>
          page.evaluate(() => {
            const nav = document.querySelector('nav[aria-label="Main navigation"]');
            const summary = document.querySelector(
              '[aria-label="Tax calculation summary results"]',
            );
            const firstRow = document.querySelector('[data-testid="results-table"] tbody tr');
            if (!(nav && summary && firstRow)) return false;
            return (
              summary.getBoundingClientRect().top >= nav.getBoundingClientRect().bottom &&
              firstRow.getBoundingClientRect().bottom <= window.innerHeight
            );
          }),
        )
        .toBe(true);
      const geometry = await expectTableGeometry(page);
      expect(geometry.clientWidth).toBeGreaterThanOrEqual(1192);
      // Geometric visibility alone can miss an opacity-zero reduced-motion card.
      await expect
        .poll(() =>
          summary.getByRole('button').evaluateAll((cards) =>
            cards.every((card) => {
              let element: Element | null = card;
              while (element) {
                const style = getComputedStyle(element);
                if (Number(style.opacity) === 0 || style.visibility === 'hidden') return false;
                element = element.parentElement;
              }
              return true;
            }),
          ),
        )
        .toBe(true);
      await expect(table.locator('tbody tr').first().locator('td').last()).toHaveCSS(
        'white-space',
        'nowrap',
      );
      const fontSize = await table
        .locator('tbody tr')
        .first()
        .locator('td')
        .last()
        .evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));
      expect(fontSize).toBeGreaterThanOrEqual(14);
      await testInfo.attach(`desktop-${width}`, {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
      await expectNonScrollableInteraction(page);

      // User period choices survive resizing; display changes do not calculate again.
      await page.getByRole('checkbox', { name: 'Daily', exact: true }).uncheck();
      await page.setViewportSize({ width: 393, height: 852 });
      await expect(page.getByRole('checkbox', { name: 'Daily', exact: true })).not.toBeChecked();
      await expect(table).toContainText('£45,365.28');
      await page.setViewportSize({ width, height });
      await expect(page.getByRole('checkbox', { name: 'Daily', exact: true })).not.toBeChecked();
    });
  }

  for (const viewport of VIEWPORTS) {
    test(`${viewport.name} keeps results readable`, async ({ page }) => {
      test.slow();
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await openWithoutStoredConsent(page);

      const shortLandscape = viewport.width > viewport.height && viewport.height <= 500;
      await expectNavbarGeometry(page, shortLandscape);
      await expectXlBoundaryLayout(page, viewport.width);

      const cookieBanner = page.getByTestId('cookie-banner');
      await expect(cookieBanner).toBeVisible();
      if (shortLandscape) {
        const usableHeight = await page.evaluate(() => {
          const nav = document.querySelector<HTMLElement>('nav[aria-label="Main navigation"]');
          const banner = document.querySelector<HTMLElement>('[data-testid="cookie-banner"]');
          if (!(nav && banner)) throw new Error('Short-landscape chrome was incomplete');
          return banner.getBoundingClientRect().top - nav.getBoundingClientRect().bottom;
        });
        expect(usableHeight).toBeGreaterThanOrEqual(96);
      }
      await dismissCookieBannerIfPresent(page);

      const calculator = page.locator('#tax-calculator');
      await expectContentBelowNavbar(calculator);

      await page.getByTestId('salary-input').fill('60000');
      await page.getByTestId('tax-code-input').fill('1257L');
      await page.getByTestId('calculate-button').click();
      const resultsSummary = page.getByRole('region', {
        name: 'Tax calculation results summary',
        exact: true,
      });
      await expect(resultsSummary).toBeVisible();
      await expectContentBelowNavbar(resultsSummary);

      const netPayRow = page
        .getByTestId('results-table')
        .locator('tbody tr', { hasText: 'Net Pay' });
      await expect(netPayRow).toContainText('£45,365.28');

      await expectTableGeometry(page);

      await enableAllPeriods(page);
      await page.getByTestId('salary-input').fill('10000000');
      await page.getByTestId('calculate-button').click();
      await expect(page.getByTestId('results-table')).toBeVisible();
      const allPeriodsGeometry = await expectTableGeometry(page);
      if (allPeriodsGeometry.safeTableWidth > allPeriodsGeometry.clientWidth) {
        await expectScrollableInteraction(page);
      } else {
        await expectNonScrollableInteraction(page);
      }
    });
  }

  test('1280x800 at a 200% layout viewport keeps every period readable', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 400 });
    await openWithoutStoredConsent(page);
    await dismissCookieBannerIfPresent(page);
    await page.getByTestId('salary-input').fill('10000000');
    await page.getByTestId('tax-code-input').fill('1257L');
    await page.getByTestId('calculate-button').click();
    await enableAllPeriods(page);
    const geometry = await expectTableGeometry(page);
    expect(geometry.safeTableWidth).toBeGreaterThan(geometry.clientWidth);
  });
});
