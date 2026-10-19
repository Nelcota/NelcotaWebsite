import type { Locale } from '../i18n/utils.ts';

/** A displayed number taken apart for the count-up: its value and how many decimals it shows. */
export interface Figure {
  readonly target: number;
  readonly decimals: number;
}

/**
 * Reads a figure as written in the dictionaries: "1.965" or "4,4" in pt-BR,
 * "1,965" or "4.4" in English.
 */
export function parseFigure(value: string, locale: Locale): Figure {
  const normalized =
    locale === 'pt-br' ? value.replaceAll('.', '').replace(',', '.') : value.replaceAll(',', '');
  const target = Number.parseFloat(normalized);
  if (!Number.isFinite(target)) throw new RangeError(`parseFigure: "${value}" is not a number`);

  const [, fraction = ''] = normalized.split('.');

  return { target, decimals: fraction.length };
}
