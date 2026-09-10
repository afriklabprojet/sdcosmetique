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
export type ContactMessageRow = { id: string; name: string; email: string; subject: string | null; message: string; open: boolean; created_at: string };
export type AdminPaymentRow = { id: string; orderReference: string | null; amount: number | null; currency: string | null; status: 'pending' | 'paid' | 'failed'; paidAt: string | null; failedAt: string | null; created_at: string };
export type AdminPaymentNotificationRow = { id: string; gateway: string; reference: string; paymentAttemptId: string | null; failureReason: string | null; handledAt: string | null; done: boolean; payload?: Record<string, unknown>; created_at: string };
export type AdminPageRow = { id: string; slug: string; title: string; content: string; publishedAt: string | null; created_at: string };
export type EditableProduct = Product;

/** Une ligne du tableau clients : agregat des commandes d'une meme adresse. */
export type ClientRow = { id: string; email: string; name: string; orders: number; total: number; lastDate: string };

/** Fiche client complete (§4) — `/admin/clients/{id}`. */
export type ClientDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  address: { line: string; city: string | null; country: string | null } | null;
  ordersCount: number;
  totalValue: number;
  averageBasket: number;
  firstOrderAt: string | null;
  lastOrderAt: string | null;
  lastOrder: { reference: string; total: number; status: string; placedAt: string } | null;
  createdAt: string;
};

/** Une ligne de "Messages envoyes" (§11) / historique de la fiche client (§4-5). */
export type CustomerMessageRow = {
  id: string;
  clientId: string;
  clientName: string | null;
  subject: string;
  body: string;
  recipientEmail: string;
  status: 'pending' | 'sent' | 'failed';
  error: string | null;
  sentBy: string | null;
  sentAt: string | null;
  createdAt: string;
};

/** Une campagne Marketing Bulk (§6-§8) — distincte des messages individuels. */
export type MarketingCampaignRow = {
  id: string;
  name: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  content: string;
  audienceType: 'all' | 'ordered' | 'never_ordered' | 'active' | 'inactive' | 'manual';
  audienceClientIds: string[] | null;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  sendable: boolean;
  recipientsCount: number;
  sentCount: number;
  failedCount: number;
  createdBy: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export type MarketingCampaignRecipientRow = {
  id: string;
  clientId: string;
  clientName: string | null;
  email: string;
  status: 'pending' | 'sent' | 'failed' | 'skipped_unsubscribed';
  error: string | null;
  sentAt: string | null;
};

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
