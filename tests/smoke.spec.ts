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
  test('renders the hero, sections and metadata without console errors', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/');

    await expect(page).toHaveTitle(/Nelcota/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'A whole backend. One binary. Your VPS.',
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/$/);
    await expect(page.locator('link[rel="alternate"][hreflang="pt-BR"]')).toHaveCount(1);
    await expect(page.locator('meta[http-equiv="content-security-policy"]')).toHaveCount(1);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);

    for (const name of ['How it works', 'Speed', 'Security', 'Get started', 'Comparison', 'Docs']) {
      // Hidden behind the menu on phones, so count instead of checking visibility.
      await expect(
        page
          .getByRole('navigation', { name: 'Main', includeHidden: true })
          .getByRole('link', { name, includeHidden: true }),
      ).toHaveCount(1);
    }

    // Every header link lands on a section of the page.
    for (const id of ['api', 'panel', 'how-it-works', 'security', 'speed', 'features', 'start']) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
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
    // Every mascot on the home page is decoration next to text that already names Nelcota.
    await expect(page.getByAltText(/Nelcota mascot/)).toHaveCount(0);
  });

  test('logos and icons come from the shared sprite file', async ({ page, request }) => {
    await page.goto('/');
    const uses = page.locator('svg use[href^="/sprite-"]');
    expect(await uses.count()).toBeGreaterThan(10);

    // One content-hashed file for every logo and icon on the page.
    const hrefs = await uses.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('href') ?? ''),
    );
    const files = new Set(hrefs.map((href) => href.split('#')[0]));
    expect(files.size).toBe(1);
    const [file = ''] = files;
    expect(file).toMatch(/^\/sprite-[0-9a-f]{10}\.svg$/);

    const sprite = await request.get(file);
    expect(sprite.status()).toBe(200);
    expect(await sprite.text()).toContain('id="brand-postgresql"');
  });

  test('the three steps show the documented commands', async ({ page }) => {
    await page.goto('/#start');

    await expect(page.locator('#qs-install')).toContainText('install.sh');
    await expect(page.locator('#qs-migrate')).toContainText('mkdir -p migrations src');
    await expect(page.locator('#qs-migrate')).toContainText('ENABLE ROW LEVEL SECURITY');
    await expect(page.locator('#qs-request')).toContainText('/auth/v1/');
  });

  test('copy buttons say what they copy', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('[data-copy="qs-migrate"]');
    await expect(button).toHaveAttribute('aria-describedby', 'qs-migrate-caption');
    await expect(page.locator('#qs-migrate-caption')).toHaveText(/Terminal\s*second window/);
  });

  test('copy button writes the command to the clipboard and announces it', async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only here');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/#start');
    const button = page.locator('[data-copy="qs-install"]');

    await button.click();

    await expect(button).toContainText('Copied');
    await expect(page.locator('[data-copy-status]')).toHaveText('Copied');
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toContain('install.sh');
  });

  test('theme toggle exposes its pressed state', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Toggle dark mode' }).first();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
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

  test('language switch keeps the section being read', async ({ page }) => {
    await page.goto('/#security');
    await page.locator('[data-locale-switch]').click();

    await expect(page).toHaveURL(/\/pt-br\/#security$/);
  });
});

test.describe('interactive sections', () => {
  test('the speed card switches between numbers and conditions', async ({ page }) => {
    // About the tabs, not the entrance: a card still sliding in can make the click miss.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#speed');
    const numbers = page.getByRole('tab', { name: 'Numbers' });
    const conditions = page.getByRole('tab', { name: 'Conditions' });
    await expect(numbers).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#panel-speed-conditions')).toBeHidden();

    await conditions.click();
    await expect(conditions).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#panel-speed-conditions')).toBeVisible();
    await expect(page.locator('#panel-speed-numbers')).toBeHidden();

    // Arrow keys wrap around, as in the APG tabs pattern.
    await conditions.press('ArrowRight');
    await expect(numbers).toBeFocused();
    await expect(page.locator('#panel-speed-numbers')).toBeVisible();
  });

  test('the step carousel moves with its arrows and stops at the ends', async ({ page }) => {
    await page.goto('/#start');
    const prev = page.getByRole('button', { name: 'Previous step' });
    const next = page.getByRole('button', { name: 'Next step' });
    const track = page.locator('#start [data-carousel-track]');
    await expect(prev).toBeDisabled();

    await next.click();
    await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    await expect(prev).toBeEnabled();

    // Jump to the end instead of clicking through: a click racing the smooth scroll
    // can land just as the button turns itself off.
    await track.evaluate((element) => element.scrollTo({ left: element.scrollWidth }));
    await expect(next).toBeDisabled();
    await expect(prev).toBeEnabled();
  });

  test('the panel carousel shows both real screenshots', async ({ page }) => {
    await page.goto('/#panel');
    const frame = page.locator('#panel [data-carousel]');
    // One slide per screen (each ships a light and a dark image).
    await expect(frame.locator('[data-carousel-track] > li')).toHaveCount(2);

    await frame.getByRole('button', { name: 'Next screen' }).click();
    await expect(frame.getByRole('button', { name: 'Previous screen' })).toBeEnabled();
  });
});

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('closes with Escape and after following a link', async ({ page }) => {
    await page.goto('/');
    const menu = page.locator('[data-mobile-menu]');
    const toggle = menu.locator('summary');

    await toggle.click();
    await expect(menu).toHaveAttribute('open', '');
    await page.keyboard.press('Escape');
    await expect(menu).not.toHaveAttribute('open', '');
    await expect(toggle).toBeFocused();

    await toggle.click();
    await menu.getByRole('link', { name: 'Security' }).click();
    await expect(menu).not.toHaveAttribute('open', '');
    await expect(page).toHaveURL(/#security$/);
  });
});

