import { expect, type Page, test } from '@playwright/test';

// Software house pages (docs/ROADMAP.md): Portuguese only and noindex until the phase is approved.
const PAGES = [
  { path: '/', title: 'Nelcota · Software house', heading: 'Construímos os nossos produtos.' },
  {
    path: '/produtos',
    title: 'Produtos · Nelcota',
    heading: 'Seis produtos. Um deles roda o seu sistema.',
  },
  { path: '/produtos/ratelimit', title: 'RateLimit · Nelcota', heading: /Quando algo falha/ },
  {
    path: '/servicos',
    title: 'Serviços · Nelcota',
    heading: 'O seu sistema, na mesma base dos nossos produtos.',
  },
  { path: '/sobre', title: 'Sobre · Nelcota', heading: 'A Nelcota mantém o que constrói.' },
  { path: '/transparencia', title: 'Transparência · Nelcota', heading: 'Tudo à vista.' },
] as const;

const NAV = [
  { name: 'Produtos', href: '/produtos' },
  { name: 'Serviços', href: '/servicos' },
  { name: 'Sobre', href: '/sobre' },
  { name: 'Transparência', href: '/transparencia' },
] as const;

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

/** Fails the test if the page asks any host but its own for anything. */
function collectForeignRequests(page: Page, origin: string): string[] {
  const foreign: string[] = [];
  page.on('request', (request) => {
    if (!request.url().startsWith(origin) && !request.url().startsWith('data:'))
      foreign.push(request.url());
  });
  return foreign;
}

test.describe('software house pages', () => {
  for (const entry of PAGES) {
    test(`${entry.path} renders in Portuguese, stays out of search and has no errors`, async ({
      page,
    }) => {
      const errors = collectConsoleErrors(page);
      await page.goto(entry.path);

      await expect(page).toHaveTitle(entry.title);
      await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        'noindex, nofollow',
      );
      await expect(page.locator('meta[http-equiv="content-security-policy"]')).toHaveCount(1);
      // The name screen readers hear: the animated copies of the title are aria-hidden.
      await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(entry.heading);
      await expect(page.locator('img:not([alt])')).toHaveCount(0);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });
  }

  test('every page links to the four sections and marks the current one', async ({ page }) => {
    await page.goto('/sobre');
    const nav = page.getByRole('navigation', { name: 'Principal', includeHidden: true });
    for (const link of NAV) {
      await expect(nav.getByRole('link', { name: link.name, includeHidden: true })).toHaveAttribute(
        'href',
        link.href,
      );
    }
    await expect(nav.getByRole('link', { name: 'Sobre', includeHidden: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('the sitemap leaves the noindex pages out and lists the BaaS landing', async ({
    request,
  }) => {
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => new URL(match[1] ?? '').pathname,
    );
    for (const path of [
      '/',
      '/produtos/',
      '/produtos/ratelimit/',
      '/servicos/',
      '/sobre/',
      '/transparencia/',
    ]) {
      expect(paths).not.toContain(path);
    }
    expect(paths).toContain('/produtos/baas/');
    expect(paths).toContain('/pt-br/produtos/baas/');
  });
});

test.describe('home', () => {
  test('with reduced motion the opening is skipped and the title shows at once', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/hm-skip-intro/);
    await expect(page.locator('.rl-hero .rl-text').first()).toBeVisible();
  });

  test('scrolling through the products changes the word', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const counter = page.locator('[data-word-counter]');
    await expect(counter).toHaveText('01 / 04');

    await page.locator('[data-word-dot="2"]').click();
    await expect(counter).toHaveText('03 / 04');
    await expect(page.locator('[data-word-dot="2"]')).toHaveAttribute('aria-current', 'true');
  });
});

test.describe('contact forms never send anything', () => {
  for (const path of ['/', '/servicos']) {
    test(`${path} validates, then says sending is not wired up`, async ({ page, baseURL }) => {
      const foreign = collectForeignRequests(page, baseURL ?? '');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`${path}#contato`);
      const form = page.locator('[data-contact-form]');
      const submit = form.getByRole('button', { name: 'Enviar mensagem' });

      await submit.click();
      await expect(form.getByText('Escreva o seu nome.')).toBeVisible();
      await expect(form.getByLabel('Nome')).toHaveAttribute('aria-invalid', 'true');

      await form.getByLabel('Nome').fill('Ana Teste');
      await form.getByLabel('E-mail').fill('ana@example.com');
      await form.getByLabel('Conte em poucas linhas').fill('Preciso de uma loja virtual simples.');
      const url = page.url();
      await submit.click();

      const notice = page.locator('[data-contact-done], [data-contact-sent]');
      await expect(notice).toBeVisible();
      await expect(notice).toContainText('não está ligado');
      await expect(form).toBeHidden();
      expect(page.url()).toBe(url);
      expect(foreign).toEqual([]);
    });
  }
});

test.describe('RateLimit demo', () => {
  test('a burst of ten lets three through and limits seven', async ({ page }) => {
    await page.goto('/produtos/ratelimit');
    await page.getByRole('button', { name: 'Enviar 10 de uma vez' }).click();

    await expect(page.locator('[data-demo-count="ok"]')).toHaveText('3');
    await expect(page.locator('[data-demo-count="limited"]')).toHaveText('7');
    await expect(page.locator('[data-demo-result]')).toContainText('HTTP 429');
  });

  test('with the store down every request is blocked', async ({ page }) => {
    await page.goto('/produtos/ratelimit');
    await page.getByRole('button', { name: 'Simular Valkey fora do ar' }).click();
    await page.getByRole('button', { name: 'Enviar 1 requisição' }).click();

    await expect(page.locator('[data-demo-count="blocked"]')).toHaveText('1');
    await expect(page.locator('[data-demo-count="ok"]')).toHaveText('0');
  });
});
