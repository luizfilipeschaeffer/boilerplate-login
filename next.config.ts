/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/.netlify/functions/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
