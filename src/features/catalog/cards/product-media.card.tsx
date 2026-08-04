'use client';

/*
 * La moitie haute de la carte produit : visuel, badges, bouton wishlist.
 * Extrait de `product.card.tsx` (F-115). Sa frontiere est nette — c'est la
 * seule partie qui porte de l'image, et le seul etat qu'elle detient est
 * l'echec de chargement de cette image.
 */

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/shared/types/domain.type';
import { type EffectivePrice } from '@/features/promo/promo.util';
import { PromoBadge } from '@/features/promo/badges/promo.badge';
import { WishlistHeartIcon } from '@/features/catalog/assets/product-card-icons';

interface ProductMediaProps {
  readonly product: Product;
  readonly primaryBadge: string | null;
  readonly effectivePrice: EffectivePrice;
  readonly badgeColor: string;
  readonly interactiveHover: boolean;
  readonly inWishlist: boolean;
  readonly onWishlist: () => void;
}

export default function ProductMedia({
  product,
  primaryBadge,
  effectivePrice,
  badgeColor,
  interactiveHover,
  inWishlist,
  onWishlist,
}: ProductMediaProps) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
      <div style={{ position: 'relative', aspectRatio: '3/4', background: 'var(--cream)', overflow: 'hidden' }}>
        <Link
          href={`/produit/${product.slug}`}
          aria-label={`Voir ${product.name}`}
          style={{ position: 'absolute', inset: 0, display: 'block', textDecoration: 'none' }}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Wrapper image zoomable */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: interactiveHover ? 'scale(1.07)' : 'scale(1)',
                transition: 'transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94)',
              }}
            >
              {product.images[0] && !imgFailed ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  style={{ objectFit: 'cover' }}
                  onError={() => setImgFailed(true)}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'var(--cream)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '32px', opacity: 0.3 }}>✦</span>
                </div>
              )}
            </div>

            {/* Badges overlay — promo + badge produit */}
            <div
              style={{
                position: 'absolute',
                top: 7,
                left: 7,
                zIndex: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              {effectivePrice.hasDiscount && (
                <PromoBadge
                  discountPct={effectivePrice.discountPct}
                  color={badgeColor}
                />
              )}
              {primaryBadge && (
                <span
                  style={{
                    background: 'var(--gold)',
                    color: '#fff',
                    fontSize: '0.42rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    padding: '1px 4px',
                    borderRadius: 2,
                    textTransform: 'uppercase',
                  }}
                >
                  {primaryBadge}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* ── Bouton wishlist — toujours visible ── */}
        <button
          onClick={onWishlist}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 3,
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.96)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            opacity: 1,
            transform: inWishlist ? 'scale(1.12)' : 'scale(1)',
            transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
          }}
          aria-label="Ajouter aux favoris"
          aria-pressed={inWishlist}
        >
          <WishlistHeartIcon filled={inWishlist} />
        </button>
      </div>
  );
}
