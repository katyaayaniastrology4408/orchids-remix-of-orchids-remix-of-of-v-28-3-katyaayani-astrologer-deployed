import type { NextConfig } from "next";

let visualEditsLoader: string | undefined;
try {
  visualEditsLoader = require.resolve("orchids-visual-edits/loader.js");
} catch {
  // loader not available (e.g. production build) – skip
}

const nextConfig: NextConfig = {
  devIndicators: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
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
  ...(visualEditsLoader
    ? {
        turbopack: {
          rules: {
            "*.{jsx,tsx}": {
              loaders: [
                {
                  loader: visualEditsLoader,
                  options: {},
                },
              ],
            },
          },
        },
      }
    : {}),
};

export default nextConfig;
// Orchids restart: 1770790287853
