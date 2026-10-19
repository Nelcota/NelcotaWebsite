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

export const GET: APIRoute = async ({ params }) => {
  const lang = resolveLocale(params.lang);
  const dict = t(lang);
  const [lineOne, lineTwo, lineThree] = dict.hero.title;

  // satori takes a React-like element tree; plain objects avoid a JSX runtime.
  const el = (type: string, props: Record<string, unknown>, ...children: unknown[]) => ({
    type,
    props: { ...props, children: children.length === 1 ? children[0] : children },
  });

  const tree = el(
    'div',
    {
      lang: bcp47[lang],
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        paddingLeft: '80px',
        backgroundColor: '#121212',
        backgroundImage: 'radial-gradient(circle at 82% 60%, #1b3a29 0%, #121212 55%)',
        color: '#ededed',
        fontFamily: 'Manrope',
      },
    },
    el(
      'div',
      { style: { display: 'flex', flexDirection: 'column', width: '720px', flexShrink: 0 } },
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
          style: { width: '14px', height: '14px', borderRadius: '7px', backgroundColor: '#87dba6' },
        }),
        SITE_NAME,
      ),
      el(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            marginTop: '36px',
            fontFamily: 'Manrope',
            fontWeight: 700,
            fontSize: '66px',
            lineHeight: 1,
            letterSpacing: '-3.5px',
          },
        },
        el('div', { style: { display: 'flex' } }, lineOne),
        el('div', { style: { display: 'flex' } }, lineTwo),
        el('div', { style: { display: 'flex', color: '#87dba6' } }, lineThree),
      ),
      el(
        'div',
        { style: { display: 'flex', marginTop: '36px', fontSize: '28px', color: '#a1a1a1' } },
        dict.meta.ogEyebrow,
      ),
    ),
    el('img', {
      src: mascot,
      width: MASCOT_WIDTH,
      height: MASCOT_HEIGHT,
      style: {
        position: 'absolute',
        right: '90px',
        top: '156px',
        width: `${MASCOT_WIDTH}px`,
        height: `${MASCOT_HEIGHT}px`,
      },
    }),
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
