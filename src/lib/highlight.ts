import {
  type BundledLanguage,
  type BundledTheme,
  createHighlighter,
  type HighlighterGeneric,
  type ThemedTokenWithVariants,
} from 'shiki';
import { DARK_THEME, LIGHT_THEME } from './syntax-theme.ts';

/**
 * Build-time syntax highlighting that emits classes instead of inline
 * `style` attributes, so pages can ship a strict CSP (no 'unsafe-inline')
 * and switch theme with CSS alone via light-dark().
 */

const THEMES = { light: LIGHT_THEME, dark: DARK_THEME } as const;

/**
 * The lowest-contrast code backgrounds in global.css (--color-code and the
 * in-tile variant): tokens that pass on these pass on all of them.
 */
const CODE_BG = { light: '#ebebe9', dark: '#1a1b1e' } as const;
const MIN_CONTRAST = 4.6;
/** Upper bound on nudges, so a hopeless color cannot loop forever. */
const MAX_CONTRAST_STEPS = 40;
/** Fraction of the remaining distance to black/white covered per nudge. */
const CONTRAST_STEP = 0.08;

type Rgb = [number, number, number];

const HEX_RADIX = 16;
const CHANNEL_MAX = 255;
/** "#abc" is shorthand for "#aabbcc"; longer values may carry an alpha channel after the six digits. */
const SHORT_HEX_LENGTH = 3;
const HEX_LENGTH = 6;

/** sRGB linearization and luminance weights from the WCAG 2 relative luminance formula. */
const SRGB_LINEAR_LIMIT = 0.04045;
const SRGB_LINEAR_SLOPE = 12.92;
const SRGB_OFFSET = 0.055;
const SRGB_SCALE = 1.055;
const SRGB_GAMMA = 2.4;
const LUMINANCE_WEIGHTS: Rgb = [0.2126, 0.7152, 0.0722];
/** Flare term of the WCAG contrast ratio. */
const CONTRAST_FLARE = 0.05;

const hexToRgb = (hex: string): Rgb => {
  const value = hex.replace('#', '');
  const full =
    value.length === SHORT_HEX_LENGTH
      ? [...value].map((c) => c + c).join('')
      : value.slice(0, HEX_LENGTH);
  const channels = [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), HEX_RADIX));
  if (!channels.every(Number.isFinite)) throw new RangeError(`Invalid hex color: "${hex}"`);

  return channels as Rgb;
};
const rgbToHex = (rgb: Rgb) =>
  `#${rgb.map((c) => Math.round(c).toString(HEX_RADIX).padStart(2, '0')).join('')}`;
const luminance = ([r, g, b]: Rgb) => {
  const lin = (c: number) => {
    const v = c / CHANNEL_MAX;
    return v <= SRGB_LINEAR_LIMIT
      ? v / SRGB_LINEAR_SLOPE
      : ((v + SRGB_OFFSET) / SRGB_SCALE) ** SRGB_GAMMA;
  };
  const [weightR, weightG, weightB] = LUMINANCE_WEIGHTS;
  return weightR * lin(r) + weightG * lin(g) + weightB * lin(b);
};
const contrast = (a: Rgb, b: Rgb) => {
  const [l1, l2] = [luminance(a), luminance(b)].toSorted((x, y) => y - x) as [number, number];
  return (l1 + CONTRAST_FLARE) / (l2 + CONTRAST_FLARE);
};

/**
 * Theme palettes are not guaranteed to meet WCAG AA on our backgrounds.
 * Nudges a token color toward black (light theme) or white (dark theme)
 * until it reaches MIN_CONTRAST, keeping the hue recognizable.
 */
function ensureContrast(hex: string, background: string, towards: 'black' | 'white'): string {
  const bg = hexToRgb(background);
  let rgb = hexToRgb(hex);
  const target: Rgb = towards === 'black' ? [0, 0, 0] : [CHANNEL_MAX, CHANNEL_MAX, CHANNEL_MAX];
  for (let step = 0; step < MAX_CONTRAST_STEPS && contrast(rgb, bg) < MIN_CONTRAST; step += 1) {
    rgb = rgb.map((c, i) => c + ((target[i] ?? 0) - c) * CONTRAST_STEP) as Rgb;
  }
  return rgbToHex(rgb);
}
const LANGS = [
  'typescript',
  'rust',
  'shellscript',
  'toml',
  'sql',
  'http',
  'json',
] as const satisfies readonly BundledLanguage[];
export type CodeLang = (typeof LANGS)[number];

