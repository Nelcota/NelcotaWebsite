/** Shape of vendor/nelcota-docs/source.json, written by scripts/sync-docs.ts. */
import { z } from 'astro/zod';
import { DOC_GROUPS } from './manifest.ts';

const SHA_PATTERN = /^[0-9a-f]{40}$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const repositoryPath = z
  .string()
  .refine(
    (value) => value.length > 0 && !value.startsWith('/') && !value.split('/').includes('..'),
    'Expected a relative repository path',
  );

const docPageSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  group: z.enum(DOC_GROUPS),
  source: repositoryPath,
  catalog: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  language: z.literal('pt-BR').optional(),
});

export const packageVersionsSchema = z.object({
  server: z.string().regex(VERSION_PATTERN),
  typescript: z.string().regex(VERSION_PATTERN),
  rust: z.string().regex(VERSION_PATTERN),
});

export const lockSchema = z.object({
  repository: z.string(),
  ref: z.string(),
  commit: z.string().regex(SHA_PATTERN),
  committedAt: z.iso.datetime({ offset: true }),
  /** Captured with the snapshot: new pages must not rewrite an old release. */
  pages: z
    .array(docPageSchema)
    .nonempty()
    .refine(
      (pages) => new Set(pages.map((page) => page.id)).size === pages.length,
      'Duplicate documentation page ids',
    ),
  versions: packageVersionsSchema,
  files: z.record(z.string(), z.string().regex(SHA256_PATTERN)),
});

export type DocsLock = z.infer<typeof lockSchema>;

export function isCommitSha(value: string): boolean {
  return SHA_PATTERN.test(value);
}

/** Read only the package sections, not dependency versions or a live release feed. */
export function packageVersions(
  read: (path: string) => string,
): z.infer<typeof packageVersionsSchema> {
  const cargoVersion = (path: string, section: string): string => {
    const text = read(path);
    const start = text.indexOf(`[${section}]`);
    if (start < 0) throw new Error(`${path}: missing [${section}]`);
    const body = text.slice(start + section.length + 2).split(/^\[/m, 1)[0] ?? '';
    const value = /^version\s*=\s*"([^"]+)"\s*$/m.exec(body)?.[1];
    if (value == null) throw new Error(`${path}: missing package version`);

    return value;
  };

  const metadata: unknown = JSON.parse(read('sdk/typescript/package.json'));
  const typescript = z.object({ version: z.string() }).parse(metadata).version;

  return packageVersionsSchema.parse({
    server: cargoVersion('Cargo.toml', 'workspace.package'),
    rust: cargoVersion('sdk/rust/Cargo.toml', 'package'),
    typescript,
  });
}
