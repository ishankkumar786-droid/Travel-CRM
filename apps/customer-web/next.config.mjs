/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@travel/types'],
  images: { remotePatterns: [] },
  poweredByHeader: false,
};

export default nextConfig;
