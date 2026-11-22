import { loadJSON } from './data.js';
import { buildVendorGroups, UNKNOWN_KEY } from './vendors.js';
import { popupHtml } from './popup.js';
import { escapeHtml } from './html.js';
import { radiusForZoom } from './markerSize.js';
import { initAddressSearch } from './addressUi.js';
import { initSensitivePlaces } from './sensitiveUi.js';
import { initRoutes } from './routesUi.js';
import { createStyleCoordinator } from './styleCoordinator.js';
import { BASE_STROKE } from './markerStyle.js';

const L = window.L;
const CENTER = [40.4406, -79.9959];
const ZOOM = 11;
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const fmt = (n) => n.toLocaleString('en-US');

function addBaseLayer(map) {
  const tiles = L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION });
  tiles.on('tileerror', () => {
    document.getElementById('tile-note').hidden = false;
  });
  tiles.addTo(map);
}

function buildMarkers(cameras, groups, groupOf, radius) {
  const renderer = L.canvas({ padding: 0.5 });
  const colorOf = new Map(groups.map((g) => [g.key, g.color]));
  const layers = new Map(groups.map((g) => [g.key, L.layerGroup()]));
  const markers = new Map();
  for (const cam of cameras) {
    const key = groupOf(cam.vendor);
    const baseFillOpacity = key === UNKNOWN_KEY ? 0.55 : 0.9;
    const marker = L.circleMarker([cam.lat, cam.lon], {
      renderer,
      radius,
      color: BASE_STROKE,
      weight: 1.5,
      fillColor: colorOf.get(key),
      fillOpacity: baseFillOpacity,
      baseFillOpacity,
    });
    marker.bindPopup(() => popupHtml(cam));
    marker.addTo(layers.get(key));
    markers.set(cam.id, marker);
  }
  return { layers, markers };
}

function renderLegend(groups, onChange) {
  const list = document.getElementById('legend');
  list.textContent = '';
  for (const group of groups) {
    const row = document.createElement('li');
    row.className = 'legend-row';
    row.innerHTML = `
      <label>
        <input type="checkbox" checked>
        <span class="swatch" style="background:${group.color}"></span>
        <span class="legend-name">${escapeHtml(group.label)}</span>
        <span class="legend-count">${fmt(group.count)}</span>
      </label>`;
    row.querySelector('input').dataset.key = group.key;
    row.querySelector('input').addEventListener('change', onChange);
    list.appendChild(row);
  }
}

export async function initMap() {
  const [{ cameras }, meta] = await Promise.all([
    loadJSON('data/cameras.json'),
    loadJSON('data/meta.json'),
  ]);

  const map = L.map('map', { preferCanvas: true }).setView(CENTER, ZOOM);
  addBaseLayer(map);

  const { groups, groupOf } = buildVendorGroups(meta.vendors);
  const { layers, markers } = buildMarkers(cameras, groups, groupOf, radiusForZoom(map.getZoom()));
  const countByKey = new Map(groups.map((g) => [g.key, g.count]));
  let addressSearch = null;
  let legendVisible = cameras.length;

  // Resize every marker, including any the address search has temporarily taken off the map.
  map.on('zoomend', () => {
    const radius = radiusForZoom(map.getZoom());
    for (const marker of markers.values()) marker.setRadius(radius);
  });

  function updateVisibleCount() {
    const hiddenInRegion = addressSearch ? addressSearch.regionHiddenCount() : 0;
    const shown = legendVisible - hiddenInRegion;
    document.getElementById('visible-count').textContent =
      `Showing ${fmt(shown)} of ${fmt(cameras.length)} cameras`;
    // Shown on the collapsed vendor box so an active filter is never invisible.
    const chip = document.getElementById('chip-vendor');
    chip.hidden = shown === cameras.length;
    chip.textContent = `${fmt(shown)} shown`;
  }

  function setVisibleVendors(visibleKeys) {
    legendVisible = 0;
    for (const [key, layer] of layers) {
      if (visibleKeys.has(key)) {
        layer.addTo(map);
        legendVisible += countByKey.get(key);
      } else {
        layer.remove();
      }
    }
    if (addressSearch) addressSearch.setVisibleGroups(visibleKeys);
    updateVisibleCount();
  }

  const checkboxes = () => [...document.querySelectorAll('#legend input')];
  const syncFromLegend = () =>
    setVisibleVendors(new Set(checkboxes().filter((c) => c.checked).map((c) => c.dataset.key)));
  const setAll = (checked) => {
    checkboxes().forEach((c) => { c.checked = checked; });
    syncFromLegend();
  };

  renderLegend(groups, syncFromLegend);
  document.getElementById('show-all').addEventListener('click', () => setAll(true));
  document.getElementById('hide-all').addEventListener('click', () => setAll(false));
  document.getElementById('headline-count').textContent = fmt(meta.camera_count);
  document.getElementById('pulled-date').textContent = `Data pulled ${meta.pulled_at}`;
  syncFromLegend();
  addressSearch = initAddressSearch({
    map, cameras, groups, groupOf, layers, markers, onFilterChange: updateVisibleCount,
  });
  const coordinator = createStyleCoordinator({ cameras, markers });
  initSensitivePlaces({ map, cameras, coordinator, meta });
  initRoutes({ map, cameras, markers, coordinator });

  // Debug handle for manual checks in the browser console and automated QA.
  window.alprMap = { map, layers, setVisibleVendors };
  return { map, cameras, meta, groups, layers, setVisibleVendors };
}
