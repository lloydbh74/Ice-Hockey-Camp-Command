import type { NextConfig } from "next";
// import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

// if (process.env.NODE_ENV === 'development') {
//   setupDevPlatform({
//     configPath: '../wrangler.toml',
//   });
// }

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'cloudflare:sockets': 'commonjs cloudflare:sockets'
      });
    }
    return config;
  },
};

export default nextConfig;
