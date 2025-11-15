/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@heroui/react'],
  images: {
    domains: ['images.pexels.com', 'res.cloudinary.com'],
  },
  poweredByHeader: false,
  reactStrictMode: false,
};

module.exports = nextConfig;