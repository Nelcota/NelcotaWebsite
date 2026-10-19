/**
 * Every brand logo and line icon as a <symbol>, in one static file the browser
 * caches across pages. BrandLogo and Icon draw them with <use href="…#id">,
 * which keeps ~13 KB (gzip) of path data out of each HTML document.
 *
 * The file name carries a hash of its content (sprite-<hash>.svg), so the
 * server can cache it for a year: a changed logo is a new URL.
 */
import { createHash } from 'node:crypto';
import { BRAND_NAMES, brandSymbolBody, brandSymbolId, brandViewBox } from './brand-logos.ts';
import { ICON_NAMES, ICONS, iconSymbolId } from './icons.ts';
import { withBase } from './site.ts';

const VERSION_LENGTH = 10;

function brandSymbols(): string {
  return BRAND_NAMES.map(
    (name) =>
      `<symbol id="${brandSymbolId(name)}" viewBox="${brandViewBox(name)}">${brandSymbolBody(name)}</symbol>`,
  ).join('');
}

function iconSymbols(): string {
  return ICON_NAMES.map(
    (name) => `<symbol id="${iconSymbolId(name)}" viewBox="0 0 24 24">${ICONS[name].body}</symbol>`,
  ).join('');
}

export const SPRITE_SVG = `<svg xmlns="http://www.w3.org/2000/svg">${brandSymbols()}${iconSymbols()}</svg>`;

export const SPRITE_VERSION = createHash('sha256')
  .update(SPRITE_SVG)
  .digest('hex')
  .slice(0, VERSION_LENGTH);

export const SPRITE_URL = withBase(`sprite-${SPRITE_VERSION}.svg`);
