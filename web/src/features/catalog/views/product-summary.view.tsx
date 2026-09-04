'use client';

/*
 * Identite du produit : categorie, nom, teint choisi, note, prix, accroche,
 * bienfaits. Extrait de `product.view.tsx` (F-112).
 *
 * La fiche rendait ce bloc deux fois — colonne 3 du desktop, section «Info» du
 * mobile — avec le meme balisage a seize jetons de taille pres. Ces seize
 * valeurs sont tabulees ci-dessous ; `compact` choisit la colonne. Le rendu de
 * chaque variante reste identique a ce qu'il etait.
 */

import { BADGE_LABELS, type Product } from '@/shared/types/domain.type';
import { formatPrice } from '@/features/catalog/product.query';
import StarRating from '@/features/catalog/star-rating';
import { GOLD, GOLD2, BORDER, TEXT, TEXT_MUTED, TEXT_BODY } from '@/features/catalog/product-detail.constant';
import { BenefitIcon } from '@/features/catalog/assets/product-detail-icons';

/** Les seules differences entre la colonne desktop et le bloc mobile. */
const SIZES = {
  wide:    { badgePadding: '4px 12px', badgeSpacing: '0.15em', badgeMargin: 12, title: 26, toneMargin: 12, ratingMargin: 16, star: 15, priceMargin: 14, price: 26, currency: 15, strike: 14, strikeMarginLeft: 4,         descMargin: 20, benefitsSpacing: '0.18em', benefitsMargin: 12, benefitRowMargin: 10, benefitCircle: 34 },
  compact: { badgePadding: '4px 10px', badgeSpacing: '0.14em', badgeMargin: 10, title: 22, toneMargin: 10, ratingMargin: 12, star: 14, priceMargin: 12, price: 22, currency: 14, strike: 13, strikeMarginLeft: undefined, descMargin: 16, benefitsSpacing: '0.16em', benefitsMargin: 10, benefitRowMargin:  8, benefitCircle: 32 },
} as const;

interface ProductSummaryProps {
  readonly product: Product;
  readonly categoryLabel: string;
  readonly selectedToneLabel: string;
  /** Variante mobile : memes elements, jetons de taille reduits. */
  readonly compact?: boolean;
}

export default function ProductSummary({ product, categoryLabel, selectedToneLabel, compact = false }: ProductSummaryProps) {
  const s = compact ? SIZES.compact : SIZES.wide;
  return (
    <div style={compact ? undefined : { paddingTop: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: s.badgeMargin }}>
        <span style={{ display: 'inline-block', padding: s.badgePadding, background: GOLD, color: 'white', fontSize: 10, fontWeight: 800, letterSpacing: s.badgeSpacing, textTransform: 'uppercase', borderRadius: 2 }}>
          {categoryLabel}
        </span>
        {product.newArrival && (
          <span style={{ display: 'inline-block', padding: s.badgePadding, background: '#1E3A5F', color: '#93C5FD', fontSize: 10, fontWeight: 800, letterSpacing: s.badgeSpacing, textTransform: 'uppercase', borderRadius: 2 }}>
            {BADGE_LABELS.NEW}
          </span>
        )}
        {product.bestseller && (
          <span style={{ display: 'inline-block', padding: s.badgePadding, background: '#4A1D1D', color: '#FCA5A5', fontSize: 10, fontWeight: 800, letterSpacing: s.badgeSpacing, textTransform: 'uppercase', borderRadius: 2 }}>
            {BADGE_LABELS.BESTSELLER}
          </span>
        )}
        {(product.badges ?? []).map((b) => (
          <span key={b} style={{ display: 'inline-block', padding: s.badgePadding, background: '#F4EBE1', color: '#8F5922', fontSize: 10, fontWeight: 800, letterSpacing: s.badgeSpacing, textTransform: 'uppercase', borderRadius: 2, border: '1px solid #E5D5C5' }}>
            {b}
          </span>
        ))}
      </div>
      <h1 style={{ fontSize: s.title, fontWeight: 800, color: TEXT, fontFamily: 'Georgia,serif', lineHeight: 1.2, marginBottom: 4 }}>
        {product.name}
      </h1>
      <p style={{ fontSize: compact ? 17 : 20, fontWeight: 700, color: GOLD2, fontFamily: 'Georgia,serif', marginBottom: s.toneMargin }}>
        Teint {selectedToneLabel}
      </p>
      <div style={{ marginBottom: s.ratingMargin }}>
        <StarRating rating={product.rating} count={product.reviewCount} size={s.star} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: s.priceMargin }}>
        <span style={{ fontSize: s.price, fontWeight: 800, color: TEXT, fontFamily: 'Georgia,serif' }}>
          {product.price.toLocaleString('fr-FR')}
        </span>
        <span style={{ fontSize: s.currency, fontWeight: 700, color: TEXT_MUTED }}>FCFA</span>
        {product.originalPrice && (
          <span style={{ fontSize: s.strike, textDecoration: 'line-through', color: TEXT_MUTED, marginLeft: s.strikeMarginLeft }}>
            {formatPrice(product.originalPrice)}
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, color: TEXT_BODY, lineHeight: 1.65, marginBottom: s.descMargin }}>
        {product.shortDescription}
      </p>
      {product.benefits.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: s.benefitsSpacing, textTransform: 'uppercase', color: TEXT, marginBottom: s.benefitsMargin }}>
            Bienfaits
          </p>
          {product.benefits.map((b, i) => (
            <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: s.benefitRowMargin }}>
              <div style={{ width: s.benefitCircle, height: s.benefitCircle, borderRadius: '50%', flexShrink: 0, background: '#FDF4E8', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BenefitIcon i={i} />
              </div>
              <span style={{ fontSize: 13, color: TEXT }}>{b}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
