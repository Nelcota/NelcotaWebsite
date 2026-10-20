/**
 * Which repository files become pages under /docs, in sidebar order.
 * No `astro:*` imports: scripts/sync-docs.ts loads this file directly.
 *
 * `catalog` names a Portuguese catalog in docs/i18n/pt-BR/ of the Nelcota
 * repository (the same ones the admin panel uses). `language` marks a
 * source that is written in Portuguese and has no English version.
 * Page ids match the panel's guide ids where one exists (/admin/guides/<id>).
 */

export const DOC_GROUPS = ['start', 'build', 'operate', 'reference', 'design'] as const;
export type DocGroup = (typeof DOC_GROUPS)[number];

export interface DocPage {
  readonly id: string;
  readonly group: DocGroup;
  /** Path of the Markdown file in the Nelcota repository. */
  readonly source: string;
  readonly catalog?: string | undefined;
  readonly language?: 'pt-BR' | undefined;
}

export const DOC_PAGES = [
  { id: 'quickstart', group: 'start', source: 'docs/quickstart.md', catalog: 'quickstart' },
  { id: 'versions', group: 'start', source: 'docs/releases/README.md' },
  {
    id: 'sdk-start',
    group: 'start',
    source: 'sdk/typescript/docs/quickstart.pt-BR.md',
    language: 'pt-BR',
  },
  { id: 'notes', group: 'start', source: 'docs/onboarding/notes.md' },
  {
    id: 'troubleshooting',
    group: 'start',
    source: 'docs/troubleshooting.md',
    catalog: 'troubleshooting',
  },
  { id: 'glossary', group: 'start', source: 'docs/glossary.md' },

  { id: 'api', group: 'build', source: 'docs/api.md', catalog: 'api' },
  { id: 'auth', group: 'build', source: 'docs/schema-auth.md', catalog: 'auth' },
  { id: 'roles', group: 'build', source: 'docs/jwt-and-roles.md', catalog: 'roles' },
  { id: 'storage', group: 'build', source: 'docs/storage.md', catalog: 'storage' },
  { id: 'webhooks', group: 'build', source: 'docs/webhooks.md', catalog: 'webhooks' },
  { id: 'sdk', group: 'build', source: 'sdk/typescript/README.md', catalog: 'sdk' },
  { id: 'sdk-rust', group: 'build', source: 'sdk/rust/README.md', catalog: 'sdk-rust' },
  {
    id: 'rust-start',
    group: 'build',
    source: 'sdk/rust/docs/quickstart.pt-BR.md',
    language: 'pt-BR',
  },
  { id: 'examples', group: 'build', source: 'examples/README.md' },
  { id: 'auth-integration', group: 'build', source: 'docs/auth-integration.md' },

  { id: 'deploy', group: 'operate', source: 'docs/deploy.md', catalog: 'deploy' },
  { id: 'backup', group: 'operate', source: 'docs/backup.md', catalog: 'backup' },
  { id: 'panel', group: 'operate', source: 'docs/panel.md', catalog: 'panel' },
  { id: 'panel-updates', group: 'operate', source: 'docs/panel-updates.md' },
  { id: 'host-management', group: 'operate', source: 'docs/host-management.md' },
  { id: 'security', group: 'operate', source: 'docs/security/README.md' },
  { id: 'release', group: 'operate', source: 'docs/onboarding/release.md' },
  { id: 'leaving', group: 'operate', source: 'docs/leaving.md', catalog: 'leaving' },

  { id: 'configuration', group: 'reference', source: 'docs/configuration.md' },
  { id: 'cli', group: 'reference', source: 'docs/cli.md' },
  {
    id: 'sdk-contract',
    group: 'reference',
    source: 'sdk/typescript/docs/contract.md',
    catalog: 'sdk-contract',
  },
  {
    id: 'rust-contract',
    group: 'reference',
    source: 'sdk/rust/docs/contract.md',
    catalog: 'rust-contract',
  },

  {
    id: 'architecture',
    group: 'design',
    source: 'docs/architecture.md',
    catalog: 'architecture',
  },
  { id: 'decisions', group: 'design', source: 'docs/decisions.md', catalog: 'decisions' },
] as const satisfies readonly DocPage[];

export type DocPageId = (typeof DOC_PAGES)[number]['id'];

/** Repository path of a page's Portuguese catalog. */
export function catalogPath(catalog: string): string {
  return `docs/i18n/pt-BR/${catalog}.json`;
}

/** Every repository file the docs area needs: page sources plus their catalogs. */
export const VERSION_FILES = [
  'Cargo.toml',
  'sdk/rust/Cargo.toml',
  'sdk/typescript/package.json',
] as const;

export function requiredFiles(pages: readonly DocPage[] = DOC_PAGES): string[] {
  const files: string[] = [...VERSION_FILES];
  for (const page of pages) {
    files.push(page.source);
    if (page.catalog != null) files.push(catalogPath(page.catalog));
  }

  return files.toSorted();
}
