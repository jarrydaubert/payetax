import { expect, type Page, test } from '@playwright/test';
import { openCalculatorForAmountEntry } from './helpers/calculator-ui';

const WIDTHS = [
  320, 360, 393, 430, 639, 640, 641, 667, 767, 768, 769, 844, 1023, 1024, 1025, 1279, 1280, 1281,
  1440, 1799, 1800, 1801, 1920, 2560,
];

async function expectInputGeometry(page: Page, width: number) {
  // Wait for responsive reflow before reading geometry, especially in WebKit.
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  const geometry = await page.getByTestId('salary-input').evaluate((salary) => {
    const panel = salary.closest('.bg-card');
    if (!(panel instanceof HTMLElement)) throw new Error('Input card is missing');
    const panelBox = panel.getBoundingClientRect();
    const fields = [...panel.querySelectorAll<HTMLLabelElement>('label[for]')]
      .filter(
        (label) => document.getElementById(label.htmlFor)?.getAttribute('role') !== 'checkbox',
      )
      .map((label) => {
        const labelGroup = label.parentElement;
        const control = labelGroup?.parentElement?.children[1];
        if (!(labelGroup && control)) throw new Error('Field row is incomplete');
        const labelBox = labelGroup.getBoundingClientRect();
        const controlBox = control.getBoundingClientRect();
        return {
          label: label.textContent?.trim(),
          labelOverflow: label.scrollWidth - label.clientWidth,
          width: controlBox.width,
          beside: labelBox.right <= controlBox.left,
          stacked: labelBox.bottom <= controlBox.top,
          centreDifference: Math.abs(
            (labelBox.top + labelBox.bottom - controlBox.top - controlBox.bottom) / 2,
          ),
          contained:
            labelBox.left >= panelBox.left &&
            labelBox.right <= panelBox.right &&
            controlBox.left >= panelBox.left &&
            controlBox.right <= panelBox.right,
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
    const clippedValues = [
      ...panel.querySelectorAll<HTMLElement>('input, [role="combobox"] > span'),
    ]
      .filter((element) => element.scrollWidth - element.clientWidth > 1)
      .map(
        (element) => element.closest('[data-testid]')?.getAttribute('data-testid') ?? element.id,
      );
    const panelStyle = getComputedStyle(panel);
    const contentRight = panelBox.right - Number.parseFloat(panelStyle.paddingRight);
    const fieldsRight = Math.max(
      ...[...panel.querySelectorAll('input, [role="combobox"]')].map(
        (control) => control.getBoundingClientRect().right,
      ),
    );
    return {
      fields,
      checkboxes,
      clippedValues,
      unusedWidth: contentRight - fieldsRight,
      checkboxRows: panel.querySelector('fieldset')?.getBoundingClientRect().height ?? 0,
      height: panelBox.height,
      overflow: panel.scrollWidth - panel.clientWidth,
      documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(geometry.overflow, `${width}px card overflow`).toBeLessThanOrEqual(1);
  expect(geometry.documentOverflow, `${width}px document overflow`).toBeLessThanOrEqual(1);
  expect(geometry.fields.length).toBeGreaterThanOrEqual(8);
  expect(geometry.clippedValues, `${width}px truncated values`).toEqual([]);
  if (width >= 1280) {
    // Desktop panels hug their fields instead of stretching across spare width.
    expect(geometry.unusedWidth, `${width}px spare panel width`).toBeLessThanOrEqual(32);
  }
  for (const field of geometry.fields) {
    expect(field.contained, `${width}px ${field.label} containment`).toBe(true);
    expect(field.labelOverflow, `${width}px ${field.label} readability`).toBeLessThanOrEqual(1);
    if (width >= 640) {
      expect(field.beside, `${width}px ${field.label} uses available horizontal space`).toBe(true);
      expect(field.centreDifference).toBeLessThanOrEqual(2);
      // A generous content-size ceiling catches stretched desktop fields without pinning CSS widths.
      expect(field.width).toBeLessThanOrEqual(320);
    } else {
      expect(field.stacked, `${width}px ${field.label} narrow-screen reflow`).toBe(true);
    }
  }
  for (const checkbox of geometry.checkboxes) {
    expect(checkbox.targetHeight).toBeGreaterThanOrEqual(44);
    expect(checkbox.size).toBeGreaterThanOrEqual(24);
    expect(checkbox.contained).toBe(true);
  }
  if (width >= 640) {
    expect(geometry.checkboxRows, `${width}px allowances fit one row`).toBeLessThanOrEqual(48);
    const fieldWidth = (name: string) =>
      geometry.fields.find((field) => field.label === name)?.width ?? 0;
    expect(fieldWidth('Tax Code')).toBeLessThan(fieldWidth('Salary'));
    expect(fieldWidth('Non-taxable allowance(s)')).toBeLessThan(fieldWidth('Age'));
  }
  return geometry;
}

for (const theme of ['light', 'dark'] as const) {
  test(`compact inputs remain readable in ${theme}, including optional and invalid fields`, async ({
    page,
    isMobile,
  }, testInfo) => {
    test.slow();
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await openCalculatorForAmountEntry(page, isMobile);
    await page.getByTestId('married-checkbox').uncheck();
    await page.evaluate((value) => {
      document.documentElement.classList.toggle('dark', value === 'dark');
      document.documentElement.classList.toggle('light', value === 'light');
      document.documentElement.style.colorScheme = value;
    }, theme);

    const laterControls = [
      'age-select',
      'student-loan-select',
      'non-taxable-allowances-input',
      'pension-input',
    ];
    const controlPositions = () =>
      Promise.all(
        laterControls.map((id) =>
          page
            .getByTestId(id)
            .evaluate((control) => Math.round(control.getBoundingClientRect().left)),
        ),
      );
    // Measured defaults are 938/438/614px. Rounded budgets allow font variation,
    // while catching a return to the 994/494/1070px layout from PR #174.
    for (const [width, budget] of [
      [393, 980],
      [1280, 470],
      [1440, 470],
      [1512, 470],
      [1920, 650],
    ] as const) {
      await page.setViewportSize({ width, height: 1080 });
      const geometry = await expectInputGeometry(page, width);
      expect(geometry.height).toBeLessThanOrEqual(budget);
      // Revealing the partner amount must not move later fields between columns.
      const before = await controlPositions();
      await page.getByTestId('married-checkbox').check();
      await expect(page.getByTestId('partner-salary-input')).toBeVisible();
      expect(await controlPositions(), `${width}px Married toggle`).toEqual(before);
      await page.getByTestId('married-checkbox').uncheck();
    }

    // Longest supported values and option labels must stay fully visible.
    await page.getByTestId('married-checkbox').check();
    await page.getByTestId('partner-salary-input').fill('10000000');
    await page.getByTestId('non-taxable-allowances-input').fill('1000000');
    await page.getByRole('combobox', { name: 'Pay period', exact: true }).click();
    await page.getByRole('option', { name: 'Fortnightly' }).click();
    await page.getByTestId('age-select').click();
    await page.getByRole('option', { name: 'State Pension Age or over' }).click();
    await page.getByTestId('student-loan-select').click();
    await page.getByRole('option', { name: /Plan 1/ }).click();
    await page.getByTestId('postgraduate-addon-checkbox').check();
    await page.getByTestId('salary-input').fill('10000001');
    await page.getByTestId('calculate-button').press('Enter');
    await expect(page.getByTestId('salary-input')).toHaveAttribute('aria-invalid', 'true');
    await expect(
      page.getByRole('alert').filter({ hasText: 'Correct the invalid amount' }),
    ).toBeVisible();

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 1080 });
      await expectInputGeometry(page, width);
      if ([393, 768, 1440, 1920].includes(width)) {
        await testInfo.attach(`inputs-${width}-${theme}`, {
          body: await page
            .getByTestId('salary-input')
            .locator('xpath=ancestor::div[contains(@class,"bg-card")][1]')
            .screenshot({
              style: 'header, nextjs-portal { visibility: hidden; }',
            }),
          contentType: 'image/png',
        });
      }
    }
    // Equivalent CSS layout viewports at 200% desktop zoom; scrolling must reach actions.
    for (const width of [640, 720, 900, 960, 1280]) {
      await page.setViewportSize({ width, height: 400 });
      await expectInputGeometry(page, width);
      await page.getByTestId('calculate-button').scrollIntoViewIfNeeded();
      await expect(page.getByTestId('calculate-button')).toBeInViewport();
    }
  });
}
