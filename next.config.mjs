/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@heroui/react'],
  experimental: {
    optimizePackageImports: ['@heroui/react', 'lucide-react'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  images: {
    domains: ['images.pexels.com', 'res.cloudinary.com'],
    formats: ['image/webp', 'image/avif']
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300
      };
    }
    return config;
  },
  // Suppress hydration warnings for browser extensions
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  }
};

export default nextConfig;