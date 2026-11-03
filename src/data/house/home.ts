/** Copy of the home (/), from the mockup "Nelcota · Hero da home" (Main.dc.html, Portuguese). */
import { HOUSE_ROUTES } from '../../lib/house/routes.ts';
import type { TitleLine } from '../../types/house.ts';
import { ABOUT_TEAM } from './about.ts';

export type HomeStatusKind = 'ok' | 'early' | 'dev' | 'neutral';

/** Sections of the home the header highlights while they are being read. */
export type HomeSpyKey = 'produtos' | 'servicos' | 'sobre' | 'contato';

export interface HomeNavLink {
  readonly label: string;
  readonly href: string;
  readonly spy?: HomeSpyKey;
}

export interface HomeStatusRow {
  readonly title: string;
  readonly pill: string;
  readonly kind: HomeStatusKind;
}

export type HomePreview =
  | { readonly type: 'baas' }
  | { readonly type: 'clients' }
  | { readonly type: 'rows'; readonly rows: readonly HomeStatusRow[] };

export interface HomeProduct {
  /** Word that completes "Nelcota é ___" while this card is on top. */
  readonly word: string;
  readonly name: string;
  readonly concept: string;
  readonly status: string;
  readonly kind: HomeStatusKind;
  readonly facts: readonly string[];
  readonly link: string;
  readonly href: string;
  readonly preview: HomePreview;
}

export interface HomeTextItem {
  readonly title: string;
  readonly text: string;
}

export interface HomeExploreCard extends HomeTextItem {
  readonly href: string;
}

export const HOME_NAV: readonly HomeNavLink[] = [
  { label: 'Produtos', href: HOUSE_ROUTES.products, spy: 'produtos' },
  { label: 'Serviços', href: HOUSE_ROUTES.services, spy: 'servicos' },
  { label: 'Sobre', href: HOUSE_ROUTES.about, spy: 'sobre' },
  { label: 'Transparência', href: HOUSE_ROUTES.transparency },
  { label: 'Contato', href: '#contato', spy: 'contato' },
];

export const HOME_CTA = { label: 'Todos os produtos', href: HOUSE_ROUTES.products } as const;

export const HOME_HERO = {
  eyebrow: 'Nelcota · Software house',
  lines: [
    ['Construímos os', '', ''],
    ['', 'nossos', ' produtos.'],
  ] as const satisfies readonly TitleLine[],
  sub: 'E usamos a mesma base para construir websites e sistemas sob medida para outras empresas. Cada produto mostra a versão, a data e o que ainda falta.',
  secondary: 'Sistemas para clientes',
  hint: 'Role para ver os produtos',
} as const;

export const HOME_PRODUCTS = {
  eyebrow: 'O que fazemos',
  prefix: 'Nelcota é',
  sub: 'Cada palavra é uma parte do que já existe. Role ou escolha uma das barras.',
  dotsLabel: 'Escolher parte',
  allProducts: 'Ver todos os produtos',
} as const;

export const HOME_PRODUCT_ITEMS: readonly HomeProduct[] = [
  {
    word: 'infraestrutura.',
    name: 'Nelcota BaaS',
    concept:
      'Backend open source: Postgres puro com um binário Rust, no seu próprio servidor em minutos.',
    status: 'v0.5.6 · 27/10/2026',
    kind: 'ok',
    facts: [
      'API REST, autenticação e RLS',
      'Arquivos, webhooks e painel admin',
      'Base dos sistemas dos nossos clientes',
    ],
    link: 'Conhecer o Nelcota BaaS',
    href: HOUSE_ROUTES.baas,
    preview: { type: 'baas' },
  },
  {
    word: 'sistemas para clientes.',
    name: 'Sistemas para clientes',
    concept: 'Websites e sistemas sob medida, construídos sobre o Nelcota BaaS.',
    status: 'Roda no Nelcota BaaS',
    kind: 'early',
    facts: [
      'SellBridge · sellbridge.com.br',
      'Loja Pronta Prime · lojaprontaprime.com',
      'A mesma base dos nossos produtos',
    ],
    link: 'Ver os clientes',
    href: HOUSE_ROUTES.services,
    preview: { type: 'clients' },
  },
  {
    word: 'aplicações próprias.',
    name: 'Aplicações próprias',
    concept: 'Produtos que criamos e usamos, cada um com o status real.',
    status: '3 aplicações',
    kind: 'neutral',
    facts: [
      'Nelcota AI: crédito de OpenAI com Pix ou cartão',
      'ScreenShare: tela, áudio e chat para equipes pequenas',
      'Prompts: biblioteca de prompts para devs',
    ],
    link: 'Ver as aplicações',
    href: HOUSE_ROUTES.products,
    preview: {
      type: 'rows',
      rows: [
        { title: 'Nelcota AI', pill: 'Em desenvolvimento', kind: 'dev' },
        { title: 'Nelcota ScreenShare', pill: 'v0.1.0', kind: 'early' },
        { title: 'Nelcota Prompts', pill: 'Em uso · por convite', kind: 'ok' },
      ],
    },
  },
  {
    word: 'transparência.',
    name: 'Status à vista',
    concept:
      'Cada produto mostra o status honesto, a última versão e a data, com link para o GitHub.',
    status: 'Proposta',
    kind: 'neutral',
    facts: ['Roadmap com Now e Next', 'Changelog por produto', 'Nada além do que o README diz'],
    link: 'Ver o roadmap',
    href: HOUSE_ROUTES.transparency,
    preview: {
      type: 'rows',
      rows: [
        { title: 'Nelcota BaaS', pill: 'v0.5.6', kind: 'ok' },
        { title: 'RateLimit', pill: 'Sem crate publicado', kind: 'neutral' },
        { title: 'Nelcota Deploy', pill: 'Em desenvolvimento', kind: 'dev' },
      ],
    },
  },
];

