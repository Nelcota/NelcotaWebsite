/**
 * Lighthouse CI: mobile audit of both locales against the production build.
 * Budgets fail the CI run (see budgets.json and the assertions below).
 */
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['http://localhost/', 'http://localhost/pt-br/'],
      numberOfRuns: process.env.CI ? 3 : 1,
      settings: {
        // Default Lighthouse config: mobile emulation with simulated slow 4G.
        budgetPath: './budgets.json',
      },
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:performance': ['error', { minScore: 1 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 1 }],
        'categories:seo': ['error', { minScore: 1 }],
        // Simulated slow 4G. Lantern counts every request finished before the paint
        // (the preloaded hero font included), which puts the floor near 1.5 s here.
        'largest-contentful-paint': ['error', { maxNumericValue: 1600 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1200 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0 }],
        'total-blocking-time': ['error', { maxNumericValue: 50 }],
        'performance-budget': 'error',
        // Raw (uncompressed) sizes: the LHCI static server does not gzip.
        'resource-summary:script:size': ['error', { maxNumericValue: 16_000 }],
        'resource-summary:third-party:count': ['error', { maxNumericValue: 0 }],
        'errors-in-console': 'error',
        'csp-xss': 'off',
        // Informational insights/audits that do not affect category scores and depend on the host.
        'network-dependency-tree-insight': 'off',
        'bf-cache': 'off',
        'uses-http2': 'off',
        'uses-long-cache-ttl': 'off',
        'uses-text-compression': 'off',
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './.lighthouseci/reports',
      reportFilenamePattern: '%%PATHNAME%%-%%DATETIME%%.%%EXTENSION%%',
    },
  },
};
