import { createHash } from 'node:crypto';
import type { Dictionary } from '../i18n/types.ts';
import { type CodeLang, HighlightRegistry } from './highlight.ts';
import { LOCAL_INSTALL_COMMAND } from './site.ts';

export interface CodeBlock {
  readonly id: string;
  readonly title: string;
  readonly lang: CodeLang;
  readonly code: string;
  readonly html: string;
}

export interface CodeTab {
  readonly id: 'ts' | 'rust';
  readonly label: string;
  readonly blocks: readonly CodeBlock[];
}

type Triple<T> = readonly [T, T, T];

export interface Snippets {
  /** One block per quickstart step, in order. */
  readonly quickstart: Triple<CodeBlock>;
  /** Step 1 on macOS and Windows: build the release from source (docs/quickstart.md). */
  readonly installFromSource: CodeBlock;
  readonly sdkTabs: readonly CodeTab[];
  /** Token color classes for every block on the page. */
  readonly css: string;
  /** CSP hash of `css`, to register with Astro.csp.insertStyleHash before <head> renders. */
  readonly cssHash: `sha256-${string}`;
}

type Source = Omit<CodeBlock, 'html'>;

interface TabSource {
  readonly id: CodeTab['id'];
  readonly label: string;
  readonly blocks: readonly Source[];
}

/**
 * Examples follow the repository's docs/quickstart.md, docs/api.md and the SDK READMEs:
 * https://github.com/Nelcota/Nelcota/blob/main/docs/quickstart.md
 * https://github.com/Nelcota/Nelcota/tree/main/sdk
 */
type Comments = Dictionary['code']['comments'];

/** The notes table and its access rules; `--` comments explain each statement. */
function notesSchema(c: Comments): string {
  return `-- ${c.table}
CREATE TABLE public.notes (
    id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    owner uuid   NOT NULL DEFAULT auth.uid(),
    body  text   NOT NULL
);

-- ${c.rls}
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- ${c.grant}
GRANT SELECT, INSERT, UPDATE, DELETE
    ON public.notes
    TO authenticated;

-- ${c.policy}
CREATE POLICY notes_owner
    ON public.notes
    FOR ALL
    TO authenticated
    USING      (owner = auth.uid())
    WITH CHECK (owner = auth.uid());`;
}

/** The private bucket the storage examples use: each user owns the folder named after their id. */
function filesSchema(c: Comments): string {
  return `-- ${c.bucket}
INSERT INTO storage.buckets (id, public) VALUES ('files', false);

CREATE POLICY notes_files_owner
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'files'
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'files'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );`;
}

const API = 'http://127.0.0.1:8000';

function installFromSourceSource(c: Comments): Source {
  return {
    id: 'qs-install-source',
    title: 'terminal',
    lang: 'shellscript',
    code: `# ${c.buildSource}
cargo install --locked \\
  --git https://github.com/Nelcota/Nelcota \\
  --tag v0.5.0 nelcota-server

# ${c.newFolder}
mkdir notes-app && cd notes-app

# ${c.startDev}
nelcota dev`,
  };
}

function quickstartSources(dict: Dictionary): Triple<Source> {
  const c = dict.code.comments;

  return [
    {
      id: 'qs-install',
      title: 'terminal',
      lang: 'shellscript',
      code: `# ${c.install}
${LOCAL_INSTALL_COMMAND.replace(' | ', ' \\\n  | ')}

# ${c.newFolder}
mkdir notes-app && cd notes-app

# ${c.startDev}
nelcota dev`,
    },
    {
      id: 'qs-migrate',
      title: dict.quickstart.secondTerminal,
      lang: 'shellscript',
      code: `# ${c.writeMigration}
mkdir -p migrations src
cat > migrations/V1__notes.sql <<'SQL'
${notesSchema(c)}

${filesSchema(c)}
SQL

# ${c.apply}
nelcota migrate
nelcota types -o src/database.ts`,
    },
    {
      id: 'qs-request',
      title: 'terminal',
      lang: 'shellscript',
      code: `# ${c.signup}
TOKEN=$(curl -fsS -X POST ${API}/auth/v1/signup \\
  -H 'content-type: application/json' \\
  -d '{"email":"ana@example.com","password":"a-development-password"}' \\
  | jq -er '.access_token')

# ${c.wait}
for attempt in 1 2 3 4 5 6 7 8 9 10; do
  status=$(curl -s -o /dev/null -w '%{http_code}' \\
    -H "authorization: Bearer $TOKEN" \\
    ${API}/rest/v1/notes)
  [ "$status" = 200 ] && break
  sleep 0.2
done
[ "$status" = 200 ] || echo 'notes is not ready: check the nelcota dev terminal' >&2

# ${c.insert}
curl -fsS -X POST ${API}/rest/v1/notes \\
  -H "authorization: Bearer $TOKEN" \\
  -H 'content-type: application/json' \\
  -d '{"body":"My first note"}'

# ${c.read}
curl -fsS '${API}/rest/v1/notes?order=id.desc' \\
  -H "authorization: Bearer $TOKEN"`,
    },
  ];
}

