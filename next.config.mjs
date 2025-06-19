/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@heroui/react'],
  serverExternalPackages: ['stripe']
};

export default nextConfig;