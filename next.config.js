/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      canvas: './empty-module.js',
    },
  },
  transpilePackages: ['@heroui/react'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: false,
  productionBrowserSourceMaps: false,
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  allowedDevOrigins: ['192.168.1.85'],
  experimental: {
    optimizePackageImports: ['@heroui/react', 'lucide-react'],
  },
};

module.exports = nextConfig;
