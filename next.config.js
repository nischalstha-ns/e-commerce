/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@heroui/react'],
  experimental: {
    optimizePackageImports: ['@heroui/react', 'lucide-react'],
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
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
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  headers: async () => {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
        ],
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    // Only apply webpack config when not using Turbopack
    if (process.env.TURBOPACK) {
      return config;
    }
    
    if (dev && !isServer) {
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.next/**', '**/.git/**'],
      };
      
      // Optimize for Windows filesystem
      config.snapshot = {
        managedPaths: [/^(.+?[\\/]node_modules[\\/])/],
        immutablePaths: [],
        buildDependencies: {
          hash: true,
          timestamp: true,
        },
      };
    }
    
    // Suppress Firebase warnings in development
    if (dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@firebase/firestore': require.resolve('@firebase/firestore')
      };
    }
    
    // Optimize bundle size
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  cacheHandler: process.env.NODE_ENV === 'development' ? undefined : require.resolve('./cache-handler.js'),
  cacheMaxMemorySize: 50 * 1024 * 1024, // 50MB
  reactStrictMode: process.env.NODE_ENV === 'production',
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;