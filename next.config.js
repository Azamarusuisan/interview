/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['react', 'react-dom']
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  reactStrictMode: false, // 開発時のパフォーマンス向上
  swcMinify: true,
  poweredByHeader: false,
}

module.exports = nextConfig