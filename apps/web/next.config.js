/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  basePath: '/synaptik',
  assetPrefix: '/synaptik/',
  images: { unoptimized: true }
};
module.exports = nextConfig;
