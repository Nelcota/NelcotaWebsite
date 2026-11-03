import { SOFTWARE_HOUSE } from './flags.ts';

/**
 * Routes that depend on the SOFTWARE_HOUSE flag, injected by astro.config.ts so each version
 * of / keeps its own CSS (the two homes must never share a page). Everything else lives in
 * src/pages as usual.
 */
export interface FlagRoute {
  readonly pattern: string;
  readonly entrypoint: string;
}

const BAAS_EN = './src/routes/baas/en.astro';
const BAAS_PT = './src/routes/baas/pt-br.astro';

const SOFTWARE_HOUSE_ROUTES: readonly FlagRoute[] = [
  { pattern: '/', entrypoint: './src/routes/house/index.astro' },
  { pattern: '/produtos', entrypoint: './src/routes/house/produtos.astro' },
  { pattern: '/produtos/ratelimit', entrypoint: './src/routes/house/produtos-ratelimit.astro' },
  { pattern: '/produtos/baas', entrypoint: BAAS_EN },
  { pattern: '/pt-br/produtos/baas', entrypoint: BAAS_PT },
  { pattern: '/servicos', entrypoint: './src/routes/house/servicos.astro' },
  { pattern: '/sobre', entrypoint: './src/routes/house/sobre.astro' },
  { pattern: '/transparencia', entrypoint: './src/routes/house/transparencia.astro' },
];

const CURRENT_ROUTES: readonly FlagRoute[] = [
  { pattern: '/', entrypoint: BAAS_EN },
  { pattern: '/pt-br', entrypoint: BAAS_PT },
];

export const FLAG_ROUTES: readonly FlagRoute[] = SOFTWARE_HOUSE
  ? SOFTWARE_HOUSE_ROUTES
  : CURRENT_ROUTES;

/** With the flag on, the Portuguese BaaS home moved, so /pt-br/ sends people to the new home. */
export const FLAG_REDIRECTS: Readonly<Record<string, string>> = SOFTWARE_HOUSE
  ? { '/pt-br': '/' }
  : {};

/** Software house pages carry noindex until the phase is approved, so the sitemap skips them. */
export const NOINDEX_PATHS: readonly string[] = SOFTWARE_HOUSE
  ? ['/', '/produtos/', '/produtos/ratelimit/', '/servicos/', '/sobre/', '/transparencia/']
  : [];
