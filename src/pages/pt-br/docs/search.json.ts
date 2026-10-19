import type { APIRoute } from 'astro';
import { searchIndexResponse } from '../../../lib/docs/search-index.ts';

export const GET: APIRoute = () => searchIndexResponse('pt-br');
