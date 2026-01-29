// --- Utility: Remove .cfm from URL if it ends with it ---
export function removeCfm(url) {
  if (!url || typeof url !== 'string') return '';

  // Only remove .cfm if it appears at the very end (before query/hash)
  return url.replace(/\.cfm(?=[?#]|$)/i, '');
}

// --- Examples ---
console.log(removeCfm('/admissions/military/index.cfm'));
// → '/admissions/military/index'

console.log(removeCfm('https://example.com/page.cfm?foo=bar#section'));
// → 'https://example.com/page?foo=bar#section'

console.log(removeCfm('https://american.libwizard.com/f/digital-research-project-proposal'));
// → 'https://american.libwizard.com/f/digital-research-project-proposal' (unchanged)
