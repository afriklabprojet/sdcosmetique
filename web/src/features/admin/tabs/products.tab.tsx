'use client';

/*
 * Onglet «produits» de la console d'administration. Il etait declare au
 * niveau module dans `admin.view.tsx` ; la vague `split` (F-110) lui donne son
 * fichier. Sa surface de props ne bouge pas : elle a ete fixee en vague
 * `boundary`.
 */

import React, { useMemo, useState } from 'react';
import Pagination from '@/features/admin/pagination';
import Image from 'next/image';
import { filterProductsData, paginateData } from '@/features/admin/admin-metrics';
import { getProductCountText } from '@/features/admin/admin.util';
import { formatPrice } from '@/features/catalog/product.query';
import { BADGE_LABELS, type Product } from '@/shared/types/domain.type';
import type { CategoryRow } from '@/features/catalog/category.repository';
import { BG, SURFACE2, BORDER, BORDER2, GOLD, TEXT, TEXT2, TEXT3, INFO_C, S_ERR_BG, S_ERR_T, S_OK_T, S_WARN_BG, S_WARN_T, S_INFO_BG, S_INFO_T, PER_PAGE } from '@/features/admin/admin.constant';

interface ProductsTabProps {
  editableProducts: Product[];
  categories?: CategoryRow[];
  openNewModal: () => void;
  openEditModal: (product: Product) => void;
  requestDelete: (id: string) => void;
  card: React.CSSProperties;
  inputStyle: React.CSSProperties;
  thStyle: React.CSSProperties;
  tdStyle: React.CSSProperties;
}

/*
 * Recherche, filtre de categorie et page courante ne quittaient l'onglet que
 * pour revenir aussitot sous forme de listes derivees : le parent detenait six
 * valeurs qu'il ne lisait jamais lui-meme. Elles sont de l'etat de
 * presentation — ce qui est filtre et affiche ici ne regarde pas le reste de
 * l'admin — et vivent donc dans l'onglet, avec le calcul qu'elles nourrissent.
 */
