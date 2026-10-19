/**
 * Feature comparison shown at /compare/. Every cell was checked against the
 * official docs, repos and pricing pages listed in PRODUCT_INFO.sources on
 * CHECKED_ON. Update the date (and the versions) whenever a cell changes.
 *
 * Fairness rules: compare self-hosted with self-hosted, describe each project
 * in its own terms, and list what Nelcota lacks as plainly as what it has.
 */
import type { Locale } from '../i18n/utils.ts';

export type Localized = Readonly<Record<Locale, string>>;
export type Support = 'yes' | 'partial' | 'no';

export const PRODUCTS = ['nelcota', 'supabase', 'pocketbase', 'appwrite'] as const;
export type Product = (typeof PRODUCTS)[number];
export const RIVALS = PRODUCTS.filter((product) => product !== 'nelcota');

export const CHECKED_ON = '2026-10-18';

export interface Cell {
  /** Omitted on descriptive rows (database, license...), where a mark would mean nothing. */
  readonly support?: Support;
  readonly text: Localized;
}

export interface Row {
  readonly label: Localized;
  /** Shown in the short table on the home page too. */
  readonly onHome?: boolean;
  readonly cells: Readonly<Record<Product, Cell>>;
}

export interface Group {
  readonly title: Localized;
  readonly rows: readonly Row[];
}

export interface Source {
  readonly label: Localized;
  readonly href: string;
}

export interface ProductInfo {
  readonly name: string;
  readonly version: Localized;
  readonly fit: Localized;
  readonly sources: readonly Source[];
}

/** Same text in both languages (names, versions, licenses). */
const same = (text: string): Localized => ({ en: text, 'pt-br': text });
const say = (en: string, ptBr: string): Localized => ({ en, 'pt-br': ptBr });

const cell = (text: Localized, support?: Support): Cell =>
  support == null ? { text } : { text, support };

const NELCOTA_REPO = 'https://github.com/Nelcota/Nelcota/blob/v0.4.0';
const NELCOTA_MAIN = 'https://github.com/Nelcota/Nelcota/blob/main';
const SUPABASE_DOCS = 'https://supabase.com/docs/guides';
const POCKETBASE_DOCS = 'https://pocketbase.io/docs';
const APPWRITE_DOCS = 'https://appwrite.io/docs';

