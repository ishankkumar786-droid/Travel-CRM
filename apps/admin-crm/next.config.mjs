/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development warnings
  reactStrictMode: true,

  // Transpile monorepo packages
  transpilePackages: [
    '@travel/ui',
    '@travel/config',
    '@travel/utils',
    '@travel/types',
    '@travel/validation',
  ],

  // Image domains (add as needed)
  images: {
    remotePatterns: [],
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Environment variables exposed to the browser (must be prefixed NEXT_PUBLIC_)
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version ?? '0.1.0',
  },
};

export default nextConfig;
