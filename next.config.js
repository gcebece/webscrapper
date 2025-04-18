/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/webscrapper' : '',
  images: {
    unoptimized: true,
  },
  // Static export doesn't support API routes
  // We'll create a fallback for static export when deployed
  trailingSlash: true,
  // Disable headers in static export
  // headers() has been removed to avoid issues with static export
}

module.exports = nextConfig 