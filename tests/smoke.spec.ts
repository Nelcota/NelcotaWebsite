import { expect, type Page, test } from '@playwright/test';

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test.describe('home (en)', () => {
  test('renders the hero, projects and metadata without console errors', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/');

    await expect(page).toHaveTitle(/Nelcota/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Self-hosted, open-source tools',
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/$/);
    await expect(page.locator('link[rel="alternate"][hreflang="pt-BR"]')).toHaveCount(1);
    await expect(page.locator('meta[http-equiv="content-security-policy"]')).toHaveCount(1);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);

    const projects = page.getByRole('region', { name: 'Projects' });
    for (const name of ['Nelcota', 'NelcotaScreenShare', 'NelcotaDeploy', 'NelcotaPrompts']) {
      await expect(projects.getByRole('heading', { level: 3, name, exact: true })).toBeVisible();
    }
    await expect(projects.getByText('In progress', { exact: true })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('has no horizontal overflow', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('every image has alt text', async ({ page }) => {
    await page.goto('/');
    const missing = await page.locator('img:not([alt])').count();
    expect(missing).toBe(0);
    await expect(page.getByAltText(/Nelcota mascot/)).toBeVisible();
  });

  test('code tabs switch with mouse and keyboard', async ({ page }) => {
    await page.goto('/#build');
    const tsTab = page.getByRole('tab', { name: 'TypeScript' });
    const rustTab = page.getByRole('tab', { name: 'Rust' });
    await expect(tsTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#panel-rust')).toBeHidden();

    await rustTab.click();
    await expect(rustTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#panel-rust')).toBeVisible();
    await expect(page.locator('#panel-ts')).toBeHidden();
    await expect(page.locator('#panel-rust')).toContainText('nelcota-client = "0.1.2"');

    await rustTab.press('ArrowLeft');
    await expect(tsTab).toBeFocused();
    await expect(page.locator('#panel-ts')).toBeVisible();
  });

  test('copy button writes the snippet to the clipboard and announces it', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/#build');
    const button = page.locator('[data-copy="ts-install"]');
    await button.click();
    await expect(button).toContainText('Copied');
    await expect(page.locator('[data-copy-status]')).toHaveText('Copied');
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toContain('npm install @nelcota/client');
  });

  test('theme toggle persists in localStorage and survives reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.getByRole('button', { name: 'Toggle dark mode' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => localStorage.getItem('nelcota-theme'))).toBe('dark');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe(
      'dark',
    );
  });

  test('language switch leads to the Portuguese page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Ler em português/ }).click();
    await expect(page).toHaveURL(/\/pt-br\/?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  });
});

test.describe('home (pt-br)', () => {
  test('is translated', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/pt-br/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ferramentas open source');
    await expect(page.getByRole('heading', { level: 2, name: 'Projetos' })).toBeVisible();
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
    expect(errors).toEqual([]);
  });
});

test.describe('404 and static files', () => {
  test('unknown routes show the 404 page with the mascot', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
    await expect(page.getByAltText(/Nelcota mascot/)).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  });

  for (const path of [
    '/robots.txt',
    '/sitemap-index.xml',
    '/manifest.webmanifest',
    '/og/en.png',
    '/og/pt-br.png',
    '/favicon.svg',
  ]) {
    test(`serves ${path}`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
    });
  }
});
