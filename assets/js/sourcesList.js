import { ALL_SOURCES, KIND_LABELS } from './allSources.js';
import { escapeHtml } from './html.js';

/**
 * Fills <ol id="sources-list" data-source-ids="14,10"> with the sources that page cites (or every
 * source when the attribute is "all"), keeping each source's site-wide number so footnotes match
 * across pages. Each entry says what kind of source it is.
 */
export function renderSourceList() {
  const list = document.getElementById('sources-list');
  if (!list) return;
  const wanted = (list.dataset.sourceIds || '').trim();
  const ids = wanted === 'all' ? null : wanted.split(',').filter(Boolean).map(Number);
  list.innerHTML = ALL_SOURCES.filter((s) => !ids || ids.includes(s.id)).map((s) => `
    <li id="src-${s.id}" value="${s.id}">
      <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.title)}</a>.
      ${escapeHtml(s.publisher)}. <span class="kind kind-${escapeHtml(s.kind)}">${escapeHtml(KIND_LABELS[s.kind])}</span>
      Accessed ${escapeHtml(s.accessed)}.
    </li>`).join('');
}

// Name used by the Take action pages.
export const renderActionSources = renderSourceList;
