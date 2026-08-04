/**
 * Vocabulaire commun du resultat d'operation.
 *
 * Le code exprimait ce concept sous six formes anonymes differentes
 * (`{ ok, error }`, `{ ok, id, error }`, `{ error }`, ...). Les trois
 * interfaces ci-dessous nomment la meme famille, du plus pauvre au plus riche,
 * par heritage.
 *
 * Les cles (`ok`, `error`, `id`) sont conservees telles quelles : plusieurs de
 * ces formes traversent une frontiere JSON (routes `/api/**`) et les renommer
 * changerait un contrat reseau. L'harmonisation du vocabulaire de succes
 * (`ok` / `success` / `isValid`) reste un finding `lexicon`.
 */

/** Ecriture qui ne rapporte qu'une erreur eventuelle : l'absence d'erreur vaut succes. */
export interface WriteResult {
  error?: string;
}

/** Operation qui rapporte explicitement son succes. */
export interface OperationResult extends WriteResult {
  ok: boolean;
}

/** Operation qui cree une ressource et en rapporte l'identifiant. */
export interface CreationResult extends OperationResult {
  id?: string;
}