export const COMPARE_GROUPS: readonly Group[] = [
  {
    title: say('Architecture', 'Arquitetura'),
    rows: [
      {
        label: say('What you run', 'O que você roda'),
        onHome: true,
        cells: {
          nelcota: cell(
            say(
              'One Rust binary + PostgreSQL, on Docker Compose (default) or systemd. Caddy adds HTTPS.',
              'Um binário Rust + PostgreSQL, em Docker Compose (padrão) ou systemd. O Caddy cuida do HTTPS.',
            ),
          ),
          supabase: cell(
            say('11 containers in the official Docker setup', '11 containers no Docker oficial'),
          ),
          pocketbase: cell(
            say('One Go binary, database embedded', 'Um binário Go, banco embutido'),
          ),
          appwrite: cell(
            say(
              'A Docker stack: API, background workers, Redis, ClickHouse, Traefik and more',
              'Uma stack Docker: API, workers, Redis, ClickHouse, Traefik e outros',
            ),
          ),
        },
      },
      {
        label: say('Database', 'Banco de dados'),
        onHome: true,
        cells: {
          nelcota: cell(same('PostgreSQL 17')),
          supabase: cell(same('PostgreSQL 17')),
          pocketbase: cell(
            say('SQLite, embedded. No PostgreSQL.', 'SQLite, embutido. Sem PostgreSQL.'),
          ),
          appwrite: cell(
            say(
              'PostgreSQL by default; MariaDB or MongoDB also offered',
              'PostgreSQL por padrão; MariaDB ou MongoDB também',
            ),
          ),
        },
      },
      {
        label: say('Written in', 'Escrito em'),
        cells: {
          nelcota: cell(same('Rust')),
          supabase: cell(
            say(
              'TypeScript, Go, Haskell, Elixir and Rust, per service',
              'TypeScript, Go, Haskell, Elixir e Rust, por serviço',
            ),
          ),
          pocketbase: cell(same('Go')),
          appwrite: cell(say('PHP (Swoole)', 'PHP (Swoole)')),
        },
      },
      {
        label: say('License', 'Licença'),
        cells: {
          nelcota: cell(same('Apache-2.0')),
          supabase: cell(
            say('Apache-2.0 and MIT, per component', 'Apache-2.0 e MIT, por componente'),
          ),
          pocketbase: cell(same('MIT')),
          appwrite: cell(same('BSD-3-Clause')),
        },
      },
      {
        label: say('Hardware', 'Hardware'),
        onHome: true,
        cells: {
          nelcota: cell(
            say(
              'No stated minimum. The deploy guide estimates 2–3 small projects on a 1 GB VPS.',
              'Sem mínimo oficial. O guia de deploy estima 2–3 projetos pequenos numa VPS de 1 GB.',
            ),
          ),
          supabase: cell(say('Minimum 2 CPU, 4 GB RAM', 'Mínimo de 2 CPU, 4 GB de RAM')),
          pocketbase: cell(say('No stated minimum', 'Sem mínimo oficial')),
          appwrite: cell(
            say('Minimum 2 CPU, 4 GB RAM, 2 GB swap', 'Mínimo de 2 CPU, 4 GB de RAM, 2 GB de swap'),
          ),
        },
      },
      {
        label: say('Maturity', 'Maturidade'),
        cells: {
          nelcota: cell(
            say(
              '0.x: upgrades can bring breaking changes',
              '0.x: atualizações podem quebrar compatibilidade',
            ),
            'partial',
          ),
          supabase: cell(
            say('Generally available since April 2024', 'Estável (GA) desde abril de 2024'),
            'yes',
          ),
          pocketbase: cell(
            say(
              'Pre-1.0: no backward-compatibility guarantee',
              'Antes da 1.0: sem garantia de compatibilidade',
            ),
            'partial',
          ),
          appwrite: cell(say('Stable 2.x releases', 'Versões 2.x estáveis'), 'yes'),
        },
      },
    ],
  },
  {
    title: say('Data and access', 'Dados e acesso'),
    rows: [
      {
        label: say('API from your schema', 'API a partir do seu schema'),
        cells: {
          nelcota: cell(
            say(
              'REST with filters, relations and RPC, plus OpenAPI',
              'REST com filtros, relações e RPC, mais OpenAPI',
            ),
            'yes',
          ),
          supabase: cell(
            say(
              'REST (PostgREST) and GraphQL (pg_graphql)',
              'REST (PostgREST) e GraphQL (pg_graphql)',
            ),
            'yes',
          ),
          pocketbase: cell(say('REST for each collection', 'REST para cada coleção'), 'yes'),
          appwrite: cell(
            say(
              'REST and GraphQL over tables you define in Appwrite',
              'REST e GraphQL sobre tabelas definidas no Appwrite',
            ),
            'yes',
          ),
        },
      },
      {
        label: say(
          'Access rules enforced by PostgreSQL (RLS)',
          'Regras de acesso aplicadas pelo PostgreSQL (RLS)',
        ),
        onHome: true,
        cells: {
          nelcota: cell(
            say(
              'RLS policies and GRANTs on every API request; service_role bypasses them',
              'Políticas RLS e GRANTs em toda requisição da API; o service_role passa por cima',
            ),
            'yes',
          ),
          supabase: cell(
            say(
              'RLS policies and GRANTs; service_role bypasses them',
              'Políticas RLS e GRANTs; o service_role passa por cima',
            ),
            'yes',
          ),
          pocketbase: cell(
            say(
              'Own API rules per collection (filter expressions)',
              'Regras de API próprias por coleção (expressões de filtro)',
            ),
            'no',
          ),
          appwrite: cell(
            say(
              'Own permissions per resource, with optional row security',
              'Permissões próprias por recurso, com segurança por linha opcional',
            ),
            'no',
          ),
        },
      },
      {
        label: say('Realtime subscriptions', 'Assinaturas em tempo real'),
        onHome: true,
        cells: {
          nelcota: cell(say('Not yet', 'Ainda não'), 'no'),
          supabase: cell(
            say(
              'Database changes, broadcast and presence',
              'Mudanças no banco, broadcast e presença',
            ),
            'yes',
          ),
          pocketbase: cell(say('Server-Sent Events', 'Server-Sent Events'), 'yes'),
          appwrite: cell(say('WebSocket channels', 'Canais via WebSocket'), 'yes'),
        },
      },
      {
        label: say('Code on the server', 'Código no servidor'),
        onHome: true,
        cells: {
          nelcota: cell(
            say(
              'SQL functions called through RPC; no function runtime',
              'Funções SQL chamadas por RPC; sem runtime de funções',
            ),
            'partial',
          ),
          supabase: cell(say('Edge Functions (Deno)', 'Edge Functions (Deno)'), 'yes'),
          pocketbase: cell(
            say('JavaScript hooks, or extend it in Go', 'Hooks em JavaScript, ou estenda em Go'),
            'yes',
          ),
          appwrite: cell(
            say(
              'Functions in Node, Python, Go, Rust and 10 more runtimes',
              'Functions em Node, Python, Go, Rust e mais 10 runtimes',
            ),
            'yes',
          ),
        },
      },
    ],
  },
  {
    title: say('Sign-in', 'Login'),
    rows: [
      {
        label: say('Email and password', 'E-mail e senha'),
        cells: {
          nelcota: cell(say('Argon2id hashes', 'Hash Argon2id'), 'yes'),
          supabase: cell(say('Included', 'Incluído'), 'yes'),
          pocketbase: cell(say('Included', 'Incluído'), 'yes'),
          appwrite: cell(say('Argon2 hashes', 'Hash Argon2'), 'yes'),
        },
      },
      {
        label: say('Passwordless email', 'Login sem senha por e-mail'),
        cells: {
          nelcota: cell(say('Magic link', 'Magic link'), 'yes'),
          supabase: cell(
            say('Magic link and one-time code', 'Magic link e código de uso único'),
            'yes',
          ),
          pocketbase: cell(say('One-time code', 'Código de uso único'), 'yes'),
          appwrite: cell(
            say('Magic URL and one-time code', 'Magic URL e código de uso único'),
            'yes',
          ),
        },
      },
      {
        label: say('Social sign-in (OAuth)', 'Login social (OAuth)'),
        cells: {
          nelcota: cell(say('Google and GitHub', 'Google e GitHub'), 'partial'),
          supabase: cell(
            say('19 providers, plus custom OIDC', '19 provedores, mais OIDC próprio'),
            'yes',
          ),
          pocketbase: cell(
            say('30+ providers, plus generic OIDC', 'Mais de 30 provedores, mais OIDC genérico'),
            'yes',
          ),
          appwrite: cell(
            say('40+ providers, including OIDC', 'Mais de 40 provedores, incluindo OIDC'),
            'yes',
          ),
        },
      },
      {
        label: say('Multi-factor authentication', 'Autenticação multifator'),
        onHome: true,
        cells: {
          nelcota: cell(say('Not yet', 'Ainda não'), 'no'),
          supabase: cell(say('Authenticator app or phone', 'App autenticador ou telefone'), 'yes'),
          pocketbase: cell(
            say('Any two sign-in methods', 'Dois métodos de login quaisquer'),
            'yes',
          ),
          appwrite: cell(say('Included', 'Incluído'), 'yes'),
        },
      },
    ],
  },
  {
    title: say('Files and events', 'Arquivos e eventos'),
    rows: [
      {
        label: say('File storage', 'Arquivos'),
        cells: {
          nelcota: cell(
            say(
              'Disk or S3; access by SQL policies, plus signed URLs',
              'Disco ou S3; acesso por policies SQL, mais URLs assinadas',
            ),
            'yes',
          ),
          supabase: cell(
            say(
              'Disk or S3, also speaks the S3 protocol',
              'Disco ou S3, também fala o protocolo S3',
            ),
            'yes',
          ),
          pocketbase: cell(say('Disk or S3', 'Disco ou S3'), 'yes'),
          appwrite: cell(
            say('Disk, S3 and other providers', 'Disco, S3 e outros provedores'),
            'yes',
          ),
        },
      },
      {
        label: say('Image transformations', 'Transformação de imagens'),
        cells: {
          nelcota: cell(say('Not yet', 'Ainda não'), 'no'),
          supabase: cell(
            say('Resize and format (imgproxy)', 'Redimensionar e converter (imgproxy)'),
            'yes',
          ),
          pocketbase: cell(say('Thumbnails only', 'Só miniaturas'), 'partial'),
          appwrite: cell(
            say('Resize, crop, format and more', 'Redimensionar, recortar, converter e mais'),
            'yes',
          ),
        },
      },
      {
        label: say('Outgoing webhooks', 'Webhooks de saída'),
        onHome: true,
        cells: {
          nelcota: cell(
            say(
              'Sent after commit, signed, retried',
              'Enviados após o commit, assinados, com novas tentativas',
            ),
            'yes',
          ),
          supabase: cell(
            say(
              'Database webhooks (triggers with pg_net)',
              'Database webhooks (triggers com pg_net)',
            ),
            'yes',
          ),
          pocketbase: cell(
            say('Not built in; you write them in hooks', 'Não vem pronto; você escreve em hooks'),
            'no',
          ),
          appwrite: cell(
            say(
              'Signed, on auth, data, storage and function events',
              'Assinados, em eventos de login, dados, arquivos e funções',
            ),
            'yes',
          ),
        },
      },
    ],
  },
  {
    title: say('Operations', 'Operação'),
    rows: [
      {
        label: say('Admin panel', 'Painel de administração'),
        cells: {
          nelcota: cell(
            say(
              'Built into the binary, in English and Portuguese',
              'Embutido no binário, em inglês e português',
            ),
            'yes',
          ),
          supabase: cell(
            say('Studio, one project per install', 'Studio, um projeto por instalação'),
            'yes',
          ),
          pocketbase: cell(say('Built into the binary', 'Embutido no binário'), 'yes'),
          appwrite: cell(say('Console', 'Console'), 'yes'),
        },
      },
      {
        label: say('Backups and point-in-time recovery', 'Backups e recuperação point-in-time'),
        onHome: true,
        cells: {
          nelcota: cell(
            say(
              'CLI backups, plus PITR with pgBackRest to S3',
              'Backups pela CLI, mais PITR com pgBackRest no S3',
            ),
            'yes',
          ),
          supabase: cell(
            say(
              'Managed backups and PITR are cloud-only',
              'Backups gerenciados e PITR só na nuvem',
            ),
            'no',
          ),
          pocketbase: cell(
            say(
              'Built-in backups to disk or S3; no PITR',
              'Backups embutidos em disco ou S3; sem PITR',
            ),
            'partial',
          ),
          appwrite: cell(
            say('Built-in backups are cloud-only', 'Backups embutidos só na nuvem'),
            'no',
          ),
        },
      },
      {
        label: say('Managed cloud', 'Nuvem gerenciada'),
        cells: {
          nelcota: cell(say('No: you host it', 'Não: você hospeda'), 'no'),
          supabase: cell(say('Free and paid plans', 'Planos grátis e pagos'), 'yes'),
          pocketbase: cell(say('No: self-hosted only', 'Não: só self-hosted'), 'no'),
          appwrite: cell(say('Free and paid plans', 'Planos grátis e pagos'), 'yes'),
        },
      },
      {
        label: say('Official SDKs', 'SDKs oficiais'),
        cells: {
          nelcota: cell(same('TypeScript, Rust')),
          supabase: cell(
            say(
              'JavaScript, Flutter, Swift, Python and more',
              'JavaScript, Flutter, Swift, Python e outros',
            ),
          ),
          pocketbase: cell(same('JavaScript, Dart')),
          appwrite: cell(
            say(
              'Web, Flutter, React Native, Apple, Android and 10 server languages',
              'Web, Flutter, React Native, Apple, Android e 10 linguagens de servidor',
            ),
          ),
        },
      },
    ],
  },
];

