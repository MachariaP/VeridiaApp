/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Output standalone for Docker deployment
  output: 'standalone',
}

module.exports = nextConfig
