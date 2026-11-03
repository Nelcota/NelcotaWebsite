/** Copy of /transparencia, from the mockup "Nelcota · Hero da home" (Transparencia.dc.html). */

/** 'live' is shown in white; everything else in grey (the mockup keeps status colorless). */
export type ProductStatusKind = 'live' | 'other';

export interface ProductStatus {
  readonly name: string;
  readonly family: string;
  readonly kind: ProductStatusKind;
  readonly status: string;
  readonly version: string;
  readonly note: string;
}

export interface Release {
  readonly version: string;
  readonly date: string;
  readonly title: string;
}

export interface Decision {
  readonly date: string;
  readonly text: string;
}

export interface RoadmapItem {
  readonly when: string;
  readonly title: string;
  readonly text: string;
}

export const STATUS_UPDATED_AT = '02/11/2026';

export const PRODUCT_STATUSES: readonly ProductStatus[] = [
  {
    name: 'Nelcota BaaS',
    family: 'Infraestrutura',
    kind: 'live',
    status: 'Em uso pelos clientes',
    version: 'v0.5.6 · 27/10/2026',
    note: 'Open source, Apache-2.0.',
  },
  {
    name: 'RateLimit',
    family: 'Infraestrutura',
    kind: 'other',
    status: 'Implementado e testado',
    version: '—',
    note: 'Nenhum crate publicado. Não é certificação de produção.',
  },
  {
    name: 'Nelcota Deploy',
    family: 'Infraestrutura',
    kind: 'other',
    status: 'Em desenvolvimento',
    version: '—',
    note: 'Painel self-hosted para VPS com Docker.',
  },
  {
    name: 'Nelcota AI',
    family: 'Aplicações',
    kind: 'other',
    status: 'Em desenvolvimento',
    version: '—',
    note: 'Construído sobre o Nelcota BaaS.',
  },
  {
    name: 'Nelcota ScreenShare',
    family: 'Aplicações',
    kind: 'other',
    status: 'Primeira versão',
    version: 'v0.1.0',
    note: 'Self-hosted, com LiveKit.',
  },
  {
    name: 'Nelcota Prompts',
    family: 'Aplicações',
    kind: 'live',
    status: 'Em uso',
    version: '—',
    note: 'Acesso só por convite.',
  },
];

export const RELEASES_URL = 'https://github.com/Nelcota/Nelcota/releases';

/** How many releases show before "Mostrar as N versões". */
export const RELEASES_VISIBLE = 4;

export const RELEASES: readonly Release[] = [
  { version: 'v0.5.6', date: '27/10/2026', title: 'Senhas legíveis e controlador sem travamentos' },
  {
    version: 'v0.5.5',
    date: '27/10/2026',
    title: 'Endereços de saída mais seguros e um painel mais rápido',
  },
  {
    version: 'v0.5.4',
    date: '25/10/2026',
    title: 'Integridade de arquivos e sessões mais estáveis',
  },
  { version: 'v0.5.3', date: '23/10/2026', title: 'Identidade oficial e navegação mais clara' },
  { version: 'v0.5.2', date: '23/10/2026', title: 'Um espaço operacional mais claro' },
  {
    version: 'v0.5.1',
    date: '21/10/2026',
    title: 'Instalação, autenticação e painel mais confiáveis',
  },
  {
    version: 'v0.5.0',
    date: '19/10/2026',
    title: 'Recuperação, autenticação e controle de projetos',
  },
  {
    version: 'v0.4.0',
    date: '11/10/2026',
    title: 'Webhooks transacionais e correções de segurança',
  },
];

export const DECISIONS: readonly Decision[] = [
  {
    date: '02/11/2026',
    text: 'O domínio passa a apresentar a Nelcota como empresa. O backend em Rust passa a se chamar Nelcota BaaS.',
  },
  {
    date: '02/11/2026',
    text: 'O site mostra os produtos próprios e o serviço de websites e sistemas para clientes.',
  },
  { date: '01/11/2026', text: 'O site fica só no tema escuro. A versão clara vai para depois.' },
  { date: '01/11/2026', text: 'Todos os textos do site existem em português e inglês.' },
];

export const SITE_ROADMAP: readonly RoadmapItem[] = [
  {
    when: 'Agora',
    title: 'Novo visual do site oficial',
    text: 'Home, comparação e documentação do Nelcota BaaS com o visual novo.',
  },
  {
    when: 'Depois',
    title: 'A Nelcota como software house',
    text: 'Esta página, a vitrine de produtos e o serviço para clientes.',
  },
  { when: 'Mais tarde', title: 'Versão clara do tema', text: 'Hoje o site é só escuro.' },
];
