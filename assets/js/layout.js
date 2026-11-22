export const NAV = [
  { href: 'index.html', label: 'Home' },
  { href: 'map.html', label: 'Map' },
  { href: 'how-it-works.html', label: 'How it works' },
  { href: 'take-action.html', label: 'Take action' },
  { href: 'about.html', label: 'About' },
];

function currentPage(path) {
  const last = path.split('/').filter(Boolean).pop() || 'index.html';
  return last.includes('.') ? last : 'index.html';
}

export function renderLayout(doc, path = globalThis.location?.pathname ?? '/', base = '') {
  const page = currentPage(path);
  const links = NAV.map((n) => {
    const current = n.href === page ? ' aria-current="page"' : '';
    return `<a class="nav-link" href="${base}${n.href}"${current}>${n.label}</a>`;
  }).join('');

  doc.getElementById('site-header').innerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand" href="${base}index.html">Who&rsquo;s Tracking Your Car?</a>
        <nav aria-label="Main">${links}</nav>
      </div>
    </header>`;

  const footer = doc.getElementById('site-footer');
  if (!footer) return;
  footer.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <p>A public-interest campaign for ALPR accountability in Pennsylvania. Camera data &copy; OpenStreetMap contributors (ODbL), crowdsourced with the DeFlock project. See <a href="${base}about.html">About and sources</a>.</p>
      </div>
    </footer>`;
}
