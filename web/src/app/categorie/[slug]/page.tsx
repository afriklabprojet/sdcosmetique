import { fetchProductsByCategory } from '@/features/catalog/product.repository';
import { fetchActiveCategories } from '@/features/catalog/category.query';
import { Category } from '@/shared/types/domain.type';
import CategoryClient from '@/features/catalog/views/category.view';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [products, categories] = await Promise.all([
    fetchProductsByCategory(slug),
    fetchActiveCategories()
  ]);
  const categoryRow = categories.find(c => c.slug === slug);
  return <CategoryClient initialProducts={products} slug={slug as Category} categoryRow={categoryRow} />;
}
