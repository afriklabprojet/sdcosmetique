import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createServiceClient } from '@/utils/supabase/service';
import type { OrderDraft } from '@/lib/orders';

type OrderStatus = OrderDraft['status'];

type OrderRow = {
  order_number: string;
  created_at: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  payment_method: string | null;
  status: string;
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
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]);

function rowToOrder(row: OrderRow): OrderDraft {
  return {
    orderNumber: row.order_number,
    date: row.created_at,
    subtotal: Number(row.subtotal),
    shippingCost: Number(row.shipping_cost),
    total: Number(row.total),
    paymentMethod: row.payment_method ?? '',
    status: (row.status as OrderStatus) ?? 'confirmed',
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
        isNew: false,
        isBestseller: false,
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
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  if (!orderNumber || !VALID_STATUS.has(status)) {
    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('order_number', orderNumber);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}