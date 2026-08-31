import type { NextConfig } from "next";

// [SEC-L6] En prod, un fallback silencieux vers un domaine de preview
// pointerait les URLs canoniques, les OG images et les redirects Jeko vers
// ce domaine si la variable est absente en déploiement.
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error('NEXT_PUBLIC_SITE_URL est requise en production (next.config.ts)');
}

const apiOrigin = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api\/?$/, '');

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['mysql2'],

  // ── Turbopack : forcer la racine de workspace pour éviter le panic dev-mode ─
  turbopack: {
    root: __dirname,
  },

  // Le MCP Playwright écrit ses snapshots/logs dans .playwright-mcp/ à la
  // racine du repo — sans ce filtre, chaque snapshot déclenche un rebuild.
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
      };
    }
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/.playwright-mcp/**'],
    };
    return config;
  },

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

  // [SEC-01] Variables publiques : plus de fallbacks hardcodés pour les secrets.
  // Les clés Supabase DOIVENT être définies dans .env.local / env de déploiement.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
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
    const isProd = process.env.NODE_ENV === 'production';
    return [
      // ── Assets statiques Next.js : cache 1 an immuable (prod uniquement)
      // En dev, on laisse Turbopack gérer → évite le chunk mismatch après rebuild
      ...(isProd ? [
        {
          source: "/_next/static/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
        {
          source: "/_next/static/media/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
      ] : []),
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
          // [SEC-02] Content-Security-Policy — Report-Only pour collecter sans bloquer.
          // Passer en Content-Security-Policy (enforced) après validation des rapports.
          {
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://spcguwuqqwvjfnfctrzs.supabase.co https://images.unsplash.com",
              `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ''} https://*.supabase.co wss://*.supabase.co https://graph.facebook.com https://api.resend.com`,
              "font-src 'self' data:",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "report-uri /api/csp-report",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
