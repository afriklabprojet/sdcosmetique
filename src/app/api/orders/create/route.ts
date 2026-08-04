import { NextResponse, type NextRequest } from 'next/server';
import { createServiceClient } from '@/shared/supabase/service.client';
import { db } from '@/shared/supabase/request.client';
import type { OrderDraft } from '@/features/orders/order.store';
import { sendOrderConfirmationByNumber } from '@/features/orders/order-notification.service';
import { calculateShippingCost, applyPromoCode } from '@/features/site-config/site-config.util';
import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';
import { rateLimit, getIp, rateLimitHeaders } from '@/shared/http/rate-limit.guard';

export const runtime = 'nodejs';

/**
 * POST /api/orders/create
 * Crée une commande en base via le service client (bypass RLS).
 * Auth optionnelle — supporte les commandes invité.
 * Body : OrderDraft
 * Réponse : { ok: true, orderNumber }
 *
 * [ARCH-01/02] Remplace le double-save client (saveOrder + saveOrderToDB).
 * La DB est désormais la seule source de vérité à la création.
 *
 * [SEC] Sous-total, frais de port et remise sont recalculés côté serveur à
 * partir du prix produit en DB et de la config site — jamais du body client,
 * qu'un attaquant peut modifier avant envoi (ex: total: 1).
 */
export async function POST(req: NextRequest) {
  const rl = await rateLimit(`order-create:${getIp(req)}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json({ error: 'rate_limit_exceeded' }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let order: OrderDraft;
  try {
    order = (await req.json()) as OrderDraft;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { orderNumber, delivery, items, paymentMethod } = order;

  // Validation minimale des champs obligatoires
  if (!orderNumber || !delivery?.email || !delivery?.firstName || !items?.length) {
    return NextResponse.json({ error: 'invalid_order' }, { status: 400 });
  }

  // Récupérer le user_id si l'utilisateur est connecté (optionnel — commande invité tolérée)
  let userId: string | null = null;
  try {
    const userClient = await db();
    const { data: { user } } = await userClient.auth.getUser();
    if (user) userId = user.id;
  } catch {
    // Session absente ou expirée → commande invité
  }

  const supabase = createServiceClient();

  // Recalculer le sous-total à partir des prix produit en DB — ne jamais faire
  // confiance à item.product.price envoyé par le client.
  const ids = [...new Set(items.map(i => i.product.id))];
  const { data: rows, error: fetchErr } = await supabase
    .from('products')
    .select('id, price')
    .in('id', ids);

  if (fetchErr || !rows?.length) {
    console.error('[api/orders/create] Échec récupération produits:', fetchErr?.message);
    return NextResponse.json({ error: 'product_fetch_failed' }, { status: 400 });
  }

  const priceOf = new Map(rows.map(r => [r.id as string, Number(r.price)]));

  let computedSubtotal = 0;
  for (const item of items) {
    const serverPrice = priceOf.get(item.product.id);
    if (serverPrice === undefined) {
      return NextResponse.json({ error: 'product_not_found' }, { status: 400 });
    }
    const qty = Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 0;
    if (!qty) {
      return NextResponse.json({ error: 'invalid_quantity' }, { status: 400 });
    }
    computedSubtotal += serverPrice * qty;
  }

  // Recalculer les frais de port depuis la config du site (jamais order.shippingCost)
  const { data: shippingRow } = await supabase
    .from('site_config').select('value').eq('key', 'shipping').maybeSingle();
  const shippingConfig = (shippingRow?.value as typeof DEFAULT_SITE_CONFIG['shipping']) ?? DEFAULT_SITE_CONFIG.shipping;
  const computedShipping = order.shippingOptionId
    ? calculateShippingCost(computedSubtotal, order.shippingOptionId, shippingConfig)
    : 0;

  // Recalculer la remise (code promo) depuis la config du site (jamais order.total)
  let computedDiscount = 0;
  if (order.promoCode) {
    const { data: promoRow } = await supabase
      .from('site_config').select('value').eq('key', 'promo_codes').maybeSingle();
    const promoCodes = (promoRow?.value as typeof DEFAULT_SITE_CONFIG['promo_codes']) ?? [];
    const applied = applyPromoCode(computedSubtotal, order.promoCode, promoCodes);
    if (applied.isValid) computedDiscount = applied.discount;
  }

  const computedTotal = Math.max(0, computedSubtotal + computedShipping - computedDiscount);

  const { data: inserted, error } = await supabase
    .from('orders')
    .insert({
      order_number:        orderNumber,
      user_id:             userId,
      subtotal:            computedSubtotal,
      shipping_cost:       computedShipping,
      total:               computedTotal,
      payment_method:      paymentMethod,
      // status = toujours 'confirmed' (contrainte DB) ; payment_status distingue les paiements en attente
      status:              'confirmed',
      payment_status:      (order.status === 'pending_payment') ? 'pending' : 'paid',
      delivery_first_name: delivery.firstName,
      delivery_last_name:  delivery.lastName,
      delivery_email:      delivery.email,
      delivery_phone:      delivery.phone ?? '',
      delivery_address:    delivery.address ?? '',
      delivery_city:       delivery.city ?? '',
      delivery_country:    delivery.country ?? '',
    })
    .select('id')
    .single();

  if (error || !inserted) {
    console.error('[api/orders/create] Échec insert commande:', {
      orderNumber,
      message: error?.message,
      code: error?.code,
    });
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }

  // Insérer les articles avec le prix SERVEUR (jamais item.product.price du client)
  if (items.length) {
    const itemRows = items.map(item => ({
      order_id:     inserted.id,
      product_id:   item.product.id,
      product_slug: item.product.slug,
      name:         item.product.name,
      price:        priceOf.get(item.product.id),
      quantity:     item.quantity,
      image_url:    item.product.images?.[0] ?? null,
      shade:        null,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemRows);
    if (itemsError) {
      console.error('[api/orders/create] Échec insert order_items:', {
        orderId: inserted.id,
        message: itemsError.message,
      });
    }
  }

  // Email de confirmation : uniquement pour les commandes sans paiement à capturer
  // (paiement à la livraison). Pour le mobile money, c'est le webhook Jeko qui
  // déclenche l'email, une fois le paiement réellement confirmé.
  if (order.status !== 'pending_payment') {
    await sendOrderConfirmationByNumber(orderNumber);
  }

  return NextResponse.json({ ok: true, orderNumber });
}
