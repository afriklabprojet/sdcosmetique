/**
 * Etat d'un onglet de la navigation admin.
 *
 * Cet ensemble est ferme : il pilote la teinte de l'icone et le fond de
 * l'onglet. Il etait modelise en `string`, ce qui laissait passer n'importe
 * quelle valeur sans que le compilateur ne dise rien.
 */
import type { Product, Review } from '@/shared/types/domain.type';
import type { OrderDraft } from '@/features/orders/order.store';
import type { QuizConcern, QuizRoutine } from '@/features/quiz/quiz.repository';

/*
 * Vocabulaire de la console d'administration. Ces types etaient declares dans
 * `admin.view.tsx` ; ils l'ont quittee en vague `split` (F-110) parce que les
 * dix-neuf onglets extraits les nomment tous.
 */

export type OrderStatus = OrderDraft['status'];
export type ReviewRow = Review & { productId?: string };
export type ProductModalState = Partial<Product> & { _isNew?: boolean };
export type Tab = 'dashboard' | 'commandes' | 'produits' | 'avis' | 'temoignages' | 'categories' | 'quiz' | 'clients' | 'contenu' | 'jeko' | 'newsletter' | 'livraison' | 'marketing' | 'branding' | 'promos' | 'faq' | 'hero' | 'legal' | 'paiement';
export type NewsletterSub = { id: string; email: string; source: string | null; unsubscribed: boolean; created_at: string };
export type EditableProduct = Product;

/** Une ligne du tableau clients : agregat des commandes d'une meme adresse. */
export type ClientRow = { email: string; name: string; orders: number; total: number; lastDate: string };

export type QuizItemModal =
  | { type: 'concern'; data: Partial<QuizConcern> & { _isNew?: boolean } }
  | { type: 'routine'; data: Partial<QuizRoutine> & { _isNew?: boolean } };

export type AdminTabStatus =
  | 'normal'
  | 'active'
  | 'alert'
  | 'warning'
  | 'premium'
  | 'important';
