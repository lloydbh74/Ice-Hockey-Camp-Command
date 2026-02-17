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
};

export default nextConfig;
