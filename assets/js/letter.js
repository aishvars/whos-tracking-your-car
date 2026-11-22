import { ASKS } from './asks.js';

export const MAILTO_MAX = 1900; // many email programs cut off or refuse longer mailto links

const SUBJECT = 'Please support limits on automated license plate readers';

const clean = (value, placeholder) => {
  const text = (value || '').trim();
  return text || placeholder;
};

/**
 * Plain-text letter to a state legislator. It states the campaign's four asks word for word and
 * no facts, so nothing in it needs a source. Blank fields become bracketed placeholders.
 */
export function buildLetter({ name, address, recipientTitle, recipientName }) {
  const title = clean(recipientTitle, 'Representative');
  const greetingName = clean(recipientName, '[Name]');
  return [
    `Dear ${title} ${greetingName},`,
    '',
    'I am a constituent, and I am writing about automated license plate readers (ALPRs) in Pennsylvania.',
    '',
    'I support regulating ALPRs, not banning them. Please support state legislation that would:',
    '',
    ...ASKS.map((ask, i) => `${i + 1}. ${ask}`),
    '',
    'These limits would keep real-time alerts for stolen and wanted vehicles while limiting how long plate history is stored, how it can be searched and who it can be shared with.',
    '',
    'Thank you for your time. I would welcome a reply on your position.',
    '',
    'Sincerely,',
    clean(name, '[Your name]'),
    clean(address, '[Your address]'),
  ].join('\n');
}

/** A mailto: link carrying the letter, or null when it would be too long to be reliable. */
export function mailtoHref(subject, body) {
  const href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return href.length > MAILTO_MAX ? null : href;
}

export const LETTER_SUBJECT = SUBJECT;
