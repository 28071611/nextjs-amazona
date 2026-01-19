import type { NextConfig } from 'next'
import withNextIntl from 'next-intl/plugin'

const nextConfig: NextConfig = withNextIntl()({
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3001', '127.0.0.1:3001', '127.0.0.1:61963'],
    },
  },
})

export default nextConfig
