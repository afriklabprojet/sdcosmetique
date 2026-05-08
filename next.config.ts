import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',

  // ── Réduction bundle ───────────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,

  // ── Tree-shaking agressif des librairies à sous-modules ───────────────────
  experimental: {
    // optimizeCss désactivé : préchargeait tous les chunks CSS de toutes les routes
    // → générait des warnings "preloaded but not used" sur chaque page
    // Optimisation server React (Next 16+)
    optimizeServerReact: true,
    optimizePackageImports: [
      '@supabase/supabase-js',
      '@supabase/ssr',
      '@upstash/ratelimit',
      '@upstash/redis',
    ],
  },

  // Variables publiques toujours disponibles au build et au runtime
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://spcguwuqqwvjfnfctrzs.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwY2d1d3VxcXd2amZuZmN0cnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MzExNjMsImV4cCI6MjA2MjAwNzE2M30.YPixgCyODVWO7gptpuNd-m32nLvLDqdXCJRIrTpr2dE',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://floralwhite-fish-697630.hostingersite.com',
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME ?? 'SD Cosmétique',
  },

  // ── Optimisation images ────────────────────────────────────────────────────
  images: {
    // Formats modernes (AVIF ~50% plus léger que JPEG, WebP ~30%)
    formats: ['image/avif', 'image/webp'],
    // Tailles adaptées aux breakpoints mobiles/tablette/desktop
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    // Cache CDN 1 an (31 536 000 s) — évite re-optimisation
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "spcguwuqqwvjfnfctrzs.supabase.co" },
    ],
  },

  // ── Redirect www → non-www (évite la chaîne de redirections) ───────────────
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.sdcosmetique.ci' }],
        destination: 'https://sdcosmetique.ci/:path*',
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      // ── Assets statiques Next.js : cache 1 an immuable ────────────────────
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // ── Polices Google (via next/font, servi localement) ──────────────────
      {
        source: "/_next/static/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // ── Images publiques ─────────────────────────────────────────────────
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, must-revalidate",
          },
        ],
      },
      // ── Assets publics (hero, produits, categories) ───────────────────────
      {
        source: "/(hero|products|categories)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=3600",
          },
        ],
      },
      // ── Manifest PWA ──────────────────────────────────────────────────────
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
      // ── Toutes les routes : headers sécurité + perf ───────────────────────
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Réduit les redirections HTTP → HTTPS
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;
