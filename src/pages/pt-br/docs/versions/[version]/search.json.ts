import type { APIRoute, GetStaticPaths } from 'astro';
import { searchIndexResponse } from '../../../../../lib/docs/search-index.ts';
import { docsVersion, RELEASE_DOC_VERSIONS } from '../../../../../lib/docs/versions.ts';

export const getStaticPaths = (() =>
  RELEASE_DOC_VERSIONS.map(({ id }) => ({ params: { version: id } }))) satisfies GetStaticPaths;
export const GET: APIRoute = ({ params }) =>
  searchIndexResponse('pt-br', docsVersion(params.version).id);
