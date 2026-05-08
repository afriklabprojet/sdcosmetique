import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryHighlight from '@/components/home/CategoryHighlight';
// Sections below-fold : code-splitting JS pour réduire le bundle initial (score Lighthouse "unused JS")
const SkinToneSection  = dynamic(() => import('@/components/home/SkinToneSection'),  { ssr: true });
const TrustBar         = dynamic(() => import('@/components/home/TrustBar'),          { ssr: true });
const Testimonials     = dynamic(() => import('@/components/home/Testimonials'),      { ssr: true });
const TrendingProducts = dynamic(() => import('@/components/home/TrendingProducts'),  { ssr: true });
const PaymentBand      = dynamic(() => import('@/components/home/PaymentBand'),       { ssr: true });
import { TrendingProductsSkeleton } from '@/components/ui/ProductCardSkeleton';
import { fetchBestsellerProducts } from '@/lib/products-server';
import { getSiteConfig } from '@/lib/site-config.server';
import { fetchApprovedTestimonials } from '@/lib/testimonials-server';
import { fetchActiveCategories } from '@/lib/categories-server';
import type { SiteConfig } from '@/lib/site-config';

// ─── Sections asynchrones isolées dans leurs propres Suspense boundaries ─────
async function TestimonialsSection({ fallbackItems }: Readonly<{ fallbackItems: SiteConfig['testimonials_home'] }>) {
  const testimonials = await fetchApprovedTestimonials();
  return <Testimonials rows={testimonials} fallbackItems={fallbackItems} />;
}

async function BestsellersSection() {
  const products = await fetchBestsellerProducts(10);
  return <TrendingProducts products={products} />;
}

export default async function HomePage() {
  const [siteConfig, categories] = await Promise.all([
    getSiteConfig(),
    fetchActiveCategories(),
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
      <TrustBar items={siteConfig.trust_items} />
      <Suspense fallback={<div style={{ minHeight: '320px' }} />}>
        <TestimonialsSection fallbackItems={siteConfig.testimonials_home} />
      </Suspense>
      <PaymentBand />
    </>
  );
}
