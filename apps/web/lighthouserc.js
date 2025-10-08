module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/login',
        'http://localhost:3000/register'
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'mobile',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4
        },
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 812,
          deviceScaleFactor: 2
        }
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 1 }],
        'categories:seo': ['error', { minScore: 1 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'interactive': ['error', { maxNumericValue: 3800 }],
        'max-potential-fid': ['error', { maxNumericValue: 200 }],
        'uses-responsive-images': 'error',
        'uses-optimized-images': 'error',
        'uses-text-compression': 'error',
        'uses-rel-preconnect': 'warn',
        'uses-rel-preload': 'warn',
        'efficient-animated-content': 'warn',
        'no-document-write': 'error',
        'no-vulnerable-libraries': 'error',
        'js-libraries': 'warn',
        'image-aspect-ratio': 'warn',
        'image-size-responsive': 'warn',
        'preload-fonts': 'warn',
        'uses-long-cache-ttl': 'warn'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};