'use client';

/*
 * Moitie basse d'une page de categorie : barre des categories, filtre par
 * carnation, tri, compteur, grille, etat vide. Extrait des cinq pages
 * `app/categorie/{body,duo,face,gammes,kits}/page.tsx` (F-081), ou ce meme
 * balisage etait recopie a l'identique — memes vingt-quatre classes CSS,
 * meme filtre, meme tri — a trois valeurs pres : la categorie, le nom au
 * singulier de ce qu'on compte, et la phrase de l'etat vide.
 *
 * `styles` arrive en prop parce que chaque page garde son propre module CSS :
 * les cinq heros sont des mises en page differentes et ces modules ne sont pas
 * fusionnables sans decision de design, qui n'appartient pas a cette vague.
 * Les classes de cette partie basse, elles, portent partout les memes noms.
 *
 * Le filtre et le tri sont de l'etat de presentation : ils ne quittent pas ce
 * composant, comme ils ne quittaient pas la page avant le decoupage.
 */

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchProducts } from '@/features/catalog/product.query';
import { CATEGORIES, type Category, type Product, SkinTone } from '@/shared/types/domain.type';
import ProductCard from '@/features/catalog/cards/product.card';
import SkinToneSelector from '@/features/catalog/selects/skin-tone.select';

const SORT_OPTIONS = [
  { id: 'popular', label: 'Populaires' },
  { id: 'newest', label: 'Nouveautés' },
  { id: 'price_asc', label: 'Prix croissant' },
  { id: 'price_desc', label: 'Prix décroissant' },
  { id: 'rating', label: 'Mieux notés' },
];

const SKIN_TONE_LABELS: Record<SkinTone, string> = {
  noir: 'Noir',
  marron: 'Marron',
  'marron-clair': 'Marron clair',
  clair: 'Clair',
  metisse: 'Métisse',
};

interface CategoryBrowserProps {
  /** Module CSS de la page hote. */
  readonly styles: Record<string, string>;
  readonly category: Category;
  /** Nom au singulier de l'unite comptee : « produit », « duo », « kit »… */
  readonly unitLabel: string;
  /** Fin de la phrase de l'etat vide : « nos soins corps », « nos coffrets »… */
  readonly emptyScope: string;
}

export default function CategoryBrowser({ styles, category, unitLabel, emptyScope }: CategoryBrowserProps) {
  const [skinToneFilter, setSkinToneFilter] = useState<SkinTone | null>(null);
  const [sortBy, setSortBy] = useState('popular');
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => { fetchProducts(category).then(setAllProducts).catch(() => {}); }, [category]);

  const products = useMemo(() => {
    let list = allProducts;
    if (skinToneFilter) {
      list = list.filter(p => p.skinTones.includes(skinToneFilter));
    }
    switch (sortBy) {
      case 'price_asc':  return [...list].sort((a, b) => a.price - b.price);
      case 'price_desc': return [...list].sort((a, b) => b.price - a.price);
      case 'newest':     return [...list].sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
      case 'rating':     return [...list].sort((a, b) => b.rating - a.rating);
      default:           return [...list].sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
    }
  }, [skinToneFilter, sortBy, allProducts]);

  return (
    <>
      {/* NAV CATÉGORIES */}
      <nav className={styles.catNav} aria-label="Toutes les catégories">
        <div className={styles.catNavInner}>
          {CATEGORIES.map(cat => {
            const active = cat.id === category;
            return (
              <Link
                key={cat.id}
                href={`/categorie/${cat.id}`}
                className={`${styles.catLink} ${active ? styles.catLinkActive : ''}`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* CONTENU */}
      <main className={styles.main}>
        {/* TOOLBAR */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <span className={styles.toolbarLabel}>Filtrer par carnation</span>
            <SkinToneSelector selected={skinToneFilter} selectTone={setSkinToneFilter} />
          </div>

          <div className={styles.toolbarRight}>
            <span className={styles.count}>
              <span className={styles.countNum}>{products.length}</span>
              {unitLabel}{products.length !== 1 ? 's' : ''}
            </span>
            <div className={styles.sortWrap}>
              <select
                className={styles.sort}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                aria-label="Trier les produits"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>Trier · {opt.label}</option>
                ))}
              </select>
              <span className={styles.sortIcon}>▾</span>
            </div>
          </div>
        </div>

        {/* CHIPS FILTRES ACTIFS */}
        {skinToneFilter && (
          <div className={styles.activeFilters}>
            <span className={styles.activeFiltersLabel}>Filtre actif</span>
            <button
              type="button"
              className={styles.chip}
              onClick={() => setSkinToneFilter(null)}
            >
              {SKIN_TONE_LABELS[skinToneFilter]}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* GRILLE PRODUITS */}
        {products.length > 0 ? (
          <div className={styles.grid}>
            {products.map(product => (
              <div key={product.id} className={styles.gridItem}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyGlyph}>◇</div>
            <h3 className={styles.emptyTitle}>Aucun produit pour ce filtre</h3>
            <p className={styles.emptyText}>
              Essayez une autre carnation ou explorez l&apos;ensemble de {emptyScope}.
            </p>
            <button
              type="button"
              className={styles.emptyBtn}
              onClick={() => setSkinToneFilter(null)}
            >
              Voir tous les produits
            </button>
          </div>
        )}
      </main>
    </>
  );
}
