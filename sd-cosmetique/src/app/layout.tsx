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

export const metadata: Metadata = {
  title: "SD Cosmetique — Beauté Africaine de Prestige",
  description: "Découvrez des soins cosmétiques haut de gamme formulés pour sublimer chaque carnation africaine. Sérum, crème, kits beauté et plus.",
  keywords: "cosmétique africaine, soin peau noire, teint unifié, beauté inclusive, SD Cosmetique",
  openGraph: {
    title: "SD Cosmetique — Beauté Africaine de Prestige",
    description: "Des formules pensées pour sublimer votre éclat naturel.",
    type: "website",
    locale: "fr_FR",
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
