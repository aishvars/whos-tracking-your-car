import { markerStyle } from './markerStyle.js';

/**
 * Which look a camera dot gets. An active route wins over the sensitive-place highlight;
 * with neither active every dot looks normal. `routeIds` / `flaggedIds` are Sets or null.
 */
export function modeFor(id, { routeIds, flaggedIds }) {
  const active = routeIds || flaggedIds;
  if (!active) return 'normal';
  return active.has(id) ? 'highlight' : 'dim';
}

/**
 * Single owner of camera dot styling, so the sensitive-place highlight and the route demo
 * never overwrite each other. Each setter takes a Set of camera ids, or null to switch off.
 */
export function createStyleCoordinator({ cameras, markers }) {
  const state = { routeIds: null, flaggedIds: null };

  function apply() {
    for (const cam of cameras) {
      const marker = markers.get(cam.id);
      marker.setStyle(markerStyle(modeFor(cam.id, state), marker.options.baseFillOpacity));
    }
  }

  return {
    setSensitive(ids) { state.flaggedIds = ids; apply(); },
    setRoute(ids) { state.routeIds = ids; apply(); },
  };
}
