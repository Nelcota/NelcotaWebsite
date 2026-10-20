import { expect, test } from '@playwright/test';

for (const width of [1440, 3840, 5120]) {
  test(`moving bands cover a ${width}px viewport throughout their loop`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const coverage = await page.locator('.logos, .drift').evaluateAll((bands) =>
      bands.flatMap((band) => {
        const sets = [...band.querySelectorAll<HTMLElement>('.logos-set, .drift-set')];
        return [0, 0.5, 0.999].map((progress) => {
          for (const set of sets) {
            for (const animation of set.getAnimations()) {
              animation.pause();
              animation.currentTime = Number(animation.effect?.getTiming().duration) * progress;
            }
          }
          const bounds = band.getBoundingClientRect();
          const first = sets[0]?.getBoundingClientRect();
          const last = sets.at(-1)?.getBoundingClientRect();
          return (
            !!first && !!last && first.left <= bounds.left + 1 && last.right >= bounds.right - 1
          );
        });
      }),
    );
    expect(coverage).toHaveLength(9);
    expect(coverage.every(Boolean)).toBe(true);
  });
}
