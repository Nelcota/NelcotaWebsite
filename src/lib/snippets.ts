import { createHash } from 'node:crypto';
import type { Dictionary } from '../i18n/types.ts';
import { type CodeLang, HighlightRegistry } from './highlight.ts';

export interface CodeBlock {
  id: string;
  title: string;
  lang: CodeLang;
  code: string;
  html: string;
}

export interface CodeTab {
  id: 'ts' | 'rust';
  label: string;
  blocks: CodeBlock[];
}

export interface Snippets {
  tabs: CodeTab[];
  /** Token color classes for every block on the page. */
  css: string;
  /** CSP hash of `css`, to register with Astro.csp.insertStyleHash before <head> renders. */
  cssHash: `sha256-${string}`;
}

/**
 * Real install and usage examples taken from the SDK READMEs:
 * https://github.com/Nelcota/Nelcota/tree/main/sdk/typescript
 * https://github.com/Nelcota/Nelcota/tree/main/sdk/rust
 */
export async function buildSnippets(dict: Dictionary): Promise<Snippets> {
  const source: Array<Omit<CodeTab, 'blocks'> & { blocks: Array<Omit<CodeBlock, 'html'>> }> = [
    {
      id: 'ts',
      label: dict.build.tabs.ts,
      blocks: [
        {
          id: 'ts-install',
          title: dict.build.install,
          lang: 'shellscript',
          code: `npm install @nelcota/client@0.1.2
nelcota types -o src/database.ts`,
        },
        {
          id: 'ts-usage',
          title: dict.build.usage,
          lang: 'typescript',
          code: `import { createClient } from '@nelcota/client';
import type { Database } from './database';

export const nelcota = createClient<Database>('https://api.example.com');

const { data, error } = await nelcota.from('notes').select('id,body');
if (error) console.error(error.code, error.message);`,
        },
      ],
    },
    {
      id: 'rust',
      label: dict.build.tabs.rust,
      blocks: [
        {
          id: 'rust-install',
          title: 'Cargo.toml',
          lang: 'toml',
          code: `[dependencies]
nelcota-client = "0.1.2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }`,
        },
        {
          id: 'rust-usage',
          title: dict.build.usage,
          lang: 'rust',
          code: `use nelcota_client::{Client, rest::Order};
use serde::Deserialize;

#[derive(Deserialize)]
struct Note { id: i64, body: String }

let client = Client::builder("https://api.example.com").build()?;
client.auth().sign_in_with_password("ana@example.com", "password").await?;
let response = client.from("notes").select("id,body")
    .order("id", Order::descending()).range(0, 19).count_exact()
    .execute::<Vec<Note>>().await?;
for note in response.data { println!("{}: {}", note.id, note.body); }`,
        },
      ],
    },
  ];

  const registry = new HighlightRegistry();
  const tabs: CodeTab[] = [];
  for (const tab of source) {
    const blocks: CodeBlock[] = [];
    for (const block of tab.blocks) {
      blocks.push({ ...block, html: await registry.render(block.code, block.lang) });
    }
    tabs.push({ ...tab, blocks });
  }

  const css = registry.css();
  const cssHash = `sha256-${createHash('sha256').update(css).digest('base64')}` as const;
  return { tabs, css, cssHash };
}