export interface Win {
  readonly title: Localized;
  readonly body: Localized;
}

/**
 * Where Nelcota comes out ahead, each point restating cells of the table above
 * (same sources). Only claims that hold against every rival named in them.
 */
export const WINS: readonly Win[] = [
  {
    title: say('Fits a small server', 'Cabe num servidor pequeno'),
    body: say(
      'Self-hosted Supabase and Appwrite ask for at least 4 GB of RAM. Nelcota’s deploy guide fits 2–3 small projects on a 1 GB VPS.',
      'Supabase e Appwrite self-hosted pedem no mínimo 4 GB de RAM. O guia de deploy do Nelcota coloca 2–3 projetos pequenos numa VPS de 1 GB.',
    ),
  },
  {
    title: say('Two things to run', 'Duas peças para rodar'),
    body: say(
      'One Rust binary and PostgreSQL, plus Caddy for HTTPS. Self-hosted Supabase runs 11 containers; Appwrite, a stack with Redis, ClickHouse and workers.',
      'Um binário Rust e o PostgreSQL, mais o Caddy para HTTPS. O Supabase self-hosted roda 11 containers; o Appwrite, uma stack com Redis, ClickHouse e workers.',
    ),
  },
  {
    title: say(
      'Point-in-time recovery on your server',
      'Recuperação point-in-time no seu servidor',
    ),
    body: say(
      'Built into the CLI. On Supabase and Appwrite, built-in backups only exist in their paid cloud plans.',
      'Já vem na CLI. No Supabase e no Appwrite, backups embutidos só existem nos planos pagos da nuvem deles.',
    ),
  },
  {
    title: say('PostgreSQL decides access', 'O PostgreSQL decide o acesso'),
    body: say(
      'Row-level security, as on Supabase: the same rules cover the API, files and the panel’s “View as”. PocketBase and Appwrite use rule layers of their own.',
      'Row-level security, como no Supabase: as mesmas regras valem para a API, os arquivos e o “Ver como” do painel. PocketBase e Appwrite usam camadas de regras próprias.',
    ),
  },
];

