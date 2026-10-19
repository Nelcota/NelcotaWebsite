/**
 * Lighthouse CI: mobile audit of both locales against the production build.
 * Budgets fail the CI run (see budgets.json and the assertions below).
 */
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      // Home in both locales, a short docs page, the heaviest translated one and the comparison table.
      url: [
        'http://localhost/',
        'http://localhost/pt-br/',
        'http://localhost/docs/quickstart/',
        'http://localhost/pt-br/docs/cli/',
        'http://localhost/pt-br/compare/',
      ],
      numberOfRuns: process.env.CI ? 3 : 1,
      settings: {
        // Default Lighthouse config: mobile emulation with simulated slow 4G.
        budgetPath: './budgets.json',
      },
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        // The home page carries interactive demos (query builder, RLS demo, pickers),
        // which scores 0.99 on simulated slow 4G; 0.98 keeps a tight floor.
        'categories:performance': ['error', { minScore: 0.98 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 1 }],
        'categories:seo': ['error', { minScore: 1 }],
        // Simulated slow 4G. The LCP element is the hero subtitle, so the paint waits for
        // the preloaded Inter file after the ~52 KB gzip home document, which grew with
        // the interactive sections: measured 1.88-1.95 s LCP and 1.31-1.38 s FCP on
        // 2026-10-18. Decision (site owner): keep the interactions and cap just above,
        // still well inside Google's "good" LCP (2.5 s). Do not let it creep further.
        'largest-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1400 }],
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
