import { fetchProducts } from '@/lib/products-server';
import BoutiqueClient from './BoutiqueClient';

export const metadata = {
  title: 'Boutique — SD Cosmetique',
  description: 'Tous nos soins conçus pour les peaux africaines et métissées.',
};

export default async function BoutiquePage() {
  const products = await fetchProducts();
  return <BoutiqueClient products={products} />;
}