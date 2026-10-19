/** Shape of vendor/nelcota-docs/source.json, written by scripts/sync-docs.ts. */
import { z } from 'astro/zod';

const SHA_PATTERN = /^[0-9a-f]{40}$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;

export const lockSchema = z.object({
  repository: z.string(),
  ref: z.string(),
  commit: z.string().regex(SHA_PATTERN),
  committedAt: z.iso.datetime({ offset: true }),
  files: z.record(z.string(), z.string().regex(SHA256_PATTERN)),
});

export type DocsLock = z.infer<typeof lockSchema>;

export function isCommitSha(value: string): boolean {
  return SHA_PATTERN.test(value);
}
