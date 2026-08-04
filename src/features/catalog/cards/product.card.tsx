
'use client';

/*
 * Composeur de la carte produit. Il ne rend plus de balise lui-meme au-dela de
 * l'`<article>` : il detient l'etat (survol, ajout en cours), calcule ce qui en
 * decoule, et assemble les deux moities extraites en vague `split` (F-115) —
 * `product-media.card.tsx` pour le visuel, `product-info.card.tsx` pour le
 * texte et le prix.
 */

import React, { useEffect, useState } from 'react';
import { CATEGORIES, Product } from '@/shared/types/domain.type';
import { useCart } from '@/features/cart/cart.store';
import { useWishlist } from '@/features/wishlist/wishlist.store';
import { useGlobalPromo } from '@/features/promo/promo.store';
import { computeEffectivePrice } from '@/features/promo/promo.util';
import ProductMedia from '@/features/catalog/cards/product-media.card';
import ProductInfo from '@/features/catalog/cards/product-info.card';

interface ProductCardProps {
  readonly product: Product;
}

// Helpers extraits pour réduire la complexité cognitive
function getPrimaryBadge(product: Product): string | null {
  if (product.badges?.[0]) return product.badges[0];
  if (product.newArrival) return 'Nouveau';
  if (product.bestseller) return 'Best Seller';
  return null;
}

function makeCardStyle(hovered: boolean): React.CSSProperties {
  return {
    background: 'var(--white)',
    borderRadius: 12,
    overflow: 'hidden',
    border: `1px solid ${hovered ? 'var(--gold-pale)' : 'var(--cream)'}`,
    boxShadow: hovered ? 'var(--shadow-gold)' : 'var(--shadow-sm)',
    transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
    transition: 'transform 0.38s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.38s ease, border-color 0.3s ease',
  };
}

export default function ProductCard({ product }: Readonly<ProductCardProps>) {
  const { addItem } = useCart();
  const { toggle, wishlistContains } = useWishlist();
  const globalPromo = useGlobalPromo();
  const effectivePrice = computeEffectivePrice(product, globalPromo);
  const [adding, setAdding] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const mediaQuery = globalThis.window.matchMedia('(hover: hover) and (pointer: fine)');
    const updateCanHover = () => setCanHover(mediaQuery.matches);
    updateCanHover();
    mediaQuery.addEventListener('change', updateCanHover);
    return () => mediaQuery.removeEventListener('change', updateCanHover);
  }, []);

  const inWishlist = wishlistContains(product.id);
  const category = CATEGORIES.find(item => item.id === product.category);
  const primaryBadge = getPrimaryBadge(product);
  const interactiveHover = canHover && hovered;

  const addProductToCart = () => {
    setAdding(true);
    addItem(product);
    setTimeout(() => setAdding(false), 1400);
  };

  const toggleWishlist = () => {
    toggle(product);
  };

  const pointerEnter = () => {
    if (canHover) setHovered(true);
  };
  const pointerLeave = () => {
    if (canHover) setHovered(false);
  };

  return (
    <article
      onMouseEnter={pointerEnter}
      onMouseLeave={pointerLeave}
      style={makeCardStyle(interactiveHover)}
    >
      <ProductMedia
        product={product}
        primaryBadge={primaryBadge}
        effectivePrice={effectivePrice}
        badgeColor={globalPromo.badgeColor}
        interactiveHover={interactiveHover}
        inWishlist={inWishlist}
        toggleWishlist={toggleWishlist}
      />
      <ProductInfo
        product={product}
        category={category}
        effectivePrice={effectivePrice}
        adding={adding}
        addToCart={addProductToCart}
      />
    </article>
  );
}
