/*
 * Entrees de navigation principale. Extraites de `navbar.tsx` (F-113) : la
 * barre desktop et le tiroir mobile les parcourent toutes les deux, et depuis
 * la vague `split` ils ne vivent plus dans le meme fichier.
 *
 * "Boutique" porte ses 7 catégories en `children` (F-118) : le menu plat à
 * 10 entrées surchargeait aussi bien la barre desktop (9 mots sur une seule
 * ligne) que le tiroir mobile. Chaque catégorie garde sa page/URL dédiée —
 * seule la présentation change, pas le routage.
 */
export interface NavChild {
  label: string;
  href: string;
}

export interface NavEntry {
  label: string;
  href: string;
  children?: NavChild[];
}

export const NAV: NavEntry[] = [
  { label: 'ACCUEIL', href: '/' },
  {
    label: 'BOUTIQUE', href: '/boutique',
    children: [
      { label: 'VISAGE', href: '/categorie/face' },
      { label: 'CORPS', href: '/categorie/body' },
      { label: 'GAMMES', href: '/categorie/gammes' },
      { label: 'KITS', href: '/categorie/kits' },
      { label: 'KIT LÈVRE', href: '/categorie/kit-levre' },
      { label: 'MINCEUR', href: '/categorie/minceur' },
      { label: 'DUO', href: '/categorie/duo' },
    ],
  },
  { label: 'QUIZ TEINT', href: '/quiz' },
  { label: 'À PROPOS', href: '/notre-histoire' },
  { label: 'CONTACT', href: '/contact' },
];

/** Un lien de nav est actif sur sa page et sur toutes ses sous-pages. */
export function navItemActive(href: string, pathname: string): boolean {
  return pathname === href || (href !== '/' && pathname.startsWith(href));
}

/** Un parent avec enfants (ex. Boutique) est actif sur sa page ou celle de n'importe lequel de ses enfants. */
export function navEntryActive(entry: NavEntry, pathname: string): boolean {
  if (navItemActive(entry.href, pathname)) return true;
  return entry.children?.some((child) => navItemActive(child.href, pathname)) ?? false;
}
