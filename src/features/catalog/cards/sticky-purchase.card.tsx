'use client';

/*
 * Barre d'achat collee en bas de l'ecran mobile, affichee quand la
 * `PurchaseCard` sort du viewport. Extrait de `views/product.view.tsx`
 * (F-112) : elle a sa propre position dans le document, hors de la grille de
 * la fiche, et c'est le seul bloc de la page qui ne suit pas le flux.
 */

import type { Product } from '@/shared/types/domain.type';
import { BORDER, GOLD, TXT } from '@/features/catalog/product-detail.constant';

interface StickyPurchaseProps {
  readonly product: Product;
  readonly adding: boolean;
  readonly onAddToCart: () => void;
}

export default function StickyPurchase({ product, adding, onAddToCart }: StickyPurchaseProps) {
  return (
        <section
          className="lg:hidden"
          aria-label="Acheter rapidement"
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
            background: 'white', borderTop: `1px solid ${BORDER}`,
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: TXT, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.name}
            </p>
            <p style={{ fontSize: 14, fontWeight: 800, color: GOLD, margin: 0 }}>
              {product.price.toLocaleString('fr-FR')}&nbsp;FCFA
            </p>
          </div>
          <button
            onClick={onAddToCart}
            disabled={adding}
            aria-label="Ajouter au panier"
            style={{
              flexShrink: 0, minWidth: 152, height: 44,
              background: TXT, color: '#fff',
              border: `1px solid ${TXT}`, borderRadius: 0,
              fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
              cursor: adding ? 'wait' : 'pointer',
              transition: 'opacity 0.25s ease',
              opacity: adding ? 0.85 : 1,
              padding: '0 16px',
            }}
          >
            {adding ? '✓ Ajouté' : 'Ajouter au panier'}
          </button>
        </section>
  );
}
