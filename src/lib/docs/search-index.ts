/**
 * The static search index of one locale, served as JSON and fetched by
 * src/scripts/docs-search.ts on first focus. Compact arrays keep it small:
 * every page is [title, url, sections] and every section [anchor, heading, text].
 */
import type { Locale } from '../../i18n/utils.ts';
import { loadDocs } from './content.ts';

export type SearchSection = readonly [anchor: string, heading: string, text: string];
export type SearchPage = readonly [title: string, url: string, sections: readonly SearchSection[]];

export async function searchIndexResponse(locale: Locale): Promise<Response> {
  const bundle = await loadDocs(locale);
  const pages: SearchPage[] = bundle.pages.map((page) => [
    page.title,
    page.url,
    page.sections.map((section): SearchSection => [section.anchor, section.heading, section.text]),
  ]);

  return new Response(JSON.stringify(pages), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
