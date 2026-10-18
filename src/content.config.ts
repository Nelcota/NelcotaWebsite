import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import snapshot from './data/github-snapshot.json';
import { githubLoader } from './lib/github-loader.ts';

const localized = z.object({ en: z.string(), 'pt-br': z.string() });

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    /** Repository name inside the Nelcota organization; used to merge GitHub data. */
    repo: z.string(),
    url: z.url(),
    /** Primary projects form the main grid; secondary ones sit in the row below. */
    tier: z.enum(['primary', 'secondary']),
    /** The featured project gets the large card. */
    featured: z.boolean().default(false),
    order: z.number().int(),
    status: z.enum(['stable', 'in-progress']).default('stable'),
    license: z.string(),
    /** Editorial fallbacks shown when GitHub has no data for the repo. */
    language: z.string(),
    stack: z.array(z.string()),
    description: localized,
    links: z.array(z.object({ label: localized, href: z.url() })).default([]),
  }),
});

const github = defineCollection({
  loader: githubLoader({
    org: 'Nelcota',
    snapshot,
    token: process.env.GITHUB_TOKEN,
  }),
});

export const collections = { projects, github };
