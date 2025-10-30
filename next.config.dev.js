/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@heroui/react'],
  experimental: {
    optimizePackageImports: ['@heroui/react', 'lucide-react'],
  },
  compiler: {
    removeConsole: false
  },
  images: {
    domains: ['images.pexels.com', 'res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: false, // Disable to prevent hydration warnings in dev
};

module.exports = nextConfig;