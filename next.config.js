/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@heroui/react'],
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        destination: '/api/apple-app-site-association',
      },
    ];
  },
};

module.exports = nextConfig;
