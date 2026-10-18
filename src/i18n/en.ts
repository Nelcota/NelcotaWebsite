import type { Dictionary } from './types.ts';

export const en = {
  meta: {
    title: 'Nelcota · Self-hosted, open-source tools for small teams',
    description:
      'Nelcota builds self-hosted, open-source tools for small teams: a PostgreSQL backend in one Rust binary, screen sharing and deployment on your own servers.',
    ogAlt: 'Nelcota: self-hosted, open-source tools for small teams',
  },
  a11y: {
    skipToContent: 'Skip to content',
    mascotAlt: 'Nelcota mascot: a small mint-green creature with two leaf tufts, smiling',
    toggleTheme: 'Toggle dark mode',
    languageMenu: 'Language',
    mainNav: 'Main',
    externalLink: 'opens on GitHub',
  },
  nav: {
    projects: 'Projects',
    build: 'Build',
    contribute: 'Contribute',
    github: 'GitHub',
    menu: 'Menu',
    switchLocale: 'Ler em português',
    switchLocaleShort: 'PT',
  },
  hero: {
    tagline: 'Self-hosted, open-source tools for small teams.',
    taglineSecond: 'Run them on your own server and keep your data.',
    subtitle:
      'A PostgreSQL backend, screen sharing and deployment, each one running on servers you control.',
    quickstart: 'Quickstart',
    github: 'GitHub',
    badges: ['Open source', 'Apache-2.0 / MIT', 'Your server, your data'],
  },
  projects: {
    title: 'Projects',
    intro:
      'Three tools you can run yourself. Stars and releases come straight from GitHub at build time.',
    featured: 'Main project',
    inProgress: 'In progress',
    stars: 'stars',
    license: 'License',
    latestRelease: 'Latest release',
    noRelease: 'No release yet',
    updated: 'Updated',
    notPublic: 'Repository not public yet',
    viewOnGithub: 'View on GitHub',
    moreTitle: 'Also from Nelcota',
  },
  build: {
    title: 'Build with Nelcota',
    intro:
      'Talk to your Nelcota backend from TypeScript or Rust. Both clients are thin: operations map to HTTP and PostgreSQL decides what a call may do.',
    tablistLabel: 'Client language',
    tabs: { ts: 'TypeScript', rust: 'Rust' },
    install: 'Install',
    usage: 'Use',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    links: [
      {
        label: 'Quickstart',
        href: 'https://github.com/Nelcota/Nelcota/blob/main/docs/quickstart.md',
      },
      { label: 'REST API', href: 'https://github.com/Nelcota/Nelcota/blob/main/docs/api.md' },
      {
        label: '@nelcota/client',
        href: 'https://github.com/Nelcota/Nelcota/tree/main/sdk/typescript',
      },
      { label: 'nelcota-client', href: 'https://github.com/Nelcota/Nelcota/tree/main/sdk/rust' },
    ],
  },
  why: {
    title: 'Why self-hosted',
    intro: 'Run the tools on your own server and keep your data.',
    points: [
      {
        title: 'Your data',
        body: 'Your schema, grants, row-level security policies and functions remain SQL you can export. PostgreSQL enforces who can read what.',
      },
      {
        title: 'Your server',
        body: 'One binary on a VPS, with Caddy for HTTPS. No separate service for the backend or the admin panel.',
      },
      {
        title: 'Open source',
        body: 'Apache-2.0 and MIT licensed, developed in the open on GitHub. Read the code, open an issue, send a pull request.',
      },
    ],
  },
  contribute: {
    title: 'Contribute & security',
    intro:
      'Read the guides, then open an issue or pull request in the project you want to improve.',
    guide: {
      label: 'Contributing guide',
      href: 'https://github.com/Nelcota/.github/blob/main/CONTRIBUTING.md',
      body: 'Search existing issues first, keep changes focused and include the checks that validate them.',
    },
    security: {
      label: 'Security policy',
      href: 'https://github.com/Nelcota/.github/blob/main/SECURITY.md',
      body: 'Report vulnerabilities privately through GitHub Security Advisories in the affected repository.',
    },
  },
  footer: {
    licenses: 'Code licensed under Apache-2.0 and MIT, per project.',
    dataAsOf: 'GitHub stars and releases as of',
    dataFromSnapshot: 'from the committed snapshot',
    builtWith: 'Static site built with Astro. No trackers, no third-party requests.',
    site: 'nelcota.com',
    github: 'GitHub',
    fonts: 'Inter and JetBrains Mono, SIL Open Font License.',
  },
  notFound: {
    title: 'Page not found',
    body: 'The mascot looked everywhere. There is nothing at this address.',
    home: 'Back to the home page',
  },
} satisfies Dictionary;
