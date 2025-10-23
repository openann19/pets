import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function verifyLockAtBuild() {
  if (process.env.NODE_ENV !== "production") return;
  const root = path.resolve(__dirname, "..", "..");
  const lock = JSON.parse(fs.readFileSync(path.join(root, "config-lock.json"), "utf8"));
  for (const e of lock.entries) {
    const p = path.join(root, e.path);
    const got = crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
    if (got !== e.sha256) throw new Error(`Config tamper: ${e.path}`);
  }
  console.log("config-lock verified at Next build ✓");
}
verifyLockAtBuild();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@pawfectmatch/ui'],

  // Enhanced security and performance settings
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@pawfectmatch/ui'],
  },

  // Image optimization settings
  images: {
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Webpack configuration for security
  webpack: (config, { isServer }) => {
    // Add security headers for static assets
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

export default nextConfig;
