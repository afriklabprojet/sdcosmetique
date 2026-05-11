
'use client';

// Icône panier factorisée
function CartIcon({ added }: { readonly added: boolean }) {
  return added ? (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ) : (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );
}

import React, { useEffect, useState } from 'react';
import StarRating from './StarRating';
// Icône étoile factorisée
function StarIcon({ filled }: { readonly filled: boolean }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24"
      fill={filled ? 'var(--gold)' : 'none'}
      stroke="var(--gold)" strokeWidth="1.5"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
import Image from 'next/image';
import Link from 'next/link';
import { CATEGORIES, Product } from '@/types';
import { formatPrice } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  readonly product: Product;
}

// Helpers extraits pour réduire la complexité cognitive
function getPrimaryBadge(product: Product): string | null {
  if (product.badges?.[0]) return product.badges[0];
  if (product.isNew) return 'Nouveau';
  if (product.isBestseller) return 'Best Seller';
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

function isLowStock(product: Product): boolean {
  return product.stockQty !== undefined
    && product.stockQty > 0
    && product.stockQty <= (product.lowStockThreshold ?? 5);
}

export default function ProductCard({ product }: Readonly<ProductCardProps>) {
  const { addItem } = useCart();
  const { toggle, isInWishlist } = useWishlist();
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

  const inWishlist = isInWishlist(product.id);
  const category = CATEGORIES.find(item => item.id === product.category);
  const primaryBadge = getPrimaryBadge(product);
  const interactiveHover = canHover && hovered;

  const handleAddToCart = () => {
    setAdding(true);
    addItem(product);
    setTimeout(() => setAdding(false), 1400);
  };

  const handleWishlist = () => {
    toggle(product);
  };

  const handleMouseEnter = () => {
    if (canHover) setHovered(true);
  };
  const handleMouseLeave = () => {
    if (canHover) setHovered(false);
  };

  let quickAddTransform: string;
  if (!canHover) {
    quickAddTransform = 'translateY(0)';
  } else if (interactiveHover) {
    quickAddTransform = 'translateY(0)';
  } else {
    quickAddTransform = 'translateY(102%)';
  }

  return (
    <article
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={makeCardStyle(interactiveHover)}
    >
      <ProductMedia
        product={product}
        primaryBadge={primaryBadge}
        interactiveHover={interactiveHover}
        adding={adding}
        inWishlist={inWishlist}
        quickAddTransform={quickAddTransform}
        onAddToCart={handleAddToCart}
        onWishlist={handleWishlist}
      />
      <ProductInfo
        product={product}
        category={category}
        adding={adding}
        onAddToCart={handleAddToCart}
      />
    </article>
  );
}

interface ProductMediaProps {
  readonly product: Product;
  readonly primaryBadge: string | null;
  readonly interactiveHover: boolean;
  readonly adding: boolean;
  readonly inWishlist: boolean;
  readonly quickAddTransform: string;
  readonly onAddToCart: () => void;
  readonly onWishlist: () => void;
}

function ProductMedia({
  product,
  primaryBadge,
  interactiveHover,
  adding,
  inWishlist,
  quickAddTransform,
  onAddToCart,
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

            {/* Gradient sombre pour lisibilité du quick-add */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(26,10,0,0.62) 0%, transparent 48%)',
                opacity: interactiveHover ? 1 : 0,
                transition: 'opacity 0.4s ease',
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />

            {/* Badge */}
            {primaryBadge && (
              <span
                style={{
                  position: 'absolute',
                  top: 7,
                  left: 7,
                  zIndex: 3,
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
        </Link>

        {/* ── Quick-add panel — slide up depuis le bas ── */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '10px 12px',
            zIndex: 2,
            transform: quickAddTransform,
            transition: 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
        >
          <button
            onClick={onAddToCart}
            disabled={!product.inStock}
            style={{
              width: '100%',
              height: 34,
              background: adding ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.96)',
              color: adding ? '#fff' : 'var(--gold-dark)',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              cursor: product.inStock ? 'pointer' : 'not-allowed',
              opacity: product.inStock ? 1 : 0.6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.25s ease, color 0.25s ease',
              backdropFilter: 'blur(4px)',
            }}
            aria-label="Ajouter au panier"
          >
            {adding ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Ajouté !
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                Ajouter au panier
              </>
            )}
          </button>
        </div>

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
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill={inWishlist ? 'var(--gold)' : 'none'}
            stroke={inWishlist ? 'var(--gold)' : '#7A6A5A'}
            strokeWidth="1.8"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
  );
}

interface ProductInfoProps {
  readonly product: Product;
  readonly category: { label: string } | undefined;
  readonly adding: boolean;
  readonly onAddToCart: () => void;
}

function ProductInfo({ product, category, adding, onAddToCart }: ProductInfoProps) {
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
            <p style={{ fontSize: '0.75rem', color: 'var(--warm-grey)', marginBottom: 8 }}>
              {category?.label ?? 'Soin'} · {product.inStock ? 'En stock' : 'Indisponible'}
            </p>

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
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--gold-dark)' }}>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--warm-grey)',
                    textDecoration: 'line-through',
                    display: 'block',
                  }}
                >
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </Link>

          {/* Panier fallback desktop/mobile */}
          <button
            onClick={onAddToCart}
            disabled={!product.inStock}
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              border: 'none',
              background: adding ? 'var(--charcoal)' : 'var(--gold-dark)',
              cursor: product.inStock ? 'pointer' : 'not-allowed',
              opacity: product.inStock ? 1 : 0.45,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: adding ? 'scale(0.9)' : 'scale(1)',
              transition: 'background 0.25s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              flexShrink: 0,
              marginTop: 2,
            }}
            aria-label="Ajouter au panier"
          >
            <CartIcon added={adding} />
          </button>
        </div>
      </div>
  );
}
