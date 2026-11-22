import { loadJSON } from './data.js';
import { escapeHtml } from './html.js';
import {
  KINDS, KIND_LABELS, NEAR_RADIUS_M, flaggedIds, placesNearCameras, describeSelection,
} from './sensitive.js';

const L = window.L;
const GLYPHS = { worship: '\u2726', clinic: '\u271A', school: '\u25B2' };

/**
 * "Cameras near sensitive places" panel section.
 * Highlighting restyles the camera dots themselves (white outline for flagged cameras, the rest
 * dimmed) through the shared style coordinator, so the vendor and area filters keep working
 * without any extra layers to keep in sync, and the route demo can take over cleanly.
 * Only places that actually sit within 100 m of a camera get an icon on the map.
 */
export function initSensitivePlaces({ map, cameras, coordinator, meta }) {
  const toggle = document.getElementById('sensitive-toggle');
  const kindsBox = document.getElementById('sensitive-kinds');
  const summary = document.getElementById('sensitive-summary');
  const chip = document.getElementById('chip-sensitive');
  const kindInputs = new Map(KINDS.map((kind) => [kind, kindsBox.querySelector(`input[data-kind="${kind}"]`)]));
  let placeLayers = null; // kind -> layer group of place icons; built the first time the toggle is used

  for (const kind of KINDS) {
    const count = (meta.near_counts && meta.near_counts[kind]) || 0;
    kindsBox.querySelector(`[data-count="${kind}"]`).textContent = count.toLocaleString('en-US');
  }

  const enabledKinds = () => new Set(KINDS.filter((kind) => kindInputs.get(kind).checked));

  function popupHtml(place) {
    const label = KIND_LABELS[place.kind];
    const name = place.name ? escapeHtml(place.name) : `Unnamed ${label}`;
    const noun = place.cameras === 1 ? 'camera' : 'cameras';
    return `<div class="cam-popup"><strong>${name}</strong><br>Mapped ${label}<br>${place.cameras} ${noun} within ${NEAR_RADIUS_M}&nbsp;m</div>`;
  }

  async function ensurePlaces() {
    if (placeLayers) return;
    const { places } = await loadJSON('data/places.json');
    const layers = new Map(KINDS.map((kind) => [kind, L.layerGroup()]));
    for (const place of placesNearCameras(places, cameras)) {
      const icon = L.divIcon({
        className: 'place-icon',
        html: `<span>${GLYPHS[place.kind]}</span>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      L.marker([place.lat, place.lon], { icon, title: place.name || KIND_LABELS[place.kind], keyboard: false })
        .bindPopup(popupHtml(place))
        .addTo(layers.get(place.kind));
    }
    placeLayers = layers;
  }

  function apply() {
    chip.hidden = !toggle.checked;
    if (!toggle.checked) {
      coordinator.setSensitive(null);
      if (placeLayers) placeLayers.forEach((layer) => layer.remove());
      kindsBox.hidden = true;
      summary.textContent = '';
      return;
    }
    kindsBox.hidden = false;
    const enabled = enabledKinds();
    const kinds = KINDS.filter((kind) => enabled.has(kind));
    const flagged = flaggedIds(cameras, enabled);
    coordinator.setSensitive(kinds.length ? flagged : null);
    for (const kind of KINDS) {
      const layer = placeLayers.get(kind);
      if (enabled.has(kind)) layer.addTo(map);
      else layer.remove();
    }
    summary.textContent = describeSelection({ count: flagged.size, total: cameras.length, kinds });
  }

  toggle.addEventListener('change', async () => {
    if (toggle.checked && !placeLayers) {
      toggle.disabled = true;
      summary.textContent = 'Loading places\u2026';
      try {
        await ensurePlaces();
      } catch (err) {
        toggle.checked = false; // loadJSON has already shown the error banner
        summary.textContent = '';
        return;
      } finally {
        toggle.disabled = false;
      }
    }
    apply();
  });
  kindInputs.forEach((input) => input.addEventListener('change', apply));
}
