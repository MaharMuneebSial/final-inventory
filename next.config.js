/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove 'output: export' to enable API routes
  // output: 'export',  // Only use for production build without server
  images: {
    unoptimized: true,
  },
  // Disable strict mode for development
  reactStrictMode: true,
};

module.exports = nextConfig;
