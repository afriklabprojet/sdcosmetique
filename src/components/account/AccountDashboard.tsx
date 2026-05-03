'use client';

import React from 'react';
import type { User } from '@supabase/supabase-js';
import { OrderDraft } from '@/lib/orders';
import { formatPrice } from '@/lib/products';

interface AccountDashboardProps {
  user: User | null;
  orders: OrderDraft[];
  jekoPoints?: number;
  jekoTier?: string;
}

export default function AccountDashboard({ user, orders, jekoPoints = 0, jekoTier = 'Bronze' }: AccountDashboardProps) {
  const recentOrders = orders.slice(0, 3);
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'processing' || o.status === 'confirmed').length;
  
  return (
    <div style={{ flex: 1 }}>
      <div style={{
        marginBottom: '24px',
        padding: '24px',
        background: 'linear-gradient(135deg, #D4A24E15, #D4A24E05)',
        border: '1px solid #D4A24E30',
        borderRadius: '12px'
      }}>
        <h2 style={{ fontSize: '24px', color: '#D4A24E', marginBottom: '8px' }}>
          Bienvenue, {user?.user_metadata?.first_name || 'Client'} ! 👋
        </h2>
        <p style={{ color: '#888', fontSize: '14px' }}>
          Gérez vos commandes, points et préférences depuis votre espace personnel.
        </p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatsCard title="Commandes" value={orders.length} subtitle="au total" icon="📦" />
        <StatsCard title="Dépensé" value={`${totalSpent}€`} subtitle="depuis le début" icon="💰" />
        <StatsCard title="En cours" value={pendingOrders} subtitle="commande(s)" icon="⏳" color="#F59E0B" />
        <StatsCard title="Points Fidélité" value={jekoPoints} subtitle={`Niveau ${jekoTier}`} icon="🎁" color="#D4A24E" />
      </div>
      
      {recentOrders.length > 0 && (
        <div style={{
          background: '#0F0F0F',
          border: '1px solid #222',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '16px', color: '#FAFAFA', marginBottom: '16px' }}>Dernières commandes</h3>
          
          {recentOrders.map(order => (
            <div key={order.orderNumber} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #222',
            }}>
              <div>
                <div style={{ fontSize: '14px', color: '#FAFAFA', fontWeight: 600 }}>#{order.orderNumber}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{order.date}</div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', color: '#D4A24E', fontWeight: 600 }}>{formatPrice(order.total)}</div>
                <div style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: order.status === 'delivered' ? '#10B98115' : '#F59E0B15',
                  color: order.status === 'delivered' ? '#10B981' : '#F59E0B'
                }}>
                  {order.status === 'processing' ? 'En cours' :
                   order.status === 'confirmed' ? 'Confirmée' :
                   order.status === 'shipped' ? 'Expédiée' :
                   order.status === 'delivered' ? 'Livrée' : order.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatsCard({ title, value, subtitle, icon, color = '#10B981' }: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color?: string;
}) {
  return (
    <div style={{
      background: '#0F0F0F',
      border: '1px solid #222',
      borderRadius: '12px',
      padding: '16px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '24px', fontWeight: 700, color, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>{title}</div>
      <div style={{ fontSize: '10px', color: '#666' }}>{subtitle}</div>
    </div>
  );
}