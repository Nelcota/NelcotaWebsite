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

const UNITS: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['week', 7 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
];

/** "3 days ago" / "há 3 dias", computed once at build time. */
export function formatRelative(iso: string, locale: Locale, now: Date = new Date()): string {
  const seconds = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(bcp47[locale], { numeric: 'auto' });
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) {
      return rtf.format(Math.round(seconds / size), unit);
    }
  }
  return rtf.format(0, 'second');
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(bcp47[locale], { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(iso),
  );
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(bcp47[locale]).format(value);
}
