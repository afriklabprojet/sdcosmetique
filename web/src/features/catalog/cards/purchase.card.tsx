'use client';

/*
 * Carte d'achat de la fiche produit : prix, teint, quantite, boutons.
 * Extrait de `views/product.view.tsx` (F-112).
 */

import { formatPrice } from '@/features/catalog/product.query';
import { CURRENCY_LABEL } from '@/shared/format/price';
import type { Product, SkinTone } from '@/shared/types/domain.type';
import { BORDER, TEXT, TEXT_MUTED } from '@/features/catalog/product-detail.constant';
import TonePicker from '@/features/catalog/selects/product-tone.select';
import { AddedCheckIcon, AddToCartPlusIcon } from '@/features/catalog/assets/product-card-icons';

interface PurchaseCardProps {
  readonly product: Product;
  readonly selectedTone: string;
  readonly selectTone: (t: SkinTone) => void;
  readonly qty: number;
  readonly changeQuantity: (q: number) => void;
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
export default function PurchaseCard({ product, selectedTone, selectTone, qty, changeQuantity, addProductToCart, buyNow, adding, discount, customToneImages }: PurchaseCardProps) {
  const savings = product.originalPrice ? product.originalPrice - product.price : 0;
  return (
    <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '20px 18px', boxShadow: '0 12px 32px -12px rgba(26,14,5,0.14)' }}>

      {/* Prix */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: TEXT, fontFamily: 'Georgia,serif' }}>
          {product.price.toLocaleString('fr-FR')}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: TEXT_MUTED }}>{CURRENCY_LABEL}</span>
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
      {savings > 0 && (
        <p style={{ fontSize: 12, fontWeight: 600, color: '#3F7A5C', margin: '4px 0 16px' }}>
          Vous économisez {formatPrice(savings)}
        </p>
      )}
      {savings === 0 && <div style={{ marginBottom: 16 }} />}

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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
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
        <span style={{
          display: 'flex', transform: adding ? 'scale(0.92) rotate(90deg)' : 'scale(1) rotate(0deg)',
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {adding ? <AddedCheckIcon /> : <AddToCartPlusIcon />}
        </span>
        {adding ? 'Ajouté' : 'Ajouter au panier'}
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

      {/* Réassurance — répétée au point de décision, pas seulement plus bas sur la page */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 0', marginBottom: 14, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        {[
          { icon: <path d="M1 3h13v10H1zM14 8h4l3 3v5h-7V8z" />, viewBox: '0 0 24 16', label: 'Livraison en 24–48h à Abidjan' },
          { icon: <><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4" /></>, viewBox: '0 0 24 24', label: 'Retour gratuit sous 7 jours' },
          { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, viewBox: '0 0 24 24', label: 'Paiement 100% sécurisé' },
        ].map((row) => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="15" height="15" viewBox={row.viewBox} fill="none" stroke="#3F7A5C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>{row.icon}</svg>
            <span style={{ fontSize: 12, color: TEXT }}>{row.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
