import { haversineM } from './geo.js';

export const NEAR_RADIUS_M = 100;
export const KINDS = ['worship', 'clinic', 'school'];
export const KIND_LABELS = { worship: 'place of worship', clinic: 'medical facility', school: 'school' };

const M_PER_DEG_LAT = 111194.9;
const fmt = (n) => n.toLocaleString('en-US');

/** Ids of cameras that are near at least one of the enabled kinds of place. */
export function flaggedIds(cameras, enabledKinds) {
  const ids = new Set();
  for (const cam of cameras) {
    if (cam.near.some((kind) => enabledKinds.has(kind))) ids.add(cam.id);
  }
  return ids;
}

/** Places within `radiusM` of at least one camera, each with the number of such cameras. */
export function placesNearCameras(places, cameras, radiusM = NEAR_RADIUS_M) {
  const maxDLat = radiusM / M_PER_DEG_LAT;
  const result = [];
  for (const place of places) {
    let count = 0;
    for (const cam of cameras) {
      if (Math.abs(cam.lat - place.lat) > maxDLat) continue;
      if (haversineM(place, cam) <= radiusM) count += 1;
    }
    if (count > 0) result.push({ ...place, cameras: count });
  }
  return result;
}

function joinKinds(kinds) {
  const labels = kinds.map((k) => KIND_LABELS[k]);
  if (labels.length <= 1) return labels.join('');
  return `${labels.slice(0, -1).join(', ')} or ${labels[labels.length - 1]}`;
}

export function describeSelection({ count, total, kinds }) {
  if (kinds.length === 0) return 'Select at least one type of place.';
  const percent = Math.round((count * 100) / total);
  const verb = count === 1 ? 'is' : 'are';
  return `${fmt(count)} of ${fmt(total)} cameras (${percent}%) ${verb} within ${NEAR_RADIUS_M} m of a mapped ${joinKinds(kinds)}.`;
}
