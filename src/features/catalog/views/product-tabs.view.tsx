'use client';

/*
 * Bandeau d'onglets de la fiche produit (description, usage, ingredients,
 * avis) et les deux panneaux qui l'accompagnent. Extrait de `product.view.tsx`
 * (F-112) : c'est le seul bloc de la fiche qui parle du contenu editorial et
 * des avis, tout le reste parle de l'achat.
 *
 * `activeTab` ne descend pas ici : la vague `boundary` a fixe la propriete de
 * l'etat, cette vague ne fait que deplacer le rendu.
 */

import Image from 'next/image';
import type { Product, Review } from '@/shared/types/domain.type';
import StarRating from '@/features/catalog/star-rating';
import { GOLD, BORDER, TEXT, TEXT_MUTED, TEXT_BODY, BG } from '@/features/catalog/product-detail.constant';

export type ProductTabId = 'description' | 'usage' | 'ingredients' | 'reviews';

interface ProductTabsProps {
  readonly product: Product;
  readonly reviews: Review[];
  readonly keyIngredients: string[];
  readonly activeTab: ProductTabId;
  readonly selectTab: (tab: ProductTabId) => void;
}

export default function ProductTabs({ product, reviews, keyIngredients, activeTab, selectTab }: ProductTabsProps) {
  return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ marginTop: 28 }}>

          {/* Left : tabs + tab content */}
          <div className="lg:col-span-6" style={{ border: `1px solid ${BORDER}`, borderRadius: 6, background: 'white', padding: '0 22px 22px' }}>
            <div style={{ display: 'flex', gap: 24, borderBottom: `2px solid ${BORDER}` }}>
              {([
                { id: 'description', label: 'Description' },
                { id: 'usage',       label: "Conseils d'utilisation" },
                { id: 'ingredients', label: 'Ingrédients' },
                { id: 'reviews',     label: `Avis clients (${reviews.length || product.reviewCount})` },
              ] as const).map(tab => (
                <button key={tab.id} onClick={() => selectTab(tab.id)}
                  style={{ padding: '16px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: activeTab === tab.id ? GOLD : TEXT_MUTED, borderBottom: `2px solid ${activeTab === tab.id ? GOLD : 'transparent'}`, marginBottom: -2, whiteSpace: 'nowrap', transition: 'color .2s' }}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ paddingTop: 20 }}>
              {activeTab === 'description' && (
                <p style={{ fontSize: 13, color: TEXT_BODY, lineHeight: 1.75 }}>{product.description}</p>
              )}

              {activeTab === 'usage' && (
                <p style={{ fontSize: 13, color: TEXT_BODY, lineHeight: 1.75 }}>{product.usage}</p>
              )}

              {activeTab === 'ingredients' && (
                <p style={{ fontSize: 12, color: TEXT_BODY, lineHeight: 1.8, fontFamily: 'monospace' }}>
                  {product.ingredients ?? 'Liste des ingrédients non disponible.'}
                </p>
              )}

              {activeTab === 'reviews' && (
                reviews.length === 0
                  ? <p style={{ fontSize: 14, color: TEXT_MUTED }}>Aucun avis pour ce produit.</p>
                  : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {reviews.map(review => (
                        <div key={review.id} style={{ paddingBottom: 20, borderBottom: `1px solid ${BORDER}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: TEXT, fontFamily: 'Georgia,serif' }}>{review.author}</span>
                                {review.verified && (
                                  <span style={{ padding: '2px 8px', background: '#FDF4E8', color: GOLD, fontSize: 10, fontWeight: 600, borderRadius: 2 }}>
                                    Achat vérifié
                                  </span>
                                )}
                              </div>
                              <StarRating rating={review.rating} showCount={false} size={12} />
                            </div>
                            <span style={{ fontSize: 12, color: TEXT_MUTED }}>
                              {new Date(review.date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <p style={{ fontSize: 13, color: TEXT_BODY, lineHeight: 1.7 }}>{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )
              )}
            </div>
          </div>

          {/* Middle : Ingrédients clés */}
          <div className="lg:col-span-3" style={{ border: `1px solid ${BORDER}`, borderRadius: 6, background: BG, padding: '20px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD, marginBottom: 16 }}>
              Ingrédients clés
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {keyIngredients.map((ing) => (
                <span key={ing} style={{ padding: '6px 14px', background: 'white', border: `1px solid ${BORDER}`, borderRadius: 20, fontSize: 12, fontWeight: 500, color: GOLD }}>
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {/* Right : Résultats avec image */}
          <div className="lg:col-span-3" style={{ border: `1px solid ${BORDER}`, borderRadius: 6, background: BG, overflow: 'hidden', display: 'flex', alignItems: 'stretch' }}>
            <div style={{ position: 'relative', width: '45%', flexShrink: 0, background: '#E8DFD0' }}>
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="180px"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : null}
            </div>
            <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: TEXT, fontFamily: 'Georgia,serif', lineHeight: 1.2, marginBottom: 8 }}>
                {(product.resultsTitle ?? "Résultats visibles dès 7 jours d'utilisation")
                  .split(/\n|<br\s*\/?>/i)
                  .flatMap((line, i, arr) => i < arr.length - 1 ? [line, <br key={line} />] : [line])}
              </p>
              <p style={{ fontSize: 12, color: TEXT_BODY, lineHeight: 1.5 }}>
                {product.resultsSubtitle ?? 'Peau plus lumineuse, lisse et unifiée.'}
              </p>
            </div>
          </div>
        </div>
  );
}
