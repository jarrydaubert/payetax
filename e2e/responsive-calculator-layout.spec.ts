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
  { name: 'large-desktop', width: 1920, height: 1080 },
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

async function openWithoutStoredConsent(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.removeItem('cookie-consent');
    window.localStorage.removeItem('cookie-consent-timestamp');
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
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
      labelWidth: labelRect.width,
    };
  });

  expect(stickyGeometry.stickyPosition).toBe('sticky');
  expect(stickyGeometry.stickyDelta).toBeLessThanOrEqual(1);
  expect(stickyGeometry.indicatorOverlap).toBeLessThanOrEqual(1);
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
