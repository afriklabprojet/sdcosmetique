/**
 * WhatsApp Business API — Meta Cloud API v20.0
 * Envoie des notifications de commande via WhatsApp.
 *
 * ⚠️  Les messages business-initiated DOIVENT utiliser des templates approuvés.
 *     Créer les templates sur : https://business.facebook.com/wa/manage/message-templates/
 *
 * Templates utilisés :
 *   - order_confirmation  : confirmation de commande (à créer + faire approuver)
 *   - order_shipped       : expédition avec lien de suivi (à créer + faire approuver)
 *   - hello_world         : template de test Meta (approuvé par défaut)
 */

import type { OrderDraft } from '@/lib/orders';

const WA_API_VERSION = 'v20.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID ?? '';
const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN ?? '';

const WA_URL = `https://graph.facebook.com/${WA_API_VERSION}/${PHONE_NUMBER_ID}/messages`;

// ─── Types Meta Cloud API ─────────────────────────────────────────────────────

interface WaTemplate {
  name: string;
  language: { code: string };
  components?: WaComponent[];
}

interface WaComponent {
  type: 'header' | 'body' | 'button';
  sub_type?: 'url';
  index?: number;
  parameters: WaParameter[];
}

interface WaParameter {
  type: 'text' | 'currency' | 'date_time';
  text?: string;
  currency?: { fallback_value: string; code: string; amount_1000: number };
}

interface WaPayload {
  messaging_product: 'whatsapp';
  to: string;
  type: 'template';
  template: WaTemplate;
}

interface WaResponse {
  messages?: Array<{ id: string }>;
  error?: { message: string; code: number };
}

// ─── Helper interne ───────────────────────────────────────────────────────────

/**
 * Normalise un numéro de téléphone ivoirien vers le format E.164.
 * Ex : "0703456789" → "2250703456789"
 *      "+225 07 03 45 67 89" → "2250703456789"
 */
export function normalizePhone(raw: string): string {
  // Supprimer tout sauf les chiffres
  let digits = raw.replaceAll(/\D/g, '');

  // Déjà en E.164 avec indicatif +225 Côte d'Ivoire
  if (digits.startsWith('225') && digits.length >= 12) return digits;

  // Numéro local ivoirien sur 10 chiffres commençant par 0
  if (digits.startsWith('0') && digits.length === 10) {
    return '225' + digits;
  }

  // Numéro local sans le 0 (9 chiffres)
  if (digits.length === 9) {
    return '225' + digits;
  }

  // On retourne tel quel (peut être un numéro international déjà normalisé)
  return digits;
}

/**
 * Envoie un message WhatsApp via template.
 * Retourne `true` si l'envoi réussit, `false` sinon (no-throw).
 */
async function sendTemplate(payload: WaPayload): Promise<boolean> {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.warn('[whatsapp] Variables WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID absentes — skip.');
    return false;
  }

  try {
    const res = await fetch(WA_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = (await res.json()) as WaResponse;

    if (!res.ok || json.error) {
      console.error('[whatsapp] API error:', json.error?.message ?? res.status);
      return false;
    }

    console.log('[whatsapp] Envoi OK — message id:', json.messages?.[0]?.id);
    return true;
  } catch (err) {
    console.error('[whatsapp] Fetch error:', err);
    return false;
  }
}

// ─── Messages publics ─────────────────────────────────────────────────────────

/**
 * Envoie une confirmation de commande WhatsApp au client.
 *
 * Template attendu (à créer sur Meta) : `order_confirmation`
 * Langue : French (fr) — code `fr`
 * Body variables :
 *   {{1}} prénom
 *   {{2}} numéro de commande
 *   {{3}} montant total (ex: "15 000 FCFA")
 */
export async function sendWaOrderConfirmation(order: OrderDraft): Promise<void> {
  const phone = normalizePhone(order.delivery.phone);
  if (!phone) return;

  const total = new Intl.NumberFormat('fr-FR').format(order.total);

  await sendTemplate({
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: 'order_confirmation',
      language: { code: 'fr' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: order.delivery.firstName },
            { type: 'text', text: order.orderNumber },
            { type: 'text', text: `${total} FCFA` },
          ],
        },
      ],
    },
  });
}

/**
 * Envoie une notification d'expédition WhatsApp au client.
 *
 * Template attendu : `order_shipped`
 * Body variables :
 *   {{1}} prénom
 *   {{2}} numéro de commande
 *   {{3}} lien de suivi (optionnel, sinon texte générique)
 */
export async function sendWaOrderShipped(
  order: OrderDraft,
  trackingUrl?: string
): Promise<void> {
  const phone = normalizePhone(order.delivery.phone);
  if (!phone) return;

  const tracking = trackingUrl ?? 'Contactez-nous pour le suivi.';

  await sendTemplate({
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: 'order_shipped',
      language: { code: 'fr' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: order.delivery.firstName },
            { type: 'text', text: order.orderNumber },
            { type: 'text', text: tracking },
          ],
        },
      ],
    },
  });
}
