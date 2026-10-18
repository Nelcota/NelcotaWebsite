import { type CollectionEntry, getCollection } from 'astro:content';
import type { GithubRepoEntry } from './github-loader.ts';

export interface ProjectView {
  id: string;
  data: CollectionEntry<'projects'>['data'];
  /** GitHub data merged by repo name; null when the repo is not public. */
  github: GithubRepoEntry | null;
}

export interface ProjectsData {
  primary: ProjectView[];
  secondary: ProjectView[];
  all: ProjectView[];
  /** When the GitHub data was fetched (API) or snapshotted (fallback). */
  fetchedAt: string | null;
  source: GithubRepoEntry['source'] | null;
}

export async function loadProjects(): Promise<ProjectsData> {
  const [projects, github] = await Promise.all([
    getCollection('projects'),
    getCollection('github'),
  ]);
  const byRepo = new Map(github.map((entry) => [entry.data.name, entry.data]));

  const all: ProjectView[] = projects
    .map((entry) => ({
      id: entry.id,
      data: entry.data,
      github: byRepo.get(entry.data.repo) ?? null,
    }))
    .sort((a, b) => a.data.order - b.data.order);

  const first = github[0]?.data;
  return {
    all,
    primary: all.filter((project) => project.data.tier === 'primary'),
    secondary: all.filter((project) => project.data.tier === 'secondary'),
    fetchedAt: first?.fetchedAt ?? null,
    source: first?.source ?? null,
  };
}
