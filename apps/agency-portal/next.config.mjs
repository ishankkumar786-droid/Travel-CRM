/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  transpilePackages: [
    '@travel/ui',
    '@travel/config',
    '@travel/utils',
    '@travel/types',
    '@travel/validation',
  ],

  images: {
    remotePatterns: [],
  },

  poweredByHeader: false,

  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version ?? '0.1.0',
  },
};

export default nextConfig;
