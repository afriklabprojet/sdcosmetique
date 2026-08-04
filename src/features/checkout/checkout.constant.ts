import type React from 'react';

/**
 * Palette du tunnel de commande.
 *
 * Ces six couleurs ne voyageaient jamais separement : elles etaient importees
 * en bloc par chaque etape du tunnel. Elles forment donc un concept, pas six
 * constantes. La numerotation d'origine (TXT / TXT2 / TXT3) n'etait pas un
 * vocabulaire : elle est remplacee par le role de chaque teinte.
 */
export interface CheckoutPalette {
  /** Teinte d'accent : boutons actifs, montants, etapes franchies. */
  accent: string;
  /** Filet des cartes, separateurs de lignes. */
  border: string;
  /** Fond alterne des lignes de recapitulatif. */
  rowBackground: string;
  /** Texte principal. */
  text: string;
  /** Texte secondaire : libelles, unites, mentions. */
  textMuted: string;
  /** Texte tertiaire : etapes non atteintes, aides discretes. */
  textSubtle: string;
}

export const CHECKOUT_PALETTE: CheckoutPalette = {
  accent:        '#C8974A',
  border:        '#E2D9CF',
  rowBackground: '#FDFAF7',
  text:          '#2C1810',
  textMuted:     '#8C7B6E',
  textSubtle:    '#B5A898',
};

/** Style commun des champs de saisie du tunnel, derive de la palette. */
export const CHECKOUT_INPUT_STYLE: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: `1px solid ${CHECKOUT_PALETTE.border}`,
  borderRadius: '4px', fontSize: '13px', color: CHECKOUT_PALETTE.text, background: 'white',
  outline: 'none', boxSizing: 'border-box',
};
