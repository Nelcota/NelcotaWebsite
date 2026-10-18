import {
  type BundledLanguage,
  type BundledTheme,
  createHighlighter,
  type HighlighterGeneric,
  type ThemedTokenWithVariants,
} from 'shiki';

/**
 * Build-time syntax highlighting that emits classes instead of inline
 * `style` attributes, so pages can ship a strict CSP (no 'unsafe-inline')
 * and switch theme with CSS alone via light-dark().
 */

const THEMES = { light: 'vitesse-light', dark: 'vitesse-dark' } as const;

/** Code block backgrounds (must match --color-code in global.css). */
const CODE_BG = { light: '#f3f8f5', dark: '#0b100d' } as const;
const MIN_CONTRAST = 4.6;

type Rgb = [number, number, number];
const hexToRgb = (hex: string): Rgb => {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? [...value].map((c) => c + c).join('') : value.slice(0, 6);
  return [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16)) as Rgb;
};
const rgbToHex = (rgb: Rgb) =>
  `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
const luminance = ([r, g, b]: Rgb) => {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const contrast = (a: Rgb, b: Rgb) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (l1 + 0.05) / (l2 + 0.05);
};

/**
 * Theme palettes are not guaranteed to meet WCAG AA on our backgrounds.
 * Nudges a token color toward black (light theme) or white (dark theme)
 * until it reaches MIN_CONTRAST, keeping the hue recognizable.
 */
function ensureContrast(hex: string, background: string, towards: 'black' | 'white'): string {
  const bg = hexToRgb(background);
  let rgb = hexToRgb(hex);
  const target: Rgb = towards === 'black' ? [0, 0, 0] : [255, 255, 255];
  for (let step = 0; step < 40 && contrast(rgb, bg) < MIN_CONTRAST; step += 1) {
    rgb = rgb.map((c, i) => c + ((target[i] ?? 0) - c) * 0.08) as Rgb;
  }
  return rgbToHex(rgb);
}
const LANGS = [
  'typescript',
  'rust',
  'shellscript',
  'toml',
] as const satisfies readonly BundledLanguage[];
export type CodeLang = (typeof LANGS)[number];

type Highlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;
let highlighterPromise: Promise<Highlighter> | undefined;

function getHighlighter(): Promise<Highlighter> {
  const promise =
    highlighterPromise ?? createHighlighter({ themes: Object.values(THEMES), langs: [...LANGS] });
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
    const highlighter = await getHighlighter();
    const tokens = highlighter.codeToTokensWithThemes(code.trimEnd(), { lang, themes: THEMES });
    const lines = tokens.map(
      (line) => `<span class="ln">${line.map((token) => this.#span(token)).join('')}</span>`,
    );
    return lines.join('\n');
  }

  #span(token: ThemedTokenWithVariants): string {
    const text = escapeHtml(token.content);
    const light = token.variants.light?.color;
    const dark = token.variants.dark?.color;
    if (!light || !dark || token.content.trim() === '') return text;
    const fontStyle = token.variants.light?.fontStyle ?? 0;
    const style: TokenStyle = {
      light: ensureContrast(light.toLowerCase(), CODE_BG.light, 'black'),
      dark: ensureContrast(dark.toLowerCase(), CODE_BG.dark, 'white'),
      italic: (fontStyle & 1) !== 0,
      bold: (fontStyle & 2) !== 0,
    };
    const key = `${style.light}|${style.dark}|${style.italic}|${style.bold}`;
    let entry = this.#classes.get(key);
    if (!entry) {
      entry = { name: `tk${this.#classes.size.toString(36)}`, style };
      this.#classes.set(key, entry);
    }
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
