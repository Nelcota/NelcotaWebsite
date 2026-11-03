/** Copy of /produtos/ratelimit, from the mockup "Nelcota · Hero da home" (ProdutoRateLimit.dc.html). */
import type { GcraOutcome } from '../../utils/gcra.ts';

export interface RateLimitFeature {
  readonly title: string;
  readonly text: string;
}

export interface RateLimitStatusItem {
  readonly text: string;
  /** Placeholder still to be filled by the team; shown dimmer. */
  readonly pending: boolean;
}

export interface RateLimitRelated {
  readonly label: string;
  /** Product id on /produtos (src/data/house/products.ts). */
  readonly anchor: string;
}

/**
 * Rule and copy of the "Teste o limite" simulator. The client script imports
 * this file, so it must not import routes or other server-only modules.
 */
export const RATE_LIMIT_DEMO = {
  ratePerSecond: 5,
  burst: 3,
  slots: 30,
  burstSize: 10,
  /** 8 req/s, faster than the rule, so the stream shows 429s. */
  streamIntervalMs: 125,
  ruleLabel: 'regra: 5 req/s · rajada de 3',
  streamOn: 'Tráfego contínuo: ligado (8 req/s)',
  streamOff: 'Tráfego contínuo: desligado',
  downOn: 'Valkey fora do ar: sim',
  downOff: 'Simular Valkey fora do ar',
  idle: 'Envie uma requisição para ver a resposta.',
  accepted: 'HTTP 200 · aceita dentro da regra',
  limitedPrefix: 'HTTP 429 · tente de novo em ',
  blocked: 'Bloqueada: armazenamento das regras indisponível. Nada passa sem conferência.',
} as const;

export const RATE_LIMIT_OUTCOMES: readonly {
  readonly kind: GcraOutcome;
  readonly label: string;
}[] = [
  { kind: 'ok', label: 'Aceita (200)' },
  { kind: 'limited', label: 'Limitada (429)' },
  { kind: 'blocked', label: 'Bloqueada por falha' },
];

export const RATE_LIMIT_FEATURES: readonly RateLimitFeature[] = [
  {
    title: 'GCRA',
    text: 'Algoritmo de taxa constante: libera um ritmo fixo de requisições e uma rajada pequena.',
  },
  {
    title: 'Regras atômicas',
    text: 'Cada decisão de aceitar ou limitar acontece numa operação só.',
  },
  {
    title: 'Memória ou Valkey',
    text: 'Em memória para um servidor só, ou no Valkey para vários servidores.',
  },
  { title: 'Tower e axum', text: 'Entra como camada nas APIs Rust que já usam Tower e axum.' },
];

export const RATE_LIMIT_READY: readonly RateLimitStatusItem[] = [
  { text: 'Implementado e testado', pending: false },
  { text: 'Memória e Valkey como armazenamento', pending: false },
  { text: 'Integração com Tower e axum', pending: false },
];

export const RATE_LIMIT_MISSING: readonly RateLimitStatusItem[] = [
  { text: 'Publicar o crate', pending: false },
  { text: '[exemplo de uso copiado do README]', pending: true },
  { text: '[link do repositório, se for público]', pending: true },
];

export const RATE_LIMIT_RELATED: readonly RateLimitRelated[] = [
  { label: 'Nelcota BaaS →', anchor: 'nelcota-baas' },
  { label: 'Nelcota Deploy →', anchor: 'nelcota-deploy' },
];
