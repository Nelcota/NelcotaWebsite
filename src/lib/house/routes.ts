import { withBase } from '../site.ts';

/** URLs of the software house pages (docs/ROADMAP.md, "Nelcota software house"). */
export const HOUSE_ROUTES = {
  home: withBase(''),
  products: withBase('produtos'),
  rateLimit: withBase('produtos/ratelimit'),
  // The BaaS landing, its docs and the comparison are in Portuguese like these pages (lib/baas.ts).
  baas: withBase('pt-br/produtos/baas/'),
  docs: withBase('pt-br/docs/'),
  compare: withBase('pt-br/compare/'),
  services: withBase('servicos'),
  contact: withBase('servicos#contato'),
  about: withBase('sobre'),
  transparency: withBase('transparencia'),
} as const;

export type HouseRoute = keyof typeof HOUSE_ROUTES;

export interface HouseNavLink {
  readonly route: HouseRoute;
  readonly label: string;
}

/** Main navigation, same order on every page. */
export const HOUSE_NAV: readonly HouseNavLink[] = [
  { route: 'products', label: 'Produtos' },
  { route: 'services', label: 'Serviços' },
  { route: 'about', label: 'Sobre' },
  { route: 'transparency', label: 'Transparência' },
];
