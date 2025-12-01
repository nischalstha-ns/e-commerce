/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@heroui/react'],
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/photos/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  headers: async () => {
    return [
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ]
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade'
          }
        ]
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        destination: '/api/apple-app-site-association'
      }
    ]
  }
};

module.exports = nextConfig;
