import { buildLetter, mailtoHref, LETTER_SUBJECT } from './letter.js';
import { buildRtk } from './rtk.js';

const byId = (id) => document.getElementById(id);
const value = (id) => byId(id).value;

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    area.remove();
    return ok;
  }
}

function wireCopy(getText) {
  const button = byId('copy-btn');
  const status = byId('tool-status');
  button.addEventListener('click', async () => {
    const ok = await copyText(getText());
    status.textContent = ok
      ? 'Copied to your clipboard.'
      : 'Could not copy automatically. Select the text in the box and press Ctrl+C or Cmd+C.';
  });
}

/** Runs entirely in the browser: nothing typed here is sent, saved or stored. */
export function initLetterTool() {
  const preview = byId('preview');
  const mail = byId('mail-link');
  const status = byId('tool-status');
  const current = () => buildLetter({
    name: value('l-name'),
    address: value('l-address'),
    recipientTitle: value('l-title'),
    recipientName: value('l-recipient'),
  });

  function refresh() {
    const text = current();
    preview.value = text;
    const href = mailtoHref(LETTER_SUBJECT, text);
    mail.hidden = href === null;
    if (href) mail.href = href;
    status.textContent = href === null ? 'This letter is too long for an email link. Use Copy instead.' : '';
  }

  byId('tool-form').addEventListener('input', refresh);
  byId('tool-form').addEventListener('submit', (event) => event.preventDefault());
  wireCopy(() => preview.value);
  refresh();
}

export function initRtkTool() {
  const preview = byId('preview');
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const current = () => buildRtk({
    agency: value('r-agency'),
    name: value('r-name'),
    address: value('r-address'),
    email: value('r-email'),
    date: today,
  });

  const refresh = () => {
    preview.value = current();
    byId('tool-status').textContent = ''; // a stale "Copied" message must not outlive an edit
  };

  byId('tool-form').addEventListener('input', refresh);
  byId('tool-form').addEventListener('submit', (event) => event.preventDefault());
  byId('use-pittsburgh').addEventListener('click', () => {
    byId('r-agency').value = 'City of Pittsburgh';
    refresh();
  });
  wireCopy(() => preview.value);
  refresh();
}
