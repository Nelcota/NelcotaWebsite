import { Resvg } from '@resvg/resvg-js';
import type { APIRoute } from 'astro';
import satori from 'satori';
import manrope400 from '../../assets/fonts/og/manrope-latin-400-normal.woff?inline';
import manrope700 from '../../assets/fonts/og/manrope-latin-700-normal.woff?inline';
import mascot from '../../assets/mascot/standing.png?inline';
import { bcp47, defaultLocale, isLocale, type Locale, locales, t } from '../../i18n/utils.ts';
import { SITE_NAME } from '../../lib/site.ts';

/** Open Graph image per locale (1200x630), rendered at build time with satori + resvg. */

const WIDTH = 1200;
const HEIGHT = 630;
/** The mascot keeps its 280 × 318 drawing ratio, pinned right of the copy. */
const MASCOT_WIDTH = 280;
const MASCOT_HEIGHT = 318;

export function getStaticPaths(): { params: { lang: Locale } }[] {
  return locales.map((lang) => ({ params: { lang } }));
}

function resolveLocale(lang: string | undefined): Locale {
  if (lang == null) return defaultLocale;

  return isLocale(lang) ? lang : defaultLocale;
}

const decode = (dataUri: string): Buffer =>
  Buffer.from(dataUri.slice(dataUri.indexOf(',') + 1), 'base64');

/** Gallery palette (global.css tokens), fixed here because satori has no CSS variables. */
const CANVAS = '#f5f5f4';
const INK = '#111213';
const MUTED = '#62666a';
const BRAND = '#1b7640';
/** The three tilted cards behind the mascot: color, left offset, top offset, rotation. */
const CARDS = [
  { color: '#cdbdff', left: 0, top: 80, rotate: -10 },
  { color: '#f1dfb8', left: 100, top: 40, rotate: 2 },
  { color: '#87dba6', left: 200, top: 90, rotate: 12 },
] as const;
const CARD_WIDTH = 180;
const CARD_HEIGHT = 240;
/** Where the fan starts and how wide it is, so nothing runs off the 1200 px canvas. */
const FAN_LEFT = 740;
const FAN_WIDTH = 400;

// satori takes a React-like element tree; plain objects avoid a JSX runtime.
const el = (type: string, props: Record<string, unknown>, ...children: unknown[]) => ({
  type,
  props: { ...props, children: children.length === 1 ? children[0] : children },
});

/** The brand chip: a green square with the name next to it, like the site header. */
const brand = () =>
  el(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        fontSize: '30px',
        fontWeight: 700,
      },
    },
    el('div', {
      style: { width: '40px', height: '40px', borderRadius: '11px', backgroundColor: BRAND },
    }),
    SITE_NAME,
  );

/** Three tilted cards with the mascot standing in front, and one @mention bubble. */
const fan = () =>
  el(
    'div',
    {
      style: {
        display: 'flex',
        position: 'absolute',
        left: `${FAN_LEFT}px`,
        top: '150px',
        width: `${FAN_WIDTH}px`,
        height: '420px',
      },
    },
    ...CARDS.map((card) =>
      el('div', {
        style: {
          position: 'absolute',
          left: `${card.left}px`,
          top: `${card.top}px`,
          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,
          borderRadius: '28px',
          backgroundColor: card.color,
          transform: `rotate(${card.rotate}deg)`,
          boxShadow: '0 24px 48px -20px rgba(11, 13, 12, 0.35)',
        },
      }),
    ),
    el('img', {
      src: mascot,
      width: MASCOT_WIDTH,
      height: MASCOT_HEIGHT,
      style: {
        position: 'absolute',
        left: '60px',
        top: '70px',
        width: `${MASCOT_WIDTH}px`,
        height: `${MASCOT_HEIGHT}px`,
      },
    }),
    el(
      'div',
      {
        style: {
          display: 'flex',
          position: 'absolute',
          right: '0px',
          top: '10px',
          padding: '10px 18px',
          borderRadius: '999px 999px 999px 6px',
          backgroundColor: '#d4246f',
          color: '#ffffff',
          fontSize: '22px',
          fontWeight: 700,
        },
      },
      '200 OK',
    ),
  );

export const GET: APIRoute = async ({ params }) => {
  const lang = resolveLocale(params.lang);
  const dict = t(lang);
  const [lineOne, lineTwo] = dict.landing.hero.title;

  const tree = el(
    'div',
    {
      lang: bcp47[lang],
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        padding: '72px 80px',
        backgroundColor: CANVAS,
        color: INK,
        fontFamily: 'Manrope',
      },
    },
    el(
      'div',
      { style: { display: 'flex', flexDirection: 'column', width: '680px', flexShrink: 0 } },
      brand(),
      el(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            marginTop: '64px',
            fontWeight: 700,
            fontSize: '68px',
            lineHeight: 1,
            letterSpacing: '-4px',
          },
        },
        el('div', { style: { display: 'flex' } }, lineOne),
        el('div', { style: { display: 'flex', color: MUTED, marginTop: '8px' } }, lineTwo),
      ),
      el(
        'div',
        {
          style: {
            display: 'flex',
            maxWidth: '600px',
            marginTop: '44px',
            fontSize: '26px',
            color: MUTED,
          },
        },
        dict.meta.ogEyebrow,
      ),
    ),
    fan(),
  );

  const svg = await satori(tree as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: 'Manrope', data: decode(manrope400), weight: 400, style: 'normal' },
      { name: 'Manrope', data: decode(manrope700), weight: 700, style: 'normal' },
    ],
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
