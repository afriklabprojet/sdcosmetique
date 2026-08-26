import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import HeroBanner from '@/features/home/hero-banner';
import CategoryHighlight from '@/features/home/category-highlight';

// ── ISR : cache HTML 5 minutes → réduit TTFB (Document request latency) ────
export const revalidate = 300;
// Sections below-fold : code-splitting JS pour réduire le bundle initial (score Lighthouse "unused JS")
const SkinToneSection  = dynamic(() => import('@/features/home/skin-tone-section'),  { ssr: true });
const Testimonials     = dynamic(() => import('@/features/testimonials/testimonials'),      { ssr: true });
const TrendingProducts = dynamic(() => import('@/features/home/trending-products'),  { ssr: true });
const PaymentBand      = dynamic(() => import('@/features/home/payment-band'),       { ssr: true });
import { TrendingProductsSkeleton } from '@/features/catalog/cards/product-card-skeleton';
import { fetchBestsellerProducts } from '@/features/catalog/product.repository';
import { getSiteConfig } from '@/features/site-config/site-config.query';
import { fetchApprovedTestimonials } from '@/features/testimonials/testimonial.query';
import { fetchActiveCategories } from '@/features/catalog/category.query';

// ─── Section bestsellers dans son propre Suspense boundary ──────────────────
async function BestsellersSection() {
  const products = await fetchBestsellerProducts(10);
  return <TrendingProducts products={products} />;
}

export default async function HomePage() {
  const [siteConfig, categories, testimonials] = await Promise.all([
    getSiteConfig(),
    fetchActiveCategories(),
    fetchApprovedTestimonials(),
  ]);
  return (
    <>
      <HeroBanner config={siteConfig.hero} />
      <CategoryHighlight categories={categories} />
      <SkinToneSection
        title={siteConfig.skin_tone_section_title || undefined}
        images={{
          noir:        siteConfig.hero_teint_noir?.image        || undefined,
          marron:      siteConfig.hero_teint_marron?.image      || undefined,
          marronClair: siteConfig.hero_teint_marron_clair?.image || undefined,
          clair:       siteConfig.hero_teint_clair?.image       || undefined,
          metisse:     siteConfig.hero_teint_metisse?.image     || undefined,
        }} />
      <Suspense fallback={<TrendingProductsSkeleton count={10} />}>
        <BestsellersSection />
      </Suspense>
      <Testimonials rows={testimonials} />
      <PaymentBand />
    </>
  );
}
