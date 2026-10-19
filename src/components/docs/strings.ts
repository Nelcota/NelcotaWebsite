import type { Locale } from '../../i18n/utils.ts';

/**
 * UI strings that only the gallery-style docs pages use. They live here, next
 * to the components, so the shared dictionaries in src/i18n/ stay untouched.
 */
type Localized = Readonly<Record<Locale, string>>;

export const DOCS_STRINGS = {
  /** Small caps label over the docs title; the second part takes the brand color. */
  eyebrowLead: { en: 'Guides and ', 'pt-br': 'Guias e ' },
  eyebrowAccent: { en: 'reference', 'pt-br': 'referência' },
  /** Gray second line of the two-tone docs title. */
  titleTail: { en: 'Build it, ship it, run it.', 'pt-br': 'Construa, publique, opere.' },
  searchPlaceholder: {
    en: 'Search guides, commands, tables…',
    'pt-br': 'Busque guias, comandos, tabelas…',
  },
  guideCount: { en: '{count} guides', 'pt-br': '{count} guias' },
  guideCountOne: { en: '1 guide', 'pt-br': '1 guia' },
} as const satisfies Record<string, Localized>;

export type DocsStringKey = keyof typeof DOCS_STRINGS;

export function docsText(key: DocsStringKey, locale: Locale): string {
  return DOCS_STRINGS[key][locale];
}

/** "5 guides" / "1 guia". */
export function guideCount(count: number, locale: Locale): string {
  if (count === 1) return docsText('guideCountOne', locale);

  return docsText('guideCount', locale).replace('{count}', String(count));
}
