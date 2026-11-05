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
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:3001/api/:path*'
            : 'http://localhost:3001/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
