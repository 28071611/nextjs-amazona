/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'localhost:3001',
        'localhost:3002',
        'localhost:3003',
        'localhost:3004',
        '127.0.0.1:3000',
        // Firebase redirect origin
        'nextjs-a-free.web.app',
        'nextjs-a-free.firebaseapp.com',
        // Vercel production & preview origins
        'nextjs-amazona-main-harishpblr2007-8613s-projects.vercel.app',
        '*.vercel.app',
      ],
      bodySizeLimit: '10mb'
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
      }
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  transpilePackages: ['lucide-react'],
  poweredByHeader: false,
  generateEtags: false,
}

module.exports = withNextIntl(nextConfig)
