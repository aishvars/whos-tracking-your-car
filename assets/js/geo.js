const EARTH_RADIUS_M = 6371000;
const toRad = (deg) => (deg * Math.PI) / 180;

export function haversineM(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function camerasWithin(center, cameras, meters) {
  return cameras.filter((cam) => haversineM(center, cam) <= meters);
}

export function countWithin(center, cameras, meters) {
  return camerasWithin(center, cameras, meters).length;
}

const METERS_PER_DEG_LAT = (Math.PI * EARTH_RADIUS_M) / 180;

/** Distance along `path` ([[lat, lon], ...]) at each vertex, starting at 0. */
export function cumulativeM(path) {
  const cum = path.length ? [0] : [];
  for (let i = 1; i < path.length; i += 1) {
    cum.push(cum[i - 1] + haversineM(
      { lat: path[i - 1][0], lon: path[i - 1][1] },
      { lat: path[i][0], lon: path[i][1] },
    ));
  }
  return cum;
}

/**
 * Closest point on `path` to (lat, lon): {dist, along} in metres, where `along` is the
 * distance travelled along the path to that point. Flat local projection, accurate to well
 * under a metre at the tens-of-metres scale used here (same method as scripts/geo.py).
 */
export function nearestOnPath(path, cum, lat, lon) {
  const mLat = METERS_PER_DEG_LAT;
  const mLon = METERS_PER_DEG_LAT * Math.cos(toRad(lat));
  let best = { dist: Infinity, along: 0 };
  for (let i = 0; i < path.length - 1; i += 1) {
    const ax = (path[i][1] - lon) * mLon;
    const ay = (path[i][0] - lat) * mLat;
    const bx = (path[i + 1][1] - lon) * mLon;
    const by = (path[i + 1][0] - lat) * mLat;
    const dx = bx - ax;
    const dy = by - ay;
    const seg2 = dx * dx + dy * dy;
    const t = seg2 === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / seg2));
    const dist = Math.hypot(ax + t * dx, ay + t * dy);
    if (dist < best.dist) best = { dist, along: cum[i] + t * (cum[i + 1] - cum[i]) };
  }
  return best;
}