function sdkSources(dict: Dictionary): readonly TabSource[] {
  const c = dict.code.comments;

  return [
    {
      id: 'ts',
      label: 'TypeScript',
      blocks: [
        {
          id: 'ts-install',
          title: dict.sdks.install,
          lang: 'shellscript',
          code: `# ${c.sdkInstall}
npm install @nelcota/client@0.1.2

# ${c.sdkTypes}
nelcota types -o src/database.ts`,
        },
        {
          id: 'ts-usage',
          title: dict.sdks.usage,
          lang: 'typescript',
          code: `import { createClient } from '@nelcota/client';
import type { Database } from './database';

// ${c.sdkClient}
const nelcota = createClient<Database>('https://api.example.com');

// ${c.sdkInsert}
await nelcota
  .from('notes')
  .insert({ body: 'Ship the webhook receiver' });

// ${c.sdkFolder}
const { data: user } = await nelcota.auth.getUser();
if (user == null) throw new Error('Sign in first');

const files = nelcota.storage.from('files');
const path = \`\${user.id}/report.pdf\`;

// ${c.sdkUpload}
const report = await (await fetch('/q3-report.pdf')).blob();
await files.upload(path, report);
const { data: url } = await files.createSignedUrl(path, 600);`,
        },
      ],
    },
    {
      id: 'rust',
      label: 'Rust',
      blocks: [
        {
          id: 'rust-install',
          title: 'Cargo.toml',
          lang: 'toml',
          code: `[dependencies]
nelcota-client = "0.1.2"
serde = { version = "1", features = ["derive"] }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }`,
        },
        {
          id: 'rust-usage',
          title: dict.sdks.usage,
          lang: 'rust',
          code: `use nelcota_client::{rest::Order, Client};
use serde::Deserialize;

#[derive(Deserialize)]
struct Note {
    id: i64,
    body: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::builder("https://api.example.com").build()?;

    // ${c.rustSignIn}
    client
        .auth()
        .sign_in_with_password("ana@example.com", "password")
        .await?;

    // ${c.rustQuery}
    let response = client
        .from("notes")
        .select("id,body")
        .order("id", Order::descending())
        .range(0, 19)
        .count_exact()
        .execute::<Vec<Note>>()
        .await?;

    for note in &response.data {
        println!("{} {}", note.id, note.body);
    }
    println!("{:?} notes in total", response.count);

    Ok(())
}`,
        },
      ],
    },
  ];
}

function hashCss(css: string): `sha256-${string}` {
  return `sha256-${createHash('sha256').update(css).digest('base64')}`;
}

export async function buildSnippets(dict: Dictionary): Promise<Snippets> {
  const registry = new HighlightRegistry();

  const render = async (block: Source): Promise<CodeBlock> => ({
    ...block,
    html: await registry.render(block.code, block.lang),
  });

  const renderTriple = async (sources: Triple<Source>): Promise<Triple<CodeBlock>> => {
    const [first, second, third] = await Promise.all(sources.map(render));

    if (first == null || second == null || third == null) {
      throw new RangeError('Expected exactly three code blocks.');
    }

    return [first, second, third];
  };

  const renderTab = async (tab: TabSource): Promise<CodeTab> => ({
    ...tab,
    blocks: await Promise.all(tab.blocks.map(render)),
  });

  const [installFromSource, quickstart, sdkTabs] = await Promise.all([
    render(installFromSourceSource(dict.code.comments)),
    renderTriple(quickstartSources(dict)),
    Promise.all(sdkSources(dict).map(renderTab)),
  ]);

  const css = registry.css();

  return { installFromSource, quickstart, sdkTabs, css, cssHash: hashCss(css) };
}