export const ProductsTab: React.FC<ProductsTabProps> = ({
  editableProducts, categories, openNewModal, openEditModal, requestDelete, card, inputStyle, thStyle, tdStyle
}) => {
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('');
  const [productPage, setProductPage] = useState(1);

  const filteredProducts = useMemo(
    () => filterProductsData(editableProducts, productSearch, productCatFilter),
    [editableProducts, productSearch, productCatFilter],
  );
  const productPageCount = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE));
  const pagedProducts = paginateData(filteredProducts, productPage, PER_PAGE).pagedData;

  return (
  <div className="space-y-4">
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <h1 className="text-lg font-bold" style={{ color: TEXT }}>
        {getProductCountText(filteredProducts.length, editableProducts.length)}
      </h1>
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={openNewModal} className="text-xs px-3 py-1.5 rounded transition-all hover:opacity-80" style={{ background: GOLD, color: BG, fontWeight: 600, whiteSpace: 'nowrap' }}>+ Nouveau</button>
        <input
          type="search" placeholder="Rechercher un produit…"
          value={productSearch}
          onChange={e => { setProductSearch(e.target.value); setProductPage(1); }}
          style={{ ...inputStyle, width: '180px' }}
        />
        <select
          aria-label="Filtrer par catégorie"
          value={productCatFilter}
          onChange={e => { setProductCatFilter(e.target.value); setProductPage(1); }}
          style={{ ...inputStyle, width: '130px', cursor: 'pointer' }}
        >
          <option value="">Toutes catégories</option>
          {categories && categories.length > 0 ? (
            categories.map(c => (
              <option key={c.id} value={c.slug}>{c.label || c.slug}</option>
            ))
          ) : (
            <>
              <option value="face">Visage</option>
              <option value="body">Corps</option>
              <option value="gammes">Gammes</option>
              <option value="kits">Kits</option>
              <option value="duo">Duo</option>
            </>
          )}
        </select>
      </div>
    </div>

    <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
      {filteredProducts.length === 0 ? (
        <p className="text-xs text-center py-10" style={{ color: TEXT3 }}>Aucun produit trouvé.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: SURFACE2 }}>
                <tr>{['', 'Nom', 'Catégorie', 'Prix', 'Stock', 'Badges', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {pagedProducts.map(p => (
                  <tr key={p.id} style={{ transition: 'background .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = SURFACE2)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ ...tdStyle, width: '52px', padding: '8px 8px 8px 16px' }}>
                      {p.images?.[0] ? (
                        <Image src={p.images[0]} alt={p.name} width={38} height={38} style={{  objectFit: 'cover', borderRadius: '6px', border: `1px solid ${BORDER}`  }} />
                      ) : (
                        <div style={{ width: '38px', height: '38px', background: BORDER, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: TEXT3, fontSize: '16px' }}>◇</span>
                        </div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{p.name}</td>
                    <td style={{ ...tdStyle, color: INFO_C }}>
                      {categories?.find(c => c.slug === p.category)?.label || p.category}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: GOLD }}>
                      {formatPrice(p.price)}
                      {p.originalPrice && (
                        <span style={{ color: TEXT3, fontWeight: 400, fontSize: '11px', marginLeft: '4px' }}><s>{formatPrice(p.originalPrice)}</s></span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' as const }}>
                      {(() => {
                        const qty = p.stockQty;
                        const threshold = p.lowStockThreshold ?? 5;
                        if (qty == null) {
                          return <span style={{ color: p.inStock ? S_OK_T : S_ERR_T, fontSize: '13px', fontWeight: 700 }}>{p.inStock ? '✓' : '✕'}</span>;
                        }
                        if (qty <= 0) return <span style={{ color: S_ERR_T, fontSize: '12px', fontWeight: 700 }}>Rupture</span>;
                        if (qty <= threshold) return <span style={{ color: S_WARN_T, fontSize: '12px', fontWeight: 700 }}>{qty} ⚠</span>;
                        return <span style={{ color: S_OK_T, fontSize: '12px', fontWeight: 600 }}>{qty}</span>;
                      })()}
                    </td>
                    <td style={tdStyle}>
                      <div className="flex flex-wrap gap-1">
                        {p.newArrival && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: S_INFO_BG, color: S_INFO_T }}>{BADGE_LABELS.NEW}</span>}
                        {p.bestseller && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: S_ERR_BG, color: S_ERR_T }}>{BADGE_LABELS.BESTSELLER}</span>}
                        {p.originalPrice && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: S_WARN_BG, color: S_WARN_T }}>Promo</span>}
                        {(p.badges ?? []).map((b) => (
                          <span key={b} className="text-xs px-2 py-0.5 rounded-full" style={{ background: SURFACE2, color: TEXT2, border: `1px solid ${BORDER2}` }}>{b}</span>
                        ))}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div className="flex gap-1">
                        <a href={`/produit/${p.slug}`} target="_blank" rel="noopener noreferrer" title="Aperçu live"
                          className="text-xs px-2 py-1 rounded border transition-all hover:opacity-80"
                          style={{ borderColor: BORDER2, color: GOLD, textDecoration: 'none' }}>↗</a>
                        <button onClick={() => openEditModal(p)} className="text-xs px-2 py-1 rounded border transition-all hover:opacity-80" style={{ borderColor: BORDER2, color: TEXT2 }}>Éditer</button>
                        <button onClick={() => requestDelete(p.id)} className="text-xs px-2 py-1 rounded transition-all hover:opacity-80" style={{ background: S_ERR_BG, color: S_ERR_T }}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {productPageCount > 1 && <Pagination page={productPage} total={productPageCount} goToPage={setProductPage} />}
        </>
      )}
    </div>
  </div>
  );
};
