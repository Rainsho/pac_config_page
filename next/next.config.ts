import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // proxy buffers request bodies; default 10MB truncates large uploads
    proxyClientMaxBodySize: '2gb',
  },
};

export default nextConfig;
