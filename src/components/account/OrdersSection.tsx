'use client';

import React, { useState } from 'react';
import { OrderDraft, formatOrderDate } from '@/lib/orders';
import { formatPrice } from '@/lib/products';

interface OrdersSectionProps {
  orders: OrderDraft[];
}

export default function OrdersSection({ orders }: OrdersSectionProps) {
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'delivered'>('all');

  const filteredOrders = orders.filter(order => {
    if (filter === 'in_progress') return ['confirmed', 'processing', 'shipped'].includes(order.status);
    if (filter === 'delivered') return order.status === 'delivered';
    return true;
  });

  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', color: '#FAFAFA', fontWeight: 600 }}>Mes commandes</h2>

        <div style={{ display: 'flex', gap: '8px' }}>
          {[{ id: 'all', label: 'Toutes' }, { id: 'in_progress', label: 'En cours' }, { id: 'delivered', label: 'Livrées' }].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as 'all' | 'in_progress' | 'delivered')}
              style={{
                padding: '8px 16px',
                border: '1px solid #333',
                background: filter === f.id ? '#D4A24E' : '#1A1A1A',
                color: filter === f.id ? '#000' : '#CCC',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          background: '#0F0F0F',
          border: '1px solid #222',
          borderRadius: '12px',
          color: '#666'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>Aucune commande</div>
          <div style={{ fontSize: '14px' }}>Vos commandes apparaîtront ici.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredOrders.map(order => (
            <OrderCard key={order.orderNumber} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: OrderDraft }) {
  const [expanded, setExpanded] = useState(false);

  const STATUS_COLOR: Record<string, string> = {
    confirmed: '#3B82F6',
    processing: '#F59E0B',
    shipped: '#8B5CF6',
    delivered: '#10B981',
  };
  const statusColor = STATUS_COLOR[order.status] ?? '#888';

  const STATUS_LABEL: Record<string, string> = {
    confirmed: 'Confirmée',
    processing: 'En cours',
    shipped: 'Expédiée',
    delivered: 'Livrée',
  };
  const statusLabel = STATUS_LABEL[order.status] ?? order.status;

  return (
    <div style={{
      background: '#0F0F0F',
      border: '1px solid #222',
      borderRadius: '12px',
      padding: '20px',
      cursor: 'pointer'
    }} onClick={() => setExpanded(!expanded)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '16px', color: '#FAFAFA', fontWeight: 600, marginBottom: '4px' }}>
            Commande #{order.orderNumber}
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            {formatOrderDate(order.date)} • {order.items.length} article{order.items.length > 1 ? 's' : ''}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '16px', color: '#D4A24E', fontWeight: 600, marginBottom: '4px' }}>
            {formatPrice(order.total)}
          </div>
          <div style={{
            fontSize: '11px',
            padding: '4px 8px',
            borderRadius: '12px',
            background: statusColor + '15',
            color: statusColor,
            fontWeight: 600
          }}>
            {statusLabel}
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #222' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Articles commandés :</div>
            {order.items.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                fontSize: '12px',
                color: '#CCC'
              }}>
                <span>{item.product.name} x{item.quantity}</span>
                <span style={{ color: '#D4A24E' }}>{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {order.delivery && (
            <div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Adresse de livraison :</div>
              <div style={{ fontSize: '12px', color: '#CCC' }}>
                {order.delivery.address}, {order.delivery.city}, {order.delivery.country}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
