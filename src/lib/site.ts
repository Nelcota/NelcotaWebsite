export const SITE_NAME = 'Nelcota';
export const ORG_URL = 'https://github.com/Nelcota';
export const OFFICIAL_SITE = 'https://nelcota.com';
export const QUICKSTART_URL = 'https://github.com/Nelcota/Nelcota/blob/main/docs/quickstart.md';
export const CONTRIBUTING_URL = 'https://github.com/Nelcota/.github/blob/main/CONTRIBUTING.md';
export const SECURITY_URL = 'https://github.com/Nelcota/.github/blob/main/SECURITY.md';

/** Joins a site-relative path with the configured base path (works for /repo/ deployments). */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return `${base}/${path.replace(/^\/+/, '')}`;
}

export function spdxUrl(license: string): string {
  return `https://spdx.org/licenses/${encodeURIComponent(license)}.html`;
}
