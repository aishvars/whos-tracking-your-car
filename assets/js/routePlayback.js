import { nearestOnPath } from './geo.js';
import { KIND_LABELS } from './sensitive.js';

export const TRIP_DURATION_MS = 12000;

/** How far along the route the car is after `elapsedMs`, moving at constant speed. */
export function distanceAt(elapsedMs, durationMs, totalM) {
  if (durationMs <= 0) return totalM;
  return Math.max(0, Math.min(1, elapsedMs / durationMs)) * totalM;
}

/** Position on `path` ([[lat, lon], ...]) after travelling `distanceM`; clamps at both ends. */
export function pointAtDistance(path, cum, distanceM) {
  const last = path.length - 1;
  if (distanceM <= 0) return { lat: path[0][0], lon: path[0][1] };
  if (distanceM >= cum[last]) return { lat: path[last][0], lon: path[last][1] };
  let i = 0;
  while (i < last - 1 && cum[i + 1] <= distanceM) i += 1;
  const span = cum[i + 1] - cum[i];
  const t = span === 0 ? 0 : (distanceM - cum[i]) / span;
  return {
    lat: path[i][0] + t * (path[i + 1][0] - path[i][0]),
    lon: path[i][1] + t * (path[i + 1][1] - path[i][1]),
  };
}

/** Distance along the route at which each sighting's camera is passed. */
export function sightingAlongs(path, cum, sightings, cameraById) {
  return sightings.map((s) => {
    const cam = cameraById.get(s.camera_id);
    return nearestOnPath(path, cum, cam.lat, cam.lon).along;
  });
}

function joinWithAnd(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export function formatSighting({ order, total, vendor, near }) {
  const base = `Sighting ${order} of ${total}: ${vendor || 'Unknown'} camera`;
  const places = (near || []).map((kind) => KIND_LABELS[kind]).filter(Boolean);
  return places.length ? `${base}, within 100 m of a mapped ${joinWithAnd(places)}` : base;
}

export function closingLine(count) {
  const noun = count === 1 ? 'sighting' : 'sightings';
  return `${count} ${noun} in one trip. Now imagine this every day for a month.`;
}
