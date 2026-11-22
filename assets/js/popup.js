import { escapeHtml } from './html.js';

const COMPASS_8 = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const NEAR_LABELS = { worship: 'place of worship', clinic: 'medical facility', school: 'school' };

export function compassLabel(degrees) {
  return COMPASS_8[Math.round(degrees / 45) % 8];
}

export function popupHtml(camera) {
  const rows = [`<strong>${escapeHtml(camera.vendor || 'Unknown')}</strong> ALPR camera`];
  if (camera.direction !== null && camera.direction !== undefined) {
    rows.push(`Facing ${camera.direction}&deg; (${compassLabel(camera.direction)})`);
  }
  if (camera.operator) {
    rows.push(`Operator: ${escapeHtml(camera.operator)}`);
  }
  const near = (camera.near || []).map((k) => NEAR_LABELS[k]).filter(Boolean);
  if (near.length) {
    rows.push(`Within 100&nbsp;m of a mapped ${near.join(', ')}`);
  }
  return `<div class="cam-popup">${rows.join('<br>')}</div>`;
}
