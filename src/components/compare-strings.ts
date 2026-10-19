/**
 * Presentation-only strings for the comparison page and its parts (eyebrows,
 * the figures on the "comes out ahead" cards). Facts stay in src/data/compare.ts;
 * these only restate them in a few words, so they never need their own source.
 */
import type { Product } from '../data/compare.ts';
import type { Locale } from '../i18n/utils.ts';

type Localized = Readonly<Record<Locale, string>>;

/** An eyebrow: plain lead words, then one word in the accent color. */
export interface EyebrowText {
  readonly lead: Localized;
  readonly accent: Localized;
}

export const COMPARE_STRINGS = {
  heroEyebrow: {
    lead: { en: 'Self-hosted,', 'pt-br': 'Self-hosted,' },
    accent: { en: 'side by side', 'pt-br': 'lado a lado' },
  },
  winsEyebrow: {
    lead: { en: 'The short', 'pt-br': 'A versão' },
    accent: { en: 'version', 'pt-br': 'curta' },
  },
  tableEyebrow: {
    lead: { en: 'Including the', 'pt-br': 'Inclusive as' },
    accent: { en: 'gaps', 'pt-br': 'lacunas' },
  },
  fitEyebrow: {
    lead: { en: 'Four good', 'pt-br': 'Quatro bons' },
    accent: { en: 'projects', 'pt-br': 'projetos' },
  },
  sourcesEyebrow: {
    lead: { en: 'Every cell,', 'pt-br': 'Cada célula,' },
    accent: { en: 'sourced', 'pt-br': 'com fonte' },
  },
  seeTable: { en: 'See the full table', 'pt-br': 'Ver a tabela completa' },
} as const satisfies Record<string, Localized | EyebrowText>;

/**
 * One short figure per WINS entry (same order), shown big on each card the way
 * a price is on a pricing card. Each restates the card's own title.
 */
export const WIN_FIGURES: ReadonlyArray<{ readonly kicker: Localized; readonly figure: string }> = [
  { kicker: { en: 'Memory', 'pt-br': 'Memória' }, figure: '1 GB' },
  { kicker: { en: 'Pieces to run', 'pt-br': 'Peças para rodar' }, figure: '2' },
  { kicker: { en: 'Backups', 'pt-br': 'Backups' }, figure: 'PITR' },
  { kicker: { en: 'Access', 'pt-br': 'Acesso' }, figure: 'RLS' },
];

/**
 * Splits a heading into its lead and its last word, for the two-tone titles
 * (the last word is drawn in the faint color). One-word headings stay whole.
 */
export function splitLastWord(text: string): readonly [string, string] {
  const trimmed = text.trim();
  const cut = trimmed.lastIndexOf(' ');

  if (cut < 0) return [trimmed, ''];

  return [trimmed.slice(0, cut), trimmed.slice(cut + 1)];
}

/**
 * One pop color per product (background + a text color that keeps 4.5:1 on it),
 * shared by the hero fan, the table's column dots and the "which one fits" cards.
 */
export const PRODUCT_TONE = {
  nelcota: 'bg-pop-forest text-white',
  supabase: 'bg-pop-lime text-pop-ink',
  pocketbase: 'bg-pop-lilac text-pop-ink',
  appwrite: 'bg-pop-pink text-white',
} as const satisfies Record<Product, string>;
