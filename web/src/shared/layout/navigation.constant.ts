/*
 * Entrees de navigation principale. Extraites de `navbar.tsx` (F-113) : la
 * barre desktop et le tiroir mobile les parcourent toutes les deux, et depuis
 * la vague `split` ils ne vivent plus dans le meme fichier.
 */
export const NAV = [
  { label: 'ACCUEIL', href: '/' },
  { label: 'BOUTIQUE', href: '/boutique' },
  { label: 'VISAGE', href: '/categorie/face' },
  { label: 'CORPS', href: '/categorie/body' },
  { label: 'GAMMES', href: '/categorie/gammes' },
  { label: 'KITS', href: '/categorie/kits' },
  { label: 'KIT LÈVRE', href: '/categorie/kit-levre' },
  { label: 'MINCEUR', href: '/categorie/minceur' },
  { label: 'DUO', href: '/categorie/duo' },
  { label: 'QUIZ TEINT', href: '/quiz' },
];

/** Un lien de nav est actif sur sa page et sur toutes ses sous-pages. */
export function navItemActive(href: string, pathname: string): boolean {
  return pathname === href || (href !== '/' && pathname.startsWith(href));
}
