import { Suspense } from 'react';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryHighlight from '@/components/home/CategoryHighlight';
import SkinToneSection from '@/components/home/SkinToneSection';
import CTABanner from '@/components/home/CTABanner';
import TrendingProducts from '@/components/home/TrendingProducts';
import TrustBar from '@/components/home/TrustBar';
import Testimonials from '@/components/home/Testimonials';
import PaymentBand from '@/components/home/PaymentBand';
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

export default async function HomePage() {
  const [bestsellers, siteConfig, categories] = await Promise.all([
    fetchBestsellerProducts(5),
    getSiteConfig(),
    fetchActiveCategories(),
  ]);
  return (
    <>
      <HeroBanner config={siteConfig.hero} />
      <CategoryHighlight categories={categories} />
      <SkinToneSection />
      <CTABanner />
      <TrendingProducts products={bestsellers} />
      <TrustBar items={siteConfig.trust_items} />
      <Suspense fallback={<div style={{ minHeight: '320px' }} />}>
        <TestimonialsSection />
      </Suspense>
      <PaymentBand />
    </>
  );
}
