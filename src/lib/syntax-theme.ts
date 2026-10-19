import type { ThemeRegistrationRaw } from 'shiki';

/**
 * The site's syntax colors: one meaning per hue, the same in every language,
 * so a reader learns them once. global.css repeats them as --color-syn-* for
 * hand-written demos (keep both in sync).
 *
 *   purple  keywords        (SELECT, const, await, let, fn, for)
 *   blue    functions       (curl, nelcota, .from(), sign_in)
 *   green   text / strings  ('notes', "ana@example.com")
 *   orange  numbers, flags  (20, true, -H, --runtime)
 *   teal    types           (bigint, uuid, Note, Client)
 *   pink    keys / fields   ("id":, body:, [dependencies] keys)
 *   amber   variables       ($TOKEN, $status)
 *   gray    comments and punctuation
 */
export const SYNTAX = {
  light: {
    fg: '#1f2328',
    keyword: '#6e3fc9',
    function: '#0550ae',
    string: '#116329',
    number: '#a64b00',
    type: '#0a6b7a',
    property: '#b3245a',
    variable: '#8a5a00',
    comment: '#5b626a',
    punct: '#59616b',
  },
  dark: {
    fg: '#e6edf3',
    keyword: '#d2a8ff',
    function: '#79c0ff',
    string: '#7ee787',
    number: '#ffa657',
    type: '#56d4dd',
    property: '#ff9bc0',
    variable: '#e3b341',
    comment: '#8b949e',
    punct: '#a2abb5',
  },
} as const;

type Palette = (typeof SYNTAX)['light' | 'dark'];

const SCOPES: ReadonlyArray<{
  scope: readonly string[];
  color: keyof Palette;
  fontStyle?: string;
}> = [
  { scope: ['comment', 'punctuation.definition.comment'], color: 'comment', fontStyle: 'italic' },
  {
    scope: ['keyword', 'storage', 'storage.modifier', 'keyword.control', 'keyword.other'],
    color: 'keyword',
  },
  {
    scope: ['punctuation', 'keyword.operator', 'meta.brace', 'punctuation.separator'],
    color: 'punct',
  },
  {
    scope: [
      'string',
      'string.quoted',
      'punctuation.definition.string',
      'string.unquoted.heredoc',
      'string.interpolated',
    ],
    color: 'string',
  },
  {
    scope: [
      'constant.numeric',
      'constant.language',
      'constant.character',
      'support.constant',
      'constant.other.option',
    ],
    color: 'number',
  },
  {
    scope: [
      'entity.name.function',
      'support.function',
      'variable.function',
      'entity.name.command',
      'meta.function-call.generic',
      'entity.name.function.macro',
      'meta.attribute',
    ],
    color: 'function',
  },
  {
    scope: [
      'entity.name.type',
      'support.type',
      'storage.type.sql',
      'storage.type.primitive',
      'support.type.primitive',
      'entity.name.class',
      'entity.other.inherited-class',
    ],
    color: 'type',
  },
  {
    scope: [
      'support.type.property-name',
      'meta.object-literal.key',
      'variable.other.property',
      'variable.other.object.property',
      'meta.mapping.key',
      'entity.name.tag',
      'support.type.property-name.toml',
      'entity.name.section.group-title',
    ],
    color: 'property',
  },
  // Table and schema names stay in the text color: they are names, not values.
  { scope: ['constant.other.database-name', 'constant.other.table-name'], color: 'fg' },
  {
    scope: [
      'variable.other.normal.shell',
      'punctuation.definition.variable.shell',
      'variable.other.special.shell',
      'variable.other.bracket.shell',
    ],
    color: 'variable',
  },
];

function theme(name: string, type: 'light' | 'dark'): ThemeRegistrationRaw {
  const palette = SYNTAX[type];

  return {
    name,
    type,
    colors: { 'editor.foreground': palette.fg, 'editor.background': '#00000000' },
    settings: [
      { settings: { foreground: palette.fg } },
      ...SCOPES.map(({ scope, color, fontStyle }) => ({
        scope: [...scope],
        settings:
          fontStyle == null
            ? { foreground: palette[color] }
            : { foreground: palette[color], fontStyle },
      })),
    ],
  };
}

export const LIGHT_THEME = theme('nelcota-light', 'light');
export const DARK_THEME = theme('nelcota-dark', 'dark');
