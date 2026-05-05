import { Suspense } from 'react';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryHighlight from '@/components/home/CategoryHighlight';
import SkinToneSection from '@/components/home/SkinToneSection';
import TrendingProducts from '@/components/home/TrendingProducts';
import TrustBar from '@/components/home/TrustBar';
import Testimonials from '@/components/home/Testimonials';
import PaymentBand from '@/components/home/PaymentBand';
import { TrendingProductsSkeleton } from '@/components/ui/ProductCardSkeleton';
import { fetchBestsellerProducts } from '@/lib/products-server';
import { getSiteConfig } from '@/lib/site-config.server';
import { fetchApprovedTestimonials } from '@/lib/testimonials-server';
import { fetchActiveCategories } from '@/lib/categories-server';

async function TestimonialsSection() {
  const [testimonials, siteConfig] = await Promise.all([
    fetchApprovedTestimonials(),
    getSiteConfig(),
  ]);
  return <Testimonials rows={testimonials} fallbackItems={siteConfig.testimonials_home} />;
}

async function BestsellersSection() {
  const products = await fetchBestsellerProducts(5);
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
      <Suspense fallback={<TrendingProductsSkeleton count={5} />}>
        <BestsellersSection />
      </Suspense>
      <TrustBar items={siteConfig.trust_items} />
      <Suspense fallback={<div style={{ minHeight: '320px' }} />}>
        <TestimonialsSection />
      </Suspense>
      <PaymentBand />
    </>
  );
}
