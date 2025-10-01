/** @type {import('next').NextConfig} */
const nextConfig = {
  // Stability optimizations
  experimental: {
    // Reduce memory usage
    optimizePackageImports: ['framer-motion', '@heroicons/react'],
  },
  
  // Optimize compilation
  swcMinify: true,
  
  // Better error handling
  onDemandEntries: {
    // Reduce memory usage by limiting cached pages
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Webpack optimizations for stability
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Reduce memory usage in development
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
      
      // Prevent memory leaks
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }
    
    return config;
  },
  
  // Headers for better caching and stability
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
