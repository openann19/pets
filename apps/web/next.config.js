// Clean Next.js config for bundle optimization
const path = require('path');

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(self), payment=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://via.placeholder.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://api.stripe.com https://res.cloudinary.com http://localhost:* ws://localhost:*",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "media-src 'self' blob: https://res.cloudinary.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ')
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compiler: { removeConsole: process.env.NODE_ENV === 'production' },
  transpilePackages: ['@pawfectmatch/ui'],
  outputFileTracingRoot: path.join(__dirname, '../..'),

  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    deviceSizes: [320, 420, 768, 1024, 1200, 1600, 1920, 2560, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: false,
  },

  // Webpack optimizations for bundle size reduction
  webpack: (config, { dev, isServer, webpack }) => {
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            three: {
              test: /[\\/]node_modules[\\/]three[\\/]/,
              name: 'three',
              chunks: 'all',
              priority: 20,
            },
            framer: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'framer-motion',
              chunks: 'all',
              priority: 20,
            },
            charts: {
              test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2|recharts)[\\/]/,
              name: 'charts',
              chunks: 'all',
              priority: 20,
            },
            maps: {
              test: /[\\/]node_modules[\\/]leaflet[\\/]/,
              name: 'maps',
              chunks: 'all',
              priority: 20,
            },
          },
        },
      };

      config.plugins.push(
        new webpack.optimize.ModuleConcatenationPlugin()
      );
    }

    return config;
  },

  experimental: {
    optimizePackageImports: ['@heroicons/react', 'lucide-react', 'framer-motion'],
    // Enable React Server Components optimizations
    serverComponentsExternalPackages: ['@pawfectmatch/core'],
    // Optimize CSS
    optimizeCss: true,
    // Enable optimized fonts
    optimizeFonts: true,
    // Reduce server startup time
    optimizeServerReact: true,
    // Enable experimental WebAssembly support for performance
    webVitalsAttribution: ['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'],
  },

  compress: true,

  // Enable SWC minification for faster builds
  swcMinify: true,

  // Production optimizations
  productionBrowserSourceMaps: false,

  // HTTP/2 Server Push hints
  generateBuildId: async () => {
    // Use timestamp for cache busting
    return `build_${Date.now()}`;
  },

  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },

  async rewrites() {
    return [{
      source: '/api/:path*',
      destination: `http://localhost:${process.env.BACKEND_PORT || 5000}/api/:path*`,
    }];
  },
};

module.exports = nextConfig;
