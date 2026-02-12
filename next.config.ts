import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vvwiqoyqxqqlrylwixnp.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  turbopack: {
    rules: {
      "*.{jsx,tsx}": {
        loaders: [
          {
            loader: require.resolve("orchids-visual-edits/loader.js"),
            options: {},
          },
        ],
      },
    },
  },
};

export default nextConfig;
// Orchids restart: 1770790287853
