export const HALF_MILE_M = 804.67;

// Nominatim viewbox order is left,top,right,bottom (west,north,east,south) of the data area.
const VIEWBOX = '-80.52,40.67,-79.69,40.19';
const SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
const UNAVAILABLE = 'Address lookup unavailable. Check your internet connection and try again.';

export function shortLabel(displayName) {
  if (!displayName) return 'that location';
  return displayName.split(',').slice(0, 3).map((part) => part.trim()).join(', ');
}

/** Vendors of the given cameras with counts and rounded percentages, most common first. */
export function vendorBreakdown(cameras) {
  const counts = new Map();
  for (const cam of cameras) {
    const vendor = cam.vendor || 'Unknown';
    counts.set(vendor, (counts.get(vendor) || 0) + 1);
  }
  return [...counts]
    .map(([vendor, count]) => ({ vendor, count, percent: Math.round((count * 100) / cameras.length) }))
    .sort((a, b) => b.count - a.count || a.vendor.localeCompare(b.vendor));
}

export function formatResult(label, count) {
  if (count === 0) {
    return `No mapped cameras within half a mile of ${label}. OpenStreetMap may be missing some.`;
  }
  const noun = count === 1 ? 'camera' : 'cameras';
  return `${count.toLocaleString('en-US')} ${noun} within half a mile of ${label}`;
}

/** Looks up an address inside the data area. Resolves null when nothing matches. */
export async function geocode(query, fetchFn = globalThis.fetch) {
  const q = (query || '').trim();
  if (!q) return null;
  const params = new URLSearchParams({
    q, format: 'json', limit: '1', countrycodes: 'us', viewbox: VIEWBOX, bounded: '1',
  });
  let results;
  try {
    const res = await fetchFn(`${SEARCH_URL}?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    results = await res.json();
  } catch (err) {
    throw new Error(UNAVAILABLE);
  }
  if (!Array.isArray(results) || results.length === 0) return null;
  const hit = results[0];
  return { lat: Number(hit.lat), lon: Number(hit.lon), label: shortLabel(hit.display_name) };
}
