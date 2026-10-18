import { getImage } from 'astro:assets';
import type { APIRoute } from 'astro';
import mascot from '../assets/mascot.png';

/** Web app manifest with icons derived from the mascot at build time. */
export const GET: APIRoute = async () => {
  const [icon192, icon512] = await Promise.all([
    getImage({ src: mascot, width: 192, height: 192, format: 'png' }),
    getImage({ src: mascot, width: 512, height: 512, format: 'png' }),
  ]);

  const manifest = {
    name: 'Nelcota',
    short_name: 'Nelcota',
    description: 'Self-hosted, open-source tools for small teams.',
    start_url: import.meta.env.BASE_URL,
    display: 'browser',
    background_color: '#f6faf7',
    theme_color: '#87dba6',
    icons: [
      { src: icon192.src, sizes: '192x192', type: 'image/png' },
      { src: icon512.src, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
};
