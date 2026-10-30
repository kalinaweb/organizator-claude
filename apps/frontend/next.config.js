/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@todo-app/shared'],
  output: 'export',
  images: {
    unoptimized: true,
  },
  experimental: {
    staticPageGenerationTimeout: 300,
  },
}

module.exports = nextConfig
