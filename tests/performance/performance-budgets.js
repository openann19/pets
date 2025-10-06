// Performance Budgets Configuration
// Defines acceptable performance thresholds for PawfectMatch Premium

module.exports = {
  // Bundle Size Budgets
  budgets: [
    {
      path: '/',
      timings: [
        {
          metric: 'first-contentful-paint',
          budget: 1500,
        },
        {
          metric: 'largest-contentful-paint',
          budget: 2500,
        },
        {
          metric: 'cumulative-layout-shift',
          budget: 0.1,
        },
        {
          metric: 'first-input-delay',
          budget: 100,
        },
        {
          metric: 'interaction-to-next-paint',
          budget: 200,
        },
      ],
      resourceSizes: [
        {
          resourceType: 'script',
          budget: 500, // 500KB for JavaScript
        },
        {
          resourceType: 'stylesheet',
          budget: 200, // 200KB for CSS
        },
        {
          resourceType: 'image',
          budget: 1000, // 1MB for images
        },
        {
          resourceType: 'font',
          budget: 100, // 100KB for fonts
        },
        {
          resourceType: 'document',
          budget: 50, // 50KB for HTML
        },
        {
          resourceType: 'total',
          budget: 2000, // 2MB total
        },
      ],
      resourceCounts: [
        {
          resourceType: 'script',
          budget: 20, // Max 20 JavaScript files
        },
        {
          resourceType: 'stylesheet',
          budget: 10, // Max 10 CSS files
        },
        {
          resourceType: 'image',
          budget: 50, // Max 50 images
        },
        {
          resourceType: 'font',
          budget: 5, // Max 5 font files
        },
        {
          resourceType: 'total',
          budget: 100, // Max 100 total resources
        },
      ],
    },
    {
      path: '/login',
      timings: [
        {
          metric: 'first-contentful-paint',
          budget: 1200,
        },
        {
          metric: 'largest-contentful-paint',
          budget: 2000,
        },
        {
          metric: 'cumulative-layout-shift',
          budget: 0.05,
        },
        {
          metric: 'first-input-delay',
          budget: 50,
        },
      ],
      resourceSizes: [
        {
          resourceType: 'script',
          budget: 300, // 300KB for login page JS
        },
        {
          resourceType: 'stylesheet',
          budget: 150, // 150KB for login page CSS
        },
        {
          resourceType: 'total',
          budget: 1000, // 1MB total for login page
        },
      ],
    },
    {
      path: '/premium',
      timings: [
        {
          metric: 'first-contentful-paint',
          budget: 2000,
        },
        {
          metric: 'largest-contentful-paint',
          budget: 3000,
        },
        {
          metric: 'cumulative-layout-shift',
          budget: 0.1,
        },
        {
          metric: 'first-input-delay',
          budget: 150,
        },
      ],
      resourceSizes: [
        {
          resourceType: 'script',
          budget: 800, // 800KB for premium features
        },
        {
          resourceType: 'stylesheet',
          budget: 300, // 300KB for premium styling
        },
        {
          resourceType: 'total',
          budget: 3000, // 3MB total for premium page
        },
      ],
    },
  ],

  // Performance Thresholds
  thresholds: {
    // Core Web Vitals
    firstContentfulPaint: 1500,
    largestContentfulPaint: 2500,
    cumulativeLayoutShift: 0.1,
    firstInputDelay: 100,
    interactionToNextPaint: 200,

    // Performance Metrics
    speedIndex: 2000,
    totalBlockingTime: 200,
    maxPotentialFid: 100,

    // Resource Metrics
    totalByteWeight: 2000000, // 2MB
    domSize: 1500,
    domDepth: 32,

    // Network Metrics
    serverResponseTime: 500,
    timeToFirstByte: 200,
    networkRtt: 100,
    networkServerLatency: 200,

    // Rendering Metrics
    mainThreadWorkBreakdown: 2000,
    bootupTime: 1000,
    unusedJavaScript: 0.1,
    unusedCssRules: 0.1,
  },

  // Mobile Performance Budgets
  mobile: {
    firstContentfulPaint: 1800,
    largestContentfulPaint: 3000,
    cumulativeLayoutShift: 0.1,
    firstInputDelay: 150,
    speedIndex: 2500,
    totalBlockingTime: 300,
    totalByteWeight: 1500000, // 1.5MB for mobile
  },

  // Desktop Performance Budgets
  desktop: {
    firstContentfulPaint: 1200,
    largestContentfulPaint: 2000,
    cumulativeLayoutShift: 0.05,
    firstInputDelay: 50,
    speedIndex: 1500,
    totalBlockingTime: 100,
    totalByteWeight: 3000000, // 3MB for desktop
  },

  // Critical Path Budgets
  criticalPath: {
    // Above-the-fold content
    aboveTheFold: {
      firstContentfulPaint: 1000,
      largestContentfulPaint: 1500,
      speedIndex: 1200,
    },
    // Below-the-fold content
    belowTheFold: {
      timeToInteractive: 3000,
      totalBlockingTime: 200,
    },
  },

  // Feature-specific Budgets
  features: {
    petMatching: {
      firstContentfulPaint: 2000,
      largestContentfulPaint: 3000,
      totalByteWeight: 2500000, // 2.5MB for matching interface
    },
    premiumFeatures: {
      firstContentfulPaint: 2500,
      largestContentfulPaint: 4000,
      totalByteWeight: 4000000, // 4MB for premium features
    },
    authentication: {
      firstContentfulPaint: 1000,
      largestContentfulPaint: 1500,
      totalByteWeight: 1000000, // 1MB for auth pages
    },
  },
};

