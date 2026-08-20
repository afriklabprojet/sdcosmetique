import { NextResponse, type NextRequest } from 'next/server';
import { inArray, eq } from 'drizzle-orm';
import { db } from '@/shared/db';
import { products, orders, orderItems, siteConfig } from '@/shared/db/schema';
import { getCurrentUser } from '@/shared/auth/auth.service';
import type { OrderDraft } from '@/features/orders/order.store';
import { sendOrderConfirmationByNumber } from '@/features/orders/order-notification.service';
import { calculateShippingCost } from '@/features/site-config/site-config.util';
import { applyPromoCode } from '@/features/promo/promo.util';
import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';
import { rateLimit, getIp, rateLimitHeaders } from '@/shared/http/rate-limit.guard';

export const runtime = 'nodejs';

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

  if (!orderNumber || !delivery?.email || !delivery?.firstName || !items?.length) {
    return NextResponse.json({ error: 'invalid_order' }, { status: 400 });
  }

  const currentUser = await getCurrentUser();
  const userId = currentUser ? currentUser.id : null;

  const ids = [...new Set(items.map(i => i.product.id))];
  const productRows = await db
    .select({ id: products.id, price: products.price })
    .from(products)
    .where(inArray(products.id, ids));

  if (!productRows.length) {
    return NextResponse.json({ error: 'product_fetch_failed' }, { status: 400 });
  }

  const priceOf = new Map(productRows.map(r => [r.id, Number(r.price)]));

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

  // Recalculer frais de port
  const shippingRows = await db.select().from(siteConfig).where(eq(siteConfig.key, 'shipping')).limit(1);
  const shippingConfig = (shippingRows[0]?.value as typeof DEFAULT_SITE_CONFIG['shipping']) ?? DEFAULT_SITE_CONFIG.shipping;
  const computedShipping = order.shippingOptionId
    ? calculateShippingCost(computedSubtotal, order.shippingOptionId, shippingConfig)
    : 0;

  // Recalculer remise code promo
  let computedDiscount = 0;
  if (order.promoCode) {
    const promoRows = await db.select().from(siteConfig).where(eq(siteConfig.key, 'promo_codes')).limit(1);
    const promoCodes = (promoRows[0]?.value as typeof DEFAULT_SITE_CONFIG['promo_codes']) ?? [];
    const applied = applyPromoCode(computedSubtotal, order.promoCode, promoCodes);
    if (applied.valid) computedDiscount = applied.discount;
  }

  const computedTotal = Math.max(0, computedSubtotal + computedShipping - computedDiscount);

  const prevOrders = await db
    .select({ id: orders.id, paymentStatus: orders.paymentStatus, deliveryEmail: orders.deliveryEmail })
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);

  const previous = prevOrders[0];

  if (previous && (previous.paymentStatus !== 'pending' || previous.deliveryEmail !== delivery.email)) {
    return NextResponse.json({ error: 'order_already_settled' }, { status: 409 });
  }

  const awaitingPayment = order.status === 'pending_payment';

  const orderData = {
    orderNumber,
    userId,
    subtotal: computedSubtotal,
    shippingCost: computedShipping,
    total: computedTotal,
    paymentMethod: paymentMethod ?? null,
    status: awaitingPayment ? 'pending_payment' : 'confirmed',
    paymentStatus: 'pending',
    deliveryFirstName: delivery.firstName,
    deliveryLastName: delivery.lastName,
    deliveryEmail: delivery.email,
    deliveryPhone: delivery.phone ?? '',
    deliveryAddress: delivery.address ?? '',
    deliveryCity: delivery.city ?? '',
    deliveryCountry: delivery.country ?? '',
  };

  try {
    let orderId: string;

    if (previous) {
      orderId = previous.id;
      await db.update(orders).set(orderData).where(eq(orders.id, orderId));
      await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
    } else {
      orderId = crypto.randomUUID();
      await db.insert(orders).values({ id: orderId, ...orderData });
    }

    if (items.length) {
      const itemRows = items.map(item => ({
        orderId,
        productId: item.product.id,
        productSlug: item.product.slug ?? null,
        name: item.product.name,
        price: priceOf.get(item.product.id) ?? 0,
        quantity: item.quantity,
        imageUrl: item.product.images?.[0] ?? null,
        shade: null,
      }));

      await db.insert(orderItems).values(itemRows);
    }

    if (!awaitingPayment) {
      await sendOrderConfirmationByNumber(orderNumber);
    }

    return NextResponse.json({ ok: true, orderNumber });
  } catch (err) {
    console.error('[api/orders/create] DB error:', err);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }
}
