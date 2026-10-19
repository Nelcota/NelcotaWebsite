import type { Dictionary } from './types.ts';

/**
 * Copy follows the repository docs at commit 2efede8c (server 0.4.0, SDKs 0.1.2).
 * Anything only on `main` is never described as available.
 */
export const en = {
  meta: {
    title: 'Nelcota · Open-source Rust backend for PostgreSQL',
    description:
      'Nelcota is an open-source backend built in Rust. It turns your PostgreSQL schema into a REST API, adds authentication, file storage and webhooks, and ships an embedded admin panel. Deploy it on your own VPS.',
    ogAlt: 'Nelcota: your Postgres, your backend, your infrastructure',
    ogEyebrow: 'Open-source backend in Rust · PostgreSQL · Apache-2.0',
  },
  a11y: {
    skipToContent: 'Skip to content',
    mascotAlt: 'Nelcota mascot: a small mint-green creature with two leaf tufts, smiling',
    toggleTheme: 'Toggle dark mode',
    mainNav: 'Main',
  },
  landing: {
    hero: {
      title: ['A whole backend.', 'One binary. Your VPS.'],
      body: 'A REST API generated from your schema, sign-in, files, webhooks and an admin panel, running on your own PostgreSQL. No account, no per-request bill, no dozen services to babysit.',
      primary: 'Install now',
      secondary: 'Read the docs',
    },
    showcase: {
      eyebrow: ['REST', 'API'],
      title: ['You create the table.', 'The API is ready.', 'Zero endpoints.'],
      body: 'Filters, relations, RPC and an OpenAPI document come straight from the schema. Who can read each row is a PostgreSQL rule, not an if someone forgot in a controller.',
      primary: 'API reference',
      bubbles: ['@Magalhaesz', '200 OK'],
    },
    panel: {
      eyebrow: ['ADMIN', 'PANEL'],
      title: ['Admin panel included.', 'Nothing else to install.'],
      screens: ['Overview', 'Tables'],
      prev: 'Previous screen',
      next: 'Next screen',
    },
    builtOn: {
      title: ['Nothing reinvented', 'that didn’t need to be.'],
      body: 'Rust, tokio, axum and rustls in front, PostgreSQL behind. Parts already carrying production traffic all over the world.',
    },
    manifesto: [
      { text: 'A weekend project' },
      { mark: 'zap' },
      { text: 'or several apps on one VPS:' },
      { mark: 'server' },
      { text: 'each one gets an API, sign-in, files and webhooks' },
      { mark: 'lock' },
      { text: 'and PostgreSQL decides who sees each row.' },
      { mark: 'postgresql' },
    ],
    security: {
      eyebrow: ['SECURE BY', 'DEFAULT'],
      title: ['Locked down', 'before your first line.'],
    },
    speed: {
      eyebrow: ['MEASURED', 'SPEED'],
      title: ['1,965 req/s', 'on 128\u00a0MiB of RAM.'],
      tabs: ['Numbers', 'Conditions'],
      conditions: [
        'App capped at 1 CPU and 128 MiB',
        'PostgreSQL capped at 1 CPU and 384 MiB',
        'A 30-minute soak at 600 requests per second',
        'Release candidate on main, after 0.4.0',
      ],
    },
    community: {
      title: ['Your code, your data,', 'your server.'],
      body: 'Apache-2.0. No account, no plan, no surprise invoice. And if you ever leave, your data is already in standard PostgreSQL.',
    },
    bento: {
      eyebrow: ['EVERYTHING', 'INCLUDED'],
      title: ['Everything an app needs.', 'Already inside.'],
      cards: [
        {
          title: 'Sign-in',
          body: 'Email and password, magic links, Google and GitHub, with rotating refresh tokens.',
        },
        {
          title: 'Files',
          body: 'Disk or S3, public or private. Who downloads what is a SQL policy, and temporary links expire on their own.',
        },
        {
          title: 'Webhooks',
          body: 'Your server gets the changes you choose, signed, with 6 attempts if it is down.',
        },
        {
          title: 'Admin panel',
          body: 'Tables, users, files, policies and SQL at /admin/, with no extra service to run.',
        },
      ],
    },
    steps: {
      eyebrow: ['GET', 'STARTED'],
      title: ['Zero to API', 'in three steps.'],
      body: 'You need Linux with Docker. On macOS and Windows, build from source.',
      all: 'Full quickstart',
      prev: 'Previous step',
      next: 'Next step',
      items: [
        {
          title: 'Install and start',
          body: 'One command installs the CLI. nelcota dev starts PostgreSQL in Docker and the API on port 8000.',
        },
        {
          title: 'Write the schema',
          body: 'One migration with the table and its access rules. Apply it and generate types.',
        },
        {
          title: 'Use the API',
          body: 'Create a user and read the notes with their token. RLS returns only theirs.',
        },
      ],
    },
    dock: {
      title: ['Works the way', 'you already work.'],
      body: 'SDKs for TypeScript and Rust, plain HTTP for any other language. Runs with Docker or systemd.',
    },
    free: {
      eyebrow: ['OPEN', 'SOURCE'],
      title: ['$0 license.', 'Forever.'],
      body: 'Apache-2.0. You pay for the server you picked, not for every request your app makes.',
      plans: [
        {
          label: 'License',
          price: '$0',
          unit: 'forever',
          body: 'Apache-2.0: use it, change it, ship it.',
        },
        {
          label: 'Hosting',
          price: 'Your server',
          unit: '',
          body: 'The deploy guide fits 2–3 small projects on a 1 GB VPS.',
          badge: 'You choose',
        },
        {
          label: 'Usage',
          price: '$0',
          unit: 'per request',
          body: 'No meter. Your server is the limit, not a plan.',
        },
      ],
    },
    band: ['One binary', '128 MiB', 'Apache-2.0', 'No lock-in'],
    duo: [
      {
        eyebrow: ['READ', 'THE DOCS'],
        title: ['From the first command', 'to production.'],
        body: 'Quickstart, API, auth, storage, deploy, backups and the CLI. In English, with Portuguese translations.',
        cta: 'Open the docs',
      },
      {
        eyebrow: ['OPEN', 'SOURCE'],
        title: ['Like it?', 'Open an issue or send a PR.'],
        body: 'Every release, every decision and every bug lives on GitHub, in plain sight.',
        cta: 'View on GitHub',
      },
    ],
  },
  story: {
    cards: [
      { title: 'REST API', code: 'GET /rest/v1/notes', body: 'Generated from your schema' },
      { title: 'Sign-in', code: 'POST /auth/v1/token', body: 'Password, magic link, OAuth' },
      { title: 'Files', code: '/storage/v1/object', body: 'Disk or S3, with policies' },
      { title: 'Webhooks', code: 'x-nelcota-signature', body: 'Signed, retried, recorded' },
      { title: 'Admin panel', code: '/admin/', body: 'Data, users and SQL' },
      { title: 'PostgreSQL', code: 'owner = auth.uid()', body: 'Decides who sees what' },
    ],
    bubbles: ['@HanielCota · 2 notes', '@GuiSatierf · 1 note'],
    speedIntro:
      'Indexed reads with the app capped at 1 CPU and 128 MiB, on the release candidate on main. That leaves the memory to PostgreSQL, which does the heavy lifting.',
    securityIntro:
      'No hardening checklist to remember later. All of this is on from the first nelcota dev.',
  },
  nav: {
    speed: 'Speed',
    security: 'Security',
    product: 'Product',
    productItems: [
      { title: 'Sign-in', body: 'Email, magic link, Google and GitHub' },
      { title: 'File storage', body: 'Disk or S3, with SQL policies' },
      { title: 'Webhooks', body: 'Your server hears about the changes you pick' },
      { title: 'Admin panel', body: 'Data, users and SQL at /admin/' },
      { title: 'Deploy and backups', body: 'Your VPS, HTTPS and point-in-time recovery' },
    ],
    searchDocs: 'Search docs',
    features: 'Features',
    howItWorks: 'How it works',
    compare: 'Comparison',
    deploy: 'Deploy',
    docs: 'Docs',
    github: 'GitHub',
    getStarted: 'Get started',
    menu: 'Menu',
    switchLocale: 'Ler em português',
    switchLocaleShort: 'PT',
  },
  hero: {
    title: ['Your Postgres.', 'Your backend.', 'Your infrastructure.'],
    subtitle:
      'A complete backend in one Rust binary: a REST API generated from your schema, sign-in, file storage, webhooks and an admin panel. On your server, on standard PostgreSQL.',
    complement: 'No lock-in, no per‑request pricing. Open source under Apache-2.0.',
    getStarted: 'Get started',
    viewOnGithub: 'View on GitHub',
    facts: ['Open source', 'Apache-2.0', 'Built in Rust', 'PostgreSQL'],
    latestRelease: 'Latest release',
    installNote: 'Linux with Docker running.',
    mascotHint: 'Copy me!',
    otherSystems: 'macOS and Windows',
  },
  showcase: {
    overviewAlt:
      'Nelcota admin panel overview with API traffic charts, table and user counts, and setup steps',
    tableAlt: 'Nelcota table editor showing the rows of a notes table protected by RLS',
  },
  why: {
    reason:
      'A backend that peaked at 45 MiB under load leaves the server’s memory to PostgreSQL, where it does the real work. And every protection below is on before you change a single setting.',
    speed: {
      stats: [
        {
          value: '1,965',
          unit: 'req/s',
          label: 'indexed reads, app on 1 CPU and 128 MiB',
        },
        {
          value: '45',
          unit: 'MiB',
          label: 'peak app memory under load',
        },
        { value: '0', unit: 'errors', label: 'in 1,079,703 requests' },
        { value: '4.4', unit: 'ms', label: 'median latency at 600 req/s' },
      ],
      engine: 'Rust · tokio · axum · rustls',
      note: 'Measured on the next release (main), not yet in the published 0.4.0, with PostgreSQL on 1 CPU / 384 MiB and a 30-minute soak. Your hardware and workload will give other numbers.',
      method: 'How it was measured',
    },
    safety: {
      items: [
        {
          title: 'Argon2id + rate limit',
          body: 'Hashed passwords, throttled logins, and the same answer for an unknown email and a wrong password.',
        },
        {
          title: '15-minute tokens',
          body: 'Ed25519 access tokens. Refresh tokens rotate, and a replayed one revokes the session.',
        },
        {
          title: 'RLS on every request',
          body: 'Role and claims live in the transaction. A bad token never becomes anon.',
        },
        {
          title: 'Webhooks stay outside',
          body: 'HTTPS only. Private and cloud metadata addresses are blocked.',
        },
        {
          title: 'Sandboxed files',
          body: 'Files served by Nelcota carry nosniff and a CSP sandbox. On S3, the provider serves them from its own domain.',
        },
        {
          title: 'No unsafe Rust',
          body: 'unsafe is forbidden, cargo-deny checks dependencies, 500+ automated tests.',
        },
      ],
      note: 'Still 0.x: the security notes list what is not done yet.',
      notes: 'Security notes',
    },
  },
  panel: {
    reason:
      'Shipping the panel inside the binary means no second app to deploy, expose or patch, and “View as” shows a table exactly as a visitor or a chosen user reaches it.',
    title: 'An admin panel built into the binary',
    intro:
      'Manage data, users, files, access policies and SQL at /admin/, in English or Portuguese, with light and dark themes.',
    tablistLabel: 'Panel screen',
    pickLabel: 'Pick an area',
    screens: { overview: 'Overview', tables: 'Tables' },
    screenNotes: {
      overview:
        'API traffic, refused and failed requests, tables that need attention and next setup steps. Traffic counts stay in memory for 24 hours and reset when the server restarts.',
      tables:
        'Browse, filter and edit rows, follow relations, export CSV or JSON, edit columns, grants and RLS, and use View as to read a table as a visitor or a chosen user.',
    },
    areas: {
      sql: {
        title: 'SQL editor',
        items: [
          'Autocomplete, run all or the selection',
          'History, templates and saved queries',
          'Run with full access, as a visitor or as a chosen user',
        ],
      },
      policies: {
        title: 'Policies',
        items: [
          'Create, edit and delete policies per table',
          'Start from templates',
          'Find exposed tables and recently blocked calls',
        ],
      },
      users: {
        title: 'Users',
        items: [
          'Search, create and delete accounts',
          'See sign-in methods and sessions',
          'Confirm emails and reset passwords',
        ],
      },
      storage: {
        title: 'Storage',
        items: [
          'Manage buckets and browse folders',
          'Upload with progress, preview supported files',
          'Copy URLs and review access rules',
        ],
      },
      api: {
        title: 'API and docs',
        items: [
          'TypeScript, curl and fetch examples per table',
          'Download database.ts and the OpenAPI reference',
          'Searchable built-in guides',
        ],
      },
      migrations: {
        title: 'Migrations',
        items: [
          'Structural changes made in the panel become a SQL migration',
          'SQL you run in the editor is not recorded: add it to a migration yourself',
        ],
      },
    },
    docs: 'Panel guide',
  },
  auth: {
    reason:
      'Accounts live in PostgreSQL next to your tables, so your policies can use auth.uid() and a backup of the database includes your users. Short-lived access tokens limit what a leaked token can do.',
    title: 'Sign-in, ready for your app',
    intro:
      'Email and password, magic links, Google and GitHub. Pick a method to see what happens, step by step.',
    pick: 'Pick a sign-in method',
    methodLabels: ['Password', 'Magic link', 'Google', 'GitHub'],
    actors: { app: 'Your app', inbox: 'Inbox' },
    flows: {
      password: [
        'The user signs in with email and password.',
        'Nelcota looks the account up in PostgreSQL and checks the password (Argon2id hash).',
        'Your app gets an access token that lasts 15 minutes, plus a refresh token.',
        'When it expires, the app trades the refresh token for a new pair, without asking for the password. The old one stops working.',
      ],
      magic: [
        'The user types only their email.',
        'Nelcota emails a sign-in link that works for 15 minutes.',
        'The user opens the link and lands on your sign-in page.',
        'The page sends the link’s token back and gets the session.',
      ],
      oauth: [
        'The user clicks “Sign in with {provider}” and Nelcota sends them to {provider}.',
        '{provider} confirms who they are, and Nelcota sends them back to your app with a one-time code.',
        'Your app trades the code for a session. With PKCE, a stolen code is useless to anyone else.',
      ],
    },
    included: {
      title: 'Ready out of the box',
      items: [
        'Sign-up, sign-in, sign-out and password recovery',
        'Email confirmation and magic links',
        'Google and GitHub sign-in',
        'Passwords hashed with Argon2id, attempts rate limited',
        'Signed tokens any service can verify (Ed25519, JWKS)',
      ],
    },
    needs: {
      title: 'You configure',
      items: [
        'An SMTP server, for the emails',
        'Google or GitHub OAuth keys, if you offer them',
        'The URLs your app may send users back to',
      ],
    },
    notes: {
      title: 'Good to know',
      items: [
        'Multi-factor authentication is not available yet.',
        'Signing out stops refresh; a token already issued works until it expires (15 minutes).',
      ],
    },
  },
  storage: {
    reason:
      'Files follow the same kind of SQL policy as your rows, so one rule set decides who reads a note and who reads its attachment.',
    title: 'Files with the same rules as your data',
    intro:
      'Store files on disk or S3 and decide who reads each one. Pick a way to share a file to see how it works.',
    pick: 'Pick how the file is shared',
    modes: { public: 'Public', private: 'Private', signed: 'Temporary link' },
    actors: { visitor: 'Visitor', user: 'Ana', app: 'Your app', holder: 'Link holder' },
    flows: {
      public: [
        'Anyone with the address asks for the file, no sign-in needed.',
        'The file comes right back: good for avatars and images.',
        'Uploading or replacing it still needs a policy. Without one, PostgreSQL refuses.',
      ],
      private: [
        'Ana, signed in, asks for the file with her token.',
        'PostgreSQL checks your policy: is this Ana’s folder?',
        'It is, so she gets the file. In someone else’s folder the answer would be 404, as if the file did not exist.',
      ],
      signed: [
        'Your app asks for a temporary link to a private file, valid for the time you choose (up to 7 days).',
        'Nelcota returns the signed link, and the app can pass it on.',
        'Whoever has the link downloads the file until it expires, without signing in.',
      ],
    },
    included: {
      title: 'Ready out of the box',
      items: [
        'Upload, download, list and delete',
        'Public files, private files and temporary links',
        'Size and file-type limits per bucket',
        'Access rules as SQL policies, like your tables',
        'Files served by Nelcota never run as a page (nosniff, CSP sandbox)',
      ],
    },
    needs: {
      title: 'You configure',
      items: [
        'Disk: nelcota init and nelcota dev turn it on for you',
        'S3: any S3-compatible provider and its keys',
      ],
    },
    notes: {
      title: 'Good to know',
      items: [
        'Image transformations (resize, crop) are not available yet.',
        'On S3, the provider serves the file bytes.',
      ],
    },
  },
  webhooks: {
    reason:
      'The event is written in the same transaction as your change: a rollback sends nothing, and a crash loses nothing. That is also why there is no Redis or separate queue to run.',
    title: 'Your server hears about the changes you pick',
    intro:
      'When a row changes, Nelcota calls your server with the data. If the call fails, it tries again, and every attempt shows up in the panel.',
    steps: [
      {
        title: 'You save',
        body: 'An INSERT, UPDATE or DELETE commits. If it rolls back, nothing is sent.',
      },
      {
        title: 'It is stored',
        body: 'The event goes into PostgreSQL in the same transaction and survives restarts.',
      },
      {
        title: 'It is signed',
        body: 'Your server checks that the call really came from Nelcota (HMAC-SHA256).',
      },
      {
        title: 'It arrives',
        body: 'Failed? It tries again, 6 times by default, waiting 5 s up to 1 h. You can resend from the panel.',
      },
    ],
    guarantees: {
      title: 'What your server needs to do',
      items: [
        'Ignore repeats: the same event can arrive twice (use x-nelcota-event-id)',
        'Not rely on order: events can arrive out of order',
        'Check the signature and refuse old calls',
      ],
    },
    log: {
      title: 'One event, from commit to delivery',
      committed: 'committed',
      queued: 'queued in PostgreSQL',
      retry: 'transient failure, retried with backoff',
      sameEvent: 'same event id',
      delivered: 'delivered and recorded',
    },
    note: 'These are server-to-server calls that can carry the whole row, so the destination must be HTTPS, and internal or cloud-metadata addresses are refused. They are not for updating browsers in real time.',
  },
  quickstart: {
    reason:
      'Tables come from migration files, not clicks, so your schema lives in git and the same files build every environment.',
    tabs: { label: 'Where to start', local: 'On your machine', app: 'In your app' },
    tabBlurbs: {
      local: 'Install, apply the schema and run your first query',
      app: 'TypeScript or Rust SDK, with types generated from the schema',
    },
    title: 'Run it locally in three steps',
    intro: 'Starting the server does not create your tables: the migration in step 2 does.',
    pickStep: 'Click a step to see its commands',
    stepOf: 'Step {n} of {total}',
    next: 'Next step',
    resultLabel: 'What you will see',
    requirementsTitle: 'What you need',
    secondTerminal: 'second window',
    requirements:
      'Docker must already be running: the install command sets NELCOTA_SKIP_DOCKER=1. On macOS or Windows, use the other option in step 1.',
    os: {
      label: 'Pick your system',
      linux: 'Linux',
      macos: 'macOS',
      windows: 'Windows',
      sourceNote:
        'Builds the 0.4.0 release from source with Rust 1.99+. nelcota dev still needs Docker, and steps 2 and 3 need a POSIX shell with jq (the macOS Terminal, or WSL on Windows).',
    },
    done: 'Done',
    progress: 'steps done',
    steps: [
      {
        title: 'Install and start',
        outcome: 'PostgreSQL and the API running',
        body: '`nelcota dev` starts PostgreSQL in Docker and the API on 127.0.0.1:8000. The panel is at /admin/, and the generated credentials are in `.nelcota/dev.env`.',
      },
      {
        title: 'Apply your schema',
        outcome: 'The notes table and files bucket',
        body: 'Keep `nelcota dev` running. In a second terminal, write the migration (the notes table from above plus a private `files` bucket), apply it and generate types.',
      },
      {
        title: 'Sign up and query',
        outcome: 'Your first query, with RLS',
        body: 'Create a user, wait for the API to load the new table, insert a note and read it back with that user’s token. RLS returns only their notes.',
      },
    ],
    full: 'Full quickstart',
    terminal: [
      'PostgreSQL in Docker · API on :8000 · panel on /admin/',
      'applies migrations/V1__notes.sql without restarting the server',
      'with Ana’s token, RLS returns only her notes',
    ],
  },
  sdks: {
    reason:
      'Types are generated from your schema, so a renamed column shows up as a type error in your editor instead of a bug in production.',
    title: 'From SQL to typed application code',
    intro:
      'Both SDKs call the same REST API: queries, relations, RPC, auth, sessions and storage. Regenerate the types after each migration.',
    tablistLabel: 'Client language',
    install: 'Install',
    usage: 'Use',
    notes: [
      {
        title: '@nelcota/client',
        body: 'ESM with no runtime dependencies. Runs in browsers, Node 22+, Deno and Bun on standard Web APIs.',
      },
      {
        title: 'nelcota-client',
        body: 'Async Rust client on Tokio. `nelcota types --lang rust` generates the models.',
      },
    ],
  },
  code: {
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    replay: 'Play again',
    installLabel: 'Install command for Linux with Docker',
    comments: {
      install: 'Install the nelcota CLI',
      newFolder: 'Create an empty folder for your app',
      startDev: 'Start PostgreSQL and the API, and leave it running',
      buildSource: 'Build the 0.4.0 release from source (needs Rust)',
      writeMigration: 'Write the migration: the notes table and its access rules',
      table: 'The table: each note belongs to the user who wrote it',
      rls: 'Turn on row-level security for the table',
      grant: 'Signed-in users may read and write the table...',
      policy: '...but only the rows they own',
      bucket: 'A private bucket: each user writes in their own folder',
      apply: 'Apply the migration and generate TypeScript types',
      signup: 'Create a user and keep their access token',
      wait: 'Wait until the API sees the new table',
      insert: 'Insert a note as that user',
      read: 'Read the notes back: RLS returns only theirs',
      installServer: 'Install nelcota (and Docker, if it is missing)',
      projectFolder: 'Create a folder for the projects',
      createProject: 'Create the project for your domain',
      start: 'Start it, with HTTPS from Caddy',
      check: 'Check that everything is working',
      twoProjects: 'Two projects on the same server',
      listProjects: 'See and manage each project',
      backupOne: 'Back up one project',
      backupAll: 'Back up all projects, keeping the last 7',
      restore: 'Restore a backup',
      upgradeCheck: 'See what an upgrade would change',
      upgrade: 'Upgrade: backs up first, rolls back on failure',
      pitrOn: 'Turn on point-in-time recovery',
      pitrStatus: 'Check the WAL archive',
      pitrRestore: 'Go back to the second before the mistake',
      health: 'Check the whole installation',
      status: 'Status of one project',
      logs: 'Follow its logs',
      sdkInstall: 'Install the client',
      sdkTypes: 'Generate types from your schema (again after each migration)',
      sdkClient: 'One client for the whole app, typed by your schema',
      sdkInsert: 'Insert a note as the signed-in user',
      sdkFolder: 'Each user writes in their own folder (notes_files_owner)',
      sdkUpload: 'Upload a file and get a link valid for 10 minutes',
      rustSignIn: 'Sign in as Ana',
      rustQuery: 'Her 20 newest notes, with the total count',
    },
    legend: {
      title: 'Reading the code',
      command: 'commands and functions',
      keyword: 'SQL and language words',
      text: 'text you can change',
      option: 'numbers and options',
      variable: 'variables',
      comment: 'comments',
    },
  },
  docs: {
    links: {
      examples: 'Examples',
      api: 'REST API',
      auth: 'Authentication',
      roles: 'JWT and roles',
      storage: 'Storage',
      webhooks: 'Webhooks',
      backup: 'Backup and PITR',
    },
    all: 'All documentation',
  },
  docsSite: {
    pages: {
      quickstart: {
        label: 'Local quickstart',
        summary: 'Install, write a migration and make an authenticated request.',
      },
      'sdk-start': {
        label: 'JS SDK quickstart',
        summary: 'First steps with @nelcota/client (written in Portuguese).',
      },
      notes: {
        label: 'Notes example',
        summary: 'Private notes and files, end to end, plus a restart check.',
      },
      troubleshooting: {
        label: 'Troubleshooting',
        summary: 'Empty results, 401/403, types and limits.',
      },
      glossary: { label: 'Glossary', summary: 'Terms used across the guides.' },
      api: { label: 'REST API', summary: 'Queries, relations, writes, RPC, OpenAPI and errors.' },
      auth: {
        label: 'Authentication',
        summary: 'Users, sessions, email links and OAuth in the auth schema.',
      },
      roles: {
        label: 'JWT and roles',
        summary: 'Token format and the PostgreSQL roles behind each request.',
      },
      storage: {
        label: 'Storage',
        summary: 'Disk or S3, bucket policies, signed URLs and limits.',
      },
      webhooks: {
        label: 'Webhooks',
        summary: 'Durable events, signatures, retries and delivery history.',
      },
      sdk: {
        label: 'TypeScript SDK',
        summary: 'The @nelcota/client package: REST, auth and storage.',
      },
      'sdk-rust': {
        label: 'Rust SDK',
        summary: 'The nelcota-client crate for Tokio applications.',
      },
      'rust-start': {
        label: 'Rust SDK quickstart',
        summary: 'First steps with nelcota-client (written in Portuguese).',
      },
      examples: { label: 'Examples', summary: 'Schemas and runnable consumers.' },
      'auth-integration': {
        label: 'Auth in Rust apps',
        summary: 'Use Nelcota authentication inside another Rust application.',
      },
      deploy: {
        label: 'Deploy',
        summary: 'A VPS with Docker or systemd, HTTPS and isolated projects.',
      },
      backup: {
        label: 'Backup and restore',
        summary: 'Paired snapshots, offsite copies and point-in-time recovery.',
      },
      panel: {
        label: 'Admin panel',
        summary: 'What the panel shows and what it is allowed to do.',
      },
      'panel-updates': {
        label: 'Panel updates',
        summary: 'Controlled updates and the acceptance they need on the VPS.',
      },
      'host-management': {
        label: 'Project management',
        summary: 'Create, back up, restore and remove projects on a host.',
      },
      security: {
        label: 'Security model',
        summary: 'Trust boundaries and what stays with the deployer.',
      },
      release: { label: 'Release handoff', summary: 'Upgrading after the Notes acceptance.' },
      leaving: {
        label: 'Leaving Nelcota',
        summary: 'Export schema, users and files to another backend.',
      },
      configuration: {
        label: 'Configuration',
        summary: 'Every server variable, plus CLI, install and backup settings.',
      },
      cli: { label: 'CLI', summary: 'Commands, options, defaults and destructive operations.' },
      'sdk-contract': {
        label: 'TypeScript SDK contract',
        summary: 'The HTTP contract @nelcota/client targets.',
      },
      'rust-contract': {
        label: 'Rust SDK contract',
        summary: 'The HTTP contract nelcota-client targets.',
      },
      architecture: { label: 'Architecture', summary: 'Crates, request lifecycle and budgets.' },
      decisions: {
        label: 'Decision log',
        summary: 'Why things are the way they are, decision by decision.',
      },
    },
    overview: 'Overview',
    startHere: 'Start here',
    readingTime: '{minutes} min read',
    allGuides: 'All guides',
    backToTop: 'Back to top',
    title: 'Documentation',
    description:
      'Guides and reference for Nelcota: local quickstart, REST API, auth, storage, webhooks, SDKs, deploy, backup and the CLI.',
    groups: {
      start: 'Start',
      build: 'Build an application',
      operate: 'Operate',
      reference: 'Reference',
      design: 'Design',
    },
    nav: 'Documentation',
    menu: 'Pages',
    onThisPage: 'On this page',
    breadcrumb: 'Breadcrumb',
    previous: 'Previous',
    next: 'Next',
    search: {
      label: 'Search the docs',
      placeholder: 'Search',
      loading: 'Loading the index…',
      empty: 'Nothing found. Try a command, a table name or a single word.',
      failed: 'The search index did not load. Reload the page to try again.',
      results: '{count} results',
      resultOne: '1 result',
      resultsShown: '{shown} of {count} results',
    },
    sectionLink: 'Link to this section',
    table: 'Table',
    source: 'Source',
    edit: 'Edit on GitHub',
    syncedFrom: 'From commit {commit} of the repository, {date}.',
    versionNote:
      'These guides follow the main branch. The latest published release is {version}; features the guides mark as unreleased need a newer version.',
    status: {
      english: '',
      partial: '',
      portugueseOnly: 'This guide is written in Portuguese only.',
    },
  },
  cta: {
    body: 'Install the binary, run nelcota dev in an empty folder and follow the quickstart.',
    quickstart: 'Read the quickstart',
    pauseMotion: 'Pause animation',
  },
  footer: {
    title: 'Your Postgres, your backend.',
    newBadge: 'New',
    tagline: 'Open-source backend for PostgreSQL, built in Rust.',
    product: 'Product',
    resources: 'Resources',
    community: 'Community',
    documentation: 'Documentation',
    changelog: 'Changelog',
    releases: 'Releases',
    security: 'Security',
    license: 'Apache-2.0 license',
    conduct: 'Code of conduct',
    contributing: 'Contributing guide',
    licenseNote: 'Nelcota is licensed under Apache-2.0.',
    fonts: 'Manrope and JetBrains Mono, SIL Open Font License.',
    dataAsOf: 'GitHub data as of',
    compare: 'Comparison',
  },
  compare: {
    metaTitle: 'Nelcota compared with Supabase, PocketBase and Appwrite',
    metaDescription:
      'Feature by feature: what Nelcota, self-hosted Supabase, PocketBase and self-hosted Appwrite include, with a link to every source.',
    title: 'How Nelcota compares',
    intro:
      'Self-hosted Supabase, PocketBase and self-hosted Appwrite, feature by feature. Including what Nelcota does not have yet.',
    checked: 'Checked against each project’s official docs on',
    mistake: 'Something wrong or out of date?',
    report: 'Open an issue',
    tableLabel: 'Feature comparison',
    pickLabel: 'Compare Nelcota with',
    feature: 'Feature',
    legend: {
      title: 'Legend',
      yes: 'Included',
      partial: 'Partly, or with limits',
      no: 'Not included',
    },
    fit: {
      title: 'Which one fits',
      intro: 'They are all good projects. They solve different problems.',
    },
    sources: {
      title: 'Sources',
      intro:
        'Every cell comes from these pages. Versions change; the date at the top says when we checked.',
    },
    cta: { primary: 'Try Nelcota locally', secondary: 'Back to' },
    winsTitle: 'Where Nelcota comes out ahead',
    home: {
      reason:
        'A comparison that hides the gaps is not worth reading, so Nelcota’s missing features are in the table too, and every cell links to its source.',
      title: 'How it compares',
      intro:
        'Against self-hosted Supabase, PocketBase and self-hosted Appwrite, from their official docs.',
      more: 'Full comparison and sources',
      showTable: 'See the table ({count} features)',
    },
  },
  notFound: {
    title: 'Page not found',
    body: 'The mascot looked everywhere. There is nothing at this address.',
    home: 'Back to the home page',
  },
} satisfies Dictionary;
