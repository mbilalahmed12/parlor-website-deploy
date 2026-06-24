/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  experimental: {
    cpus: 1,
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
