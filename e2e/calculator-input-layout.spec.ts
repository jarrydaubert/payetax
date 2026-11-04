import { expect, type Page, test } from '@playwright/test';
import { openCalculatorForAmountEntry } from './helpers/calculator-ui';

const WIDTHS = [
  320, 360, 393, 430, 639, 640, 641, 667, 767, 768, 769, 844, 1023, 1024, 1025, 1279, 1280, 1281,
  1440, 1799, 1800, 1801, 1920, 2560,
];

async function expectInputGeometry(page: Page, width: number) {
  // WebKit applies viewport/media-query changes asynchronously after resize.
  await expect
    .poll(() =>
      page.getByTestId('salary-input').evaluate((salary) => {
        const panel = salary.closest('.bg-card');
        return panel ? Number.parseFloat(getComputedStyle(panel).paddingLeft) : 0;
      }),
    )
    .toBe(width >= 1280 ? 32 : width >= 768 ? 24 : width >= 640 ? 16 : 12);
  const geometry = await page.getByTestId('salary-input').evaluate((salary) => {
    const panel = salary.closest('.bg-card');
    if (!(panel instanceof HTMLElement)) throw new Error('Input card is missing');
    const panelBox = panel.getBoundingClientRect();
    const fields = [...panel.querySelectorAll<HTMLLabelElement>('label[for]')]
      .filter((label) => {
        const control = document.getElementById(label.htmlFor);
        return control?.getAttribute('role') !== 'checkbox';
      })
      .map((label) => {
        const labelGroup = label.parentElement;
        const row = labelGroup?.parentElement;
        const control = row?.children[1];
        if (!(labelGroup && row && control)) throw new Error('Field row is incomplete');
        const labelBox = labelGroup.getBoundingClientRect();
        const controlBox = control.getBoundingClientRect();
        return {
          label: label.textContent,
          labelContained: label.getBoundingClientRect().right <= labelBox.right + 1,
          width: controlBox.width,
          beside: labelBox.right <= controlBox.left,
          stacked: labelBox.bottom <= controlBox.top,
          contained: controlBox.left >= panelBox.left && controlBox.right <= panelBox.right,
          offset: controlBox.left - row.getBoundingClientRect().left,
        };
      });
    const checkboxes = [...panel.querySelectorAll<HTMLElement>('[role="checkbox"]')].map(
      (checkbox) => {
        const label = panel.querySelector<HTMLLabelElement>(
          `label[for="${CSS.escape(checkbox.id)}"]`,
        );
        const box = checkbox.getBoundingClientRect();
        return {
          targetHeight: label?.getBoundingClientRect().height ?? 0,
          size: Math.min(box.width, box.height),
          contained: box.left >= panelBox.left && box.right <= panelBox.right,
        };
      },
    );
    return {
      fields,
      checkboxes,
      padding: Number.parseFloat(getComputedStyle(panel).paddingLeft),
      overflow: panel.scrollWidth - panel.clientWidth,
      documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(geometry.overflow, `${width}px card overflow`).toBeLessThanOrEqual(1);
  expect(geometry.documentOverflow, `${width}px document overflow`).toBeLessThanOrEqual(1);
  expect(geometry.fields.length).toBeGreaterThanOrEqual(8);
  const beside = width >= 640 && width < 1280;
  for (const field of geometry.fields) {
    expect(field.contained, `${width}px ${field.label} containment`).toBe(true);
    expect(field.labelContained, `${width}px ${field.label} text containment`).toBe(true);
    expect(field.beside, `${width}px ${field.label} beside rule`).toBe(beside);
    if (!beside) expect(field.stacked, `${width}px ${field.label} stack rule`).toBe(true);
    expect(Math.abs(field.width - (geometry.fields[0]?.width ?? 0))).toBeLessThanOrEqual(1);
    expect(field.offset).toBeCloseTo(beside ? 220 : 0, 0);
  }
  for (const checkbox of geometry.checkboxes) {
    expect(checkbox.targetHeight).toBeGreaterThanOrEqual(44);
    expect(checkbox.size).toBeGreaterThanOrEqual(24);
    expect(checkbox.contained).toBe(true);
  }
  if (width >= 1280) expect(geometry.padding).toBe(32);
}

for (const theme of ['light', 'dark'] as const) {
  test(`input controls align without clipping in ${theme}, including optional and invalid fields`, async ({
    page,
    isMobile,
  }) => {
    test.slow();
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await openCalculatorForAmountEntry(page, isMobile);
    await page.evaluate((value) => {
      document.documentElement.classList.toggle('dark', value === 'dark');
      document.documentElement.classList.toggle('light', value === 'light');
      document.documentElement.style.colorScheme = value;
    }, theme);
    // The readiness helper enables Married, exposing the partner amount field.
    await page.getByTestId('student-loan-select').click();
    await page.getByRole('option', { name: /Plan 2/, exact: false }).click();
    await page.getByTestId('postgraduate-addon-checkbox').check();
    await page.getByTestId('salary-input').fill('10000001');
    await page.getByTestId('calculate-button').press('Enter');
    await expect(page.getByTestId('salary-input')).toHaveAttribute('aria-invalid', 'true');
    await expect(
      page.getByRole('alert').filter({ hasText: 'Correct the invalid amount' }),
    ).toBeVisible();

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 1000 });
      await expectInputGeometry(page, width);
    }

    // Equivalent CSS layout viewports for the desktop acceptance widths at 200% zoom.
    for (const width of [640, 720, 900, 960, 1280]) {
      await page.setViewportSize({ width, height: 400 });
      await expectInputGeometry(page, width);
      await page.getByTestId('calculate-button').scrollIntoViewIfNeeded();
      await expect(page.getByTestId('calculate-button')).toBeInViewport();
    }
  });
}
