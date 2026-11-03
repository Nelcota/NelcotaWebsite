import { getRelativeLocaleUrl } from 'astro:i18n';
import type { Locale } from '../i18n/utils.ts';
import { SOFTWARE_HOUSE } from './flags.ts';

/**
 * Where the Nelcota BaaS landing (components/Home.astro) lives. With SOFTWARE_HOUSE on it moves
 * under the software house products, /produtos/baas/ and /pt-br/produtos/baas/; off, it stays
 * the home. Locale-independent path, without leading slash, as Seo and the language switch expect.
 */
export const BAAS_PATH = SOFTWARE_HOUSE ? 'produtos/baas/' : '';

/** URL of the BaaS landing in `locale`, base path included. */
export function baasHomeUrl(locale: Locale): string {
  return getRelativeLocaleUrl(locale, BAAS_PATH);
}
