import { getImage } from 'astro:assets';
import type { APIRoute } from 'astro';
import mascot from '../assets/mascot.png';
import { t } from '../i18n/utils.ts';
import { SITE_NAME } from '../lib/site.ts';

/** Light canvas color (--color-canvas in global.css), shown while the app loads. */
const CANVAS_LIGHT = '#f5f5f4';
/** Brand accent. */
const ACCENT = '#87dba6';
const ICON_SIZES = [192, 512] as const;

/** Web app manifest with icons derived from the mascot at build time. */
export const GET: APIRoute = async () => {
  const [small, large] = ICON_SIZES;
  const [icon192, icon512] = await Promise.all([
    getImage({ src: mascot, width: small, height: small, format: 'png' }),
    getImage({ src: mascot, width: large, height: large, format: 'png' }),
  ]);

  const manifest = {
    name: SITE_NAME,
    short_name: SITE_NAME,
    // The manifest has no locale: it uses the default (English) description.
    description: t('en').meta.description,
    start_url: import.meta.env.BASE_URL,
    display: 'browser',
    background_color: CANVAS_LIGHT,
    theme_color: ACCENT,
    icons: [
      { src: icon192.src, sizes: `${small}x${small}`, type: 'image/png' },
      { src: icon512.src, sizes: `${large}x${large}`, type: 'image/png', purpose: 'any maskable' },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
};
