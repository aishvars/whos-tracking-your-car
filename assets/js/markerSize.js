export const MIN_RADIUS = 8;
export const MAX_RADIUS = 18;
const GROWTH_PER_ZOOM = 1.5;
const BASE_ZOOM = 11;

// Pixel radius of a camera dot: 8 at the default view, growing as the user zooms in.
export function radiusForZoom(zoom) {
  const radius = MIN_RADIUS + (zoom - BASE_ZOOM) * GROWTH_PER_ZOOM;
  return Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, radius));
}
