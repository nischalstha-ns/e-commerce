/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@heroui/react'],
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    optimizePackageImports: ['@heroui/react', 'lucide-react'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },

  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },
};

module.exports = nextConfig;