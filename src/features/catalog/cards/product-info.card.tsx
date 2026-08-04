'use client';

/*
 * La moitie basse de la carte produit : nom, note, stock, prix, bouton
 * d'ajout. Extrait de `product.card.tsx` (F-115). `isLowStock` la suit :
 * c'est la seule ligne du rendu qui pose la question, et personne d'autre
 * ne l'appelle.
 */

import Link from 'next/link';
import { Product } from '@/shared/types/domain.type';
import { formatPrice } from '@/features/catalog/product.query';
import StarRating from '@/features/catalog/star-rating';
import { type EffectivePrice } from '@/features/promo/promo.util';
import { AddedCheckIcon, AddToCartPlusIcon } from '@/features/catalog/assets/product-card-icons';

function isLowStock(product: Product): boolean {
  return product.stockQty !== undefined
    && product.stockQty > 0
    && product.stockQty <= (product.lowStockThreshold ?? 5);
}

interface ProductInfoProps {
  readonly product: Product;
  readonly category: { label: string } | undefined;
  readonly effectivePrice: EffectivePrice;
  readonly adding: boolean;
  readonly onAddToCart: () => void;
}

export default function ProductInfo({ product, category, effectivePrice, adding, onAddToCart }: ProductInfoProps) {
  return (
      <div style={{ padding: '12px 13px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
          <Link
            href={`/produit/${product.slug}`}
            style={{ textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0 }}
            aria-label={`Voir ${product.name}`}
          >
            <p
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--charcoal)',
                lineHeight: 1.35,
                marginBottom: 4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {product.name}
            </p>
            {!product.inStock && (
              <p style={{ fontSize: '0.75rem', color: 'var(--warm-grey)', marginBottom: 8 }}>
                Indisponible
              </p>
            )}

            {/* Étoiles + avis */}
            <div style={{ marginBottom: 10 }}>
              <StarRating rating={product.rating} count={product.reviewCount} showCount size={11} />
            </div>

            {/* Stock faible */}
            {isLowStock(product) && (
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#DC2626', marginBottom: 6 }}>
                ⚠ Plus que {product.stockQty} en stock
              </p>
            )}

            {/* Prix */}
            <div>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: effectivePrice.hasDiscount ? '#C0392B' : 'var(--gold-dark)' }}>
                {formatPrice(effectivePrice.salePrice)}
              </span>
              {effectivePrice.hasDiscount && effectivePrice.strikePrice !== null && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--warm-grey)',
                    textDecoration: 'line-through',
                    display: 'block',
                  }}
                >
                  {formatPrice(effectivePrice.strikePrice)}
                </span>
              )}
            </div>
          </Link>

          {/* Bouton + minimaliste façon Massimo Dutti */}
          <button
            onClick={onAddToCart}
            disabled={!product.inStock}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: `1px solid ${adding ? 'var(--charcoal)' : 'rgba(0,0,0,0.18)'}`,
              background: adding ? 'var(--charcoal)' : 'transparent',
              color: adding ? '#fff' : 'var(--charcoal)',
              cursor: product.inStock ? 'pointer' : 'not-allowed',
              opacity: product.inStock ? 1 : 0.4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: adding ? 'scale(0.92) rotate(90deg)' : 'scale(1) rotate(0deg)',
              transition: 'background 0.25s ease, border-color 0.25s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              flexShrink: 0,
              marginTop: 2,
              padding: 0,
            }}
            aria-label={adding ? 'Ajouté au panier' : 'Ajouter au panier'}
          >
            {adding ? <AddedCheckIcon /> : <AddToCartPlusIcon />}
          </button>
        </div>
      </div>
  );
}
