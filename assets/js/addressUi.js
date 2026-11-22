import { geocode, formatResult, vendorBreakdown, HALF_MILE_M } from './search.js';
import { camerasWithin } from './geo.js';
import { radiusForZoom } from './markerSize.js';

const L = window.L;
const AMBER = '#f5b301';

/**
 * Address search panel.
 *
 * `groups`/`groupOf` are the vendor groups from vendors.js, so rings and breakdown swatches
 * match the legend. `layers` (group key -> layer group) and `markers` (camera id -> marker)
 * let the "Vendors in this area" checkboxes hide one vendor's cameras inside the searched
 * region only; the legend filter still hides whole groups everywhere. A camera shows when
 * both allow it.
 *
 * Returns `setVisibleGroups(Set<groupKey>)` (call when the legend changes) and
 * `regionHiddenCount()` (cameras hidden by the region filter inside visible groups).
 */
export function initAddressSearch({ map, cameras, groups, groupOf, layers, markers, onFilterChange }) {
  const form = document.getElementById('address-form');
  const input = document.getElementById('address-input');
  const submit = document.getElementById('address-submit');
  const clearButton = document.getElementById('address-clear');
  const chip = document.getElementById('chip-address');
  const status = document.getElementById('address-status');
  const breakdownBox = document.getElementById('address-breakdown-box');
  const breakdownList = document.getElementById('address-breakdown');
  const colorOf = new Map(groups.map((g) => [g.key, g.color]));
  const overlay = L.layerGroup().addTo(map);
  let rings = [];
  let ringGroups = new Map(); // vendor name -> layer group of its highlight rings
  let regionCams = new Map(); // vendor name -> cameras inside the searched region
  let regionHidden = new Set(); // vendor names unticked in the breakdown
  let visibleKeys = null; // legend selection; null means every group is visible
  let busy = false;

  const notify = () => { if (onFilterChange) onFilterChange(); };
  const vendorName = (cam) => cam.vendor || 'Unknown';
  const groupVisible = (vendor) => !visibleKeys || visibleKeys.has(groupOf(vendor));
  const ringRadius = () => radiusForZoom(map.getZoom()) + 4;
  map.on('zoomend', () => rings.forEach((ring) => ring.setRadius(ringRadius())));

  function setVendorMarkers(vendor, visible) {
    const layer = layers.get(groupOf(vendor));
    for (const cam of regionCams.get(vendor) || []) {
      const marker = markers.get(cam.id);
      if (visible) layer.addLayer(marker);
      else layer.removeLayer(marker);
    }
  }

  function restoreRegion() {
    for (const vendor of regionHidden) setVendorMarkers(vendor, true);
    regionHidden = new Set();
  }

  function applyVisibility() {
    for (const [vendor, group] of ringGroups) {
      if (groupVisible(vendor) && !regionHidden.has(vendor)) overlay.addLayer(group);
      else overlay.removeLayer(group);
    }
    for (const row of breakdownList.children) {
      const vendor = row.dataset.vendor;
      const box = row.querySelector('input');
      const allowed = groupVisible(vendor);
      box.checked = allowed && !regionHidden.has(vendor);
      box.disabled = !allowed;
      row.classList.toggle('is-filtered-out', !box.checked);
      row.title = allowed ? '' : 'Hidden by the vendor filter above';
    }
  }

  function renderBreakdown(nearby) {
    breakdownList.textContent = '';
    for (const { vendor, count, percent } of vendorBreakdown(nearby)) {
      const row = document.createElement('li');
      row.dataset.vendor = vendor;
      const label = document.createElement('label');
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = true;
      const swatch = document.createElement('span');
      swatch.className = 'swatch';
      swatch.style.background = colorOf.get(groupOf(vendor));
      const name = document.createElement('span');
      name.className = 'breakdown-name';
      name.textContent = vendor;
      const value = document.createElement('span');
      value.className = 'breakdown-count';
      value.textContent = `${count} (${percent}%)`;
      label.append(box, swatch, name, value);
      row.appendChild(label);
      box.addEventListener('change', () => {
        if (box.checked) regionHidden.delete(vendor);
        else regionHidden.add(vendor);
        setVendorMarkers(vendor, box.checked);
        applyVisibility();
        notify();
      });
      breakdownList.appendChild(row);
    }
    breakdownBox.hidden = nearby.length === 0;
  }

  function clear() {
    restoreRegion();
    overlay.clearLayers();
    rings = [];
    ringGroups = new Map();
    regionCams = new Map();
    breakdownList.textContent = '';
    breakdownBox.hidden = true;
    status.textContent = '';
    clearButton.hidden = true;
    chip.hidden = true;
    notify();
  }

  function show(place) {
    restoreRegion();
    overlay.clearLayers();
    ringGroups = new Map();
    regionCams = new Map();
    const nearby = camerasWithin(place, cameras, HALF_MILE_M);
    const circle = L.circle([place.lat, place.lon], {
      radius: HALF_MILE_M, color: AMBER, weight: 2, fillColor: AMBER, fillOpacity: 0.08, interactive: false,
    }).addTo(overlay);
    L.marker([place.lat, place.lon], { title: place.label, keyboard: false }).addTo(overlay);
    rings = nearby.map((cam) => {
      const vendor = vendorName(cam);
      if (!ringGroups.has(vendor)) ringGroups.set(vendor, L.layerGroup());
      if (!regionCams.has(vendor)) regionCams.set(vendor, []);
      regionCams.get(vendor).push(cam);
      return L.circleMarker([cam.lat, cam.lon], {
        radius: ringRadius(), color: AMBER, weight: 3, fill: false, interactive: false,
      }).addTo(ringGroups.get(vendor));
    });
    renderBreakdown(nearby);
    applyVisibility();
    map.fitBounds(circle.getBounds(), { padding: [30, 30], maxZoom: 16 });
    status.textContent = formatResult(place.label, nearby.length);
    clearButton.hidden = false;
    chip.hidden = false;
    notify();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy) return;
    const query = input.value.trim();
    if (!query) {
      status.textContent = 'Type an address or neighborhood first.';
      return;
    }
    busy = true;
    submit.disabled = true;
    status.textContent = 'Searching\u2026';
    try {
      const place = await geocode(query);
      if (place) {
        show(place);
      } else {
        status.textContent = 'No match found in the Pittsburgh area. Try a street address or a neighborhood name.';
      }
    } catch (err) {
      status.textContent = err.message;
    } finally {
      busy = false;
      submit.disabled = false;
    }
  });

  clearButton.addEventListener('click', clear);

  return {
    setVisibleGroups(keys) {
      visibleKeys = keys;
      applyVisibility();
    },
    regionHiddenCount() {
      let hidden = 0;
      for (const vendor of regionHidden) {
        if (groupVisible(vendor)) hidden += (regionCams.get(vendor) || []).length;
      }
      return hidden;
    },
  };
}
