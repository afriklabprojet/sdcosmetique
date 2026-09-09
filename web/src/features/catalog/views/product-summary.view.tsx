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
import { CURRENCY_LABEL } from '@/shared/format/price';
import StarRating from '@/features/catalog/star-rating';
import { DARK, GOLD2, BORDER, TEXT, TEXT_MUTED, TEXT_BODY } from '@/features/catalog/product-detail.constant';
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
  /** Fait défiler vers l'onglet Avis clients — la note doit mener quelque part. */
  readonly onRatingClick?: () => void;
}

export default function ProductSummary({ product, categoryLabel, selectedToneLabel, compact = false, onRatingClick }: ProductSummaryProps) {
  const s = compact ? SIZES.compact : SIZES.wide;
  return (
    <div style={compact ? undefined : { paddingTop: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: s.badgeMargin }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: s.badgeSpacing, textTransform: 'uppercase', color: TEXT_MUTED }}>
          {categoryLabel}
        </span>
        {product.bestseller && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: s.badgePadding, background: DARK, color: '#F5CBA7', fontSize: 10, fontWeight: 800, letterSpacing: s.badgeSpacing, textTransform: 'uppercase', borderRadius: 20 }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.5 7.1.7-5.4 4.9 1.6 7-6.2-3.6L5.8 21l1.6-7L2 9.2l7.1-.7L12 2z" /></svg>
            {BADGE_LABELS.BESTSELLER}
          </span>
        )}
        {product.newArrival && (
          <span style={{ display: 'inline-block', padding: s.badgePadding, background: '#1E3A5F', color: '#93C5FD', fontSize: 10, fontWeight: 800, letterSpacing: s.badgeSpacing, textTransform: 'uppercase', borderRadius: 20 }}>
            {BADGE_LABELS.NEW}
          </span>
        )}
        {(product.badges ?? []).map((b) => (
          <span key={b} style={{ display: 'inline-block', padding: s.badgePadding, background: '#F4EBE1', color: '#8F5922', fontSize: 10, fontWeight: 800, letterSpacing: s.badgeSpacing, textTransform: 'uppercase', borderRadius: 20, border: '1px solid #E5D5C5' }}>
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
        {onRatingClick ? (
          <button
            onClick={onRatingClick}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <StarRating rating={product.rating} size={s.star + 2} showCount={false} />
            <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: BORDER }}>
              {product.reviewCount} avis
            </span>
          </button>
        ) : (
          <StarRating rating={product.rating} count={product.reviewCount} size={s.star} />
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: s.priceMargin }}>
        <span style={{ fontSize: s.price, fontWeight: 800, color: TEXT, fontFamily: 'Georgia,serif' }}>
          {product.price.toLocaleString('fr-FR')}
        </span>
        <span style={{ fontSize: s.currency, fontWeight: 700, color: TEXT_MUTED }}>{CURRENCY_LABEL}</span>
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
