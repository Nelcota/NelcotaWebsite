import { expect, type Page, test } from '@playwright/test';

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test.describe('docs', () => {
  test('the header links to the docs index, which lists every group', async ({ page }) => {
    await page.goto('/');
    const docsLink = page
      .getByRole('navigation', { name: 'Main', includeHidden: true })
      .getByRole('link', { name: 'Docs', includeHidden: true });
    await expect(docsLink).toHaveAttribute('href', '/docs/');

    await page.goto('/docs/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Documentation');
    for (const group of ['Start', 'Build an application', 'Operate', 'Reference', 'Design']) {
      await expect(page.getByRole('heading', { level: 3, name: group })).toHaveCount(1);
    }
    await expect(page.locator('.docs-featured a')).toHaveCount(3);
    await expect(page.locator('.docs-group')).toHaveCount(5);
    // The index is a landing page: the big search pill instead of the sidebar.
    await expect(page.locator('.docs-search-large #docs-search')).toBeVisible();
    await expect(page.locator('.docs-sidebar')).toHaveCount(0);
  });

  test('each search box points at a static index that exists', async ({ page, request }) => {
    for (const path of ['/docs/', '/pt-br/docs/cli/']) {
      await page.goto(path);
      const urls = await page
        .locator('[data-docs-search]')
        .evaluateAll((boxes) => boxes.map((box) => box.getAttribute('data-index') ?? ''));
      expect(urls.length).toBeGreaterThan(0);
      for (const url of new Set(urls)) {
        expect(url).toMatch(/search\.json$/);
        expect((await request.get(url)).status()).toBe(200);
      }
    }
  });

  test('a page has a breadcrumb, an edit link and previous / next cards', async ({ page }) => {
    await page.goto('/docs/api/');
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb.getByRole('link', { name: 'Documentation' })).toHaveAttribute(
      'href',
      '/docs/',
    );
    await expect(breadcrumb).toContainText('Build an application');
    await expect(page.locator('.docs-meta a[href*="github.com"]')).toContainText(
      'View source on GitHub',
    );
    await expect(page.locator('.docs-meta')).toContainText('min read');

    const pager = page.getByRole('navigation', { name: 'Previous / Next' });
    await expect(pager.locator('a.docs-pager-prev')).toHaveAttribute('href', '/docs/glossary/');
    await expect(pager.locator('a.docs-pager-next')).toHaveAttribute('href', '/docs/auth/');
  });

  test('the sidebar marks the page being read', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'the sidebar is desktop only');
    await page.goto('/docs/api/');
    const current = page.locator('.docs-sidebar [aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText('REST API');
  });

  test('a page renders the repository guide with anchors, code and metadata', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/docs/quickstart/');

    await expect(page).toHaveTitle(/Quickstart: local development · Documentation · Nelcota/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/docs\/quickstart\/$/,
    );
    await expect(page.locator('link[rel="alternate"][hreflang="pt-BR"]')).toHaveAttribute(
      'href',
      /\/pt-br\/docs\/quickstart\/$/,
    );
    await expect(page.locator('h2[id="1-install-the-binary"]')).toBeVisible();
    await expect(page.locator('h2[id="1-install-the-binary"] a.doc-anchor')).toHaveAttribute(
      'href',
      '#1-install-the-binary',
    );
    await expect(page.locator('.doc-code').first()).toContainText('install.sh');
    await expect(page.locator('.doc-body a[href="/docs/deploy/"]').first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('portuguese pages use the repository catalog and keep english anchors', async ({ page }) => {
    await page.goto('/pt-br/docs/quickstart/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Primeiros passos: desenvolvimento local',
    );
    await expect(page.locator('h2[id="1-install-the-binary"]')).toContainText('Instale o binário');
    await expect(page.locator('.docs-note')).toHaveCount(0);
  });

  test('a page without a portuguese catalog says so and marks its language', async ({ page }) => {
    await page.goto('/pt-br/docs/cli/');

    await expect(page.locator('.docs-note')).toContainText('original em inglês');
    await expect(page.locator('.doc-body')).toHaveAttribute('lang', 'en');
  });

  test('search finds a section and opens it', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'the keyboard shortcut is for desktop');
    await page.goto('/docs/');
    await page.keyboard.press('/');
    const input = page.locator('#docs-search');
    await expect(input).toBeFocused();

    await input.fill('pitr recover');
    const options = page.locator('#docs-search-results [role="option"]');
    await expect(options.first()).toBeVisible();
    await expect(input).toHaveAttribute('aria-expanded', 'true');

    await input.press('ArrowDown');
    await expect(options.first()).toHaveAttribute('aria-selected', 'true');
    await input.press('Enter');
    await expect(page).toHaveURL(/\/docs\/[a-z-]+\/#/);
  });

  test('code blocks can be copied', async ({ page, context }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'clipboard permission is desktop Chrome only');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/docs/quickstart/');
    const button = page.locator('.doc-copy').first();
    await button.click();

    await expect(button).toHaveAttribute('data-state', 'done');
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain('install.sh');
  });

  test('phones get the page list in a menu and no horizontal overflow', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'phone layout');
    await page.goto('/pt-br/docs/cli/');
    const menu = page.locator('.docs-mobile-bar details.docs-sheet').first();
    await menu.locator('summary').click();
    await expect(menu.getByRole('link', { name: 'API REST' })).toBeVisible();
    await expect(menu.locator('#docs-search-mobile')).toBeVisible();
    await menu.locator('summary').click();

    const contents = page.locator('.docs-mobile-bar details.docs-sheet-toc');
    await contents.locator('summary').click();
    await expect(contents.locator('[data-toc] a').first()).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('the contents list marks the section being read', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'the contents column is desktop only');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/docs/api/#errors');
    const current = page.locator('.docs-toc [aria-current="true"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute('href', '#errors');
  });

  test('the header marks Docs as the current section', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'the header links are in the menu on phones');
    await page.goto('/docs/api/');
    await expect(
      page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Docs' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('the search index is static JSON for each locale', async ({ request }) => {
    for (const path of ['/docs/search.json', '/pt-br/docs/search.json']) {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      const pages: unknown = await response.json();
      expect(Array.isArray(pages) && pages.length).toBeGreaterThan(20);
    }
  });
  test('version navigation preserves locale and guide, with pinned metadata and source', async ({
    page,
  }) => {
    await page.goto('/pt-br/docs/sdk/');
    await expect(page.locator('.docs-version-metadata')).toContainText('TypeScript 0.2.1');
    const archive = page
      .getByRole('navigation', { name: 'Versão da documentação' })
      .getByRole('link', { name: 'Snapshot da release v0.5.0' });
    await expect(archive).toHaveAttribute('href', '/pt-br/docs/versions/v0.5.0/sdk/');
    await archive.click();
    await expect(page.locator('.docs-version-metadata')).toContainText('TypeScript 0.2.0');
    await expect(page.locator('.docs-archive-note')).toBeVisible();
    await expect(page.locator('.docs-meta a')).toHaveAttribute(
      'href',
      /\/blob\/b18412a65f4accc4d759d7f840e50420d32d7579\//,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/pt-br\/docs\/versions\/v0.5.0\/sdk\/$/,
    );
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
      'href',
      /\/docs\/versions\/v0.5.0\/sdk\/$/,
    );
    await expect(page.locator('.docs-pager a').first()).toHaveAttribute(
      'href',
      /\/pt-br\/docs\/versions\/v0.5.0\//,
    );
  });

  test('a guide added after the release falls back to the archive index', async ({ page }) => {
    await page.goto('/docs/versions/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Versions and upgrades');
    await expect(
      page
        .getByRole('navigation', { name: 'Documentation version' })
        .getByRole('link', { name: 'Release snapshot v0.5.0' }),
    ).toHaveAttribute('href', '/docs/versions/v0.5.0/');
  });

  test('archive search and internal links stay inside the selected snapshot', async ({
    page,
    request,
  }) => {
    await page.goto('/docs/versions/v0.5.0/quickstart/');
    await expect(
      page.locator('.doc-body a[href="/docs/versions/v0.5.0/deploy/"]').first(),
    ).toBeVisible();
    for (const locale of ['', '/pt-br']) {
      const path = `${locale}/docs/versions/v0.5.0/search.json`;
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      const entries: unknown = await response.json();
      expect(Array.isArray(entries)).toBe(true);
      if (!Array.isArray(entries)) throw new Error('Expected search entries');
      for (const entry of entries) {
        expect(
          Array.isArray(entry) &&
            typeof entry[1] === 'string' &&
            entry[1].startsWith(`${locale}/docs/versions/v0.5.0/`),
        ).toBe(true);
      }
    }
    expect((await request.get('/docs/versions/v9.9.9/sdk/')).status()).toBe(404);
  });
});
