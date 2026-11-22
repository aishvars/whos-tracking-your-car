// Sources cited on the site, numbered in order of first use. Footnotes link to #src-<id>.
// Ids are site-wide: sources.js (1 to 9), sourcesAction.js (10 to 20), sourcesHome.js (21 and up).
// Each source has a `kind` so readers can see what sort of source it is (see allSources.js).
const RAW = [
  {
    id: 1,
    title: 'Data Driven: What Is ALPR?',
    publisher: 'Electronic Frontier Foundation',
    url: 'https://www.eff.org/pages/what-alpr',
    accessed: '2026-11-23',
  },
  {
    id: 2,
    title: 'Automated License Plate Readers (ALPRs), Street-Level Surveillance',
    publisher: 'Electronic Frontier Foundation',
    url: 'https://sls.eff.org/technologies/automated-license-plate-readers-alprs',
    accessed: '2026-11-23',
  },
  {
    id: 3,
    title: 'How Flock Protects and Manages Data (Trust Center)',
    publisher: 'Flock Safety',
    url: 'https://www.flocksafety.com/trust/data-privacy',
    accessed: '2026-11-23',
  },
  {
    id: 4,
    title: 'Flock Safety community fact sheet, May 2022 (copy hosted on a municipal website)',
    publisher: 'Flock Safety',
    url: 'https://damc2805.eunify.com/CDATA/Sites/Community17753/WWW/Files/Flock_Safety_FactSheet.pdf',
    accessed: '2026-11-23',
  },
  {
    id: 5,
    title: 'Roseville police defend Flock cameras after report of misreads',
    publisher: 'The Sacramento Bee',
    url: 'https://www.sacbee.com/news/local/article316745023.html',
    accessed: '2026-11-23',
  },
  {
    id: 6,
    title: 'The Human Toll of ALPR Errors',
    publisher: 'Electronic Frontier Foundation',
    url: 'https://www.eff.org/deeplinks/2024/11/human-toll-alpr-errors',
    accessed: '2026-11-23',
  },
  {
    id: 7,
    title: "EFF's Investigations Expose Flock Safety's Surveillance Abuses: 2025 in Review",
    publisher: 'Electronic Frontier Foundation',
    url: 'https://www.eff.org/deeplinks/2025/12/effs-investigations-expose-flock-safetys-surveillance-abuses-2025-review',
    accessed: '2026-11-23',
  },
  {
    id: 8,
    title: 'Police searched national network of automatic license plate reading cameras in abortion investigation',
    publisher: 'The Record from Recorded Future News',
    url: 'https://therecord.media/police-searched-license-reading-cameras-abortion-investigation',
    accessed: '2026-11-23',
  },
  {
    id: 9,
    title: "Flock Safety's Feature Updates Cannot Make Automated License Plate Readers Safe",
    publisher: 'Electronic Frontier Foundation',
    url: 'https://www.eff.org/deeplinks/2025/06/flock-safetys-feature-updates-cannot-make-automated-license-plate-readers-safe',
    accessed: '2026-11-23',
  },
];

const KIND_BY_ID = {
  1: 'advocacy', 2: 'advocacy', 3: 'company', 4: 'company', 5: 'news',
  6: 'advocacy', 7: 'advocacy', 8: 'news', 9: 'advocacy',
};

export const SOURCES = RAW.map((source) => ({ ...source, kind: KIND_BY_ID[source.id] }));
