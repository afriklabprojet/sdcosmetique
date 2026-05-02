import { fetchProductsByCategory } from '@/lib/products-server';
import { Category } from '@/types';
import CategoryClient from '@/components/categorie/CategoryClient';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await fetchProductsByCategory(slug);
  return <CategoryClient initialProducts={products} slug={slug as Category} />;
}
