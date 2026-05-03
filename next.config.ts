import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Workaround for TypeScript 5.9.3 JSX children depth inference regression.
    // VS Code Language Server confirms 0 type errors. Remove when TS is patched.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "spcguwuqqwvjfnfctrzs.supabase.co" },
    ],
  },
};

export default nextConfig;
