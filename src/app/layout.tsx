import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import PromoBannerBar from "@/components/marketing/PromoBanner";
import WelcomePopupModal from "@/components/marketing/WelcomePopup";
import TrackingScripts from "@/components/marketing/TrackingScripts";
import { getSiteConfig } from "@/lib/site-config.server";

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sdcosmetique.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
        {siteConfig.marketing && <TrackingScripts marketing={siteConfig.marketing} />}
        <CartProvider>
          <WishlistProvider>
            {siteConfig.marketing?.banners?.length > 0 && (
              <PromoBannerBar banners={siteConfig.marketing.banners} />
            )}
            <TopBar message={siteConfig.topbar.message} phone={siteConfig.topbar.phone} />
            <Navbar />
            <CartDrawer />
            {siteConfig.marketing?.welcomePopup?.enabled && (
              <WelcomePopupModal config={siteConfig.marketing.welcomePopup} />
            )}
            <main className="flex-1">{children}</main>
            <Footer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
