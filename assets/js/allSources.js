import { SOURCES } from './sources.js';
import { ACTION_SOURCES } from './sourcesAction.js';
import { HOME_SOURCES } from './sourcesHome.js';

// One list for the whole site, numbered 1 to N so a footnote number means the same everywhere.
export const ALL_SOURCES = [...SOURCES, ...ACTION_SOURCES, ...HOME_SOURCES];

export const KIND_LABELS = {
  official: 'Official',
  company: 'Company statement',
  news: 'News report',
  advocacy: 'Advocacy group',
  data: 'Open data project',
};
