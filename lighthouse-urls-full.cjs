/**
 * Every built HTML page in dist/, for an on-demand full-site Lighthouse audit
 * (npm run lighthouse:full, or the manually-triggered "Lighthouse CI (full site)"
 * workflow) - as opposed to lighthouse-urls.cjs's one-URL-per-template set, which
 * is what actually runs on every pull request. This list grows with the site (every
 * blog post, case study, topic and pagination page), so it is NOT used for the
 * required PR check: that needs to stay a fixed, fast cost regardless of how many
 * posts exist. Requires dist/ to already be built.
 */
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

function walk(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walk(full));
    } else if (entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

function toUrl(filePath) {
  const rel = path.relative(distDir, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') return 'http://localhost/';
  if (rel.endsWith('/index.html')) return `http://localhost/${rel.slice(0, -'index.html'.length)}`;
  return `http://localhost/${rel}`;
}

// /styleguide/ is a design-system reference tool for Warren, not a real site page -
// it's not in CLAUDE.md's template table, it's deliberately noindex'd, and its "blocked
// from indexing" SEO score is correct behaviour, not a bug to chase.
const EXCLUDE = ['http://localhost/styleguide/'];

const urls = fs.existsSync(distDir)
  ? walk(distDir).map(toUrl).filter((u) => !EXCLUDE.includes(u)).sort()
  : [];

if (urls.length === 0) {
  throw new Error('lighthouse-urls-full.cjs found no pages in dist/ - run `npm run build` first.');
}

module.exports = urls;
