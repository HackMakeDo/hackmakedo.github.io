const urls = require('./lighthouse-urls.cjs');

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: urls,
      // A single run's timing-based metrics (LCP, TBT) can land a point or two below 100
      // on an otherwise-fine page just from CI machine noise; 3 runs and LHCI's default
      // median assertion absorb that without masking a real regression.
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
      },
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
      outputDir: './.lighthouseci/desktop',
    },
  },
};
