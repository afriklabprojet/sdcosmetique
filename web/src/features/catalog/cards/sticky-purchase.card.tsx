'use client';

/*
 * Barre d'achat collee en bas de l'ecran mobile, affichee quand la
 * `PurchaseCard` sort du viewport. Extrait de `views/product.view.tsx`
 * (F-112) : elle a sa propre position dans le document, hors de la grille de
 * la fiche, et c'est le seul bloc de la page qui ne suit pas le flux.
 */

import type { Product } from '@/shared/types/domain.type';
import { BORDER, GOLD, TEXT } from '@/features/catalog/product-detail.constant';
import { AddedCheckIcon, AddToCartPlusIcon } from '@/features/catalog/assets/product-card-icons';
import { formatPrice } from '@/shared/format/price';

interface StickyPurchaseProps {
  readonly product: Product;
  readonly adding: boolean;
  readonly addToCart: () => void;
}

export default function StickyPurchase({ product, adding, addToCart }: StickyPurchaseProps) {
  return (
        <section
          className="lg:hidden floating-bar-above-nav"
          aria-label="Acheter rapidement"
          style={{
            position: 'fixed', left: 0, right: 0, zIndex: 57,
            background: 'white', borderTop: `1px solid ${BORDER}`,
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.name}
            </p>
            <p style={{ fontSize: 14, fontWeight: 800, color: GOLD, margin: 0 }}>
              {formatPrice(product.price)}
            </p>
          </div>
          <button
            onClick={addToCart}
            disabled={adding}
            aria-label="Ajouter au panier"
            style={{
              flexShrink: 0, minWidth: 152, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: TEXT, color: '#fff',
              border: `1px solid ${TEXT}`, borderRadius: 0,
              fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
              cursor: adding ? 'wait' : 'pointer',
              transition: 'opacity 0.25s ease',
              opacity: adding ? 0.85 : 1,
              padding: '0 16px',
            }}
          >
            <span style={{
              display: 'flex', transform: adding ? 'scale(0.92) rotate(90deg)' : 'scale(1) rotate(0deg)',
              transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
              {adding ? <AddedCheckIcon /> : <AddToCartPlusIcon />}
            </span>
            {adding ? 'Ajouté' : 'Ajouter au panier'}
          </button>
        </section>
  );
}
