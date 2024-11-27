/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: [
      'www.arbetsformedlingen.se',
      'arbetsformedlingen.se',
      'smidra.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'smidra.com'],
      bodySizeLimit: '2mb'
    }
  },
  webpack: (config, { dev, isServer }) => {
    // Optimera för utveckling
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 800,
        aggregateTimeout: 300,
      };
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './app',
      '@/components': './components'
    };
    
    return config;
  }
};

module.exports = nextConfig;