/** The home page's short table: the same groups, only rows marked onHome. */
export const HOME_GROUPS: readonly Group[] = COMPARE_GROUPS.map((group) => ({
  title: group.title,
  rows: group.rows.filter((row) => row.onHome === true),
})).filter((group) => group.rows.length > 0);

export const PRODUCT_INFO: Readonly<Record<Product, ProductInfo>> = {
  nelcota: {
    name: 'Nelcota',
    version: same('0.4.0'),
    fit: say(
      'You want PostgreSQL to be the one place that decides access, one Rust binary on your own VPS, and backups with point-in-time recovery from the CLI. It is 0.x and has no realtime, function runtime or MFA yet.',
      'Você quer que o PostgreSQL seja o único lugar que decide o acesso, um binário Rust no seu VPS e backups com recuperação point-in-time pela CLI. Ainda é 0.x e não tem realtime, runtime de funções nem MFA.',
    ),
    sources: [
      { label: say('README', 'README'), href: 'https://github.com/Nelcota/Nelcota#readme' },
      { label: say('Authentication', 'Autenticação'), href: `${NELCOTA_REPO}/docs/schema-auth.md` },
      { label: say('REST API', 'API REST'), href: `${NELCOTA_REPO}/docs/api.md` },
      { label: say('Backups and PITR', 'Backups e PITR'), href: `${NELCOTA_REPO}/docs/backup.md` },
      {
        label: say('Deploy sizing', 'Dimensionamento do deploy'),
        href: `${NELCOTA_REPO}/docs/deploy.md`,
      },
      {
        label: say('Release-candidate tests (main)', 'Testes da versão candidata (main)'),
        href: `${NELCOTA_MAIN}/docs/goals/execution-report.md`,
      },
    ],
  },
  supabase: {
    name: 'Supabase',
    version: say('self-hosted, Oct 2026', 'self-hosted, out/2026'),
    fit: say(
      'You need realtime, Edge Functions, MFA or a managed cloud today, with the largest PostgreSQL BaaS ecosystem, and can run a bigger stack or pay for hosting.',
      'Você precisa hoje de realtime, Edge Functions, MFA ou nuvem gerenciada, com o maior ecossistema de BaaS em PostgreSQL, e pode rodar uma stack maior ou pagar a hospedagem.',
    ),
    sources: [
      {
        label: say('Docker Compose file', 'Arquivo Docker Compose'),
        href: 'https://github.com/supabase/supabase/blob/master/docker/docker-compose.yml',
      },
      {
        label: say('Self-hosting with Docker', 'Self-hosting com Docker'),
        href: `${SUPABASE_DOCS}/self-hosting/docker`,
      },
      {
        label: say('Self-hosting limits', 'Limites do self-hosting'),
        href: `${SUPABASE_DOCS}/self-hosting`,
      },
      { label: say('Auth', 'Auth'), href: `${SUPABASE_DOCS}/auth` },
      {
        label: say('Row Level Security', 'Row Level Security'),
        href: `${SUPABASE_DOCS}/database/postgres/row-level-security`,
      },
      { label: say('GraphQL', 'GraphQL'), href: `${SUPABASE_DOCS}/graphql` },
      {
        label: say('Image transformations', 'Transformação de imagens'),
        href: `${SUPABASE_DOCS}/storage/serving/image-transformations`,
      },
      {
        label: say('Database webhooks', 'Database webhooks'),
        href: `${SUPABASE_DOCS}/database/webhooks`,
      },
      { label: say('Backups', 'Backups'), href: `${SUPABASE_DOCS}/platform/backups` },
      {
        label: say('Generally available', 'Disponibilidade geral'),
        href: 'https://supabase.com/ga',
      },
      { label: say('Pricing', 'Preços'), href: 'https://supabase.com/pricing' },
    ],
  },
  pocketbase: {
    name: 'PocketBase',
    version: same('0.40.5'),
    fit: say(
      'SQLite on one server is enough and you want the smallest setup there is, with realtime, hooks and backups in a single binary.',
      'SQLite em um servidor basta e você quer a instalação mais simples possível, com realtime, hooks e backups em um único binário.',
    ),
    sources: [
      {
        label: say('Repository and README', 'Repositório e README'),
        href: 'https://github.com/pocketbase/pocketbase',
      },
      { label: say('FAQ', 'FAQ'), href: 'https://pocketbase.io/faq/' },
      {
        label: say('API rules and filters', 'Regras de API e filtros'),
        href: `${POCKETBASE_DOCS}/api-rules-and-filters/`,
      },
      { label: say('Authentication', 'Autenticação'), href: `${POCKETBASE_DOCS}/authentication/` },
      { label: say('Files', 'Arquivos'), href: `${POCKETBASE_DOCS}/files-handling/` },
      { label: say('Realtime', 'Realtime'), href: `${POCKETBASE_DOCS}/api-realtime/` },
      {
        label: say('JavaScript hooks', 'Hooks em JavaScript'),
        href: `${POCKETBASE_DOCS}/js-overview/`,
      },
      {
        label: say('Going to production', 'Produção'),
        href: `${POCKETBASE_DOCS}/going-to-production/`,
      },
    ],
  },
  appwrite: {
    name: 'Appwrite',
    version: same('2.5.0'),
    fit: say(
      'You want functions in many languages, a wide choice of sign-in methods and SDKs for every platform, with a managed cloud if you prefer not to host it.',
      'Você quer funções em várias linguagens, muitas opções de login e SDKs para toda plataforma, com nuvem gerenciada se preferir não hospedar.',
    ),
    sources: [
      {
        label: say('Self-hosting installation', 'Instalação self-hosted'),
        href: `${APPWRITE_DOCS}/advanced/self-hosting/installation`,
      },
      {
        label: say('Docker Compose file (2.5.0)', 'Arquivo Docker Compose (2.5.0)'),
        href: 'https://github.com/appwrite/appwrite/blob/2.5.0/docker-compose.yml',
      },
      {
        label: say('Permissions', 'Permissões'),
        href: `${APPWRITE_DOCS}/advanced/platform/permissions`,
      },
      { label: say('Auth', 'Auth'), href: `${APPWRITE_DOCS}/products/auth` },
      {
        label: say('Image previews', 'Pré-visualização de imagens'),
        href: `${APPWRITE_DOCS}/products/storage/images`,
      },
      { label: say('Webhooks', 'Webhooks'), href: `${APPWRITE_DOCS}/advanced/platform/webhooks` },
      {
        label: say('Function runtimes', 'Runtimes de funções'),
        href: `${APPWRITE_DOCS}/products/functions/runtimes`,
      },
      { label: say('Backups', 'Backups'), href: `${APPWRITE_DOCS}/products/databases/backups` },
      { label: say('SDKs', 'SDKs'), href: `${APPWRITE_DOCS}/sdks` },
      { label: say('Pricing', 'Preços'), href: 'https://appwrite.io/pricing' },
    ],
  },
};
