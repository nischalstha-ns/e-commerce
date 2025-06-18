/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@heroui/react'],
  experimental: {
    serverComponentsExternalPackages: ['stripe']
  }
};

export default nextConfig;