/** Shiki FontStyle bit flags. */
const FONT_STYLE_ITALIC = 1;
const FONT_STYLE_BOLD = 2;
/** Base for short generated class names (tk0, tk1, ... tkz, tk10). */
const CLASS_RADIX = 36;

/** `cat > file <<'SQL'` … `SQL`: the shell lines around it and the SQL inside, split on line boundaries. */
const SQL_HEREDOC = /^([\s\S]*?<<'SQL')\n([\s\S]*?)\n(SQL(?:\n[\s\S]*)?)$/;

export function splitSqlHeredoc(
  code: string,
): { before: string; body: string; after: string } | null {
  const match = SQL_HEREDOC.exec(code);
  if (match == null) return null;

  const [, before, body, after] = match;
  if (before == null || body == null || after == null) return null;

  return { before, body, after };
}

type Highlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;
let highlighterPromise: Promise<Highlighter> | undefined;

function getHighlighter(): Promise<Highlighter> {
  const promise =
    highlighterPromise ??
    createHighlighter({ themes: [LIGHT_THEME, DARK_THEME], langs: [...LANGS] });
  highlighterPromise = promise;
  return promise;
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, (char) => ESCAPES[char] ?? char);

interface TokenStyle {
  light: string;
  dark: string;
  italic: boolean;
  bold: boolean;
}

/**
 * One registry per page: every distinct (light color, dark color, font style)
 * tuple becomes a short class, and `css()` returns the matching stylesheet.
 */
export class HighlightRegistry {
  readonly #classes = new Map<string, { name: string; style: TokenStyle }>();

  async render(code: string, lang: CodeLang): Promise<string> {
    const heredoc = lang === 'shellscript' ? splitSqlHeredoc(code.trimEnd()) : null;
    if (heredoc == null) return this.#renderLines(code.trimEnd(), lang);

    // A shell heredoc of SQL would otherwise be one long string: color its body as SQL.
    const parts = await Promise.all([
      this.#renderLines(heredoc.before, 'shellscript'),
      this.#renderLines(heredoc.body, 'sql'),
      this.#renderLines(heredoc.after, 'shellscript'),
    ]);

    return parts.join('\n');
  }

  async #renderLines(code: string, lang: CodeLang): Promise<string> {
    const highlighter = await getHighlighter();
    const tokens = highlighter.codeToTokensWithThemes(code, { lang, themes: THEMES });
    const lines = tokens.map(
      (line) => `<span class="ln">${line.map((token) => this.#span(token)).join('')}</span>`,
    );
    return lines.join('\n');
  }

  #span(token: ThemedTokenWithVariants): string {
    const text = escapeHtml(token.content);
    const light = token.variants.light?.color;
    const dark = token.variants.dark?.color;
    if (light == null || dark == null) return text;
    if (light.length === 0 || dark.length === 0) return text;
    if (token.content.trim().length === 0) return text;

    const fontStyle = token.variants.light?.fontStyle ?? 0;
    const style: TokenStyle = {
      light: ensureContrast(light.toLowerCase(), CODE_BG.light, 'black'),
      dark: ensureContrast(dark.toLowerCase(), CODE_BG.dark, 'white'),
      italic: (fontStyle & FONT_STYLE_ITALIC) !== 0,
      bold: (fontStyle & FONT_STYLE_BOLD) !== 0,
    };
    const key = `${style.light}|${style.dark}|${style.italic}|${style.bold}`;
    const existing = this.#classes.get(key);
    if (existing != null) return `<span class="${existing.name}">${text}</span>`;

    const entry = { name: `tk${this.#classes.size.toString(CLASS_RADIX)}`, style };
    this.#classes.set(key, entry);
    return `<span class="${entry.name}">${text}</span>`;
  }

  css(): string {
    const rules: string[] = [];
    for (const { name, style } of this.#classes.values()) {
      const color =
        style.light === style.dark ? style.light : `light-dark(${style.light},${style.dark})`;
      const extra = `${style.italic ? 'font-style:italic;' : ''}${style.bold ? 'font-weight:600;' : ''}`;
      rules.push(`.${name}{color:${color};${extra}}`);
    }
    return rules.join('');
  }
}
