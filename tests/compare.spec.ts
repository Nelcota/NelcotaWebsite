import { expect, type Page, test } from '@playwright/test';
import { CHECKED_ON, COMPARE_GROUPS, PRODUCT_INFO, PRODUCTS } from '../src/data/compare.ts';

/** A phone narrower than any in the device list: the tightest width the layout must hold. */
const NARROW_PHONE = { width: 360, height: 780 };
const DESKTOP = { width: 1440, height: 900 };
const MIN_TOUCH_TARGET = 44;

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  return errors;
}

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

const ROW_COUNT = COMPARE_GROUPS.reduce((total, group) => total + group.rows.length, 0);

test.describe('comparison page', () => {
  test('keeps the table semantics: caption, column, row and group headers', async ({ page }) => {
    const errors = collectConsoleErrors(page);

    await page.goto('/compare/');
    const table = page.getByRole('table', { name: 'Feature comparison' });

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('How Nelcota compares');
    await expect(table.locator('caption')).toHaveText('Feature comparison');
    await expect(table.locator('thead th[scope="col"]')).toHaveCount(PRODUCTS.length + 1);
    for (const product of PRODUCTS) {
      // Phones hide two rivals behind the picker, so check presence rather than visibility.
      await expect(table.locator('thead th', { hasText: PRODUCT_INFO[product].name })).toHaveCount(
        1,
      );
    }
    await expect(table.locator('th[scope="rowgroup"]')).toHaveCount(COMPARE_GROUPS.length);
    await expect(table.locator('th[scope="row"]')).toHaveCount(ROW_COUNT);
    expect(errors).toEqual([]);
  });

  test('shows the check date, the report link and Nelcota’s own gaps', async ({ page }) => {
    await page.goto('/compare/');

    await expect(page.locator(`time[datetime="${CHECKED_ON}"]`).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open an issue' })).toHaveAttribute(
      'href',
      /\/issues\/new$/,
    );
    // Honesty rule: what Nelcota lacks is marked in its own column, not left out.
    await expect(page.locator('td[data-col="nelcota"] .mark-no').first()).toBeAttached();
  });

  test('links every source of every product', async ({ page }) => {
    await page.goto('/compare/');
    const sources = page.getByRole('region', { name: 'Sources' });

    for (const product of PRODUCTS) {
      await expect(
        sources.getByRole('heading', { level: 3, name: PRODUCT_INFO[product].name }),
      ).toBeVisible();
      for (const source of PRODUCT_INFO[product].sources) {
        await expect(sources.locator(`a[href="${source.href}"]`).first()).toHaveAttribute(
          'rel',
          'noopener',
        );
      }
    }
  });

  test('keeps the product row in view while the table scrolls on wide screens', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/compare/');
    const nelcotaHead = page.locator('thead th[data-col="nelcota"]');

    await page
      .locator('th[scope="row"]')
      .nth(ROW_COUNT - 1)
      .scrollIntoViewIfNeeded();

    await expect(page.locator('.picker')).toBeHidden();
    await expect(nelcotaHead).toBeInViewport();
    await expect(nelcotaHead).toHaveCSS('position', 'sticky');
  });

  test('is translated at /pt-br/compare/', async ({ page }) => {
    const errors = collectConsoleErrors(page);

    await page.goto('/pt-br/compare/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nelcota comparado');
    await expect(page.getByRole('table', { name: 'Comparativo de recursos' })).toBeAttached();
    expect(errors).toEqual([]);
  });
});

test.describe('comparison page on phones', () => {
  test.use({ viewport: NARROW_PHONE });

  const header = (page: Page, name: string) =>
    page.getByRole('columnheader', { name: new RegExp(`^${name}`) });

  test('shows Nelcota beside the rival picked with the segmented control', async ({ page }) => {
    await page.goto('/compare/');

    await expect(header(page, 'Nelcota')).toBeVisible();
    await expect(header(page, 'Supabase')).toBeVisible();
    await expect(header(page, 'PocketBase')).toBeHidden();

    await page.locator('.picker label', { hasText: 'PocketBase' }).click();

    await expect(header(page, 'PocketBase')).toBeVisible();
    await expect(header(page, 'Supabase')).toBeHidden();
    await expect(header(page, 'Nelcota')).toBeVisible();
  });

  test('switches rivals from the keyboard', async ({ page }) => {
    await page.goto('/compare/');
    const supabase = page.getByRole('radio', { name: 'Supabase' });

    await supabase.focus();
    await page.keyboard.press('ArrowRight');

    await expect(page.getByRole('radio', { name: 'PocketBase' })).toBeChecked();
    await expect(header(page, 'PocketBase')).toBeVisible();
  });

  test('gives each picker option a 44px touch target', async ({ page }) => {
    await page.goto('/compare/');
    const options = page.locator('.picker label');

    await expect(options).toHaveCount(3);
    for (const box of await options.evaluateAll((labels) =>
      labels.map((label) => label.getBoundingClientRect().height),
    )) {
      expect(box).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('never scrolls sideways at 360px, in either language', async ({ page }) => {
    for (const path of ['/compare/', '/pt-br/compare/']) {
      await page.goto(path);

      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('404 page', () => {
  test('answers 404, is never indexed and shows the mascot', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
    await expect(page.getByAltText(/Nelcota mascot/).first()).toBeVisible();
  });

  test('speaks both languages and links home in both locales', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    const main = page.getByRole('main');

    await expect(main.getByRole('link', { name: 'Back to the home page' })).toHaveAttribute(
      'href',
      '/',
    );
    const portuguese = main.getByRole('link', { name: 'Voltar para o início' });
    await expect(portuguese).toHaveAttribute('href', '/pt-br/');
    await expect(portuguese).toHaveAttribute('hreflang', 'pt-BR');
    await expect(main.locator('p[lang="pt-BR"]')).toHaveText(/O mascote procurou/);
  });

  test('fits a 360px phone without errors', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    const failedAssets: string[] = [];
    page.on('response', (response) => {
      if (response.status() < 400) return;

      if (response.request().resourceType() === 'document') return;

      failedAssets.push(response.url());
    });
    await page.setViewportSize(NARROW_PHONE);

    await page.goto('/this-page-does-not-exist', { waitUntil: 'networkidle' });

    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    expect(failedAssets).toEqual([]);
    // The browser logs the page's own 404 status as a failed load; that one is expected.
    expect(errors.filter((error) => !error.includes('status of 404'))).toEqual([]);
  });
});
