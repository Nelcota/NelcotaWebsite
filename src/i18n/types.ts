import type { DocPageId } from '../lib/docs/manifest.ts';
/**
 * Shape shared by every locale. Both dictionaries are checked with
 * `satisfies Dictionary`, so a missing or extra key fails `astro check`.
 * URLs live in src/lib/site.ts; dictionaries only hold text.
 */
export interface QuickStep {
  title: string;
  body: string;
  outcome: string;
}

export interface Point {
  readonly title: string;
  readonly body: string;
}

export interface Question {
  readonly question: string;
  readonly answer: string;
}

export interface FaqGroup {
  readonly title: string;
  readonly items: readonly Question[];
}

export interface ItemGroup {
  readonly title: string;
  readonly items: readonly string[];
}

/** The areas of the "everything included" tabs. */
export type AreaKey = 'auth' | 'storage' | 'webhooks' | 'panel';

export type PanelAreaKey = 'sql' | 'policies' | 'users' | 'storage' | 'api' | 'migrations';

export type DocLinkKey = 'api' | 'auth' | 'roles' | 'storage' | 'webhooks' | 'backup' | 'examples';

/** One measured number: the figure, its unit and what it measured. */
export interface WhyStat {
  readonly value: string;
  readonly unit: string;
  readonly label: string;
}

/** Keys of the comments inside the code examples (src/lib/snippets.ts, src/lib/commands.ts). */
export type CodeCommentKey =
  | 'install'
  | 'newFolder'
  | 'startDev'
  | 'buildSource'
  | 'writeMigration'
  | 'table'
  | 'rls'
  | 'grant'
  | 'policy'
  | 'bucket'
  | 'apply'
  | 'signup'
  | 'wait'
  | 'insert'
  | 'read'
  | 'installServer'
  | 'projectFolder'
  | 'createProject'
  | 'start'
  | 'check'
  | 'twoProjects'
  | 'listProjects'
  | 'backupOne'
  | 'backupAll'
  | 'restore'
  | 'upgradeCheck'
  | 'upgrade'
  | 'pitrOn'
  | 'pitrStatus'
  | 'pitrRestore'
  | 'health'
  | 'status'
  | 'logs'
  | 'sdkInstall'
  | 'sdkTypes'
  | 'sdkClient'
  | 'sdkInsert'
  | 'sdkFolder'
  | 'sdkUpload'
  | 'rustSignIn'
  | 'rustQuery';

/** One card of the hero fan: a part of the binary with the request or SQL that shows it. */
export interface StoryCard {
  readonly title: string;
  readonly code: string;
  readonly body: string;
}

/**
 * Manifesto text: plain words, or a decorative mark (icon or brand logo) shown
 * inline as a pill. Marks have no label: each one sits next to the word it
 * illustrates, so a label would only repeat that word to screen readers.
 */
export type ManifestoPart =
  | { readonly text: string }
  | { readonly mark: 'table' | 'postgresql' | 'zap' | 'rust' | 'lock' | 'server' };

/** A two-part heading or eyebrow: the second part takes the accent (or soft) tone. */
export type TwoTone = readonly [string, string];

export interface LandingPlan {
  readonly label: string;
  readonly price: string;
  readonly unit: string;
  readonly body: string;
  readonly badge?: string;
}

/** The gallery-style home page, section by section, top to bottom. */
export interface Landing {
  readonly hero: {
    readonly title: TwoTone;
    readonly body: string;
    readonly primary: string;
    readonly secondary: string;
  };
  readonly showcase: {
    readonly eyebrow: TwoTone;
    readonly title: readonly [string, string, string];
    readonly body: string;
    readonly primary: string;
    readonly bubbles: TwoTone;
  };
  readonly panel: {
    readonly eyebrow: TwoTone;
    readonly title: TwoTone;
    readonly screens: TwoTone;
    readonly prev: string;
    readonly next: string;
  };
  readonly builtOn: { readonly title: TwoTone; readonly body: string };
  readonly manifesto: readonly ManifestoPart[];
  readonly security: { readonly eyebrow: TwoTone; readonly title: TwoTone };
  readonly speed: {
    readonly eyebrow: TwoTone;
    readonly title: TwoTone;
    readonly tabs: TwoTone;
    readonly conditions: readonly string[];
  };
  readonly community: { readonly title: TwoTone; readonly body: string };
  readonly bento: {
    readonly eyebrow: TwoTone;
    readonly title: TwoTone;
    readonly cards: readonly [Point, Point, Point, Point];
  };
  readonly steps: {
    readonly eyebrow: TwoTone;
    readonly title: TwoTone;
    readonly body: string;
    readonly all: string;
    readonly prev: string;
    readonly next: string;
    readonly items: readonly [Point, Point, Point];
  };
  readonly dock: { readonly title: TwoTone; readonly body: string };
  readonly free: {
    readonly eyebrow: TwoTone;
    readonly title: TwoTone;
    readonly body: string;
    readonly plans: readonly [LandingPlan, LandingPlan, LandingPlan];
  };
  readonly band: readonly string[];
  readonly duo: readonly [LandingDuo, LandingDuo];
}

