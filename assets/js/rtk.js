// The records a resident can ask an agency for. Every line asks for records, never a question:
// the Right-to-Know Law releases records and does not require an agency to answer questions
// (OOR Citizens' Guide). The requests deliberately avoid individual plate data and specific
// investigations, because records relating to a criminal investigation may be withheld
// (65 P.S. 67.708(b)(16)).
export const RTK_ITEMS = [
  "Any policy, directive, procedure or training material governing the agency's use of automated license plate reader (ALPR) systems and the data they collect.",
  'Any contract, agreement or purchase order with a vendor of ALPR cameras or software, including its terms on data retention, ownership and sharing.',
  'Records showing how long ALPR data is retained, including the retention settings or retention policy in effect.',
  'Records identifying each agency or organization, inside or outside Pennsylvania, with which the agency shares ALPR data or allows access to it, including any data-sharing agreements.',
  'Any policy, audit report or summary of searches of ALPR data, including the reason recorded for searches and any requirement to record one.',
  'Any annual, periodic or public report on the agency\'s use of ALPR systems, including the number of ALPR cameras in use.',
  'Records showing whether the agency preserves ALPR data beyond its standard retention period, for example through a vendor feature such as Flock\'s "Evidence Mode", and any policy on when, by whom and for how long data may be preserved.',
  'Records showing any offense-based sharing settings the agency uses (sometimes called offense filtering), meaning which types of offense other agencies may search its ALPR data for.',
  'Records showing whether the agency has published a public transparency portal for its ALPR use, including its web address.',
  'Any policy or setting that requires a case number or case code for ALPR searches, and any policy or report on audit tools or alerts that flag unusual searches, including how flagged searches are reviewed.',
];

const clean = (value, placeholder) => {
  const text = (value || '').trim();
  return text || placeholder;
};

/**
 * Plain-text Right-to-Know request. A request must name where the agency should send its
 * response (name and address) and need not give a reason (65 P.S. 67.703); the email line is
 * optional and left out when blank.
 */
export function buildRtk({ agency, name, address, email, date }) {
  const emailLine = (email || '').trim();
  return [
    'RIGHT-TO-KNOW LAW REQUEST',
    '',
    `To: Open Records Officer, ${clean(agency, '[Agency name]')}`,
    `Date: ${clean(date, '[Date]')}`,
    '',
    'This is a request for records under the Pennsylvania Right-to-Know Law, 65 P.S. § 67.101 et seq.',
    '',
    'I request copies of the following records:',
    '',
    ...RTK_ITEMS.map((item, i) => `${i + 1}. ${item}`),
    '',
    'If part of a record is exempt from disclosure, please release the remainder with only the exempt information redacted.',
    '',
    'If any part of this request is denied, please provide the written response described in Section 903 of the Right-to-Know Law, including a description of the record, the specific reasons for the denial and a citation of the supporting legal authority.',
    '',
    'Please send the response to:',
    clean(name, '[Your name]'),
    clean(address, '[Your physical address]'),
    ...(emailLine ? [emailLine] : []),
  ].join('\n');
}
