'use client';

import { useEffect } from 'react';
import { STATUS_CONFIG, STATUS_MAP } from '@/features/account/account.constant';
import { formatPrice } from '@/features/catalog/product.query';
import { formatOrderDate } from '@/features/orders/order.store';
import type { MappedOrder } from '@/shared/api/mappers/order';

const PAYMENT_LABELS: Record<string, string> = {
  orange_money: 'Orange Money',
  wave: 'Wave',
  mtn_momo: 'MTN MoMo',
  moov_money: 'Moov Money',
  djamo: 'Djamo',
  jeko: 'Jeko',
};

type Props = {
  order: MappedOrder;
  onClose: () => void;
};

export default function OrderDetailDialog({ order, onClose }: Readonly<Props>) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    globalThis.addEventListener('keydown', closeOnEscape);
    return () => globalThis.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const statusLabel = STATUS_MAP[order.status] ?? order.status;
  const status = STATUS_CONFIG[statusLabel] ?? STATUS_CONFIG.Confirmée;
  const paymentLabel = order.paymentStatus === 'paid' ? 'Payé' : 'En attente de paiement';

  return (
    <div
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(26, 14, 5, 0.56)', display: 'flex', justifyContent: 'flex-end' }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-order-detail-title"
        style={{ width: 'min(100%, 480px)', height: '100%', overflowY: 'auto', background: '#FFFEFC', borderLeft: '1px solid #EDE8E0', padding: '24px' }}
      >
        <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingBottom: 20, borderBottom: '1px solid #EDE8E0' }}>
          <div>
            <p style={{ margin: 0, color: '#9A8A7A', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Commande</p>
            <h2 id="customer-order-detail-title" style={{ margin: '4px 0 0', color: '#1A1A1A', fontSize: 20 }}>{order.orderNumber}</h2>
            <p style={{ margin: '4px 0 0', color: '#7A6A5A', fontSize: 12 }}>{formatOrderDate(order.date)}</p>
          </div>
          <button autoFocus type="button" onClick={onClose} aria-label="Fermer le détail de la commande" style={{ width: 40, height: 40, border: '1px solid #EDE8E0', background: '#FAF8F5', color: '#6B3D14', fontSize: 22, cursor: 'pointer' }}>×</button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '20px 0' }}>
          <div style={{ borderBottom: '2px solid #EDE8E0', paddingBottom: 12 }}>
            <p style={{ margin: 0, color: '#9A8A7A', fontSize: 11 }}>Statut</p>
            <p style={{ margin: '5px 0 0', color: status.color, fontSize: 14, fontWeight: 700 }}>{status.label}</p>
          </div>
          <div style={{ borderBottom: '2px solid #EDE8E0', paddingBottom: 12 }}>
            <p style={{ margin: 0, color: '#9A8A7A', fontSize: 11 }}>Paiement</p>
            <p style={{ margin: '5px 0 0', color: order.paymentStatus === 'paid' ? '#059669' : '#EA580C', fontSize: 14, fontWeight: 700 }}>{paymentLabel}</p>
            <p style={{ margin: '3px 0 0', color: '#7A6A5A', fontSize: 11 }}>{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
          </div>
        </div>

        <section aria-labelledby="customer-order-items-title" style={{ paddingBottom: 22 }}>
          <h3 id="customer-order-items-title" style={{ margin: '0 0 12px', color: '#1A1A1A', fontSize: 14 }}>Articles</h3>
          <div style={{ borderTop: '1px solid #EDE8E0' }}>
            {order.items.map((item, index) => (
              <div key={`${item.product.id}-${index}`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, padding: '13px 0', borderBottom: '1px solid #EDE8E0' }}>
                <div>
                  <p style={{ margin: 0, color: '#1A1A1A', fontSize: 13, fontWeight: 650 }}>{item.product.name}</p>
                  <p style={{ margin: '3px 0 0', color: '#9A8A7A', fontSize: 11 }}>Quantité : {item.quantity}</p>
                </div>
                <p style={{ margin: 0, color: '#1A1A1A', fontSize: 13, fontWeight: 700 }}>{formatPrice(item.product.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, paddingTop: 14, color: '#1A1A1A', fontSize: 16, fontWeight: 800 }}>
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </section>

        <section aria-labelledby="customer-order-delivery-title" style={{ borderTop: '1px solid #EDE8E0', paddingTop: 20 }}>
          <h3 id="customer-order-delivery-title" style={{ margin: '0 0 10px', color: '#1A1A1A', fontSize: 14 }}>Livraison</h3>
          <p style={{ margin: 0, color: '#1A1A1A', fontSize: 13, fontWeight: 650 }}>{order.delivery.firstName} {order.delivery.lastName}</p>
          <p style={{ margin: '4px 0 0', color: '#7A6A5A', fontSize: 12 }}>{order.delivery.address}</p>
          <p style={{ margin: '2px 0 0', color: '#7A6A5A', fontSize: 12 }}>{order.delivery.city}, {order.delivery.country}</p>
          {order.delivery.phone && <p style={{ margin: '8px 0 0', color: '#7A6A5A', fontSize: 12 }}>{order.delivery.phone}</p>}
        </section>
      </section>
    </div>
  );
}