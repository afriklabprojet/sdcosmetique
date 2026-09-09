
'use client';

/*
 * Composeur de la carte produit. Il ne rend plus de balise lui-meme au-dela de
 * l'`<article>` : il detient l'etat (survol, ajout en cours), calcule ce qui en
 * decoule, et assemble les deux moities extraites en vague `split` (F-115) —
 * `product-media.card.tsx` pour le visuel, `product-info.card.tsx` pour le
 * texte et le prix.
 */

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BADGE_LABELS, Product } from '@/shared/types/domain.type';
import { useCart } from '@/features/cart/cart.store';
import { useWishlist } from '@/features/wishlist/wishlist.store';
import { useComparison } from '@/features/comparison/comparison.store';
import { useGlobalPromo } from '@/features/promo/promo.store';
import { computeEffectivePrice } from '@/features/promo/promo.util';
import ProductMedia from '@/features/catalog/cards/product-media.card';
import ProductInfo from '@/features/catalog/cards/product-info.card';

interface ProductCardProps {
  readonly product: Product;
  /** Masque la note/avis sur la carte — la note reste visible sur la fiche produit. */
  readonly showRating?: boolean;
  /** Masque le badge « Bestseller » — utile dans une section déjà intitulée « meilleures ventes ». */
  readonly hideBestsellerBadge?: boolean;
}

const BESTSELLER_TEXT = /best.?seller/i;

// Helpers extraits pour réduire la complexité cognitive
function getPrimaryBadge(product: Product, hideBestsellerBadge: boolean): string | null {
  if (product.newArrival) return BADGE_LABELS.NEW;
  if (product.bestseller && !hideBestsellerBadge) return BADGE_LABELS.BESTSELLER;
  const custom = product.badges?.find((b) => !hideBestsellerBadge || !BESTSELLER_TEXT.test(b));
  return custom ?? null;
}

function makeCardStyle(hovered: boolean): React.CSSProperties {
  return {
    background: 'var(--white)',
    borderRadius: 12,
    overflow: 'hidden',
    border: `1px solid ${hovered ? 'var(--gold-pale)' : 'var(--cream)'}`,
    boxShadow: hovered ? 'var(--shadow-gold)' : 'var(--shadow-sm)',
    transition: 'box-shadow 0.38s ease, border-color 0.3s ease',
  };
}

export default function ProductCard({ product, showRating = true, hideBestsellerBadge = false }: Readonly<ProductCardProps>) {
  const { addItem } = useCart();
  const { toggle, wishlistContains } = useWishlist();
  const { toggle: toggleCompare, comparisonContains } = useComparison();
  const globalPromo = useGlobalPromo();
  const effectivePrice = computeEffectivePrice(product, globalPromo);
  const [adding, setAdding] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const mediaQuery = globalThis.window.matchMedia('(hover: hover) and (pointer: fine)');
    const updateCanHover = () => setCanHover(mediaQuery.matches);
    updateCanHover();
    mediaQuery.addEventListener('change', updateCanHover);
    return () => mediaQuery.removeEventListener('change', updateCanHover);
  }, []);

  const inWishlist = wishlistContains(product.id);
  const inComparison = comparisonContains(product.id);
  const primaryBadge = getPrimaryBadge(product, hideBestsellerBadge);
  const interactiveHover = canHover && hovered;

  const addProductToCart = () => {
    setAdding(true);
    addItem(product);
    setTimeout(() => setAdding(false), 1400);
  };

  const toggleWishlist = () => {
    toggle(product);
  };

  const toggleComparison = () => {
    toggleCompare(product);
  };

  const pointerEnter = () => {
    if (canHover) setHovered(true);
  };
  const pointerLeave = () => {
    if (canHover) setHovered(false);
  };

  return (
    <motion.article
      onMouseEnter={pointerEnter}
      onMouseLeave={pointerLeave}
      style={makeCardStyle(interactiveHover)}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      whileHover={canHover && !prefersReducedMotion ? { y: -6 } : undefined}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <ProductMedia
        product={product}
        primaryBadge={primaryBadge}
        effectivePrice={effectivePrice}
        badgeColor={globalPromo.badgeColor}
        interactiveHover={interactiveHover}
        inWishlist={inWishlist}
        toggleWishlist={toggleWishlist}
        inComparison={inComparison}
        toggleComparison={toggleComparison}
      />
      <ProductInfo
        product={product}
        effectivePrice={effectivePrice}
        adding={adding}
        addToCart={addProductToCart}
        showRating={showRating}
      />
    </motion.article>
  );
}
