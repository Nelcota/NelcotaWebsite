import { getRelativeLocaleUrl } from 'astro:i18n';
import type { Locale } from '../i18n/utils.ts';

/**
 * The Nelcota BaaS landing (components/Home.astro) lives under the software house products
 * (docs/ROADMAP.md, 2026-11-02): /produtos/baas/ in English, /pt-br/produtos/baas/ in Portuguese.
 * Locale-independent path, without leading slash, as Seo and the language switch expect.
 */
export const BAAS_PATH = 'produtos/baas/';

/** URL of the BaaS landing in `locale`, base path included. */
export function baasHomeUrl(locale: Locale): string {
  return getRelativeLocaleUrl(locale, BAAS_PATH);
}
