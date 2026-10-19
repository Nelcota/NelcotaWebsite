import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Lexer } from 'marked';
import { headingSlug, type RenderOptions, renderDoc } from '../../src/lib/docs/render.ts';
import { checkCatalog, translateTokens } from '../../src/lib/docs/translate.ts';
import { HighlightRegistry } from '../../src/lib/highlight.ts';

const PAGES: Readonly<Record<string, string>> = {
  'docs/deploy.md': 'deploy',
  'docs/api.md': 'api',
};
const TITLES: Readonly<Record<string, string>> = { deploy: 'Deploy guide' };

function options(overrides: Partial<RenderOptions> = {}): RenderOptions {
  return {
    source: 'docs/api.md',
    catalog: undefined,
    registry: new HighlightRegistry(),
    pageForSource: (path) => PAGES[path],
    pageUrl: (page, anchor) => `/docs/${page}/${anchor.length > 0 ? `#${anchor}` : ''}`,
    pageTitle: (page) => TITLES[page],
    repoFileUrl: (path) => `https://github.com/Nelcota/Nelcota/blob/main/${path}`,
    spriteUrl: '/sprite-0123456789.svg',
    labels: {
      copy: 'Copy',
      copied: 'Copied',
      copyFailed: 'Failed',
      sectionLink: 'Link',
      table: 'Table',
    },
    ...overrides,
  };
}

describe('headingSlug', () => {
  it('should follow GitHub anchors when the heading has code and punctuation', () => {
    assert.equal(headingSlug('Reads: `GET /rest/v1/{table}`'), 'reads-get-restv1table');
  });

  it('should keep accents when the heading is not ASCII', () => {
    assert.equal(headingSlug('Restauração rápida'), 'restauração-rápida');
  });
});

describe('renderDoc', () => {
  it('should find the title after blank lines and an HTML comment', async () => {
    const doc = await renderDoc('<!-- synced -->\n\n# Deploy\n\nBody\n', options());

    assert.equal(doc.title, 'Deploy');
    assert.doesNotMatch(doc.html, /<h[12][^>]*>Deploy/);
  });

  it('should fail loudly when the document has no title', async () => {
    await assert.rejects(renderDoc('Body without a title\n', options()), /no "# Title"/);
  });

  it('should give every repeated heading a distinct id', async () => {
    const doc = await renderDoc('# T\n\n## Setup\n\n## Setup\n\n## Setup 1\n', options());
    const ids = doc.headings.map((heading) => heading.id);

    assert.deepEqual(ids, ['setup', 'setup-1', 'setup-1-1']);
  });

  it('should give an emoji-only heading a usable id', async () => {
    const doc = await renderDoc('# T\n\n## 🚀\n', options());

    assert.equal(doc.headings[0]?.id, 'section');
  });

  it('should not crash the build on a malformed %-escape in a link', async () => {
    const doc = await renderDoc('# T\n\n[x](foo%zz.md)\n', options());

    assert.match(doc.html, />x</);
  });

  it('should escape raw HTML when the source contains tags', async () => {
    const doc = await renderDoc('# T\n\n<script>alert(1)</script>\n', options());

    assert.doesNotMatch(doc.html, /<script>/);
    assert.match(doc.html, /&lt;script&gt;/);
  });

  it('should drop the link but keep its text when the protocol is not http(s)', async () => {
    const doc = await renderDoc('# T\n\n[click](javascript:alert(1))\n', options());

    assert.doesNotMatch(doc.html, /javascript:/);
    assert.match(doc.html, /click/);
  });

  it('should link to the docs page and show its title when the text is a file name', async () => {
    const doc = await renderDoc('# T\n\nSee [deploy.md](deploy.md#https).\n', options());

    assert.match(doc.html, /<a href="\/docs\/deploy\/#https">Deploy guide<\/a>/);
    assert.deepEqual(doc.links, [{ page: 'deploy', anchor: 'https' }]);
  });

  it('should link to GitHub when the repository file is not published', async () => {
    const doc = await renderDoc('# T\n\n[script](../scripts/install.sh)\n', options());

    assert.match(
      doc.html,
      /href="https:\/\/github.com\/Nelcota\/Nelcota\/blob\/main\/scripts\/install.sh" rel="noopener"/,
    );
  });

  it('should number repeated headings like GitHub when two share a title', async () => {
    const doc = await renderDoc('# T\n\n## Example\n\n## Example\n', options());

    assert.deepEqual(
      doc.headings.map((heading) => heading.id),
      ['example', 'example-1'],
    );
  });

  it('should keep English anchors when the headings are translated', async () => {
    const catalog = { T: 'T', 'Install it': 'Instale', Body: 'Corpo' };
    const doc = await renderDoc('# T\n\n## Install it\n\nBody\n', options({ catalog }));

    assert.match(doc.html, /<h2 id="install-it"[^>]*>Instale/);
    assert.equal(doc.untranslated, 0);
  });

  it('should add a copy button tied to the caption when rendering a code block', async () => {
    const doc = await renderDoc('# T\n\n```sh\nnelcota up\n```\n', options());

    assert.match(doc.html, /<figcaption id="code-1-caption">shell<\/figcaption>/);
    assert.match(doc.html, /data-copy="code-1"[^>]*aria-describedby="code-1-caption"/);
  });

  it('should use the first heading as title and the first paragraph as lead', async () => {
    const doc = await renderDoc(
      '# The `auth` schema\n\nA public contract.\n\n## Tables\n',
      options(),
    );

    assert.equal(doc.title, 'The auth schema');
    assert.equal(doc.lead, 'A public contract.');
  });
});

describe('translateTokens', () => {
  it('should keep the English text when a translation changes inline code', () => {
    const tokens = Lexer.lex('Run `nelcota up` now.\n');
    const untranslated = translateTokens(tokens, {
      'Run `nelcota up` now.': 'Rode `nelcota down` agora.',
    });

    assert.equal(untranslated, 1);
    assert.match(JSON.stringify(tokens), /nelcota up/);
  });

  it('should skip fragments without letters when they are only code', () => {
    const tokens = Lexer.lex('`a` / `b`\n');

    assert.equal(translateTokens(tokens, {}), 0);
  });
});

describe('checkCatalog', () => {
  it('should report missing and outdated keys when the source changed', () => {
    const report = checkCatalog('# New title\n\nSame text.\n', {
      'Old title': 'Título antigo',
      'Same text.': 'Mesmo texto.',
    });

    assert.deepEqual(report.missing, ['New title']);
    assert.deepEqual(report.outdated, ['Old title']);
    assert.deepEqual(report.changed, []);
  });
});
