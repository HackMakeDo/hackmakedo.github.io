/**
 * One URL per page template, so Lighthouse CI covers every template in the site plan's
 * "100 in PageSpeed Insights on mobile and desktop, for every template" budget - not just
 * a handful. Shared between the mobile and desktop configs so the two profiles can never
 * drift apart. Case studies are held back until published (src/data/case-studies.ts); add
 * the Council page, ContentLock and one [project] page (e.g. Examine Peek) back here as each
 * template goes live.
 */
module.exports = [
  'http://localhost/',
  'http://localhost/umbraco-freelancer/',
  'http://localhost/umbraco-contractor/',
  'http://localhost/umbraco-upgrades/',
  'http://localhost/about/',
  'http://localhost/work/',
  'http://localhost/blog/using-signalr-ioptionsmonitor-with-umbraco-bellissima-for-reactive-net-options/',
  'http://localhost/blog/',
  'http://localhost/timeline/',
  'http://localhost/kind-words/',
  'http://localhost/contact/',
  'http://localhost/privacy/',
  'http://localhost/404.html',
];
