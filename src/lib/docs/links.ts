/**
 * Links into the /docs area. Landing sections reference documents by their
 * DOCS key (src/lib/site.ts); keys with a published page go to /docs, the rest
 * (changelog, license, contributing…) stay on GitHub.
 */
import { getRelativeLocaleUrl } from 'astro:i18n';
import type { Locale } from '../../i18n/utils.ts';
import { DOCS, type DocKey } from '../site.ts';
import type { DocPageId } from './manifest.ts';
import { type DocsVersion, docsPath } from './versions.ts';

const PAGE_OF_KEY: Partial<Record<DocKey, DocPageId | 'index'>> = {
  index: 'index',
  quickstart: 'quickstart',
  troubleshooting: 'troubleshooting',
  api: 'api',
  auth: 'auth',
  roles: 'roles',
  storage: 'storage',
  webhooks: 'webhooks',
  panel: 'panel',
  deploy: 'deploy',
  backup: 'backup',
  security: 'security',
  configuration: 'configuration',
  cli: 'cli',
  architecture: 'architecture',
  leaving: 'leaving',
  examples: 'examples',
  sdkTs: 'sdk',
  sdkRust: 'sdk-rust',
};

export function docsIndexUrl(locale: Locale, version: DocsVersion = 'current'): string {
  return getRelativeLocaleUrl(locale, docsPath(version));
}

export function docUrl(
  locale: Locale,
  page: string,
  anchor = '',
  version: DocsVersion = 'current',
): string {
  const url = getRelativeLocaleUrl(locale, docsPath(version, page));

  return anchor.length === 0 ? url : `${url}#${anchor}`;
}

export function docHref(key: DocKey, locale: Locale): string {
  const page = PAGE_OF_KEY[key];
  if (page == null) return DOCS[key];
  if (page === 'index') return docsIndexUrl(locale);

  return docUrl(locale, page);
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}
