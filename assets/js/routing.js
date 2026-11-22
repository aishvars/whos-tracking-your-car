import { cumulativeM, nearestOnPath } from './geo.js';

export const ROUTE_MAX_M = 30; // a camera within this distance of the route counts as a sighting
export const MIN_TRIP_M = 100; // shorter trips are rejected as "too close together"

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';
const M_PER_DEG_LAT = 111194.9;
const OUTAGE = 'Route lookup unavailable. Check your internet connection and try again.';
const NO_ROUTE = 'No driving route found between those places.';

const round5 = (x) => Math.round(x * 1e5) / 1e5;

/** `waypoints` are {lat, lon}; OSRM wants lon,lat pairs separated by semicolons. */
export function osrmUrl(waypoints) {
  const coords = waypoints.map((w) => `${w.lon},${w.lat}`).join(';');
  return `${OSRM_URL}/${coords}?overview=full&geometries=geojson`;
}

/** Driving route between two {lat, lon} points as [[lat, lon], ...] rounded to about 1 m. */
export async function fetchRoute(from, to, fetchFn = globalThis.fetch) {
  let body;
  try {
    const res = await fetchFn(osrmUrl([from, to]));
    body = await res.json();
    if (!res.ok && body.code !== 'NoRoute') throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    throw new Error(OUTAGE);
  }
  if (body.code !== 'Ok' || !body.routes || body.routes.length === 0) throw new Error(NO_ROUTE);
  return body.routes[0].geometry.coordinates.map(([lon, lat]) => [round5(lat), round5(lon)]);
}

/** Cameras within `maxM` of the route, numbered in the order the route reaches them. */
export function camerasOnRoute(path, cameras, maxM = ROUTE_MAX_M) {
  if (path.length < 2 || cameras.length === 0) return [];
  const cum = cumulativeM(path);
  const lats = path.map((p) => p[0]);
  const lons = path.map((p) => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const midLat = (minLat + maxLat) / 2;
  const padLat = maxM / M_PER_DEG_LAT;
  const padLon = (maxM / (M_PER_DEG_LAT * Math.cos((midLat * Math.PI) / 180))) * 1.05;
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const hits = [];
  for (const cam of cameras) {
    if (cam.lat < minLat - padLat || cam.lat > maxLat + padLat) continue;
    if (cam.lon < minLon - padLon || cam.lon > maxLon + padLon) continue;
    const { dist, along } = nearestOnPath(path, cum, cam.lat, cam.lon);
    if (dist <= maxM) hits.push({ along, id: cam.id });
  }
  hits.sort((a, b) => a.along - b.along || a.id - b.id);
  return hits.map((hit, i) => ({ camera_id: hit.id, order: i + 1 }));
}

export function tooShort(path) {
  if (path.length < 2) return true;
  const cum = cumulativeM(path);
  return cum[cum.length - 1] < MIN_TRIP_M;
}

/** A trip in the shape the playback code expects. `from` and `to` are the user's own words. */
export function buildTrip({ from, to, path, cameras }) {
  return {
    title: `${from} to ${to}`,
    story: 'Each sighting records a plate, a time and a place.',
    path,
    sightings: camerasOnRoute(path, cameras),
  };
}
