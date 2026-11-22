export const OTHER_KEY = '__other';
export const UNKNOWN_KEY = 'Unknown';

// Colors chosen to stay distinguishable on a dark basemap.
const PALETTE = ['#4cc9f0', '#ff6b5e', '#f5b301', '#5fd39a', '#b18cff', '#ff8fc7'];
const OTHER_COLOR = '#9aa7c2';
const UNKNOWN_COLOR = '#5b6784';

/**
 * Groups vendor counts into the legend/filter entries: the `topN` most common
 * named vendors, then "Other vendors", then "Unknown".
 * `vendorCounts` is {vendorName: count}.
 */
export function buildVendorGroups(vendorCounts, topN = 6) {
  const named = Object.entries(vendorCounts)
    .filter(([vendor]) => vendor !== UNKNOWN_KEY)
    .sort((a, b) => b[1] - a[1]);
  const top = named.slice(0, topN);
  const topNames = new Set(top.map(([vendor]) => vendor));

  const groups = top.map(([vendor, count], i) => ({
    key: vendor,
    label: vendor,
    color: PALETTE[i % PALETTE.length],
    count,
  }));

  const otherCount = named.slice(topN).reduce((sum, [, count]) => sum + count, 0);
  if (otherCount > 0) {
    groups.push({ key: OTHER_KEY, label: 'Other vendors', color: OTHER_COLOR, count: otherCount });
  }
  if (vendorCounts[UNKNOWN_KEY] > 0) {
    groups.push({ key: UNKNOWN_KEY, label: 'Unknown', color: UNKNOWN_COLOR, count: vendorCounts[UNKNOWN_KEY] });
  }

  const groupOf = (vendor) => {
    if (!vendor || vendor === UNKNOWN_KEY) return UNKNOWN_KEY;
    return topNames.has(vendor) ? vendor : OTHER_KEY;
  };
  return { groups, groupOf };
}
