import { ASKS } from './asks.js';
import { buildVendorGroups } from './vendors.js';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** '2026-11-22' becomes 'November 22, 2026'. Anything else is returned unchanged. */
export function formatLongDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return iso || '';
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
}

export function headlineText(meta) {
  return `${meta.camera_count.toLocaleString('en-US')} ALPR cameras mapped in and around Pittsburgh, as of ${formatLongDate(meta.pulled_at)}`;
}

/**
 * Segments for the vendor bar on the Home page: the top vendors, then Other vendors, then Unknown,
 * with exact widths (percent of the bar, summing to 100) and a rounded percentage for display.
 */
export function vendorBar(vendorCounts, total, topN = 6) {
  if (!total) return [];
  const { groups } = buildVendorGroups(vendorCounts, topN);
  return groups.map((g) => {
    const percent = Math.round((g.count * 100) / total);
    return {
      key: g.key,
      label: g.label,
      color: g.color,
      count: g.count,
      width: (g.count * 100) / total,
      percent,
      text: `${g.label}: ${g.count} ${g.count === 1 ? 'camera' : 'cameras'} (${percent}%)`,
    };
  });
}

/** Fills the live data date and camera count on the About page. */
export async function initAbout(loadJSON) {
  let meta;
  try {
    meta = await loadJSON('data/meta.json');
  } catch (err) {
    return;
  }
  document.getElementById('about-date').textContent = formatLongDate(meta.pulled_at);
  document.getElementById('about-count').textContent = meta.camera_count.toLocaleString('en-US');
}

/** Fills the live parts of the Home page from data/meta.json and the shared asks. */
export async function initHome(loadJSON) {
  document.querySelectorAll('[data-ask-text]').forEach((el) => {
    el.textContent = ASKS[Number(el.dataset.askText) - 1];
  });

  let meta;
  try {
    meta = await loadJSON('data/meta.json'); // loadJSON shows the error banner on failure
  } catch (err) {
    return;
  }
  document.getElementById('home-count').textContent = meta.camera_count.toLocaleString('en-US');
  document.getElementById('home-date').textContent = formatLongDate(meta.pulled_at);

  const bar = document.getElementById('vendor-bar');
  const legend = document.getElementById('vendor-legend');
  const segments = vendorBar(meta.vendors, meta.camera_count);
  bar.setAttribute('aria-label', `Cameras by vendor: ${segments.map((s) => s.text).join('; ')}`);
  for (const s of segments) {
    const part = document.createElement('span');
    part.className = 'bar-seg';
    part.style.width = `${s.width}%`;
    part.style.background = s.color;
    part.title = s.text;
    bar.appendChild(part);

    const item = document.createElement('li');
    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.background = s.color;
    item.append(swatch, document.createTextNode(` ${s.label} ${s.percent}%`));
    legend.appendChild(item);
  }
}
