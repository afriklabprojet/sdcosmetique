import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchProductBySlug, fetchRelatedProducts, fetchReviewsByProduct } from '@/lib/products-server';
import { getSiteConfig } from '@/lib/site-config.server';
import ProductDetail from '@/components/product/ProductDetail';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sdcosmetique.ci';
  const image = product.images[0];

  return {
    title: `${product.name} | SD Cosmétique`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} | SD Cosmétique`,
      description: product.shortDescription,
      url: `${siteUrl}/produit/${product.slug}`,
      siteName: 'SD Cosmétique',
      ...(image ? { images: [{ url: image, width: 800, height: 800, alt: product.name }] } : {}),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.shortDescription,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) return notFound();

  const [related, reviews, siteConfig] = await Promise.all([
    fetchRelatedProducts(product.id, product.category),
    fetchReviewsByProduct(product.id),
    getSiteConfig(),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sdcosmetique.ci';

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: product.images,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'SD Cosmétique' },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/produit/${product.slug}`,
      priceCurrency: 'XOF',
      price: product.price,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'SD Cosmétique' },
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail
        product={product}
        related={related}
        reviews={reviews}
        trustItems={siteConfig.product_trust}
        paymentBadges={siteConfig.payment_badges}
      />
    </>
  );
}