export interface LandingDuo {
  readonly eyebrow: TwoTone;
  readonly title: TwoTone;
  readonly body: string;
  readonly cta: string;
}

export interface Dictionary {
  landing: Landing;
  /** Lead-in of every "why we built it this way" line. */
  meta: {
    title: string;
    description: string;
    ogAlt: string;
    ogEyebrow: string;
  };
  a11y: {
    skipToContent: string;
    mascotAlt: string;
    toggleTheme: string;
    mainNav: string;
  };
  /** The home page story (hero, panel, manifesto, speed, security, closing). */
  story: {
    /** The six parts of the binary, as the hero's card fan. */
    cards: readonly [StoryCard, StoryCard, StoryCard, StoryCard, StoryCard, StoryCard];
    bubbles: readonly [string, string];
    speedIntro: string;
    securityIntro: string;
  };
  nav: {
    speed: string;
    security: string;
    product: string;
    /** The product menu, in this order: sign-in, files, webhooks, panel, deploy. */
    productItems: readonly [Point, Point, Point, Point, Point];
    searchDocs: string;
    features: string;
    howItWorks: string;
    compare: string;
    deploy: string;
    docs: string;
    github: string;
    getStarted: string;
    menu: string;
    switchLocale: string;
    switchLocaleShort: string;
  };
  showcase: {
    overviewAlt: string;
    tableAlt: string;
  };
  why: {
    reason: string;
    speed: {
      stats: readonly WhyStat[];
      engine: string;
      note: string;
      method: string;
    };
    safety: {
      items: readonly Point[];
      note: string;
      notes: string;
    };
  };
  panel: {
    reason: string;
    title: string;
    intro: string;
    tablistLabel: string;
    pickLabel: string;
    screens: { overview: string; tables: string };
    screenNotes: { overview: string; tables: string };
    areas: Record<PanelAreaKey, ItemGroup>;
    docs: string;
    /** RLS badge labels shown in the panel: protected, RLS without policies, exposed. */
  };
  auth: {
    reason: string;
    title: string;
    intro: string;
    pick: string;
    methodLabels: readonly [string, string, string, string];
    /** Who takes part in the sign-in diagrams (Nelcota sits in the middle, unnamed here). */
    actors: { app: string; inbox: string };
    /** One sentence per arrow of each sign-in method; `{provider}` names Google or GitHub. */
    flows: {
      password: readonly [string, string, string, string];
      magic: readonly [string, string, string, string];
      oauth: readonly [string, string, string];
    };
    included: ItemGroup;
    needs: ItemGroup;
    notes: ItemGroup;
  };
  storage: {
    reason: string;
    title: string;
    intro: string;
    pick: string;
    modes: { public: string; private: string; signed: string };
    /** Who takes part in the file diagrams. */
    actors: { visitor: string; user: string; app: string; holder: string };
    /** One sentence per arrow of each way to share a file. */
    flows: {
      public: readonly [string, string, string];
      private: readonly [string, string, string];
      signed: readonly [string, string, string];
    };
    included: ItemGroup;
    needs: ItemGroup;
    notes: ItemGroup;
  };
  webhooks: {
    reason: string;
    title: string;
    intro: string;
    steps: readonly [Point, Point, Point, Point];
    guarantees: ItemGroup;
    /** Words of the animated delivery log. */
    log: {
      title: string;
      committed: string;
      queued: string;
      retry: string;
      sameEvent: string;
      delivered: string;
    };
    note: string;
  };
  quickstart: {
    reason: string;
    tabs: { label: string; local: string; app: string };
    /** One line under each of the two start tiles. */
    tabBlurbs: { local: string; app: string };
    title: string;
    intro: string;
    /** Hint above the three step tiles. */
    pickStep: string;
    /** "Step {n} of {total}" above the open step. */
    stepOf: string;
    next: string;
    /** Caption of the small terminal showing what each step prints. */
    resultLabel: string;
    requirementsTitle: string;
    /** Caption of the step 2 code: it runs in a second terminal window. */
    secondTerminal: string;
    /** Short note under the requirement chips. */
    requirements: string;
    os: { label: string; linux: string; macos: string; windows: string; sourceNote: string };
    done: string;
    progress: string;
    /** `outcome`: what the step leaves running or created, shown on its tile. */
    steps: readonly [QuickStep, QuickStep, QuickStep];
    full: string;
    /** Comments shown in each step's small terminal, one per step. */
    terminal: readonly [string, string, string];
  };
  sdks: {
    reason: string;
    title: string;
    intro: string;
    tablistLabel: string;
    install: string;
    usage: string;
    notes: readonly [Point, Point];
  };
  code: {
    copy: string;
    copied: string;
    copyFailed: string;
    replay: string;
    installLabel: string;
    /** The syntax color legend: what each color means in the code blocks. */
    /** Comments inside the code examples, one per step, so the code explains itself. */
    comments: Readonly<Record<CodeCommentKey, string>>;
    legend: {
      title: string;
      command: string;
      keyword: string;
      text: string;
      option: string;
      variable: string;
      comment: string;
    };
  };
  docs: {
    links: Record<DocLinkKey, string>;
    all: string;
  };
  /** The /docs area, rendered from the repository's Markdown. */
  docsSite: {
    /** Short sidebar label and one-line summary of every docs page. */
    pages: Record<DocPageId, { label: string; summary: string }>;
    overview: string;
    startHere: string;
    /** "{minutes}" is replaced. */
    readingTime: string;
    /** "{date}" is replaced. */
    allGuides: string;
    backToTop: string;
    title: string;
    description: string;
    /** Groups of the sidebar (src/lib/docs/manifest.ts). */
    groups: { start: string; build: string; operate: string; reference: string; design: string };
    nav: string;
    menu: string;
    onThisPage: string;
    breadcrumb: string;
    previous: string;
    next: string;
    search: {
      label: string;
      placeholder: string;
      loading: string;
      empty: string;
      failed: string;
      /** "{count}" is replaced by the number of results. */
      results: string;
      resultOne: string;
      /** When more match than are listed: "{shown}" and "{count}" are replaced. */
      resultsShown: string;
    };
    sectionLink: string;
    table: string;
    source: string;
    edit: string;
    /** "{commit}" and "{date}" are replaced. */
    syncedFrom: string;
    /** "{version}" is the latest published release. */
    versionNote: string;
    status: {
      english: string;
      partial: string;
      portugueseOnly: string;
    };
  };
  cta: {
    body: string;
    quickstart: string;
    /** Toggle that stops the drifting tiles (WCAG 2.2.2: moving content can be paused). */
    pauseMotion: string;
  };
  footer: {
    title: string;
    newBadge: string;
    tagline: string;
    product: string;
    resources: string;
    community: string;
    documentation: string;
    changelog: string;
    releases: string;
    security: string;
    license: string;
    conduct: string;
    contributing: string;
    licenseNote: string;
    fonts: string;
    dataAsOf: string;
    compare: string;
  };
  compare: {
    metaTitle: string;
    metaDescription: string;
    title: string;
    intro: string;
    checked: string;
    mistake: string;
    report: string;
    tableLabel: string;
    pickLabel: string;
    feature: string;
    legend: { title: string; yes: string; partial: string; no: string };
    fit: { title: string; intro: string };
    sources: { title: string; intro: string };
    cta: { primary: string; secondary: string };
    home: {
      title: string;
      intro: string;
      more: string;
      reason: string;
      /** Button that opens the table; {count} is the number of rows. */
      showTable: string;
    };
    winsTitle: string;
  };
  notFound: {
    /** Small label over the title, before the code: "Error 404". */
    eyebrow: string;
    title: string;
    body: string;
    home: string;
  };
}
