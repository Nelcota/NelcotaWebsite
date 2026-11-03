/** Copy of /servicos, from the mockup "Nelcota · Hero da home" (Servicos.dc.html). */
import type { ImageMetadata } from 'astro';
import lojaProntaPrime from '../../assets/house/loja-pronta-prime.png';
import sellbridge from '../../assets/house/sellbridge.jpg';

export interface ServiceOffer {
  readonly title: string;
  readonly text: string;
}

export interface ServiceSpec {
  readonly label: string;
  readonly value: string;
  /** Text still to be confirmed by the team; shown dimmer. */
  readonly pending: boolean;
}

export interface ServiceStep {
  readonly number: string;
  readonly title: string;
  readonly text: string;
}

export interface ServiceCase {
  readonly name: string;
  readonly summary: string;
  readonly summaryPending: boolean;
  readonly specs: readonly ServiceSpec[];
  readonly href: string;
  readonly linkLabel: string;
  readonly image: ImageMetadata;
  readonly imageAlt: string;
  /** 'screenshot' fills the frame; 'mascot' sits centered on a dark card. */
  readonly imageFit: 'screenshot' | 'mascot';
  /** The image goes after the text on wide screens, as in the mockup. */
  readonly imageFirst: boolean;
}

export interface ContactKind {
  readonly value: string;
  readonly label: string;
}

export const SERVICE_OFFERS: readonly ServiceOffer[] = [
  {
    title: 'Websites',
    text: 'Sites institucionais e páginas de produto, rápidos e fáceis de atualizar.',
  },
  {
    title: 'Lojas e vendas online',
    text: 'Sistemas para vender e acompanhar pedidos, como o que roda a SellBridge.',
  },
  {
    title: 'Sistemas internos',
    text: 'Painéis, cadastros e relatórios para o dia a dia da sua equipe.',
  },
];

/** What Nelcota BaaS ships ready, as stated in its README. */
export const SERVICE_BASE: readonly ServiceSpec[] = [
  { label: 'Login', value: 'Autenticação de usuários', pending: false },
  { label: 'Permissões', value: 'Regras por linha no PostgreSQL (RLS)', pending: false },
  { label: 'Arquivos', value: 'Envio e armazenamento de arquivos', pending: false },
  { label: 'Painel', value: 'Painel admin para ver e corrigir dados', pending: false },
  { label: 'Banco', value: 'PostgreSQL 17, seu, sem formato fechado', pending: false },
  { label: 'Avisos', value: 'Webhooks para outros sistemas', pending: false },
];

export const SERVICE_BASE_PLACEHOLDER = '[tela do painel admin do Nelcota BaaS]';

export const SERVICE_CASES: readonly ServiceCase[] = [
  {
    name: 'SellBridge',
    summary: 'Revenda nos marketplaces sem ter estoque.',
    summaryPending: false,
    specs: [
      { label: 'Site', value: 'sellbridge.com.br', pending: false },
      { label: 'O que fizemos', value: '[escopo do trabalho a confirmar]', pending: true },
      { label: 'Roda em', value: 'Nelcota BaaS', pending: false },
    ],
    href: 'https://sellbridge.com.br/',
    linkLabel: 'Visitar a SellBridge',
    image: sellbridge,
    imageAlt: 'Página inicial da SellBridge',
    imageFit: 'screenshot',
    imageFirst: false,
  },
  {
    name: 'Loja Pronta Prime',
    summary: '[descrição curta a confirmar]',
    summaryPending: true,
    specs: [
      { label: 'Site', value: 'lojaprontaprime.com', pending: false },
      { label: 'O que fizemos', value: '[escopo do trabalho a confirmar]', pending: true },
      { label: 'Roda em', value: 'Nelcota BaaS', pending: false },
    ],
    href: 'https://lojaprontaprime.com/',
    linkLabel: 'Visitar a Loja Pronta Prime',
    image: lojaProntaPrime,
    imageAlt: 'Mascote da Loja Pronta Prime',
    imageFit: 'mascot',
    imageFirst: true,
  },
];

export const SERVICE_STEPS: readonly ServiceStep[] = [
  { number: '1', title: 'Conversa', text: 'Você conta o que precisa e a gente faz as perguntas.' },
  { number: '2', title: 'Proposta', text: 'Escopo, prazo e valor por escrito, antes de começar.' },
  {
    number: '3',
    title: 'Construção',
    text: 'Montamos sobre o Nelcota BaaS e mostramos o andamento.',
  },
  {
    number: '4',
    title: 'Entrega e manutenção',
    text: 'O sistema vai ao ar e seguimos cuidando dele.',
  },
];

export const CONTACT_EMAIL_PLACEHOLDER = '[e-mail de contato]';

export const CONTACT_KINDS: readonly ContactKind[] = [
  { value: 'website', label: 'Website' },
  { value: 'loja', label: 'Loja ou venda online' },
  { value: 'sistema', label: 'Sistema interno' },
  { value: 'outro', label: 'Outra coisa' },
];

export const CONTACT_DEFAULT_KIND = 'website';
