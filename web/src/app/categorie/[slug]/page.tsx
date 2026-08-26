import { fetchProductsByCategory } from '@/features/catalog/product.repository';
import { Category } from '@/shared/types/domain.type';
import CategoryClient from '@/features/catalog/views/category.view';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await fetchProductsByCategory(slug);
  return <CategoryClient initialProducts={products} slug={slug as Category} />;
}
