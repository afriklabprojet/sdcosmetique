import type { Metadata } from 'next';
import { fetchProducts } from '@/features/catalog/product.repository';
import { fetchActiveCategories } from '@/features/catalog/category.query';
import ShopView from '@/features/catalog/views/boutique.view';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sdcosmetique.ci';

export const metadata: Metadata = {
  title: 'Boutique — SD Cosmetique',
  description: 'Tous nos soins conçus pour les peaux africaines et métissées.',
  alternates: { canonical: `${siteUrl}/boutique` },
  openGraph: {
    title: 'Boutique — SD Cosmetique',
    description: 'Découvrez nos soins naturels conçus pour les peaux africaines et métissées.',
    url: `${siteUrl}/boutique`,
    siteName: 'SD Cosmétique',
    type: 'website',
  },
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchActiveCategories(),
  ]);
  return <ShopView products={products} categories={categories} />;
}