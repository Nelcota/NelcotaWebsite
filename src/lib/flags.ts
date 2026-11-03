/**
 * Build-time feature flags, read from the environment when the site is built (never in the
 * browser). Off by default: a build without the variable is the site as it was.
 */

/** Truthy only for the exact string "true", so a typo keeps the flag off. */
function isOn(name: string): boolean {
  return process.env[name]?.trim() === 'true';
}

/**
 * SOFTWARE_HOUSE=true makes / the software house home and moves the BaaS landing to
 * /produtos/baas/ (docs/ROADMAP.md, 2026-11-02). Turning it off and rebuilding undoes it.
 */
export const SOFTWARE_HOUSE: boolean = isOn('SOFTWARE_HOUSE');
