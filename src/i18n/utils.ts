import { en } from './en.ts';
import { ptBr } from './pt-br.ts';
import type { Dictionary } from './types.ts';

export const locales = ['en', 'pt-br'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

const dictionaries: Record<Locale, Dictionary> = { en, 'pt-br': ptBr };

/** BCP 47 tag for <html lang>, hreflang and Intl. */
export const bcp47: Record<Locale, string> = { en: 'en', 'pt-br': 'pt-BR' };

/** Open Graph locale codes. */
export const ogLocale: Record<Locale, string> = { en: 'en_US', 'pt-br': 'pt_BR' };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function t(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'pt-br' : 'en';
}

export function formatDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) throw new RangeError(`Invalid ISO date: "${iso}"`);

  return new Intl.DateTimeFormat(bcp47[locale], { dateStyle: 'long', timeZone: 'UTC' }).format(
    date,
  );
}
