export const SITE_NAME = 'Nelcota';
export const REPO = 'Nelcota/Nelcota';
export const REPO_URL = `https://github.com/${REPO}`;
export const LICENSE = 'Apache-2.0';

const blob = (path: string) => `${REPO_URL}/blob/main/${path}`;
const tree = (path: string) => `${REPO_URL}/tree/main/${path}`;

/** Documentation in the repository, by key; components link to them through docHref(). */
export const DOCS = {
  index: blob('docs/README.md'),
  quickstart: blob('docs/quickstart.md'),
  troubleshooting: blob('docs/troubleshooting.md'),
  api: blob('docs/api.md'),
  auth: blob('docs/schema-auth.md'),
  roles: blob('docs/jwt-and-roles.md'),
  storage: blob('docs/storage.md'),
  webhooks: blob('docs/webhooks.md'),
  panel: blob('docs/panel.md'),
  deploy: blob('docs/deploy.md'),
  backup: blob('docs/backup.md'),
  security: blob('docs/security/README.md'),
  configuration: blob('docs/configuration.md'),
  cli: blob('docs/cli.md'),
  architecture: blob('docs/architecture.md'),
  leaving: blob('docs/leaving.md'),
  examples: blob('examples/README.md'),
  releaseTests: blob('docs/goals/execution-report.md'),
  sdkTs: tree('sdk/typescript'),
  sdkRust: tree('sdk/rust'),
  changelog: blob('CHANGELOG.md'),
  contributing: blob('CONTRIBUTING.md'),
  securityPolicy: blob('SECURITY.md'),
  license: blob('LICENSE'),
  conduct: blob('CODE_OF_CONDUCT.md'),
  releases: `${REPO_URL}/releases`,
} as const;

export type DocKey = keyof typeof DOCS;

const INSTALL_SCRIPT = 'https://raw.githubusercontent.com/Nelcota/Nelcota/main/scripts/install.sh';

/** VPS install: the script also installs Docker when it is missing (docs/deploy.md). */
export const INSTALL_COMMAND = `curl -fsSL ${INSTALL_SCRIPT} | sh`;

/** Local install for machines that already run Docker (docs/quickstart.md). */
export const LOCAL_INSTALL_COMMAND = `curl -fsSL ${INSTALL_SCRIPT} | NELCOTA_SKIP_DOCKER=1 sh`;

/** Joins a site-relative path with the configured base path (works for /repo/ deployments). */
export function withBase(path: string): string {
  // import.meta.env only exists under Vite; plain Node scripts (pnpm snapshot, docs:sync) use '/'.
  const base = (import.meta.env?.BASE_URL ?? '/').replace(/\/+$/, '');
  return `${base}/${path.replace(/^\/+/, '')}`;
}

export function spdxUrl(license: string): string {
  return `https://spdx.org/licenses/${encodeURIComponent(license)}.html`;
}
