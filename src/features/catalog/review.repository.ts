/**
 * Acces Supabase aux avis produits.
 * Utilise le browser client → appelable depuis des Client Components.
 *
 * Ces fonctions vivaient dans `order.repository.ts` (F-087). Leur corps ne
 * touche jamais une commande : il lit et mute la table `reviews`. La vague
 * `affordance` a tranche le proprietaire, cette vague deplace le fichier.
 */
import { createClient } from '@/shared/supabase/browser.client';
import type { Review, SkinTone } from '@/shared/types/domain.type';

// ─── Fetch tous les avis (admin) ──────────────────────────────────────────────
export async function fetchAllReviewsFromDB(): Promise<(Review & { productId?: string })[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(row => ({
      id: String(row.id),
      author: String(row.author),
      rating: Number(row.rating),
      comment: String(row.comment ?? ''),
      date: String(row.created_at),
      skinTone: (row.skin_tone as SkinTone) ?? undefined,
      verified: Boolean(row.verified),
      productId: row.product_id ? String(row.product_id) : undefined,
    }));
  } catch {
    return [];
  }
}

// ─── Supprimer un avis ────────────────────────────────────────────────────────
export async function deleteReviewFromDB(id: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from('reviews').delete().eq('id', id);
  } catch (e) {
    console.error('orders-db:', e);
  }
}

// ─── Approuver / retirer un avis (toggle verified) ───────────────────────────
export async function approveReviewInDB(id: string, verified: boolean): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from('reviews').update({ verified }).eq('id', id);
  } catch (e) {
    console.error('orders-db:', e);
  }
}
