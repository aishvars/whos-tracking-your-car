// Sources for the Take action page and its three tools. Ids continue after sources.js (1 to 9) so
// footnote numbers are unique across the whole site; the About page lists both files together.
// Rule for this file: official government sources only (the host check lives in the tests).
export const OFFICIAL_HOSTS = ['openrecords.pa.gov', 'palegis.us', 'pittsburghpa.gov'];

const ACCESSED = '2026-11-23';
const OOR = 'Pennsylvania Office of Open Records';
const GA = 'Pennsylvania General Assembly';
const CITY_LAW = 'City of Pittsburgh, Department of Law';
const CITY_CLERK = 'City of Pittsburgh, City Clerk\u2019s Office';
const RTK_BASE = 'https://www.pittsburghpa.gov/City-Government/Legal-Services/Department-of-Law/Right-to-Know';
const CLERK_BASE = 'https://www.pittsburghpa.gov/City-Government/The-City-Council/Clerks-Office';

export const ACTION_SOURCES = [
  { id: 10, title: 'RTKL Citizens\u2019 Guide (updated Nov. 24, 2025)', publisher: OOR, url: 'https://www.openrecords.pa.gov/RTKL/CitizensGuide.cfm' },
  { id: 11, title: 'How to File a Request', publisher: OOR, url: 'https://www.openrecords.pa.gov/RTKL/HowToFile.cfm' },
  { id: 12, title: 'Right-to-Know Law, Act 3 of 2008 (full text)', publisher: GA, url: 'https://www.palegis.us/statutes/unconsolidated/law-information?sessYr=2008&sessInd=0&actNum=0003' },
  { id: 13, title: '65 Pa.C.S. \u00a7 710.1, Public participation (Chapter 7 of Title 65, the Sunshine Act, \u00a7 701)', publisher: GA, url: 'https://www.palegis.us/statutes/consolidated/view-statute?txtType=HTM&ttl=65&div=0&chpt=7&sctn=10&subsctn=1' },
  { id: 14, title: 'Find My Legislator', publisher: GA, url: 'https://www.palegis.us/find-my-legislator' },
  { id: 15, title: 'Right to Know: Making a Request', publisher: CITY_LAW, url: `${RTK_BASE}/Making-a-Request` },
  { id: 16, title: 'Right to Know: City Response', publisher: CITY_LAW, url: `${RTK_BASE}/City-Response` },
  { id: 17, title: 'Right to Know: Fees', publisher: CITY_LAW, url: `${RTK_BASE}/Fees` },
  { id: 18, title: 'Right to Know: Appeals', publisher: CITY_LAW, url: `${RTK_BASE}/Appeals` },
  { id: 19, title: 'Clerk\u2019s Office (council meeting information)', publisher: CITY_CLERK, url: CLERK_BASE },
  { id: 20, title: 'Clerk\u2019s Office: Procedures', publisher: CITY_CLERK, url: `${CLERK_BASE}/Procedures` },
].map((source) => ({ ...source, accessed: ACCESSED, kind: 'official' }));
