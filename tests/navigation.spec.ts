import { expect, test } from '@playwright/test';

// Cancel navigation after the spy sees the click, so its intermediate state and
// safety deadline can be checked without racing a native smooth scroll.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#security');
  await expect(page.locator('a[data-spy][href$="#security"]').first()).toHaveAttribute(
    'aria-current',
    'location',
  );
  await page.evaluate(() => {
    document.addEventListener('click', (event) => event.preventDefault());
  });
});

test('a second click can return to the section still being read', async ({ page }) => {
  const current = await page.evaluate(() => {
    document.querySelector<HTMLAnchorElement>('a[data-spy][href$="#speed"]')?.click();
    document.querySelector<HTMLAnchorElement>('a[data-spy][href$="#security"]')?.click();
    return document.querySelector('a[data-spy][aria-current="location"]')?.getAttribute('href');
  });
  expect(current).toBe('/#security');
});

test('modified clicks leave the current section unchanged', async ({ page }) => {
  for (const modifier of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey']) {
    await page
      .locator('a[data-spy][href$="#speed"]')
      .first()
      .dispatchEvent('click', {
        button: 0,
        [modifier]: true,
      });
    await expect(page.locator('a[data-spy][href$="#security"]').first()).toHaveAttribute(
      'aria-current',
      'location',
    );
  }
});

test('scroll events cannot extend the two-second safety deadline', async ({ page }) => {
  await page.clock.install();
  await page.evaluate(() => {
    document.querySelector<HTMLAnchorElement>('a[data-spy][href$="#speed"]')?.click();
    window.setInterval(() => window.dispatchEvent(new Event('scroll')), 100);
  });
  await expect(page.locator('a[data-spy][href$="#speed"]').first()).toHaveAttribute(
    'aria-current',
    'location',
  );
  await page.clock.runFor(2100);
  await expect(page.locator('a[data-spy][href$="#security"]').first()).toHaveAttribute(
    'aria-current',
    'location',
  );
});

test('scroll completion and manual input release the click lock', async ({ page }) => {
  for (const type of ['scrollend', 'wheel', 'touchstart', 'keydown']) {
    await page.evaluate((eventType) => {
      document.querySelector<HTMLAnchorElement>('a[data-spy][href$="#speed"]')?.click();
      window.dispatchEvent(
        eventType === 'keydown'
          ? new KeyboardEvent('keydown', { key: 'PageDown' })
          : new Event(eventType),
      );
    }, type);
    await expect(page.locator('a[data-spy][href$="#security"]').first()).toHaveAttribute(
      'aria-current',
      'location',
    );
  }
});

test('smooth navigation keeps the target selected while passing other sections', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const selected = await page.evaluate(async () => {
    const selections: string[] = [];
    const observer = new MutationObserver(() => {
      const href = document
        .querySelector('a[data-spy][aria-current="location"]')
        ?.getAttribute('href');
      if (href) selections.push(href);
    });
    observer.observe(document.querySelector('header') as HTMLElement, {
      attributes: true,
      attributeFilter: ['aria-current'],
      subtree: true,
    });
    await new Promise<void>((resolve) => {
      window.addEventListener('scrollend', () => resolve(), { once: true });
      window.setTimeout(resolve, 2500);
      document.querySelector<HTMLAnchorElement>('a[data-spy][href$="#speed"]')?.click();
    });
    observer.disconnect();
    return selections;
  });
  expect(selected.length).toBeGreaterThan(0);
  expect(selected.every((href) => href === '/#speed')).toBe(true);
  await expect(page.locator('a[data-spy][href$="#speed"]').first()).toHaveAttribute(
    'aria-current',
    'location',
  );
});
