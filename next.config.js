/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  // Disable strict mode for development
  reactStrictMode: true,
  // Ensure trailing slashes for static export
  trailingSlash: true,
};

module.exports = nextConfig;
