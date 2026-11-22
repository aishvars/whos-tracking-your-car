// Sources for the Home and About pages. Ids continue after sourcesAction.js.
// `kind` says what sort of source each is: only government pages are 'official' (a test enforces
// the host list); everything else is labelled so readers can weigh it.
export const OFFICIAL_KIND_HOSTS = ['govinfo.gov', 'openrecords.pa.gov', 'palegis.us', 'pittsburghpa.gov', 'supremecourt.gov'];

const ACCESSED = '2026-11-23';

export const HOME_SOURCES = [
  { id: 21, kind: 'company', title: 'Customer Stories (agency, community and business counts)', publisher: 'Flock Safety', url: 'https://www.flocksafety.com/customers' },
  { id: 22, kind: 'news', title: 'Allegheny County has the most automated license plate cameras in Pennsylvania, data shows (Sept. 15, 2026)', publisher: 'TribLive', url: 'https://triblive.com/local/regional/allegheny-county-has-most-flock-cameras-in-pennsylvania-data-shows/' },
  { id: 23, kind: 'news', title: 'Allegheny County has more license plate readers than any other Pa. county. Here\u2019s what\u2019s at stake (Nov. 13, 2026)', publisher: 'The Conversation', url: 'https://theconversation.com/allegheny-county-has-more-license-plate-readers-than-any-other-pa-county-heres-whats-at-stake-295948' },
  { id: 24, kind: 'news', title: 'Flock Safety tightens safeguards as states, cities question surveillance network (Aug. 14, 2026)', publisher: 'Stateline', url: 'https://stateline.org/2026/08/14/flock-safety-tightens-safeguards-as-states-cities-question-surveillance-network/' },
  { id: 25, kind: 'official', title: 'H.R. 10691, the \u201cBan Flock Act,\u201d 119th Congress (introduced Oct. 1, 2026)', publisher: 'U.S. Government Publishing Office', url: 'https://www.govinfo.gov/content/pkg/BILLS-119hr10691ih/xhtml/BILLS-119hr10691ih.html' },
  { id: 26, kind: 'official', title: 'House Bill 2771, 2025-2026 Regular Session (bill status and history)', publisher: 'Pennsylvania General Assembly', url: 'https://www.palegis.us/legislation/bills/2025/hb2771' },
  { id: 27, kind: 'official', title: 'Carpenter v. United States, 585 U.S. ___ (2018), No. 16-402', publisher: 'Supreme Court of the United States', url: 'https://www.supremecourt.gov/opinions/17pdf/16-402_h315.pdf' },
  { id: 28, kind: 'data', title: 'Copyright and License', publisher: 'OpenStreetMap', url: 'https://www.openstreetmap.org/copyright' },
  { id: 29, kind: 'advocacy', title: 'DeFlock: an open-source project mapping license plate readers', publisher: 'DeFlock', url: 'https://deflock.org/' },
].map((source) => ({ ...source, accessed: ACCESSED }));
