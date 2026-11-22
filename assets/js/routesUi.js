import { geocode } from './search.js';
import { fetchRoute, buildTrip, tooShort, ROUTE_MAX_M } from './routing.js';
import { cumulativeM } from './geo.js';
import {
  TRIP_DURATION_MS, distanceAt, pointAtDistance, sightingAlongs, formatSighting, closingLine,
} from './routePlayback.js';

const L = window.L;
const AMBER = '#f5b301';
const GEOCODE_GAP_MS = 1100; // Nominatim's usage policy allows one request per second
const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

/**
 * "Follow a trip" panel section: type a start and a destination, and the browser looks both
 * up, asks the OSRM public server for the driving route, and finds the mapped cameras within
 * 30 m of it. Play then drives a dot along the route while numbered badges appear on each
 * camera it passes. Badges are tooltips bound to the camera's own marker, so they follow the
 * vendor and area filters automatically. While a trip is shown the coordinator dims every
 * camera except the ones on the route.
 */
export function initRoutes({ map, cameras, markers, coordinator }) {
  const form = document.getElementById('route-form');
  const fromInput = document.getElementById('route-from');
  const toInput = document.getElementById('route-to');
  const findButton = document.getElementById('route-find');
  const playButton = document.getElementById('route-play');
  const resetButton = document.getElementById('route-reset');
  const log = document.getElementById('route-log');
  const summary = document.getElementById('route-summary');
  const chip = document.getElementById('chip-route');

  const cameraById = new Map(cameras.map((cam) => [cam.id, cam]));
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  map.createPane('routePane').style.zIndex = 350; // above the basemap, below the camera dots

  let layer = null;
  let car = null;
  let current = null; // {trip, path, cum, total, alongs}
  let frame = 0;
  let revealed = [];
  let busy = false;

  function stopAnimation() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  function clearReveals() {
    for (const id of revealed) markers.get(id).unbindTooltip();
    revealed = [];
    log.textContent = '';
    summary.textContent = '';
  }

  function clearRoute() {
    stopAnimation();
    clearReveals();
    if (layer) layer.remove();
    layer = null;
    car = null;
    current = null;
    coordinator.setRoute(null);
    chip.hidden = true;
    playButton.disabled = true;
    resetButton.disabled = true;
    playButton.textContent = 'Play';
  }

  function showTrip(trip) {
    clearRoute();
    const cum = cumulativeM(trip.path);
    current = {
      trip,
      path: trip.path,
      cum,
      total: cum[cum.length - 1],
      alongs: sightingAlongs(trip.path, cum, trip.sightings, cameraById),
    };
    layer = L.layerGroup().addTo(map);
    L.polyline(trip.path, { pane: 'routePane', color: '#0b1220', weight: 9, opacity: 0.7, interactive: false }).addTo(layer);
    L.polyline(trip.path, { pane: 'routePane', color: AMBER, weight: 4, opacity: 0.95, interactive: false }).addTo(layer);
    car = L.marker(trip.path[0], {
      icon: L.divIcon({ className: 'route-car', html: '<span></span>', iconSize: [20, 20], iconAnchor: [10, 10] }),
      interactive: false, keyboard: false, zIndexOffset: 1000,
    }).addTo(layer);
    map.fitBounds(L.latLngBounds(trip.path), { padding: [40, 40] });
    chip.hidden = false;
    resetButton.disabled = false;
    const count = trip.sightings.length;
    if (count === 0) {
      summary.textContent = `No mapped cameras within ${ROUTE_MAX_M} m of this route. OpenStreetMap may be missing some.`;
      return;
    }
    coordinator.setRoute(new Set(trip.sightings.map((s) => s.camera_id)));
    summary.textContent = `${trip.title}: ${count} ${count === 1 ? 'camera' : 'cameras'} on this route. Press Play.`;
    playButton.disabled = false;
  }

  function reveal(index) {
    const sighting = current.trip.sightings[index];
    const cam = cameraById.get(sighting.camera_id);
    markers.get(sighting.camera_id).bindTooltip(String(sighting.order), {
      permanent: true, direction: 'center', className: 'sighting-badge', opacity: 1,
    });
    revealed.push(sighting.camera_id);
    const item = document.createElement('li');
    item.textContent = formatSighting({
      order: sighting.order, total: current.trip.sightings.length, vendor: cam.vendor, near: cam.near,
    });
    log.appendChild(item);
    item.scrollIntoView({ block: 'nearest' });
  }

  function finish() {
    summary.textContent = `${current.trip.story}\n${closingLine(current.trip.sightings.length)}`;
    playButton.textContent = 'Replay';
    playButton.disabled = false;
  }

  function play() {
    stopAnimation();
    clearReveals();
    playButton.disabled = true;
    const count = current.trip.sightings.length;
    if (reducedMotion()) {
      car.setLatLng(current.path[current.path.length - 1]);
      for (let i = 0; i < count; i += 1) reveal(i);
      finish();
      return;
    }
    let next = 0;
    let start = null;
    const step = (timestamp) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const travelled = distanceAt(elapsed, TRIP_DURATION_MS, current.total);
      const point = pointAtDistance(current.path, current.cum, travelled);
      car.setLatLng([point.lat, point.lon]);
      while (next < count && current.alongs[next] <= travelled) reveal(next++);
      if (elapsed < TRIP_DURATION_MS) {
        frame = requestAnimationFrame(step);
      } else {
        frame = 0;
        while (next < count) reveal(next++);
        finish();
      }
    };
    frame = requestAnimationFrame(step);
  }

  async function findRoute() {
    const fromText = fromInput.value.trim();
    const toText = toInput.value.trim();
    if (!fromText || !toText) {
      summary.textContent = 'Enter a starting point and a destination.';
      return;
    }
    summary.textContent = 'Finding the two places\u2026';
    const from = await geocode(fromText);
    if (!from) {
      summary.textContent = `Couldn't find \u201c${fromText}\u201d in the Pittsburgh area. Try a street address or a neighborhood name.`;
      return;
    }
    await sleep(GEOCODE_GAP_MS);
    const to = await geocode(toText);
    if (!to) {
      summary.textContent = `Couldn't find \u201c${toText}\u201d in the Pittsburgh area. Try a street address or a neighborhood name.`;
      return;
    }
    summary.textContent = 'Finding the route\u2026';
    const path = await fetchRoute(from, to);
    if (tooShort(path)) {
      summary.textContent = 'Those two places are very close together. Choose places further apart.';
      return;
    }
    showTrip(buildTrip({ from: fromText, to: toText, path, cameras }));
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy) return;
    busy = true;
    findButton.disabled = true;
    try {
      await findRoute();
    } catch (err) {
      summary.textContent = err.message;
    } finally {
      busy = false;
      findButton.disabled = false;
    }
  });
  playButton.addEventListener('click', play);
  resetButton.addEventListener('click', clearRoute);
}
