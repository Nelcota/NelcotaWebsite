import { Resvg } from '@resvg/resvg-js';
import type { APIRoute } from 'astro';
import satori from 'satori';
import inter400 from '../../assets/fonts/og/inter-latin-400-normal.woff?inline';
import inter700 from '../../assets/fonts/og/inter-latin-700-normal.woff?inline';
import mascot from '../../assets/mascot.png?inline';
import { bcp47, isLocale, locales, t } from '../../i18n/utils.ts';

/** Open Graph image per locale (1200x630), rendered at build time with satori + resvg. */

export function getStaticPaths() {
  return locales.map((lang) => ({ params: { lang } }));
}

const decode = (dataUri: string) => Buffer.from(dataUri.slice(dataUri.indexOf(',') + 1), 'base64');

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang && isLocale(params.lang) ? params.lang : 'en';
  const dict = t(lang);

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
        padding: '72px',
        gap: '64px',
        backgroundColor: '#f6faf7',
        backgroundImage: 'radial-gradient(circle at 85% 15%, #edfef2 0%, #f6faf7 55%)',
        color: '#16211b',
        fontFamily: 'Inter',
      },
    },
    el(
      'div',
      {
        style: {
          display: 'flex',
          width: '300px',
          height: '300px',
          borderRadius: '64px',
          backgroundColor: '#edfef2',
          border: '4px solid #87dba6',
          padding: '18px',
          flexShrink: 0,
        },
      },
      el('img', { src: mascot, width: 264, height: 264, style: { borderRadius: '48px' } }),
    ),
    el(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '20px', width: '692px' } },
      el(
        'div',
        { style: { display: 'flex', fontSize: '72px', fontWeight: 700, letterSpacing: '-2px' } },
        'Nelcota',
      ),
      el(
        'div',
        { style: { display: 'flex', fontSize: '32px', lineHeight: 1.3, color: '#4b5e54' } },
        dict.hero.tagline,
      ),
      el(
        'div',
        {
          style: {
            display: 'flex',
            fontSize: '32px',
            lineHeight: 1.3,
            color: '#1d6f45',
            fontWeight: 700,
          },
        },
        dict.hero.taglineSecond,
      ),
      el(
        'div',
        { style: { display: 'flex', marginTop: '12px', fontSize: '24px', color: '#4b5e54' } },
        'github.com/Nelcota',
      ),
    ),
  );

  const svg = await satori(tree as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: decode(inter400), weight: 400, style: 'normal' },
      { name: 'Inter', data: decode(inter700), weight: 700, style: 'normal' },
    ],
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
