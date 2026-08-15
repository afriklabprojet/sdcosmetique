/*
 * SVG inline extraits de `cards/product.card.tsx` (F-115).
 *
 * `CartIcon` et `StarIcon` etaient deja declares dans la carte sans qu'aucun
 * rendu ne les appelle. Ils atterrissent ici plutot que d'etre supprimes en
 * passant : la suppression du code mort est le travail de la vague `drift`,
 * celle-ci ne fait que placer.
 */

// Icône panier factorisée
export function CartIcon({ added }: { readonly added: boolean }) {
  return added ? (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ) : (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );
}

// Icône étoile factorisée
export function StarIcon({ filled }: { readonly filled: boolean }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24"
      fill={filled ? 'var(--gold)' : 'none'}
      stroke="var(--gold)" strokeWidth="1.5"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

/** Cœur de la wishlist. Plein quand le produit y est deja. */
export function WishlistHeartIcon({ filled }: { readonly filled: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill={filled ? 'var(--gold)' : 'none'}
      stroke={filled ? 'var(--gold)' : '#7A6A5A'}
      strokeWidth="1.8"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/** Coche affichee le temps de l'animation d'ajout au panier. */
export function AddedCheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/** Plus minimaliste du bouton d'ajout au panier. */
export function AddToCartPlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
