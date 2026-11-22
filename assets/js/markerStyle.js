export const BASE_STROKE = '#0b1220';

/**
 * Leaflet path style for a camera dot.
 * normal: the vendor look; dim: faded out; highlight: thick white outline.
 * `baseFillOpacity` is the dot's own fill opacity (Unknown cameras are fainter).
 */
export function markerStyle(mode, baseFillOpacity) {
  if (mode === 'dim') {
    return { color: BASE_STROKE, weight: 1.5, opacity: 0.3, fillOpacity: 0.15 };
  }
  if (mode === 'highlight') {
    return { color: '#ffffff', weight: 3, opacity: 1, fillOpacity: baseFillOpacity };
  }
  return { color: BASE_STROKE, weight: 1.5, opacity: 1, fillOpacity: baseFillOpacity };
}
