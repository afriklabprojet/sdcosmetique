import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import TrackingScripts from "@/components/marketing/TrackingScripts";
import ClientOnlyOverlays from "@/components/layout/ClientOnlyOverlays";
import { getSiteConfig } from "@/lib/site-config.server";

import PromoBannerBar from "@/components/marketing/PromoBanner";

// ── Chargements différés (non-critiques pour LCP/TTI) ─────────────────────
const Footer = dynamic(() => import("@/components/layout/Footer"), { ssr: true });

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sdcosmetique.ci';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a0a00',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: '/manifest.webmanifest',
  title: {
    default: "SD Cosmetique — Beauté Africaine de Prestige",
    template: "%s | SD Cosmetique",
  },
  description: "Découvrez des soins cosmétiques haut de gamme formulés pour sublimer chaque carnation africaine. Sérum, crème, kits beauté et plus.",
  keywords: "cosmétique africaine, soin peau noire, teint unifié, beauté inclusive, SD Cosmetique, Côte d'Ivoire",
  authors: [{ name: 'SD Cosmetique' }],
  creator: 'SD Cosmetique',
  publisher: 'SD Cosmetique',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: "SD Cosmetique — Beauté Africaine de Prestige",
    description: "Des formules pensées pour sublimer votre éclat naturel.",
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "SD Cosmetique",
  },
  twitter: {
    card: 'summary_large_image',
    title: "SD Cosmetique — Beauté Africaine de Prestige",
    description: "Des formules pensées pour sublimer votre éclat naturel.",
    creator: '@sdcosmetique',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteConfig = await getSiteConfig();
  return (
    <html lang="fr" data-scroll-behavior="smooth" className={`h-full ${playfair.variable} ${inter.variable}`}>
      <head>
        {/* ── Préchargement connexions tierces (LCP + tracking) ──────────── */}
        {/* Supabase Storage : préconnexion pour les images produits/hero */}
        <link rel="preconnect" href="https://spcguwuqqwvjfnfctrzs.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://spcguwuqqwvjfnfctrzs.supabase.co" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://analytics.tiktok.com" />
      </head>
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
        {siteConfig.marketing && <TrackingScripts marketing={siteConfig.marketing} />}
        <CartProvider>
          <WishlistProvider>
            <div id="site-chrome">
              {siteConfig.marketing?.banners?.length > 0 && (
                <PromoBannerBar banners={siteConfig.marketing.banners} />
              )}
              <TopBar
                message={siteConfig.topbar.message}
                phone={siteConfig.topbar.phone}
                facebook={siteConfig.branding?.facebookUrl || undefined}
                instagram={siteConfig.branding?.instagramUrl || undefined}
                tiktok={siteConfig.branding?.tiktokUrl || undefined}
              />
              <Navbar logoUrl={siteConfig.branding?.logoUrl || undefined} logoCaption={siteConfig.branding?.tagline || undefined} siteName={siteConfig.branding?.siteName || 'SD Cosmetique'} />
              <ClientOnlyOverlays welcomePopup={siteConfig.marketing?.welcomePopup} />
            </div>
            <main className="flex-1">{children}</main>
            <div id="site-footer">
              <Footer logoUrl={siteConfig.branding?.logoUrl || undefined} siteName={siteConfig.branding?.siteName || 'SD Cosmetique'} />
            </div>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
