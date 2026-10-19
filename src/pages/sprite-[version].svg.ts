import type { APIRoute, GetStaticPaths } from 'astro';
import { SPRITE_SVG, SPRITE_VERSION } from '../lib/sprite.ts';

/** The logo and icon sprite (src/lib/sprite.ts), at its content-hashed URL. */
export const getStaticPaths = (() => [
  { params: { version: SPRITE_VERSION } },
]) satisfies GetStaticPaths;

export const GET: APIRoute = () =>
  new Response(SPRITE_SVG, { headers: { 'Content-Type': 'image/svg+xml' } });
