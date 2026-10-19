import { defineCollection } from 'astro:content';
import snapshotJson from './data/github-snapshot.json';
import { githubLoader } from './lib/github-loader.ts';
import { parseSnapshot, readGithubToken } from './lib/github-schema.ts';
import { REPO } from './lib/site.ts';

const github = defineCollection({
  loader: githubLoader({
    repo: REPO,
    snapshot: parseSnapshot(snapshotJson),
    token: readGithubToken(),
  }),
});

export const collections = { github };
