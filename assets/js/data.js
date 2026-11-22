export function showError(message) {
  if (typeof document === 'undefined') return;
  let banner = document.getElementById('error-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'error-banner';
    banner.className = 'error-banner';
    banner.setAttribute('role', 'alert');
    const header = document.getElementById('site-header');
    header.insertAdjacentElement('afterend', banner);
  }
  banner.textContent = message;
}

export async function loadJSON(path, fetchFn = globalThis.fetch) {
  try {
    const res = await fetchFn(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    const error = new Error(`Could not load ${path}: ${err.message}`);
    showError(`${error.message}. Try reloading the page.`);
    throw error;
  }
}
