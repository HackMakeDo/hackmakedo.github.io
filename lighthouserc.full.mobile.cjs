const urls = require('./lighthouse-urls-full.cjs');

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: urls,
      // Single-run at this page count to keep an already-long audit from tripling in
      // length. A page landing just under 100 here on a timing metric (LCP/TBT) may
      // just be single-run CI noise, not a real regression - rerun that one page's
      // audit (or this whole one) before chasing it. See lighthouserc.mobile.cjs for
      // why the required PR check instead uses 3 runs.
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 1 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 1 }],
        'categories:seo': ['error', { minScore: 1 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './.lighthouseci/full-mobile',
    },
  },
};
