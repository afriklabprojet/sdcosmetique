'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useComparison } from '@/features/comparison/comparison.store';
import { useCart } from '@/features/cart/cart.store';
import { formatPrice } from '@/features/catalog/product.query';
import { CATEGORIES, SKIN_TONES } from '@/shared/types/domain.type';

const ROW_STYLE: React.CSSProperties = { padding: '14px 16px', borderTop: '1px solid var(--grey-100)', verticalAlign: 'top' };
const LABEL_STYLE: React.CSSProperties = { ...ROW_STYLE, fontSize: 12, fontWeight: 700, color: 'var(--grey-700)', width: 160, whiteSpace: 'nowrap' };

export default function ComparaisonPage() {
  const { items, removeItem, limit } = useComparison();
  const { addItem } = useCart();

  return (
    <div className="min-h-screen" style={{ background: 'var(--off-white)' }}>
      <div className="py-12 text-center border-b" style={{ borderColor: 'var(--grey-100)', background: 'white' }}>
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="w-8 h-px" style={{ background: 'var(--gold)' }} />
          <span className="text-xs tracking-widest uppercase font-medium" style={{ color: 'var(--gold)', letterSpacing: '0.2em' }}>Comparateur</span>
          <div className="w-8 h-px" style={{ background: 'var(--gold)' }} />
        </div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Comparer les produits</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--grey-500)' }}>
          {items.length} produit{items.length !== 1 ? 's' : ''} sur {limit} maximum
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--gold-pale)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: 'var(--gold)' }}>
                <path d="M9 3v18M15 3v18M4 8l-1.5 4L4 16M20 8l1.5 4L20 16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Aucun produit à comparer
              </h2>
              <p className="text-sm" style={{ color: 'var(--grey-500)' }}>
                Ajoutez jusqu&apos;à {limit} produits depuis la boutique pour les comparer côte à côte.
              </p>
            </div>
            <Link href="/boutique">
              <button className="px-10 py-4 text-sm font-medium text-white tracking-widest uppercase" style={{ background: 'var(--gold)' }}>
                Découvrir la boutique
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto" style={{ background: 'white', borderRadius: 12, border: '1px solid var(--grey-100)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <tbody>
                <tr>
                  <td style={LABEL_STYLE}></td>
                  {items.map(item => (
                    <td key={item.id} style={{ ...ROW_STYLE, minWidth: 200 }}>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={`Retirer ${item.name}`}
                        style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-500)', fontSize: 16 }}
                      >✕</button>
                      <Link href={`/produit/${item.slug}`} style={{ display: 'block' }}>
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: 'var(--cream)', borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
                          {item.images[0] && <Image src={item.images[0]} alt={item.name} fill sizes="200px" style={{ objectFit: 'cover' }} />}
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1.35 }}>{item.name}</p>
                      </Link>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={LABEL_STYLE}>Prix</td>
                  {items.map(item => (
                    <td key={item.id} style={ROW_STYLE}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)' }}>{formatPrice(item.price)}</span>
                      {item.originalPrice && (
                        <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--grey-500)', textDecoration: 'line-through' }}>{formatPrice(item.originalPrice)}</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={LABEL_STYLE}>Catégorie</td>
                  {items.map(item => (
                    <td key={item.id} style={{ ...ROW_STYLE, fontSize: 13 }}>
                      {CATEGORIES.find(c => c.id === item.category)?.label ?? item.category}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={LABEL_STYLE}>Note</td>
                  {items.map(item => (
                    <td key={item.id} style={{ ...ROW_STYLE, fontSize: 13 }}>
                      ★ {item.rating.toFixed(1)} ({item.reviewCount} avis)
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={LABEL_STYLE}>Carnations recommandées</td>
                  {items.map(item => (
                    <td key={item.id} style={{ ...ROW_STYLE, fontSize: 13 }}>
                      {item.skinTones.length > 0
                        ? item.skinTones.map(t => SKIN_TONES.find(s => s.id === t)?.label ?? t).join(', ')
                        : <span style={{ color: 'var(--grey-500)' }}>Tous teints</span>}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={LABEL_STYLE}>Description</td>
                  {items.map(item => (
                    <td key={item.id} style={{ ...ROW_STYLE, fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.6 }}>
                      {item.shortDescription || '—'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={LABEL_STYLE}>Ingrédients clés</td>
                  {items.map(item => (
                    <td key={item.id} style={{ ...ROW_STYLE, fontSize: 12, color: 'var(--grey-700)', lineHeight: 1.6 }}>
                      {item.ingredients || '—'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={LABEL_STYLE}>Disponibilité</td>
                  {items.map(item => (
                    <td key={item.id} style={{ ...ROW_STYLE, fontSize: 13 }}>
                      {item.inStock
                        ? <span style={{ color: '#16A34A', fontWeight: 600 }}>En stock</span>
                        : <span style={{ color: '#DC2626', fontWeight: 600 }}>Rupture</span>}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={LABEL_STYLE}></td>
                  {items.map(item => (
                    <td key={item.id} style={{ ...ROW_STYLE, borderBottom: 'none' }}>
                      <button
                        onClick={() => addItem(item)}
                        disabled={!item.inStock}
                        className="w-full py-3 text-xs font-medium text-white tracking-widest uppercase"
                        style={{ background: item.inStock ? 'var(--gold)' : 'var(--grey-300)', cursor: item.inStock ? 'pointer' : 'not-allowed' }}
                      >
                        Ajouter au panier
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
