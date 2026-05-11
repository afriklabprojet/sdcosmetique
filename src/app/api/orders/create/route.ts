import { NextResponse, type NextRequest } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { db } from '@/lib/db';
import type { OrderDraft } from '@/lib/orders';

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
 */
export async function POST(req: NextRequest) {
  let order: OrderDraft;
  try {
    order = (await req.json()) as OrderDraft;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { orderNumber, delivery, items, subtotal, total, paymentMethod } = order;

  // Validation minimale des champs obligatoires
  if (!orderNumber || !delivery?.email || !delivery?.firstName || !items?.length || !total) {
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

  const { data: inserted, error } = await supabase
    .from('orders')
    .insert({
      order_number:        orderNumber,
      user_id:             userId,
      subtotal,
      shipping_cost:       order.shippingCost ?? 0,
      total,
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

  // Insérer les articles (erreur non fatale — la commande principale est créée)
  if (items.length) {
    const rows = items.map(item => ({
      order_id:     inserted.id,
      product_id:   item.product.id,
      product_slug: item.product.slug,
      name:         item.product.name,
      price:        item.product.price,
      quantity:     item.quantity,
      image_url:    item.product.images?.[0] ?? null,
      shade:        null,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(rows);
    if (itemsError) {
      console.error('[api/orders/create] Échec insert order_items:', {
        orderId: inserted.id,
        message: itemsError.message,
      });
    }
  }

  return NextResponse.json({ ok: true, orderNumber });
}