test.describe('home (pt-br)', () => {
  test('is translated', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/pt-br/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Backend completo. Um binário. Sua VPS.',
    );
    await expect(page.getByRole('button', { name: 'Próximo passo' })).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
    expect(errors).toEqual([]);
  });
});

/** Animated blocks still partly transparent: should be none once everything has played. */
function hiddenAfterMotion(): (string | undefined)[] {
  return [
    ...document.querySelectorAll(
      '[data-words] .word, [data-fade], [data-cascade] > *, [data-stagger] > *',
    ),
  ]
    .filter((element) => Number.parseFloat(getComputedStyle(element).opacity) < 0.99)
    .map((element) => element.textContent?.trim().slice(0, 40));
}

test.describe('motion', () => {
  test('GSAP loads only once the visitor scrolls, and every animated block ends visible', async ({
    page,
  }) => {
    const scripts: string[] = [];
    page.on('request', (request) => {
      if (request.resourceType() === 'script') scripts.push(request.url());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const before = scripts.length;

    await page.mouse.wheel(0, 400);
    await expect.poll(() => scripts.length).toBeGreaterThan(before);
    for (let step = 0; step < 40; step += 1) await page.mouse.wheel(0, 600);

    await expect.poll(() => page.evaluate(hiddenAfterMotion), { timeout: 10_000 }).toEqual([]);
  });

  test('opening the page on an anchor never leaves the blocks above it hidden', async ({
    page,
  }) => {
    await page.goto('/#features');
    // Let the browser finish its own smooth scroll to the anchor first.
    await expect
      .poll(() =>
        page.evaluate(
          () => document.querySelector('#features')?.getBoundingClientRect().top ?? Number.NaN,
        ),
      )
      .toBeLessThan(300);
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'ready');
    await page.mouse.wheel(0, -300);
    for (let step = 0; step < 30; step += 1) await page.mouse.wheel(0, -600);
    // And back down to the end: the closing blocks below the anchor play too.
    for (let step = 0; step < 40; step += 1) await page.mouse.wheel(0, 600);

    await expect.poll(() => page.evaluate(hiddenAfterMotion), { timeout: 10_000 }).toEqual([]);
  });

  test('a focused link inside a block that has not played yet shows at once', async ({ page }) => {
    await page.goto('/');
    await page.mouse.wheel(0, 200);
    const link = page.locator('#security [data-fade] a').first();
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'ready');

    await link.focus();

    await expect
      .poll(() =>
        link.evaluate((element) =>
          Number.parseFloat(getComputedStyle(element.closest('[data-fade]') ?? element).opacity),
        ),
      )
      .toBe(1);
  });

  test('counters end on the exact figure from the page', async ({ page }) => {
    await page.goto('/');
    await page.mouse.wheel(0, 200);
    await page.locator('#speed').scrollIntoViewIfNeeded();
    const first = page.locator('#speed [data-count-to]').first();

    await expect(first).toHaveText('1,965', { timeout: 10_000 });
    await expect(page.locator('#speed .sr-only').first()).toHaveText('1,965');
  });

  test('with reduced motion nothing is loaded and the numbers show their final values', async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    const scripts: string[] = [];
    page.on('request', (request) => {
      if (request.resourceType() === 'script') scripts.push(request.url());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const before = scripts.length;

    await page.mouse.wheel(0, 2000);
    await page.locator('#speed').scrollIntoViewIfNeeded();

    await expect(page.locator('#speed [data-count-to]').first()).toHaveText('1,965');
    expect(scripts.length).toBe(before);
    await context.close();
  });

  test('the manifesto icons are decorative, so screen readers hear each word once', async ({
    page,
  }) => {
    await page.goto('/');
    const manifesto = page.locator('[data-manifesto]');

    await expect(manifesto).toContainText('A weekend project');
    await expect(manifesto.locator('.mark-pill')).toHaveCount(4);
    for (const pill of await manifesto.locator('.mark-pill').all()) {
      await expect(pill).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('the moving band and tiles can be paused', async ({ page }) => {
    await page.goto('/');
    const pause = page.locator('[data-motion-pause]');

    await pause.click();

    await expect(pause).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-motion-paused', '');
  });
});

test.describe('navigation aids', () => {
  test('the header marks the section being read', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1024, 'desktop navigation only');
    await page.goto('/');

    await page.locator('#security').scrollIntoViewIfNeeded();

    await expect(page.locator('header nav a[href$="#security"]').first()).toHaveAttribute(
      'aria-current',
      'location',
    );
  });

  test('phones get a sticky Get started once the hero is gone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const cta = page.locator('[data-sticky-cta]');

    await expect(cta).not.toHaveAttribute('data-shown', '');
    await page.locator('#how-it-works').scrollIntoViewIfNeeded();
    await expect(cta).toHaveAttribute('data-shown', '');
    await page.locator('#start').scrollIntoViewIfNeeded();
    await expect(cta).not.toHaveAttribute('data-shown', '');
  });

  test('the footer links to the comparison page', async ({ page }) => {
    await page.goto('/');

    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: /Comparison/ })
      .click();

    await expect(page).toHaveURL(/\/compare\/$/);
  });
});

test.describe('static files', () => {
  for (const path of [
    '/robots.txt',
    '/sitemap-index.xml',
    '/manifest.webmanifest',
    '/og/en.png',
    '/og/pt-br.png',
    '/favicon.png',
  ]) {
    test(`serves ${path}`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
    });
  }
});
