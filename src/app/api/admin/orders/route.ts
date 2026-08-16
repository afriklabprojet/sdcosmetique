import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/auth/admin.guard';
import { createServiceClient } from '@/shared/supabase/service.client';
import type { OrderDraft } from '@/features/orders/order.store';

type OrderStatus = OrderDraft['status'];

type OrderRow = {
  order_number: string;
  created_at: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  payment_method: string | null;
  status: string;
  payment_status: string | null;
  delivery_first_name: string | null;
  delivery_last_name: string | null;
  delivery_email: string | null;
  delivery_phone: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_country: string | null;
  order_items?: Array<{
    product_id: string;
    product_slug: string | null;
    name: string;
    price: number;
    quantity: number;
    image_url: string | null;
  }>;
};

const VALID_STATUS: ReadonlySet<string> = new Set([
  'pending_payment',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]);

function rowToOrder(row: OrderRow): OrderDraft {
  // [PAY-07] Plus de statut « synthetise ». La base porte desormais les deux
  // axes separement (`status` logistique, `payment_status` financier) : les
  // deduire l'un de l'autre ici masquait le vrai defaut cote ecriture.
  const effectiveStatus: OrderStatus = (row.status as OrderStatus) ?? 'pending_payment';
  return {
    orderNumber: row.order_number,
    paymentStatus: (row.payment_status as OrderDraft['paymentStatus']) ?? 'pending',
    date: row.created_at,
    subtotal: Number(row.subtotal),
    shippingCost: Number(row.shipping_cost),
    total: Number(row.total),
    paymentMethod: row.payment_method ?? '',
    status: effectiveStatus,
    delivery: {
      firstName: row.delivery_first_name ?? '',
      lastName: row.delivery_last_name ?? '',
      email: row.delivery_email ?? '',
      phone: row.delivery_phone ?? '',
      address: row.delivery_address ?? '',
      city: row.delivery_city ?? '',
      country: row.delivery_country ?? '',
    },
    items: (row.order_items ?? []).map((i) => ({
      product: {
        id: i.product_id,
        slug: i.product_slug ?? '',
        name: i.name,
        price: Number(i.price),
        images: i.image_url ? [i.image_url] : [],
        category: 'face',
        skinTones: [],
        badges: [],
        rating: 0,
        reviewCount: 0,
        shortDescription: '',
        description: '',
        benefits: [],
        usage: '',
        inStock: true,
        newArrival: false,
        bestseller: false,
      },
      quantity: i.quantity,
    })),
  };
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[admin/orders GET] db error:', error.message);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }

  const orders = ((data ?? []) as OrderRow[]).map(rowToOrder);
  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 401 });
  }

  const body = await req.json();
  const orderNumber = String(body?.orderNumber ?? '').trim();
  const status = String(body?.status ?? '').trim();
  const paymentStatus = String(body?.paymentStatus ?? '').trim();

  if (!orderNumber) {
    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
  }
  if (status && !VALID_STATUS.has(status)) {
    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
  }
  // [PAY-08] Encaissement manuel : le paiement a la livraison n'a pas de PSP
  // pour confirmer l'argent recu, c'est donc l'admin qui l'atteste. Restreint a
  // `paid` / `failed` — un encaissement ne se « remet » pas en attente, et les
  // paiements Jeko restent pilotes par le PSP.
  if (paymentStatus && !['paid', 'failed'].includes(paymentStatus)) {
    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
  }
  if (!status && !paymentStatus) {
    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('orders')
    .update({
      ...(status ? { status } : {}),
      ...(paymentStatus
        ? {
            payment_status:  paymentStatus,
            payment_paid_at: paymentStatus === 'paid' ? new Date().toISOString() : null,
            // Un encaissement fait sortir la commande de l'attente de paiement.
            ...(paymentStatus === 'paid' && !status ? { status: 'confirmed' } : {}),
          }
        : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('order_number', orderNumber);

  if (error) {
    console.error('[admin/orders PATCH] db error:', error.message);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}