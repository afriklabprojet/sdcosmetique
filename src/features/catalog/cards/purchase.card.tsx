'use client';

/*
 * Carte d'achat de la fiche produit : prix, teint, quantite, boutons, badges
 * de paiement. Extrait de `views/product.view.tsx` (F-112). `PayBadge` la suit
 * — c'est le seul endroit qui l'affiche.
 */

import { formatPrice } from '@/features/catalog/product.query';
import type { Product, SkinTone } from '@/shared/types/domain.type';
import type { PaymentBadge } from '@/features/site-config/site-config.type';
import { BORDER, TEXT, TEXT_MUTED } from '@/features/catalog/product-detail.constant';
import TonePicker from '@/features/catalog/selects/product-tone.select';

function PayBadge({ label, bg, text = 'white' }: { readonly label: string; readonly bg: string; readonly text?: string }) {
  return (
    <div style={{ width: 44, height: 28, borderRadius: 5, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px 3px' }}>
      <span style={{ fontSize: '6px', fontWeight: 900, color: text, textAlign: 'center', lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
        {label}
      </span>
    </div>
  );
}

interface PurchaseCardProps {
  readonly product: Product;
  readonly selectedTone: string;
  readonly selectTone: (t: SkinTone) => void;
  readonly qty: number;
  readonly changeQuantity: (q: number) => void;
  readonly payments: PaymentBadge[];
  readonly addProductToCart: () => void;
  readonly buyNow: () => void;
  readonly adding: boolean;
  readonly discount: number | null;
  readonly customToneImages?: Record<string, string>;
}

/*
 * Teinte et quantite ne descendent pas dans cette carte : elle est rendue deux
 * fois (desktop et mobile) et les deux instances doivent afficher le meme
 * choix, que l'en-tete de la fiche lit egalement. L'etat reste donc chez son
 * seul proprietaire possible ; ce sont les props qui cessent d'etre des setters
 * pour devenir des affordances, et le bornage de la quantite remonte avec elle.
 */
export default function PurchaseCard({ product, selectedTone, selectTone, qty, changeQuantity, payments, addProductToCart, buyNow, adding, discount, customToneImages }: PurchaseCardProps) {
  return (
    <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '20px 18px' }}>

      {/* Prix */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: TEXT, fontFamily: 'Georgia,serif' }}>
          {product.price.toLocaleString('fr-FR')}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: TEXT_MUTED }}>FCFA</span>
        {product.originalPrice && (
          <span style={{ fontSize: 13, textDecoration: 'line-through', color: TEXT_MUTED, marginLeft: 4 }}>
            {formatPrice(product.originalPrice)}
          </span>
        )}
        {discount && (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#C0392B', background: '#FEE2E2', padding: '2px 6px', borderRadius: 3, marginLeft: 4 }}>
            -{discount}%
          </span>
        )}
      </div>

      {/* Sélecteur de teint */}
      {product.skinTones.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: TEXT, marginBottom: 12 }}>
            Votre teint
          </p>
          <TonePicker skinTones={product.skinTones} selectedTone={selectedTone} pickTone={t => selectTone(t as SkinTone)} customToneImages={customToneImages} />
        </div>
      )}

      {/* Quantité */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: TEXT, margin: 0 }}>Qté</p>
        <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${BORDER}`, borderRadius: 4, overflow: 'hidden' }}>
          <button onClick={() => changeQuantity(qty - 1)} aria-label="Diminuer la quantité"
            style={{ width: 44, height: 44, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: TEXT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
          <span style={{ minWidth: 28, textAlign: 'center', fontSize: 14, fontWeight: 600, color: TEXT }}>{qty}</span>
          <button onClick={() => changeQuantity(qty + 1)} aria-label="Augmenter la quantité"
            style={{ width: 44, height: 44, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: TEXT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>
      </div>

      {/* Bouton Ajouter au panier — minimaliste */}
      <button
        onClick={addProductToCart}
        disabled={adding}
        style={{
          width: '100%',
          height: 48,
          marginBottom: 10,
          background: adding ? TEXT : 'transparent',
          color: adding ? '#fff' : TEXT,
          border: `1px solid ${TEXT}`,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          cursor: adding ? 'wait' : 'pointer',
          transition: 'background 0.25s ease, color 0.25s ease',
        }}
        onMouseEnter={(e) => { if (!adding) { e.currentTarget.style.background = TEXT; e.currentTarget.style.color = '#fff'; } }}
        onMouseLeave={(e) => { if (!adding) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEXT; } }}
      >
        {adding ? '✓ Ajouté' : 'Ajouter au panier'}
      </button>

      {/* Bouton Acheter maintenant — minimaliste */}
      <button
        onClick={buyNow}
        style={{
          width: '100%',
          height: 48,
          marginBottom: 18,
          background: TEXT,
          color: '#fff',
          border: `1px solid ${TEXT}`,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'opacity 0.25s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        Acheter maintenant
      </button>

      {/* Badges paiement */}
      {payments.length > 0 && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: TEXT_MUTED, marginBottom: 8, textAlign: 'center' }}>
            Paiement sécurisé
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {payments.map((p) => <PayBadge key={p.label} label={p.label} bg={p.bg} text={p.text} />)}
          </div>
        </div>
      )}
    </div>
  );
}
