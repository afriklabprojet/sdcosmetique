/**
 * Etat d'un onglet de la navigation admin.
 *
 * Cet ensemble est ferme : il pilote la teinte de l'icone et le fond de
 * l'onglet. Il etait modelise en `string`, ce qui laissait passer n'importe
 * quelle valeur sans que le compilateur ne dise rien.
 */
export type AdminTabStatus =
  | 'normal'
  | 'active'
  | 'alert'
  | 'warning'
  | 'premium'
  | 'important';
