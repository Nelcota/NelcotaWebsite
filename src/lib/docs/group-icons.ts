import type { IconName } from '../icons.ts';
import type { DocGroup } from './manifest.ts';

/** Icon shown next to each docs group (sidebar and index). */
export const GROUP_ICONS: Readonly<Record<DocGroup, IconName>> = {
  start: 'terminal',
  build: 'code',
  operate: 'server',
  reference: 'book',
  design: 'layout',
};