export const HOME_SERVICES = {
  eyebrow: 'Serviços',
  lines: [
    ['Seu sistema começa', '', ''],
    ['pela parte ', 'que importa', '.'],
  ] as const satisfies readonly TitleLine[],
  sub: 'Fazemos websites, lojas virtuais e sistemas sob medida. Todos usam o Nelcota BaaS, a nossa base pronta com login, permissões, arquivos e painel. Assim, o tempo do seu projeto vai para o que é só dele.',
  cta: 'Fale sobre o seu projeto',
  link: 'Ver como funciona',
  linkHref: HOUSE_ROUTES.services,
} as const;

export const HOME_SERVICE_OFFERS: readonly HomeTextItem[] = [
  { title: 'Websites', text: 'Sites rápidos e fáceis de atualizar.' },
  { title: 'Lojas virtuais', text: 'Catálogo, pedidos e marketplaces num só lugar.' },
  { title: 'Sistemas internos', text: 'Painéis e relatórios para a sua equipe.' },
];

export const HOME_ABOUT = {
  eyebrow: 'Sobre',
  lines: [
    ['Uma empresa pequena que', '', ''],
    ['', 'mantém', ' o que constrói.'],
  ] as const satisfies readonly TitleLine[],
  sub: 'Somos dois sócios. Criamos os nossos produtos e mostramos o status real de cada um.',
} as const;

export const HOME_PRINCIPLES: readonly HomeTextItem[] = [
  {
    title: 'Status honesto',
    text: 'Cada produto diz se está em desenvolvimento, em teste ou em uso, com versão e data.',
  },
  {
    title: 'Código aberto quando faz sentido',
    text: 'O Nelcota BaaS é open source, com licença Apache-2.0.',
  },
  { title: 'Uma base só', text: 'Produtos e sistemas de clientes rodam sobre o Nelcota BaaS.' },
  { title: 'Nada além do README', text: 'Se não está escrito e testado, não aparece no site.' },
];

export const HOME_TEAM = {
  eyebrow: 'Equipe',
  lines: [['Quem ', 'constrói', ' a Nelcota.']] as const satisfies readonly TitleLine[],
  link: 'Conhecer a equipe',
  linkHref: HOUSE_ROUTES.about,
  photo: 'Foto em breve',
  // One source for the partners, shared with /sobre.
  people: ABOUT_TEAM,
} as const;

export const HOME_CONTACT = {
  eyebrow: 'Contato',
  lines: [['Conte o seu ', 'projeto', '.']] as const satisfies readonly TitleLine[],
  sub: 'Responda em poucas linhas o que você precisa. A gente volta com perguntas e uma proposta.',
  email: '[e-mail de contato]',
  fields: { name: 'Nome', email: 'E-mail', message: 'Conte em poucas linhas' },
  placeholder: 'Ex.: preciso de uma loja para vender no Mercado Livre e na Shopee.',
  send: 'Enviar mensagem',
  notice: 'O envio ainda não está ligado: nada sai desta página.',
  doneTitle: 'O envio ainda não está ligado',
  doneText:
    'A mensagem está preenchida certinho, mas este formulário ainda não envia nada e nenhum e-mail sai daqui. Por enquanto, escreva para [e-mail de contato].',
  again: 'Escrever outra',
} as const;

export const HOME_EXPLORE = {
  title: 'Por onde você quer começar?',
  sub: 'Veja os produtos, entenda como trabalhamos ou fale direto com a gente.',
} as const;

export const HOME_EXPLORE_CARDS: readonly HomeExploreCard[] = [
  {
    title: 'Produtos',
    text: 'Todos os produtos, com status, versão e tecnologia.',
    href: HOUSE_ROUTES.products,
  },
  {
    title: 'Serviços',
    text: 'Como construímos sistemas sob medida, passo a passo.',
    href: HOUSE_ROUTES.services,
  },
  { title: 'Sobre', text: 'Quem somos e como trabalhamos.', href: HOUSE_ROUTES.about },
  {
    title: 'Transparência',
    text: 'Status, changelog e decisões com data.',
    href: HOUSE_ROUTES.transparency,
  },
];
