/**
 * Shape shared by every locale. Both dictionaries are checked with
 * `satisfies Dictionary`, so a missing or extra key fails `astro check`.
 */
export interface LinkLabel {
  label: string;
  href: string;
}

export interface Point {
  title: string;
  body: string;
}

export interface Dictionary {
  meta: {
    title: string;
    description: string;
    ogAlt: string;
  };
  a11y: {
    skipToContent: string;
    mascotAlt: string;
    toggleTheme: string;
    languageMenu: string;
    mainNav: string;
    externalLink: string;
  };
  nav: {
    projects: string;
    build: string;
    contribute: string;
    github: string;
    menu: string;
    switchLocale: string;
    switchLocaleShort: string;
  };
  hero: {
    tagline: string;
    taglineSecond: string;
    subtitle: string;
    quickstart: string;
    github: string;
    badges: readonly [string, string, string];
  };
  projects: {
    title: string;
    intro: string;
    featured: string;
    inProgress: string;
    stars: string;
    license: string;
    latestRelease: string;
    noRelease: string;
    updated: string;
    notPublic: string;
    viewOnGithub: string;
    moreTitle: string;
  };
  build: {
    title: string;
    intro: string;
    tablistLabel: string;
    tabs: { ts: string; rust: string };
    install: string;
    usage: string;
    copy: string;
    copied: string;
    copyFailed: string;
    links: readonly [LinkLabel, LinkLabel, LinkLabel, LinkLabel];
  };
  why: {
    title: string;
    intro: string;
    points: readonly [Point, Point, Point];
  };
  contribute: {
    title: string;
    intro: string;
    guide: LinkLabel & { body: string };
    security: LinkLabel & { body: string };
  };
  footer: {
    licenses: string;
    dataAsOf: string;
    dataFromSnapshot: string;
    builtWith: string;
    site: string;
    github: string;
    fonts: string;
  };
  notFound: {
    title: string;
    body: string;
    home: string;
  };
}
