/** Copy of /produtos, from the mockup "Nelcota · Hero da home" (Produtos.dc.html). */
import { HOUSE_ROUTES } from '../../lib/house/routes.ts';

/** Color of the small square next to each product name. */
export type ProductHue = 'blue' | 'amber' | 'green' | 'violet' | 'coral' | 'sky';

export interface ProductSpec {
  readonly label: string;
  readonly value: string;
}

/** Left (or right) half of a product block: a code sample or a screen still to come. */
export type ProductMedia =
  | { readonly kind: 'code'; readonly caption: string; readonly code: string }
  | { readonly kind: 'screen'; readonly label: string };

export interface ProductLink {
  readonly label: string;
  readonly href: string;
}

export interface Product {
  /** Anchor on /produtos, so other pages can point at one product. */
  readonly id: string;
  readonly name: string;
  readonly hue: ProductHue;
  readonly line: string;
  readonly specs: readonly ProductSpec[];
  readonly github: string;
  readonly media: ProductMedia;
  readonly links: readonly ProductLink[];
}

export interface ProductGroup {
  readonly title: string;
  readonly items: readonly Product[];
}

export type BackstageIcon = 'pr' | 'template' | 'checks' | 'book';

export interface BackstageTool {
  readonly name: string;
  readonly icon: BackstageIcon;
  readonly kind: string;
  readonly description: string;
  /** Text still to be confirmed by the team; shown dimmer. */
  readonly pending: boolean;
}

const BAAS_CODE = `mkdir notes-app && cd notes-app
nelcota dev

# em outro terminal, com o SQL em migrations/
nelcota migrate`;

const RATE_LIMIT_CODE = `version = "example-v1"

[plans.free.actions.read]
mode = "enforce"
rules = [
  { id = "address", key = "ip",       rate = 60,  per = "1m", burst = 10 },
  { id = "block",   key = "ip_block", rate = 600, per = "1m", burst = 100 },
]`;

const spec = (label: string, value: string): ProductSpec => ({ label, value });

export const PRODUCT_GROUPS: readonly ProductGroup[] = [
  {
    title: 'Infraestrutura',
    items: [
      {
        id: 'nelcota-baas',
        name: 'Nelcota BaaS',
        hue: 'blue',
        line: 'Seu PostgreSQL, seu servidor, seu backend. API REST, autenticação, arquivos, webhooks e painel admin num único binário Rust.',
        specs: [
          spec('Versão', 'v0.5.6, outubro de 2026'),
          spec('Licença', 'Apache-2.0'),
          spec('Onde roda', 'Sua VPS, com PostgreSQL 17'),
          spec('Em produção', 'SellBridge e Loja Pronta Prime'),
        ],
        github: 'https://github.com/Nelcota/Nelcota',
        media: { kind: 'code', caption: 'Terminal · início rápido do README', code: BAAS_CODE },
        links: [
          { label: 'Conhecer o Nelcota BaaS →', href: HOUSE_ROUTES.baas },
          { label: 'Documentação →', href: HOUSE_ROUTES.docs },
          { label: 'Comparação →', href: HOUSE_ROUTES.compare },
          { label: 'Ver os casos →', href: `${HOUSE_ROUTES.services}#clientes` },
        ],
      },
      {
        id: 'ratelimit',
        name: 'RateLimit',
        hue: 'amber',
        line: 'Limite de requisições para APIs Rust que não deixa passar quando algo falha.',
        specs: [
          spec('Versão', 'Nenhum crate publicado ainda'),
          spec('Licença', 'MIT ou Apache-2.0'),
          spec('Onde roda', 'APIs Rust com Tower e axum, em memória ou Valkey'),
          spec('Situação', 'Implementado e testado. Não é certificação de produção'),
        ],
        github: 'https://github.com/Nelcota/RateLimit',
        media: { kind: 'code', caption: 'policy.toml · exemplo do README', code: RATE_LIMIT_CODE },
        links: [{ label: 'Conhecer o RateLimit →', href: HOUSE_ROUTES.rateLimit }],
      },
      {
        id: 'nelcota-deploy',
        name: 'Nelcota Deploy',
        hue: 'green',
        line: 'Painel self-hosted para publicar sistemas numa única VPS Linux com Docker.',
        specs: [
          spec('Versão', 'Sem versão publicada'),
          spec('Licença', 'Ainda não definida'),
          spec('Onde roda', 'Uma VPS Linux com Docker'),
          spec('Situação', 'Em desenvolvimento'),
        ],
        github: 'https://github.com/Nelcota/NelcotaDeploy',
        media: { kind: 'screen', label: '[tela do painel do Nelcota Deploy]' },
        links: [],
      },
    ],
  },
  {
    title: 'Aplicações',
    items: [
      {
        id: 'nelcota-ai',
        name: 'Nelcota AI',
        hue: 'violet',
        line: 'Crédito pré-pago de OpenAI para empresas, com recarga por Pix ou cartão via Mercado Pago.',
        specs: [
          spec('Versão', 'Sem versão publicada'),
          spec('Licença', 'Ainda não definida'),
          spec('Feito com', 'Bun, TanStack Start e Nelcota BaaS'),
          spec('Situação', 'Em desenvolvimento'),
        ],
        github: 'https://github.com/Nelcota/NelcotaAI',
        media: { kind: 'screen', label: '[tela de recarga do Nelcota AI]' },
        links: [],
      },
      {
        id: 'nelcota-screenshare',
        name: 'Nelcota ScreenShare',
        hue: 'coral',
        line: 'Compartilhamento de tela para equipes pequenas, com áudio, chat e um mascote que reage.',
        specs: [
          spec('Versão', 'v0.1.0, outubro de 2026'),
          spec('Licença', 'Apache-2.0'),
          spec('Feito com', 'LiveKit e React Router, self-hosted'),
          spec('Situação', 'Primeira versão'),
        ],
        github: 'https://github.com/Nelcota/NelcotaScreenShare',
        media: { kind: 'screen', label: '[tela de uma chamada no ScreenShare]' },
        links: [],
      },
      {
        id: 'nelcota-prompts',
        name: 'Nelcota Prompts',
        hue: 'sky',
        line: 'Biblioteca de prompts para equipes de devs, só por convite.',
        specs: [
          spec('Versão', 'Sem versão publicada'),
          spec('Licença', 'MIT'),
          spec('Feito com', 'Bun, React Router 7 e PostgreSQL'),
          spec('Situação', 'Em uso'),
        ],
        github: 'https://github.com/Nelcota/NelcotaPrompts',
        media: { kind: 'screen', label: '[tela da biblioteca do Nelcota Prompts]' },
        links: [],
      },
    ],
  },
];

export const BACKSTAGE_TOOLS: readonly BackstageTool[] = [
  {
    name: 'Nelcota PRs',
    icon: 'pr',
    kind: 'Revisão de código',
    description: 'Fila de revisão de pull requests ligada ao GitHub.',
    pending: false,
  },
  {
    name: 'Nelcota Template',
    icon: 'template',
    kind: 'Ponto de partida',
    description: 'Base dos sistemas de clientes, sobre o Nelcota BaaS.',
    pending: false,
  },
  {
    name: 'nelcota-qa',
    icon: 'checks',
    kind: 'Testes',
    description: '[descrição a confirmar]',
    pending: true,
  },
  {
    name: 'NelcotaRules',
    icon: 'book',
    kind: 'Regras de código',
    description: '[descrição a confirmar]',
    pending: true,
  },
];
