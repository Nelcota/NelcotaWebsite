/** Supported documentation snapshots. Current syncs never replace release archives. */
export const DOC_VERSIONS = [
  { id: 'current', directory: 'nelcota-docs', ref: 'main' },
  { id: 'v0.5.0', directory: 'nelcota-docs-releases/v0.5.0', ref: 'v0.5.0' },
] as const;

export type DocsVersion = (typeof DOC_VERSIONS)[number]['id'];
export const RELEASE_DOC_VERSIONS = DOC_VERSIONS.filter((version) => version.id !== 'current');

export function docsVersion(id: string = 'current'): (typeof DOC_VERSIONS)[number] {
  const version = DOC_VERSIONS.find((candidate) => candidate.id === id);
  if (version == null) throw new Error(`Unknown documentation version: ${id}`);

  return version;
}

export function docsPath(version: DocsVersion = 'current', page = ''): string {
  const root = version === 'current' ? 'docs/' : `docs/versions/${version}/`;

  return page.length === 0 ? root : `${root}${page}/`;
}
